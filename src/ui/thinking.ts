import type { ConversationStreamChunk } from '@flue/sdk';

export const pendingThinkingFallback = 'Working from what you wrote';
const reasoningLimit = 8_000;

export type LiveReasoning = {
	text: string;
	truncated: boolean;
};

export function createLiveReasoning(): LiveReasoning {
	return { text: '', truncated: false };
}

export function resetLiveReasoning(buffer: LiveReasoning): void {
	buffer.text = '';
	buffer.truncated = false;
}

export function applyReasoningStreamEvent(
	buffer: LiveReasoning,
	event: ConversationStreamChunk,
): boolean {
	if (event.type !== 'message-delta' || event.kind !== 'reasoning') return false;
	if (!event.delta || buffer.truncated) return false;
	const next = buffer.text + event.delta;
	if (next.length <= reasoningLimit) {
		buffer.text = next;
		return true;
	}
	buffer.text = `${next.slice(0, reasoningLimit)}\n…`;
	buffer.truncated = true;
	return true;
}

export function visibleThinkingStep(text: string): string {
	const trimmed = text.trim();
	return trimmed ? text : pendingThinkingFallback;
}
