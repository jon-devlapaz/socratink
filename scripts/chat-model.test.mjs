import assert from 'node:assert/strict';
import { appConfig } from '../src/config/app.config.ts';
import { chatProviderId, resolveChatModel } from '../src/config/chat-model.ts';

const localDefaults = {
	providerId: chatProviderId,
	baseUrl: appConfig.defaultLocalBaseUrl,
	modelId: appConfig.defaultLocalModelId,
	apiKey: undefined,
	reasoning: false,
};

{
	assert.deepEqual(resolveChatModel({}), localDefaults);
}

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
			reasoning: false,
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
			reasoning: false,
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
	});
}

{
	const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
	const reads = [];
	await Promise.all([
		(async () => {
			process.env.VERCEL_OIDC_TOKEN = 'first';
			await wait(20);
			reads.push(
				resolveChatModel({ VERCEL: '1', VERCEL_OIDC_TOKEN: process.env.VERCEL_OIDC_TOKEN }).apiKey,
			);
		})(),
		(async () => {
			process.env.VERCEL_OIDC_TOKEN = 'second';
			await wait(0);
			reads.push(
				resolveChatModel({ VERCEL: '1', VERCEL_OIDC_TOKEN: process.env.VERCEL_OIDC_TOKEN }).apiKey,
			);
		})(),
	]);
	assert.deepEqual(reads, ['second', 'second']);
	delete process.env.VERCEL_OIDC_TOKEN;
}

console.log('Chat model routing contract passed.');
