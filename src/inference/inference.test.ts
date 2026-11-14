import assert from 'node:assert/strict';
import test from 'node:test';
import { appConfig } from '../config/app.config.ts';
import type { ChatModel } from '../config/chat-model.ts';
import type { EngineOptions } from '../server/durable/contract.ts';
import { createInference, InferenceUnavailableError } from './index.ts';

const local: ChatModel = { providerId: 'jon-local', modelId: 'auto', baseUrl: 'http://127.0.0.1:1/v1',
	apiKey: 'operator-key', reasoning: true, contextWindow: 204800, maxTokens: 131100 };

test('every learner uses the current operator model and limits', async () => {
	const routes = createInference({ operator: () => local });
	assert.deepEqual(await routes.selection(), { provider: 'jon-local', modelId: 'auto' });
	for (const user of ['guest', 'registered', 'alias']) {
		assert.deepEqual(await routes.resolveModel(`${user}:conversation`), {
			provider: 'jon-local', modelId: 'auto', apiKey: 'operator-key', baseUrl: local.baseUrl,
			reasoning: true, contextWindow: 204800, maxTokens: 131100,
		});
	}
	await assert.rejects(routes.resolveModel('unowned'), /learner/);
});

test('saved learner and retired model selections fall back to the current operator route', async () => {
	const routes = createInference({ operator: () => local });
	const resolve: EngineOptions['resolveModel'] = routes.resolveModel;
	for (const selected of [
		{ provider: 'openai', modelId: 'gpt-5-nano' },
		{ provider: 'openai', modelId: 'gpt-5-mini' },
		{ provider: 'openrouter', modelId: 'openai/gpt-5' },
		{ provider: 'jon-local', modelId: 'old-model' },
	]) {
		assert.deepEqual(await resolve('learner:conversation', selected), await routes.resolveModel('learner:conversation'));
	}
});

test('each generation resolves the current operator settings', async () => {
	let operator = local;
	const routes = createInference({ operator: () => operator });
	assert.equal((await routes.resolveModel('learner:conversation')).apiKey, 'operator-key');
	operator = { ...local, apiKey: 'rotated-key', modelId: 'new-model' };
	assert.equal((await routes.resolveModel('learner:conversation')).apiKey, 'rotated-key');
	assert.deepEqual(await routes.selection(), { provider: 'jon-local', modelId: 'new-model' });
});

test('operator status reports the route and missing hosted configuration refuses every turn', async () => {
	let operator: ChatModel | undefined = { ...local, baseUrl: appConfig.vercelAiGatewayBaseUrl };
	const routes = createInference({ operator: () => operator });
	assert.deepEqual(routes.operatorStatus(), { state: 'ready', route: 'gateway' });
	operator = local;
	assert.deepEqual(routes.operatorStatus(), { state: 'ready', route: 'local' });
	operator = undefined;
	assert.deepEqual(routes.operatorStatus(), { state: 'unconfigured' });
	await assert.rejects(routes.selection(), InferenceUnavailableError);
	const resolve: EngineOptions['resolveModel'] = routes.resolveModel;
	await assert.rejects(resolve('learner:conversation', { provider: 'openai', modelId: 'gpt-5-nano' }), InferenceUnavailableError);
});
