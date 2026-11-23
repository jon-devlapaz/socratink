import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { Hono } from 'hono';
import { appConfig } from '../src/config/app.config.ts';
import { createSqliteAuthDb } from '../src/server/auth-db.ts';
import { requireChatSession } from '../src/server/chat-access.ts';
import { mountConversationHistory } from '../src/server/conversation-history-route.ts';
import {
	conversationListLimit,
	createConversationIndex,
	createPostgresConversationIndex,
	createSqliteConversationIndex,
} from '../src/server/conversation-index.ts';
import { createRateLimiter } from '../src/server/rate-limit.ts';
import { mintSessionUserId, readSession, writeSessionCookie } from '../src/server/session.ts';
import { startDisposablePostgres } from './durable-postgres-fixture.mjs';

const secret = 'synthetic-conversation-index-secret-0123456789abcdef';
let postgres;
before(async () => { if (process.env.DURABLE_TEST_POSTGRES === '1') postgres = await startDisposablePostgres(); });
after(async () => { await postgres?.stop(); });

const backends = [
	['sqlite', () => createSqliteConversationIndex(':memory:')],
	['postgres', () => createConversationIndex({ kind: 'postgres', connectionString: postgres.connectionString })],
];
const at = (minute) => new Date(Date.UTC(2026, 10, 22, 12, minute));

for (const [name, open] of backends) {
	const skip = name === 'postgres' && process.env.DURABLE_TEST_POSTGRES !== '1' ? 'set DURABLE_TEST_POSTGRES=1' : false;

	test(`${name}: the first admitted message names the conversation; later ones mark it used`, { skip }, async () => {
		const index = open();
		const id = `user-${name}-a:one`;
		await index.recordAdmitted(id, '  Why is the\nsky blue?  ', at(1));
		await index.recordAdmitted(`user-${name}-a:two`, 'Second topic', at(2));
		await index.recordAdmitted(id, 'A later message', at(3));
		assert.deepEqual(await index.list([`user-${name}-a`]), [
			{ id, title: 'Why is the sky blue?', updatedAt: at(3).toISOString() },
			{ id: `user-${name}-a:two`, title: 'Second topic', updatedAt: at(2).toISOString() },
		]);
		await index.close();
	});

	test(`${name}: lists only the given owners, newest first, and at most the limit`, { skip }, async () => {
		const index = open();
		const [learner, alias, other] = [`learner-${name}`, `guest-${name}`, `other-${name}`];
		await index.recordAdmitted(`${learner}:one`, 'Mine', at(1));
		await index.recordAdmitted(`${alias}:two`, 'From my guest session', at(2));
		await index.recordAdmitted(`${other}:three`, 'Someone else', at(3));
		assert.deepEqual((await index.list([learner, alias])).map((row) => row.title), ['From my guest session', 'Mine']);
		assert.deepEqual(await index.list([]), []);

		for (let minute = 0; minute < conversationListLimit + 3; minute += 1) {
			await index.recordAdmitted(`${learner}:bulk-${minute}`, `Topic ${minute}`, at(10 + minute));
		}
		const rows = await index.list([learner]);
		assert.equal(rows.length, conversationListLimit);
		assert.equal(rows[0].title, `Topic ${conversationListLimit + 2}`);
		await index.close();
	});

	test(`${name}: blank text and ids without an owner record nothing`, { skip }, async () => {
		const index = open();
		await index.recordAdmitted(`blank-${name}:one`, '   ', at(1));
		await index.recordAdmitted('no-owner', 'Lost', at(1));
		assert.deepEqual(await index.list([`blank-${name}`, 'no-owner', '']), []);
		await index.close();
	});
}

function cookiePair(response) {
	const header = response.headers.getSetCookie?.()[0] ?? response.headers.get('set-cookie') ?? '';
	return header.split(';')[0];
}

function historyApp({ index, authDb, chatStatus }) {
	const app = new Hono();
	const rateLimiter = createRateLimiter({ windowMs: 1_000, max: 120 });
	app.post(appConfig.sessionPath, async (context) => context.json({ userId: await mintSessionUserId(context, secret, {}, authDb) }));
	// Test-only stand-in for the OAuth signup: the guest id becomes an account.
	app.post('/test/register', async (context) => {
		const userId = (await readSession(context, secret, authDb))?.userId;
		await authDb.createUser(userId, `${userId}@example.com`);
		await writeSessionCookie(context, userId, secret, {}, 'registered');
		return context.json({ userId });
	});
	app.use(`${appConfig.chatAgentPath}/*`, requireChatSession({ secret, rateLimiter, authDb }));
	mountConversationHistory(app, { secret, rateLimiter, authDb, index });
	app.post(`${appConfig.chatAgentPath}/:id`, async (context) => {
		await context.req.json();
		return context.json({}, chatStatus());
	});
	return app;
}

