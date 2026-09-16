import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import {
	createAssistantMessageEventStream,
	createModels,
	createProvider,
	InMemoryCredentialStore,
} from '@earendil-works/pi-ai';
import { specifierForLearnerChat } from '../src/config/chat-model.ts';
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
	requireAgentInstanceUserId,
	resolveLearnerChatApiKey,
	runWithChatSpecifier,
	runWithLearnerKey,
	specifierForStoredLearner,
} from '../src/server/learner-key.ts';

const testSecret = 'test-learner-key-secret-for-aes-256-gcm';
const aliceId = 'alice';
const bobId = 'bob';
const aliceKey = 'sk-fixture-alice';
const bobKey = 'sk-fixture-bob';
const operatorKey = 'sk-fixture-operator';
const aliceLiveId = namespacedConversationId(aliceId, 'live');
const bobLiveId = namespacedConversationId(bobId, 'live');
const aliceRecoverId = namespacedConversationId(aliceId, 'recover');
const providerId = 'jon-local';
const modelId = 'hotel-safety';

function createOverlapGate(count) {
	let arrived = 0;
	/** @type {() => void} */
	let release;
	/** @type {ReturnType<typeof setTimeout>} */
	let timeout;
	const released = new Promise((resolve, reject) => {
		release = resolve;
		timeout = setTimeout(() => reject(new Error('overlap gate timed out')), 2_000);
	});
	return {
		async arrive() {
			arrived += 1;
			if (arrived === count) {
				clearTimeout(timeout);
				release();
			}
			await released;
		},
	};
}

function envHasFixtureSecret() {
	const serialized = JSON.stringify(process.env);
	return (
		serialized.includes(aliceKey) || serialized.includes(bobKey) || serialized.includes(operatorKey)
	);
}

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

function finishStream(model) {
	const stream = createAssistantMessageEventStream();
	const message = {
		role: 'assistant',
		content: [{ type: 'text', text: 'ok' }],
		api: model.api,
		provider: model.provider,
		model: model.id,
		usage: {
			input: 0,
			output: 0,
			cacheRead: 0,
			cacheWrite: 0,
			totalTokens: 0,
			cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 },
		},
		stopReason: 'stop',
		timestamp: Date.now(),
	};
	stream.push({ type: 'done', message });
	stream.end(message);
	return stream;
}

function createIsolatedModels(options) {
	const credentials = new InMemoryCredentialStore();
	const models = createModels({ credentials });
	models.setProvider(
		createProvider({
			id: providerId,
			auth: {
				apiKey: {
					name: 'Chat model API key',
					resolve: () =>
						resolveLearnerChatApiKey({
							store: options.store,
							operatorApiKey: operatorKey,
						}),
				},
			},
			models: [
				{
					id: modelId,
					name: modelId,
					api: 'openai-completions',
					provider: providerId,
					baseUrl: 'http://127.0.0.1:0/v1',
					reasoning: false,
					input: ['text'],
					cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
					contextWindow: 1024,
					maxTokens: 256,
				},
			],
			api: {
				stream(streamModel, _context, streamOptions) {
					return options.onWire(streamModel, streamOptions);
				},
				streamSimple(streamModel, _context, streamOptions) {
					return options.onWire(streamModel, streamOptions);
				},
			},
		}),
	);
	return { credentials, models, model: models.getModel(providerId, modelId) };
}

test('overlapping streams plus cookie-less recovery keep each learner key on its own wire', async () => {
	assert.equal(envHasFixtureSecret(), false);
	assert.equal(capturedLearnerUserId(), undefined);

	await withStore(async (store) => {
		await store.updateUserKey({ userId: aliceId, name: openaiCredentialName, value: aliceKey });
		await store.updateUserKey({ userId: bobId, name: openaiCredentialName, value: bobKey });

		const resolveGate = createOverlapGate(3);
		const wireGate = createOverlapGate(3);
		/** @type {{ userId: string | undefined, apiKey: string | undefined }[]} */
		const wire = [];
		const isolatedStore = {
			async getUserKey(params) {
				assert.equal(capturedLearnerUserId(), params.userId);
				assert.notEqual(process.env.JON_LOCAL_API_KEY, params.userId === aliceId ? aliceKey : bobKey);
				await resolveGate.arrive();
				return store.getUserKey(params);
			},
		};

		const { credentials, models, model } = createIsolatedModels({
			store: isolatedStore,
			async onWire(streamModel, streamOptions) {
				await wireGate.arrive();
				wire.push({
					userId: capturedLearnerUserId(),
					apiKey: streamOptions?.apiKey,
				});
				return finishStream(streamModel);
			},
		});
		assert.ok(model);

		async function streamConversation(instanceId) {
			return runWithLearnerKey(instanceId, async () => {
				const result = await models.streamSimple(model, { messages: [] }).result();
				assert.equal(result?.stopReason, 'stop');
			});
		}

		await Promise.all([
			streamConversation(aliceLiveId),
			streamConversation(bobLiveId),
			streamConversation(aliceRecoverId),
		]);

		assert.equal(capturedLearnerUserId(), undefined);
		assert.equal(wire.length, 3);

		const aliceWires = wire.filter((entry) => entry.apiKey === aliceKey);
		const bobWires = wire.filter((entry) => entry.apiKey === bobKey);
		assert.equal(aliceWires.length, 2);
		assert.equal(bobWires.length, 1);
		assert.equal(
			wire.some((entry) => entry.apiKey === aliceKey && entry.userId === bobId),
			false,
		);
		assert.equal(
			wire.some((entry) => entry.apiKey === bobKey && entry.userId === aliceId),
			false,
		);
		assert.equal(
			wire.some((entry) => entry.apiKey === operatorKey),
			false,
		);
		for (const entry of aliceWires) {
			assert.equal(entry.userId, aliceId);
		}
		assert.equal(bobWires[0]?.userId, bobId);
		assert.deepEqual(await credentials.list(), []);
		assert.equal(envHasFixtureSecret(), false);
		assert.notEqual(process.env.JON_LOCAL_API_KEY, aliceKey);
		assert.notEqual(process.env.JON_LOCAL_API_KEY, bobKey);
	});
});

test('a stored-key resolve does not fall back to the operator key when the row is missing', async () => {
	await withStore(async (store) => {
		await assert.rejects(
			() =>
				runWithLearnerKey(aliceLiveId, () =>
					resolveLearnerChatApiKey({
						store,
						operatorApiKey: operatorKey,
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
				resolveLearnerChatApiKey({
					store,
					operatorApiKey: operatorKey,
				}),
			(error) => {
				assert.equal(error instanceof UserKeyError, true);
				assert.equal(error.type, missingUserKeyError.type);
				return true;
			},
		);
	});
});

test('unsigned and disconnected Chat keep the operator key on jon-local', async () => {
	assert.deepEqual(await resolveLearnerChatApiKey({ operatorApiKey: operatorKey }), {
		auth: { apiKey: operatorKey },
	});
	assert.deepEqual(
		await runWithLearnerKey(aliceLiveId, () =>
			resolveLearnerChatApiKey({ operatorApiKey: operatorKey }),
		),
		{ auth: { apiKey: operatorKey } },
	);
});

test('Chat uses openai/gpt-5-nano only while a learner key is connected', async () => {
	const operator = { providerId: 'jon-local', modelId: 'auto' };
	assert.equal(specifierForLearnerChat({ kind: 'operator' }, operator), 'jon-local/auto');
	assert.equal(specifierForLearnerChat({ kind: 'openai' }), 'openai/gpt-5-nano');
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
