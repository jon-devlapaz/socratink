// Deterministic checks of what a learner sees in one tutor reply: the projected wire
// message, never model reasoning. Text heuristics: a pass shows the rule held in this
// transcript, not that the tutor follows it in general.
//
// The internal-note patterns are a test oracle, not the product filter. They stay
// independent of src/learning's learner-text owner, or a leak the filter misses
// would also pass here.
import type { WireMessage } from '../../src/config/chat-wire.ts';
import type { BehaviourRuleId } from '../../src/learning/behaviour-rules.ts';
import { revealCue } from '../../src/learning/mark-reveal.ts';
import { looksLikeUnboxedChoices } from '../../src/learning/present-question.ts';
import { questionnaireFromParts, type QuestionnaireDefinition } from '../../src/questionnaire.ts';
import { parseRevealDefinition, revealDataName, revealToolName, type RevealDefinition } from '../../src/reveal.ts';

export type CheckName = BehaviourRuleId | 'no-choice-position' | 'turn-completed' | 'scenario-ran';
export type CheckResult = { check: CheckName; status: 'pass' | 'fail' | 'skip'; detail?: string; turn?: number };

const internalNotePatterns = [
	/\bno (?:answer|reveal|solution)s? (?:shown|given|revealed|supplied)\b/i,
	/\bno reveal\b/i,
	/\b(?:not|without) (?:showing|revealing|giving) (?:you )?(?:the )?(?:answer|solution)\b/i,
	/\b(?:withhold(?:ing)?|withheld|holding back) (?:the )?(?:answer|reveal|solution)\b/i,
	/\bquestion only\b/i,
	/\bmark_reveal\b|\bpresent_question\b|\brequested:\s*(?:true|false)\b/i,
	/\b(?:consent card|reveal card|tool call|bookkeeping|system prompt|reveal provenance)\b/i,
	/\b(?:this|that) (?:turn|reply) (?:is|was) (?:a |an )?(?:hint|reveal|partial|full[ _]answer|worked[ _]example)\b/i,
	/\((?:full[ _]answer|worked[ _]example|reveal)\b[^)]{0,40}\)/i,
	/\[(?:internal|note|reveal|hint)[^\]]*\]/i,
	/\{\s*"(?:prompt|choices)"\s*:/, // a present_question call written as text (#164)
];

function textOf(message: WireMessage | undefined): string {
	return (message?.parts ?? []).flatMap((part) => part.type === 'text' ? [part.text] : []).join('\n\n');
}

/** Reveals the reply recorded: the app's data parts plus mark_reveal tool parts. */
function revealsOf(message: WireMessage | undefined): RevealDefinition[] {
	return (message?.parts ?? []).flatMap((part) => {
		if (part.type === `data-${revealDataName}` && 'data' in part) return [part.data];
		if (part.type === 'dynamic-tool' && part.toolName === revealToolName && part.state !== 'output-error') return [part.input];
		return [];
	}).flatMap((value) => parseRevealDefinition(value) ?? []);
}

export function cardOf(message: WireMessage | undefined): QuestionnaireDefinition | undefined {
	return questionnaireFromParts(message?.parts ?? []);
}

const isConsent = (message: WireMessage | undefined) => cardOf(message)?.kind === 'reveal-consent';

