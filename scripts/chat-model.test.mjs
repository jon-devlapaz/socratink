import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { resolveChatModel } from '../src/inference/operator.ts';
import { appConfig } from '../src/config/app.config.ts';

const local = {
	providerId: 'jon-local', baseUrl: appConfig.defaultLocalBaseUrl, modelId: appConfig.defaultLocalModelId,
	apiKey: undefined, reasoning: true, contextWindow: 1_048_576, maxTokens: 131_100,
};
const hosted = {
	providerId: 'jon-local', baseUrl: appConfig.vercelAiGatewayBaseUrl, modelId: appConfig.vercelAiGatewayModelId,
	fallbackModelIds: appConfig.vercelAiGatewayFallbackModelIds,
	apiKey: 'gateway-key', reasoning: true, contextWindow: 204_800, maxTokens: 32_768,
};

describe('resolveChatModel', () => {
	for (const [name, environment, expected] of [
		['local defaults', {}, local],
		['blank local settings', { JON_LOCAL_BASE_URL: '', JON_LOCAL_MODEL_ID: '  ' }, local],
		['production outside Vercel', { NODE_ENV: 'production' }, local],
		['local settings with surrounding spaces', {
			JON_LOCAL_BASE_URL: ' http://127.0.0.1:9/v1 ', JON_LOCAL_MODEL_ID: ' local-id ', JON_LOCAL_API_KEY: 'local-key',
		}, { ...local, baseUrl: 'http://127.0.0.1:9/v1', modelId: 'local-id', apiKey: 'local-key' }],
		['a local operator using a gateway URL', {
			JON_LOCAL_BASE_URL: appConfig.vercelAiGatewayBaseUrl, JON_LOCAL_API_KEY: 'local-key', AI_GATEWAY_API_KEY: 'gateway-key',
		}, { ...local, baseUrl: appConfig.vercelAiGatewayBaseUrl, apiKey: 'local-key' }],
		['a gateway key on Vercel', { VERCEL: '1', AI_GATEWAY_API_KEY: 'gateway-key' }, hosted],
		['a Vercel identity token', { VERCEL: '1', VERCEL_OIDC_TOKEN: 'oidc-token' }, { ...hosted, apiKey: 'oidc-token' }],
		['a gateway key alongside local and identity credentials', {
			VERCEL: '1', AI_GATEWAY_API_KEY: 'gateway-key', VERCEL_OIDC_TOKEN: 'oidc-token',
			JON_LOCAL_BASE_URL: 'https://models.example.com/v1', JON_LOCAL_MODEL_ID: 'auto', JON_LOCAL_API_KEY: 'local-key',
		}, hosted],
		['no hosted credential', { VERCEL: '1' }, undefined],
		['a local credential alone on Vercel', {
			VERCEL: '1', JON_LOCAL_BASE_URL: 'https://models.example.com/v1', JON_LOCAL_API_KEY: 'local-key',
		}, undefined],
	]) {
		it(name, () => assert.deepEqual(resolveChatModel(environment), expected));
	}
});
