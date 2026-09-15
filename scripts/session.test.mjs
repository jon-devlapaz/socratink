import assert from 'node:assert/strict';
import test from 'node:test';
import { Hono } from 'hono';
import { appConfig } from '../src/config/app.config.ts';
import {
	chatConversationIdFromPath,
	conversationBelongsToUser,
	isSessionUserId,
	namespacedConversationId,
	resolveSessionSecret,
	sessionCookieName,
	userIdFromConversationId,
} from '../src/config/session.ts';
import {
	forbiddenChatError,
	rateLimitedChatError,
	requireChatSession,
	unauthorizedChatError,
} from '../src/server/chat-access.ts';
import { createRateLimiter } from '../src/server/rate-limit.ts';
import { mintSessionUserId } from '../src/server/session.ts';
import { cookiePairFromResponse } from './session-fixture.mjs';

const testSecret = 'test-session-secret-for-hmac-sha256';

function createTestApp(options = {}) {
	const limiter = createRateLimiter({
		windowMs: options.windowMs ?? 1_000,
		max: options.max ?? 120,
		clock: options.clock,
	});
	const app = new Hono();
	app.post(appConfig.sessionPath, async (context) => {
		const userId = await mintSessionUserId(context, testSecret);
		return context.json({ userId });
	});
	app.use(
		`${appConfig.chatAgentPath}/*`,
		requireChatSession({ secret: testSecret, rateLimiter: limiter }),
	);
	app.all(`${appConfig.chatAgentPath}/*`, (context) => context.json({ ok: true }));
	return app;
}

async function mintCookie(app) {
	const response = await app.request(appConfig.sessionPath, { method: 'POST' });
	assert.equal(response.status, 200);
	const body = await response.json();
	return { userId: body.userId, cookie: cookiePairFromResponse(response) };
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

test('chat routes reject a missing session with 401', async () => {
	const app = createTestApp();
	const response = await app.request(`${appConfig.chatAgentPath}/user-a:nonce`);
	assert.equal(response.status, 401);
	assert.deepEqual(await response.json(), { error: unauthorizedChatError });
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
