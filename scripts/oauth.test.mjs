import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { Hono } from 'hono';
import { appConfig } from '../src/config/app.config.ts';
import { parseSessionCookieValue, sessionCookieName } from '../src/config/session.ts';
import { createSqliteAuthDb } from '../src/server/auth-db.ts';
import { requireChatSession } from '../src/server/chat-access.ts';
import { mountOAuthRoutes, selectVerifiedGitHubEmail } from '../src/server/oauth.ts';
import { createRateLimiter } from '../src/server/rate-limit.ts';
import { mountSessionRoutes } from '../src/server/session.ts';
import { cookiePairFromResponse, mergeCookies } from './session-fixture.mjs';

const testSecret = 'test-session-secret-for-hmac-sha256';

const testAuthConfig = {
	google: {
		clientId: 'test-google-client-id',
		clientSecret: 'test-google-client-secret',
	},
	github: {
		clientId: 'test-github-client-id',
		clientSecret: 'test-github-client-secret',
	},
	redirectBaseUrl: 'http://localhost:5173',
};

async function withAuthDb(run) {
	const directory = await mkdtemp(join(tmpdir(), 'socratink-oauth-'));
	const filename = join(directory, 'auth.db');
	const db = createSqliteAuthDb(filename);
	try {
		return await run(db);
	} finally {
		await db.close();
		await rm(directory, { recursive: true, force: true });
	}
}

test('OAuth login routes redirect with PKCE parameters and set oauth_state cookie', async () => {
	await withAuthDb(async (authDb) => {
		const app = new Hono();
		mountOAuthRoutes(app, {
			config: testAuthConfig,
			secret: testSecret,
			authDb,
			onRekey: async () => {},
		});

		// 1. Google login redirect
		const googleRes = await app.request('/api/auth/google/login');
		assert.equal(googleRes.status, 302);
		const googleLocation = googleRes.headers.get('location');
		assert.ok(googleLocation);
		const googleUrl = new URL(googleLocation);
		assert.equal(googleUrl.origin + googleUrl.pathname, 'https://accounts.google.com/o/oauth2/v2/auth');
		assert.equal(googleUrl.searchParams.get('client_id'), 'test-google-client-id');
		assert.equal(googleUrl.searchParams.get('redirect_uri'), 'http://localhost:5173/api/auth/google/callback');
		assert.equal(googleUrl.searchParams.get('response_type'), 'code');
		assert.equal(googleUrl.searchParams.get('code_challenge_method'), 'S256');
		assert.ok(googleUrl.searchParams.get('state'));
		assert.ok(googleUrl.searchParams.get('code_challenge'));

		const googleCookie = cookiePairFromResponse(googleRes);
		assert.match(googleCookie, /^socratink-oauth-state=/);

		// 2. GitHub login redirect
		const githubRes = await app.request('/api/auth/github/login');
		assert.equal(githubRes.status, 302);
		const githubLocation = githubRes.headers.get('location');
		assert.ok(githubLocation);
		const githubUrl = new URL(githubLocation);
		assert.equal(githubUrl.origin + githubUrl.pathname, 'https://github.com/login/oauth/authorize');
		assert.equal(githubUrl.searchParams.get('client_id'), 'test-github-client-id');
		assert.equal(githubUrl.searchParams.get('redirect_uri'), 'http://localhost:5173/api/auth/github/callback');
		assert.ok(githubUrl.searchParams.get('state'));
		assert.ok(githubUrl.searchParams.get('code_challenge'));
	});
});

test('OAuth callback rejects missing or invalid state parameters', async () => {
	await withAuthDb(async (authDb) => {
		const app = new Hono();
		mountOAuthRoutes(app, {
			config: testAuthConfig,
			secret: testSecret,
			authDb,
			onRekey: async () => {},
		});

		// Missing state
		const resNoState = await app.request('/api/auth/google/callback?code=some-code');
		assert.equal(resNoState.status, 302);
		assert.match(resNoState.headers.get('location') ?? '', /\/login\.html\?error=auth_failed/);

		// Provider error in query
		const resError = await app.request('/api/auth/google/callback?error=access_denied');
		assert.equal(resError.status, 302);
		assert.match(resError.headers.get('location') ?? '', /\/login\.html\?error=auth_failed/);
	});
});

