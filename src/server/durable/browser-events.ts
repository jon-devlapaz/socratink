import type { WireEventBody, WireSnapshot } from '../../config/chat-wire.ts';

export type Progress = {
	text: Record<string, string>;
	started: string[]; tools: Record<string, string>; settled: string[];
	/** Rewrites seen per reply. Each rewrite streams as a fresh live message, so the rejected text is not shown beside it. */
	rewrites: Record<string, number>;
};
export type NewEvent = WireEventBody;

export function initialProgress(): Progress {
	return { text: {}, started: [], tools: {}, settled: [], rewrites: {} };
}

/** Diff one snapshot against what a connection already sent: tool results and
 * settlements are never repeated, and observed text is never erased. */
export function progressEvents(snapshot: WireSnapshot, state: Progress): NewEvent[] {
	const events: NewEvent[] = [];
	let settled = false;
	for (const message of snapshot.messages) {
		if (message.role !== 'assistant') continue;
		if (!state.started.includes(message.id)) {
			events.push({ type: 'message-started', messageId: message.id, submissionId: message.submissionId });
			state.started.push(message.id);
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
		const rewrites = typeof message.metadata?.rewrites === 'number' ? message.metadata.rewrites : 0;
		const liveId = rewrites ? `${message.id}~${rewrites}` : message.id;
		if (rewrites !== (state.rewrites[message.id] ?? 0)) {
			state.rewrites[message.id] = rewrites;
			state.text[message.id] = '';
			events.push({ type: 'message-started', messageId: liveId, submissionId: message.submissionId });
		}
		const text = message.parts.flatMap((part) => part.type === 'text' ? [part.text] : []).join('\n\n');
		const previous = state.text[message.id] ?? '';
		if (text && text !== previous && !previous.startsWith(text)) {
			const delta = text.startsWith(previous) ? text.slice(previous.length) : `\n\n${text}`;
			events.push({ type: 'message-delta', messageId: liveId, kind: 'text', delta });
			state.text[message.id] = text;
		}
	}
	for (const settlement of snapshot.settlements) {
		if (state.settled.includes(settlement.submissionId)) continue;
		events.push({ type: 'submission-settled', ...settlement });
		state.settled.push(settlement.submissionId);
		settled = true;
	}
	if (settled) events.push({ type: 'conversation-reset', snapshot });
	return events;
}
