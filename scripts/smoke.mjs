import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { cp, mkdtemp, rm, symlink } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createFlueClient } from '@flue/sdk';
import { visibleTurnsFromHistory } from '../src/ui/chat-turns.ts';

const initialMessage =
	'Help me reason about recovery when an agent response stream disconnects after its request may already be admitted.';
const baselineChoice = 'Send the same message again';
const baselineReason = 'The disconnected stream looks like a failed request.';
const comparisonChoice = 'Whether the local loading indicator stopped';
const comparisonReason = 'The indicator is the only failure signal visible in the browser.';
const revisedChoice = 'Recheck the admitted request by its stable submission identifier';
const revisedReason = 'Local observation can fail while admitted work continues, so resending can duplicate the work.';
const baselineAnswer = `Questionnaire answers:\n- What should the client do first when admission is uncertain?: ${baselineChoice}, ${baselineReason}`;
const comparisonAnswer = `Questionnaire answers:\n- Which observation best distinguishes safe recovery from duplicate work?: ${comparisonChoice}, ${comparisonReason}`;
const revisedAnswer = `Questionnaire answers:\n- What is your revised recovery action?: ${revisedChoice}, ${revisedReason}`;
const assistanceText =
	'A stable submission identifier is evidence that work may continue after the response stream is lost. Rechecking that submission preserves one admission, while resending can create duplicate work. This information was supplied by Socratink.';
const finalSummary = `Your baseline decision was ${baselineChoice}. Socratink supplied the distinction between losing local observation and losing admitted work. Your revised decision was ${revisedChoice}. This is evidence from this session, not proof of mastery or durable learning.`;
const baselineQuestionnaire = {
	kind: 'question',
	submitLabel: 'Submit initial reasoning',
	items: [
		{
			name: 'baseline_recovery',
			prompt: 'What should the client do first when admission is uncertain?',
			required: true,
			multiple: false,
			choices: [
				{ value: 'recheck-submission', label: 'Recheck the admitted request by its stable submission identifier' },
				{ value: 'resend-message', label: 'Send the same message again' },
				{ value: 'new-conversation', label: 'Start a new conversation' },
				{ value: 'assume-failed', label: 'Assume the request failed' },
			],
			input: { label: 'Your reasoning' },
		},
	],
};
const comparisonQuestionnaire = {
	kind: 'question',
	submitLabel: 'Submit observation',
	items: [
		{
			name: 'recovery_observation',
			prompt: 'Which observation best distinguishes safe recovery from duplicate work?',
			required: true,
			multiple: false,
			choices: [
				{ value: 'submission-id', label: 'Whether the server issued a stable submission identifier' },
				{ value: 'loading-indicator', label: 'Whether the local loading indicator stopped' },
				{ value: 'message-length', label: 'How long the learner message is' },
				{ value: 'model-name', label: 'Which model was selected' },
			],
			input: { label: 'Why this observation matters' },
		},
	],
};
const revisedQuestionnaire = {
	kind: 'question',
	submitLabel: 'Submit revised reasoning',
	items: [
		{
			name: 'revised_recovery',
			prompt: 'What is your revised recovery action?',
			required: true,
			multiple: false,
			choices: baselineQuestionnaire.items[0].choices,
			input: { label: 'Your reasoning' },
		},
	],
};
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

async function waitForServer(url, process, timeoutMs = 10_000) {
	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		if (process.exitCode !== null) throw new Error(`Socratink server exited with code ${process.exitCode}`);
		try {
			const response = await fetch(url);
			if (response.ok) return response;
		} catch {}
		await new Promise((resolve) => setTimeout(resolve, 50));
	}
	throw new Error(`Socratink server did not become ready within ${timeoutMs}ms`);
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

function questionnaireFromReply(reply, expected, label) {
	assert.deepEqual(reply.data?.questionnaire?.at(-1), expected, `${label} questionnaire should be validated`);
}

function questionnaireParts(message) {
	return message.parts
		.filter((part) => part.type === 'data-questionnaire')
		.map((part) => part.data);
}

function assertProviderReceived(messages, expected) {
	assert.ok(
		JSON.stringify(messages).includes(JSON.stringify(expected)),
		`provider should receive ${expected}`,
	);
}

