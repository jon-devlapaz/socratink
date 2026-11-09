import type { ConversationStreamChunk, FlueConversationSnapshot } from '@flue/sdk';
import type { BrowserSnapshot } from './browser-projection.ts';

export type Progress = {
	hash: string; text: Record<string, string>; reasoning: Record<string, string>;
	started: string[]; tools: Record<string, string>; settled: string[];
	snapshot?: BrowserSnapshot;
};
type WithoutPosition<T> = T extends unknown ? Omit<T, 'conversationId' | 'position'> : never;
export type NewEvent = WithoutPosition<ConversationStreamChunk>;
export type BrowserObservation = { offset: string; snapshot: BrowserSnapshot };
export type BrowserStream = {
	sync(snapshot: BrowserSnapshot): BrowserObservation | Promise<BrowserObservation>;
	read(conversationId: string, offset: string, through: string): ConversationStreamChunk[] | Promise<ConversationStreamChunk[]>;
	close(): void | Promise<void>;
};

export function initialProgress(): Progress {
	return { hash: '', text: {}, reasoning: {}, started: [], tools: {}, settled: [] };
}

export function alreadyObserved(snapshot: BrowserSnapshot, state: Progress): boolean {
	if (!Number.isSafeInteger(snapshot.sourceRevision) || snapshot.sourceRevision < 0) throw new Error('Invalid conversation revision.');
	return !!state.snapshot && snapshot.sourceRevision <= state.snapshot.sourceRevision;
}

export function canonicalObservation(snapshot: BrowserSnapshot, state: Progress, offset: string): BrowserObservation {
	state.snapshot = { ...snapshot, offset };
	return { offset, snapshot: state.snapshot };
}

export function stampEvent(event: NewEvent, offset: string): NewEvent {
	return event.type === 'conversation-reset' ? { ...event, snapshot: { ...event.snapshot, offset } } : event;
}

export function boundedCursor(value: string): string {
	if (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value))) throw new Error('Invalid browser cursor.');
	return value;
}

/** Monotone observation journal: retries and older concurrent reads cannot
 * repeat tool results or settlements, or erase already observed reasoning. */
export function progressEvents(snapshot: FlueConversationSnapshot, state: Progress): NewEvent[] {
	const events: NewEvent[] = [];
	let settled = false;
	for (const message of snapshot.messages) {
		if (message.role !== 'assistant') continue;
		if (!state.started.includes(message.id)) {
			events.push({ type: 'message-started', messageId: message.id, submissionId: message.submissionId });
			state.started.push(message.id);
		}
		for (const kind of ['reasoning', 'text'] as const) {
			const text = message.parts.flatMap((part) => (part.type === 'text' || part.type === 'reasoning') && part.type === kind ? [part.text] : []).join('\n\n');
			const previous = state[kind][message.id] ?? '';
			if (!text || text === previous || previous.startsWith(text)) continue;
			const delta = text.startsWith(previous) ? text.slice(previous.length) : `\n\n${text}`;
			events.push({ type: 'message-delta', messageId: message.id, kind, delta });
			state[kind][message.id] = text;
		}
		for (const part of message.parts) {
			if (part.type !== 'dynamic-tool') continue;
			const previous = state.tools[part.toolCallId];
			if (!previous) events.push({ type: 'tool-input', messageId: message.id,
				toolCallId: part.toolCallId, toolName: part.toolName, input: part.input });
			if ((!previous || previous === 'input-available') && part.state === 'output-available') {
				events.push({ type: 'tool-output', toolCallId: part.toolCallId, output: part.output });
			}
			if ((!previous || previous === 'input-available') && part.state === 'output-error') {
				events.push({ type: 'tool-output-error', toolCallId: part.toolCallId, errorText: part.errorText });
			}
			if (!previous || previous === 'input-available') state.tools[part.toolCallId] = part.state;
		}
	}
	for (const settlement of snapshot.settlements) {
		if (state.settled.includes(settlement.submissionId)) continue;
		events.push({ type: 'submission-settled', ...settlement });
		state.settled.push(settlement.submissionId);
		settled = true;
	}
	// SDK observers need final user rows, tool data, metadata and completed parts.
	if (settled) events.push({ type: 'conversation-reset', snapshot });
	state.hash = snapshot.offset;
	return events;
}
