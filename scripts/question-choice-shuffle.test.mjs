import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { executeLearningTool } from '../src/learning/tools.ts';
import {
	formatQuestionnaireAnswers,
	questionnaireFromParts,
	questionnaireFromPresentQuestion,
	questionnaireFromReplyData,
} from '../src/questionnaire.ts';

const root = fileURLToPath(new URL('../', import.meta.url));
const input = {
	prompt: 'Where in the chloroplast do the light-dependent reactions take place?',
	choices: ['Thylakoid membrane', 'Stroma', 'Outer chloroplast membrane', 'Cytosol'],
};
const sampleSize = 4000;
const expectedPerPosition = sampleSize / input.choices.length;
const tolerance = 120;

function present(question = input, callId = 'call-default') {
	const result = executeLearningTool('present_question', question, callId);
	assert.equal(result.terminate, true);
	const definition = questionnaireFromReplyData(result.data);
	assert.ok(definition);
	if (result.output !== 'Question presented on the card.') {
		assert.equal(result.output, `Question presented on the card. Choices in displayed order:\n${definition.items[0].choices
			.map((choice, index) => `${String.fromCharCode(65 + index)}. ${choice.label}`).join('\n')}`);
		assert.deepEqual(definition.items[0].choices.map((choice) => choice.shortcut),
			definition.items[0].choices.map((_, index) => String.fromCharCode(65 + index)));
	}
	return definition;
}

function assertSelections(definition) {
	const item = definition.items[0];
	for (const choice of item.choices) {
		assert.equal(
			formatQuestionnaireAnswers(definition, [{ name: item.name, values: [choice.value] }]),
			`Questionnaire answers:\n- ${item.prompt}: ${choice.label}`,
		);
	}
}

test('production cards: 4000 call-id first/retry pairs, each position within 120 of 1000', (t) => {
	const counts = { first: [0, 0, 0, 0], retry: [0, 0, 0, 0] };
	const unchangedInput = structuredClone(input);
	for (let index = 0; index < sampleSize; index += 1) {
		for (const phase of ['first', 'retry']) {
			const question = input;
			const definition = present(question, `call-${index}-${phase}`);
			const choices = definition.items[0].choices;
			const position = choices.findIndex((choice) => choice.label === input.choices[0]);
			assert.notEqual(position, -1);
			counts[phase][position] += 1;
			assertSelections(definition);
			if (phase === 'first') {
				const wrong = choices.find((choice) => choice.label === 'Stroma');
				assert.equal(formatQuestionnaireAnswers(definition, [{ name: 'item', values: [wrong.value] }]),
					`Questionnaire answers:\n- ${question.prompt}: Stroma`);
			}
			const saved = JSON.parse(JSON.stringify(definition));
			const restored = questionnaireFromParts([{ type: 'data-questionnaire', data: saved }]);
			assert.deepEqual(restored, definition, 'restoration preserves the displayed order and values');
			assert.deepEqual(questionnaireFromReplyData({ questionnaire: [saved] }), definition);
			assertSelections(restored);
		}
	}
	for (const [phase, positions] of Object.entries(counts)) {
		t.diagnostic(`${phase} correct-choice counts: ${positions.join(', ')}`);
		assert.ok(positions.every((count) => Math.abs(count - expectedPerPosition) <= tolerance),
			`${phase} correct-choice distribution must be within ${tolerance}: ${positions}`);
	}
	assert.deepEqual(input, unchangedInput, 'card construction must not mutate model input');
});

test('replay keeps order but new calls vary identical cards; labels and values stay paired', (t) => {
	t.mock.method(Math, 'random', () => { throw new Error('Card order must not use random state'); });
	const question = {
		prompt: 'Which option holds?',
		choices: [{ label: 'Retry', value: 'retry' }, 'Retry', { label: 'Stop', value: 'stop-now' }],
	};
	const first = present(question);
	assert.deepEqual([...first.items[0].choices].map(({ shortcut, ...choice }) => choice)
		.sort((a, b) => a.value.localeCompare(b.value)), [
		{ label: 'Retry', value: 'retry' }, { label: 'Retry', value: 'retry-2' }, { label: 'Stop', value: 'stop-now' },
	]);
	assertSelections(first);
	assert.equal(formatQuestionnaireAnswers(first, [{ name: 'item', values: ['stop-now'] }]),
		'Questionnaire answers:\n- Which option holds?: Stop');
	for (let replay = 0; replay < 20; replay += 1) {
		assert.deepEqual(present(JSON.parse(JSON.stringify(question))), first);
	}
	assert.ok(new Set(Array.from({ length: 40 }, (_, index) =>
		JSON.stringify(present(question, `retry-${index}`).items[0].choices))).size > 1,
		'new calls must not reuse a content-seeded order');
	assert.deepEqual(questionnaireFromPresentQuestion(question).items[0].choices.map((choice) => choice.value),
		['retry', 'retry-2', 'stop-now'], 'the shared converter preserves consent card order');
});

test('summary choices stay last in their original relative order', () => {
	for (let index = 0; index < 40; index += 1) {
		const question = {
			prompt: `Which statement holds for card ${index}?`,
			choices: ['All of the above', 'Left', { label: 'None of the above', value: 'none-above' },
				'Right', 'None of these'],
		};
		const definition = present(question);
		assert.deepEqual(definition.items[0].choices.slice(-3).map(({ shortcut, ...choice }) => choice), [
			{ label: 'All of the above', value: 'all-of-the-above' },
			{ label: 'None of the above', value: 'none-above' },
			{ label: 'None of these', value: 'none-of-these' },
		]);
		assertSelections(definition);
	}
});

test('self-contained unshuffled tool makes the production distribution regression fail', async () => {
	const cache = join(root, '.cache');
	await mkdir(cache, { recursive: true });
	const directory = await mkdtemp(join(cache, 'shuffle-reversion-'));
	try {
		for (const file of ['src/learning/present-question.ts', 'src/questionnaire.ts',
			'src/reveal.ts', 'scripts/question-choice-shuffle.test.mjs']) {
			await mkdir(dirname(join(directory, file)), { recursive: true });
			await copyFile(join(root, file), join(directory, file));
		}
		await writeFile(join(directory, 'src/learning/tools.ts'), `
import { questionnaireFromPresentQuestion } from '../questionnaire.ts';

export function executeLearningTool(name: string, input: unknown) {
	if (name !== 'present_question') throw new Error('Unexpected baseline tool');
	return { output: 'Question presented on the card.',
		data: { questionnaire: [questionnaireFromPresentQuestion(input)] }, terminate: true };
}
`);
		const env = { ...process.env };
		delete env.NODE_TEST_CONTEXT;
		const result = spawnSync(process.execPath,
			['--test', '--test-name-pattern=production cards:', 'scripts/question-choice-shuffle.test.mjs'],
			{ cwd: directory, env, encoding: 'utf8', timeout: 30_000 });
		assert.equal(result.error, undefined);
		assert.equal(result.status, 1, result.stdout + result.stderr);
		assert.match(result.stdout + result.stderr, /first correct-choice distribution must be within 120/);
	} finally {
		await rm(directory, { recursive: true, force: true });
	}
});
