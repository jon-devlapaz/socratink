import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { parseQuestionnaireDefinition } from '../src/questionnaire.ts';
import {
	formatQuestionnaireAnswers,
	questionnaireFromParts,
	questionnaireFromReplyData,
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

test('the agent mounts the Flue-native questionnaire writer and presentation tool', async () => {
	const promptSource = await readFile(new URL('../src/agents/chat.ts', import.meta.url), 'utf8');
	assert.match(promptSource, /useDataWriter\('questionnaire'/);
	assert.match(promptSource, /name: 'present_question'/);
	assert.match(promptSource, /call present_question exactly once/);
	assert.doesNotMatch(promptSource, /<socratink-questionnaire>/);
});
