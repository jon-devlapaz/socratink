import type { QuestionnaireDefinition } from '../questionnaire.ts';
import { questionnaireFromReplyData } from '../questionnaire.ts';
import { learnerVisibleText } from '../learning/learner-text.ts';
import { visibleCardTools, type DisplayedToolCall } from './tool-state.ts';

export function assistantTurnHasVisibleContent(input: {
	text: string;
	data?: Record<string, unknown[]>;
	questionnaire?: QuestionnaireDefinition;
	tools?: readonly DisplayedToolCall[];
}): boolean {
	if (learnerVisibleText(input.text).trim()) return true;
	const questionnaire = input.questionnaire ?? questionnaireFromReplyData(input.data);
	if (questionnaire) return true;
	return visibleCardTools(input.tools ?? [], { questionnaire }).length > 0;
}
