import assert from 'node:assert/strict';
import test from 'node:test';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
	looksLikeUnboxedChoices,
	presentQuestionRetryReason,
	presentQuestionToolName,
} from '../src/agents/present-question.ts';
import { questionnaireFromPresentQuestion } from '../src/questionnaire.ts';

// Failure cases: cross-conversation text, unbounded retries, stale state on a
// new delivery, and captured text retained after a completion or failure.
test('real Chat retries once per delivery and releases isolated capture state', async () => {
	const directory = await mkdtemp(join(tmpdir(), 'socratink-question-capture-'));
	try {
		const { stdout } = await promisify(execFile)(process.execPath,
			[new URL('./present-question-runtime-fixture.mjs', import.meta.url).pathname],
			{ cwd: directory, timeout: 30_000, env: { ...process.env, NODE_ENV: 'test',
				JON_LOCAL_MODEL_ID: 'capture-model', JON_LOCAL_BASE_URL: 'http://127.0.0.1:0/v1', JON_LOCAL_API_KEY: 'synthetic-only',
				NF_PROJECT_ID: '',
				DATABASE_URL: '', SESSION_SECRET: '', CREDENTIALS_SECRET: '', VERCEL: '',
			} });
		assert.ok(stdout.includes('"released":true'));
	} finally {
		await rm(directory, { recursive: true, force: true });
	}
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
});
