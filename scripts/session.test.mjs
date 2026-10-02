import assert from 'node:assert/strict';
import test from 'node:test';
import { Hono } from 'hono';
import { appConfig } from '../src/config/app.config.ts';
import {
	chatConversationIdFromPath,
	conversationBelongsToUser,
	encodeSessionCookieValue,
	generateSessionNonce,
	isSessionUserId,
	namespacedConversationId,
	parseSessionCookieValue,
	resolveSessionSecret,
	sessionCookieName,
	userIdFromConversationId,
} from '../src/config/session.ts';
import { createSqliteAuthDb } from '../src/server/auth-db.ts';
import {
	forbiddenChatError,
	rateLimitedChatError,
	requireChatSession,
	unauthorizedChatError,
} from '../src/server/chat-access.ts';
import { createRateLimiter } from '../src/server/rate-limit.ts';
import {
	mintSessionUserId,
	readSession,
	writeSessionCookie,
} from '../src/server/session.ts';
import { cookiePairFromResponse } from './session-fixture.mjs';

const testSecret = 'test-session-secret-for-hmac-sha256';

function createTestApp(options = {}) {
	const authDb = options.authDb ?? createSqliteAuthDb(':memory:');
	const limiter = createRateLimiter({
		windowMs: options.windowMs ?? 1_000,
		max: options.max ?? 120,
		clock: options.clock,
	});
	const app = new Hono();
	app.post(appConfig.sessionPath, async (context) => {
		const userId = await mintSessionUserId(context, testSecret, {}, authDb);
		return context.json({ userId });
	});
	app.use(
		`${appConfig.chatAgentPath}/*`,
		requireChatSession({ secret: testSecret, rateLimiter: limiter, authDb }),
	);
	app.all(`${appConfig.chatAgentPath}/*`, (context) => context.json({ ok: true }));
	return app;
}

async function withAuthDb(run) {
	const authDb = createSqliteAuthDb(':memory:');
	try {
		return await run(authDb);
	} finally {
		await authDb.close();
	}
}

async function mintCookie(app) {
	const response = await app.request(appConfig.sessionPath, { method: 'POST' });
	assert.equal(response.status, 200);
	const body = await response.json();
	return { userId: body.userId, cookie: cookiePairFromResponse(response) };
}

// The Set-Cookie pair is `name=payload.signature`; Hono signs at the last dot.
function decodedPayload(cookiePair) {
	const encoded = cookiePair.slice(cookiePair.indexOf('=') + 1);
	return parseSessionCookieValue(encoded.slice(0, encoded.lastIndexOf('.')));
}

test('fails closed in production, Northflank, or Vercel when SESSION_SECRET is missing', () => {
	for (const environment of [
		{ NODE_ENV: 'production' },
		{ NF_PROJECT_ID: 'socratink' },
		{ VERCEL: '1' },
	]) {
		assert.throws(
			() => resolveSessionSecret(environment),
			/SESSION_SECRET is required for hosted learner sessions/,
		);
	}
});

test('uses SESSION_SECRET when configured and a local secret otherwise', () => {
	assert.equal(resolveSessionSecret({ SESSION_SECRET: ' hosted-secret ' }), 'hosted-secret');
	assert.equal(resolveSessionSecret({}), 'socratink-local-session-secret');
});

test('conversation ids are userId:nonce and reject foreign prefixes', () => {
	assert.equal(isSessionUserId('user-a'), true);
	assert.equal(isSessionUserId('user-a:nonce'), false);
	assert.equal(isSessionUserId(''), false);
	assert.equal(namespacedConversationId('user-a', 'nonce-1'), 'user-a:nonce-1');
	assert.equal(userIdFromConversationId('user-a:nonce-1'), 'user-a');
	assert.equal(userIdFromConversationId('user-ab:nonce-1'), 'user-ab');
	assert.equal(userIdFromConversationId('user-a:'), undefined);
	assert.equal(userIdFromConversationId('user-a'), undefined);
	assert.equal(userIdFromConversationId(undefined), undefined);
	assert.equal(conversationBelongsToUser('user-a:nonce-1', 'user-a'), true);
	assert.equal(conversationBelongsToUser('user-a:', 'user-a'), false);
	assert.equal(conversationBelongsToUser('user-a', 'user-a'), false);
	assert.equal(conversationBelongsToUser('user-ab:nonce-1', 'user-a'), false);
	assert.equal(conversationBelongsToUser('user-b:nonce-1', 'user-a'), false);
	assert.equal(
		chatConversationIdFromPath(`${appConfig.chatAgentPath}/b8a5dac1-943b-4f16-b1b7-5216ac87d6eb/stream`),
		'b8a5dac1-943b-4f16-b1b7-5216ac87d6eb',
	);
	assert.equal(
		chatConversationIdFromPath(
			`${appConfig.chatAgentPath}/${encodeURIComponent('user-a:nonce')}/stream`,
		),
		'user-a:nonce',
	);
	assert.equal(chatConversationIdFromPath(`${appConfig.chatAgentPath}/`), undefined);
});

