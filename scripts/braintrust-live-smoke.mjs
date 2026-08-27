import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createServer } from 'node:http';
import { flush } from 'braintrust';
import { createFlueClient } from '@flue/sdk';
import { resolveBraintrustApiKey } from '../src/braintrust.ts';
import { appConfig } from '../src/config/app.config.ts';

const apiKey = resolveBraintrustApiKey(process.env);
if (!apiKey) {
	throw new Error('BRAINTRUST_API_KEY is required for the live Braintrust smoke test.');
}
process.env.BRAINTRUST_API_KEY = apiKey;

const projectName = appConfig.braintrustProjectName;
if (
	process.env.BRAINTRUST_PROJECT_NAME !== undefined &&
	process.env.BRAINTRUST_PROJECT_NAME !== projectName
) {
	throw new Error(`BRAINTRUST_PROJECT_NAME must be exactly ${projectName}.`);
}

const runId = randomUUID();
const prompt = `Synthetic observability preflight ${runId}. Present the questionnaire.`;
const expectedReply = `Synthetic Braintrust response for ${runId}.`;
const questionnaire = {
	kind: 'quiz',
	submitLabel: 'Continue',
	items: [
		{
			name: 'path',
			prompt: 'How should we begin?',
			choices: [{ value: 'trace', label: 'Example trace' }],
			input: { label: 'Why?' },
		},
	],
};
const selectedLabel = 'Example trace';
const explanation = 'I want a concrete example.';
const answers = `Questionnaire answers:\n- How should we begin?: ${selectedLabel}, ${explanation}`;
const sockets = new Set();
let providerTurns = 0;

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

function writeCompletion(response, id, deltas) {
	response.writeHead(200, {
		'content-type': 'text/event-stream',
		'cache-control': 'no-cache',
		connection: 'keep-alive',
	});
	const chunks = [
		...deltas.map((delta) => ({
			id,
			object: 'chat.completion.chunk',
			created: 0,
			model: 'auto',
			choices: [delta],
		})),
		{
			id,
			object: 'chat.completion.chunk',
			created: 0,
			model: 'auto',
			choices: [],
			usage: { prompt_tokens: 8, completion_tokens: 8, total_tokens: 16 },
		},
	];
	for (const chunk of chunks) response.write(`data: ${JSON.stringify(chunk)}\n\n`);
	response.end('data: [DONE]\n\n');
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
	assert.ok(JSON.stringify(payload.tools).includes('present_question'));

	providerTurns += 1;
	if (providerTurns === 1) {
		writeCompletion(response, runId, [
			{ index: 0, delta: { role: 'assistant' }, finish_reason: null },
			{
				index: 0,
				delta: {
					tool_calls: [
						{
							index: 0,
							id: `call_${runId}`,
							type: 'function',
							function: {
								name: 'present_question',
								arguments: JSON.stringify(questionnaire),
							},
						},
					],
				},
				finish_reason: null,
			},
			{ index: 0, delta: {}, finish_reason: 'tool_calls' },
		]);
		return;
	}

	assert.equal(providerTurns, 2);
	assert.ok(JSON.stringify(payload.messages).includes(selectedLabel));
	assert.ok(JSON.stringify(payload.messages).includes(explanation));
	writeCompletion(response, runId, [
		{ index: 0, delta: { role: 'assistant' }, finish_reason: null },
		{ index: 0, delta: { content: expectedReply }, finish_reason: null },
		{ index: 0, delta: {}, finish_reason: 'stop' },
	]);
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
	const presented = await client.read(
		await client.send({ message: { kind: 'user', body: prompt } }),
	);
	assert.ok(Array.isArray(presented.data?.questionnaire));
	assert.equal(presented.data.questionnaire.at(-1)?.kind, questionnaire.kind);
	assert.equal(presented.data.questionnaire.at(-1)?.items?.length, questionnaire.items.length);
	assert.equal(presented.data.questionnaire.at(-1)?.items?.[0]?.prompt, questionnaire.items[0].prompt);

	const answered = await client.read(
		await client.send({ message: { kind: 'user', body: answers } }),
	);
	assert.equal(answered.text, expectedReply);
	assert.equal(providerTurns, 2);

	await flush();
	console.log(JSON.stringify({ projectName, runId, flushed: true }));
} finally {
	if (lifecycle) await lifecycle.stop();
	if (fakeProvider.listening) await close(fakeProvider);
}
