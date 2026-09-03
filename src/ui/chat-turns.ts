import type { FlueConversationSnapshot } from '@flue/sdk';
import type { QuestionnaireDefinition } from '../questionnaire.ts';
import { modelRouteLabel } from '../config/model-route.ts';
import { compactMarkdownText } from './chat-markdown-parse.ts';
import {
	isQuestionnaireTool,
	questionnaireAnswerPrefix,
	questionnaireFromParts,
} from './questionnaire.ts';
import { steeringPrefix } from './steering.ts';
import { toolsFromParts, type DisplayedToolCall } from './tool-card.ts';

export type ChatMessageRole = 'You' | 'Assistant' | 'Error';
export type LearnerTurnKind = 'chat' | 'questionnaire-reply' | 'steering';

export type DisplayedTurn = {
	role: ChatMessageRole;
	text: string;
	learnerKind?: LearnerTurnKind;
	trailText?: string;
	questionnaire?: QuestionnaireDefinition;
	modelRoute?: string;
	tools?: DisplayedToolCall[];
};

export function displayedLearnerTurn(text: string): DisplayedTurn {
	if (text.startsWith(questionnaireAnswerPrefix)) {
		return {
			role: 'You',
			text,
			learnerKind: 'questionnaire-reply',
			trailText: compactMarkdownText(
				text.slice(questionnaireAnswerPrefix.length).replace(/^- /gm, '').trim(),
			),
		};
	}
	if (text.startsWith(steeringPrefix)) {
		return {
			role: 'You',
			text,
			learnerKind: 'steering',
			trailText: compactMarkdownText(text.slice(steeringPrefix.length).trim()),
		};
	}
	return { role: 'You', text };
}

export function displayLabel(role: ChatMessageRole): string {
	switch (role) {
		case 'Assistant':
			return 'Socratink';
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
	history: Pick<FlueConversationSnapshot, 'messages' | 'settlements'>,
): DisplayedTurn[] {
	const visible: DisplayedTurn[] = [];
	const supersededSubmissionIds = supersededFailedSubmissionIds(history);
	for (const message of history.messages) {
		if (message.display !== 'visible' || (message.role !== 'user' && message.role !== 'assistant')) {
			continue;
		}
		if (message.submissionId && supersededSubmissionIds.has(message.submissionId)) continue;
		const text = message.parts
			.filter((part) => part.type === 'text')
			.map((part) => part.text)
			.join('\n\n');
		const questionnaire =
			message.role === 'assistant' ? questionnaireFromParts(message.parts) : undefined;
		const modelRoute =
			message.role === 'assistant' ? modelRouteLabel(message.metadata) : undefined;
		const tools = message.role === 'assistant' ? toolsFromParts(message.parts) : [];
		if (!text && !questionnaire && tools.length === 0) continue;
		if (message.role === 'user') {
			visible.push(displayedLearnerTurn(text));
			continue;
		}
		const cardTools = questionnaire
			? tools.filter((call) => !isQuestionnaireTool(call.name))
			: tools;
		visible.push({
			role: 'Assistant',
			text,
			...(questionnaire ? { questionnaire } : {}),
			...(modelRoute ? { modelRoute } : {}),
			...(cardTools.length ? { tools: cardTools } : {}),
		});
	}
	return visible;
}

function supersededFailedSubmissionIds(
	history: Pick<FlueConversationSnapshot, 'messages' | 'settlements'>,
): Set<string> {
	const failed = new Set(
		history.settlements
			.filter((settlement) => settlement.outcome === 'aborted' || settlement.outcome === 'failed')
			.map((settlement) => settlement.submissionId),
	);
	const superseded = new Set<string>();
	const visibleChat = history.messages.filter(
		(message) =>
			message.display === 'visible' && (message.role === 'user' || message.role === 'assistant'),
	);
	const groups: Array<{ submissionId?: string; messages: typeof visibleChat }> = [];
	for (const message of visibleChat) {
		const previous = groups.at(-1);
		if (message.submissionId && previous?.submissionId === message.submissionId) {
			previous.messages.push(message);
			continue;
		}
		groups.push({
			...(message.submissionId ? { submissionId: message.submissionId } : {}),
			messages: [message],
		});
	}
	for (let index = 0; index < groups.length - 1; index += 1) {
		const group = groups[index];
		const nextGroup = groups[index + 1];
		if (!group?.submissionId || !failed.has(group.submissionId) || !nextGroup) continue;
		const learner = group.messages.find((message) => message.role === 'user');
		const retry = nextGroup.messages[0];
		if (learner && retry?.role === 'user' && visibleText(learner) === visibleText(retry)) {
			superseded.add(group.submissionId);
		}
	}
	return superseded;
}

function visibleText(message: FlueConversationSnapshot['messages'][number]): string {
	return message.parts
		.filter((part) => part.type === 'text')
		.map((part) => part.text)
		.join('\n\n');
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

export function groupEarlierSteps(items: readonly DisplayedTurn[]): DisplayedTurn[][] {
	const steps: DisplayedTurn[][] = [];
	for (const item of items) {
		const current = steps.at(-1);
		if (!current || item.role === 'You') {
			steps.push([item]);
			continue;
		}
		current.push(item);
	}
	return steps;
}

function closesBeat(role: ChatMessageRole): boolean {
	return role === 'Assistant' || role === 'Error';
}
