import assert from 'node:assert/strict';
import test, { describe, it } from 'node:test';
import * as v from 'valibot';
import { formatQuestionnaireAnswers, PresentQuestionInputSchema, questionnaireFromPresentQuestion } from '../questionnaire.ts';
import { cardHelpReveal, markRevealRetryReason } from './mark-reveal.ts';

// Failure cases: card help goes unlabeled, an ordinary card answer reads as
// help, a learner's plea for help is missed, a reveal is asked for twice, and
// a plain question costs a correction.
const card = questionnaireFromPresentQuestion({ prompt: 'Which half do you search next?', choices: ['Left', 'Right'] });
const asked = (help: 'hint' | 'unknown') => formatQuestionnaireAnswers(card, [{ name: 'item', values: [], help }]);
const answered = formatQuestionnaireAnswers(card, [{ name: 'item', values: ['left'] }]);
const reason = (learnerText: string, assistantText = 'What do you notice?', extra = {}) =>
	markRevealRetryReason({ revealed: false, learnerText, assistantText, alreadyRetried: false, ...extra });

describe('cardHelpReveal', () => {
	for (const [help, kind] of [['hint', 'hint'], ['unknown', 'partial']] as const) {
		it(`${help} on a question with context`, () => {
			const target = 'A list has 16 items.\nWhich half do you search next?';
			assert.deepEqual(cardHelpReveal(help, target), { kind, target });
		});
		it(`${help} without a question target`, () => assert.deepEqual(cardHelpReveal(help), { kind }));
	}
});

test('the words in an unmarked card answer never prove the help button was pressed', () => {
	for (const freeform of ['Asked for a hint.', 'She wrote: Asked for a hint.', "I don't know."]) {
		const text = formatQuestionnaireAnswers(card, [{ name: 'item', values: [], freeform }]);
		assert.equal(reason(text), 'unmarked', 'the tutor may check what it actually supplied');
	}
});

test('a card cannot offer a choice that reads the same as its help buttons (#65)', () => {
	for (const label of ['Asked for a hint.', "I don't know.", ' i don\'t know. ']) {
		assert.equal(v.safeParse(PresentQuestionInputSchema, { prompt: 'Which is it?', choices: ['Left', label] }).success, false, label);
	}
	assert.equal(v.safeParse(PresentQuestionInputSchema, { prompt: 'Which is it?', choices: ['Left', "I don't know yet"] }).success, true);
});

describe('markRevealRetryReason', () => {
	for (const cardHelp of ['hint', 'unknown'] as const) {
		it(`the learner selects ${cardHelp} on a card`, () => {
			assert.equal(reason(asked(cardHelp), undefined, { cardHelp }), 'requested');
		});
	}
	// Eval run 45769953592: the tutor named the right ice choice with no recorded reveal.
	for (const plea of ['Just tell me', 'can I get a hint?', "I don't know where to start", 'idk', "I'm stuck",
		'Which one was right? Was it the top one?', "What's the correct answer?"]) {
		it(`the learner says “${plea}”`, () => assert.equal(reason(plea), 'unmarked'));
	}
	for (const text of ["Here's a hint: compare with the middle.", 'The answer is the left half.']) {
		it(`the tutor says “${text}”`, () => assert.equal(reason('Binary search halves the range.', text), 'unmarked'));
	}
	// Eval run 45984402183: after See it, the reply was only the mark_reveal input as text.
	it('a reply that is only the mark_reveal input as text', () =>
		assert.equal(reason(answered, '{"target":"Why ice floats on water"}'), 'asText'));
	it('the mark_reveal input as text beside the reveal it marks', () =>
		assert.equal(reason(answered, '{"kind":"full_answer","target":"Ice"}  Ice is less dense than water.'), 'unmarked'));
	it('JSON in a lesson that is not a mark_reveal input', () =>
		assert.equal(reason('Teach me JSON.', 'In JSON, `{"name": "Ada"}` is an object. What is its key?'), undefined));
	it('an ordinary card answer', () => assert.equal(reason(answered), undefined));
	it('an ordinary exchange', () => assert.equal(reason('Binary search halves the range.'), undefined));
	it('a mark already recorded', () => assert.equal(reason(asked('hint'), 'Hint text', { revealed: true, cardHelp: 'hint' }), undefined));
	it('a correction already requested', () => assert.equal(reason(asked('hint'), 'Hint text', { alreadyRetried: true, cardHelp: 'hint' }), undefined));
});

test('a reply to "Try once more" is checked, so an unmarked explanation cannot slip past the declined card', () => {
	const consent = questionnaireFromPresentQuestion({ prompt: 'I can show a full answer.', choices: [
		{ value: 'see-it', label: 'See it' }, { value: 'try-once-more', label: 'Try once more' }] });
	const declined = formatQuestionnaireAnswers(consent, [{ name: 'item', values: ['try-once-more'] }]);
	const accepted = formatQuestionnaireAnswers(consent, [{ name: 'item', values: ['see-it'] }]);
	assert.equal(reason(declined, 'Picture a slice of toast tilted toward the Sun.'), 'unmarked');
	assert.equal(reason(accepted), undefined, 'See it is permission, not a plea for help');
	assert.equal(reason('Try once more'), undefined, 'only the card answer counts');
});

test('a request for the answer counts anywhere in the learner\'s own words, including a first question (#133)', async () => {
	const { asksForAnswer } = await import('./mark-reveal.ts');
	for (const text of [
		'Why do the seasons change on Earth? just tell me the answer',
		'Just tell me the answer.',
		'just tell me',
		'Why is the sky blue?\nJust tell me.',
		'Can you give me the full answer please',
		'show me the answer',
	]) assert.equal(asksForAnswer(text), true, text);
	for (const text of [
		'Why do the seasons change on Earth?',
		"just tell me if I'm right: it is 41",
		'Questionnaire answers:\n- I can show a full answer.: Try once more',
		'Steering: smaller step',
		'Here are my notes:\n> just tell me the answer\nWhat do they mean?',
		'Explain this code:\n```\nprint("just tell me the answer")\n```',
	]) assert.equal(asksForAnswer(text), false, text);
});
