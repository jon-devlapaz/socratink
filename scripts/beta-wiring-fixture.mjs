import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Hono } from 'hono';
import { createFlueClient, FlueExecutionError } from '@flue/sdk';
import { AgentRunError, init, setProvider } from '@flue/runtime';
import { start } from '@flue/runtime/node';
import { appConfig } from '../src/config/app.config.ts';
import { getAuthDb } from '../src/server/auth-runtime.ts';
import { getCredentialStore } from '../src/server/credential-runtime.ts';
import { writeSessionCookie } from '../src/server/session.ts';
import { cookiePairFromResponse } from './session-fixture.mjs';
import { betaProviderFixture } from './beta-provider-fixture.mjs';

const paused = process.argv[2] === 'paused';
const directory = await mkdtemp(join(tmpdir(), 'socratink-beta-wiring-'));
await mkdir(join(directory, 'dist', 'client'), { recursive: true });
const cwd = process.cwd();
process.chdir(directory);
// Prime only the persistence singletons locally. Import the unmodified app and
// provider entrypoints after hosted config is set; do not install any guards here.
const authDb = getAuthDb();
const credentials = getCredentialStore();
const originalFetch = globalThis.fetch;
let runtime;
globalThis.fetch = async () => { throw new Error('Live network is forbidden in beta wiring tests.'); };
try {
	await authDb.createUser('alice', 'alice@example.com');
	await authDb.createUser('bob', 'bob@example.com');
	await authDb.createAlias('former-guest', 'alice');
	for (const name of ['openai', 'openrouter']) {
		await credentials.updateUserKey({ userId: 'alice', name, value: 'synthetic-legacy-key' });
	}
	Object.assign(process.env, {
		NODE_ENV: 'production', AI_GATEWAY_API_KEY: 'synthetic-gateway-key',
		SESSION_SECRET: 'synthetic-wiring-session-secret', CREDENTIALS_SECRET: 'synthetic-credential-secret',
		DATABASE_URL: 'postgres://unused:unused@127.0.0.1:1/unused',
		SOCRATINK_BETA_INVITED_EMAILS: 'alice@example.com', SOCRATINK_BETA_PAUSED: paused ? '1' : '0',
		GOOGLE_CLIENT_ID: 'synthetic-google-client', GOOGLE_CLIENT_SECRET: 'synthetic-google-secret',
		AUTH_REDIRECT_BASE_URL: 'https://beta.example.com',
	});
	const { default: app } = await import('../src/app.ts');
	const { Chat } = await import('../src/agents/chat.ts');
	const { chatModel } = await import('../src/config/chat-model.ts');
	const { chatTurnErrorMessage } = await import('../src/ui/client/conversation.ts');
	const { betaInviteError, betaPausedError } = await import('../src/config/beta-access.ts');
	assert.equal(chatModel.baseUrl, appConfig.vercelAiGatewayBaseUrl);
	assert.equal(chatModel.modelId, appConfig.vercelAiGatewayModelId);
	assert.equal(chatModel.maxTokens, 8192);
	const fake = betaProviderFixture(chatModel.modelId);
	setProvider(fake.provider);
	Chat.durability = { maxAttempts: 1, timeoutMs: 5_000 };
	runtime = await start({ agents: [Chat], env: {} });
	const cookies = new Hono();
	cookies.post('/:id/:kind', async (context) => {
		await writeSessionCookie(context, context.req.param('id'), process.env.SESSION_SECRET, {}, context.req.param('kind'));
		return context.json({ ok: true });
	});
	async function headers(id, kind = 'registered') {
		return { cookie: cookiePairFromResponse(await cookies.request(`/${id}/${kind}`, { method: 'POST' })) };
	}
	const alice = await headers('alice');
	const bob = await headers('bob');
	const guest = await headers('guest', 'guest');
	for (const [id, auth, code] of [
		['guest:blocked', guest, 'beta_sign_in_required'],
		['bob:blocked', bob, 'beta_invite_required'],
	]) {
		const response = await app.request(`/api/agents/chat/${id}`, { method: 'POST', headers: auth });
		assert.equal(response.status, 403);
		assert.equal((await response.json()).error.type, code, 'the production admission middleware must run');
	}
	const status = await (await app.request('/api/chat-route', { headers: alice })).json();
	assert.deepEqual(status, { kind: 'operator', openai: true, openrouter: true, operatorOnly: true });
	for (const [method, path] of [
		['PUT', '/api/openai-key'], ['POST', '/api/openrouter/connect'], ['GET', '/api/openrouter/callback?code=fixture'],
	]) {
		const response = await app.request(path, { method, headers: alice });
		assert.equal(response.status, 403, 'the production app must disable hosted key connections');
		assert.equal((await response.json()).error.type, 'learner_keys_unavailable');
	}
	const cleared = await app.request('/api/openai-key', { method: 'DELETE', headers: alice });
	assert.equal(cleared.status, 200);
	assert.deepEqual(await cleared.json(), { kind: 'operator', openai: false, openrouter: true, operatorOnly: true });

	async function replyFor(id) {
		const chat = init(Chat, { id });
		return chat.read(await chat.dispatch('Synthetic wiring check.'), { signal: AbortSignal.timeout(7_000) });
	}
	async function readableFailure(id, auth, message) {
		const receipt = await init(Chat, { id }).dispatch('Synthetic recovered request.');
		const client = createFlueClient({
			url: `https://fixture.invalid/api/agents/chat/${id}`, headers: auth,
			fetch: (input, options) => app.fetch(new Request(input, options)),
		});
		await assert.rejects(client.read(receipt.submissionId, { signal: AbortSignal.timeout(7_000) }), (error) => {
			assert.ok(error instanceof FlueExecutionError);
			assert.equal(chatTurnErrorMessage(error), message);
			return true;
		});
	}
	await readableFailure('bob:recovered', bob, betaInviteError.message);
	await assert.rejects(replyFor('bob:direct'), AgentRunError);
	await assert.rejects(replyFor('guest:direct'), AgentRunError);
	assert.equal(fake.calls(), 0, 'direct dispatch cannot bypass production model-guard registration');
	if (paused) {
		const response = await app.request('/api/agents/chat/alice:paused', { method: 'POST', headers: alice });
		assert.equal(response.status, 503);
		assert.equal((await response.json()).error.type, 'beta_paused');
		await readableFailure('alice:recovered', alice, betaPausedError.message);
		for (const id of ['alice:direct', 'former-guest:restored']) {
			await assert.rejects(replyFor(id), AgentRunError);
		}
		assert.equal(fake.calls(), 0);
	} else {
		for (const id of ['alice:direct', 'former-guest:restored']) {
			assert.equal((await replyFor(id)).text, 'Synthetic beta reply.');
		}
		assert.equal(fake.calls(), 2);
	}
	for (const path of ['/api/agents/chat/alice:direct', '/api/agents/chat/former-guest:restored']) {
		const response = await app.request(path, { headers: alice });
		assert.equal(response.status, 200, 'owned history remains readable even when execution is paused');
	}
	assert.equal((await app.request('/api/agents/chat/alice:direct', { headers: bob })).status, 403);
	assert.equal((await app.request('/api/agents/chat/alice:direct/abort', { method: 'POST', headers: alice })).status, 200);
	console.log(`Production beta wiring passed (${paused ? 'paused' : 'active'}); synthetic provider calls: ${fake.calls()}.`);
} finally {
	await runtime?.stop();
	await credentials.close();
	await authDb.close();
	globalThis.fetch = originalFetch;
	process.chdir(cwd);
	await rm(directory, { recursive: true, force: true });
}
