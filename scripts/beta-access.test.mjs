import assert from 'node:assert/strict';
import test from 'node:test';
import { Hono } from 'hono';
import { FlueApiError, FlueExecutionError } from '@flue/sdk';
import { appConfig } from '../src/config/app.config.ts';
import { resolveBetaAccess } from '../src/config/beta-access.ts';
import { operatorChatStatus, resolveChatModel } from '../src/config/chat-model.ts';
import { createSqliteAuthDb } from '../src/server/auth-db.ts';
import {
	betaInviteError,
	betaPausedError,
	betaSignInError,
	createBetaModelGuard,
	requireBetaAdmission,
} from '../src/server/beta-access.ts';
import { requireChatSession, requireSignedSession } from '../src/server/chat-access.ts';
import { mountChatRoute } from '../src/server/chat-route.ts';
import { specifierForStoredLearner } from '../src/server/learner-key.ts';
import { createRateLimiter } from '../src/server/rate-limit.ts';
import { writeSessionCookie } from '../src/server/session.ts';
import { chatTurnErrorMessage } from '../src/ui/client/conversation.ts';
import { cookiePairFromResponse } from './session-fixture.mjs';

const hostedEnvironments = [
	{ NODE_ENV: 'production' },
	{ VERCEL: '1' },
	{ NF_PROJECT_ID: 'fixture-project' },
];
const secret = 'beta-fixture-session-secret';
const unavailableCredentials = {
	async hasUserKey() { throw new Error('Hosted Chat must not inspect learner credentials.'); },
};

function activePolicy() {
	return resolveBetaAccess({
		NODE_ENV: 'production',
		SOCRATINK_BETA_INVITED_EMAILS: ' Alice@Example.com ',
		SOCRATINK_BETA_PAUSED: '0',
	});
}

async function withApp(run, policy = activePolicy()) {
	const authDb = createSqliteAuthDb(':memory:');
	await authDb.createUser('alice', 'alice@example.com');
	await authDb.createUser('bob', 'bob@example.com');
	await authDb.createAlias('former-guest', 'alice');
	const app = new Hono();
	app.post('/fixture/:userId/:kind', async (context) => {
		await writeSessionCookie(context, context.req.param('userId'), secret, {}, context.req.param('kind'));
		return context.json({ ok: true });
	});
	const limiter = createRateLimiter({ windowMs: 60_000, max: 120 });
	const signed = requireSignedSession({ secret, rateLimiter: limiter, authDb });
	mountChatRoute(app, { signed, store: { async hasUserKey() { return false; } }, operatorOnly: true });
	app.use('/api/agents/chat/*', requireChatSession({ secret, rateLimiter: limiter, authDb }));
	app.use('/api/agents/chat/*', requireBetaAdmission({ policy, authDb }));
	let admissions = 0;
	app.post('/api/agents/chat/:id', (context) => {
		admissions += 1;
		return context.json({ admitted: true }, 202);
	});
	app.post('/api/agents/chat/:id/abort', (context) => context.json({ aborted: true }));
	app.get('/api/agents/chat/:id', (context) => context.json({ history: [] }));
	async function cookie(userId, kind = 'registered') {
		const response = await app.request(`/fixture/${userId}/${kind}`, { method: 'POST' });
		return cookiePairFromResponse(response);
	}
	try {
		await run({ app, authDb, policy, cookie, admissions: () => admissions });
	} finally {
		await authDb.close();
	}
}