test('conversation ids honor aliases and ignore malformed alias entries', () => {
	assert.equal(conversationBelongsToUser('guest-a:nonce-1', 'durable-b', ['guest-a']), true);
	assert.equal(conversationBelongsToUser('durable-b:nonce-1', 'durable-b', ['guest-a']), true);
	assert.equal(conversationBelongsToUser('guest-a:nonce-1', 'durable-b', ['other-guest']), false);
	assert.equal(conversationBelongsToUser('guest-a:nonce-1', 'durable-b', []), false);
	assert.equal(conversationBelongsToUser('a:b:c', 'user-x', ['a:b']), false);
	assert.equal(conversationBelongsToUser(':x', 'user-x', ['']), false);
});

test('rate limiter uses the injected clock and counter', () => {
	let now = 0;
	const limiter = createRateLimiter({
		windowMs: 1_000,
		max: 2,
		clock: { now: () => now },
	});
	assert.equal(limiter.consume('user-a').ok, true);
	assert.equal(limiter.consume('user-a').ok, true);
	const limited = limiter.consume('user-a');
	assert.equal(limited.ok, false);
	if (!limited.ok) assert.equal(limited.retryAfterMs, 1_000);
	assert.equal(limiter.consume('user-b').ok, true);
	now = 1_000;
	assert.equal(limiter.consume('user-a').ok, true);
});

test('chat routes reject a foreign conversation id with 403', async () => {
	const app = createTestApp();
	const { cookie, userId } = await mintCookie(app);
	const foreign = await app.request(
		`${appConfig.chatAgentPath}/${encodeURIComponent('other-user:nonce')}`,
		{ headers: { cookie } },
	);
	assert.equal(foreign.status, 403);
	assert.deepEqual(await foreign.json(), { error: forbiddenChatError });

	const owned = await app.request(
		`${appConfig.chatAgentPath}/${encodeURIComponent(`${userId}:nonce`)}`,
		{ headers: { cookie } },
	);
	assert.equal(owned.status, 200);
	assert.deepEqual(await owned.json(), { ok: true });

	const missingId = await app.request(`${appConfig.chatAgentPath}/`, { headers: { cookie } });
	assert.equal(missingId.status, 403);
	assert.deepEqual(await missingId.json(), { error: forbiddenChatError });

	const unnamespaced = await app.request(`${appConfig.chatAgentPath}/bare-id`, {
		headers: { cookie },
	});
	assert.equal(unnamespaced.status, 403);
	assert.deepEqual(await unnamespaced.json(), { error: forbiddenChatError });
});

test('chat routes rate-limit a session with a fake clock', async () => {
	let now = 0;
	const app = createTestApp({ max: 2, clock: { now: () => now } });
	const { cookie, userId } = await mintCookie(app);
	const path = `${appConfig.chatAgentPath}/${encodeURIComponent(`${userId}:nonce`)}`;
	assert.equal((await app.request(path, { headers: { cookie } })).status, 200);
	assert.equal((await app.request(path, { headers: { cookie } })).status, 200);
	const limited = await app.request(path, { headers: { cookie } });
	assert.equal(limited.status, 429);
	assert.equal(limited.headers.get('Retry-After'), '1');
	assert.deepEqual(await limited.json(), { error: rateLimitedChatError });
	now = 1_000;
	assert.equal((await app.request(path, { headers: { cookie } })).status, 200);
});

test('signed session cookie is HttpOnly and named socratink-session', async () => {
	const app = createTestApp();
	const response = await app.request(appConfig.sessionPath, { method: 'POST' });
	const header =
		(typeof response.headers.getSetCookie === 'function' ? response.headers.getSetCookie()[0] : undefined) ??
		response.headers.get('set-cookie');
	assert.ok(header);
	assert.match(header, new RegExp(`^${sessionCookieName}=`));
	assert.match(header, /HttpOnly/i);
	assert.doesNotMatch(header, /Secure/i);
});

