import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { Hono } from 'hono';
import { appConfig } from '../src/config/app.config.ts';
import {
	openRouterAuthorizationUrl,
	openRouterCodeChallengeMethod,
	openRouterKeyLabel,
	sha256Base64Url,
} from '../src/config/openrouter.ts';
import { namespacedConversationId } from '../src/config/session.ts';
import { createSqliteCredentialDb } from '../src/server/credential-db.ts';
import { createCredentialStore } from '../src/server/credentials.ts';
import {
	openrouterCredentialName,
	resolveLearnerChatApiKey,
	runWithLearnerKey,
	specifierForStoredLearner,
} from '../src/server/learner-key.ts';
import {
	foreignOpenRouterPkceError,
	invalidOpenRouterCallbackError,
	missingOpenRouterPkceError,
	mountOpenrouterRoutes,
	openRouterOAuthFailedError,
} from '../src/server/openrouter.ts';
import { createRateLimiter } from '../src/server/rate-limit.ts';
import { mintSessionUserId } from '../src/server/session.ts';
import { cookiePairFromResponse, mergeCookies } from './session-fixture.mjs';

const testSecret = 'test-openrouter-session-secret';
const fixtureKey = 'sk-or-fixture-minted';
const operator = { providerId: 'jon-local', modelId: 'auto' };

async function listen(server) {
	return await new Promise((resolve, reject) => {
		server.once('error', reject);
		server.listen(0, '127.0.0.1', () => {
			server.off('error', reject);
			resolve(server.address().port);
		});
	});
}

function close(server) {
	return new Promise((resolve, reject) => {
		server.close((error) => (error ? reject(error) : resolve()));
	});
}

