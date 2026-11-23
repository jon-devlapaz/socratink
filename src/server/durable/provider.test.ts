import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import test from 'node:test';
import { BACKGROUND_CONTEXT } from '@earendil-works/chord/context';
import { ROOT_CONVERSATION_ID, type EntryId } from '@earendil-works/pi-durable';
import { commitWrites } from '@earendil-works/pi-durable/testing';
import { openNodeSqliteStorage } from '@earendil-works/pi-durable/storage/sqlite/node';
import { isRetryableAssistantError } from '@earendil-works/pi-ai/utils/retry';
import { appConfig } from '../../config/app.config.ts';
import { modelConfig } from '../../inference/index.ts';
import { resolveChatModel } from '../../inference/operator.ts';
import { conversationModels, messageRoute, modelRef } from './provider.ts';
import { openEngine } from './engine.ts';
import type { EngineOptions, ModelConfig } from './contract.ts';

test('the hosted tutor sends explicit disabled reasoning and keeps its fallback models', async (t) => {
	const requests: { url: string; body: Record<string, unknown> }[] = [];
	t.mock.method(globalThis, 'fetch', async (input: RequestInfo | URL, init?: RequestInit) => {
		requests.push({ url: String(input), body: JSON.parse(String(init?.body)) });
		return new Response('data: {"choices":[{"index":0,"delta":{"content":"Ready."},"finish_reason":"stop"}]}\n\ndata: [DONE]\n\n',
			{ headers: { 'content-type': 'text/event-stream' } });
	});
	const operator = resolveChatModel({ VERCEL: '1', AI_GATEWAY_API_KEY: 'synthetic-key' });
	assert(operator);
	const models = conversationModels({
		target: { kind: 'sqlite', filename: ':memory:' },
		resolveModel: async () => modelConfig(operator),
	}, 'learner:synthetic', async () => undefined);
	const response = await models.streamSimple(models.getModel(modelRef.provider, modelRef.modelId)!, { messages: [] }).result();
	assert.equal(response.stopReason, 'stop');
	assert.equal(requests.length, 1);
	assert.equal(requests[0]?.url, `${appConfig.vercelAiGatewayBaseUrl}/chat/completions`);
	assert.equal(requests[0]?.body.model, appConfig.vercelAiGatewayModelId);
	assert.deepEqual(requests[0]?.body.reasoning, { effort: 'none' });
	assert.deepEqual(requests[0]?.body.models, [...appConfig.vercelAiGatewayFallbackModelIds]);
});

test('a reply from the requested hosted model is labelled with it (the gateway sends no route header)', async (t) => {
	// AI Gateway names the serving model in each chunk; pi-ai keeps it only when it differs from the request.
	t.mock.method(globalThis, 'fetch', async () => new Response(
		`data: {"id":"gen_1","model":"${appConfig.vercelAiGatewayModelId}","choices":[{"index":0,"delta":{"content":"Ready."},"finish_reason":"stop"}]}\n\ndata: [DONE]\n\n`,
		{ headers: { 'content-type': 'text/event-stream' } }));
	const operator = resolveChatModel({ VERCEL: '1', AI_GATEWAY_API_KEY: 'synthetic-key' });
	assert(operator);
	const models = conversationModels({
		target: { kind: 'sqlite', filename: ':memory:' },
		resolveModel: async () => modelConfig(operator),
	}, 'learner:synthetic', async () => undefined);
	const message = await models.streamSimple(models.getModel(modelRef.provider, modelRef.modelId)!, { messages: [] }).result();
	assert.equal(message.stopReason, 'stop');
	assert.deepEqual(messageRoute(message), { routedModel: appConfig.vercelAiGatewayModelId });
});

