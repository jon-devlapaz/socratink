import assert from 'node:assert/strict';
import { openaiProvider } from '@earendil-works/pi-ai/providers/openai';
import { resolveChatModel } from '../src/inference/operator.ts';
import { appConfig } from '../src/config/app.config.ts';
import {
	applyLearnerChatPick,
	specifierForLearnerChatFromStatus,
	chatProviderId,
	learnerChatModelChoices,
	openaiChatModelId,
	parseLearnerChatSpecifier,
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
	// A hosted deploy with no credential is unconfigured, not a crash at import.
	assert.equal(resolveChatModel({ NF_PROJECT_ID: 'socratink' }), undefined);
	assert.equal(resolveChatModel({ VERCEL: '1' }), undefined);
}

{
	assert.equal(
		openaiProvider()
			.getModels()
			.some((model) => model.id === openaiChatModelId),
		true,
	);
	for (const choice of learnerChatModelChoices) {
		assert.equal(
			openaiProvider()
				.getModels()
				.some((model) => model.id === choice.openaiModelId),
			true,
		);
	}
}

const operator = { providerId: 'jon-local', modelId: 'auto' };
for (const [status, requested, expected] of [
	[{ openai: false }, 'openai/gpt-5', 'jon-local/auto'],
	[{ openai: true }, undefined, 'openai/gpt-5-nano'],
	[{ openai: true }, 'openai/gpt-5', 'openai/gpt-5'],
	[{ openai: true }, 'openai/unlisted', 'openai/gpt-5-nano'],
	// A pick saved for a retired provider follows the learner's current route.
	[{ openai: true }, 'openrouter/openai/gpt-5', 'openai/gpt-5-nano'],
	[{ openai: false }, 'openrouter/openai/gpt-5', 'jon-local/auto'],
]) {
	assert.equal(specifierForLearnerChatFromStatus(status, operator, requested), expected);
}
assert.equal(parseLearnerChatSpecifier('openrouter/openai/gpt-5'), undefined);
const selected = { kind: 'openai', openai: true };
assert.deepEqual(applyLearnerChatPick({ kind: 'operator', openai: true }, 'openai/gpt-5'), selected);
assert.deepEqual(applyLearnerChatPick(selected, 'openrouter/openai/gpt-5'), selected);
assert.deepEqual(applyLearnerChatPick(selected, 'unlisted'), selected);
assert.equal(resolveChatModel({ NODE_ENV: 'production' }).baseUrl, appConfig.defaultLocalBaseUrl);

console.log('Chat model routing contract passed.');
