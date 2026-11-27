// Scripted learner conversations. All learner text is synthetic. `next` reads the turns
// so far and returns the next learner message, or null to stop.
//
// To add one: a live tutor-behaviour bug gets a scenario here that fails on the live
// model before the fix. Name the rule it tests in src/learning/behaviour-rules.ts.
import type { WireMessage } from '../../src/config/chat-wire.ts';
import { formatQuestionnaireAnswers, type CardHelpAction, type QuestionnaireDefinition, type QuestionnaireHelp } from '../../src/questionnaire.ts';
import { cardOf, expectHintLeavesReasoning, expectNoChoicePosition, expectMarkedHelp, expectRequestedReveal, expectRevealedAnswerMarked, expectTryOnceMore, skipped, type CheckResult } from './checks.ts';

export type Turn = { learner: string; outcome: string; error?: string; reply: WireMessage | undefined; step?: string; autoConsent?: boolean; tryOnceMore?: boolean };
type NextMessage = { text: string; cardHelp?: CardHelpAction; step?: string; autoConsent?: boolean; tryOnceMore?: boolean };
export type Scenario = {
	name: string;
	issue?: number;
	summary: string;
	maxTurns?: number;
	next: (turns: readonly Turn[]) => NextMessage | null;
	expect: (turns: readonly Turn[]) => CheckResult[];
};
/** `avoid` skips choices that match it, so the learner can pick a wrong one. */
type Step = { say: string; help?: QuestionnaireHelp; plain?: true; avoid?: RegExp };

function consentAnswer(card: QuestionnaireDefinition, value: 'see-it' | 'try-once-more'): string {
	return formatQuestionnaireAnswers(card, [{ name: card.items[0]?.name ?? 'item', values: [value] }]);
}

/** Answers a pending tutor card the way the UI would: the first choice, with the step as
 * reasoning, or the card's help. With no card, or a plain step, sends the text. */
function learnerMessage(step: Step, card: QuestionnaireDefinition | undefined, sourceId?: string): NextMessage {
	const item = card?.items[0];
	if (!card || !item || step.plain) return { text: step.say };
	if (card.kind === 'reveal-consent') return { text: consentAnswer(card, 'see-it') };
	if (step.help) {
		if (!sourceId) throw new Error('The question card has no submission ID.');
		return { cardHelp: { kind: step.help, sourceId }, text: formatQuestionnaireAnswers(card, [{ name: item.name, values: [], help: step.help }]) };
	}
	const choice = (item.choices.find((c) => !step.avoid?.test(c.label)) ?? item.choices[0])?.value;
	return { text: formatQuestionnaireAnswers(card, [{ name: item.name, values: choice ? [choice] : [], ...(item.input ? { freeform: step.say } : {}) }]) };
}

/** A fixed list of steps. An unplanned consent card gets "See it" without using a step. */
function scripted(steps: readonly Step[]): Scenario['next'] {
	return (turns) => {
		const previous = turns.at(-1)?.reply;
		const card = cardOf(previous);
		if (card?.kind === 'reveal-consent') return { text: consentAnswer(card, 'see-it'), autoConsent: true };
		const step = steps[turns.filter((turn) => !turn.autoConsent).length];
		return step ? { ...learnerMessage(step, card, previous?.submissionId), step: step.say } : null;
	};
}

const stepReply = (turns: readonly Turn[], say: string) => turns.findLast((turn) => turn.step === say)?.reply;

