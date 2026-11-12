import {
	createRegistry, defineTool, GenerationTask, hook, ToolTask,
	type EntryRecord, type HookApi,
} from '@earendil-works/pi-durable';
import type { Context } from '@earendil-works/chord/context';
import type { JsonValue } from '@earendil-works/chord';
import type { Message } from '@earendil-works/pi-ai';
import { systemPrompt } from '../../learning/chat-policy.ts';
import { presentQuestionRetryBodies, presentQuestionRetryReason } from '../../learning/present-question.ts';
import { cardHelpReveal, markRevealRetryBodies, markRevealRetryReason } from '../../learning/mark-reveal.ts';
import { revealToolName } from '../../reveal.ts';
import { executeLearningTool as executeTool, learningToolDefinitions as toolDefinitions } from '../../learning/tools.ts';

export const inputKind = 'socratink.input';

const retryBodies: readonly string[] = Object.values({ ...presentQuestionRetryBodies, ...markRevealRetryBodies });
const revealBodies: readonly string[] = Object.values(markRevealRetryBodies);

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
			hook(ToolTask, { afterTool: async (call, result, api, context) => {
				const entries = await currentInputEntries(api, context);
				const assistantIndex = entries.findLastIndex((entry) => entry.kind === 'pi.assistant');
				const assistant = entries[assistantIndex];
				const calls = assistant?.model?.flatMap((message) =>
					message.role === 'assistant' ? message.content.filter((block) => block.type === 'toolCall') : []) ?? [];
				const earlier = entries.slice(0, assistantIndex);
				let hasQuestion = false;
				let invalidQuestion = false;
				for (const round of calls) {
					if (round.name !== 'present_question') continue;
					try { hasQuestion ||= executeTool(round.name, round.arguments).terminate; }
					catch { invalidQuestion = true; }
				}
				// A successful question ends the turn. Pi requires every call of a
				// mixed tool round to request termination, including a reveal beside it.
				// A reveal that answers a correction ends the turn too, so the reply is not repeated.
				const correctedReveal = calls.every((round) => round.name === revealToolName)
					&& corrections(earlier).some((body) => revealBodies.includes(body));
				const terminate = hasQuestion || (invalidQuestion && corrections(earlier).length > 0) || correctedReveal;
				// A card help request is assistance even when the tutor answers with
				// only another card, which leaves no yield to correct.
				const help = hasQuestion && call.name === 'present_question' && !result.isError
					&& !revealed(earlier) && !calls.some((round) => round.name === revealToolName)
					? cardHelpReveal(learnerText(entries)) : undefined;
				return terminate || help ? { ...result,
					...(help ? { details: { ...(result.details as object), reveal: [help] } } : {}),
					control: { ...result.control, ...(terminate ? { terminate: true } : {}) } } : result;
			} }),
			hook(GenerationTask, { onYield: async (answer, api, context) => {
				const entries = await currentInputEntries(api, context);
				const messages = entries.flatMap((entry) => entry.model ?? []);
				const alreadyRetried = corrections(entries).length > 0;
				const question = presentQuestionRetryReason({
					toolCalls: messages.flatMap((message) => message.role === 'toolResult'
						? [{ tool: message.toolName, isError: message.isError }] : []),
					assistantText: messageText(answer),
					alreadyRetried,
				});
				if (question) return { continue: presentQuestionRetryBodies[question] };
				const reveal = markRevealRetryReason({
					revealed: revealed(entries), learnerText: learnerText(entries), assistantText: messageText(answer), alreadyRetried,
				});
				return reveal ? { continue: markRevealRetryBodies[reveal] } : undefined;
			} }),
		],
	});
	return registry;
}

/** The correction bodies already sent for this input. A failed question also
 * counts, because it already causes Pi's next tool-continuation request. */
function corrections(entries: readonly EntryRecord[]): string[] {
	return entries.flatMap((entry) => (entry.model ?? []).flatMap((message) => {
		if (message.role === 'toolResult' && message.toolName === 'present_question' && message.isError) return [message.toolName];
		const text = entry.kind === 'pi.user' && message.role === 'user' ? messageText(message) : '';
		return retryBodies.includes(text) ? [text] : [];
	}));
}

function revealed(entries: readonly EntryRecord[]): boolean {
	return entries.some((entry) => entry.model?.some((message) =>
		message.role === 'toolResult' && message.toolName === revealToolName && !message.isError));
}

function learnerText(entries: readonly EntryRecord[]): string {
	return entries.find((entry) => entry.kind === inputKind)?.model?.map(messageText).join('') ?? '';
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
