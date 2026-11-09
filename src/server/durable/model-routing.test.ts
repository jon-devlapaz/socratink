import assert from 'node:assert/strict';
import test from 'node:test';
import type { AuthDb } from '../auth-db.ts';
import type { CredentialStore } from '../credentials.ts';
import { modelRouting } from './model-routing.ts';

test('current selection rules preserve learner choice and restrict automatic selection to the operator', async () => {
	const keys = new Map([['alice:openai', 'alice-key'], ['alice:openrouter', 'router-key']]);
	const store = {
		hasUserKey: async ({ userId, name }: { userId: string; name: string }) => keys.has(`${userId}:${name}`),
		getUserKey: async ({ userId, name }: { userId: string; name: string }) => {
			const key = keys.get(`${userId}:${name}`);
			if (!key) throw new Error('No credential');
			return key;
		},
	} as CredentialStore;
	const routes = modelRouting({ authDb: { findAliasOwner: async () => undefined } as unknown as AuthDb, store,
		operator: () => ({ providerId: 'jon-local', modelId: 'auto', baseUrl: 'http://127.0.0.1:1/v1',
			apiKey: 'operator-key', reasoning: true, contextWindow: 204800, maxTokens: 131100 }) });
	assert.deepEqual(await routes.selection('alice', 'openai/gpt-5-mini', 'auto:fast'), { provider: 'openai', modelId: 'gpt-5-mini' });
	assert.deepEqual(await routes.selection('alice'), { provider: 'openrouter', modelId: 'openai/gpt-5-nano' });
	assert.deepEqual(await routes.selection('guest', undefined, 'auto:fast'), { provider: 'jon-local', modelId: 'auto', autoModel: 'auto:fast' });
	assert.deepEqual(await routes.selection('guest', undefined, 'unrecognized'), { provider: 'jon-local', modelId: 'auto' });
	const config = await routes.resolveModel('guest:conversation', await routes.selection('guest'));
	assert.equal(config.maxTokens, 131100);
	assert.equal(config.contextWindow, 204800);
	assert.equal(config.reasoning, true);
});

test('each generation resolves the aliased owner’s current key and revoke fails closed', async () => {
	let key: string | undefined = 'first-key';
	const routes = modelRouting({
		authDb: { findAliasOwner: async (id: string) => { assert.equal(id, 'guest'); return 'registered'; } } as AuthDb,
		store: { getUserKey: async ({ userId, name }: { userId: string; name: string }) => {
			assert.deepEqual({ userId, name }, { userId: 'registered', name: 'openai' });
			if (!key) throw new Error('No credential');
			return key;
		} } as CredentialStore,
		operator: () => ({ providerId: 'jon-local', modelId: 'auto', baseUrl: 'http://127.0.0.1:1/v1',
			apiKey: 'operator-key', reasoning: true, contextWindow: 204800, maxTokens: 131100 }),
	});
	const selected = { provider: 'openai', modelId: 'gpt-5-mini' };
	assert.equal((await routes.resolveModel('guest:conversation', selected)).apiKey, 'first-key');
	key = 'rotated-key';
	assert.equal((await routes.resolveModel('guest:conversation', selected)).apiKey, 'rotated-key');
	key = undefined;
	await assert.rejects(routes.resolveModel('guest:conversation', selected), /No credential/);
	await assert.rejects(routes.resolveModel('unowned', selected), /learner/);
});
