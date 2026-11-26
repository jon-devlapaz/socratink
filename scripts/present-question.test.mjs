import assert from 'node:assert/strict';
import test, { describe, it } from 'node:test';
import { looksLikeUnboxedChoices, presentQuestionRetryReason, presentQuestionToolName } from '../src/learning/present-question.ts';
import { questionnaireFromPresentQuestion } from '../src/questionnaire.ts';

describe('questionnaireFromPresentQuestion', () => {
	it('keeps an explicit choice value when later labels repeat', () => {
		const question = questionnaireFromPresentQuestion({
			prompt: 'Which option holds?',
			choices: [{ label: 'Try again', value: 'retry' }, 'Retry', 'Retry', { label: 'Stop' }],
		});
		assert.deepEqual(question, {
			kind: 'question',
			submitLabel: 'Submit',
			items: [{
				name: 'item', prompt: 'Which option holds?', required: true, multiple: false,
				choices: [
					{ label: 'Try again', value: 'retry' },
					{ label: 'Retry', value: 'retry-2' },
					{ label: 'Retry', value: 'retry-3' },
					{ label: 'Stop', value: 'stop' },
				],
			}],
		});
	});
});

describe('looksLikeUnboxedChoices', () => {
	const sevenChoices = 'Choose a letter:\n- α\n- β\n- γ\n- δ\n- ε\n- ζ\n- η';
	const eightChoices = `${sevenChoices}\n- θ`;
	for (const [name, text, expected] of [
		['empty reply', '', false],
		['open question', 'What happens if the stream drops?', false],
		['one choice after a prompt', 'Choose one:\n- Recheck', false],
		['two numbered choices after a question', 'Which action comes first?\n\n1. Recheck\n2. Resend', true],
		['two lettered choices after a prompt', 'Pick one:\nA. Recheck\nB. Resend', true],
		['two lettered choices without a prompt', 'A) Recheck\nB) Resend', true],
		['two bullets after a question', 'Which join should we start with?\n\n- inner\n- outer', true],
		['blank line between choices', 'Choose one:\n- Recheck\n\n- Resend', true],
		['four numbered choices with a long first option', 'Which action comes first?\n1. Recheck the admitted request by its stable submission identifier\n2. Resend\n3. Start over\n4. Assume failure', true],
		['seven choices', sevenChoices, true],
		['eight choices', eightChoices, true],
		['nine choices', `${eightChoices}\n- ι`, false],
		['numbered explanation', 'The failure path is:\n1. Admission is unknown.\n2. The client resends.\n3. Duplicate work starts.', false],
		['subskills before an open question', 'I split joins into:\n- inner joins\n- outer joins\n- self joins\n\nWhich rows does an inner join drop, and why?', false],
		['fenced skill map before a question', 'Here is the map:\n\n```text\nTopic: SQL joins\n- inner joins  [##..]  1/5\n- outer joins  [#...]  0/5\n```\n\nWhich join have you used most?', false],
		['fenced commands before a question', 'Which commands work anytime?\n\n```text\n- show progress\n- harder\n```\n\nWhat would you predict?', false],
		['lettered choices inside a closing code block', 'Pick one:\n```text\nA. Recheck\nB. Resend\n```', false],
	]) {
		it(name, () => assert.equal(looksLikeUnboxedChoices(text), expected));
	}
});

describe('presentQuestionRetryReason', () => {
	const choices = 'Which action comes first?\n1. Recheck\n2. Resend';
	const failedCard = { tool: 'present_question', isError: true };
	const shownCard = { tool: 'present_question', isError: false };
	for (const [name, toolCalls, assistantText, alreadyRetried, expected] of [
		['choices without a card', [], choices, false, 'unboxed'],
		['choices after a failed card', [failedCard], choices, false, 'unboxed'],
		['choices after another tool succeeded', [{ tool: 'mark_reveal', isError: false }], choices, false, 'unboxed'],
		['choices with a card', [shownCard], choices, false, undefined],
		['failed card followed by a successful card', [failedCard, shownCard], choices, false, undefined],
		['choices still unboxed after a retry', [], choices, true, undefined],
		['open question without a card', [], 'How would you check?', false, undefined],
	]) {
		it(name, () => assert.equal(presentQuestionRetryReason({ toolCalls, assistantText, alreadyRetried }), expected));
	}
});

test('retries once when the card is written as JSON text instead of a call (#164)', () => {
	const assistantText = 'Look at the middle.\n\n{"prompt":"What happens next?","choices":["Left half","Full list"],"reasoning":true}';
	assert.equal(presentQuestionRetryReason({ toolCalls: [], assistantText, alreadyRetried: false }), 'asText');
	assert.equal(presentQuestionRetryReason({ toolCalls: [{ tool: presentQuestionToolName, isError: false }], assistantText, alreadyRetried: false }), undefined);
	assert.equal(presentQuestionRetryReason({ toolCalls: [], assistantText, alreadyRetried: true }), undefined);
	assert.equal(presentQuestionRetryReason({ toolCalls: [], assistantText: 'In JSON, `{"a": 1}` is an object. What is a key?', alreadyRetried: false }), undefined);
});
