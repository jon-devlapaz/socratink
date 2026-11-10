import { presentQuestionExample, questionnaireToolName } from '../questionnaire.ts';

export const presentQuestionToolName = questionnaireToolName;

const presentQuestionExampleJson = JSON.stringify(presentQuestionExample);

export const presentQuestionToolDescription =
	`Box exactly one question on the card when the learner must choose among two or more defined options. Do not call it for open-ended reasoning. Do not list those options in markdown. Input is ${presentQuestionExampleJson}.`;

export const presentQuestionRetryBodies = {
	invalid: `present_question failed validation. Call it with this shape only: ${presentQuestionExampleJson}. One prompt, two to eight choices, optional reasoning. Do not list the choices in markdown.`,
	unboxed: `Those options must be boxed with present_question. Do not list choices in markdown. Call present_question now with ${presentQuestionExampleJson}.`,
} as const;

export type PresentQuestionRetryReason = keyof typeof presentQuestionRetryBodies;

// Choices only count when the turn ends on the list: a skill map in a fence,
// or a subskill list followed by an open question, is not a pick.
export function looksLikeUnboxedChoices(text: string): boolean {
	const lines = text.replace(/^ {0,3}```[^\n]*\n[\s\S]*?^ {0,3}```[ \t]*$/gm, '').trimEnd().split('\n');
	let start = lines.length;
	while (start > 0) {
		const line = lines[start - 1] ?? '';
		if (!listItem.test(line) && !(line.trim() === '' && start < lines.length)) break;
		start -= 1;
	}
	const list = lines.slice(start).filter((line) => line.trim() !== '');
	const lettered = list.filter((line) => letteredItem.test(line)).length;
	if (lettered >= 2) return true;
	if (list.length < 2 || list.length > 8) return false;
	return /\b(?:which|choose|pick|select|would you rather|do you want)\b/i.test(lines.slice(0, start).join('\n'));
}

const letteredItem = /^( {0,3})[A-H][.)]\s+\S/;
const listItem = /^( {0,3})(?:[A-H][.)]|[-*+]|\d{1,9}[.)])[ \t]+\S/;

export function presentQuestionRetryReason(input: {
	readonly toolCalls: readonly { tool: string; isError: boolean }[];
	readonly assistantText: string;
	readonly alreadyRetried: boolean;
}): PresentQuestionRetryReason | undefined {
	if (input.alreadyRetried) return undefined;
	const calls = input.toolCalls.filter((call) => call.tool === presentQuestionToolName);
	if (calls.some((call) => !call.isError)) return undefined;
	if (calls.some((call) => call.isError)) return 'invalid';
	if (looksLikeUnboxedChoices(input.assistantText)) return 'unboxed';
	return undefined;
}

