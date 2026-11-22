import assert from 'node:assert/strict';
import { resolveChatModel } from '../src/inference/operator.ts';
import { appConfig } from '../src/config/app.config.ts';
import { chatProviderId } from '../src/config/chat-model.ts';

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
			JON_LOCAL_BASE_URL: 'https://models.example.com/v1',
			JON_LOCAL_MODEL_ID: 'auto',
			JON_LOCAL_API_KEY: 'local-key',
			AI_GATEWAY_API_KEY: 'gateway-key',
			VERCEL_OIDC_TOKEN: 'oidc-token',
		}),
		{
			providerId: chatProviderId,
			baseUrl: appConfig.vercelAiGatewayBaseUrl,
			modelId: appConfig.vercelAiGatewayModelId,
			fallbackModelIds: appConfig.vercelAiGatewayFallbackModelIds,
			apiKey: 'gateway-key',
			reasoning: true,
			contextWindow: 204_800,
			maxTokens: 32_768,
		},
	);
}

{
	assert.deepEqual(resolveChatModel({ VERCEL: '1', VERCEL_OIDC_TOKEN: 'oidc-token' }), {
		providerId: chatProviderId,
		baseUrl: appConfig.vercelAiGatewayBaseUrl,
		modelId: appConfig.vercelAiGatewayModelId,
		fallbackModelIds: appConfig.vercelAiGatewayFallbackModelIds,
		apiKey: 'oidc-token',
		reasoning: true,
		contextWindow: 204_800,
		maxTokens: 32_768,
	});
}

{
	assert.deepEqual(resolveChatModel({ VERCEL: '1', AI_GATEWAY_API_KEY: 'gateway-key' }), {
		providerId: chatProviderId,
		baseUrl: appConfig.vercelAiGatewayBaseUrl,
		modelId: appConfig.vercelAiGatewayModelId,
		fallbackModelIds: appConfig.vercelAiGatewayFallbackModelIds,
		apiKey: 'gateway-key',
		reasoning: true,
		contextWindow: 204_800,
		maxTokens: 32_768,
	});
}

{
	// A hosted deploy with no credential is unconfigured, not a crash at import.
	assert.equal(resolveChatModel({ VERCEL: '1' }), undefined);
	assert.equal(resolveChatModel({ VERCEL: '1', JON_LOCAL_BASE_URL: 'https://models.example.com/v1',
		JON_LOCAL_API_KEY: 'local-key' }), undefined);
}

assert.equal(resolveChatModel({ NODE_ENV: 'production' }).baseUrl, appConfig.defaultLocalBaseUrl);

console.log('Chat model routing contract passed.');
