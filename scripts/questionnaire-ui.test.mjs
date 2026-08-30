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
		])?.items[0]?.name,
		'path',
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
			items: [
				{
					name: 'answer-0',
					prompt: 'Question?',
					choices: [{ value: 'a', label: 'A' }],
				},
				{
					name: 'answer-1',
					prompt: 'Question?',
					choices: [{ value: 'b', label: 'B' }],
				},
			],
		}),
		undefined,
	);
});

test('formats selected, freeform, and skipped answers as explicit learner text', () => {
	const questionnaire = parseQuestionnaireDefinition(validDefinition);
	assert.ok(questionnaire);
	assert.equal(
		formatQuestionnaireAnswers(questionnaire, [
			{ name: 'path', values: ['trace'], freeform: 'I want a concrete example.' },
		]),
		'Questionnaire answers:\n- How should we begin?: Example trace, I want a concrete example.',
	);
	assert.match(
		formatQuestionnaireAnswers(questionnaire, [{ name: 'path', values: [], skipped: true }]),
		/- How should we begin\?: Skipped\.$/,
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

test('questionnaire submit sends formatted answers; questionnaireUserMessage is gone', async () => {
	const surfaceSource = await readFile(new URL('../src/ui/chat-surface.ts', import.meta.url), 'utf8');
	const widgetSource = await readFile(new URL('../src/ui/questionnaire.ts', import.meta.url), 'utf8');
	assert.match(surfaceSource, /sendMessage\(formatQuestionnaireAnswers/);
	assert.doesNotMatch(widgetSource, /questionnaireUserMessage/);
});

test('the card mounts questionnaires from turn data, not a post-paint inject', async () => {
	const surfaceSource = await readFile(new URL('../src/ui/chat-surface.ts', import.meta.url), 'utf8');
	const widgetSource = await readFile(new URL('../src/ui/questionnaire.ts', import.meta.url), 'utf8');
	assert.doesNotMatch(surfaceSource, /addStartingChoices/);
	assert.doesNotMatch(surfaceSource, /startingPathQuestionnaire/);
	assert.doesNotMatch(surfaceSource, /How would you like to start/);
	assert.doesNotMatch(widgetSource, /onSubmit\(formatQuestionnaireAnswers/);
});

test('the agent mounts the Flue-native questionnaire writer and presentation tool', async () => {
	const promptSource = await readFile(new URL('../src/agents/chat.ts', import.meta.url), 'utf8');
	assert.match(promptSource, /useDataWriter\('questionnaire'/);
	assert.match(promptSource, /name: 'present_question'/);
	assert.match(promptSource, /exactly one question/);
	assert.match(promptSource, /Evaluate this app's flow/);
	assert.match(promptSource, /Questionnaire answers:/);
	assert.match(promptSource, /Find gaps with one question/);
	assert.doesNotMatch(promptSource, /useSkill/);
	assert.doesNotMatch(promptSource, /sal-khan-perspective/);
	assert.doesNotMatch(promptSource, /read_skill_resource/);
	assert.doesNotMatch(promptSource, /Activate sal-khan/);
	assert.doesNotMatch(promptSource, /<socratink-questionnaire>/);
	assert.doesNotMatch(promptSource, /Whenever you ask the learner a question/);
	assert.doesNotMatch(promptSource, /glutamate/);
	assert.doesNotMatch(promptSource, /You are socratink, a learner-guided dialogue agent/);
	assert.doesNotMatch(promptSource, /Worked-example protocol/);
	assert.doesNotMatch(promptSource, /the question is already on the card/);
});
