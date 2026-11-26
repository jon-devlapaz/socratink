import { presentQuestionExample, presentQuestionJson, questionnaireToolName } from '../questionnaire.ts';

export const presentQuestionToolName = questionnaireToolName;

const presentQuestionExampleJson = JSON.stringify(presentQuestionExample);

export const presentQuestionToolDescription =
	`Box exactly one question on the card when the learner must choose among two or more defined options. Do not call it for open-ended reasoning. Do not list those options in markdown. Input is ${presentQuestionExampleJson}.`;

export const presentQuestionRetryBodies = {
	unboxed: `Those options must be boxed with present_question. Do not list choices in markdown. Call present_question now with ${presentQuestionExampleJson}.`,
	asText: `Your reply wrote the question card as JSON text, which the learner cannot use. Call present_question now with that input, shaped like ${presentQuestionExampleJson}. Write no text.`,
} as const;

export type PresentQuestionRetryReason = keyof typeof presentQuestionRetryBodies;

export function looksLikeUnboxedChoices(text: string): boolean {
	const lines = text.replace(/^ {0,3}```[^\n]*\n[\s\S]*?^ {0,3}```[ \t]*$/gm, '').trimEnd().split('\n');
	// A lettered list may be followed by one closing question ("Which one is right, and why?").
	const last = lines.at(-1) ?? '';
	const beforeLast = lines.slice(0, -1).filter((line) => line.trim() !== '').at(-1) ?? '';
	if (last.trim().endsWith('?') && !listItem.test(last) && letteredItem.test(beforeLast)) {
		return looksLikeUnboxedChoices(lines.slice(0, -1).join('\n'));
	}
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

// Letters may be bold or italic: "**A.**", "*B)*".
const letteredItem = /^( {0,3})(?:\*\*|__|\*|_)?[A-H][.)](?:\*\*|__|\*|_)?[ \t]+\S/;
const listItem = /^( {0,3})(?:(?:\*\*|__|\*|_)?[A-H][.)](?:\*\*|__|\*|_)?|[-*+]|\d{1,9}[.)])[ \t]+\S/;

export function presentQuestionRetryReason(input: {
	readonly toolCalls: readonly { tool: string; isError: boolean }[];
	readonly assistantText: string;
	readonly alreadyRetried: boolean;
}): PresentQuestionRetryReason | undefined {
	if (input.alreadyRetried) return undefined;
	const calls = input.toolCalls.filter((call) => call.tool === presentQuestionToolName);
	if (calls.some((call) => !call.isError)) return undefined;
	if (presentQuestionJson.test(input.assistantText)) return 'asText';
	if (looksLikeUnboxedChoices(input.assistantText)) return 'unboxed';
	return undefined;
}