/** Text the learner reads as prose: fences, inline code and quotes removed. */
function prose(text: string): string {
	return text.replace(/^ {0,3}```[^\n]*\n[\s\S]*?^ {0,3}```[ \t]*$/gm, '')
		.replace(/`[^`\n]*`/g, '')
		.split('\n').filter((line) => !/^\s*>/.test(line)).join('\n');
}

// A short tag such as "Why or why not?" belongs to the question before it.
const tagQuestion = /^(?:and |or )?(?:why|how)(?: or why not| or how| not| so)?\?+$/i;

export function questionsIn(text: string): string[] {
	const found = (prose(text).match(/[^.!?\n]*\?+/g) ?? []).map((q) => q.trim()).filter((q) => q.replace(/\?+$/, '').trim() !== '');
	return found.filter((q, index) => index === 0 || !tagQuestion.test(q));
}

const result = (check: CheckName, pass: boolean, detail?: string): CheckResult =>
	({ check, status: pass ? 'pass' : 'fail', ...(!pass && detail ? { detail } : {}) });

export const skipped = (check: CheckName, detail: string): CheckResult => ({ check, status: 'skip', detail });

/** Checks every reply must pass, whatever the scenario. */
export function replyChecks(message: WireMessage): CheckResult[] {
	const text = textOf(message);
	const card = cardOf(message);
	const tutorCard = card && card.kind !== 'reveal-consent' ? card : undefined;
	const item = tutorCard?.items[0];
	const learnerFacing = [text, ...(item ? [item.prompt, ...item.choices.map((c) => c.label)] : [])].join('\n');
	const leaks = internalNotePatterns.flatMap((pattern) => learnerFacing.match(pattern)?.[0] ?? []);
	const questions = questionsIn(text);
	const asked = [...questions, ...(item ? [`card: ${item.prompt}`] : [])];
	// Closing marks of a bold, italic or quoted question are part of it, not text after it.
	const afterLast = questions.length && !item ? prose(text).slice(prose(text).lastIndexOf('?') + 1).replace(/^[\s*_"'”’)]+/u, '').trim() : '';
	const cue = revealCue.exec(text)?.[0];
	return [
		result('no-internal-notes', leaks.length === 0, `matched: ${leaks.join(' | ')}`),
		result('one-question', asked.length <= 1, `${asked.length} questions: ${asked.join(' | ')}`),
		result('ends-on-question', afterLast === '', `text after the question: ${afterLast.slice(0, 120)}`),
		result('choices-boxed', !looksLikeUnboxedChoices(text), 'choices listed in text'),
		result('reveal-marked', !cue || revealsOf(message).length > 0 || isConsent(message), `unmarked cue: ${cue}`),
	];
}

/** The learner asked for the answer in words: show it with no consent card (#133). */
export function expectRequestedReveal(message: WireMessage | undefined): CheckResult {
	const problems = [
		...(isConsent(message) ? ['showed a consent card'] : []),
		...(!revealsOf(message).some((r) => r.requested === true) ? [`no mark_reveal with requested: true (got ${JSON.stringify(revealsOf(message))})`] : []),
		...(textOf(message).trim().length < 40 ? ['reply text is empty or too short to hold the answer'] : []),
	];
	return result('just-tell-me', problems.length === 0, problems.join('; '));
}

export function expectNoChoicePosition(
	message: WireMessage | undefined, card: QuestionnaireDefinition, correctLabel: string,
): CheckResult {
	const text = textOf(message).replace(/[*_`]/g, '');
	const choices = card.items[0]!.choices;
	const ordinals = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth'];
	const reference = /\b(?:(first|second|third|fourth|fifth|sixth|seventh|eighth|last|top|bottom)\s+(?:one|option|choice|answer)|(?:option|choice|answer)\s+([A-H]|[1-8])|(?:it (?:is|was)|the answer is|the correct (?:one|answer|choice) (?:is|was))\s+(?:the\s+)?(first|second|third|fourth|fifth|sixth|seventh|eighth|last|top|bottom|[A-H]))\b/gi;
	const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
	// The tutor writes its own label, so the correct one only has to start with the expected words.
	const isCorrect = (label: string) => normalize(label).startsWith(normalize(correctLabel));
	const problems: string[] = [];
	for (const clause of text.split(/[.!?;\n]|\bbut\b/i)) {
		for (const match of clause.matchAll(reference)) {
			if (match[3] && /^[a-h]$/.test(match[3])) continue;
			const token = (match[1] ?? match[2] ?? match[3]!).toLowerCase();
			const index = token === 'top' ? 0 : token === 'bottom' || token === 'last' ? choices.length - 1
				: ordinals.includes(token) ? ordinals.indexOf(token)
				: /^[1-8]$/.test(token) ? Number(token) - 1 : token.charCodeAt(0) - 97;
			const choice = choices[index];
			if (!choice) {
				problems.push(`${match[0]} is outside the displayed card`);
				continue;
			}
			const named = choices.filter((option) => normalize(clause).includes(normalize(option.label)));
			const wrong = /\b(?:wrong|incorrect|not (?:right|correct))\b/i.test(clause);
			const right = !wrong && /\b(?:right|correct)\b|\b(?:it (?:is|was)|the answer is)\b/i.test(clause);
			if (named.some((option) => option.value !== choice.value)
				|| (wrong && isCorrect(choice.label)) || (right && !isCorrect(choice.label))) {
				problems.push(`${match[0]} refers to ${choice.label} on the displayed card`);
			}
		}
	}
	return result('no-choice-position', text.trim().length > 0 && problems.length === 0,
		problems.join('; ') || (text.trim() ? 'references match displayed order where checked' : 'reply has no answer text'));
}

