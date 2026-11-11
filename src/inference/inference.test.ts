import assert from 'node:assert/strict';
import test from 'node:test';
import { appConfig } from '../config/app.config.ts';
import type { ChatModel } from '../config/chat-model.ts';
import type { CredentialStore } from '../server/credentials.ts';
import { createInference, InferenceUnavailableError } from './index.ts';

const local: ChatModel = { providerId: 'jon-local', modelId: 'auto', baseUrl: 'http://127.0.0.1:1/v1',
	apiKey: 'operator-key', reasoning: true, contextWindow: 204800, maxTokens: 131100 };
const noAliases = { findAliasOwner: async () => undefined };

function storeWith(keys: Map<string, string>) {
	return {
		hasUserKey: async ({ userId, name }: { userId: string; name: string }) => keys.has(`${userId}:${name}`),
		getUserKey: async ({ userId, name }: { userId: string; name: string }) => {
			const key = keys.get(`${userId}:${name}`);
			if (!key) throw new Error('No credential');
			return key;
		},
	} as Pick<CredentialStore, 'hasUserKey' | 'getUserKey'>;
}

test('current selection rules preserve learner choice and fall back to the operator', async () => {
	const store = storeWith(new Map([['alice:openai', 'alice-key']]));
	const routes = createInference({ authDb: noAliases, store, operator: () => local });
	assert.deepEqual(await routes.selection('alice', 'openai/gpt-5-mini'), { provider: 'openai', modelId: 'gpt-5-mini' });
	assert.deepEqual(await routes.selection('alice'), { provider: 'openai', modelId: 'gpt-5-nano' });
	assert.deepEqual(await routes.selection('guest'), { provider: 'jon-local', modelId: 'auto' });
	const config = await routes.resolveModel('guest:conversation', await routes.selection('guest'));
	assert.equal(config.maxTokens, 131100);
	assert.equal(config.contextWindow, 204800);
	assert.equal(config.reasoning, true);
});

test('a stored retired provider row or saved turn selection follows the current route', async () => {
	const store = storeWith(new Map([['alice:openai', 'alice-key'], ['alice:openrouter', 'router-key'], ['bob:openrouter', 'router-key']]));
	const routes = createInference({ authDb: noAliases, store, operator: () => local });
	assert.deepEqual(await routes.status('bob'), { state: 'ready', route: 'local' });
	assert.deepEqual(await routes.selection('alice', 'openrouter/openai/gpt-5'), { provider: 'openai', modelId: 'gpt-5-nano' });
	assert.deepEqual(await routes.selection('bob', 'openrouter/openai/gpt-5'), { provider: 'jon-local', modelId: 'auto' });
	const saved = { provider: 'openrouter', modelId: 'openai/gpt-5-mini' };
	assert.deepEqual(await routes.resolveModel('alice:c', saved), { provider: 'openai', modelId: 'gpt-5-nano', apiKey: 'alice-key' });
	const operatorConfig = await routes.resolveModel('bob:c', saved);
	assert.equal(operatorConfig.provider, 'jon-local');
	assert.equal(operatorConfig.apiKey, 'operator-key');
});

test('each generation resolves the aliased owner’s current key and revoke fails closed', async () => {
	let key: string | undefined = 'first-key';
	const routes = createInference({
		authDb: { findAliasOwner: async (id: string) => { assert.equal(id, 'guest'); return 'registered'; } },
		store: { hasUserKey: async () => true, getUserKey: async ({ userId, name }: { userId: string; name: string }) => {
			assert.deepEqual({ userId, name }, { userId: 'registered', name: 'openai' });
			if (!key) throw new Error('No credential');
			return key;
		} } as Pick<CredentialStore, 'hasUserKey' | 'getUserKey'>,
		operator: () => local,
	});
	const selected = { provider: 'openai', modelId: 'gpt-5-mini' };
	assert.equal((await routes.resolveModel('guest:conversation', selected)).apiKey, 'first-key');
	key = 'rotated-key';
	assert.equal((await routes.resolveModel('guest:conversation', selected)).apiKey, 'rotated-key');
	key = undefined;
	await assert.rejects(routes.resolveModel('guest:conversation', selected), /No credential/);
	await assert.rejects(routes.resolveModel('unowned', selected), /learner/);
});

test('status names the route a turn will take, and no credential is unconfigured before any turn', async () => {
	let operator: ChatModel | undefined = { ...local, baseUrl: appConfig.vercelAiGatewayBaseUrl };
	const store = storeWith(new Map([['alice:openai', 'alice-key']]));
	const routes = createInference({ authDb: noAliases, store, operator: () => operator });
	assert.deepEqual(await routes.status('alice'), { state: 'ready', route: 'learner-openai' });
	assert.deepEqual(await routes.status('guest'), { state: 'ready', route: 'gateway' });
	operator = local;
	assert.deepEqual(routes.operatorStatus(), { state: 'ready', route: 'local' });
	operator = undefined;
	assert.deepEqual(routes.operatorStatus(), { state: 'unconfigured' });
	assert.deepEqual(await routes.status('guest'), { state: 'unconfigured' });
	// A learner's own key still works with no operator, and never borrows one.
	assert.deepEqual(await routes.status('alice'), { state: 'ready', route: 'learner-openai' });
	assert.equal((await routes.resolveModel('alice:c', await routes.selection('alice'))).apiKey, 'alice-key');
	await assert.rejects(routes.selection('guest'), InferenceUnavailableError);
	await assert.rejects(routes.resolveModel('guest:c', { provider: 'jon-local', modelId: 'auto' }), InferenceUnavailableError);
});
