import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import test from 'node:test';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { openEngine } from '../src/server/durable/engine.ts';
import { mountBrowserBridge } from '../src/server/durable/browser-bridge.ts';
import { sseTiming } from '../src/server/durable/browser-sse.ts';
import { createStreamClient } from '../src/ui/client/conversation-stream.ts';
import { ChatRequestCoordinator } from '../src/ui/client/conversation.ts';

// A reply that streams for about two seconds, so events connections end mid-reply.
const words = Array.from({ length: 16 }, (_, index) => `word${index} `);
const wordMs = 120;

/** Real engine on SQLite, real bridge served by the production Node adapter,
 * real stream client over HTTP. Only the model endpoint is synthetic. */
async function fixture(run) {
	const directory = await mkdtemp(join(tmpdir(), 'socratink-durable-reconnect-'));
	const model = createServer(async (request, response) => {
		for await (const _chunk of request) {}
		response.writeHead(200, { 'content-type': 'text/event-stream' });
		const chunk = (delta, finish_reason = null) => response.write(`data: ${JSON.stringify({ id: 'synthetic', model: 'synthetic',
			choices: [{ index: 0, delta, finish_reason }] })}\n\n`);
		chunk({ role: 'assistant', content: '' });
		for (const word of words) { await delay(wordMs); chunk({ content: word }); }
		chunk({}, 'stop');
		response.end('data: [DONE]\n\n');
	});
	model.listen(0, '127.0.0.1');
	await once(model, 'listening');
	const config = { provider: 'jon-local', modelId: 'synthetic', apiKey: 'synthetic-key',
		baseUrl: `http://127.0.0.1:${model.address().port}/v1`, contextWindow: 128000, maxTokens: 4096 };
	const engine = await openEngine({ target: { kind: 'sqlite', filename: join(directory, 'pi.sqlite') }, resolveModel: async () => config });
	const app = new Hono();
	app.use('*', async (c, next) => { c.set('socratinkSession', { userId: 'learner' }); await next(); });
	mountBrowserBridge(app, engine, async () => ({ provider: 'jon-local', modelId: 'synthetic' }));
	const server = serve({ fetch: app.fetch, port: 0, hostname: '127.0.0.1', serverOptions: { requestTimeout: 0 } });
	await once(server, 'listening');
	const connections = [];
	server.on('request', (request) => { if (request.url.endsWith('/events')) connections.push(request.socket); });
	const timing = { ...sseTiming };
	sseTiming.pollMs = 20;
	const url = `http://127.0.0.1:${server.address().port}/${encodeURIComponent('learner:reconnect')}`;
	try { await run({ client: createStreamClient({ url }), url, connections }); }
	finally {
		Object.assign(sseTiming, timing);
		server.closeAllConnections(); model.closeAllConnections();
		await new Promise((resolve) => server.close(resolve));
		await new Promise((resolve) => model.close(resolve));
		await engine.close();
		await rm(directory, { recursive: true, force: true });
	}
}

/** Text deltas as forwarded by read(), split by the events connection that carried them. */
function painter(connections) {
	const byConnection = [];
	return {
		byConnection,
		text: () => byConnection.join(''),
		onEvent(event) {
			if (event.type !== 'message-delta' || event.kind !== 'text') return;
			byConnection[connections.length - 1] = (byConnection[connections.length - 1] ?? '') + event.delta;
		},
	};
}

function historyText(history, submissionId) {
	return history.messages.find((m) => m.role === 'assistant' && m.submissionId === submissionId)
		.parts.filter((part) => part.type === 'text').map((part) => part.text).join('\n\n');
}

test('a reply survives the server ending the events stream at its time cap mid-turn', async () => fixture(async ({ client, connections }) => {
	sseTiming.maxMs = 300;
	const admission = await client.send({ message: { kind: 'user', body: 'Synthetic question.' } });
	const painted = painter(connections);
	const reply = await client.read(admission, { onEvent: painted.onEvent, signal: AbortSignal.timeout(15_000) });
	const history = await client.history();
	assert.equal(history.settlements.find((s) => s.submissionId === admission.submissionId)?.outcome, 'completed');
	assert.equal(reply.text, words.join(''));
	assert.equal(reply.text, historyText(history, admission.submissionId));
	assert.ok(connections.length > 2, `the time cap forces reconnects; got ${connections.length} connections`);
	assert.ok(painted.byConnection[0] && painted.byConnection[0].length < reply.text.length,
		'the first connection ended mid-reply, after some text and before all of it');
	assert.equal(painted.text(), reply.text, 'streamed deltas fold to the reply with no repeated or missing segment');
}));

test('a reply survives the network dropping the events connection mid-reply, as the UI coordinator sees it', async () => fixture(async ({ client, connections }) => {
	const painted = painter(connections);
	const requests = new ChatRequestCoordinator(client, {
		onEvent(event) {
			painted.onEvent(event);
			// Drop the socket under the client, not through its abort signal.
			if (event.type === 'message-delta' && connections.length === 1) connections[0].destroy();
		},
	});
	const state = await requests.start('Synthetic question.');
	assert.equal(state.kind, 'completed', JSON.stringify(state));
	const history = await client.history();
	assert.equal(state.reply.text, words.join(''));
	assert.equal(state.reply.text, historyText(history, state.reply.submissionId), 'the UI paints the stored reply');
	assert.equal(connections.length, 2, 'one drop, one reconnect');
	assert.ok(painted.byConnection[0] && painted.byConnection[0].length < state.reply.text.length, 'the drop came mid-reply');
	assert.equal(painted.text(), state.reply.text, 'streamed deltas fold to the reply with no repeated or missing segment');
}));

test('an uninterrupted turn needs one events connection, and a connection after settlement returns at once', async () => fixture(async ({ client, url, connections }) => {
	const admission = await client.send({ message: { kind: 'user', body: 'Synthetic question.' } });
	const painted = painter(connections);
	const reply = await client.read(admission, { onEvent: painted.onEvent, signal: AbortSignal.timeout(15_000) });
	assert.equal(connections.length, 1, 'the closing reset carries the settlement, so no second connection is needed');
	assert.equal(painted.text(), reply.text);

	const started = Date.now();
	const text = await (await fetch(`${url}/events`, { signal: AbortSignal.timeout(2_000) })).text();
	const events = text.split('\n\n').filter((block) => block.startsWith('data: ')).map((block) => JSON.parse(block.slice(6)));
	assert.deepEqual(events.map((e) => e.type), ['conversation-reset'], 'a settled conversation sends one reset and ends');
	assert.equal(historyText(events[0].snapshot, admission.submissionId), reply.text);
	assert.ok(Date.now() - started < 1_000, `a settled stream must not wait; took ${Date.now() - started} ms`);

	const again = await client.read(admission.submissionId, { signal: AbortSignal.timeout(2_000) });
	assert.equal(again.text, reply.text);
	assert.equal(connections.length, 3);
}));
