import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { Hono } from 'hono';
import { appConfig } from '../src/config/app.config.ts';
import { createSqliteAuthDb } from '../src/server/auth-db.ts';
import {
	clearGuestTurns,
	guestTurnLimit,
	guestTurnLimitError,
	guestTurnsCookieName,
	guestTurnsHeader,
	guestTurnGateMiddleware,
	incrementGuestTurns,
	readGuestTurnCount,
} from '../src/server/guest-turns.ts';
import { mintSessionUserId } from '../src/server/session.ts';
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
			const userId = await mintSessionUserId(context, testSecret);
			return context.json({ userId });
		});
		app.use(
			`${appConfig.chatAgentPath}/*`,
			guestTurnGateMiddleware({ secret: testSecret, authDb }),
		);
		app.all(`${appConfig.chatAgentPath}/*`, (context) => context.json({ ok: true }));

		// Mint session for a user and register them in authDb
		const sessionRes = await app.request(appConfig.sessionPath, { method: 'POST' });
		const { userId } = await sessionRes.json();
		const sessionCookie = cookiePairFromResponse(sessionRes);

		await authDb.createUser(userId, 'registered@example.com');

		// Registered user can make more than 3 turns
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
			const userId = await mintSessionUserId(context, testSecret);
			return context.json({ userId });
		});
		app.use(
			`${appConfig.chatAgentPath}/*`,
			guestTurnGateMiddleware({ secret: testSecret, authDb }),
		);
		app.all(`${appConfig.chatAgentPath}/*`, (context) => context.json({ ok: true }));

		// Mint session for guest (not registered in authDb)
		const sessionRes = await app.request(appConfig.sessionPath, { method: 'POST' });
		const { userId } = await sessionRes.json();
		let cookieHeader = cookiePairFromResponse(sessionRes);

		// Turns 1, 2, 3 succeed and increment counter header
		for (let turn = 1; turn <= 3; turn++) {
			const turnRes = await app.request(`${appConfig.chatAgentPath}/${userId}:turn-${turn}`, {
				method: 'POST',
				headers: { Cookie: cookieHeader },
			});
			assert.equal(turnRes.status, 200);
			assert.equal(turnRes.headers.get(guestTurnsHeader), String(turn));
			cookieHeader = mergeCookies(turnRes, cookieHeader);
		}

		// Turn 4 fails with 403 guest_turn_limit
		const blockedRes = await app.request(`${appConfig.chatAgentPath}/${userId}:turn-4`, {
			method: 'POST',
			headers: { Cookie: cookieHeader },
		});
		assert.equal(blockedRes.status, 403);
		const errorBody = await blockedRes.json();
		assert.deepEqual(errorBody, { error: guestTurnLimitError });
	});
});

test('guest turn gate bypasses non-POST requests and abort paths', async () => {
	await withAuthDb(async (authDb) => {
		const app = new Hono();
		app.post(appConfig.sessionPath, async (context) => {
			const userId = await mintSessionUserId(context, testSecret);
			return context.json({ userId });
		});
		app.use(
			`${appConfig.chatAgentPath}/*`,
			guestTurnGateMiddleware({ secret: testSecret, authDb }),
		);
		app.all(`${appConfig.chatAgentPath}/*`, (context) => context.json({ ok: true }));

		const sessionRes = await app.request(appConfig.sessionPath, { method: 'POST' });
		const { userId } = await sessionRes.json();
		const sessionCookie = cookiePairFromResponse(sessionRes);

		// GET request does not trigger gate
		const getRes = await app.request(`${appConfig.chatAgentPath}/${userId}:turn-1`, {
			method: 'GET',
			headers: { Cookie: sessionCookie },
		});
		assert.equal(getRes.status, 200);

		// Abort request does not trigger gate
		const abortRes = await app.request(`${appConfig.chatAgentPath}/${userId}:turn-1/abort`, {
			method: 'POST',
			headers: { Cookie: sessionCookie },
		});
		assert.equal(abortRes.status, 200);
	});
});