function createCallbackApp(authDb, hooks = {}) {
	const app = new Hono();
	mountSessionRoutes(app, { secret: testSecret, authDb });
	mountOAuthRoutes(app, {
		config: testAuthConfig,
		secret: testSecret,
		authDb,
		onRekey: hooks.onRekey ?? (async () => {}),
	});
	app.use(
		`${appConfig.chatAgentPath}/*`,
		requireChatSession({
			secret: testSecret,
			rateLimiter: createRateLimiter({ windowMs: 60_000, max: 1000 }),
			authDb,
		}),
	);
	app.all(`${appConfig.chatAgentPath}/*`, (context) => context.json({ ok: true }));
	return app;
}

function sessionPair(cookies) {
	return cookies
		.split(';')
		.map((entry) => entry.trim())
		.find((entry) => entry.startsWith(`${sessionCookieName}=`));
}

// The Set-Cookie pair is `name=payload.signature`; Hono signs at the last dot.
function decodedPayload(cookiePair) {
	const encoded = cookiePair.slice(cookiePair.indexOf('=') + 1);
	return parseSessionCookieValue(encoded.slice(0, encoded.lastIndexOf('.')));
}

async function mintGuest(app) {
	const res = await app.request('/api/session', { method: 'POST' });
	assert.equal(res.status, 200);
	const { userId } = await res.json();
	return { userId, cookies: cookiePairFromResponse(res) };
}

async function startLogin(app, provider, cookies) {
	const res = await app.request(`/api/auth/${provider}/login`, {
		headers: { Cookie: cookies },
	});
	assert.equal(res.status, 302);
	const state = new URL(res.headers.get('location')).searchParams.get('state');
	assert.ok(state);
	return { state, cookies: mergeCookies(res, cookies) };
}

async function sessionUserId(app, cookies) {
	const res = await app.request('/api/session', { headers: { Cookie: cookies } });
	assert.equal(res.status, 200);
	return (await res.json()).userId;
}

async function sessionPayload(app, cookies) {
	const res = await app.request('/api/session', { headers: { Cookie: cookies } });
	assert.equal(res.status, 200);
	return res.json();
}

async function withMockFetch(routes, run) {
	const original = globalThis.fetch;
	globalThis.fetch = async (url) => {
		const handler = routes[String(url)];
		assert.ok(handler, `unexpected provider fetch to ${String(url)}`);
		const result = handler();
		return result instanceof Response ? result : Response.json(result);
	};
	try {
		return await run();
	} finally {
		globalThis.fetch = original;
	}
}

const googleTokenRoute = () => ({ access_token: 'test-access-token' });

test('Google callback creates a new user from the guest session and keeps the session id', async () => {
	await withAuthDb(async (authDb) => {
		const rekeys = [];
		const app = createCallbackApp(authDb, {
			onRekey: async (fromUserId, toUserId) => {
				rekeys.push([fromUserId, toUserId]);
			},
		});
		const guest = await mintGuest(app);
		const login = await startLogin(app, 'google', guest.cookies);
		await withMockFetch(
			{
				'https://oauth2.googleapis.com/token': googleTokenRoute,
				'https://openidconnect.googleapis.com/v1/userinfo': () => ({
					sub: 'google-sub-1',
					email: 'new-user@example.com',
					email_verified: true,
				}),
			},
			async () => {
				const res = await app.request(
					`/api/auth/google/callback?code=test-code&state=${login.state}`,
					{ headers: { Cookie: login.cookies } },
				);
				assert.equal(res.status, 302);
				assert.equal(res.headers.get('location'), '/');
				const cookies = mergeCookies(res, login.cookies);
				assert.equal(await sessionUserId(app, cookies), guest.userId);
				assert.ok(
					res.headers.getSetCookie().some((entry) => entry.startsWith('socratink-guest-turns=')),
					'callback should clear the guest turn counter',
				);

				// New signup rotates to a registered payload; the guest bytes die.
				const previousPair = sessionPair(guest.cookies);
				const rotatedPair = sessionPair(cookies);
				assert.ok(previousPair);
				assert.ok(rotatedPair);
				assert.notEqual(rotatedPair, previousPair);
				const previousPayload = decodedPayload(previousPair);
				const rotatedPayload = decodedPayload(rotatedPair);
				assert.equal(previousPayload.kind, 'guest');
				assert.equal(rotatedPayload.kind, 'registered');
				assert.equal(rotatedPayload.userId, guest.userId);
				assert.notEqual(rotatedPayload.nonce, previousPayload.nonce);

				const owned = `${appConfig.chatAgentPath}/${guest.userId}:pre-login-turn`;
				assert.equal((await app.request(owned, { headers: { Cookie: previousPair } })).status, 401);
				assert.equal((await app.request(owned, { headers: { Cookie: rotatedPair } })).status, 200);
			},
		);
		const user = await authDb.findUserById(guest.userId);
		assert.equal(user?.email, 'new-user@example.com');
		const account = await authDb.findOAuthAccount('google', 'google-sub-1');
		assert.equal(account?.userId, guest.userId);
		assert.deepEqual(rekeys, []);
	});
});

