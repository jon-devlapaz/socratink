import assert from 'node:assert/strict';
import test from 'node:test';
import { Hono } from 'hono';
import { setSignedCookie } from 'hono/cookie';
import { appConfig } from '../src/config/app.config.ts';
import { encodeOpenRouterPkceCookie, openRouterPkceCookieName } from '../src/config/openrouter.ts';
import { createSqliteAuthDb } from '../src/server/auth-db.ts';
import { requireSignedSession } from '../src/server/chat-access.ts';
import { mountChatRoute } from '../src/server/chat-route.ts';
import { createSqliteCredentialDb } from '../src/server/credential-db.ts';
import { createCredentialStore } from '../src/server/credentials.ts';
import { mountOpenaiKeyRoutes } from '../src/server/openai-key.ts';
import { mountOpenrouterRoutes } from '../src/server/openrouter.ts';
import { createRateLimiter } from '../src/server/rate-limit.ts';
import { writeSessionCookie } from '../src/server/session.ts';
import { mergeCookies } from './session-fixture.mjs';

const secret = 'beta-credentials-fixture-secret';

async function withApp(run) {
	const authDb = createSqliteAuthDb(':memory:');
	const store = createCredentialStore({ secret, db: createSqliteCredentialDb(':memory:') });
	let writes = 0;
	const guardedStore = {
		...store,
		async updateUserKey(params) { writes += 1; return store.updateUserKey(params); },
	};
	const app = new Hono();
	app.post('/fixture/:id/:kind', async (context) => {
		const id = context.req.param('id');
		await writeSessionCookie(context, id, secret, {}, context.req.param('kind'));
		await setSignedCookie(context, openRouterPkceCookieName,
			encodeOpenRouterPkceCookie(id, 'fixture-code-verifier'), secret, { path: '/' });
		return context.json({ ok: true });
	});
	const signed = requireSignedSession({ secret, authDb, rateLimiter: createRateLimiter({ windowMs: 60_000, max: 120 }) });
	const options = { signed, store: guardedStore, operatorOnly: true };
	mountOpenaiKeyRoutes(app, options);
	mountOpenrouterRoutes(app, { ...options, secret, oauth: { tokenUrl: 'https://fixture.invalid/token' } });
	mountChatRoute(app, options);
	async function cookie(id = 'alice', kind = 'registered') {
		return mergeCookies(await app.request(`/fixture/${id}/${kind}`, { method: 'POST' }), '');
	}
	try {
		await run({ app, store, cookie, writes: () => writes });
	} finally {
		await store.close();
		await authDb.close();
	}
}

for (const [method, path, body] of [
	['PUT', appConfig.openaiKeyPath, { apiKey: 'synthetic-unused-key' }],
	['POST', appConfig.openrouterConnectPath],
	['GET', `${appConfig.openrouterCallbackPath}?code=synthetic-code`],
]) {
	test(`hosted ${method} ${path} refuses new keys before storage or exchange`, async (t) => {
		let exchanges = 0;
		t.mock.method(globalThis, 'fetch', async () => {
			exchanges += 1;
			return Response.json({ key: 'synthetic-minted-key' });
		});
		await withApp(async ({ app, cookie, writes }) => {
			for (const kind of ['registered', 'guest']) {
				const response = await app.request(path, {
					method, headers: { cookie: await cookie(kind, kind), 'content-type': 'application/json' },
					...(body ? { body: JSON.stringify(body) } : {}),
				});
				assert.equal(response.status, 403);
				assert.equal((await response.json()).error.type, 'learner_keys_unavailable');
			}
			assert.equal(writes(), 0);
			assert.equal(exchanges, 0);
			assert.equal((await app.request(path, { method })).status, 401);
		});
	});
}

test('hosted status reports owned stored keys without activating them, and permits their removal', async () => {
	await withApp(async ({ app, store, cookie, writes }) => {
		for (const name of ['openai', 'openrouter']) {
			await store.updateUserKey({ userId: 'alice', name, value: `synthetic-${name}-legacy` });
		}
		const headers = { cookie: await cookie() };
		const status = async (requestHeaders = headers) =>
			(await app.request(appConfig.chatRoutePath, { headers: requestHeaders })).json();
		assert.deepEqual(await status(), { kind: 'operator', openai: true, openrouter: true, operatorOnly: true });
		const otherHeaders = { cookie: await cookie('bob') };
		assert.deepEqual(await status(otherHeaders), { kind: 'operator', openai: false, openrouter: false, operatorOnly: true });
		await app.request(appConfig.openaiKeyPath, { method: 'DELETE', headers: otherHeaders });
		assert.equal(await store.hasUserKey({ userId: 'alice', name: 'openai' }), true);
		for (const [path, name] of [[appConfig.openaiKeyPath, 'openai'], [appConfig.openrouterPath, 'openrouter']]) {
			const response = await app.request(path, { method: 'DELETE', headers });
			assert.equal(response.status, 200);
			const body = await response.json();
			assert.equal(body.kind, 'operator');
			assert.equal(body.operatorOnly, true);
			assert.equal(body[name], false);
			assert.equal(await store.hasUserKey({ userId: 'alice', name }), false);
		}
		assert.equal(writes(), 0, 'reading status or deleting must not create credentials');
	});
});
