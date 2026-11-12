import assert from 'node:assert/strict';
import test from 'node:test';
import {
	looksLikeUnboxedChoices,
	presentQuestionRetryReason,
	presentQuestionToolName,
} from '../src/learning/present-question.ts';
import { questionnaireFromPresentQuestion } from '../src/questionnaire.ts';

test('slugs duplicate labels and keeps an explicit value when it is unique', () => {
	const questionnaire = questionnaireFromPresentQuestion({
		prompt: 'Which option holds?',
		choices: [
			{ label: 'Retry', value: 'retry' },
			'Retry',
			{ label: 'Stop' },
		],
	});
	assert.deepEqual(
		questionnaire.items[0]?.choices.map((choice) => choice.value),
		['retry', 'retry-2', 'stop'],
	);
});

test('treats lettered or cued lists as unboxed choices, not explanatory traces', () => {
	assert.equal(
		looksLikeUnboxedChoices(
			'Which recovery action should the client take first?\n\n1. Recheck the admitted request\n2. Send the same message again',
		),
		true,
	);
	assert.equal(
		looksLikeUnboxedChoices('Pick one:\nA. Recheck\nB. Resend'),
		true,
	);
	assert.equal(
		looksLikeUnboxedChoices(
			'The failure path is:\n1. Admission is unknown.\n2. The client resends.\n3. Duplicate work starts.',
		),
		false,
	);
	assert.equal(looksLikeUnboxedChoices('What happens if the stream drops?'), false);
	assert.equal(
		looksLikeUnboxedChoices(
			'Which recovery action should the client take first?\n\n1. Recheck the admitted request by its stable submission identifier\n2. Send the same message again\n3. Start a new conversation\n4. Assume the request failed',
		),
		true,
	);
});

test('ignores skill maps, subskill lists before an open question, and command lists', () => {
	assert.equal(
		looksLikeUnboxedChoices(
			'Here is the map:\n\n```text\nTopic: SQL joins\n- inner joins  [##..]  1/5\n- outer joins  [#...]  0/5\n```\n\nWhich join have you used most?',
		),
		false,
	);
	assert.equal(
		looksLikeUnboxedChoices(
			'I split joins into:\n- inner joins\n- outer joins\n- self joins\n\nWhich rows does an inner join drop, and why?',
		),
		false,
	);
	assert.equal(
		looksLikeUnboxedChoices(
			'Which commands work anytime?\n\n```text\n- show progress\n- harder\n```\n\nWhat would you predict this query returns?',
		),
		false,
	);
	assert.equal(
		looksLikeUnboxedChoices('Which should we start with?\n\n- inner joins\n- outer joins'),
		true,
	);
});

test('retries once for an unboxed choice list', () => {
	assert.equal(
		presentQuestionRetryReason({
			toolCalls: [],
			assistantText:
				'Which recovery action should the client take first?\n\n1. Recheck\n2. Resend',
			alreadyRetried: false,
		}),
		'unboxed',
	);
	assert.equal(
		presentQuestionRetryReason({
			toolCalls: [{ tool: presentQuestionToolName, isError: false }],
			assistantText:
				'Which recovery action should the client take first?\n\n1. Recheck\n2. Resend',
			alreadyRetried: false,
		}),
		undefined,
	);
	assert.equal(
		presentQuestionRetryReason({
			toolCalls: [],
			assistantText:
				'Which recovery action should the client take first?\n\n1. Recheck\n2. Resend',
			alreadyRetried: true,
		}),
		undefined,
	);
});
