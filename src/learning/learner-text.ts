/** The one owner of what the learner may see of the tutor's text. Every past
 * leak was a rule added on one path and missed on the other: markers (#25),
 * reasoning in <think> tags (#117), tool names and reveal notes (#116, #136),
 * a literal "(no text)" (#131), prose answering a correction that asked
 * for no text (first live eval), and a present_question call written as JSON
 * text (#164), and a question asked beside the card that already asks it
 * (#163). check:structure keeps these rules here. */

import { presentQuestionJson } from '../questionnaire.ts';
import { markRevealRetryBodies } from './mark-reveal.ts';
import { presentQuestionRetryBodies } from './present-question.ts';

const noTextCorrections: readonly string[] = [...Object.values(markRevealRetryBodies), presentQuestionRetryBodies.asText];
const leadingMarkers = /^(?:«[A-Z][A-Z0-9_]*»\s*)+/u;
const partialLeadingMarker = /^«(?:[A-Z][A-Z0-9_]*)?$/u;
const internalToolName = /\b(?:mark_reveal|present_question)\b/u;
const revealNote = /\b(?:no reveal|no answer (?:shown|given|revealed)|answer (?:withheld|not shown|not revealed)|(?:not|without) (?:showing|revealing|giving) (?:you )?the answer|withholding the answer)\b/iu;
// Text still arriving holds back a trailing "{" that may yet open a
// present_question input.
const partialToolCallJson = /\{\s*(?:"(?:p(?:r(?:o(?:m(?:p(?:t)?)?)?)?)?|c(?:h(?:o(?:i(?:c(?:e(?:s)?)?)?)?)?)?)?(?:"\s*)?)?$/u;
const thinkOpen = '<think>';
const thinkClose = '</think>';
const partialThinkOpen = /<(?:t(?:h(?:i(?:n(?:k)?)?)?)?)?$/u;

/** Splits raw model text into reply text and the reasoning a provider sent
 * inline in <think> tags, closed, unbalanced or unclosed. Text still arriving
 * holds back what may yet turn hidden: a half tag, or a half "(no text)",
 * because the live stream only appends and can never take shown text back. */
export function splitReasoning(raw: string): { text: string; reasoning: string } {
	const closed = raw.lastIndexOf(thinkClose);
	let text = closed < 0 ? raw : raw.slice(closed + thinkClose.length);
	let reasoning = closed < 0 ? '' : raw.slice(0, closed);
	const open = text.indexOf(thinkOpen);
	if (open >= 0) { reasoning += text.slice(open); text = text.slice(0, open); }
	if (closed >= 0 || open >= 0) text = text.trim();
	text = text.replace(partialThinkOpen, '');
	const trimmed = text.trim();
	if (trimmed && '(no text)'.startsWith(trimmed.toLowerCase())) text = '';
	return { text, reasoning: reasoning.replaceAll(thinkOpen, '').replaceAll(thinkClose, '').trim() };
}

/** What the learner may see of reply text, complete or still arriving. A half
 * arrived leading marker shows nothing, and a reveal note never takes the
 * question with it. */
export function learnerVisibleText(text: string): string {
	const visible = withoutToolCallJson(splitReasoning(text).text.replace(leadingMarkers, ''));
	if (partialLeadingMarker.test(visible)) return '';
	if (!internalToolName.test(visible) && !revealNote.test(visible)) return visible;
	return visible
		.replace(/[ \t]*\((?:[^()]|\([^()]*\))*(?:\)|$)/gu,
			(part) => internalToolName.test(part) || revealNote.test(part) ? '' : part)
		.replace(/[^.!?\n]+(?:[.!?]+|$)/gu,
			(sentence) => internalToolName.test(sentence)
				|| (revealNote.test(sentence) && !sentence.trimEnd().endsWith('?')) ? '' : sentence)
		.trim();
}

/** Text beside a tutor's question card, without the questions it ends on.
 * The card is that turn's one question, so a question in the text asks it
 * twice (#163). A lead-in such as "**Question:**" goes with its question.
 * Feedback and hints before the question stay. */
export function withoutQuestionBesideCard(text: string): string {
	const question = /\?["'”’)*_]*$/u;
	const leadIn = /[^\n.!?]*:[*_]*$/u;
	const before = text.trimEnd();
	// "What happens to the molecules? Let me start with the first question:" asks
	// beside the card too: the lead-in only points at the card.
	const pointing = before.replace(leadIn, '').trimEnd();
	let visible = pointing !== before && question.test(pointing) ? pointing : before;
	while (question.test(visible)) {
		let start = 0;
		for (const match of visible.matchAll(/[.!?]["'”’)*_]*[ \t]+|\n/gu)) start = match.index + match[0].length;
		visible = visible.slice(0, start).trimEnd();
	}
	return visible === before ? visible : visible.replace(leadIn, '').trimEnd();
}

/** Whether a correction told the tutor to write no text. Whatever text it
 * writes after one is addressed to the correction, never to the learner. */
export function asksForNoText(correction: string): boolean {
	return noTextCorrections.includes(correction);
}

function withoutToolCallJson(text: string): string {
	let visible = text;
	for (let match = presentQuestionJson.exec(visible); match; match = presentQuestionJson.exec(visible)) {
		const end = objectEnd(visible, match.index);
		visible = (visible.slice(0, match.index) + (end < 0 ? '' : visible.slice(end))).trim();
	}
	return visible.replace(partialToolCallJson, '');
}

/** The index after the JSON object that opens at `start`, or -1 while it is unclosed. */
function objectEnd(text: string, start: number): number {
	let depth = 0;
	let inString = false;
	for (let index = start; index < text.length; index += 1) {
		const char = text[index];
		if (inString) {
			if (char === '\\') index += 1;
			else if (char === '"') inString = false;
		} else if (char === '"') inString = true;
		else if (char === '{' || char === '[') depth += 1;
		else if ((char === '}' || char === ']') && (depth -= 1) === 0) return index + 1;
	}
	return -1;
}