for (const environment of hostedEnvironments) {
	test(`hosted model requires the budgeted gateway key: ${Object.keys(environment)[0]}`, () => {
		for (const AI_GATEWAY_API_KEY of [undefined, '', '  ']) {
			assert.throws(() => resolveChatModel({
				...environment,
				AI_GATEWAY_API_KEY,
				VERCEL_OIDC_TOKEN: 'fixture-oidc',
				JON_LOCAL_BASE_URL: 'https://unbudgeted.example.com/v1',
				JON_LOCAL_API_KEY: 'fixture-local-key',
			}), /AI_GATEWAY_API_KEY is required/);
		}
		const model = resolveChatModel({
			...environment,
			AI_GATEWAY_API_KEY: ' fixture-budgeted-key ',
			JON_LOCAL_BASE_URL: 'https://unbudgeted.example.com/v1',
			JON_LOCAL_MODEL_ID: 'auto',
			JON_LOCAL_API_KEY: 'fixture-local-key',
		});
		assert.equal(model.apiKey, 'fixture-budgeted-key');
		assert.equal(model.baseUrl, appConfig.vercelAiGatewayBaseUrl);
		assert.equal(model.modelId, appConfig.vercelAiGatewayModelId);
		assert.equal(model.maxTokens, 8192);
	});
}

test('hosted beta is paused by default and cannot unpause without exact invites', () => {
	assert.equal(resolveBetaAccess({}), undefined);
	for (const environment of hostedEnvironments) {
		assert.deepEqual(resolveBetaAccess(environment), { invitedEmails: new Set(), paused: true });
		assert.throws(() => resolveBetaAccess({ ...environment, SOCRATINK_BETA_PAUSED: '0' }), /INVITED_EMAILS is required/);
	}
	assert.deepEqual(activePolicy(), { invitedEmails: new Set(['alice@example.com']), paused: false });
	for (const invites of ['*', '*@example.com', 'alice@example.com,', 'not-an-email']) {
		assert.throws(() => resolveBetaAccess({ NODE_ENV: 'production', SOCRATINK_BETA_INVITED_EMAILS: invites }), /exact comma-separated/);
	}
	for (const paused of ['', 'false', 'yes']) {
		assert.throws(() => resolveBetaAccess({ NODE_ENV: 'production', SOCRATINK_BETA_PAUSED: paused }), /must be 0 or 1/);
	}
});

test('paid admissions reject missing sessions, guests, uninvited and nonexistent accounts', async () => {
	await withApp(async ({ app, cookie, admissions }) => {
		assert.equal((await app.request('/api/agents/chat/alice:turn', { method: 'POST' })).status, 401);
		for (const [userId, kind, expected] of [
			['guest', 'guest', betaSignInError],
			['bob', 'registered', betaInviteError],
			['missing', 'registered', betaInviteError],
		]) {
			const response = await app.request(`/api/agents/chat/${userId}:turn`, {
				method: 'POST', headers: { cookie: await cookie(userId, kind) },
			});
			assert.equal(response.status, 403);
			assert.deepEqual(await response.json(), { error: expected });
		}
		assert.equal(admissions(), 0);
	});
});

test('an invited account can submit its own and migrated conversations, never another account’s', async () => {
	await withApp(async ({ app, cookie, admissions }) => {
		const headers = { cookie: await cookie('alice') };
		for (const id of ['alice:turn', 'former-guest:turn']) {
			assert.equal((await app.request(`/api/agents/chat/${id}`, { method: 'POST', headers })).status, 202);
		}
		assert.equal((await app.request('/api/agents/chat/bob:turn', { method: 'POST', headers })).status, 403);
		assert.equal(admissions(), 2);
	});
});

test('pause blocks new work while owned history and cancellation remain available', async () => {
	await withApp(async ({ app, cookie, admissions }) => {
		const headers = { cookie: await cookie('alice') };
		const response = await app.request('/api/agents/chat/alice:turn', { method: 'POST', headers });
		assert.equal(response.status, 503);
		assert.deepEqual(await response.json(), { error: betaPausedError });
		assert.equal(admissions(), 0);
		for (const userId of ['alice', 'bob', 'guest']) {
			const ownHeaders = { cookie: await cookie(userId, userId === 'guest' ? 'guest' : 'registered') };
			assert.equal((await app.request(`/api/agents/chat/${userId}:turn`, { headers: ownHeaders })).status, 200);
			assert.equal((await app.request(`/api/agents/chat/${userId}:turn`, { method: 'HEAD', headers: ownHeaders })).status, 200);
			assert.equal((await app.request(`/api/agents/chat/${userId}:turn/abort`, { method: 'POST', headers: ownHeaders })).status, 200);
		}
		assert.equal((await app.request('/api/agents/chat/bob:turn', { headers })).status, 403);
	}, { ...activePolicy(), paused: true });
});

