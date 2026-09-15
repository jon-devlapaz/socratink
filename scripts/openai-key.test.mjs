import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { Hono } from 'hono';
import { appConfig } from '../src/config/app.config.ts';
import { openCredentialStore } from '../src/server/credential-runtime.ts';
import { createSqliteCredentialDb } from '../src/server/credential-db.ts';
import { createCredentialStore } from '../src/server/credentials.ts';
import { invalidOpenaiKeyError, mountOpenaiKeyRoutes } from '../src/server/openai-key.ts';
import { createRateLimiter } from '../src/server/rate-limit.ts';
import { mintSessionUserId } from '../src/server/session.ts';
import { cookiePairFromResponse } from './session-fixture.mjs';

const testSecret = 'test-openai-key-session-secret';
const fixtureKey = 'sk-fixture-openai';

async function withApp(run) {
	const directory = await mkdtemp(join(tmpdir(), 'socratink-openai-key-'));
	const store = createCredentialStore({
		secret: 'test-openai-key-credentials-secret',
		db: createSqliteCredentialDb(join(directory, 'credentials.db')),
	});
	const app = new Hono();
	app.post(appConfig.sessionPath, async (context) => {
		const userId = await mintSessionUserId(context, testSecret);
		return context.json({ userId });
	});
	mountOpenaiKeyRoutes(app, {
		secret: testSecret,
		rateLimiter: createRateLimiter({ windowMs: 1_000, max: 120 }),
		store,
	});
	try {
		return await run(app, store);
	} finally {
		await store.close();
		await rm(directory, { recursive: true, force: true });
	}
}

async function mintCookie(app) {
	const response = await app.request(appConfig.sessionPath, { method: 'POST' });
	assert.equal(response.status, 200);
	const body = await response.json();
	return { userId: body.userId, cookie: cookiePairFromResponse(response) };
}

test('hosted credential store fails closed without CREDENTIALS_SECRET', () => {
	assert.throws(
		() => openCredentialStore({ NODE_ENV: 'production' }),
		/CREDENTIALS_SECRET is required for hosted credential encryption/,
	);
});

test('openai key routes require a session and never echo the secret', async () => {
	await withApp(async (app) => {
		const missing = await app.request(appConfig.openaiKeyPath);
		assert.equal(missing.status, 401);

		const { cookie } = await mintCookie(app);
		const empty = await app.request(appConfig.openaiKeyPath, {
			headers: { cookie },
		});
		assert.equal(empty.status, 200);
		assert.deepEqual(await empty.json(), { connected: false });

		const invalid = await app.request(appConfig.openaiKeyPath, {
			method: 'PUT',
			headers: { cookie, 'content-type': 'application/json' },
			body: JSON.stringify({ apiKey: '   ' }),
		});
		assert.equal(invalid.status, 400);
		assert.deepEqual(await invalid.json(), { error: invalidOpenaiKeyError });

		const connected = await app.request(appConfig.openaiKeyPath, {
			method: 'PUT',
			headers: { cookie, 'content-type': 'application/json' },
			body: JSON.stringify({ apiKey: fixtureKey }),
		});
		assert.equal(connected.status, 200);
		const connectedBody = await connected.json();
		assert.deepEqual(connectedBody, { connected: true });
		assert.equal(JSON.stringify(connectedBody).includes(fixtureKey), false);

		const status = await app.request(appConfig.openaiKeyPath, { headers: { cookie } });
		assert.deepEqual(await status.json(), { connected: true });

		const { cookie: otherCookie } = await mintCookie(app);
		const other = await app.request(appConfig.openaiKeyPath, { headers: { cookie: otherCookie } });
		assert.deepEqual(await other.json(), { connected: false });

		const cleared = await app.request(appConfig.openaiKeyPath, {
			method: 'DELETE',
			headers: { cookie },
		});
		assert.deepEqual(await cleared.json(), { connected: false });
	});
});

test('paste-key UI lives on Chat chrome and does not keep the secret in the browser', async () => {
	const html = await readFile(new URL('../src/ui/index.html', import.meta.url), 'utf8');
	const script = await readFile(new URL('../src/ui/openai-key.ts', import.meta.url), 'utf8');
	const surface = await readFile(new URL('../src/ui/chat-surface.ts', import.meta.url), 'utf8');
	const chat = await readFile(new URL('../src/agents/chat.ts', import.meta.url), 'utf8');
	assert.match(html, /id="openai-key"/);
	assert.match(html, /OpenAI platform API key/);
	assert.doesNotMatch(html, /Log in with ChatGPT/);
	assert.match(script, /openaiKeyPath/);
	assert.match(script, /method: 'PUT'/);
	assert.match(script, /method: 'DELETE'/);
	assert.doesNotMatch(script, /localStorage/);
	assert.match(surface, /mountOpenaiKey/);
	assert.match(chat, /capturedChatModelSpecifier/);
	assert.match(chat, /useModel/);

	const provider = await readFile(new URL('../src/server/provider.ts', import.meta.url), 'utf8');
	assert.match(provider, /openaiProvider/);
	assert.match(provider, /store: credentialStore/);
	assert.doesNotMatch(provider, /Models\.login/);
	assert.doesNotMatch(provider, /OPENAI_API_KEY/);
	assert.doesNotMatch(provider, /process\.env\.\w+\s*=/);
});
