import assert from 'node:assert/strict';
import test from 'node:test';
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

test('card help reads back as assistance on the card it asked about', () => {
	assert.equal(asked('hint'), 'Questionnaire answers:\n- Which half do you search next?: Asked for a hint.');
	assert.deepEqual(cardHelpReveal(asked('hint')), { kind: 'hint', target: 'Which half do you search next?' });
	assert.deepEqual(cardHelpReveal(asked('unknown')), { kind: 'partial', target: 'Which half do you search next?' });
	assert.equal(cardHelpReveal(answered), undefined);
	assert.equal(cardHelpReveal('Asked for a hint.'), undefined, 'only a card answer counts as card help');
});

test('card help on a prompt that spans lines still reads back as help (#65)', () => {
	const multiline = questionnaireFromPresentQuestion({ prompt: 'A list has 16 items.\nWhich half do you search next?', choices: ['Left', 'Right'] });
	const help = formatQuestionnaireAnswers(multiline, [{ name: 'item', values: [], help: 'hint' }]);
	assert.deepEqual(cardHelpReveal(help), { kind: 'hint', target: 'A list has 16 items.\nWhich half do you search next?' });
});

test('a card cannot offer a choice that reads the same as its help buttons (#65)', () => {
	for (const label of ['Asked for a hint.', "I don't know.", ' i don\'t know. ']) {
		assert.equal(v.safeParse(PresentQuestionInputSchema, { prompt: 'Which is it?', choices: ['Left', label] }).success, false, label);
	}
	assert.equal(v.safeParse(PresentQuestionInputSchema, { prompt: 'Which is it?', choices: ['Left', "I don't know yet"] }).success, true);
});

test('an unmarked turn is corrected once when help was asked for or content looks supplied', () => {
	assert.equal(reason(asked('hint')), 'requested');
	assert.equal(reason(asked('unknown')), 'requested');
	for (const plea of ['Just tell me', 'can I get a hint?', "I don't know where to start", 'idk', "I'm stuck"]) {
		assert.equal(reason(plea), 'unmarked', plea);
	}
	assert.equal(reason('Binary search halves the range.', "Here's a hint: compare with the middle."), 'unmarked');
	assert.equal(reason('Binary search halves the range.', 'The answer is the left half.'), 'unmarked');
	assert.equal(reason(answered), undefined);
	assert.equal(reason('Binary search halves the range.'), undefined);
	assert.equal(reason(asked('hint'), 'Hint text', { revealed: true }), undefined, 'a marked turn needs nothing');
	assert.equal(reason(asked('hint'), 'Hint text', { alreadyRetried: true }), undefined, 'one correction per input');
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
