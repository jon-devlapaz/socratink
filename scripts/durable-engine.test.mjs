import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import test from 'node:test';
import { BACKGROUND_CONTEXT as context } from '@earendil-works/chord/context';
import { openEngine } from '../src/server/durable/engine.ts';
import { createDurableStorage } from '../src/server/durable/storage.ts';
import { readSnapshot } from '../src/server/durable/projection.ts';

async function fixture(run, failures = 0) {
	const directory = await mkdtemp(join(tmpdir(), 'socratink-durable-engine-'));
	const target = { kind: 'sqlite', filename: join(directory, 'pi.sqlite') };
	const responses = [];
	const server = createServer(async (request, response) => {
		for await (const _chunk of request) {};
		responses.push(response);
		if (Array.isArray(failures) ? failures.includes(responses.length) : responses.length <= failures) {
			response.writeHead(500, { 'content-type': 'application/json' });
			response.end(JSON.stringify({ error: { message: 'Synthetic private provider error.' } }));
			return;
		}
		response.writeHead(200, { 'content-type': 'text/event-stream', 'x-routed-via': 'synthetic-route' });
		chunk(response, { role: 'assistant', reasoning_content: 'Checking the accepted request.' });
	});
	await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
	const config = { provider: 'jon-local', modelId: 'synthetic', apiKey: 'synthetic-key',
		baseUrl: `http://127.0.0.1:${server.address().port}/v1`, reasoning: true, contextWindow: 128000, maxTokens: 4096 };
	try { await run({ target, responses, config, options: { target, resolveModel: async () => config } }); }
	finally { server.closeAllConnections(); await new Promise((resolve) => server.close(resolve)); await rm(directory, { recursive: true, force: true }); }
}
function chunk(response, delta, finish_reason = null) {
	response.write(`data: ${JSON.stringify({ id: 'synthetic', model: 'synthetic', choices: [{ index: 0, delta, finish_reason }] })}\n\n`);
}
function finish(response, text = 'Completed reply.') { chunk(response, { content: text }); chunk(response, {}, 'stop'); response.end('data: [DONE]\n\n'); }
async function until(read, predicate) {
	for (let attempt = 0; attempt < 250; attempt++) { const value = await read(); if (predicate(value)) return value; await delay(20); }
	throw new Error('Expected durable state was not reached.');
}

test('another instance reads live reasoning, rejects a competing turn, and ownership closes after settlement', async () => fixture(async ({ target, responses, options }) => {
	const reports = [];
	const turns = [];
	const background = [];
	const first = await openEngine({ ...options, keepAlive: (work) => background.push(work), report: (category) => reports.push(category),
		logTurn: (turn) => turns.push(turn) });
	const second = await openEngine(options);
	const manager = createDurableStorage(target);
	try {
		assert.equal(await manager.exists('learner:one'), false);
		assert.deepEqual(await first.snapshot('learner:one'), { revision: 0, messages: [], submissions: [] });
		assert.equal(await manager.exists('learner:one'), false);
		const id = await first.submit('learner:one', 'Help.');
		const live = await until(() => second.snapshot('learner:one'), (value) => !!value.messages[1]?.reasoning);
		assert.equal(live.submissions[0].id, id);
		assert.equal(live.submissions[0].outcome, undefined);
		await assert.rejects(second.submit('learner:one', 'Duplicate.'), /busy/i);
		assert.equal(responses.length, 1);
		finish(responses[0]);
		await Promise.all(background);
		const completed = await second.snapshot('learner:one');
		assert.equal(completed.submissions[0].outcome, 'completed');
		assert.equal(completed.messages[1].reasoning, 'Checking the accepted request.');
		assert.equal(completed.messages[1].metadata.socratink.routedModel, 'synthetic-route');
		const owner = await manager.acquire('learner:one');
		assert.ok(owner, 'a settled conversation must not retain execution ownership');
		await owner.close(context);
		assert.deepEqual(reports, []);
		assert.equal(turns.length, 1, 'one log record per executed turn');
		const { latencyMs, ...turn } = turns[0];
		assert.ok(Number.isInteger(latencyMs) && latencyMs >= 0);
		assert.deepEqual(turn, { conversationId: 'learner:one', submissionId: id, status: 'completed', model: 'synthetic-route' });
	} finally { await first.close(); await second.close(); await manager.close(); }
}));

test('cross-instance cancellation persists and does not abort the next admission', async () => fixture(async ({ responses, options }) => {
	const first = await openEngine(options);
	const second = await openEngine(options);
	try {
		await first.submit('learner:abort', 'Stop this.');
		await until(() => second.snapshot('learner:abort'), (value) => !!value.messages[1]?.reasoning);
		await second.abort('learner:abort');
		await until(() => second.snapshot('learner:abort'), (value) => value.submissions[0]?.outcome === 'aborted');
		await first.close();
		await second.submit('learner:abort', 'Next turn.');
		await until(async () => responses.length, (value) => value === 2);
		finish(responses[1]);
		const completed = await until(() => second.snapshot('learner:abort'), (value) => value.submissions[1]?.outcome === 'completed');
		assert.equal(completed.submissions.length, 2);
	} finally { await first.close(); await second.close(); }
}));

