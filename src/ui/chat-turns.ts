import type { FlueConversationSnapshot } from '@flue/sdk';
import type { QuestionnaireDefinition } from '../questionnaire.ts';
import { questionnaireFromParts } from './questionnaire.ts';

export type ChatMessageRole = 'Socratink' | 'You' | 'Assistant' | 'Error';

export type DisplayedTurn = {
	role: ChatMessageRole;
	text: string;
	questionnaire?: QuestionnaireDefinition;
};

export function displayLabel(role: ChatMessageRole): string {
	switch (role) {
		case 'Assistant':
			return 'Socratink';
		case 'Socratink':
		case 'You':
		case 'Error':
			return role;
		default: {
			const exhaustive: never = role;
			return exhaustive;
		}
	}
}

export function visibleTurnsFromHistory(
	history: Pick<FlueConversationSnapshot, 'messages'>,
): DisplayedTurn[] {
	const visible: DisplayedTurn[] = [];
	for (const message of history.messages) {
		if (message.display !== 'visible' || (message.role !== 'user' && message.role !== 'assistant')) {
			continue;
		}
		const text = message.parts
			.filter((part) => part.type === 'text')
			.map((part) => part.text)
			.join('\n\n');
		const questionnaire =
			message.role === 'assistant' ? questionnaireFromParts(message.parts) : undefined;
		if (!text && !questionnaire) continue;
		visible.push({
			role: message.role === 'user' ? 'You' : 'Assistant',
			text,
			...(questionnaire ? { questionnaire } : {}),
		});
	}
	return visible;
}

export function splitCurrentTurns(items: readonly DisplayedTurn[]): {
	earlier: DisplayedTurn[];
	current: DisplayedTurn[];
} {
	const lastReply = items.findLastIndex((item) => closesBeat(item.role));
	if (lastReply < 0) return { earlier: [], current: [...items] };
	const start = lastReply > 0 && items[lastReply - 1]?.role === 'You' ? lastReply - 1 : lastReply;
	return { earlier: items.slice(0, start), current: items.slice(start) };
}

function closesBeat(role: ChatMessageRole): boolean {
	return role === 'Assistant' || role === 'Error';
}
