import { createHash } from 'node:crypto';
import type { WirePart, WireSnapshot } from '../../config/chat-wire.ts';
import type { ProductTool, Snapshot } from './contract.ts';

export type BrowserSnapshot = WireSnapshot & { sourceRevision: number };

/** The browser's view of a Pi conversation. */
export function project(conversationId: string, state: Snapshot): BrowserSnapshot {
	const pending = new Set(state.submissions.filter((s) => !s.outcome).map((s) => s.id));
	const messages: WireSnapshot['messages'] = state.messages.map((m) => ({
		id: `${m.submissionId}:${m.role}`, role: m.role, purpose: m.role, display: 'visible',
		submissionId: m.submissionId, ...(m.metadata ? { metadata: m.metadata } : {}),
		parts: [
			...(m.reasoning ? [{ type: 'reasoning' as const, text: m.reasoning, state: pending.has(m.submissionId) ? 'streaming' as const : 'done' as const }] : []),
			...(m.text ? [{ type: 'text' as const, text: m.text, state: pending.has(m.submissionId) ? 'streaming' as const : 'done' as const }] : []),
			...(m.tools ?? []).map(toolPart),
			...Object.entries(m.data ?? {}).flatMap(([name, values]) => values.map((data) => ({ type: `data-${name}` as const, data }))),
		],
	}));
	const settlements = state.submissions.flatMap((s) => s.outcome ? [{ submissionId: s.id, outcome: s.outcome,
		...(s.error ? { error: { message: s.error } } : {}) }] : []);
	const offset = createHash('sha256').update(JSON.stringify({ messages, settlements })).digest('hex');
	return { v: 1, conversationId, offset, messages, settlements, sourceRevision: state.revision };
}

function toolPart(tool: ProductTool): WirePart {
	const base = { type: 'dynamic-tool' as const, toolName: tool.name, toolCallId: tool.id, input: tool.input };
	if (tool.state === 'running') return { ...base, state: 'input-available' };
	return tool.isError
		? { ...base, state: 'output-error', errorText: tool.output ?? 'Tool failed.' }
		: { ...base, state: 'output-available', output: tool.output ?? '' };
}
