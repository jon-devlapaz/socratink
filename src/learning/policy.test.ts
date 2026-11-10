import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { steeringPrefix } from '../config/chat-message.ts';
import { questionnaireAnswerPrefix } from '../questionnaire.ts';
import { systemPrompt } from './chat-policy.ts';
import { socraticTutorSkill } from './socratic-tutor.ts';
import { presentQuestionRetryReason } from './present-question.ts';
import { executeLearningTool, learningToolDefinitions } from './tools.ts';

test('the teaching policy is the vendored socratic-tutor skill followed by Socratink bindings', () => {
	// Upstream SKILL.md body at the pinned commit, frontmatter removed.
	assert.equal(createHash('sha256').update(socraticTutorSkill).digest('hex'),
		'ebad4b06102a4449b7acb3be606a0b726890f10fdfdfadc67795ca94c3f33fda');
	assert.ok(systemPrompt.startsWith(socraticTutorSkill));
	for (const binding of ['present_question', 'mark_reveal', 'Skip the intent guard', steeringPrefix, questionnaireAnswerPrefix, 'retention is untested']) {
		assert.ok(systemPrompt.includes(binding), binding);
	}
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