/** A reply that says which choice was right, or states the right idea, hands over the
 * answer, so it must record a reveal. `giveaways` match statements that do that. */
export function expectRevealedAnswerMarked(message: WireMessage | undefined, giveaways: readonly RegExp[]): CheckResult {
	const text = prose(textOf(message)).replace(/[*_`]/g, '');
	const statements = text.split(/(?<=[.!?]["”’')]?)\s+|\n+|\s[—–]\s/).filter((sentence) => sentence.trim() && !/\?\s*["”']?$/.test(sentence.trim()));
	const given = statements.filter((sentence) => giveaways.some((pattern) => pattern.test(sentence)));
	return result('named-choice-marked', given.length === 0 || revealsOf(message).length > 0 || isConsent(message),
		`answer given with no recorded reveal: ${given.join(' | ').slice(0, 160)}`);
}

export function expectMarkedHelp(message: WireMessage | undefined, check: 'dont-know-marked' | 'hint-marked'): CheckResult {
	const problems = [
		...(revealsOf(message).length === 0 && !isConsent(message) ? ['help turn recorded no reveal'] : []),
		...(check === 'hint-marked' && isConsent(message) ? ['a hint showed a consent card'] : []),
	];
	return result(check, problems.length === 0, problems.join('; '));
}

/** After "Try once more": no reveal and exactly one question (#136). */
export function expectTryOnceMore(message: WireMessage | undefined): CheckResult {
	const card = cardOf(message);
	const problems = [
		...(isConsent(message) ? ['showed another consent card'] : []),
		...(revealsOf(message).length ? [`recorded a reveal: ${JSON.stringify(revealsOf(message))}`] : []),
		...(questionsIn(textOf(message)).length + (card && card.kind !== 'reveal-consent' ? 1 : 0) !== 1 ? ['did not ask exactly one question'] : []),
	];
	return result('try-once-more-withholds', problems.length === 0, problems.join('; '));
}

// Statements that hand over the idempotency card's answer or its reason: the choice
// itself (a retry of the same payment) or the mechanism (same result, not charged twice).
// A question may point at these; a statement that says them leaves nothing to work out.
const paymentGiveaways = [
	/\bsame (?:result|response|outcome|answer)\b/i,
	/\b(?:instead of|rather than|without) (?:running|charging|processing|doing|executing|billing)\b/i,
	/\b(?:charg|bill|process|run|execut)\w* (?:\w+ ){0,3}(?:twice|again|two times|a second time)\b/i,
	/\bdouble[- ]?(?:charg|bill|pay)/i,
	/\bduplicate (?:charge|payment|purchase|request|operation)/i,
	/\b(?:retry|re-?run|re-?send|resend)\b/i,
	/\bsame (?:\$?40 )?(?:payment|charge|operation|logical operation|purchase|request)\b/i,
	// The key's purpose, said without "same": one operation across attempts (live run 2026-11-25).
	/\b(?:one|single) (?:logical )?(?:payment |business )?operation\b/i,
	/\b(?:across|between) (?:attempts|retries|requests)\b/i,
];

/** After Hint on the payment card, the clue the learner sees must leave the choice and its
 * reason for them to work out. The text is what the learner reads, after the app's display. */
export function expectHintLeavesReasoning(message: WireMessage | undefined): CheckResult {
	const text = prose(textOf(message)).replace(/[*_`]/g, '');
	if (!text.trim()) return result('hint-leaves-reasoning', false, 'the hint showed no clue');
	const statements = text.split(/(?<=[.!?])\s+|\n+/).filter((sentence) => sentence.trim() && !/\?\s*["”']?$/.test(sentence.trim()));
	const giveaways = statements.filter((sentence) => paymentGiveaways.some((pattern) => pattern.test(sentence)));
	return result('hint-leaves-reasoning', giveaways.length === 0, `states the answer or its reason: ${giveaways.join(' | ')}`);
}
