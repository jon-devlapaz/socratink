import type { QuestionnaireDefinition } from '../questionnaire.ts';
import { questionnaireFromReplyData } from './questionnaire.ts';
import { visibleCardTools, type DisplayedToolCall } from './tool-card.ts';

const internalAssistantMarkerPattern = /^«[A-Z][A-Z0-9_]*»\s*/u;

export function learnerVisibleAssistantText(text: string): string {
	let visible = text;
	while (internalAssistantMarkerPattern.test(visible)) {
		visible = visible.replace(internalAssistantMarkerPattern, '');
	}
	return visible;
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