function scriptedCompletionDeltas({ text, questionnaire, toolCallId, finishReason }) {
	return [
		{ index: 0, delta: { role: 'assistant' }, finish_reason: null },
		...(text ? [{ index: 0, delta: { content: text }, finish_reason: null }] : []),
		...(questionnaire
			? [
					{
						index: 0,
						delta: {
							tool_calls: [
								{
									index: 0,
									id: toolCallId,
									type: 'function',
									function: { name: 'present_question', arguments: JSON.stringify(questionnaire) },
								},
							],
						},
						finish_reason: null,
					},
				]
			: []),
		{ index: 0, delta: {}, finish_reason: finishReason },
	];
}

const scriptedProviderTurns = [
	{
		expectedMessages: [initialMessage],
		text:
			'The response stream disappeared, but the client does not yet know whether the server admitted the agent request.',
		questionnaire: baselineQuestionnaire,
		toolCallId: 'call_baseline',
		finishReason: 'tool_calls',
	},
	{
		expectedMessages: [baselineAnswer],
		questionnaire: comparisonQuestionnaire,
		toolCallId: 'call_comparison',
		finishReason: 'tool_calls',
	},
	{
		expectedMessages: [baselineAnswer, comparisonAnswer],
		text: assistanceText,
		questionnaire: revisedQuestionnaire,
		toolCallId: 'call_revision',
		finishReason: 'tool_calls',
	},
	{
		expectedMessages: [baselineAnswer, comparisonAnswer, revisedAnswer],
		text: finalSummary,
		finishReason: 'stop',
	},
];

let providerTurns = 0;
const fakeProvider = createServer(async (request, response) => {
	assert.equal(request.method, 'POST');
	assert.equal(request.url, '/v1/chat/completions');
	assert.equal(request.headers.authorization, 'Bearer smoke-test-key');

	let body = '';
	for await (const chunk of request) body += chunk;
	const payload = JSON.parse(body);
	assert.equal(payload.model, 'auto');
	assert.equal(payload.stream, true);
	assert.ok(JSON.stringify(payload.tools).includes('present_question'));

	const turn = scriptedProviderTurns[providerTurns];
	assert.ok(turn, 'the completed loop should use exactly four provider calls');
	providerTurns += 1;
	for (const expected of turn.expectedMessages) assertProviderReceived(payload.messages, expected);
	writeCompletion(response, `chatcmpl-smoke-${providerTurns}`, scriptedCompletionDeltas(turn));
});
fakeProvider.on('connection', (socket) => {
	sockets.add(socket);
	socket.once('close', () => sockets.delete(socket));
});

let appProcess;
let stderr = '';
let appDirectory;

function startApp(appPort, providerPort) {
	const child = spawn(process.execPath, ['dist/server.mjs'], {
		cwd: appDirectory,
		env: {
			...process.env,
			NODE_ENV: 'development',
			PORT: String(appPort),
			JON_LOCAL_BASE_URL: `http://127.0.0.1:${providerPort}/v1`,
			JON_LOCAL_API_KEY: 'smoke-test-key',
		},
		stdio: ['ignore', 'pipe', 'pipe'],
	});
	child.stderr.on('data', (chunk) => {
		stderr += chunk;
	});
	return child;
}

async function stopApp(child) {
	if (child?.exitCode !== null) return;
	child.kill('SIGTERM');
	await new Promise((resolve) => child.once('exit', resolve));
}

