import {
	createRegistry, defineTool, GenerationTask, hook, ToolTask,
	type EntryRecord, type HookApi,
} from '@earendil-works/pi-durable';
import type { Context } from '@earendil-works/chord/context';
import type { JsonValue } from '@earendil-works/chord';
import type { Message } from '@earendil-works/pi-ai';
import { systemPrompt } from '../../learning/chat-policy.ts';
import { presentQuestionRetryBodies, presentQuestionRetryReason } from '../../learning/present-question.ts';
import { isHelpThenQuestion } from '../../learning/learner-text.ts';
import { asksForAnswer, cardHelpReveal, markRevealRetryBodies, markRevealRetryReason } from '../../learning/mark-reveal.ts';
import { parseRevealDefinition, revealToolName } from '../../reveal.ts';
import { executeLearningTool as executeTool, learningToolDefinitions as toolDefinitions } from '../../learning/tools.ts';
import { hintCardToolOutput } from './card-hint.ts';
import { inputKind, type InputData, type ProductMessage, type Snapshot } from './contract.ts';
import { isTryOnceMoreQuestion, tryOnceMoreCorrection } from './reveal-consent.ts';

const retryBodies: readonly string[] = Object.values({ ...presentQuestionRetryBodies, ...markRevealRetryBodies });
const revealBodies: readonly string[] = Object.values(markRevealRetryBodies);

