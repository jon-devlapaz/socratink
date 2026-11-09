import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { Hono } from 'hono';
import { appConfig } from '../src/config/app.config.ts';
import { createSqliteAuthDb } from '../src/server/auth-db.ts';
import {
	guestTurnLimitError,
	guestTurnsHeader,
	guestTurnGateMiddleware,
} from '../src/server/guest-turns.ts';
import { mintSessionUserId, mountSessionRoutes, writeSessionCookie } from '../src/server/session.ts';
import { cookiePairFromResponse, mergeCookies } from './session-fixture.mjs';

const testSecret = 'test-session-secret-for-hmac-sha256';

async function withAuthDb(run) {
	const directory = await mkdtemp(join(tmpdir(), 'socratink-guest-turns-'));
	const filename = join(directory, 'auth.db');
	const db = createSqliteAuthDb(filename);
	try {
		return await run(db);
	} finally {
		await db.close();
		await rm(directory, { recursive: true, force: true });
	}
}

test('guest turn gate allows registered users without turn cap', async () => {
	await withAuthDb(async (authDb) => {
		const app = new Hono();
		app.post(appConfig.sessionPath, async (context) => {
			const userId = await mintSessionUserId(context, testSecret, {}, authDb);
			return context.json({ userId });
		});
		// Test-only stand-in for the OAuth callback rotation.
		app.post('/test/register', async (context) => {
			const { userId } = await context.req.json();
			await writeSessionCookie(context, userId, testSecret, {}, 'registered');
			return context.json({ userId });
		});
		app.use(
			`${appConfig.chatAgentPath}/*`,
			guestTurnGateMiddleware({ secret: testSecret, authDb }),
		);
		app.all(`${appConfig.chatAgentPath}/*`, (context) => context.json({ ok: true }));

		const sessionRes = await app.request(appConfig.sessionPath, { method: 'POST' });
		const { userId } = await sessionRes.json();

		await authDb.createUser(userId, 'registered@example.com');
		const registeredRes = await app.request('/test/register', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ userId }),
		});
		assert.equal(registeredRes.status, 200);
		const sessionCookie = cookiePairFromResponse(registeredRes);

		for (let i = 0; i < 5; i++) {
			const turnRes = await app.request(`${appConfig.chatAgentPath}/${userId}:turn-${i}`, {
				method: 'POST',
				headers: { Cookie: sessionCookie },
			});
			assert.equal(turnRes.status, 200);
			assert.equal(turnRes.headers.get(guestTurnsHeader), null);
		}
	});
});

test('guest turn gate enforces 3-turn limit for guests and increments counter', async () => {
	await withAuthDb(async (authDb) => {
		const app = new Hono();
		app.post(appConfig.sessionPath, async (context) => {
			const userId = await mintSessionUserId(context, testSecret, {}, authDb);
			return context.json({ userId });
		});
		app.use(
			`${appConfig.chatAgentPath}/*`,
			guestTurnGateMiddleware({ secret: testSecret, authDb }),
		);
		app.all(`${appConfig.chatAgentPath}/*`, (context) => context.json({ ok: true }));

		const sessionRes = await app.request(appConfig.sessionPath, { method: 'POST' });
		const { userId } = await sessionRes.json();
		let cookieHeader = cookiePairFromResponse(sessionRes);

		for (let turn = 1; turn <= 3; turn++) {
			const turnRes = await app.request(`${appConfig.chatAgentPath}/${userId}:turn-${turn}`, {
				method: 'POST',
				headers: { Cookie: cookieHeader },
			});
			assert.equal(turnRes.status, 200);
			assert.equal(turnRes.headers.get(guestTurnsHeader), String(turn));
			cookieHeader = mergeCookies(turnRes, cookieHeader);
		}

		const blockedRes = await app.request(`${appConfig.chatAgentPath}/${userId}:turn-4`, {
			method: 'POST',
			headers: { Cookie: cookieHeader },
		});
		assert.equal(blockedRes.status, 403);
		const errorBody = await blockedRes.json();
		assert.deepEqual(errorBody, { error: guestTurnLimitError });
	});
});


test('guest quota survives raw downstream responses and keeps attempt charging and exemptions', async () => {
	await withAuthDb(async (authDb) => {
		const app = new Hono();
		mountSessionRoutes(app, { secret: testSecret, authDb });
		app.use(`${appConfig.chatAgentPath}/*`, guestTurnGateMiddleware({ secret: testSecret, authDb }));
		let handled = 0;
		app.onError(() => Response.json({ error: 'Synthetic failure' }, {
			status: 500, headers: { 'Set-Cookie': 'downstream=preserved; Path=/; HttpOnly' },
		}));
		app.all(`${appConfig.chatAgentPath}/*`, (context) => {
			handled += 1;
			if (context.req.path.endsWith('/error')) throw new Error('Synthetic failure');
			return Response.json({ handled }, {
				status: context.req.path.endsWith('/rejected') ? 403 : 202,
				headers: { 'Set-Cookie': 'downstream=preserved; Path=/; HttpOnly' },
			});
		});
		const session = await app.request(appConfig.sessionPath, { method: 'POST' });
		const { userId } = await session.json();
		let cookie = cookiePairFromResponse(session);
		const path = `${appConfig.chatAgentPath}/${userId}:raw`;
		for (const [index, suffix] of ['', '/rejected', '/error'].entries()) {
			const response = await app.request(path + suffix, { method: 'POST', headers: { cookie } });
			assert.equal(response.status, suffix === '/error' ? 500 : suffix === '/rejected' ? 403 : 202);
			assert.equal(response.headers.get(guestTurnsHeader), String(index + 1));
			assert.ok(response.headers.getSetCookie().some((value) => value.startsWith('downstream=preserved;')));
			cookie = mergeCookies(response, cookie);
		}
		const blocked = await app.request(path, { method: 'POST', headers: { cookie } });
		assert.equal(blocked.status, 403);
		assert.deepEqual(await blocked.json(), { error: guestTurnLimitError });
		assert.equal(handled, 3, 'quota rejection happens before downstream admission');
		for (const [method, suffix] of [['GET', ''], ['POST', '/abort']]) {
			const response = await app.request(path + suffix, { method, headers: { cookie } });
			assert.equal(response.status, 202);
			assert.equal(response.headers.get(guestTurnsHeader), null);
			assert.equal(response.headers.getSetCookie().some((value) => value.startsWith('socratink-guest-turns=')), false);
		}
	});
});
