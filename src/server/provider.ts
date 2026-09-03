import { createProvider } from '@earendil-works/pi-ai';
import { openAICompletionsApi } from '@earendil-works/pi-ai/api/openai-completions.lazy';
import { setProvider } from '@flue/runtime';
import { appConfig } from '../config/app.config.ts';
import { chatModel, resolveChatModel } from '../config/chat-model.ts';
import { installChatAutoCapture, wrapStreamsForChatAuto } from './chat-auto.ts';
import { installModelRouteCapture, wrapStreamsForRouteCapture } from './model-route.ts';

setProvider(
	createProvider({
		id: chatModel.providerId,
		auth: {
			apiKey: {
				name: 'Chat model API key',
				resolve: async () => ({ auth: { apiKey: resolveChatModel(process.env).apiKey } }),
			},
		},
		models: [
			{
				id: chatModel.modelId,
				name: chatModel.modelId,
				api: 'openai-completions',
				provider: chatModel.providerId,
				baseUrl: chatModel.baseUrl,
				reasoning: chatModel.reasoning,
				compat: {
					supportsReasoningEffort:
						chatModel.baseUrl === appConfig.vercelAiGatewayBaseUrl,
				},
				input: ['text'],
				cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
				contextWindow: chatModel.contextWindow,
				maxTokens: chatModel.maxTokens,
			},
		],
		api: wrapStreamsForChatAuto(wrapStreamsForRouteCapture(openAICompletionsApi())),
	}),
);
installModelRouteCapture();
installChatAutoCapture();
