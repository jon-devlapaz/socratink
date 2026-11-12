import type { WirePart, WireSnapshot } from '../../config/chat-wire.ts';
import type { ProductTool, Snapshot } from './contract.ts';

/** The browser's view of a Pi conversation. Raw model reasoning stays on the
 * server: learners never receive it, live or in history. */
export function project(conversationId: string, state: Snapshot): WireSnapshot {
	const pending = new Set(state.submissions.filter((s) => !s.outcome).map((s) => s.id));
	const messages: WireSnapshot['messages'] = state.messages.map((m) => ({
		id: `${m.submissionId}:${m.role}`, role: m.role, display: 'visible',
		submissionId: m.submissionId, ...(m.metadata ? { metadata: m.metadata } : {}),
		parts: [
			...(m.text ? [{ type: 'text' as const, text: m.text, state: pending.has(m.submissionId) ? 'streaming' as const : 'done' as const }] : []),
			...(m.tools ?? []).map(toolPart),
			...Object.entries(m.data ?? {}).flatMap(([name, values]) => values.map((data) => ({ type: `data-${name}` as const, data }))),
		],
	}));
	const settlements = state.submissions.flatMap((s) => s.outcome ? [{ submissionId: s.id, outcome: s.outcome,
		...(s.error ? { error: { message: s.error } } : {}) }] : []);
	return { v: 1, conversationId, messages, settlements };
}

function toolPart(tool: ProductTool): WirePart {
	const base = { type: 'dynamic-tool' as const, toolName: tool.name, toolCallId: tool.id, input: tool.input };
	if (tool.state === 'running') return { ...base, state: 'input-available' };
	return tool.isError
		? { ...base, state: 'output-error', errorText: tool.output ?? 'Tool failed.' }
		: { ...base, state: 'output-available', output: tool.output ?? '' };
}
