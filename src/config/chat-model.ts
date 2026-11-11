export const chatProviderId = 'jon-local';

export const openaiChatProviderId = 'openai';

// Curated Pi catalog ids only.
export const learnerChatModelChoices = [
	{ label: 'GPT-5 nano', openaiModelId: 'gpt-5-nano' },
	{ label: 'GPT-5 mini', openaiModelId: 'gpt-5-mini' },
	{ label: 'GPT-5', openaiModelId: 'gpt-5' },
] as const;

export const openaiChatModelId = learnerChatModelChoices[0].openaiModelId;

export const chatModelHeader = 'x-socratink-chat-model';

export type LearnerChatRoute =
	| { kind: 'operator' }
	| { kind: 'openai'; modelId?: string };

export type LearnerChatSpecifier = {
	kind: 'openai';
	modelId: (typeof learnerChatModelChoices)[number]['openaiModelId'];
};

export type LearnerCredentialName = Exclude<LearnerChatRoute['kind'], 'operator'>;

export type LearnerChatStatus = {
	kind: LearnerChatRoute['kind'];
	openai: boolean;
};

export const operatorChatStatus: LearnerChatStatus = {
	kind: 'operator',
	openai: false,
};

export function isLearnerChatStatus(value: unknown): value is LearnerChatStatus {
	if (typeof value !== 'object' || value === null) return false;
	if (!('kind' in value) || !('openai' in value)) return false;
	if (value.openai !== true && value.openai !== false) return false;
	switch (value.kind) {
		case 'operator':
		case 'openai':
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
	const openaiPrefix = `${openaiChatProviderId}/`;
	if (trimmed.startsWith(openaiPrefix)) {
		const modelId = trimmed.slice(openaiPrefix.length);
		if (isOpenaiChatModelId(modelId)) return { kind: 'openai', modelId };
	}
	return undefined;
}

export function formatLearnerChatSpecifier(pick: LearnerChatSpecifier): string {
	return `${openaiChatProviderId}/${pick.modelId}`;
}

export function applyLearnerChatPick(
	status: LearnerChatStatus,
	requested: string | undefined | null,
): LearnerChatStatus {
	const pick = permittedLearnerChatPick(status, requested);
	return pick ? { ...status, kind: pick.kind } : status;
}

export function specifierForLearnerChatFromStatus(
	status: Pick<LearnerChatStatus, 'openai'>,
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
		default: {
			const exhaustive: never = route;
			throw new Error(`Unexpected chat route: ${JSON.stringify(exhaustive)}`);
		}
	}
}

export function learnerChatRoute(
	status: Pick<LearnerChatStatus, 'openai'>,
	requested?: string | null,
): LearnerChatRoute {
	const pick = permittedLearnerChatPick(status, requested);
	if (pick) return pick;
	if (status.openai) return { kind: 'openai' };
	return { kind: 'operator' };
}

function permittedLearnerChatPick(
	status: Pick<LearnerChatStatus, 'openai'>,
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
