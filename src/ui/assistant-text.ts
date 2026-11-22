import type { QuestionnaireDefinition } from '../questionnaire.ts';
import { questionnaireFromReplyData } from '../questionnaire.ts';
import { visibleCardTools, type DisplayedToolCall } from './tool-state.ts';

const internalAssistantMarkersPattern = /^(?:«[A-Z][A-Z0-9_]*»\s*)+/u;

const internalToolNamePattern = /\b(?:mark_reveal|present_question)\b/u;
// The tutor's own notes on whether it showed the answer, such as "No answer
// shown." or "(no reveal, this was a question only)". The learner sees only the teaching.
const revealNotePattern = /\b(?:no reveal|no answer (?:shown|given|revealed)|answer (?:withheld|not shown|not revealed)|(?:not|without) (?:showing|revealing|giving) (?:you )?the answer|withholding the answer)\b/iu;

export function learnerVisibleAssistantText(text: string): string {
	const visible = text.replace(internalAssistantMarkersPattern, '');
	if (!internalToolNamePattern.test(visible) && !revealNotePattern.test(visible)) return visible;
	return visible
		.replace(/[ \t]*\((?:[^()]|\([^()]*\))*(?:\)|$)/gu,
			(part) => internalToolNamePattern.test(part) || revealNotePattern.test(part) ? '' : part)
		.replace(/[^.!?\n]+(?:[.!?]+|$)/gu,
			// A reveal note never takes the question with it.
			(sentence) => internalToolNamePattern.test(sentence)
				|| (revealNotePattern.test(sentence) && !sentence.trimEnd().endsWith('?')) ? '' : sentence)
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
