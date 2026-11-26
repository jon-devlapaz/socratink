import type { Context } from '@earendil-works/chord/context';
import { contentText, type Message, type UserMessage } from '@earendil-works/pi-ai';
import type { Cursor, EntryId, EntryRecord, HookApi } from '@earendil-works/pi-durable';
import { questionnaireAnswerPrefix, type QuestionnaireHelp } from '../../questionnaire.ts';
import { inputKind, type InputData } from './contract.ts';

const buttons: Record<QuestionnaireHelp, string> = { hint: 'Hint', unknown: "I don't know" };

function messageKey(message: UserMessage): string {
	return `${message.timestamp}:${contentText(message.content, '')}`;
}

async function earlierActions(api: HookApi, context: Context, inputId: EntryId, candidates: ReadonlyMap<string, number>) {
	const actions = new Map<string, QuestionnaireHelp>();
	const remaining = new Set(candidates.keys());
	let cursor: Cursor | undefined;
	do {
		const page = await api.entries({ order: 'descending', maxEntryId: inputId }, 100, cursor, context);
		for (const entry of page.items) {
			if (entry.id === inputId || entry.kind !== inputKind) continue;
			const user = entry.model?.find((message) => message.role === 'user');
			if (!user) continue;
			const key = messageKey(user);
			if (!remaining.delete(key)) continue;
			const help = (entry.data as InputData).cardHelp;
			if (help) actions.set(key, help.kind);
			if (remaining.size === 0) return actions;
		}
		cursor = page.next;
	} while (cursor);
	return actions;
}

/** Each owner handles one submission. Tool rounds and provider retries reuse its immutable earlier actions. */
export function createCardHelpContext() {
	let cached: { inputId: EntryId; actions: Map<string, QuestionnaireHelp> } | undefined;
	return async (messages: readonly Message[], input: EntryRecord | undefined, api: HookApi, context: Context) => {
		if (input?.kind !== inputKind) return;
		const users = messages.filter((message) => message.role === 'user');
		const current = input.model?.find((message) => message.role === 'user');
		const currentKey = current && messageKey(current);
		const currentIndex = currentKey ? users.findLastIndex((message) => messageKey(message) === currentKey) : -1;
		const prior = currentIndex >= 0 ? users.slice(0, currentIndex) : users;
		const positions = new Map<string, number>();
		for (const [index, user] of prior.entries()) {
			if (!contentText(user.content, '').startsWith(questionnaireAnswerPrefix)) continue;
			const key = messageKey(user);
			// Two indistinguishable input records cannot establish which one was the action.
			positions.set(key, positions.has(key) ? 0 : index + 1);
		}
		const notes: string[] = [];
		if (positions.size) {
			if (cached?.inputId !== input.id) {
				const actions = await earlierActions(api, context, input.id, positions);
				cached = { inputId: input.id, actions };
			}
			for (const [key, position] of positions) {
				const help = cached.actions.get(key);
				if (position && help) notes.push(`Earlier user message ${position}: the learner pressed ${buttons[help]}.`);
			}
		}
		const help = (input.data as InputData).cardHelp;
		if (help) notes.push(`For the current learner submission, use this recorded control action. Socratink card action: the learner pressed ${buttons[help.kind]}.`);
		if (!notes.length) return;
		const position = messages[0]?.role === 'system' ? 1 : 0;
		const note: Message = { role: 'system', content: notes.join('\n'), timestamp: current?.timestamp ?? Date.now() };
		return { messages: [...messages.slice(0, position), note, ...messages.slice(position)] };
	};
}