test('each model call rechecks invited ownership without an HTTP cookie, including migrated history', async () => {
	await withApp(async ({ authDb, policy }) => {
		const guard = createBetaModelGuard({ authDb, policy });
		let calls = 0;
		const next = async () => { calls += 1; return 'model result'; };
		const operation = { type: 'model', turnId: 'fixture-turn' };
		assert.equal(await guard(operation, { instanceId: 'alice:turn' }, next), 'model result');
		assert.equal(await guard(operation, { instanceId: 'former-guest:turn' }, next), 'model result');
		for (const instanceId of [undefined, 'guest:turn', 'bob:turn', 'missing:turn', 'unnamespaced']) {
			await assert.rejects(guard(operation, { instanceId }, next), { name: betaInviteError.type });
		}
		policy.invitedEmails.clear();
		await assert.rejects(guard(operation, { instanceId: 'alice:turn' }, next), { name: betaInviteError.type });
		assert.equal(calls, 2, 'revoked invitations stop queued work, later tool-loop calls and recovery');
	});
});

test('execution pause and auth-store failure cannot fall through to a provider call', async () => {
	await withApp(async ({ authDb, policy }) => {
		let calls = 0;
		const next = async () => { calls += 1; };
		const operation = { type: 'model', turnId: 'fixture-turn' };
		const context = { instanceId: 'alice:turn' };
		const paused = createBetaModelGuard({ authDb, policy: { ...policy, paused: true } });
		await assert.rejects(paused(operation, context, next), { name: betaPausedError.type });
		const broken = createBetaModelGuard({
			policy,
			authDb: { async findAliasOwner() { throw new Error('fixture database unavailable'); } },
		});
		await assert.rejects(broken(operation, context, next), /fixture database unavailable/);
		assert.equal(calls, 0);
		await paused({ type: 'agent', operationId: 'fixture-operation', operationKind: 'prompt' }, context, next);
		assert.equal(calls, 1, 'non-model operations are not mistaken for paid calls');
	});
});

test('hosted selection ignores learner keys and status declares operator-only routing', async () => {
	const operator = { providerId: 'jon-local', modelId: appConfig.vercelAiGatewayModelId };
	for (const requested of ['openai/gpt-5', 'openrouter/openai/gpt-5', undefined]) {
		assert.equal(await specifierForStoredLearner({
			store: unavailableCredentials, userId: 'alice', operator, requested, operatorOnly: true,
		}), `jon-local/${appConfig.vercelAiGatewayModelId}`);
	}
	await withApp(async ({ app, cookie }) => {
		const response = await app.request(appConfig.chatRoutePath, { headers: {
			cookie: await cookie('alice'), 'x-socratink-chat-model': 'openai/gpt-5',
		} });
		assert.deepEqual(await response.json(), { ...operatorChatStatus, operatorOnly: true });
	});
});

test('gateway budget exhaustion is readable without exposing key IDs or suggesting paid fallback', () => {
	const expected = 'The beta model budget is exhausted. You can still read earlier messages. Contact the beta organizer to continue.';
	for (const error of [
		new Error('402: Quota limit exceeded for api_key_id_fixture. Current spend: $10.00, limit: $10.00.'),
		new FlueExecutionError({ target: 'agent_submission', targetId: 'sub-fixture', failure: 'failed', error: {
			type: 'quota_for_entity_exceeded', message: 'A provider-specific message.',
		} }),
		new FlueApiError(402, { error: { type: 'quota_for_entity_exceeded', message: 'A provider-specific message.' } }),
	]) {
		assert.equal(chatTurnErrorMessage(error), expected);
	}
	assert.equal(chatTurnErrorMessage(new Error('other failure')), 'other failure');
});
