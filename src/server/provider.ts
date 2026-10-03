import { createProvider } from '@earendil-works/pi-ai';
import { openAICompletionsApi } from '@earendil-works/pi-ai/api/openai-completions.lazy';
import { openaiProvider } from '@earendil-works/pi-ai/providers/openai';
import { openrouterProvider } from '@earendil-works/pi-ai/providers/openrouter';
import { instrument, setProvider } from '@flue/runtime';
import { resolveBetaAccess } from '../config/beta-access.ts';
import { getAuthDb } from './auth-runtime.ts';
import { createBetaModelGuard } from './beta-access.ts';
import { appConfig } from '../config/app.config.ts';
import {
	capOpenrouterChatMaxTokens,
	chatModel,
	credentialNameForLearnerChat,
	resolveChatModel,
} from '../config/chat-model.ts';
import { installPresentQuestionTextCapture } from '../agents/present-question.ts';
import { installChatAutoCapture, wrapStreamsForChatAuto } from './chat-auto.ts';
import { getCredentialStore } from './credential-runtime.ts';
import {
	installLearnerKeyCapture,
	resolveOperatorChatApiKey,
	resolveStoredLearnerApiKey,
} from './learner-key.ts';
import { installModelRouteCapture, wrapStreamsForRouteCapture } from './model-route.ts';

const openai = openaiProvider();
const openrouter = openrouterProvider();
const credentialStore = getCredentialStore();
const betaAccess = resolveBetaAccess(process.env);

setProvider(
	createProvider({
		id: chatModel.providerId,
		auth: {
			apiKey: {
				name: 'Chat model API key',
				resolve: async () =>
					resolveOperatorChatApiKey({
						apiKey: resolveChatModel(process.env).apiKey,
					}),
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
setProvider({
	...openai,
	auth: {
		apiKey: {
			name: 'OpenAI API key',
			resolve: async () =>
				resolveStoredLearnerApiKey({
					store: credentialStore,
					name: credentialNameForLearnerChat({ kind: 'openai' }),
				}),
		},
	},
});
setProvider({
	...openrouter,
	getModels: () => capOpenrouterChatMaxTokens(openrouter.getModels()),
	auth: {
		apiKey: {
			name: 'OpenRouter API key',
			resolve: async () =>
				resolveStoredLearnerApiKey({
					store: credentialStore,
					name: credentialNameForLearnerChat({ kind: 'openrouter' }),
				}),
		},
	},
});
installModelRouteCapture();
installChatAutoCapture();
installLearnerKeyCapture({
	store: credentialStore,
	operator: chatModel,
	operatorOnly: Boolean(betaAccess),
});
if (betaAccess) {
	instrument({
		key: Symbol.for('socratink.beta-access'),
		observe() {},
		interceptor: createBetaModelGuard({ policy: betaAccess, authDb: getAuthDb() }),
		dispose() {},
	});
}
installPresentQuestionTextCapture();
