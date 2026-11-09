import type { ConversationStreamChunk, FlueConversationPart } from '@flue/sdk';
import { revealToolName } from '../reveal.ts';
import { isQuestionnaireTool } from '../questionnaire.ts';

export const inkToolName = 'ink_express';

const outputLimit = 8_000;

export type ToolCallState = 'running' | 'done' | 'failed';

export type DisplayedToolCall = {
	id: string;
	name: string;
	state: ToolCallState;
	output?: string;
	durationMs?: number;
};

export function toolsFromParts(parts: readonly FlueConversationPart[]): DisplayedToolCall[] {
	const tools: DisplayedToolCall[] = [];
	for (const part of parts) {
		if (part.type !== 'dynamic-tool') continue;
		tools.push(displayedToolFromPart(part));
	}
	return tools;
}

export function visibleCardTools(
	calls: readonly DisplayedToolCall[],
	options: { readonly questionnaire?: unknown } = {},
): DisplayedToolCall[] {
	return calls.filter((call) => {
		if (isQuietTool(call.name)) return false;
		if (options.questionnaire && isQuestionnaireTool(call.name)) return false;
		return true;
	});
}

export function applyToolStreamEvent(
	calls: DisplayedToolCall[],
	event: ConversationStreamChunk,
): boolean {
	switch (event.type) {
		case 'tool-input': {
			const existing = calls.find((call) => call.id === event.toolCallId);
			if (existing && existing.state !== 'running') return false;
			return upsertTool(calls, {
				id: event.toolCallId,
				name: event.toolName,
				state: 'running',
			});
		}
		case 'tool-output':
			return upsertTool(calls, {
				id: event.toolCallId,
				name: existingName(calls, event.toolCallId),
				state: 'done',
				output: formatToolOutput(event.output),
				...(event.durationMs == null ? {} : { durationMs: event.durationMs }),
			});
		case 'tool-output-error':
			return upsertTool(calls, {
				id: event.toolCallId,
				name: existingName(calls, event.toolCallId),
				state: 'failed',
				output: event.errorText,
				...(event.durationMs == null ? {} : { durationMs: event.durationMs }),
			});
		default:
			return false;
	}
}

export function formatToolOutput(value: unknown): string {
	if (value == null) return '';
	const text = typeof value === 'string' ? value : stringifyOutput(value);
	if (text.length <= outputLimit) return text;
	return `${text.slice(0, outputLimit)}\n…`;
}

export function toolStateLabel(state: ToolCallState): string {
	switch (state) {
		case 'running':
			return 'Running';
		case 'done':
			return 'Done';
		case 'failed':
			return 'Failed';
		default: {
			const exhaustive: never = state;
			return exhaustive;
		}
	}
}

export function visibleToolOutput(call: DisplayedToolCall): string | undefined {
	if (!call.output) return undefined;
	if (isQuietTool(call.name)) return undefined;
	if (isQuestionnaireTool(call.name) && call.state === 'done') return undefined;
	return call.output;
}

function displayedToolFromPart(
	part: Extract<FlueConversationPart, { type: 'dynamic-tool' }>,
): DisplayedToolCall {
	const base = { id: part.toolCallId, name: part.toolName };
	switch (part.state) {
		case 'input-available':
			return { ...base, state: 'running' };
		case 'output-available':
			return {
				...base,
				state: 'done',
				output: formatToolOutput(part.output),
				...(part.durationMs == null ? {} : { durationMs: part.durationMs }),
			};
		case 'output-error':
			return {
				...base,
				state: 'failed',
				output: part.errorText,
				...(part.durationMs == null ? {} : { durationMs: part.durationMs }),
			};
		default: {
			const exhaustive: never = part;
			return exhaustive;
		}
	}
}

function upsertTool(calls: DisplayedToolCall[], next: DisplayedToolCall): boolean {
	const index = calls.findIndex((call) => call.id === next.id);
	if (index < 0) {
		calls.push(next);
		return true;
	}
	const previous = calls[index];
	if (
		previous
		&& previous.name === next.name
		&& previous.state === next.state
		&& previous.output === next.output
		&& previous.durationMs === next.durationMs
	) {
		return false;
	}
	calls[index] = {
		...next,
		name: next.name === 'tool' && previous?.name ? previous.name : next.name,
	};
	return true;
}

function existingName(calls: readonly DisplayedToolCall[], id: string): string {
	return calls.find((call) => call.id === id)?.name ?? 'tool';
}

function stringifyOutput(value: unknown): string {
	try {
		return JSON.stringify(value, null, 2) ?? '';
	} catch {
		return String(value);
	}
}

function isQuietTool(name: string): boolean {
	return name === revealToolName || name === inkToolName;
}
