import type { ConversationStreamChunk, FlueConversationPart } from '@flue/sdk';
import { isRevealTool } from '../reveal.ts';
import { isQuestionnaireTool } from './questionnaire.ts';

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
		if (isRevealTool(call.name)) return false;
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

export function createToolList(calls: readonly DisplayedToolCall[]): HTMLDivElement {
	const list = document.createElement('div');
	list.className = 'tool-list';
	list.replaceChildren(...calls.map(createToolCard));
	return list;
}

export function createToolCard(call: DisplayedToolCall): HTMLElement {
	const card = document.createElement('article');
	card.className = 'tool-card';
	card.dataset.state = call.state;
	card.setAttribute('aria-label', `${call.name}, ${toolStateLabel(call.state)}`);
	if (call.state === 'running') card.setAttribute('aria-live', 'polite');
	const head = document.createElement('header');
	head.className = 'tool-card-head';
	const name = document.createElement('span');
	name.className = 'tool-card-name';
	name.textContent = call.name;
	const state = document.createElement('span');
	state.className = 'tool-card-state';
	state.textContent = toolStateLabel(call.state);
	head.append(name, state);
	if (call.durationMs != null) {
		const duration = document.createElement('span');
		duration.className = 'tool-card-duration';
		duration.textContent = formatDuration(call.durationMs);
		head.append(duration);
	}
	card.append(head);
	const outputText = visibleToolOutput(call);
	if (outputText) {
		const output = document.createElement('pre');
		output.className = 'tool-card-output';
		output.textContent = outputText;
		card.append(output);
	}
	return card;
}

export function visibleToolOutput(call: DisplayedToolCall): string | undefined {
	if (!call.output) return undefined;
	if (isRevealTool(call.name)) return undefined;
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

function formatDuration(durationMs: number): string {
	if (durationMs < 1000) return `${Math.round(durationMs)}ms`;
	return `${(durationMs / 1000).toFixed(1)}s`;
}