test('Google callback links a returning guest to an existing account via alias', async () => {
	await withAuthDb(async (authDb) => {
		const durableUserId = 'durable-user-1';
		await authDb.createUser(durableUserId, 'returning@example.com');
		await authDb.upsertOAuthAccount('google', 'google-sub-9', durableUserId, 'returning@example.com');
		const rekeys = [];
		const app = createCallbackApp(authDb, {
			onRekey: async (fromUserId, toUserId) => {
				rekeys.push([fromUserId, toUserId]);
			},
		});
		const guest = await mintGuest(app);
		const login = await startLogin(app, 'google', guest.cookies);
		await withMockFetch(
			{
				'https://oauth2.googleapis.com/token': googleTokenRoute,
				'https://openidconnect.googleapis.com/v1/userinfo': () => ({
					sub: 'google-sub-9',
					email: 'returning@example.com',
					email_verified: true,
				}),
			},
			async () => {
				const res = await app.request(
					`/api/auth/google/callback?code=test-code&state=${login.state}`,
					{ headers: { Cookie: login.cookies } },
				);
				assert.equal(res.status, 302);
				assert.equal(res.headers.get('location'), '/');
				const cookies = mergeCookies(res, login.cookies);
				assert.equal(await sessionUserId(app, cookies), durableUserId);
				assert.deepEqual(await sessionPayload(app, cookies), {
					userId: durableUserId,
					aliases: [guest.userId],
					kind: 'registered',
				});

				// Returning users rotate to the durable id; the planted guest bytes
				// die even though the alias maps that UUID, while the durable
				// session still reaches the pre-login conversation via the alias.
				const previousPair = sessionPair(guest.cookies);
				const rotatedPair = sessionPair(cookies);
				assert.ok(previousPair);
				assert.ok(rotatedPair);
				assert.notEqual(rotatedPair, previousPair);
				const previousPayload = decodedPayload(previousPair);
				const rotatedPayload = decodedPayload(rotatedPair);
				assert.equal(previousPayload.kind, 'guest');
				assert.equal(rotatedPayload.kind, 'registered');
				assert.equal(rotatedPayload.userId, durableUserId);
				assert.notEqual(rotatedPayload.nonce, previousPayload.nonce);

				const preLogin = `${appConfig.chatAgentPath}/${guest.userId}:pre-login-turn`;
				assert.equal((await app.request(preLogin, { headers: { Cookie: previousPair } })).status, 401);
				assert.equal((await app.request(preLogin, { headers: { Cookie: rotatedPair } })).status, 200);
			},
		);
		assert.deepEqual(await authDb.findAliases(durableUserId), [guest.userId]);
		assert.deepEqual(rekeys, [[guest.userId, durableUserId]]);
	});
});

