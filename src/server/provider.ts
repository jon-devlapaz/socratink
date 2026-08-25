import { createProvider } from '@earendil-works/pi-ai';
import { openAICompletionsApi } from '@earendil-works/pi-ai/api/openai-completions.lazy';
import { setProvider } from '@flue/runtime';
import { localModelApiKey, localModelBaseUrl } from '../config/environment.ts';

setProvider(
	createProvider({
		id: 'jon-local',
		auth: {
			apiKey: {
				name: 'Jon local model API key',
				resolve: async () => ({ auth: { apiKey: localModelApiKey(process.env) } }),
			},
		},
		models: [
			{
				id: 'auto',
				name: 'Auto',
				api: 'openai-completions',
				provider: 'jon-local',
				baseUrl: localModelBaseUrl(process.env),
				reasoning: false,
				input: ['text'],
				cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
				contextWindow: 1_048_576,
				maxTokens: 1_048_576,
			},
		],
		api: openAICompletionsApi(),
	}),
);
