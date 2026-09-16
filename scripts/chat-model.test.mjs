import assert from 'node:assert/strict';
import { openaiProvider } from '@earendil-works/pi-ai/providers/openai';
import { openrouterProvider } from '@earendil-works/pi-ai/providers/openrouter';
import { appConfig } from '../src/config/app.config.ts';
import {
	chatProviderId,
	credentialNameForLearnerChat,
	openaiChatModelId,
	openrouterChatModelId,
	resolveChatModel,
	specifierForLearnerChat,
} from '../src/config/chat-model.ts';

const localDefaults = {
	providerId: chatProviderId,
	baseUrl: appConfig.defaultLocalBaseUrl,
	modelId: appConfig.defaultLocalModelId,
	apiKey: undefined,
	reasoning: true,
	contextWindow: 1_048_576,
	maxTokens: 131_100,
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
	assert.deepEqual(
		resolveChatModel({
			NF_PROJECT_ID: 'socratink',
			JON_LOCAL_BASE_URL: 'https://models.example.com/v1',
			JON_LOCAL_API_KEY: 'freellmapi-key',
		}),
		{
			providerId: chatProviderId,
			baseUrl: 'https://models.example.com/v1',
			modelId: appConfig.defaultLocalModelId,
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
	assert.deepEqual(resolveChatModel({ VERCEL: '1' }), {
		providerId: chatProviderId,
		baseUrl: appConfig.vercelAiGatewayBaseUrl,
		modelId: appConfig.vercelAiGatewayModelId,
		apiKey: undefined,
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
	assert.equal(
		specifierForLearnerChat({ kind: 'operator' }, { providerId: chatProviderId, modelId: 'auto' }),
		'jon-local/auto',
	);
	assert.equal(specifierForLearnerChat({ kind: 'openai' }), 'openai/gpt-5-nano');
	assert.equal(specifierForLearnerChat({ kind: 'openrouter' }), 'openrouter/openai/gpt-5-nano');
	assert.equal(credentialNameForLearnerChat({ kind: 'openai' }), 'openai');
	assert.equal(credentialNameForLearnerChat({ kind: 'openrouter' }), 'openrouter');
}

console.log('Chat model routing contract passed.');
