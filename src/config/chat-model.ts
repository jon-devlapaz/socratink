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

export type ChatModel = {
	readonly providerId: typeof chatProviderId;
	readonly baseUrl: string;
	readonly modelId: string;
	readonly apiKey: string | undefined;
	readonly reasoning: boolean;
	readonly contextWindow: number;
	readonly maxTokens: number;
};

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
	const pick = permittedLearnerChatPick(status, requested);
	return pick ? { ...status, kind: pick.kind } : status;
}

export function specifierForLearnerChatFromStatus(
	status: Pick<LearnerChatStatus, 'openai' | 'openrouter'>,
	operator: Pick<ChatModel, 'providerId' | 'modelId'>,
	requested?: string | null,
): string {
	return specifierForLearnerChat(learnerChatRoute(status, requested), operator);
}

export function specifierForLearnerChat(
	route: Exclude<LearnerChatRoute, { kind: 'operator' }>,
): string;
export function specifierForLearnerChat(
	route: LearnerChatRoute,
	operator: Pick<ChatModel, 'providerId' | 'modelId'>,
): string;
export function specifierForLearnerChat(
	route: LearnerChatRoute,
	operator?: Pick<ChatModel, 'providerId' | 'modelId'>,
): string {
	switch (route.kind) {
		case 'operator':
			if (!operator) throw new Error('Operator model is required for the operator route.');
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

export function learnerChatRoute(
	status: Pick<LearnerChatStatus, 'openai' | 'openrouter'>,
	requested?: string | null,
): LearnerChatRoute {
	const pick = permittedLearnerChatPick(status, requested);
	if (pick) return pick;
	if (status.openrouter) return { kind: 'openrouter' };
	if (status.openai) return { kind: 'openai' };
	return { kind: 'operator' };
}

function permittedLearnerChatPick(
	status: Pick<LearnerChatStatus, 'openai' | 'openrouter'>,
	requested: string | undefined | null,
): LearnerChatSpecifier | undefined {
	const pick = parseLearnerChatSpecifier(requested);
	return pick && status[pick.kind] ? pick : undefined;
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
