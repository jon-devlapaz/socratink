import assert from 'node:assert/strict';
import test from 'node:test';
import { betaProviderFixture } from './beta-provider-fixture.mjs';
import { AgentRunError, init, instrument, useModel } from '@flue/runtime';
import { start } from '@flue/runtime/node';
import { resolveBetaAccess } from '../src/config/beta-access.ts';
import { createSqliteAuthDb } from '../src/server/auth-db.ts';
import { createBetaModelGuard } from '../src/server/beta-access.ts';
import { capturedChatModelSpecifier, installLearnerKeyCapture } from '../src/server/learner-key.ts';

function BetaRuntimeFixture() {
	useModel(capturedChatModelSpecifier() ?? 'unconfigured/must-not-run');
	return 'Return the synthetic fixture reply.';
}

BetaRuntimeFixture.durability = { maxAttempts: 1, timeoutMs: 5_000 };

test('real Flue execution checks invitations and pause before the operator provider is called', { timeout: 15_000 }, async () => {
	const authDb = createSqliteAuthDb(':memory:');
	await authDb.createUser('alice', 'alice@example.com');
	await authDb.createUser('bob', 'bob@example.com');
	await authDb.createAlias('former-guest', 'alice');
	const policy = resolveBetaAccess({
		NODE_ENV: 'production',
		SOCRATINK_BETA_INVITED_EMAILS: 'alice@example.com',
		SOCRATINK_BETA_PAUSED: '0',
	});
	const { model, provider, calls } = betaProviderFixture();
	installLearnerKeyCapture({
		store: { async hasUserKey() { throw new Error('Learner keys must not select the hosted provider.'); } },
		operator: { providerId: model.provider, modelId: model.id },
		operatorOnly: true,
	});
	const dispose = instrument({
		key: Symbol('beta-runtime-fixture'),
		observe() {},
		interceptor: createBetaModelGuard({ authDb, policy }),
		dispose() {},
	});
	const runtime = await start({ agents: [BetaRuntimeFixture], providers: [provider], env: {} });
	async function replyFor(id) {
		const conversation = init(BetaRuntimeFixture, { id });
		return conversation.read(await conversation.dispatch('Synthetic input.'), { signal: AbortSignal.timeout(7_000) });
	}
	try {
		assert.equal((await replyFor('alice:direct')).text, 'Synthetic beta reply.');
		assert.equal((await replyFor('former-guest:migrated')).text, 'Synthetic beta reply.');
		assert.equal(calls(), 2);
		await assert.rejects(replyFor('bob:blocked'), AgentRunError);
		await assert.rejects(replyFor('guest:blocked'), AgentRunError);
		assert.equal(calls(), 2);
		policy.paused = true;
		await assert.rejects(replyFor('alice:paused'), AgentRunError);
		assert.equal(calls(), 2, 'pause must stop provider calls, not merely HTTP admission');
	} finally {
		await runtime.stop();
		await dispose();
		await authDb.close();
	}
});