test('Google callback attaches a new provider to an existing email user', async () => {
	await withAuthDb(async (authDb) => {
		const durableUserId = 'email-user-1';
		await authDb.createUser(durableUserId, 'linkme@example.com');
		const rekeys = [];
		const app = createCallbackApp(authDb, {
			onRekey: async (fromUserId, toUserId) => {
				rekeys.push([fromUserId, toUserId]);
			},
		});
		const guest = await mintGuest(app);
		const login = await startLogin(app, 'google', guest.cookies);
		await withMockFetch(
			{
				'https://oauth2.googleapis.com/token': googleTokenRoute,
				'https://openidconnect.googleapis.com/v1/userinfo': () => ({
					sub: 'google-sub-new',
					email: 'linkme@example.com',
					email_verified: true,
				}),
			},
			async () => {
				const res = await app.request(
					`/api/auth/google/callback?code=test-code&state=${login.state}`,
					{ headers: { Cookie: login.cookies } },
				);
				assert.equal(res.status, 302);
				const cookies = mergeCookies(res, login.cookies);
				assert.equal(await sessionUserId(app, cookies), durableUserId);
			},
		);
		const account = await authDb.findOAuthAccount('google', 'google-sub-new');
		assert.equal(account?.userId, durableUserId);
		assert.deepEqual(await authDb.findAliases(durableUserId), [guest.userId]);
		assert.deepEqual(rekeys, [[guest.userId, durableUserId]]);
	});
});

test('Google callback rejects unverified email without touching the session', async () => {
	await withAuthDb(async (authDb) => {
		const app = createCallbackApp(authDb);
		const guest = await mintGuest(app);
		const login = await startLogin(app, 'google', guest.cookies);
		await withMockFetch(
			{
				'https://oauth2.googleapis.com/token': googleTokenRoute,
				'https://openidconnect.googleapis.com/v1/userinfo': () => ({
					sub: 'google-sub-unverified',
					email: 'unverified@example.com',
					email_verified: false,
				}),
			},
			async () => {
				const res = await app.request(
					`/api/auth/google/callback?code=test-code&state=${login.state}`,
					{ headers: { Cookie: login.cookies } },
				);
				assert.equal(res.status, 302);
				assert.match(res.headers.get('location') ?? '', /\/login\.html\?error=unverified_email/);
				assert.equal(await sessionUserId(app, login.cookies), guest.userId);
			},
		);
		assert.equal(await authDb.findUserByEmail('unverified@example.com'), undefined);
	});
});

test('GitHub callback creates a user from a verified primary email', async () => {
	await withAuthDb(async (authDb) => {
		const app = createCallbackApp(authDb);
		const guest = await mintGuest(app);
		const login = await startLogin(app, 'github', guest.cookies);
		await withMockFetch(
			{
				'https://github.com/login/oauth/access_token': () => ({ access_token: 'test-access-token' }),
				'https://api.github.com/user': () => ({ id: 4242 }),
				'https://api.github.com/user/emails': () => [
					{ email: 'gh-user@example.com', primary: true, verified: true },
				],
			},
			async () => {
				const res = await app.request(
					`/api/auth/github/callback?code=test-code&state=${login.state}`,
					{ headers: { Cookie: login.cookies } },
				);
				assert.equal(res.status, 302);
				assert.equal(res.headers.get('location'), '/');
				const cookies = mergeCookies(res, login.cookies);
				assert.equal(await sessionUserId(app, cookies), guest.userId);
			},
		);
		const account = await authDb.findOAuthAccount('github', '4242');
		assert.equal(account?.userId, guest.userId);
		assert.equal(account?.email, 'gh-user@example.com');
	});
});

test('GitHub callback rejects when no email is verified', async () => {
	await withAuthDb(async (authDb) => {
		const app = createCallbackApp(authDb);
		const guest = await mintGuest(app);
		const login = await startLogin(app, 'github', guest.cookies);
		await withMockFetch(
			{
				'https://github.com/login/oauth/access_token': () => ({ access_token: 'test-access-token' }),
				'https://api.github.com/user': () => ({ id: 5150 }),
				'https://api.github.com/user/emails': () => [
					{ email: 'unverified@example.com', primary: true, verified: false },
				],
			},
			async () => {
				const res = await app.request(
					`/api/auth/github/callback?code=test-code&state=${login.state}`,
					{ headers: { Cookie: login.cookies } },
				);
				assert.equal(res.status, 302);
				assert.match(res.headers.get('location') ?? '', /\/login\.html\?error=unverified_email/);
			},
		);
		assert.equal(await authDb.findOAuthAccount('github', '5150'), undefined);
	});
});

