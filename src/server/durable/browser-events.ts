import type { WireEventBody, WireSnapshot } from '../../config/chat-wire.ts';

export type Progress = {
	text: Record<string, string>;
	started: string[]; tools: Record<string, string>; settled: string[];
};
export type NewEvent = WireEventBody;

export function initialProgress(): Progress {
	return { text: {}, started: [], tools: {}, settled: [] };
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
		// Tool calls go first: a mark_reveal call must reach the browser before
		// the supplied text it labels, even when both arrive in one poll.
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
		const text = message.parts.flatMap((part) => part.type === 'text' ? [part.text] : []).join('\n\n');
		const previous = state.text[message.id] ?? '';
		if (text && text !== previous && !previous.startsWith(text)) {
			const delta = text.startsWith(previous) ? text.slice(previous.length) : `\n\n${text}`;
			events.push({ type: 'message-delta', messageId: message.id, kind: 'text', delta });
			state.text[message.id] = text;
		}
	}
	for (const settlement of snapshot.settlements) {
		if (state.settled.includes(settlement.submissionId)) continue;
		events.push({ type: 'submission-settled', ...settlement });
		state.settled.push(settlement.submissionId);
		settled = true;
	}
	// The final reset carries user rows, tool data, metadata and completed parts.
	if (settled) events.push({ type: 'conversation-reset', snapshot });
	return events;
}
