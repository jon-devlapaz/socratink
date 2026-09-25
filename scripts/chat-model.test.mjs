import assert from 'node:assert/strict';
import { openaiProvider } from '@earendil-works/pi-ai/providers/openai';
import { openrouterProvider } from '@earendil-works/pi-ai/providers/openrouter';
import { appConfig } from '../src/config/app.config.ts';
import {
	capOpenrouterChatMaxTokens,
	chatProviderId,
	learnerChatModelChoices,
	openaiChatModelId,
	openrouterChatMaxTokens,
	openrouterChatModelId,
	resolveChatModel,
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

console.log('Chat model routing contract passed.');
