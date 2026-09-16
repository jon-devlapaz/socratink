import { appConfig } from './app.config.ts';

export const chatProviderId = 'jon-local';

export const openaiChatProviderId = 'openai';

export const openrouterChatProviderId = 'openrouter';

// Curated Pi catalog ids only. Same GPT name on both lists; the prefix is who pays.
export const learnerChatModelChoices = [
	{ label: 'GPT-5 nano', openaiModelId: 'gpt-5-nano', openrouterModelId: 'openai/gpt-5-nano' },
	{ label: 'GPT-5 mini', openaiModelId: 'gpt-5-mini', openrouterModelId: 'openai/gpt-5-mini' },
	{ label: 'GPT-5', openaiModelId: 'gpt-5', openrouterModelId: 'openai/gpt-5' },
] as const;

export const openaiChatModelId = learnerChatModelChoices[0].openaiModelId;

export const openrouterChatModelId = learnerChatModelChoices[0].openrouterModelId;

export const chatModelHeader = 'x-socratink-chat-model';

// OpenRouter reserves requested max_tokens as credit collateral. Pi's catalog
// sets these models to 128000, which 402s low-credit accounts before a short
// Chat turn can run. 8192 is enough for a Socratic turn with tools.
export const openrouterChatMaxTokens = 8192;

const openrouterCappedModelIds: ReadonlySet<string> = new Set(
	learnerChatModelChoices.map((choice) => choice.openrouterModelId),
);

export function capOpenrouterChatMaxTokens<T extends { readonly id: string; readonly maxTokens: number }>(
	models: readonly T[],
): T[] {
	return models.map((model) =>
		openrouterCappedModelIds.has(model.id)
			? { ...model, maxTokens: openrouterChatMaxTokens }
			: model,
	);
}

export type LearnerChatRoute =
	| { kind: 'operator' }
	| { kind: 'openai'; modelId?: string }
	| { kind: 'openrouter'; modelId?: string };

export type LearnerChatSpecifier =
	| { kind: 'openai'; modelId: (typeof learnerChatModelChoices)[number]['openaiModelId'] }
	| { kind: 'openrouter'; modelId: (typeof learnerChatModelChoices)[number]['openrouterModelId'] };

export type LearnerCredentialName = Exclude<LearnerChatRoute['kind'], 'operator'>;

export type LearnerChatStatus = {
	kind: LearnerChatRoute['kind'];
	openai: boolean;
	openrouter: boolean;
};

export const operatorChatStatus: LearnerChatStatus = {
	kind: 'operator',
	openai: false,
	openrouter: false,
};

export function credentialNameForLearnerChat(
	route: Extract<LearnerChatRoute, { kind: LearnerCredentialName }>,
): LearnerCredentialName {
	switch (route.kind) {
		case 'openai':
			return 'openai';
		case 'openrouter':
			return 'openrouter';
		default: {
			const exhaustive: never = route;
			throw new Error(`Unexpected learner credential route: ${JSON.stringify(exhaustive)}`);
		}
	}
}

export function isLearnerChatStatus(value: unknown): value is LearnerChatStatus {
	if (typeof value !== 'object' || value === null) return false;
	if (!('kind' in value) || !('openai' in value) || !('openrouter' in value)) return false;
	if (value.openai !== true && value.openai !== false) return false;
	if (value.openrouter !== true && value.openrouter !== false) return false;
	switch (value.kind) {
		case 'operator':
		case 'openai':
		case 'openrouter':
			return true;
		default:
			return false;
	}
}

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

const localChatModelLimits = {
	// Lets Flue keep thinking blocks. Effort is sent only on the Vercel gateway URL.
	reasoning: true,
	contextWindow: 1_048_576,
	maxTokens: 131_100,
} as const;

const hostedGatewayLimits = {
	reasoning: true,
	contextWindow: 204_800,
	maxTokens: 131_100,
} as const;

function isPublicHttpsUrl(value: string): boolean {
	try {
		const url = new URL(value);
		if (url.protocol !== 'https:') return false;
		const host = url.hostname.toLowerCase();
		if (!host.includes('.')) return false;
		if (host === 'localhost' || host.endsWith('.local')) return false;
		if (/^(127\.|10\.|192\.168\.|169\.254\.|100\.)/.test(host)) return false;
		if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(host)) return false;
		return true;
	} catch {
		return false;
	}
}

function hostedLocalOverride(environment: ChatModelEnvironment): ChatModel | undefined {
	const baseUrl = environment.JON_LOCAL_BASE_URL?.trim();
	const apiKey = environment.JON_LOCAL_API_KEY?.trim();
	// Vercel cannot reach Tailscale CGNAT or loopback, so those stay on AI Gateway.
	if (!baseUrl || !apiKey || !isPublicHttpsUrl(baseUrl)) return undefined;
	const modelId = environment.JON_LOCAL_MODEL_ID?.trim() || appConfig.defaultLocalModelId;
	return {
		providerId: chatProviderId,
		baseUrl,
		modelId,
		apiKey,
		...localChatModelLimits,
	};
}

