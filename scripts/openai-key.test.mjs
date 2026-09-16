import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { Hono } from 'hono';
import { appConfig } from '../src/config/app.config.ts';
import { learnerChatModelChoices, operatorChatStatus } from '../src/config/chat-model.ts';
import { openaiChatStatusCopy, openrouterChatStatusCopy, providersChatStatusCopy } from '../src/ui/chat-route.ts';
import { mountChatRoute } from '../src/server/chat-route.ts';
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
	const rateLimiter = createRateLimiter({ windowMs: 1_000, max: 120 });
	app.post(appConfig.sessionPath, async (context) => {
		const userId = await mintSessionUserId(context, testSecret);
		return context.json({ userId });
	});
	mountOpenaiKeyRoutes(app, {
		secret: testSecret,
		rateLimiter,
		store,
	});
	mountChatRoute(app, {
		secret: testSecret,
		rateLimiter,
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
		assert.equal(providersChatStatusCopy(connectedBody), 'Chat uses your OpenAI key.');
		assert.match(openaiChatStatusCopy(connectedBody), /Chat uses your OpenAI key/);
		assert.doesNotMatch(openrouterChatStatusCopy(connectedBody), /Chat uses/);
		assert.equal(openrouterChatStatusCopy(connectedBody), '');

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
		assert.equal(providersChatStatusCopy(operatorChatStatus), 'Chat uses the local Socratink model.');
		assert.doesNotMatch(openaiChatStatusCopy(operatorChatStatus), /Chat uses/);
		assert.doesNotMatch(openrouterChatStatusCopy(operatorChatStatus), /Chat uses/);
	});
});

test('closed Providers copy has one owner from kind', () => {
	const operator = { kind: 'operator', openai: false, openrouter: false };
	const openai = { kind: 'openai', openai: true, openrouter: false };
	const both = { kind: 'openrouter', openai: true, openrouter: true };
	assert.equal(providersChatStatusCopy(operator), 'Chat uses the local Socratink model.');
	assert.equal(providersChatStatusCopy(openai), 'Chat uses your OpenAI key.');
	assert.equal(providersChatStatusCopy(both), 'Chat uses your OpenRouter key.');
	assert.doesNotMatch(providersChatStatusCopy(both), /OpenAI/);
	assert.doesNotMatch(providersChatStatusCopy(both), /ChatGPT Plus/);
	assert.doesNotMatch(providersChatStatusCopy(both), /Claude/);
	assert.equal(openaiChatStatusCopy(both), 'OpenAI key stored.');
	assert.doesNotMatch(openaiChatStatusCopy(both), /Chat uses/);
	assert.match(openrouterChatStatusCopy(both), /Chat uses your OpenRouter key/);
	assert.equal(openaiChatStatusCopy(operator), '');
	assert.equal(openrouterChatStatusCopy(openai), '');
	for (const choice of learnerChatModelChoices) {
		assert.doesNotMatch(choice.label, /ChatGPT Plus/);
		assert.doesNotMatch(choice.label, /Claude/);
		assert.doesNotMatch(choice.label, /ChatGPT/);
	}
});

test('paste-key UI lives on Chat chrome and does not keep the secret in the browser', async () => {
	const html = await readFile(new URL('../src/ui/index.html', import.meta.url), 'utf8');
	const script = await readFile(new URL('../src/ui/openai-key.ts', import.meta.url), 'utf8');
	const route = await readFile(new URL('../src/ui/chat-route.ts', import.meta.url), 'utf8');
	const surface = await readFile(new URL('../src/ui/chat-surface.ts', import.meta.url), 'utf8');
	const chat = await readFile(new URL('../src/agents/chat.ts', import.meta.url), 'utf8');
	assert.match(html, /id="openai-key"/);
	assert.match(html, /id="providers-toggle"/);
	assert.match(html, /id="providers-panel"/);
	assert.match(html, /<p id="providers-status"[^>]*aria-live="polite"/);
	assert.match(html, /id="providers-panel"[\s\S]*id="openai-key"[\s\S]*id="openrouter"/);
	assert.match(html, /id="openai-models"/);
	assert.match(html, /id="openrouter-models"/);
	assert.doesNotMatch(html, /id="auto-model"/);
	assert.ok(html.includes(providersChatStatusCopy(operatorChatStatus)));
	assert.match(html, /OpenAI platform API key/);
	assert.doesNotMatch(html, /Log in with ChatGPT/);
	assert.doesNotMatch(html, /id="openai-key-status"[^>]*aria-live/);
	assert.doesNotMatch(html, /id="openrouter-status"[^>]*aria-live/);
	assert.match(script, /openaiKeyPath/);
	assert.match(script, /method: 'PUT'/);
	assert.match(script, /method: 'DELETE'/);
	assert.doesNotMatch(script, /localStorage/);
	assert.match(route, /chatRoutePath/);
	assert.match(route, /export function providersChatStatusCopy/);
	assert.match(route, /case 'openai'/);
	assert.match(route, /Chat uses your OpenAI key/);
	assert.match(route, /OpenAI key stored/);
	assert.match(surface, /loadLearnerChatStatus/);
	assert.match(surface, /paintProviders/);
	assert.match(surface, /paintOpenaiKey/);
	assert.match(chat, /capturedChatModelSpecifier/);
	assert.match(chat, /useModel/);

	const provider = await readFile(new URL('../src/server/provider.ts', import.meta.url), 'utf8');
	assert.match(provider, /openaiProvider/);
	assert.match(provider, /resolveStoredLearnerApiKey/);
	assert.match(provider, /credentialNameForLearnerChat\(\{ kind: 'openai' \}\)/);
	assert.doesNotMatch(provider, /Models\.login/);
	assert.doesNotMatch(provider, /OPENAI_API_KEY/);
	assert.doesNotMatch(provider, /process\.env\.\w+\s*=/);
	assert.doesNotMatch(provider, /resolveLearnerChatApiKey/);
});
