import assert from 'node:assert/strict';
import test from 'node:test';
import {
	displayLabel,
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

test('splits the latest learner and closing reply into the current beat', () => {
	const turns = [
		{ role: 'Socratink', text: 'Opening' },
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
