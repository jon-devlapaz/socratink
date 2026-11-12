import { questionnaireAnswerPrefix, questionnaireHelpText, type QuestionnaireHelp } from '../questionnaire.ts';
import { revealToolName, type RevealDefinition } from '../reveal.ts';

/** Keeps assistance labeled. A turn that may have supplied target content
 * without mark_reveal gets one correction. A card help request always counts
 * as assistance, so it never ends unlabeled. */

export const markRevealRetryBodies = {
	requested: `The learner used the question card's help, so this turn gave assistance. Call ${revealToolName} now with the kind you gave: hint, worked_example, partial, or full_answer. Write no text.`,
	unmarked: `Check your last reply. If it supplied target content (a hint, worked example, partial explanation, or full answer, including a short explanation of new material), call ${revealToolName} now with that kind and write no text. If it only asked a question or gave feedback, end the turn with no text.`,
} as const;

export type MarkRevealRetryReason = keyof typeof markRevealRetryBodies;

const helpKinds: Record<QuestionnaireHelp, RevealDefinition['kind']> = { hint: 'hint', unknown: 'partial' };

/** The reveal a card help request records when the tutor did not mark one. */
export function cardHelpReveal(learnerText: string): RevealDefinition | undefined {
	if (!learnerText.startsWith(questionnaireAnswerPrefix)) return undefined;
	for (const line of learnerText.split('\n')) {
		for (const [help, text] of Object.entries(questionnaireHelpText) as [QuestionnaireHelp, string][]) {
			const suffix = `: ${text}`;
			if (!line.startsWith('- ') || !line.endsWith(suffix)) continue;
			const target = line.slice(2, -suffix.length).trim();
			return { kind: helpKinds[help], ...(target ? { target } : {}) };
		}
	}
	return undefined;
}

// Cues only decide whether to ask; the model judges whether it supplied content.
const helpRequest = /\b(?:hints?|clue|just tell me|tell me the answer|give me the answer|what(?:'s| is) the answer|i (?:don'?t|do not) know|idk|no idea|i'?m stuck|i am stuck|explain (?:it|this|that)|show me how)\b/i;
const revealCue = /\b(?:here'?s a hint|hint:|the (?:answer|key idea|trick) is|worked example|here'?s how (?:it|this) works)/i;

export function markRevealRetryReason(input: {
	readonly revealed: boolean;
	readonly learnerText: string;
	readonly assistantText: string;
	readonly alreadyRetried: boolean;
}): MarkRevealRetryReason | undefined {
	if (input.revealed || input.alreadyRetried) return undefined;
	if (cardHelpReveal(input.learnerText)) return 'requested';
	if (helpRequest.test(input.learnerText) || revealCue.test(input.assistantText)) return 'unmarked';
	return undefined;
}