export function productRegistry(readState: () => Promise<Snapshot>) {
	const registry = createRegistry();
	registry.install({
		name: 'socratink',
		sections: [{ key: 'product', tag: false, render: () => systemPrompt }],
		tools: toolDefinitions.map((definition) => defineTool<object>({
			...definition,
			replay: 'safe',
			execute: async (args, api) => {
				const result = executeTool(definition.name, args, api.callId);
				return { output: [{ type: 'text', text: result.output }],
					details: result.data as JsonValue, control: { terminate: result.terminate } };
			},
		})),
		hooks: [
			hook(ToolTask, {
				beforeTool: async (_call, api, context) => {
					if (isTryOnceMore(await currentInputEntries(api, context))) return { block: tryOnceMoreCorrection };
				},
				afterTool: async (call, result, api, context) => {
					const entries = await currentInputEntries(api, context);
					const assistantIndex = entries.findLastIndex((entry) => entry.kind === 'pi.assistant');
					const earlier = entries.slice(0, assistantIndex);
					if (isTryOnceMore(entries)) return {
						isError: true, output: [{ type: 'text', text: tryOnceMoreCorrection }],
						control: { terminate: triedCorrection(earlier) },
					};
					// The learner's own words asked for the answer, so the reveal they got was requested,
					// whether or not the tutor set the flag (#133).
					if (call.name === revealToolName && !result.isError && asksForAnswer(learnerText(entries))) {
						const details = result.details as { reveal?: object[] } | undefined;
						result = { ...result, details: { ...details,
							reveal: (details?.reveal ?? []).map((reveal) => ({ ...reveal, requested: true })) } };
					}
					const sourceId = (entries[0]?.data as InputData | undefined)?.hintCardFrom;
					if (sourceId && call.name === 'present_question' && !result.isError) {
						const output = hintCardToolOutput(await readState(), sourceId, result.details as ProductMessage['data']);
						if (output) result = { ...result, output: [{ type: 'text', text: output }] };
					}
					const assistant = entries[assistantIndex];
					const calls = assistant?.model?.flatMap((message) =>
						message.role === 'assistant' ? message.content.filter((block) => block.type === 'toolCall') : []) ?? [];
					let hasQuestion = false;
					let invalidQuestion = false;
					for (const round of calls) {
						if (round.name !== 'present_question') continue;
						try { hasQuestion ||= executeTool(round.name, round.arguments, round.id).terminate; }
						catch { invalidQuestion = true; }
					}
					// Pi requires every call of a mixed tool round to request termination, including a reveal beside it.
					const correctedReveal = calls.every((round) => round.name === revealToolName)
						&& corrections(earlier).some((body) => revealBodies.includes(body));
					// A hint or partial written beside its mark_reveal call that already ends on its question is
					// complete. Another round would ask a second question or repeat the reply (#163). A full answer
					// or worked example still comes after the call, behind the consent card.
					const answered = calls.every((round) => round.name === revealToolName
						&& ['hint', 'partial'].includes(parseRevealDefinition(round.arguments)?.kind ?? ''))
						&& isHelpThenQuestion(assistant?.model?.filter((message) => message.role === 'assistant').map(messageText).join('') ?? '');
					const terminate = hasQuestion || (invalidQuestion && corrections(earlier).length > 0) || correctedReveal || answered;
					const help = hasQuestion && call.name === 'present_question' && !result.isError
						&& !revealed(earlier) && !calls.some((round) => round.name === revealToolName)
						? cardHelpReveal(learnerText(entries)) : undefined;
					return terminate || help ? { ...result,
						...(help ? { details: { ...(result.details as object), reveal: [help] } } : {}),
						control: { ...result.control, ...(terminate ? { terminate: true } : {}) } } : result;
				},
			}),
			hook(GenerationTask, {
				beforeRequest: async ({ messages }, api, context) => {
					const entries = await currentInputEntries(api, context, true);
					const input = entries.findLastIndex((entry) => entry.kind === inputKind);
					if (!isTryOnceMore(entries.slice(input))) return;
					const prior = input > 0 && entries[0]?.kind === inputKind
						? entries[0].model?.find((message) => message.role === 'user') : undefined;
					const boundary = prior ? messages.findLastIndex((message) => message.role === 'user'
						&& message.timestamp === prior.timestamp && messageText(message) === messageText(prior)) : -1;
					// Leave the withheld answer and any rejected replies out of this question request.
					const history = boundary < 0 ? messages.filter((message) => message.role === 'system') : messages.slice(0, boundary + 1);
					const content = triedCorrection(entries.slice(input))
						? `${tryOnceMoreCorrection} The previous reply did not meet this format.` : tryOnceMoreCorrection;
					return { messages: [...history, { role: 'user', content, timestamp: Date.now() }] };
				},
				beforeProviderRequest: async ({ payload }, api, context) => {
					// The product's provider adapter builds a Chat Completions body for the selected model.
					if (!isTryOnceMore(await currentInputEntries(api, context))) return;
					return { payload: { ...(payload as object), tool_choice: 'none' } };
				},
				onYield: async (answer, api, context) => {
					const entries = await currentInputEntries(api, context);
					if (isTryOnceMore(entries)) {
						const valid = !answer.content.some((block) => block.type === 'toolCall') && isTryOnceMoreQuestion(messageText(answer));
						return valid || triedCorrection(entries) ? undefined : { continue: tryOnceMoreCorrection };
					}
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
				},
			}),
		],
	});
	return registry;
}

function isTryOnceMore(entries: readonly EntryRecord[]): boolean {
	return (entries[0]?.data as InputData | undefined)?.tryOnceMore === true && entries[0]?.kind === inputKind;
}

function triedCorrection(entries: readonly EntryRecord[]): boolean {
	return entries.some((entry) => entry.model?.some((message) => (message.role === 'user' || message.role === 'toolResult')
		&& messageText(message) === tryOnceMoreCorrection));
}

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

async function currentInputEntries(api: HookApi, context: Context, includeConsentInput = false): Promise<EntryRecord[]> {
	const entries: EntryRecord[] = [];
	let cursor;
	do {
		const page = await api.entries({ order: 'descending' }, 100, cursor, context);
		for (const entry of page.items) {
			entries.push(entry);
			if (entry.kind === inputKind && (!includeConsentInput || !isTryOnceMore([entry]))) return entries.reverse();
		}
		cursor = page.next;
	} while (cursor);
	return entries.reverse();
}

export function messageText(message: Message): string {
	if (typeof message.content === 'string') return message.content;
	return message.content.filter((block) => block.type === 'text').map((block) => block.text).join('');
}
