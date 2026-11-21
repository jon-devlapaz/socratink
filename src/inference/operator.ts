import { appConfig } from '../config/app.config.ts';
import { chatProviderId, type ChatModel } from '../config/chat-model.ts';

export type ChatModelEnvironment = {
	readonly VERCEL?: string;
	readonly JON_LOCAL_API_KEY?: string;
	readonly JON_LOCAL_BASE_URL?: string;
	readonly JON_LOCAL_MODEL_ID?: string;
	readonly AI_GATEWAY_API_KEY?: string;
	readonly VERCEL_OIDC_TOKEN?: string;
};

const localChatModelLimits = {
	// Keeps thinking blocks. Effort is sent only on the Vercel gateway URL.
	reasoning: true,
	contextWindow: 1_048_576,
	maxTokens: 131_100,
} as const;

// The gateway routes this model to whichever provider serves it. Providers cap
// output differently (Novita caps it at 131,072 tokens), so ask for far less.
const hostedGatewayLimits = {
	reasoning: true,
	contextWindow: 204_800,
	maxTokens: 32_768,
} as const;

/** The operator's model, or undefined when a hosted deploy has no credential. */
export function resolveChatModel(environment: ChatModelEnvironment): ChatModel | undefined {
	if (environment.VERCEL === '1') {
		const apiKey = environment.AI_GATEWAY_API_KEY ?? environment.VERCEL_OIDC_TOKEN;
		if (!apiKey) return undefined;
		return {
			providerId: chatProviderId,
			baseUrl: appConfig.vercelAiGatewayBaseUrl,
			modelId: appConfig.vercelAiGatewayModelId,
			apiKey,
			...hostedGatewayLimits,
		};
	}

	return {
		providerId: chatProviderId,
		baseUrl: environment.JON_LOCAL_BASE_URL ?? appConfig.defaultLocalBaseUrl,
		modelId: environment.JON_LOCAL_MODEL_ID ?? appConfig.defaultLocalModelId,
		apiKey: environment.JON_LOCAL_API_KEY,
		...localChatModelLimits,
	};
}