test('GitHub email selection prefers verified non-noreply addresses', () => {
	assert.equal(
		selectVerifiedGitHubEmail([
			{ email: 'nick@users.noreply.github.com', primary: true, verified: true },
			{ email: 'secondary@example.com', primary: false, verified: true },
		]),
		'secondary@example.com',
	);
	assert.equal(
		selectVerifiedGitHubEmail([
			{ email: 'primary@example.com', primary: true, verified: false },
			{ email: 'secondary@example.com', primary: false, verified: true },
		]),
		'secondary@example.com',
	);
	assert.equal(
		selectVerifiedGitHubEmail([
			{ email: 'primary@example.com', primary: true, verified: true },
		]),
		'primary@example.com',
	);
	assert.equal(
		selectVerifiedGitHubEmail([
			{ email: 'nick@users.noreply.github.com', primary: true, verified: true },
		]),
		'nick@users.noreply.github.com',
	);
	assert.equal(
		selectVerifiedGitHubEmail([
			{ email: 'primary@example.com', primary: true, verified: false },
		]),
		undefined,
	);
});

test('GitHub callback accepts a verified secondary email when the primary is unverified', async () => {
	await withAuthDb(async (authDb) => {
		const app = createCallbackApp(authDb);
		const guest = await mintGuest(app);
		const login = await startLogin(app, 'github', guest.cookies);
		await withMockFetch(
			{
				'https://github.com/login/oauth/access_token': () => ({ access_token: 'test-access-token' }),
				'https://api.github.com/user': () => ({ id: 777 }),
				'https://api.github.com/user/emails': () => [
					{ email: 'primary@example.com', primary: true, verified: false },
					{ email: 'secondary@example.com', primary: false, verified: true },
				],
			},
			async () => {
				const res = await app.request(
					`/api/auth/github/callback?code=test-code&state=${login.state}`,
					{ headers: { Cookie: login.cookies } },
				);
				assert.equal(res.status, 302);
				assert.equal(res.headers.get('location'), '/');
			},
		);
		const account = await authDb.findOAuthAccount('github', '777');
		assert.equal(account?.userId, guest.userId);
		assert.equal(account?.email, 'secondary@example.com');
	});
});

test('OAuth callback redirects to auth_failed when token exchange fails', async () => {
	await withAuthDb(async (authDb) => {
		const app = createCallbackApp(authDb);
		const guest = await mintGuest(app);
		const login = await startLogin(app, 'google', guest.cookies);
		const errors = [];
		const originalError = console.error;
		console.error = (...args) => {
			errors.push(args);
		};
		try {
			await withMockFetch(
				{
					'https://oauth2.googleapis.com/token': () =>
						new Response('bad gateway', { status: 502 }),
				},
				async () => {
					const res = await app.request(
						`/api/auth/google/callback?code=test-code&state=${login.state}`,
						{ headers: { Cookie: login.cookies } },
					);
					assert.equal(res.status, 302);
					assert.match(res.headers.get('location') ?? '', /\/login\.html\?error=auth_failed/);
					assert.equal(await sessionUserId(app, login.cookies), guest.userId);
				},
			);
		} finally {
			console.error = originalError;
		}
		assert.equal(errors.length, 1);
		assert.match(String(errors[0][0]), /OAuth callback failed/);
		assert.equal(await authDb.findUserById(guest.userId), undefined);
	});
});

test('OAuth callback rejects a mismatched state parameter', async () => {
	await withAuthDb(async (authDb) => {
		const app = createCallbackApp(authDb);
		const guest = await mintGuest(app);
		const login = await startLogin(app, 'google', guest.cookies);
		const res = await app.request(
			'/api/auth/google/callback?code=test-code&state=wrong-state-value',
			{ headers: { Cookie: login.cookies } },
		);
		assert.equal(res.status, 302);
		assert.match(res.headers.get('location') ?? '', /\/login\.html\?error=auth_failed/);
		assert.equal(await sessionUserId(app, login.cookies), guest.userId);
	});
});
