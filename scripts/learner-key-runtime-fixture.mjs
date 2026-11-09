import assert from 'node:assert/strict';
import { createAssistantMessageEventStream, createProvider } from '@earendil-works/pi-ai';
import { init } from '@flue/runtime';
import { start } from '@flue/runtime/node';
import { createAgentRouter } from '@flue/runtime/routing';
import { Chat } from '../src/agents/chat.ts';
import { installChatAutoCapture, rememberConversationAuto, wrapStreamsForChatAuto } from '../src/server/chat-auto.ts';
import { namespacedConversationId } from '../src/config/session.ts';
import { createSqliteCredentialDb } from '../src/server/credential-db.ts';
import { createCredentialStore } from '../src/server/credentials.ts';
import {
	capturedLearnerUserId,
	installLearnerKeyCapture,
	rememberConversationChatPick,
	resolveStoredLearnerApiKey,
} from '../src/server/learner-key.ts';

const name = process.argv[2];
assert.ok(name === 'openai' || name === 'openrouter' || name === 'jon-local');
const operatorMode = name === 'jon-local';
const modelId = operatorMode ? 'auto' : name === 'openai' ? 'gpt-5-nano' : 'openai/gpt-5-nano';
const requestedModelId = operatorMode ? 'auto:smart' : name === 'openai' ? 'gpt-5-mini' : 'openai/gpt-5-mini';
const secrets = { alice: 'sk-fixture-alice', bob: 'sk-fixture-bob' };
const store = createCredentialStore({
	secret: 'test-learner-key-secret-for-aes-256-gcm',
	db: createSqliteCredentialDb(':memory:'),
});
for (const [userId, value] of Object.entries(secrets)) {
	if (!operatorMode) await store.updateUserKey({ userId, name, value });
}

function overlapGate() {
	let arrived = 0;
	let release;
	let timer;
	const ready = new Promise((resolve, reject) => {
		release = resolve;
		timer = setTimeout(() => reject(new Error('Learner calls did not overlap.')), 5_000);
	});
	return async () => {
		if (++arrived === 3) {
			clearTimeout(timer);
			release();
		}
		await ready;
	};
}

const resolveTogether = overlapGate();
const wireTogether = overlapGate();
const wire = [];
const isolatedStore = {
	hasUserKey: (params) => store.hasUserKey(params),
	async getUserKey(params) {
		assert.equal(capturedLearnerUserId(), params.userId);
		assert.equal(params.name, name);
		await resolveTogether();
		return store.getUserKey(params);
	},
};

function stream(model, _context, options) {
	const output = createAssistantMessageEventStream();
	const message = {
		role: 'assistant',
		content: [{ type: 'text', text: 'ok' }],
		api: model.api,
		provider: model.provider,
		model: model.id,
		usage: {
			input: 0, output: 0, cacheRead: 0, cacheWrite: 0, totalTokens: 0,
			cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 },
		},
		stopReason: 'stop',
		timestamp: Date.now(),
	};
	void wireTogether().then(async () => {
		const payload = await options?.onPayload?.({ model: model.id }, model);
		wire.push({ userId: capturedLearnerUserId(), apiKey: options?.apiKey, modelId: payload?.model ?? model.id });
		output.push({ type: 'done', reason: 'stop', message });
		output.end(message);
	}).catch((error) => {
		const failed = { ...message, stopReason: 'error', errorMessage: String(error) };
		output.push({ type: 'error', reason: 'error', error: failed });
		output.end(failed);
	});
	return output;
}

const provider = createProvider({
	id: name,
	auth: { apiKey: { name: 'Synthetic learner key',
		resolve: async () => {
			if (!operatorMode) return resolveStoredLearnerApiKey({ store: isolatedStore, name });
			await resolveTogether();
			return { auth: { apiKey: 'sk-fixture-operator' } };
		} } },
	models: [modelId, requestedModelId].map((id) => ({
		id, name: id, api: 'openai-completions', provider: name,
		baseUrl: 'http://127.0.0.1:0/v1', reasoning: false, input: ['text'],
		cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 }, contextWindow: 8192, maxTokens: 256,
	})),
	api: wrapStreamsForChatAuto({ stream, streamSimple: stream }),
});
const captureOptions = { store: isolatedStore, operator: { providerId: 'jon-local', modelId: 'auto' } };
installLearnerKeyCapture(captureOptions);
installChatAutoCapture();
assert.doesNotThrow(() => installLearnerKeyCapture(captureOptions));
const runtime = await start({ agents: [Chat], providers: [provider] });
try {
	const router = createAgentRouter(Chat);
	async function sendHttp(userId) {
		const instanceId = namespacedConversationId(userId, 'live');
		if (userId === 'alice') {
			if (operatorMode) rememberConversationAuto(instanceId, requestedModelId);
			else rememberConversationChatPick(instanceId, `${name}/${requestedModelId}`);
		}
		const response = await router.request(`/${encodeURIComponent(instanceId)}`, {
			method: 'POST', headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ kind: 'user', body: 'Synthetic isolation check.' }),
		});
		assert.equal(response.status, 202);
		const receipt = await response.json();
		return init(Chat, { id: instanceId }).read(receipt.submissionId, { signal: AbortSignal.timeout(10_000) });
	}
	async function sendWithoutCookie() {
		const agent = init(Chat, { id: namespacedConversationId('alice', 'recover') });
		const receipt = await agent.dispatch('Synthetic cookie-less delivery.');
		return agent.read(receipt, { signal: AbortSignal.timeout(10_000) });
	}
	await Promise.all([sendHttp('alice'), sendHttp('bob'), sendWithoutCookie()]);
	assert.equal(wire.length, 3);
	assert.deepEqual(wire.map(({ userId }) => userId).sort(), ['alice', 'alice', 'bob']);
	for (const entry of wire) assert.equal(entry.apiKey, operatorMode ? 'sk-fixture-operator' : secrets[entry.userId]);
	assert.deepEqual(wire.filter(({ userId }) => userId === 'alice').map(({ modelId }) => modelId).sort(),
		[modelId, requestedModelId].sort());
	assert.equal(wire.find(({ userId }) => userId === 'bob').modelId, modelId);
	assert.equal(capturedLearnerUserId(), undefined);
	for (const secret of Object.values(secrets)) {
		assert.equal(JSON.stringify(process.env).includes(secret), false);
	}
	console.log(JSON.stringify({ provider: name, overlappingCalls: wire.length, isolated: true }));
} finally {
	await runtime.stop();
	await store.close();
}
