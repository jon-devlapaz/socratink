import assert from 'node:assert/strict';
import test from 'node:test';
import {
	looksLikeUnboxedChoices,
	presentQuestionRetryBody,
	presentQuestionRetryReason,
	presentQuestionToolName,
} from '../src/agents/present-question.ts';
import {
	questionnaireFromPresentQuestion,
	presentQuestionExample,
} from '../src/questionnaire.ts';

test('maps a flat present_question payload onto the stored questionnaire contract', () => {
	assert.deepEqual(questionnaireFromPresentQuestion(presentQuestionExample), {
		kind: 'question',
		submitLabel: 'Submit',
		items: [
			{
				name: 'item',
				prompt: presentQuestionExample.prompt,
				required: true,
				multiple: false,
				choices: [
					{
						value: 'recheck-the-admitted-request',
						label: 'Recheck the admitted request',
					},
					{
						value: 'send-the-same-message-again',
						label: 'Send the same message again',
					},
				],
				input: { label: 'Your reasoning' },
			},
		],
	});
});

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

test('retries once for a schema error or an unboxed choice list', () => {
	assert.equal(
		presentQuestionRetryReason({
			toolCalls: [{ tool: presentQuestionToolName, isError: true }],
			assistantText: '',
			alreadyRetried: false,
		}),
		'invalid',
	);
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
	assert.match(presentQuestionRetryBody('unboxed'), /present_question/);
	assert.match(presentQuestionRetryBody('invalid'), /failed validation/);
});
