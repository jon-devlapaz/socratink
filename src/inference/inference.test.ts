import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { appConfig } from '../config/app.config.ts';
import type { ChatModel } from '../config/chat-model.ts';
import type { EngineOptions } from '../server/durable/contract.ts';
import { createInference, InferenceUnavailableError } from './index.ts';

const local: ChatModel = {
	providerId: 'jon-local', modelId: 'auto', baseUrl: 'http://127.0.0.1:1/v1', apiKey: 'operator-key',
	reasoning: true, contextWindow: 204800, maxTokens: 131100,
};
const resolved = {
	provider: 'jon-local', modelId: 'auto', baseUrl: 'http://127.0.0.1:1/v1', apiKey: 'operator-key',
	reasoning: true, contextWindow: 204800, maxTokens: 131100,
};

describe('operatorStatus', () => {
	it('a local operator', () => {
		assert.deepEqual(createInference({ operator: () => local }).operatorStatus(), { state: 'ready', route: 'local' });
	});
	it('a gateway operator', () => {
		const routes = createInference({ operator: () => ({ ...local, baseUrl: appConfig.vercelAiGatewayBaseUrl }) });
		assert.deepEqual(routes.operatorStatus(), { state: 'ready', route: 'gateway' });
	});
	it('an unconfigured operator', () => {
		assert.deepEqual(createInference({ operator: () => undefined }).operatorStatus(), { state: 'unconfigured' });
	});
});

describe('selection', () => {
	it('the current operator', async () => {
		assert.deepEqual(await createInference({ operator: () => local }).selection(), { provider: 'jon-local', modelId: 'auto' });
	});
	it('an unconfigured operator', async () => {
		await assert.rejects(createInference({ operator: () => undefined }).selection(), InferenceUnavailableError);
	});
});

describe('resolveModel', () => {
	for (const user of ['guest', 'registered', 'alias']) {
		it(`a conversation owned by ${user}`, async () => {
			const routes = createInference({ operator: () => local });
			assert.deepEqual(await routes.resolveModel(`${user}:conversation`), resolved);
		});
	}
	it('a conversation without a learner', async () => {
		const routes = createInference({ operator: () => local });
		await assert.rejects(routes.resolveModel('unowned'), { message: 'Conversation must belong to a learner.' });
	});
	for (const selection of [
		{ provider: 'openai', modelId: 'gpt-5-nano' }, { provider: 'openai', modelId: 'gpt-5-mini' },
		{ provider: 'openrouter', modelId: 'openai/gpt-5' }, { provider: 'jon-local', modelId: 'old-model' },
	]) {
		it(`a saved ${selection.provider}/${selection.modelId} selection`, async () => {
			const resolve: EngineOptions['resolveModel'] = createInference({ operator: () => local }).resolveModel;
			assert.deepEqual(await resolve('learner:conversation', selection), resolved);
		});
	}
	it('a saved selection when the provider is unconfigured', async () => {
		const resolve: EngineOptions['resolveModel'] = createInference({ operator: () => undefined }).resolveModel;
		await assert.rejects(resolve('learner:conversation', { provider: 'openai', modelId: 'gpt-5-nano' }), InferenceUnavailableError);
	});
	it('new settings between two generations', async () => {
		let operator = local;
		const routes = createInference({ operator: () => operator });
		assert.deepEqual(await routes.resolveModel('learner:conversation'), resolved);
		operator = { ...local, apiKey: 'rotated-key', modelId: 'new-model' };
		assert.deepEqual(await routes.resolveModel('learner:conversation'), { ...resolved, apiKey: 'rotated-key', modelId: 'new-model' });
		assert.deepEqual(await routes.selection(), { provider: 'jon-local', modelId: 'new-model' });
	});
});
