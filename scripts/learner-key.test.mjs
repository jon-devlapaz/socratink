import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { namespacedConversationId, userIdFromConversationId } from '../src/config/session.ts';
import { createSqliteCredentialDb } from '../src/server/credential-db.ts';
import {
	createCredentialStore,
	missingUserKeyError,
	UserKeyError,
} from '../src/server/credentials.ts';
import {
	capturedChatModelSpecifier,
	capturedLearnerUserId,
	missingChatInstanceIdError,
	openaiCredentialName,
	openrouterCredentialName,
	requireAgentInstanceUserId,
	resolveStoredLearnerApiKey,
	runWithChatSpecifier,
	runWithLearnerKey,
	specifierForStoredLearner,
} from '../src/server/learner-key.ts';

const testSecret = 'test-learner-key-secret-for-aes-256-gcm';
const aliceId = 'alice';
const bobId = 'bob';
const aliceKey = 'sk-fixture-alice';
const aliceLiveId = namespacedConversationId(aliceId, 'live');

async function withStore(run) {
	const directory = await mkdtemp(join(tmpdir(), 'socratink-learner-key-'));
	const store = createCredentialStore({
		secret: testSecret,
		db: createSqliteCredentialDb(join(directory, 'credentials.db')),
	});
	try {
		return await run(store);
	} finally {
		await store.close();
		await rm(directory, { recursive: true, force: true });
	}
}

test('a stored-key resolve does not fall back to the operator key when the row is missing', async () => {
	await withStore(async (store) => {
		await assert.rejects(
			() =>
				runWithLearnerKey(aliceLiveId, () =>
					resolveStoredLearnerApiKey({
						store,
						name: openaiCredentialName,
					}),
				),
			(error) => {
				assert.equal(error instanceof UserKeyError, true);
				assert.equal(error.type, missingUserKeyError.type);
				return true;
			},
		);
		await assert.rejects(
			() =>
				resolveStoredLearnerApiKey({
					store,
					name: openaiCredentialName,
				}),
			(error) => {
				assert.equal(error instanceof UserKeyError, true);
				assert.equal(error.type, missingUserKeyError.type);
				return true;
			},
		);
	});
});

test('Chat uses openai/gpt-5-nano only while a learner key is connected', async () => {
	const operator = { providerId: 'jon-local', modelId: 'auto' };
	assert.equal(
		runWithChatSpecifier('openai/gpt-5-nano', () => capturedChatModelSpecifier()),
		'openai/gpt-5-nano',
	);
	assert.equal(capturedChatModelSpecifier(), undefined);

	await withStore(async (store) => {
		await store.updateUserKey({ userId: aliceId, name: openaiCredentialName, value: aliceKey });
		assert.equal(
			await specifierForStoredLearner({ store, userId: aliceId, operator }),
			'openai/gpt-5-nano',
		);
		assert.equal(
			await specifierForStoredLearner({ store, userId: bobId, operator }),
			'jon-local/auto',
		);

		assert.equal(userIdFromConversationId(aliceLiveId), aliceId);
		assert.equal(requireAgentInstanceUserId(aliceLiveId), aliceId);
		assert.equal(
			await specifierForStoredLearner({
				store,
				userId: requireAgentInstanceUserId(aliceLiveId),
				operator,
			}),
			'openai/gpt-5-nano',
		);

		const flueConversationId = 'conv_01ARZ3NDEKTSV4RRFFQ69G5FAV';
		assert.equal(userIdFromConversationId(undefined), undefined);
		assert.equal(userIdFromConversationId(flueConversationId), undefined);
		assert.equal(runWithLearnerKey(undefined, () => capturedLearnerUserId()), undefined);
		assert.equal(
			runWithLearnerKey(flueConversationId, () => capturedLearnerUserId()),
			undefined,
		);
		assert.throws(
			() => requireAgentInstanceUserId(undefined),
			(error) => {
				assert.equal(error instanceof Error, true);
				assert.equal(error.message, missingChatInstanceIdError.message);
				return true;
			},
		);
		assert.throws(
			() => requireAgentInstanceUserId(flueConversationId),
			(error) => {
				assert.equal(error instanceof Error, true);
				assert.equal(error.message, missingChatInstanceIdError.message);
				return true;
			},
		);
	});
});

test('Chat uses openrouter/openai/gpt-5-nano when an OpenRouter key is connected', async () => {
	const operator = { providerId: 'jon-local', modelId: 'auto' };
	const openrouterKey = 'sk-or-fixture-alice';

	await withStore(async (store) => {
		await store.updateUserKey({
			userId: aliceId,
			name: openrouterCredentialName,
			value: openrouterKey,
		});
		assert.equal(
			await specifierForStoredLearner({ store, userId: aliceId, operator }),
			'openrouter/openai/gpt-5-nano',
		);
		await store.updateUserKey({
			userId: aliceId,
			name: openaiCredentialName,
			value: aliceKey,
		});
		assert.equal(
			await specifierForStoredLearner({ store, userId: aliceId, operator }),
			'openrouter/openai/gpt-5-nano',
		);
		assert.equal(
			await specifierForStoredLearner({
				store,
				userId: aliceId,
				operator,
				requested: 'openai/gpt-5',
			}),
			'openai/gpt-5',
		);
		assert.equal(
			await specifierForStoredLearner({
				store,
				userId: aliceId,
				operator,
				requested: 'openrouter/openai/gpt-5-mini',
			}),
			'openrouter/openai/gpt-5-mini',
		);
		assert.equal(
			await specifierForStoredLearner({
				store,
				userId: aliceId,
				operator,
				requested: 'openai/gpt-4o',
			}),
			'openrouter/openai/gpt-5-nano',
		);
		await store.deleteUserKey({ userId: aliceId, name: openaiCredentialName });
		assert.equal(
			await specifierForStoredLearner({
				store,
				userId: aliceId,
				operator,
				requested: 'openai/gpt-5',
			}),
			'openrouter/openai/gpt-5-nano',
		);
		await store.updateUserKey({
			userId: aliceId,
			name: openaiCredentialName,
			value: aliceKey,
		});
		assert.equal(
			await runWithLearnerKey(aliceLiveId, () =>
				resolveStoredLearnerApiKey({
					store,
					name: openrouterCredentialName,
				}),
			).then((result) => result.auth.apiKey),
			openrouterKey,
		);
		assert.equal(
			await runWithLearnerKey(aliceLiveId, () =>
				resolveStoredLearnerApiKey({
					store,
					name: openaiCredentialName,
				}),
			).then((result) => result.auth.apiKey),
			aliceKey,
		);
		assert.equal(
			await specifierForStoredLearner({ store, userId: bobId, operator }),
			'jon-local/auto',
		);
	});
});

const execFileAsync = promisify(execFile);
for (const provider of ['openai', 'openrouter', 'jon-local']) {
	test(`production capture isolates ${provider} credentials and model picks across HTTP and cookie-less deliveries`, async () => {
		const { stdout } = await execFileAsync(process.execPath, [
			new URL('./learner-key-runtime-fixture.mjs', import.meta.url).pathname,
			provider,
		], { timeout: 15_000 });
		assert.deepEqual(JSON.parse(stdout.trim()), {
			provider, overlappingCalls: 3, isolated: true,
		});
	});
}