try {
	const providerPort = await listen(fakeProvider);
	const portProbe = createServer();
	const appPort = await listen(portProbe);
	await close(portProbe);

	appDirectory = await mkdtemp(join(tmpdir(), 'socratink-smoke-'));
	await cp('dist', join(appDirectory, 'dist'), { recursive: true });
	await symlink(resolve('node_modules'), join(appDirectory, 'node_modules'), 'dir');
	appProcess = startApp(appPort, providerPort);

	const origin = `http://127.0.0.1:${appPort}`;
	const health = await waitForServer(`${origin}/healthz`, appProcess);
	assert.deepEqual(await health.json(), { status: 'ok' });

	const root = await fetch(`${origin}/`);
	assert.equal(root.status, 200);
	const html = await root.text();
	assert.match(html, /<title>Socratink<\/title>/);
	const browserRoute = await fetch(`${origin}/interview-demo`);
	assert.equal(browserRoute.status, 200, 'unknown browser route should receive the SPA');
	assert.match(await browserRoute.text(), /<title>Socratink<\/title>/);

	for (const method of ['GET', 'POST']) {
		const unknownApiRoute = await fetch(`${origin}/api/does-not-exist`, { method });
		assert.equal(unknownApiRoute.status, 404, `${method} unknown API route should return 404`);
		assert.match(
			unknownApiRoute.headers.get('content-type') ?? '',
			/^application\/json(?:;|$)/,
			`${method} unknown API route should return JSON`,
		);
		assert.deepEqual(await unknownApiRoute.json(), {
			error: { type: 'not_found', message: 'API route not found.' },
		});
	}

	const assetPaths = [...html.matchAll(/(?:src|href)="([^"?#]*assets\/[^"?#]+)"/g)].map((match) => match[1]);
	assert.ok(assetPaths.length >= 2, 'expected built JavaScript and CSS assets');
	for (const path of assetPaths) {
		const asset = await fetch(new URL(path, origin));
		assert.equal(asset.status, 200, `asset ${path} should load`);
		assert.ok((await asset.arrayBuffer()).byteLength > 0, `asset ${path} should not be empty`);
	}

	const client = createFlueClient({ url: `${origin}/api/agents/chat/smoke-conversation` });
	const baseline = await client.read(
		await client.send({ message: { kind: 'user', body: initialMessage } }),
	);
	questionnaireFromReply(baseline, baselineQuestionnaire, 'baseline');

	const comparison = await client.read(
		await client.send({ message: { kind: 'user', body: baselineAnswer } }),
	);
	questionnaireFromReply(comparison, comparisonQuestionnaire, 'comparison');

	const revision = await client.read(
		await client.send({ message: { kind: 'user', body: comparisonAnswer } }),
	);
	assert.equal(revision.text, assistanceText);
	questionnaireFromReply(revision, revisedQuestionnaire, 'revision');

	const complete = await client.read(
		await client.send({ message: { kind: 'user', body: revisedAnswer } }),
	);
	assert.equal(complete.text, finalSummary);
	assert.equal(providerTurns, 4, 'the completed loop should make exactly four provider calls');

	await stopApp(appProcess);
	appProcess = startApp(appPort, providerPort);
	await waitForServer(`${origin}/healthz`, appProcess);
	const restored = await client.history();
	const visibleMessages = restored.messages.filter((message) => message.display === 'visible');
	const visibleTurns = visibleTurnsFromHistory(restored);
	assert.deepEqual(
		visibleTurns.map(({ role, text }) => ({ role, text })),
		[
			{ role: 'You', text: initialMessage },
			{
				role: 'Assistant',
				text:
					'The response stream disappeared, but the client does not yet know whether the server admitted the agent request.',
			},
			{ role: 'You', text: baselineAnswer },
			{ role: 'Assistant', text: '' },
			{ role: 'You', text: comparisonAnswer },
			{ role: 'Assistant', text: assistanceText },
			{ role: 'You', text: revisedAnswer },
			{ role: 'Assistant', text: finalSummary },
		],
		'completed loop should restore the eight learner-visible turns in order',
	);
	assert.deepEqual(visibleTurns[1]?.questionnaire, baselineQuestionnaire);
	assert.deepEqual(visibleTurns[3]?.questionnaire, comparisonQuestionnaire);
	assert.deepEqual(visibleTurns[5]?.questionnaire, revisedQuestionnaire);
	assert.equal(visibleTurns[7]?.questionnaire, undefined, 'final summary should not present a questionnaire');
	assert.deepEqual(
		visibleMessages.flatMap(questionnaireParts),
		[baselineQuestionnaire, comparisonQuestionnaire, revisedQuestionnaire],
		'completed loop should restore all questionnaire data parts',
	);

	console.log(
		`smoke passed: health, SPA fallback, unknown API 404s, ${assetPaths.length} assets, four-turn agentic-engineering learning exchange, restart persistence`,
	);
} catch (error) {
	if (stderr) process.stderr.write(`\nSocratink server stderr:\n${stderr}`);
	throw error;
} finally {
	await stopApp(appProcess);
	if (fakeProvider.listening) await close(fakeProvider);
	if (appDirectory) await rm(appDirectory, { recursive: true, force: true });
}
