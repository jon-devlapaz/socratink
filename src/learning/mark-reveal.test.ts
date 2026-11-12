import assert from 'node:assert/strict';
import test from 'node:test';
import { formatQuestionnaireAnswers, questionnaireFromPresentQuestion } from '../questionnaire.ts';
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