test('session cookie payload is a versioned userId plus random nonce', () => {
	const nonce = generateSessionNonce();
	assert.match(nonce, /^[0-9a-f]{32}$/);
	assert.notEqual(generateSessionNonce(), nonce);

	const guest = { userId: 'user-a', kind: 'guest', nonce };
	assert.deepEqual(parseSessionCookieValue(encodeSessionCookieValue(guest)), guest);
	const registered = { userId: 'user-a', kind: 'registered', nonce };
	assert.deepEqual(parseSessionCookieValue(encodeSessionCookieValue(registered)), registered);

	// User ids with dots survive the last-dot nonce split.
	const dotted = { userId: 'a.b', kind: 'guest', nonce };
	assert.deepEqual(parseSessionCookieValue(encodeSessionCookieValue(dotted)), dotted);

	// Malformed payloads never authenticate.
	assert.equal(parseSessionCookieValue(undefined), undefined);
	assert.equal(parseSessionCookieValue(false), undefined);
	assert.equal(parseSessionCookieValue(''), undefined);
	assert.equal(parseSessionCookieValue('user-a'), undefined);
	assert.equal(parseSessionCookieValue('1.g.user-a'), undefined);
	assert.equal(parseSessionCookieValue('2.g.user-a.' + nonce), undefined);
	assert.equal(parseSessionCookieValue('1.x.user-a.' + nonce), undefined);
	assert.equal(parseSessionCookieValue('1.g.user-a:nonce.' + nonce), undefined);
	assert.equal(parseSessionCookieValue('1.g.user-a.short'), undefined);
	assert.equal(parseSessionCookieValue('1.g..' + nonce), undefined);
});

test('minted guest cookie carries a guest payload and reuses the session id', async () => {
	await withAuthDb(async (authDb) => {
		const app = createTestApp({ authDb });
		const first = await mintCookie(app);
		assert.deepEqual(decodedPayload(first.cookie), {
			userId: first.userId,
			kind: 'guest',
			nonce: decodedPayload(first.cookie).nonce,
		});
		assert.match(decodedPayload(first.cookie).nonce, /^[0-9a-f]{32}$/);

		const second = await app.request(appConfig.sessionPath, {
			method: 'POST',
			headers: { cookie: first.cookie },
		});
		assert.equal(second.status, 200);
		assert.equal((await second.json()).userId, first.userId);
	});
});

test('privilege change kills the previous cookie bytes and keeps the owned id', async () => {
	await withAuthDb(async (authDb) => {
		const app = createTestApp({ authDb });
		// Test-only stand-in for the OAuth callback's new-signup path: the guest
		// UUID becomes users.id and the cookie is rewritten as registered.
		app.post('/test/privilege-change', async (context) => {
			const guestUserId = (await readSession(context, testSecret, authDb))?.userId;
			if (!guestUserId) return context.json({ error: unauthorizedChatError }, 401);
			await authDb.createUser(guestUserId, `${guestUserId}@example.com`);
			await writeSessionCookie(context, guestUserId, testSecret, {}, 'registered');
			return context.json({ userId: guestUserId });
		});

		const guest = await mintCookie(app);
		const guestPayload = decodedPayload(guest.cookie);
		assert.equal(guestPayload.kind, 'guest');
		const owned = `${appConfig.chatAgentPath}/${guest.userId}:nonce`;
		assert.equal((await app.request(owned, { headers: { cookie: guest.cookie } })).status, 200);

		const rotated = await app.request('/test/privilege-change', {
			method: 'POST',
			headers: { cookie: guest.cookie },
		});
		assert.equal(rotated.status, 200);
		const rotatedCookie = cookiePairFromResponse(rotated);
		assert.notEqual(rotatedCookie, guest.cookie);
		const rotatedPayload = decodedPayload(rotatedCookie);
		assert.equal(rotatedPayload.userId, guest.userId);
		assert.equal(rotatedPayload.kind, 'registered');
		assert.notEqual(rotatedPayload.nonce, guestPayload.nonce);

		const stale = await app.request(owned, { headers: { cookie: guest.cookie } });
		assert.equal(stale.status, 401);
		assert.deepEqual(await stale.json(), { error: unauthorizedChatError });

		const fresh = await app.request(owned, { headers: { cookie: rotatedCookie } });
		assert.equal(fresh.status, 200);

		// A stale guest cookie never mints its dead id back.
		const remint = await app.request(appConfig.sessionPath, {
			method: 'POST',
			headers: { cookie: guest.cookie },
		});
		assert.equal(remint.status, 200);
		assert.notEqual((await remint.json()).userId, guest.userId);
	});
});
