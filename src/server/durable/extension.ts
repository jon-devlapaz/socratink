import {
	createRegistry, defineTool, GenerationTask, hook, ToolTask,
	type EntryRecord, type HookApi,
} from '@earendil-works/pi-durable';
import type { Context } from '@earendil-works/chord/context';
import type { JsonValue } from '@earendil-works/chord';
import type { AssistantMessage, Message } from '@earendil-works/pi-ai';
import { systemPrompt } from '../../learning/chat-policy.ts';
import { presentQuestionRetryBodies as retryBodies, presentQuestionRetryReason as retryReason } from '../../learning/present-question.ts';
import { executeLearningTool as executeTool, learningToolDefinitions as toolDefinitions } from '../../learning/tools.ts';

export const inputKind = 'socratink.input';

export function productRegistry() {
	const registry = createRegistry();
	registry.install({
		name: 'socratink',
		sections: [{ key: 'product', tag: false, render: () => systemPrompt }],
		tools: toolDefinitions.map((definition) => defineTool<object>({
			...definition,
			replay: 'safe',
			execute: async (args) => {
				const result = executeTool(definition.name, args);
				return { output: [{ type: 'text', text: result.output }],
					details: result.data as JsonValue, control: { terminate: result.terminate } };
			},
		})),
		hooks: [
			hook(ToolTask, { afterTool: async (_call, result, api, context) => {
				// Flue stops on any successful question. Pi requires every call of a
				// mixed tool round to request termination, including a reveal beside it.
				const entries = await currentInputEntries(api, context);
				const assistantIndex = entries.findLastIndex((entry) => entry.kind === 'pi.assistant');
				const assistant = entries[assistantIndex];
				const calls = assistant?.model?.flatMap((message) =>
					message.role === 'assistant' ? message.content.filter((block) => block.type === 'toolCall') : []) ?? [];
				let hasQuestion = false;
				let invalidQuestion = false;
				for (const call of calls) {
					if (call.name !== 'present_question') continue;
					try { hasQuestion ||= executeTool(call.name, call.arguments).terminate; }
					catch { invalidQuestion = true; }
				}
				const alreadyCorrected = correctionTaken(entries.slice(0, assistantIndex));
				return hasQuestion || (invalidQuestion && alreadyCorrected)
					? { ...result, control: { ...result.control, terminate: true } } : result;
			} }),
			hook(GenerationTask, { onYield: async (answer, api, context) => {
				const entries = await currentInputEntries(api, context);
				const messages = entries.flatMap((entry) => entry.model ?? []);
				const reason = retryReason({
					toolCalls: messages.flatMap((message) => message.role === 'toolResult'
						? [{ tool: message.toolName, isError: message.isError }] : []),
					assistantText: assistantText(answer),
					alreadyRetried: correctionTaken(entries),
				});
				return reason ? { continue: retryBodies[reason] } : undefined;
			} }),
		],
	});
	return registry;
}

function correctionTaken(entries: readonly EntryRecord[]): boolean {
	return entries.some((entry) => entry.model?.some((message) =>
		// A failed question already causes Pi's next tool-continuation request.
		(message.role === 'toolResult' && message.toolName === 'present_question' && message.isError)
		|| (entry.kind === 'pi.user' && message.role === 'user'
			&& Object.values(retryBodies).some((body) => body === messageText(message)))));
}

async function currentInputEntries(api: HookApi, context: Context): Promise<EntryRecord[]> {
	const entries: EntryRecord[] = [];
	let cursor;
	do {
		const page = await api.entries({ order: 'descending' }, 100, cursor, context);
		for (const entry of page.items) {
			entries.push(entry);
			if (entry.kind === inputKind) return entries.reverse();
		}
		cursor = page.next;
	} while (cursor);
	return entries.reverse();
}

export function messageText(message: Message): string {
	if (typeof message.content === 'string') return message.content;
	return message.content.filter((block) => block.type === 'text').map((block) => block.text).join('');
}

export function assistantText(message: AssistantMessage): string { return messageText(message); }
