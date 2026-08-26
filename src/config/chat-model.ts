import { appConfig } from './app.config.ts';

export const chatProviderId = 'jon-local';

export type ChatModelEnvironment = {
	readonly VERCEL?: string;
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
};

export function resolveChatModel(environment: ChatModelEnvironment): ChatModel {
	if (environment.VERCEL === '1') {
		return {
			providerId: chatProviderId,
			baseUrl: appConfig.vercelAiGatewayBaseUrl,
			modelId: appConfig.vercelAiGatewayModelId,
			apiKey: environment.AI_GATEWAY_API_KEY ?? environment.VERCEL_OIDC_TOKEN,
			reasoning: true,
		};
	}

	return {
		providerId: chatProviderId,
		baseUrl: environment.JON_LOCAL_BASE_URL ?? appConfig.defaultLocalBaseUrl,
		modelId: environment.JON_LOCAL_MODEL_ID ?? appConfig.defaultLocalModelId,
		apiKey: environment.JON_LOCAL_API_KEY,
		reasoning: false,
	};
}

export const chatModel = resolveChatModel(process.env);