test('an execution slice leaves accepted work pending, releases ownership, and a later request recovers it', async () => fixture(async ({ target, responses, options }) => {
	const background = [];
	const reports = [];
	const turns = [];
	const first = await openEngine({ ...options, executionMs: 180, keepAlive: (work) => background.push(work), report: (category) => reports.push(category),
		logTurn: (turn) => turns.push(turn.status) });
	const second = await openEngine({ ...options, report: (category) => reports.push(category), logTurn: (turn) => turns.push(turn.status) });
	const manager = createDurableStorage(target);
	try {
		const id = await first.submit('learner:slice', 'Continue after interruption.');
		await Promise.all(background);
		const reader = await manager.read('learner:slice');
		const pending = await readSnapshot(reader);
		await reader.close(context);
		assert.equal(pending.submissions[0].outcome, undefined);
		assert.deepEqual(reports, []);
		await second.snapshot('learner:slice');
		await until(async () => responses.length, (value) => value === 2);
		finish(responses[1], 'Recovered reply.');
		const recovered = await until(() => second.snapshot('learner:slice'), (value) => value.submissions[0]?.outcome === 'completed');
		assert.equal(recovered.submissions[0].id, id);
		assert.equal(recovered.messages.filter((message) => message.role === 'user').length, 1);
		assert.deepEqual(reports, ['submission_recovery']);
		await until(async () => turns.length, (count) => count === 2);
		assert.deepEqual(turns, ['interrupted', 'completed'], 'the stopped slice and its recovery each log once');
	} finally { await first.close(); await second.close(); await manager.close(); }
}));

for (const failures of [1, 3]) test(`native retry monitoring: ${failures === 1 ? 'transient failure recovers' : 'exhausted retries settle once'}`, async () => fixture(async ({ responses, options }) => {
	const reports = [];
	const turns = [];
	const background = [];
	const engine = await openEngine({ ...options, keepAlive: (work) => background.push(work), report: (category) => reports.push(category),
		logTurn: (turn) => turns.push(turn) });
	try {
		await engine.submit('learner:failure', 'Synthetic private learner text.');
		if (failures === 1) { await until(async () => responses.length, (count) => count === 2); finish(responses[1]); }
		await Promise.all(background);
		const completed = await engine.snapshot('learner:failure');
		assert.equal(completed.submissions[0].outcome, failures === 1 ? 'completed' : 'failed');
		assert.equal(responses.length, failures === 1 ? 2 : 3);
		assert.deepEqual(reports, failures === 1 ? ['submission_recovery']
			: ['submission_recovery', 'submission_recovery', 'submission_failed']);
		if (failures === 3) assert.equal(completed.submissions[0].error, 'The model request could not complete.');
		assert.deepEqual(turns.map((turn) => turn.status), [failures === 1 ? 'completed' : 'failed']);
		assert.equal(turns[0].model, failures === 1 ? 'synthetic-route' : 'synthetic', 'a turn without a routed reply logs the configured model');
		assert.equal(JSON.stringify(turns).includes('Synthetic private'), false, 'turn records carry no learner or provider text');
	} finally { await engine.close(); }
}, failures));

for (const retryAfterCrash of [false, true]) test(`SIGKILL recovery logs once${retryAfterCrash ? ' and still reports a later provider retry' : ''}`, async () => fixture(async ({ target, responses, config, options }) => {
	const reports = [];
	const engineUrl = new URL('../src/server/durable/engine.ts', import.meta.url).href;
	const child = spawn(process.execPath, ['--input-type=module', '--eval', `
		import { openEngine } from ${JSON.stringify(engineUrl)};
		const { target, config } = JSON.parse(process.env.DURABLE_ENGINE_FIXTURE);
		const engine = await openEngine({ target, resolveModel: async () => config });
		await engine.submit('learner:crash', 'Synthetic accepted request.');
		await new Promise(() => {});
	`], { env: { ...process.env, DURABLE_ENGINE_FIXTURE: JSON.stringify({ target, config }) }, stdio: 'ignore' });
	const engine = await openEngine({ ...options, report: (category) => reports.push(category) });
	try {
		await until(async () => responses.length, (count) => count === 1);
		const exited = once(child, 'exit'); child.kill('SIGKILL'); await exited;
		await engine.snapshot('learner:crash');
		const expectedCalls = retryAfterCrash ? 3 : 2;
		await until(async () => responses.length, (count) => count === expectedCalls);
		finish(responses.at(-1));
		const completed = await until(() => engine.snapshot('learner:crash'), (value) => value.submissions[0]?.outcome === 'completed');
		assert.equal(completed.submissions.length, 1);
		assert.equal(completed.messages.filter((message) => message.role === 'user').length, 1);
		assert.deepEqual(reports, retryAfterCrash ? ['submission_recovery', 'submission_recovery'] : ['submission_recovery']);
	} finally { child.kill('SIGKILL'); await engine.close(); }
}, retryAfterCrash ? [2] : 0));

test('a turn log line names route, hashed session, model, latency and status, never the conversation id', async () => {
	const { logTurn } = await import('../src/server/logging.ts');
	const lines = [];
	const log = console.log;
	console.log = (line) => lines.push(line);
	try {
		logTurn({ conversationId: 'guest-user:nonce', submissionId: '4', latencyMs: 812, model: 'synthetic/model', status: 'completed' });
		logTurn({ conversationId: 'guest-user:nonce', submissionId: '5', latencyMs: 90, status: 'failed' });
	} finally { console.log = log; }
	const [completed, failed] = lines.map((line) => JSON.parse(line));
	assert.deepEqual(Object.keys(completed), ['event', 'route', 'session', 'submission', 'model', 'latencyMs', 'status']);
	assert.equal(completed.event, 'socratink_turn');
	assert.equal(completed.route, '/api/agents/chat');
	assert.match(completed.session, /^[0-9a-f]{12}$/);
	assert.equal(failed.session, completed.session, 'turns of one conversation share a session hash');
	assert.equal(lines.join('').includes('guest-user'), false);
	assert.deepEqual({ model: failed.model, status: failed.status, error: failed.error }, { model: null, status: 'failed', error: 'model_request_failed' });
});