async function guest(app) {
	const response = await app.request(appConfig.sessionPath, { method: 'POST' });
	return { userId: (await response.json()).userId, cookie: cookiePair(response) };
}

const send = (app, learner, nonce, body) => app.request(`${appConfig.chatAgentPath}/${learner.userId}:${nonce}`, {
	method: 'POST', headers: { cookie: learner.cookie, 'content-type': 'application/json' },
	body: JSON.stringify({ kind: 'user', body }),
});
const listFor = async (app, learner) => {
	const response = await app.request(appConfig.conversationsPath, { headers: learner ? { cookie: learner.cookie } : {} });
	return { status: response.status, cache: response.headers.get('cache-control'), body: await response.json() };
};

test('route: only admitted messages are recorded, and only the owner and aliases can list them', async () => {
	const index = createSqliteConversationIndex(':memory:');
	const authDb = createSqliteAuthDb(':memory:');
	let status = 400;
	const app = historyApp({ index, authDb, chatStatus: () => status });
	const learner = await guest(app);
	const earlier = await guest(app);
	const stranger = await guest(app);

	assert.equal((await send(app, learner, 'one', 'Refused first words')).status, 400);
	status = 409;
	assert.equal((await send(app, learner, 'one', 'Busy words')).status, 409);
	assert.deepEqual((await listFor(app, learner)).body, { conversations: [] });

	status = 202;
	assert.equal((await send(app, learner, 'one', 'My real question')).status, 202);
	assert.equal((await send(app, earlier, 'two', 'Asked before signing in')).status, 202);
	assert.equal((await send(app, learner, `${stranger.userId}-not-mine`, 'x')).status, 202);
	assert.equal((await app.request(`${appConfig.chatAgentPath}/${stranger.userId}:three`, {
		method: 'POST', headers: { cookie: learner.cookie, 'content-type': 'application/json' },
		body: JSON.stringify({ kind: 'user', body: 'Planted in another learner' }),
	})).status, 403);

	const registered = await app.request('/test/register', { method: 'POST', headers: { cookie: learner.cookie } });
	learner.cookie = cookiePair(registered);
	await authDb.createAlias(earlier.userId, learner.userId);
	const listed = await listFor(app, learner);
	assert.equal(listed.status, 200);
	assert.equal(listed.cache, 'no-store');
	assert.deepEqual(listed.body.conversations.map((row) => row.title).sort(),
		['Asked before signing in', 'My real question', 'x'].sort());
	assert.deepEqual((await listFor(app, stranger)).body, { conversations: [] });
	assert.equal((await listFor(app, undefined)).status, 401);
	await index.close();
	await authDb.close();
});

test('route: a failing index does not fail the turn', async () => {
	const authDb = createSqliteAuthDb(':memory:');
	const failing = { recordAdmitted: async () => { throw new Error('index down'); }, list: async () => [], close: async () => {} };
	const app = historyApp({ index: failing, authDb, chatStatus: () => 202 });
	const learner = await guest(app);
	const errors = [];
	const original = console.error;
	console.error = (line) => errors.push(line);
	try {
		assert.equal((await send(app, learner, 'one', 'A private question')).status, 202);
	} finally {
		console.error = original;
	}
	assert.equal(errors.length, 1);
	assert.match(errors[0], /conversation_index_failed/);
	assert.doesNotMatch(errors[0], /private question/);
	await authDb.close();
});

test('postgres index shares one table setup between concurrent first calls and retries a failed one', async () => {
	let setups = 0;
	const index = createPostgresConversationIndex({
		async query(text) {
			if (/CREATE TABLE/.test(text) && ++setups === 1) throw new Error('Authentication timed out');
			return { rows: [] };
		},
		async end() {},
	});
	const first = await Promise.allSettled([index.list(['owner']), index.list(['owner'])]);
	assert.deepEqual(first.map((result) => result.status), ['rejected', 'rejected']);
	assert.equal(setups, 1);
	assert.deepEqual(await index.list(['owner']), []);
	assert.deepEqual(await index.list(['owner']), []);
	assert.equal(setups, 2);
});
