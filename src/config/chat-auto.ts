export const freeLlmAutoModelIds = ['auto', 'auto:smart', 'auto:reliable', 'auto:fast'] as const;

export type FreeLlmAutoModelId = (typeof freeLlmAutoModelIds)[number];

export const chatAutoModelHeader = 'x-socratink-auto-model';

export function parseFreeLlmAutoModelId(value: string | undefined | null): FreeLlmAutoModelId | undefined {
	if (!value) return undefined;
	const normalized = value.trim().toLowerCase();
	return freeLlmAutoModelIds.find((id) => id === normalized);
}

export function chatAllowsAutoSelection(modelId: string): boolean {
	return parseFreeLlmAutoModelId(modelId) !== undefined;
}
