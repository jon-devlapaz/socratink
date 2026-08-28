import { appConfig } from './app.config.ts';

export const chatProviderId = 'jon-local';

export type ChatModelEnvironment = {
	readonly VERCEL?: string;
	readonly NF_PROJECT_ID?: string;
	readonly JON_LOCAL_API_KEY?: string;
	readonly JON_LOCAL_BASE_URL?: string;
	readonly JON_LOCAL_MODEL_ID?: string;
	readonly AI_GATEWAY_API_KEY?: string;
	readonly VERCEL_OIDC_TOKEN?: string;
};

export type ChatModel = {
	readonly providerId: typeof chatProviderId;
	readonly baseUrl: string;
	readonly modelId: string;
	readonly apiKey: string | undefined;
	readonly reasoning: boolean;
	readonly contextWindow: number;
	readonly maxTokens: number;
};

export function resolveChatModel(environment: ChatModelEnvironment): ChatModel {
	if (environment.VERCEL === '1' || environment.NF_PROJECT_ID) {
		const apiKey = environment.AI_GATEWAY_API_KEY ?? environment.VERCEL_OIDC_TOKEN;
		if (!apiKey && environment.NF_PROJECT_ID) {
			throw new Error('AI_GATEWAY_API_KEY is required for hosted Socratink conversations.');
		}
		return {
			providerId: chatProviderId,
			baseUrl: appConfig.vercelAiGatewayBaseUrl,
			modelId: appConfig.vercelAiGatewayModelId,
			apiKey,
			reasoning: true,
			contextWindow: 204_800,
			maxTokens: 131_100,
		};
	}

	return {
		providerId: chatProviderId,
		baseUrl: environment.JON_LOCAL_BASE_URL ?? appConfig.defaultLocalBaseUrl,
		modelId: environment.JON_LOCAL_MODEL_ID ?? appConfig.defaultLocalModelId,
		apiKey: environment.JON_LOCAL_API_KEY,
		reasoning: false,
		contextWindow: 1_048_576,
		maxTokens: 1_048_576,
	};
}

export const chatModel = resolveChatModel(process.env);
