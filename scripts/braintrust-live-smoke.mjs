import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createServer } from 'node:http';
import { flush } from 'braintrust';
import { createFlueClient } from '@flue/sdk';

if (!process.env.BRAINTRUST_API_KEY) {
	throw new Error('BRAINTRUST_API_KEY is required for the live Braintrust smoke test.');
}

const projectName = process.env.BRAINTRUST_PROJECT_NAME;
if (projectName !== 'socratink-synthetic') {
	throw new Error('BRAINTRUST_PROJECT_NAME must be exactly socratink-synthetic.');
}

const runId = `socratink-synthetic-${randomUUID()}`;
const prompt = `Synthetic observability preflight ${runId}. Return the fixed synthetic response.`;
const expectedReply = `Synthetic Braintrust response for ${runId}.`;
const sockets = new Set();

function listen(server) {
	return new Promise((resolve, reject) => {
		server.once('error', reject);
		server.listen(0, '127.0.0.1', () => {
			server.off('error', reject);
			resolve(server.address().port);
		});
	});
}

function close(server) {
	return new Promise((resolve, reject) => {
		server.close((error) => (error ? reject(error) : resolve()));
		for (const socket of sockets) socket.destroy();
	});
}

const fakeProvider = createServer(async (request, response) => {
	assert.equal(request.method, 'POST');
	assert.equal(request.url, '/v1/chat/completions');
	assert.equal(request.headers.authorization, 'Bearer synthetic-braintrust-key');

	let body = '';
	for await (const chunk of request) body += chunk;
	const payload = JSON.parse(body);
	assert.equal(payload.model, 'auto');
	assert.equal(payload.stream, true);
	assert.ok(JSON.stringify(payload.messages).includes(runId));

	response.writeHead(200, {
		'content-type': 'text/event-stream',
		'cache-control': 'no-cache',
		connection: 'keep-alive',
	});
	const chunks = [
		{ id: runId, object: 'chat.completion.chunk', created: 0, model: 'auto', choices: [{ index: 0, delta: { role: 'assistant' }, finish_reason: null }] },
		{ id: runId, object: 'chat.completion.chunk', created: 0, model: 'auto', choices: [{ index: 0, delta: { content: expectedReply }, finish_reason: null }] },
		{ id: runId, object: 'chat.completion.chunk', created: 0, model: 'auto', choices: [{ index: 0, delta: {}, finish_reason: 'stop' }] },
		{ id: runId, object: 'chat.completion.chunk', created: 0, model: 'auto', choices: [], usage: { prompt_tokens: 8, completion_tokens: 8, total_tokens: 16 } },
	];
	for (const chunk of chunks) response.write(`data: ${JSON.stringify(chunk)}\n\n`);
	response.end('data: [DONE]\n\n');
});
fakeProvider.on('connection', (socket) => {
	sockets.add(socket);
	socket.once('close', () => sockets.delete(socket));
});

let lifecycle;
try {
	const providerPort = await listen(fakeProvider);
	const portProbe = createServer();
	const appPort = await listen(portProbe);
	await close(portProbe);
	process.env.JON_LOCAL_BASE_URL = `http://127.0.0.1:${providerPort}/v1`;
	process.env.JON_LOCAL_API_KEY = 'synthetic-braintrust-key';

	const { startFlueNodeServer } = await import('../dist/app.mjs');
	lifecycle = await startFlueNodeServer({ hostname: '127.0.0.1', port: appPort });

	const client = createFlueClient({ url: `http://127.0.0.1:${appPort}/api/agents/chat/${runId}` });
	const admission = await client.send({ message: { kind: 'user', body: prompt } });
	const reply = await client.read(admission);
	assert.equal(reply.text, expectedReply);

	await flush();
	console.log(JSON.stringify({ projectName, runId, reply: expectedReply, flushed: true }));
} finally {
	if (lifecycle) await lifecycle.stop();
	if (fakeProvider.listening) await close(fakeProvider);
}
