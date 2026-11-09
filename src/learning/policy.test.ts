import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { systemPrompt } from './chat-policy.ts';
import { presentQuestionRetryReason } from './present-question.ts';
import { executeLearningTool, learningToolDefinitions } from './tools.ts';

test('moving the teaching policy preserves the current prompt byte for byte', () => {
	assert.equal(createHash('sha256').update(systemPrompt).digest('hex'),
		'54d54706908d9d08b117374fa322d82be14e22ab5981d1dc658d9176a320a91b');
});

test('questions use current validation and presentation; reveals retain provenance without ending the turn', () => {
	const question = executeLearningTool('present_question', { prompt: ' Which step? ', choices: [' Recheck ', 'Retry'], reasoning: true });
	assert.equal(question.terminate, true);
	assert.deepEqual(question.data.questionnaire, [{ kind: 'question', submitLabel: 'Submit', items: [{
		name: 'item', prompt: 'Which step?', required: true, multiple: false,
		choices: [{ value: 'recheck', label: 'Recheck' }, { value: 'retry', label: 'Retry' }], input: { label: 'Your reasoning' },
	}] }]);
	assert.throws(() => executeLearningTool('present_question', { prompt: 'Which step?', choices: ['Only one'] }));
	assert.deepEqual(executeLearningTool('mark_reveal', { kind: 'hint', target: ' recovery ' }), {
		output: 'Reveal recorded.', data: { reveal: [{ kind: 'hint', target: 'recovery' }] }, terminate: false,
	});
	assert.throws(() => executeLearningTool('mark_reveal', { kind: 'praise' }));
	assert.deepEqual(learningToolDefinitions.map((tool) => tool.name), ['present_question', 'mark_reveal']);
});

test('the shared correction policy permits only one extra attempt', () => {
	const invalid = { toolCalls: [{ tool: 'present_question', isError: true }], assistantText: '', alreadyRetried: false };
	assert.equal(presentQuestionRetryReason(invalid), 'invalid');
	assert.equal(presentQuestionRetryReason({ ...invalid, alreadyRetried: true }), undefined);
	assert.equal(presentQuestionRetryReason({ toolCalls: [], assistantText: 'Choose:\nA. Recheck\nB. Retry', alreadyRetried: false }), 'unboxed');
});
