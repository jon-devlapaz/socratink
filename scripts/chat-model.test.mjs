import assert from 'node:assert/strict';
import { openaiProvider } from '@earendil-works/pi-ai/providers/openai';
import { openrouterProvider } from '@earendil-works/pi-ai/providers/openrouter';
import { resolveChatModel } from '../src/config/operator-model.ts';
import { appConfig } from '../src/config/app.config.ts';
import {
	applyLearnerChatPick,
	specifierForLearnerChatFromStatus,
	capOpenrouterChatMaxTokens,
	chatProviderId,
	learnerChatModelChoices,
	openaiChatModelId,
	openrouterChatMaxTokens,
	openrouterChatModelId,
} from '../src/config/chat-model.ts';

{
	assert.deepEqual(
		resolveChatModel({
			JON_LOCAL_BASE_URL: 'http://127.0.0.1:9/v1',
			JON_LOCAL_MODEL_ID: 'local-id',
			JON_LOCAL_API_KEY: 'local-key',
		}),
		{
			providerId: chatProviderId,
			baseUrl: 'http://127.0.0.1:9/v1',
			modelId: 'local-id',
			apiKey: 'local-key',
			reasoning: true,
			contextWindow: 1_048_576,
			maxTokens: 131_100,
		},
	);
}

{
	assert.deepEqual(
		resolveChatModel({
			JON_LOCAL_BASE_URL: appConfig.vercelAiGatewayBaseUrl,
			JON_LOCAL_API_KEY: 'local-key',
			AI_GATEWAY_API_KEY: 'gateway-key',
		}),
		{
			providerId: chatProviderId,
			baseUrl: appConfig.vercelAiGatewayBaseUrl,
			modelId: appConfig.defaultLocalModelId,
			apiKey: 'local-key',
			reasoning: true,
			contextWindow: 1_048_576,
			maxTokens: 131_100,
		},
	);
}

{
	assert.deepEqual(
		resolveChatModel({
			VERCEL: '1',
			JON_LOCAL_BASE_URL: 'http://127.0.0.1:3001/v1',
			JON_LOCAL_MODEL_ID: 'auto',
			JON_LOCAL_API_KEY: 'local-key',
			AI_GATEWAY_API_KEY: 'gateway-key',
			VERCEL_OIDC_TOKEN: 'oidc-token',
		}),
		{
			providerId: chatProviderId,
			baseUrl: appConfig.vercelAiGatewayBaseUrl,
			modelId: appConfig.vercelAiGatewayModelId,
			apiKey: 'gateway-key',
			reasoning: true,
			contextWindow: 204_800,
			maxTokens: 131_100,
		},
	);
}

{
	assert.deepEqual(
		resolveChatModel({
			VERCEL: '1',
			JON_LOCAL_BASE_URL: 'https://models.example.com/v1',
			JON_LOCAL_MODEL_ID: 'auto',
			JON_LOCAL_API_KEY: 'freellmapi-key',
			AI_GATEWAY_API_KEY: 'gateway-key',
			VERCEL_OIDC_TOKEN: 'oidc-token',
		}),
		{
			providerId: chatProviderId,
			baseUrl: 'https://models.example.com/v1',
			modelId: 'auto',
			apiKey: 'freellmapi-key',
			reasoning: true,
			contextWindow: 1_048_576,
			maxTokens: 131_100,
		},
	);
}

{
	assert.deepEqual(resolveChatModel({ VERCEL: '1', VERCEL_OIDC_TOKEN: 'oidc-token' }), {
		providerId: chatProviderId,
		baseUrl: appConfig.vercelAiGatewayBaseUrl,
		modelId: appConfig.vercelAiGatewayModelId,
		apiKey: 'oidc-token',
		reasoning: true,
		contextWindow: 204_800,
		maxTokens: 131_100,
	});
}

{
	assert.deepEqual(resolveChatModel({ NF_PROJECT_ID: 'socratink', AI_GATEWAY_API_KEY: 'gateway-key' }), {
		providerId: chatProviderId,
		baseUrl: appConfig.vercelAiGatewayBaseUrl,
		modelId: appConfig.vercelAiGatewayModelId,
		apiKey: 'gateway-key',
		reasoning: true,
		contextWindow: 204_800,
		maxTokens: 131_100,
	});
}

{
	assert.throws(
		() => resolveChatModel({ NF_PROJECT_ID: 'socratink' }),
		/AI_GATEWAY_API_KEY is required for hosted Socratink conversations/,
	);
}

{
	assert.equal(
		openaiProvider()
			.getModels()
			.some((model) => model.id === openaiChatModelId),
		true,
	);
	assert.equal(
		openrouterProvider()
			.getModels()
			.some((model) => model.id === openrouterChatModelId),
		true,
	);
	for (const choice of learnerChatModelChoices) {
		assert.equal(
			openaiProvider()
				.getModels()
				.some((model) => model.id === choice.openaiModelId),
			true,
		);
		assert.equal(
			openrouterProvider()
				.getModels()
				.some((model) => model.id === choice.openrouterModelId),
			true,
		);
	}
}

{
	const catalog = openrouterProvider().getModels();
	assert.equal(openrouterChatMaxTokens, 8192);
	assert.ok(openrouterChatMaxTokens < 100000);

	const capped = capOpenrouterChatMaxTokens(catalog);
	const cappedNano = capped.find((model) => model.id === openrouterChatModelId);
	assert.equal(cappedNano?.maxTokens, openrouterChatMaxTokens);
	for (const choice of learnerChatModelChoices) {
		assert.equal(
			capped.find((model) => model.id === choice.openrouterModelId)?.maxTokens,
			openrouterChatMaxTokens,
		);
	}
	const allowlisted = new Set(
		learnerChatModelChoices.map((choice) => choice.openrouterModelId),
	);
	const other = catalog.find((model) => !allowlisted.has(model.id));
	assert.ok(other);
	assert.equal(
		capped.find((model) => model.id === other.id)?.maxTokens,
		other.maxTokens,
	);
}

const operator = { providerId: 'jon-local', modelId: 'auto' };
for (const [status, requested, expected] of [
	[{ openai: false, openrouter: false }, 'openai/gpt-5', 'jon-local/auto'],
	[{ openai: true, openrouter: false }, 'openrouter/openai/gpt-5', 'openai/gpt-5-nano'],
	[{ openai: false, openrouter: true }, 'openai/gpt-5', 'openrouter/openai/gpt-5-nano'],
	[{ openai: true, openrouter: true }, undefined, 'openrouter/openai/gpt-5-nano'],
	[{ openai: true, openrouter: true }, 'openai/gpt-5', 'openai/gpt-5'],
	[{ openai: true, openrouter: true }, 'openrouter/openai/gpt-5-mini', 'openrouter/openai/gpt-5-mini'],
	[{ openai: true, openrouter: true }, 'openai/unlisted', 'openrouter/openai/gpt-5-nano'],
]) {
	assert.equal(specifierForLearnerChatFromStatus(status, operator, requested), expected);
}
const selected = { kind: 'openai', openai: true, openrouter: true };
assert.deepEqual(applyLearnerChatPick(selected, 'openrouter/openai/gpt-5'), {
	kind: 'openrouter', openai: true, openrouter: true,
});
assert.deepEqual(applyLearnerChatPick(selected, 'unlisted'), selected);
assert.equal(resolveChatModel({ NODE_ENV: 'production' }).baseUrl, appConfig.defaultLocalBaseUrl);

console.log('Chat model routing contract passed.');