// Statements that answer "Which one was right?" on the ice card: name the right choice
// or its position, or state the idea it holds.
const iceGiveaways = [
	/\b(?:correct|right|best) (?:one|choice|answer|option) (?:is|was)\b/i,
	/\b(?:option|choice|answer) (?:[A-H]|[1-8]) (?:is|was) (?:the )?(?:right|correct)\b/i,
	/^\s*(?:it (?:is|was) |that'?s )?the (?:top|bottom|last|first|second|third|fourth) (?:one|choice|option)\.?\s*$/i,
	/\bless dense\b/i,
];

export const scenarios: readonly Scenario[] = [
	{
		name: 'no-choice-position',
		summary: 'After a card answer, match choice letters and positions to the displayed order.',
		next: scripted([
			{ say: 'Give me a question card about why ice floats on water, with choices and reasoning.' },
			// The learner picks a wrong choice: confirming a right pick is feedback, not a reveal.
				{ say: 'I picked this one but I am not sure.', avoid: /less dense|lower density|lattice|crystal|expand|more (?:space|volume)/i },
			{ say: 'Which one was right? Was it the top one?', plain: true },
		]),
		expect: (turns) => {
			const card = cardOf(turns[0]?.reply);
			const reply = stepReply(turns, 'Which one was right? Was it the top one?');
			// A consent card in reply is the reveal policy at work, not a position claim.
			if (cardOf(reply)?.kind === 'reveal-consent') return [skipped('no-choice-position', 'the tutor offered a consent card instead of naming a choice')];
			if (card?.kind !== 'question' || !reply) return [skipped('no-choice-position', 'script did not answer a question card and reach the position request')];
			return [expectNoChoicePosition(reply, card, 'Ice is less dense than liquid water'), { ...expectRevealedAnswerMarked(reply, iceGiveaways), turn: turns.findLastIndex((turn) => turn.reply === reply) }];
		},
	},
	{
		name: 'first-turn-diagnostic',
		issue: 163,
		summary: 'A first message on a broad topic starts the diagnostic with exactly one question, not a numbered batch.',
		next: scripted([{ say: 'Help me understand how rainbows form.' }]),
		expect: () => [],
	},
	{
		name: 'just-tell-me-first-message',
		issue: 133,
		summary: 'A first message that asks a question and says "just tell me the answer" gets the answer, with no consent card.',
		next: scripted([{ say: 'Why do the seasons change on Earth? just tell me the answer' }]),
		expect: (turns) => [expectRequestedReveal(turns[0]?.reply)],
	},
	{
		name: 'just-tell-me-later',
		issue: 133,
		summary: '"just tell me the answer" typed after the diagnostic starts gets the answer, with no consent card.',
		next: scripted([
			{ say: 'I want to understand how vaccines train the immune system.' },
			{ say: 'I think they put a weak germ in you, but I am not sure why that helps.' },
			{ say: 'just tell me the answer', plain: true },
		]),
		expect: (turns) => {
			const reply = stepReply(turns, 'just tell me the answer');
			return [reply ? expectRequestedReveal(reply) : skipped('just-tell-me', 'script did not reach the request')];
		},
	},
	{
		name: 'i-dont-know-is-marked',
		summary: '"I don\'t know" gets a short explanation marked with mark_reveal.',
		next: scripted([{ say: 'Teach me why ice floats on water.' }, { say: "I don't know.", help: 'unknown' }]),
		expect: (turns) => {
			const reply = stepReply(turns, "I don't know.");
			return [reply ? expectMarkedHelp(reply, 'dont-know-marked') : skipped('dont-know-marked', 'script ended early')];
		},
	},
	{
		name: 'hint-is-marked',
		summary: 'A hint request gets a hint marked with mark_reveal, and no consent card.',
		next: scripted([{ say: 'Help me understand how binary search finds an item in a sorted list.' }, { say: 'Can I have a hint?', help: 'hint' }]),
		expect: (turns) => {
			const reply = stepReply(turns, 'Can I have a hint?');
			return [reply ? expectMarkedHelp(reply, 'hint-marked') : skipped('hint-marked', 'script ended early')];
		},
	},
	{
		name: 'hint-leaves-reasoning',
		summary: 'Hint on a payment idempotency card gives a clue that leaves the choice and its reason for the learner (PR 188 live failure).',
		next: scripted([
			{ say: 'Quiz me with one question card. A customer pays $40 and the connection drops before the app gets a response. Ask which request should reuse the first request\'s idempotency key, with choices and a reasoning field.' },
			{ say: 'Can I have a hint?', help: 'hint' },
		]),
		expect: (turns) => {
			const card = cardOf(turns[0]?.reply);
			const reply = stepReply(turns, 'Can I have a hint?');
			return [card?.kind === 'question' && reply ? expectHintLeavesReasoning(reply)
				: skipped('hint-leaves-reasoning', 'the tutor did not present a question card to ask Hint on')];
		},
	},
	{
		name: 'try-once-more-no-notes',
		issue: 136,
		summary: 'After wrong answers lead to a consent card, "Try once more" gets one question and no notes about the answer.',
		maxTurns: 8,
		next: (turns) => {
			if (turns.at(-1)?.tryOnceMore) return null;
			const previous = turns.at(-1)?.reply;
			const card = cardOf(previous);
			if (card?.kind === 'reveal-consent') return { text: consentAnswer(card, 'try-once-more'), tryOnceMore: true };
			const say = ['Help me understand why the sky is blue.', 'Because it reflects the ocean.',
				'Because air itself is blue, like paint.', 'I still think it is the ocean reflecting up.',
				'Maybe the Sun is blue?', 'I give up, I have no idea.'][turns.length];
			return say ? learnerMessage({ say }, card) : null;
		},
		expect: (turns) => {
			const turn = turns.find((t) => t.tryOnceMore);
			return [turn ? expectTryOnceMore(turn.reply) : skipped('try-once-more-withholds', 'the tutor never offered a consent card in this run')];
		},
	},
];
