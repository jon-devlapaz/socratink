/** The one owner of what the learner may see of the tutor's text. Every past
 * leak was a rule added on one path and missed on the other: markers (#25),
 * reasoning in <think> tags (#117), tool names and reveal notes (#116, #136),
 * a literal "(no text)" (#131). check:structure keeps these rules here. */

const leadingMarkers = /^(?:«[A-Z][A-Z0-9_]*»\s*)+/u;
const partialLeadingMarker = /^«(?:[A-Z][A-Z0-9_]*)?$/u;
const internalToolName = /\b(?:mark_reveal|present_question)\b/u;
const revealNote = /\b(?:no reveal|no answer (?:shown|given|revealed)|answer (?:withheld|not shown|not revealed)|(?:not|without) (?:showing|revealing|giving) (?:you )?the answer|withholding the answer)\b/iu;
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
	const visible = splitReasoning(text).text.replace(leadingMarkers, '');
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
