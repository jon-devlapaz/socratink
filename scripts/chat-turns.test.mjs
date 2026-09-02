import assert from 'node:assert/strict';
import test from 'node:test';
import {
	displayLabel,
	latestModelRoute,
	splitCurrentTurns,
	visibleTurnsFromHistory,
} from '../src/ui/chat-turns.ts';

const questionnaire = {
	kind: 'question',
	submitLabel: 'Continue',
	items: [
		{
			name: 'path',
			prompt: 'How should we begin?',
			required: true,
			multiple: false,
			choices: [{ value: 'example', label: 'Worked example' }],
		},
	],
};

test('projects only visible learner and assistant turns from conversation history', () => {
	const turns = visibleTurnsFromHistory({
		settlements: [],
		messages: [
			{
				display: 'hidden',
				role: 'system',
				parts: [{ type: 'text', text: 'runtime detail' }],
			},
			{
				display: 'visible',
				role: 'user',
				parts: [
					{ type: 'text', text: 'First' },
					{ type: 'text', text: 'Second' },
				],
			},
			{
				display: 'visible',
				role: 'assistant',
				parts: [
					{ type: 'text', text: '' },
					{ type: 'data-questionnaire', data: questionnaire },
				],
			},
			{
				display: 'visible',
				role: 'assistant',
				parts: [{ type: 'reasoning', text: 'not learner-facing' }],
			},
		],
	});

	assert.deepEqual(turns, [
		{ role: 'You', text: 'First\n\nSecond' },
		{ role: 'Assistant', text: '', questionnaire },
	]);
});

test('dedupes only an adjacent failed or aborted learner retry with the same text', () => {
	const user = (id, text) => ({
		id,
		submissionId: id,
		display: 'visible',
		role: 'user',
		parts: [{ type: 'text', text }],
	});
	const turns = visibleTurnsFromHistory({
		settlements: [
			{ submissionId: 'aborted', outcome: 'aborted' },
		],
		messages: [
			user('aborted', 'same learner work'),
			user('retry', 'same learner work'),
		],
	});

	assert.deepEqual(turns, [{ role: 'You', text: 'same learner work' }]);
});

test('dedupes a contiguous aborted submission group with a partial assistant before its retry', () => {
	const turns = visibleTurnsFromHistory({
		settlements: [{ submissionId: 'aborted', outcome: 'aborted' }],
		messages: [
			{
				id: 'aborted-user',
				submissionId: 'aborted',
				display: 'visible',
				role: 'user',
				parts: [{ type: 'text', text: 'same learner work' }],
			},
			{
				id: 'aborted-partial',
				submissionId: 'aborted',
				display: 'visible',
				role: 'assistant',
				parts: [{ type: 'text', text: 'partial reply' }],
			},
			{
				id: 'retry-user',
				submissionId: 'retry',
				display: 'visible',
				role: 'user',
				parts: [{ type: 'text', text: 'same learner work' }],
			},
			{
				id: 'retry-assistant',
				submissionId: 'retry',
				display: 'visible',
				role: 'assistant',
				parts: [{ type: 'text', text: 'complete reply' }],
			},
		],
	});

	assert.deepEqual(turns, [
		{ role: 'You', text: 'same learner work' },
		{ role: 'Assistant', text: 'complete reply' },
	]);
});

test('preserves a non-adjacent failed same-text attempt across another exchange', () => {
	const user = (id, text) => ({
		id,
		submissionId: id,
		display: 'visible',
		role: 'user',
		parts: [{ type: 'text', text }],
	});
	const assistant = {
		id: 'assistant',
		submissionId: 'unrelated',
		display: 'visible',
		role: 'assistant',
		parts: [{ type: 'text', text: 'unrelated reply' }],
	};
	const turns = visibleTurnsFromHistory({
		settlements: [{ submissionId: 'failed-old', outcome: 'failed' }],
		messages: [
			user('failed-old', 'same learner work'),
			user('unrelated', 'different learner work'),
			assistant,
			user('later-repeat', 'same learner work'),
		],
	});

	assert.deepEqual(turns, [
		{ role: 'You', text: 'same learner work' },
		{ role: 'You', text: 'different learner work' },
		{ role: 'Assistant', text: 'unrelated reply' },
		{ role: 'You', text: 'same learner work' },
	]);
});

test('splits the latest learner and closing reply into the current beat', () => {
	const turns = [
		{ role: 'Assistant', text: 'Earlier opening reply' },
		{ role: 'You', text: 'Earlier learner turn' },
		{ role: 'Assistant', text: 'Earlier reply' },
		{ role: 'You', text: 'Current learner turn' },
		{ role: 'Assistant', text: 'Current reply' },
	];

	assert.deepEqual(splitCurrentTurns(turns), {
		earlier: turns.slice(0, 3),
		current: turns.slice(3),
	});
	assert.deepEqual(splitCurrentTurns(turns.slice(0, 2)), {
		earlier: [],
		current: turns.slice(0, 2),
	});
});

test('maps the stored assistant role to the Socratink display label', () => {
	assert.equal(displayLabel('Assistant'), 'Socratink');
	assert.equal(displayLabel('You'), 'You');
});

test('projects the routed model from assistant response metadata', () => {
	const turns = visibleTurnsFromHistory({
		settlements: [],
		messages: [
			{
				display: 'visible',
				role: 'user',
				parts: [{ type: 'text', text: 'hello' }],
			},
			{
				display: 'visible',
				role: 'assistant',
				parts: [{ type: 'text', text: 'pong' }],
				metadata: {
					socratink: {
						requestedModel: 'auto',
						routedModel: 'Qwen/Qwen3-VL-235B-A22B-Instruct',
					},
				},
			},
		],
	});

	assert.deepEqual(turns, [
		{ role: 'You', text: 'hello' },
		{
			role: 'Assistant',
			text: 'pong',
			modelRoute: 'Qwen/Qwen3-VL-235B-A22B-Instruct',
		},
	]);
	assert.equal(latestModelRoute(turns), 'Qwen/Qwen3-VL-235B-A22B-Instruct');
});
