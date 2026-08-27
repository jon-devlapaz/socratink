import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { parseQuestionnaireDefinition } from '../src/questionnaire.ts';
import {
	formatQuestionnaireAnswers,
	questionnaireFromParts,
	questionnaireFromReplyData,
	questionnaireUserMessage,
} from '../src/ui/questionnaire.ts';

const validDefinition = {
	kind: 'question',
	submitLabel: 'Continue',
	items: [
		{
			name: 'path',
			prompt: 'How should we begin?',
			required: true,
			multiple: false,
			choices: [
				{ value: 'trace', label: 'Example trace', shortcut: '1' },
				{ value: 'puzzle', label: 'Puzzle' },
			],
		},
		{
			name: 'why',
			prompt: 'Why?',
			required: false,
			multiple: false,
			choices: [],
			input: { label: 'Your reason', placeholder: 'Type a reason…' },
		},
	],
};

test('reads a validated questionnaire from live reply data and restored history parts', () => {
	assert.equal(questionnaireFromReplyData({ questionnaire: [validDefinition] })?.items[0]?.name, 'path');
	assert.equal(
		questionnaireFromParts([
			{ type: 'text' },
			{ type: 'data-questionnaire', data: validDefinition },
		])?.items[1]?.name,
		'why',
	);
});

test('fails closed on malformed or oversized structured questionnaire data', () => {
	assert.equal(questionnaireFromReplyData({ questionnaire: [{ items: [] }] }), undefined);
	assert.equal(
		parseQuestionnaireDefinition({
			items: [{ name: 'answer', prompt: 'Question?', choices: [{ value: 'a', label: 'A' }] }],
		}),
		undefined,
	);
	assert.equal(parseQuestionnaireDefinition({ ...validDefinition, extra: true }), undefined);
	assert.equal(
		parseQuestionnaireDefinition({
			...validDefinition,
			items: [{ ...validDefinition.items[0], description: 'x'.repeat(401) }],
		}),
		undefined,
	);
	assert.equal(
		parseQuestionnaireDefinition({
			kind: 'quiz',
			submitLabel: 'Answer',
			items: Array.from({ length: 6 }, (_, index) => ({
				name: `answer-${index}`,
				prompt: 'Question?',
				choices: [{ value: 'a', label: 'A' }],
			})),
		}),
		undefined,
	);
});

test('formats selected, freeform, and skipped answers as explicit learner text', () => {
	const questionnaire = parseQuestionnaireDefinition(validDefinition);
	assert.ok(questionnaire);
	assert.equal(
		formatQuestionnaireAnswers(questionnaire, [
			{ name: 'path', values: ['trace'] },
			{ name: 'why', values: [], freeform: 'I want a concrete example.' },
		]),
		'Questionnaire answers:\n- How should we begin?: Example trace\n- Why?: I want a concrete example.',
	);
	assert.match(
		formatQuestionnaireAnswers(questionnaire, [
			{ name: 'path', values: ['puzzle'] },
			{ name: 'why', values: [], skipped: true },
		]),
		/- Why\?: Skipped\.$/,
	);
});

test('preserves a selected choice and its freeform explanation in the same answer', () => {
	const questionnaire = parseQuestionnaireDefinition({
		kind: 'quiz',
		submitLabel: 'Submit decision',
		items: [
			{
				name: 'next_step',
				prompt: 'Should the agent continue, stop, or pause now?',
				required: true,
				multiple: false,
				choices: [{ value: 'pause', label: 'Pause and ask the user' }],
				input: { label: 'Observable reason' },
			},
		],
	});
	assert.ok(questionnaire);
	assert.equal(
		formatQuestionnaireAnswers(questionnaire, [
			{
				name: 'next_step',
				values: ['pause'],
				freeform: 'The known file path returned File not found.',
			},
		]),
		'Questionnaire answers:\n- Should the agent continue, stop, or pause now?: Pause and ask the user, The known file path returned File not found.',
	);
});

test('opening submit is the selected path; assistant submit is formatted answers', () => {
	const questionnaire = parseQuestionnaireDefinition(validDefinition);
	assert.ok(questionnaire);
	const answers = [
		{ name: 'path', values: ['I want to explore a worked example of one synapse.'] },
		{ name: 'why', values: [], skipped: true },
	];
	assert.equal(
		questionnaireUserMessage('opening', questionnaire, answers),
		'I want to explore a worked example of one synapse.',
	);
	assert.equal(
		questionnaireUserMessage('assistant', questionnaire, answers),
		formatQuestionnaireAnswers(questionnaire, answers),
	);
	assert.equal(questionnaireUserMessage('opening', questionnaire, []), undefined);
});

test('the card mounts questionnaires from turn data, not a post-paint inject', async () => {
	const surfaceSource = await readFile(new URL('../src/ui/chat-surface.ts', import.meta.url), 'utf8');
	const widgetSource = await readFile(new URL('../src/ui/questionnaire.ts', import.meta.url), 'utf8');
	assert.doesNotMatch(surfaceSource, /addStartingChoices/);
	assert.match(surfaceSource, /startingPathQuestionnaire/);
	assert.doesNotMatch(widgetSource, /onSubmit\(formatQuestionnaireAnswers/);
});

test('the agent mounts the Flue-native questionnaire writer and presentation tool', async () => {
	const promptSource = await readFile(new URL('../src/agents/chat.ts', import.meta.url), 'utf8');
	assert.match(promptSource, /useDataWriter\('questionnaire'/);
	assert.match(promptSource, /name: 'present_question'/);
	assert.match(promptSource, /call present_question exactly once/);
	assert.doesNotMatch(promptSource, /<socratink-questionnaire>/);
});

test('the Chat fixture is a synaptic target, not the agent-trace protocol', async () => {
	const promptSource = await readFile(new URL('../src/agents/chat.ts', import.meta.url), 'utf8');
	const configSource = await readFile(new URL('../src/config/r1-learning.ts', import.meta.url), 'utf8');
	assert.match(configSource, /presynaptic side/);
	assert.match(promptSource, /presynaptic/);
	assert.match(promptSource, /glutamate/);
	assert.match(promptSource, /GABA/);
	assert.doesNotMatch(promptSource, /Q3 sales report/);
	assert.doesNotMatch(promptSource, /example agent trace protocol/);
	assert.doesNotMatch(promptSource, /@flue\/runtime is 2\.0\.3/);
});
