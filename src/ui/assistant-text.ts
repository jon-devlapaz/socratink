import type { QuestionnaireDefinition } from '../questionnaire.ts';
import { questionnaireFromReplyData } from '../questionnaire.ts';
import { visibleCardTools, type DisplayedToolCall } from './tool-state.ts';

const internalAssistantMarkersPattern = /^(?:«[A-Z][A-Z0-9_]*»\s*)+/u;

const internalToolNamePattern = /\b(?:mark_reveal|present_question)\b/u;

export function learnerVisibleAssistantText(text: string): string {
	const visible = text.replace(internalAssistantMarkersPattern, '');
	if (!internalToolNamePattern.test(visible)) return visible;
	return visible
		.replace(/[ \t]*\((?:[^()]|\([^()]*\))*(?:\)|$)/gu,
			(part) => internalToolNamePattern.test(part) ? '' : part)
		.replace(/[^.!?\n]+(?:[.!?]+|$)/gu,
			(sentence) => internalToolNamePattern.test(sentence) ? '' : sentence)
		.trim();
}

export function assistantTurnHasVisibleContent(input: {
	text: string;
	data?: Record<string, unknown[]>;
	questionnaire?: QuestionnaireDefinition;
	tools?: readonly DisplayedToolCall[];
}): boolean {
	if (learnerVisibleAssistantText(input.text).trim()) return true;
	const questionnaire = input.questionnaire ?? questionnaireFromReplyData(input.data);
	if (questionnaire) return true;
	return visibleCardTools(input.tools ?? [], { questionnaire }).length > 0;
}
