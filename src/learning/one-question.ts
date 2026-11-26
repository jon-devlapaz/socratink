import { learnerVisibleText } from './learner-text.ts';

/** Sent once when a text reply breaks "Ask ONE question at a time" or keeps
 * writing after its question (#163). The rewrite replaces the reply the
 * learner sees, so it must stand on its own. */
export const oneQuestionRetryBody = 'Your reply asked more than one question, or kept writing after its question. Rewrite the whole reply for the learner: keep what helps, ask only the single most useful question, and end the message right after it.';

// A short tag such as "Why or why not?" belongs to the question before it.
const tagQuestion = /^(?:and |or )?(?:why|how)(?: or why not| or how| not| so)?\?+$/iu;
const closingMarks = /^["'”’)*_\s]*$/u;

/** Text the learner reads as prose: code and quoted lines are not the tutor asking. */
function prose(text: string): string {
	return text.replace(/^ {0,3}```[^\n]*\n[\s\S]*?^ {0,3}```[ \t]*$/gmu, '')
		.replace(/`[^`\n]*`/gu, '')
		.split('\n').filter((line) => !/^\s*>/u.test(line)).join('\n');
}

function questionsIn(text: string): string[] {
	const found = (text.match(/[^.!?\n]*\?+/gu) ?? []).map((question) => question.trim())
		.filter((question) => question.replace(/\?+$/u, '').trim() !== '');
	return found.filter((question, index) => index === 0 || !tagQuestion.test(question));
}

/** Whether a final text reply should be rewritten to ask exactly one question. */
export function needsOneQuestionRewrite(input: { readonly assistantText: string; readonly alreadyRetried: boolean }): boolean {
	if (input.alreadyRetried) return false;
	const text = prose(learnerVisibleText(input.assistantText)).trim();
	const questions = questionsIn(text);
	if (questions.length > 1) return true;
	if (questions.length === 0) return false;
	return !closingMarks.test(text.slice(text.lastIndexOf('?') + 1));
}