test('operator transport preserves keys, limits, live route headers and persisted response metadata', async () => {
	const requests: { path: string; authorization: string | undefined; body: Record<string, unknown> }[] = [];
	const server = createServer(async (request, response) => {
		let input = '';
		for await (const chunk of request) input += chunk;
		const body = JSON.parse(input) as Record<string, unknown>;
		requests.push({ path: request.url!, authorization: request.headers.authorization, body });
		response.writeHead(200, { 'content-type': 'text/event-stream', 'x-routed-via': 'actual%2Fmodel', 'x-fallback-attempts': '2' });
		const emit = (event: unknown) => response.write(`data: ${JSON.stringify(event)}\n\n`);
		emit({ id: 'completion_1', model: 'response-model', choices: [{ index: 0, delta: { role: 'assistant', reasoning_content: 'Considering.', content: 'Ready.' }, finish_reason: null }] });
		emit({ id: 'completion_1', model: 'response-model', choices: [{ index: 0, delta: {}, finish_reason: 'stop' }] });
		response.write('data: [DONE]\n\n');
		response.end();
	});
	server.listen(0, '127.0.0.1');
	await once(server, 'listening');
	const address = server.address();
	assert(address && typeof address !== 'string');
	const baseUrl = `http://127.0.0.1:${address.port}/v1`;
	const directory = await mkdtemp(join(tmpdir(), 'socratink-native-provider-'));
	try {
		const configs: Record<string, ModelConfig> = {
			operator: { provider: 'jon-local', modelId: 'auto', apiKey: 'operator-synthetic', baseUrl,
				reasoning: true, contextWindow: 1048576, maxTokens: 131100 },
			fallback: { provider: 'jon-local', modelId: 'primary', apiKey: 'fallback-synthetic', baseUrl,
				contextWindow: 128000, maxTokens: 4096, fallbackModelIds: ['second/model'] },
		};
		const options: EngineOptions = { target: { kind: 'sqlite', filename: ':memory:' }, resolveModel: async (id) => configs[id]! };
		const responses = await Promise.all(Object.keys(configs).map(async (id) => {
			const models = conversationModels(options, id, async () => configs[id]);
			const model = models.getModel(modelRef.provider, modelRef.modelId)!;
			const stream = models.streamSimple(model, { messages: [{ role: 'user', content: 'Synthetic prompt.', timestamp: 0 }] });
			let liveRoute = false;
			for await (const event of stream) {
				if ('partial' in event && messageRoute(event.partial)) liveRoute = true;
			}
			const message = await stream.result();
			assert.equal(message.stopReason, 'stop', message.errorMessage ?? 'Expected a completed response.');
			assert.equal(liveRoute, true);
			assert.deepEqual(messageRoute(message), { routedModel: 'actual/model', fallbackAttempts: 2 });
			assert.equal(JSON.stringify(message).includes('synthetic'), false, 'credentials and prompt are not response metadata');
			return message;
		}));
		const byKey = (key: string) => requests.find((request) => request.authorization === `Bearer ${key}`)!;
		assert.equal(byKey('operator-synthetic').path, '/v1/chat/completions');
		assert.equal(byKey('operator-synthetic').body.model, 'auto');
		assert.equal(byKey('operator-synthetic').body.max_tokens ?? byKey('operator-synthetic').body.max_completion_tokens, 131100);
		assert.equal(byKey('operator-synthetic').body.reasoning_effort, undefined);
		assert.equal(byKey('operator-synthetic').body.reasoning, undefined);
		assert.equal(byKey('operator-synthetic').body.models, undefined, 'a config without fallbacks sends none');
		assert.deepEqual(byKey('fallback-synthetic').body.models, ['second/model'], 'learner turns ask the gateway to fall back');
		const file = join(directory, 'metadata.sqlite');
		let storage = await openNodeSqliteStorage(file);
		await commitWrites(storage, [{ type: 'conversation', value: { id: ROOT_CONVERSATION_ID } },
			{ type: 'entry', value: { id: 2 as EntryId, conversationId: ROOT_CONVERSATION_ID, kind: 'pi.assistant', model: [responses[0]!] } }], BACKGROUND_CONTEXT);
		await storage.close(BACKGROUND_CONTEXT);
		storage = await openNodeSqliteStorage(file);
		try {
			const entry = await storage.entry(2 as EntryId, BACKGROUND_CONTEXT);
			assert.deepEqual(messageRoute(entry!.entry.model![0]!), { routedModel: 'actual/model', fallbackAttempts: 2 });
		} finally { await storage.close(BACKGROUND_CONTEXT); }
	} finally {
		server.close();
		server.closeAllConnections();
		await rm(directory, { recursive: true, force: true });
	}
});