async function withApp(run, oauth) {
	const directory = await mkdtemp(join(tmpdir(), 'socratink-openrouter-'));
	const store = createCredentialStore({
		secret: 'test-openrouter-credentials-secret',
		db: createSqliteCredentialDb(join(directory, 'credentials.db')),
	});
	const app = new Hono();
	app.post(appConfig.sessionPath, async (context) => {
		const userId = await mintSessionUserId(context, testSecret);
		return context.json({ userId });
	});
	mountOpenrouterRoutes(app, {
		secret: testSecret,
		rateLimiter: createRateLimiter({ windowMs: 1_000, max: 120 }),
		store,
		oauth,
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

test('openrouter routes require a session and never echo the minted key', async () => {
	/** @type {{ code: string, code_verifier: string, code_challenge_method: string }[]} */
	const exchanges = [];
	const tokenServer = createServer((request, response) => {
		if (request.method !== 'POST' || request.url !== '/api/v1/auth/keys') {
			response.writeHead(404);
			response.end();
			return;
		}
		const chunks = [];
		request.on('data', (chunk) => chunks.push(chunk));
		request.on('end', () => {
			const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
			exchanges.push(body);
			response.writeHead(200, { 'content-type': 'application/json' });
			response.end(JSON.stringify({ key: fixtureKey }));
		});
	});
	const tokenPort = await listen(tokenServer);

	try {
		await withApp(async (app, store) => {
			const missing = await app.request(appConfig.openrouterPath);
			assert.equal(missing.status, 401);

			const unsignedConnect = await app.request(appConfig.openrouterConnectPath, { method: 'POST' });
			assert.equal(unsignedConnect.status, 401);

			const unsignedCallback = await app.request(
				`${appConfig.openrouterCallbackPath}?code=fixture-code`,
			);
			assert.equal(unsignedCallback.status, 401);

			const { userId, cookie } = await mintCookie(app);
			const empty = await app.request(appConfig.openrouterPath, { headers: { cookie } });
			assert.equal(empty.status, 200);
			assert.deepEqual(await empty.json(), { connected: false });

			const started = await app.request(`http://127.0.0.1${appConfig.openrouterConnectPath}`, {
				method: 'POST',
				headers: { cookie },
			});
			assert.equal(started.status, 302);
			const authorization = new URL(started.headers.get('location') ?? '');
			assert.equal(authorization.origin + authorization.pathname, openRouterAuthorizationUrl);
			assert.equal(
				authorization.searchParams.get('callback_url'),
				`http://127.0.0.1${appConfig.openrouterCallbackPath}`,
			);
			assert.equal(authorization.searchParams.get('code_challenge_method'), openRouterCodeChallengeMethod);
			assert.equal(authorization.searchParams.get('key_label'), openRouterKeyLabel);
			const challenge = authorization.searchParams.get('code_challenge');
			assert.ok(challenge);
			assert.equal(authorization.href.includes(fixtureKey), false);

			const cookies = mergeCookies(started, cookie);
			assert.match(cookies, /socratink-openrouter-pkce=/);

			const noCode = await app.request(`http://127.0.0.1${appConfig.openrouterCallbackPath}`, {
				headers: { cookie: cookies },
			});
			assert.equal(noCode.status, 400);
			assert.deepEqual(await noCode.json(), { error: invalidOpenRouterCallbackError });

			const restarted = await app.request(`http://127.0.0.1${appConfig.openrouterConnectPath}`, {
				method: 'POST',
				headers: { cookie },
			});
			assert.equal(restarted.status, 302);
			const restartedChallenge = new URL(restarted.headers.get('location') ?? '').searchParams.get(
				'code_challenge',
			);
			const connectedCookies = mergeCookies(restarted, cookie);

			const finished = await app.request(
				`http://127.0.0.1${appConfig.openrouterCallbackPath}?code=fixture-code`,
				{ headers: { cookie: connectedCookies } },
			);
			assert.equal(finished.status, 302);
			assert.equal(new URL(finished.headers.get('location') ?? '', 'http://127.0.0.1').pathname, '/');
			assert.equal((finished.headers.get('location') ?? '').includes(fixtureKey), false);
			assert.equal(JSON.stringify(Object.fromEntries(finished.headers)).includes(fixtureKey), false);

			assert.equal(exchanges.length, 1);
			assert.equal(exchanges[0]?.code, 'fixture-code');
			assert.equal(exchanges[0]?.code_challenge_method, openRouterCodeChallengeMethod);
			assert.equal(await sha256Base64Url(exchanges[0]?.code_verifier ?? ''), restartedChallenge);
			assert.equal(JSON.stringify(exchanges[0]).includes(fixtureKey), false);

			assert.equal(
				await store.getUserKey({ userId, name: openrouterCredentialName }),
				fixtureKey,
			);
			assert.equal(
				await runWithLearnerKey(namespacedConversationId(userId, 'live'), () =>
					resolveLearnerChatApiKey({
						store,
						credentialName: openrouterCredentialName,
					}),
				).then((result) => result.auth.apiKey),
				fixtureKey,
			);
			assert.equal(
				await specifierForStoredLearner({ store, userId, operator }),
				'openrouter/openai/gpt-5-nano',
			);

			const status = await app.request(appConfig.openrouterPath, { headers: { cookie } });
			const statusBody = await status.json();
			assert.deepEqual(statusBody, { connected: true });
			assert.equal(JSON.stringify(statusBody).includes(fixtureKey), false);

			const { cookie: otherCookie } = await mintCookie(app);
			const other = await app.request(appConfig.openrouterPath, { headers: { cookie: otherCookie } });
			assert.deepEqual(await other.json(), { connected: false });

			const cleared = await app.request(appConfig.openrouterPath, {
				method: 'DELETE',
				headers: { cookie },
			});
			assert.deepEqual(await cleared.json(), { connected: false });
			assert.equal(
				await specifierForStoredLearner({ store, userId, operator }),
				'jon-local/auto',
			);
		}, { tokenUrl: `http://127.0.0.1:${tokenPort}/api/v1/auth/keys` });
	} finally {
		await close(tokenServer);
	}
});

test('OpenRouter PKCE callback fails closed without a matching verifier', async () => {
	const tokenServer = createServer((_request, response) => {
		response.writeHead(200, { 'content-type': 'application/json' });
		response.end(JSON.stringify({ key: fixtureKey }));
	});
	const tokenPort = await listen(tokenServer);

	try {
		await withApp(async (app, store) => {
			const { userId, cookie } = await mintCookie(app);
			const missingPkce = await app.request(
				`http://127.0.0.1${appConfig.openrouterCallbackPath}?code=fixture-code`,
				{ headers: { cookie } },
			);
			assert.equal(missingPkce.status, 400);
			assert.deepEqual(await missingPkce.json(), { error: missingOpenRouterPkceError });

			const started = await app.request(`http://127.0.0.1${appConfig.openrouterConnectPath}`, {
				method: 'POST',
				headers: { cookie },
			});
			const alicePkce = mergeCookies(started, cookie);
			const { userId: bobId, cookie: bobCookie } = await mintCookie(app);
			const foreign = await app.request(
				`http://127.0.0.1${appConfig.openrouterCallbackPath}?code=fixture-code`,
				{ headers: { cookie: mergeCookies(started, bobCookie) } },
			);
			assert.equal(foreign.status, 403);
			assert.deepEqual(await foreign.json(), { error: foreignOpenRouterPkceError });
			assert.equal(await store.hasUserKey({ userId, name: openrouterCredentialName }), false);
			assert.equal(await store.hasUserKey({ userId: bobId, name: openrouterCredentialName }), false);
			assert.match(alicePkce, /socratink-openrouter-pkce=/);
		}, { tokenUrl: `http://127.0.0.1:${tokenPort}/api/v1/auth/keys` });
	} finally {
		await close(tokenServer);
	}
});

test('a failed OpenRouter token exchange does not store a key', async () => {
	const tokenServer = createServer((_request, response) => {
		response.writeHead(403, { 'content-type': 'application/json' });
		response.end(JSON.stringify({ error: 'Invalid code or code_verifier' }));
	});
	const tokenPort = await listen(tokenServer);

	try {
		await withApp(async (app, store) => {
			const { userId, cookie } = await mintCookie(app);
			const started = await app.request(`http://127.0.0.1${appConfig.openrouterConnectPath}`, {
				method: 'POST',
				headers: { cookie },
			});
			const failed = await app.request(
				`http://127.0.0.1${appConfig.openrouterCallbackPath}?code=fixture-code`,
				{ headers: { cookie: mergeCookies(started, cookie) } },
			);
			assert.equal(failed.status, 502);
			const failedBody = await failed.json();
			assert.deepEqual(failedBody, { error: openRouterOAuthFailedError });
			assert.equal(JSON.stringify(failedBody).includes(fixtureKey), false);
			assert.equal(await store.hasUserKey({ userId, name: openrouterCredentialName }), false);
		}, { tokenUrl: `http://127.0.0.1:${tokenPort}/api/v1/auth/keys` });
	} finally {
		await close(tokenServer);
	}
});

test('OpenRouter connect UI lives on Chat chrome and does not keep the minted key in the browser', async () => {
	const html = await readFile(new URL('../src/ui/index.html', import.meta.url), 'utf8');
	const script = await readFile(new URL('../src/ui/openrouter.ts', import.meta.url), 'utf8');
	const surface = await readFile(new URL('../src/ui/chat-surface.ts', import.meta.url), 'utf8');
	const provider = await readFile(new URL('../src/server/provider.ts', import.meta.url), 'utf8');
	assert.match(html, /id="openrouter"/);
	assert.match(html, /action="\/api\/openrouter\/connect"/);
	assert.match(html, /OpenRouter credits/);
	assert.doesNotMatch(html, /Log in with ChatGPT/);
	assert.doesNotMatch(html, /Log in with Claude/);
	assert.match(script, /openrouterPath/);
	assert.match(script, /method: 'DELETE'/);
	assert.doesNotMatch(script, /localStorage/);
	assert.doesNotMatch(script, /sessionStorage/);
	assert.match(surface, /mountOpenrouter/);
	assert.match(provider, /openrouterProvider/);
	assert.match(provider, /credentialName: openrouterCredentialName/);
	assert.doesNotMatch(provider, /Models\.login/);
	assert.doesNotMatch(provider, /OPENROUTER_API_KEY/);
	assert.doesNotMatch(provider, /openRouterOAuth/);
	assert.doesNotMatch(provider, /process\.env\.\w+\s*=/);
	assert.doesNotMatch(provider, /loginLabel/);
});
