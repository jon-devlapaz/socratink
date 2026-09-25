import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { Hono } from 'hono';
import { appConfig } from '../src/config/app.config.ts';
import { operatorChatStatus } from '../src/config/chat-model.ts';
import { createSqliteAuthDb } from '../src/server/auth-db.ts';
import { mountChatRoute } from '../src/server/chat-route.ts';
import { openCredentialStore } from '../src/server/credential-runtime.ts';
import { createSqliteCredentialDb } from '../src/server/credential-db.ts';
import { createCredentialStore } from '../src/server/credentials.ts';
import { requireSignedSession } from '../src/server/chat-access.ts';
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
	const authDb = createSqliteAuthDb(':memory:');
	const app = new Hono();
	const rateLimiter = createRateLimiter({ windowMs: 1_000, max: 120 });
	app.post(appConfig.sessionPath, async (context) => {
		const userId = await mintSessionUserId(context, testSecret, {}, authDb);
		return context.json({ userId });
	});
	const signed = requireSignedSession({ secret: testSecret, rateLimiter, authDb });
	mountOpenaiKeyRoutes(app, { signed, store });
	mountChatRoute(app, { signed, store });
	try {
		return await run(app, store);
	} finally {
		await store.close();
		await authDb.close();
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
		const missing = await app.request(appConfig.chatRoutePath);
		assert.equal(missing.status, 401);

		const { cookie } = await mintCookie(app);
		const empty = await app.request(appConfig.chatRoutePath, {
			headers: { cookie },
		});
		assert.equal(empty.status, 200);
		assert.deepEqual(await empty.json(), operatorChatStatus);

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
		assert.deepEqual(connectedBody, { kind: 'openai', openai: true, openrouter: false });
		assert.equal(JSON.stringify(connectedBody).includes(fixtureKey), false);

		const status = await app.request(appConfig.chatRoutePath, { headers: { cookie } });
		assert.deepEqual(await status.json(), { kind: 'openai', openai: true, openrouter: false });

		const { cookie: otherCookie } = await mintCookie(app);
		const other = await app.request(appConfig.chatRoutePath, { headers: { cookie: otherCookie } });
		assert.deepEqual(await other.json(), operatorChatStatus);

		const cleared = await app.request(appConfig.openaiKeyPath, {
			method: 'DELETE',
			headers: { cookie },
		});
		assert.deepEqual(await cleared.json(), operatorChatStatus);
	});
});