test('reflected credentials are removed from live failures, route headers and reopened native records without changing retries', async () => {
	const key = 'synthetic-private/key+value';
	const encoded = encodeURIComponent(key);
	const failures = [
		{ status: 500, message: 'Internal server error', retryable: true },
		{ status: 401, message: 'Invalid API key', retryable: false },
		{ status: 429, message: 'insufficient_quota', retryable: false },
	];
	let failure = failures[0]!;
	let success = false;
	const server = createServer(async (request, response) => {
		for await (const _chunk of request) { /* Drain the synthetic request. */ }
		response.setHeader('x-routed-via', `route-${encoded}`);
		if (success) {
			response.writeHead(200, { 'content-type': 'text/event-stream' });
			response.end(`data: ${JSON.stringify({ id: 'synthetic', model: `model-${key}`, choices: [{ index: 0, delta: { content: 'Ready.' }, finish_reason: 'stop' }] })}\n\ndata: [DONE]\n\n`);
		} else {
			response.writeHead(failure.status, { 'content-type': 'application/json', 'x-should-retry': 'false' });
			response.end(JSON.stringify({ error: { message: `${failure.message}: ${key}; encoded=${encoded}` } }));
		}
	});
	server.listen(0, '127.0.0.1');
	await once(server, 'listening');
	const address = server.address();
	assert(address && typeof address !== 'string');
	const baseUrl = `http://127.0.0.1:${address.port}/v1`;
	const directory = await mkdtemp(join(tmpdir(), 'socratink-provider-redaction-'));
	const target = { kind: 'sqlite' as const, filename: join(directory, 'pi.sqlite') };
	const config: ModelConfig = { provider: 'jon-local', modelId: 'synthetic', apiKey: key, baseUrl, contextWindow: 128000, maxTokens: 4096 };
	const options: EngineOptions = { target, resolveModel: async () => config };
	function assertNoKey(value: unknown) {
		const serialized = JSON.stringify(value);
		assert.equal(serialized.includes(key), false, 'the resolved credential must not escape the provider boundary');
		assert.equal(serialized.includes(encoded), false, 'the encoded credential must not escape the provider boundary');
	}
	try {
		for (failure of failures) {
			const models = conversationModels({ ...options, resolveModel: async () => config }, 'learner:failure', async () => config);
			const stream = models.streamSimple(models.getModel(modelRef.provider, modelRef.modelId)!, { messages: [] }, { maxRetries: 0 });
			for await (const event of stream) assertNoKey(event);
			const message = await stream.result();
			assertNoKey(message);
			assert.equal(message.stopReason, 'error');
			assert.equal(isRetryableAssistantError(message), failure.retryable);
			assert(message.errorMessage?.includes(failure.message), 'non-secret failure details remain available for retry classification');
		}
		success = true;
		const models = conversationModels(options, 'learner:route', async () => config);
		const stream = models.streamSimple(models.getModel(modelRef.provider, modelRef.modelId)!, { messages: [] });
		for await (const event of stream) assertNoKey(event);
		const message = await stream.result();
		assertNoKey(message);
		assert.equal(messageRoute(message)?.routedModel, 'route-[redacted]');
		success = false;
		failure = failures[1]!;
		const background: Promise<void>[] = [];
		const engine = await openEngine({ ...options, keepAlive: (work) => background.push(work) });
		try {
			await engine.submit('learner:failure', 'Synthetic request.');
			await Promise.all(background);
			assert.equal((await engine.snapshot('learner:failure')).submissions[0]?.outcome, 'failed');
		} finally { await engine.close(); }
		const reopened = await openEngine(options);
		try { assertNoKey(await reopened.snapshot('learner:failure')); }
		finally { await reopened.close(); }
		const database = new DatabaseSync(target.filename, { readOnly: true });
		try {
			const records = database.prepare('SELECT writes FROM pi_commits').all();
			assert(records.length > 0, 'the real engine committed native Pi records');
			assertNoKey(records);
		} finally { database.close(); }
	} finally {
		server.close();
		server.closeAllConnections();
		await rm(directory, { recursive: true, force: true });
	}
});
