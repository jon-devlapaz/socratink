import { steeringPrefix } from '../config/chat-message.ts';
import { questionnaireAnswerPrefix, type QuestionnaireHelp } from '../questionnaire.ts';
import { revealToolName, type RevealDefinition } from '../reveal.ts';


export const markRevealRetryBodies = {
	requested: `The learner used the question card's help, so this turn gave assistance. Call ${revealToolName} now with the kind you gave: hint, worked_example, partial, or full_answer. Write no text.`,
	unmarked: `Check your last reply. If it supplied target content (a hint, worked example, partial explanation, or full answer, including a short explanation of new material), call ${revealToolName} now with that kind and write no text. If it only asked a question or gave feedback, end the turn with no text.`,
} as const;

export type MarkRevealRetryReason = keyof typeof markRevealRetryBodies;

const helpKinds: Record<QuestionnaireHelp, RevealDefinition['kind']> = { hint: 'hint', unknown: 'partial' };

export function cardHelpReveal(help: QuestionnaireHelp, target?: string): RevealDefinition {
	return { kind: helpKinds[help], ...(target ? { target } : {}) };
}

const helpRequest = /\b(?:hints?|clue|just tell me|tell me the answer|give me the answer|what(?:'s| is) the answer|i (?:don'?t|do not) know|idk|no idea|i'?m stuck|i am stuck|explain (?:it|this|that)|show me how)\b/i;
export const revealCue = /\b(?:here'?s a hint|hint:|the (?:answer|key idea|trick) is|worked example|here'?s how (?:it|this) works)/i;

export function markRevealRetryReason(input: {
	readonly revealed: boolean;
	readonly learnerText: string;
	readonly cardHelp?: QuestionnaireHelp;
	readonly assistantText: string;
	readonly alreadyRetried: boolean;
}): MarkRevealRetryReason | undefined {
	if (input.revealed || input.alreadyRetried) return undefined;
	if (input.cardHelp) return 'requested';
	if (helpRequest.test(input.learnerText) || revealCue.test(input.assistantText)
		|| (input.learnerText.startsWith(questionnaireAnswerPrefix) && input.learnerText.endsWith(': Try once more'))) return 'unmarked';
	return undefined;
}

// Only plain requests for the answer itself. "just tell me" counts when it ends a
// line, so "just tell me if I'm right" does not.
const answerRequest = /\b(?:(?:just )?(?:tell|give|show) me the (?:full )?answer\b|just tell me(?: it)?(?=[\s.!]*$))/im;

/** True when the learner's own words ask for the answer, anywhere in the
 * message, including a first message that also asks the question. Card answers,
 * steering, quoted lines and fenced code are not the learner's request. */
export function asksForAnswer(learnerText: string): boolean {
	if (learnerText.startsWith(questionnaireAnswerPrefix) || learnerText.startsWith(steeringPrefix)) return false;
	const own = learnerText.replace(/^(```|~~~)[^\n]*\n[\s\S]*?(?:^\1[^\n]*$|(?![\s\S]))/gm, '')
		.split('\n').filter((line) => !line.trimStart().startsWith('>')).join('\n');
	return answerRequest.test(own);
}
