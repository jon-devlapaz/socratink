import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
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

function seededRandom(seed) {
	return () => {
		seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
		return seed / 2 ** 32;
	};
}

function present(question = input) {
	const result = executeLearningTool('present_question', question);
	assert.equal(result.terminate, true);
	const definition = questionnaireFromReplyData(result.data);
	assert.ok(definition);
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

test('production cards: LCG seed 0x51a7, 4000 first/retry pairs, each position within 120 of 1000', (t) => {
	t.mock.method(Math, 'random', seededRandom(0x51a7));
	const counts = { first: [0, 0, 0, 0], retry: [0, 0, 0, 0] };
	const unchangedInput = structuredClone(input);
	for (let index = 0; index < sampleSize; index += 1) {
		for (const phase of ['first', 'retry']) {
			const definition = present();
			const choices = definition.items[0].choices;
			const position = choices.findIndex((choice) => choice.label === input.choices[0]);
			assert.notEqual(position, -1);
			counts[phase][position] += 1;
			assertSelections(definition);
			if (phase === 'first') {
				const wrong = choices.find((choice) => choice.label === 'Stroma');
				assert.equal(formatQuestionnaireAnswers(definition, [{ name: 'item', values: [wrong.value] }]),
					`Questionnaire answers:\n- ${input.prompt}: Stroma`);
			}
			const saved = JSON.parse(JSON.stringify(definition));
			const callsBeforeRestore = Math.random.mock.callCount();
			const restored = questionnaireFromParts([{ type: 'data-questionnaire', data: saved }]);
			assert.deepEqual(restored, definition, 'restoration preserves the displayed order and values');
			assert.deepEqual(questionnaireFromReplyData({ questionnaire: [saved] }), definition);
			assert.equal(Math.random.mock.callCount(), callsBeforeRestore, 'restoration must not shuffle');
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

test('fresh retries use new random draws; duplicate labels and explicit values stay paired', (t) => {
	const random = t.mock.method(Math, 'random', () => 0);
	const question = {
		prompt: 'Which option holds?',
		choices: [{ label: 'Retry', value: 'retry' }, 'Retry', { label: 'Stop', value: 'stop-now' }],
	};
	const first = present(question);
	assert.deepEqual(first.items[0].choices, [
		{ label: 'Retry', value: 'retry-2' }, { label: 'Stop', value: 'stop-now' }, { label: 'Retry', value: 'retry' },
	]);
	assertSelections(first);
	assert.equal(formatQuestionnaireAnswers(first, [{ name: 'item', values: ['stop-now'] }]),
		'Questionnaire answers:\n- Which option holds?: Stop');
	random.mock.mockImplementation(() => 1 - Number.EPSILON);
	const retry = present(question);
	assert.deepEqual(retry.items[0].choices, [
		{ label: 'Retry', value: 'retry' }, { label: 'Retry', value: 'retry-2' }, { label: 'Stop', value: 'stop-now' },
	]);
	assertSelections(retry);
	assert.notDeepEqual(retry, first);
	assert.deepEqual(questionnaireFromPresentQuestion(question), retry,
		'the shared converter stays deterministic for reconstructed consent cards');
});

test('isolated shuffle removal makes the production distribution regression fail', async () => {
	const cache = join(root, '.cache');
	await mkdir(cache, { recursive: true });
	const directory = await mkdtemp(join(cache, 'shuffle-reversion-'));
	try {
		for (const file of ['src/learning/tools.ts', 'src/learning/present-question.ts', 'src/questionnaire.ts',
			'src/reveal.ts', 'scripts/question-choice-shuffle.test.mjs']) {
			await mkdir(dirname(join(directory, file)), { recursive: true });
			await copyFile(join(root, file), join(directory, file));
		}
		const path = join(directory, 'src/learning/tools.ts');
		const source = await readFile(path, 'utf8');
		const withoutShuffle = source.replace(/\n\t\tfor \(let index = choices\.length - 1; index > 0; index -= 1\) \{[^}]+\n\t\t\}/u, '');
		assert.notEqual(withoutShuffle, source, 'the probe must remove only the production shuffle loop');
		await writeFile(path, withoutShuffle);
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
