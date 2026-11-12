import { revealFromParts, type RevealDefinition } from '../reveal.ts';
import type { WireSnapshot } from '../config/chat-wire.ts';
import type { QuestionnaireDefinition } from '../questionnaire.ts';
import { modelRouteLabel } from '../config/model-route.ts';
import { assistantTurnHasVisibleContent, learnerVisibleAssistantText } from './assistant-text.ts';
import {
	questionnaireAnswerPrefix,
	questionnaireFromParts,
} from '../questionnaire.ts';
import { steeringPrefix } from '../config/chat-message.ts';
import { steeringSaidText } from './steering.ts';
import { toolsFromParts, visibleCardTools, type DisplayedToolCall } from './tool-state.ts';

export type ChatMessageRole = 'You' | 'Assistant' | 'Error';
export type LearnerTurnKind = 'chat' | 'questionnaire-reply' | 'steering';

export type DisplayedTurn = {
	reveal?: RevealDefinition;
	role: ChatMessageRole;
	text: string;
	learnerKind?: LearnerTurnKind;
	/** What a learner turn shows when its sent text is a message for the tutor. */
	shownText?: string;
	questionnaire?: QuestionnaireDefinition;
	modelRoute?: string;
	tools?: DisplayedToolCall[];
};

export function displayedAssistantTurn(input: {
	text: string;
	questionnaire?: QuestionnaireDefinition;
	reveal?: RevealDefinition;
	modelRoute?: string;
	tools?: readonly DisplayedToolCall[];
}): DisplayedTurn | undefined {
	if (!assistantTurnHasVisibleContent(input)) return undefined;
	const tools = visibleCardTools(input.tools ?? [], { questionnaire: input.questionnaire });
	return {
		role: 'Assistant',
		text: learnerVisibleAssistantText(input.text),
		...(input.questionnaire ? { questionnaire: input.questionnaire } : {}),
		...(input.reveal ? { reveal: input.reveal } : {}),
		...(input.modelRoute ? { modelRoute: input.modelRoute } : {}),
		...(tools.length ? { tools } : {}),
	};
}

/** Shows a learner turn in the learner's own words. A card answer drops the
 * protocol header and the question it answers; a steering control shows its
 * short line. `text` stays exactly what was sent. */
export function displayedLearnerTurn(text: string, answered?: QuestionnaireDefinition): DisplayedTurn {
	if (text.startsWith(questionnaireAnswerPrefix)) {
		const lines = text.slice(questionnaireAnswerPrefix.length).trim().split('\n').map((line) => {
			const answer = line.replace(/^- /, '');
			const prompt = answered?.items.find((item) => answer.startsWith(`${item.prompt}: `))?.prompt;
			return prompt === undefined ? answer : answer.slice(prompt.length + 2);
		});
		return {
			role: 'You',
			text,
			learnerKind: 'questionnaire-reply',
			shownText: lines.join('\n'),
		};
	}
	if (text.startsWith(steeringPrefix)) {
		return {
			role: 'You',
			text,
			learnerKind: 'steering',
			shownText: steeringSaidText(text) ?? text.slice(steeringPrefix.length).trim(),
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
	history: Pick<WireSnapshot, 'messages' | 'settlements'>,
): DisplayedTurn[] {
	const visible: DisplayedTurn[] = [];
	const supersededSubmissionIds = supersededFailedSubmissionIds(history);
	for (const message of history.messages) {
		if (message.submissionId && supersededSubmissionIds.has(message.submissionId)) continue;
		const text = visibleText(message);
		if (message.role === 'user') {
			if (!text) continue;
			visible.push(displayedLearnerTurn(text, visible.at(-1)?.questionnaire));
			continue;
		}
		const turn = displayedAssistantTurn({
			text,
			questionnaire: questionnaireFromParts(message.parts),
			reveal: revealFromParts(message.parts),
			modelRoute: modelRouteLabel(message.metadata),
			tools: toolsFromParts(message.parts),
		});
		if (turn) visible.push(turn);
	}
	return visible;
}

function supersededFailedSubmissionIds(
	history: Pick<WireSnapshot, 'messages' | 'settlements'>,
): Set<string> {
	const failed = new Set(
		history.settlements
			.filter((settlement) => settlement.outcome === 'aborted' || settlement.outcome === 'failed')
			.map((settlement) => settlement.submissionId),
	);
	const superseded = new Set<string>();
	const groups: Array<{ submissionId?: string; messages: typeof history.messages }> = [];
	for (const message of history.messages) {
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

function visibleText(message: WireSnapshot['messages'][number]): string {
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
