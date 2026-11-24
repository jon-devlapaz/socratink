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

function clubReply(message: WireMessage): string {
	const item = cardOf(message)?.items[0];
	return [textOf(message), item?.prompt, ...(item?.choices.map((choice) => choice.label) ?? [])].filter(Boolean).join('\n');
}

/** This fixture has two dates the learner already used (100 and 110), and a condition they may have missed. */
export function expectClubOpening(message: WireMessage | undefined, reading: 'incomplete' | 'correct'): CheckResult {
	const check = 'tests-learner-reading';
	if (!message) return skipped(check, 'no opening reply');
	if (cardOf(message) || revealsOf(message).length) return result(check, false, 'gave choices or marked help before the learner could test the reading unaided');
	const visible = textOf(message).replace(/[*_`]/g, '');
	const text = prose(textOf(message));
	const questions = questionsIn(text);
	if (questions.length > 1) return result(check, false, 'expected one question testing the reading');
	const clue = /\b(?:(?:after|until) (?:day 9[01]|(?:90|ninety) days)|(?:must|have to) wait|waiting period|too early|not (?:yet )?valid)\b/i;
	if (reading === 'incomplete' && clue.test(visible)) {
		return result(check, false, 'the opening supplies a clue about when a request counts');
	}
	if (reading === 'correct' && /^\s*(?:not quite\b|(?:that is|that's|your reading is) (?:wrong|incorrect)\b)/i.test(visible)) {
		return result(check, false, 'rejects the reading the passage supports');
	}
	const question = questions[0] ?? (/\b(?:walk me through|describe|predict)\b/i.test(text) ? text : '');
	if (/\b(?:what do you (?:already )?know|where (?:should|would) (?:we|you) (?:like to )?start|what would you like to (?:learn|understand))\b/i.test(question)) {
		return result(check, false, 'asked for a starting point after the learner already gave one');
	}
	const setup = text.split(/[.!?\n]/).filter((s) => /\b(?:suppose|imagine|consider|submits?|requests?)\b/i.test(s));
	const probe = [...setup, question].join(' ');
	const days = [...probe.matchAll(/\bon day (\d+)\b|\bon the (\d+)(?:st|nd|rd|th) day\b|\bday-(\d+) request\b/gi)].map((m) => Number(m[1] ?? m[2] ?? m[3]));
	const newCase = days.some((day) => reading === 'incomplete' ? day <= 90 : day !== 100 && day !== 110);
	const challengesClaim = reading === 'incomplete' && /\b(?:whenever|any ?time)\b/i.test(question) && /\b(?:words?|part|supports?)\b/i.test(question);
	const appliesRule = /\b(?:requests?|cancel\w*|access|notice|leave)\b/i.test(probe);
	if (question && ((newCase && appliesRule) || challengesClaim)) return result(check, true);
	if (days.length && appliesRule && /\baccess end(?:s)?\b/i.test(question)) {
		return result(check, false, reading === 'incomplete' ? 'both readings predict the same end date for this request' : 'repeats the date the learner already explained');
	}
	return skipped(check, 'read the opening to see whether it tests the claim without giving the answer');
}

/** In this script the learner mentions notice, then asks for help without ever solving the request condition. */
export function expectClubRecap(hint: WireMessage | undefined, recap: WireMessage | undefined): CheckResult {
	const check = 'credits-learner-work';
	if (!hint || !recap) return skipped(check, 'the script did not reach the hint and recap');
	const notice = /\b(?:10|ten)[ -]days?\b|\bnotice (?:period|window)\b/i;
	const eligibility = /\b(?:90|91|ninety|earliest request|eligibility|waiting period|(?:two|both) (?:obligations|conditions))\b/i;
	const clauses = textOf(recap).replaceAll('**', '').split(/[.!?:;\n]+|,?\s+(?:and|but|while)\s+(?=(?:I|you)\b)/i).filter((s) => s.trim());
	const learnerClaims = clauses.filter((clause) => /^\s*(?:-\s*)?you (?:spotted|noticed|identified|worked out)\b/i.test(clause))
		.map((claim) => claim.replace(/\bwithout noticing\b.*/i, ''))
		.filter((claim) => !/\b(?:never|not|didn't|haven't|missed)\b/i.test(claim));
	if (learnerClaims.some((claim) => eligibility.test(claim))) {
		return result(check, false, 'credits the learner with the request condition they never explained');
	}
	const tutorClaims = clauses.filter((clause) => /^\s*(?:-\s*)?I (?:pointed (?:out|to)|supplied|explained)\b/i.test(clause));
	if (clauses.length === 2 && learnerClaims.some((claim) => notice.test(claim)) && tutorClaims.some((claim) => eligibility.test(claim))
		&& eligibility.test(clubReply(hint))) return result(check, true);
	return skipped(check, 'read the recap against the turns: could not match both contributions to this fixture');
}

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
	const afterLast = questions.length && !item ? prose(text).slice(prose(text).lastIndexOf('?') + 1).trim() : '';
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
