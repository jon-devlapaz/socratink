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

export type CheckName = BehaviourRuleId | 'turn-completed' | 'scenario-ran';
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
];

export function textOf(message: WireMessage | undefined): string {
	return (message?.parts ?? []).flatMap((part) => part.type === 'text' ? [part.text] : []).join('\n\n');
}

/** Reveals the reply recorded: the app's data parts plus mark_reveal tool parts. */
export function revealsOf(message: WireMessage | undefined): RevealDefinition[] {
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

export function questionsIn(text: string): string[] {
	return (prose(text).match(/[^.!?\n]*\?+/g) ?? []).map((q) => q.trim()).filter((q) => q.replace(/\?+$/, '').trim() !== '');
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
	const last = questions.at(-1);
	const afterLast = last && !item ? prose(text).slice(prose(text).lastIndexOf(last) + last.length).trim() : '';
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