export function resolveChatModel(environment: ChatModelEnvironment): ChatModel {
	if (environment.VERCEL === '1' || environment.NF_PROJECT_ID) {
		const override = hostedLocalOverride(environment);
		if (override) return override;

		const apiKey = environment.AI_GATEWAY_API_KEY ?? environment.VERCEL_OIDC_TOKEN;
		if (!apiKey && environment.NF_PROJECT_ID) {
			throw new Error('AI_GATEWAY_API_KEY is required for hosted Socratink conversations.');
		}
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

export const chatModel = resolveChatModel(process.env);

export function parseLearnerChatSpecifier(value: string | undefined | null): LearnerChatSpecifier | undefined {
	if (!value) return undefined;
	const trimmed = value.trim();
	const openrouterPrefix = `${openrouterChatProviderId}/`;
	if (trimmed.startsWith(openrouterPrefix)) {
		const modelId = trimmed.slice(openrouterPrefix.length);
		if (isOpenrouterChatModelId(modelId)) return { kind: 'openrouter', modelId };
		return undefined;
	}
	const openaiPrefix = `${openaiChatProviderId}/`;
	if (trimmed.startsWith(openaiPrefix)) {
		const modelId = trimmed.slice(openaiPrefix.length);
		if (isOpenaiChatModelId(modelId)) return { kind: 'openai', modelId };
	}
	return undefined;
}

export function formatLearnerChatSpecifier(pick: LearnerChatSpecifier): string {
	switch (pick.kind) {
		case 'openai':
			return `${openaiChatProviderId}/${pick.modelId}`;
		case 'openrouter':
			return `${openrouterChatProviderId}/${pick.modelId}`;
		default: {
			const exhaustive: never = pick;
			throw new Error(`Unexpected chat specifier: ${JSON.stringify(exhaustive)}`);
		}
	}
}

export function applyLearnerChatPick(
	status: LearnerChatStatus,
	requested: string | undefined | null,
): LearnerChatStatus {
	const pick = parseLearnerChatSpecifier(requested);
	if (pick?.kind === 'openrouter' && status.openrouter) {
		return { ...status, kind: 'openrouter' };
	}
	if (pick?.kind === 'openai' && status.openai) {
		return { ...status, kind: 'openai' };
	}
	return status;
}

export function specifierForLearnerChatFromStatus(
	status: Pick<LearnerChatStatus, 'openai' | 'openrouter'>,
	operator: Pick<ChatModel, 'providerId' | 'modelId'> = chatModel,
	requested?: string | null,
): string {
	const pick = parseLearnerChatSpecifier(requested);
	if (pick?.kind === 'openrouter' && status.openrouter) {
		return formatLearnerChatSpecifier(pick);
	}
	if (pick?.kind === 'openai' && status.openai) {
		return formatLearnerChatSpecifier(pick);
	}
	return specifierForLearnerChat(exclusiveLearnerChatRoute(status), operator);
}

export function specifierForLearnerChat(
	route: LearnerChatRoute,
	operator: Pick<ChatModel, 'providerId' | 'modelId'> = chatModel,
): string {
	switch (route.kind) {
		case 'operator':
			return `${operator.providerId}/${operator.modelId}`;
		case 'openai':
			return `${openaiChatProviderId}/${
				isOpenaiChatModelId(route.modelId) ? route.modelId : openaiChatModelId
			}`;
		case 'openrouter':
			return `${openrouterChatProviderId}/${
				isOpenrouterChatModelId(route.modelId) ? route.modelId : openrouterChatModelId
			}`;
		default: {
			const exhaustive: never = route;
			throw new Error(`Unexpected chat route: ${JSON.stringify(exhaustive)}`);
		}
	}
}

function exclusiveLearnerChatRoute(
	status: Pick<LearnerChatStatus, 'openai' | 'openrouter'>,
): LearnerChatRoute {
	if (status.openrouter) return { kind: 'openrouter' };
	if (status.openai) return { kind: 'openai' };
	return { kind: 'operator' };
}

function isOpenaiChatModelId(
	value: string | undefined,
): value is (typeof learnerChatModelChoices)[number]['openaiModelId'] {
	return learnerChatModelChoices.some((choice) => choice.openaiModelId === value);
}

function isOpenrouterChatModelId(
	value: string | undefined,
): value is (typeof learnerChatModelChoices)[number]['openrouterModelId'] {
	return learnerChatModelChoices.some((choice) => choice.openrouterModelId === value);
}
