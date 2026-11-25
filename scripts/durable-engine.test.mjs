import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { createServer } from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import test from 'node:test';
import { BACKGROUND_CONTEXT as context } from '@earendil-works/chord/context';
import { openEngine } from '../src/server/durable/engine.ts';
import { createDurableStorage } from '../src/server/durable/storage.ts';
import { readSnapshot } from '../src/server/durable/projection.ts';
import { learnerVisibleText } from '../src/learning/learner-text.ts';
import { formatQuestionnaireAnswers, questionnaireFromReplyData } from '../src/questionnaire.ts';

async function fixture(run, failures = 0) {
	const directory = await mkdtemp(join(tmpdir(), 'socratink-durable-engine-'));
	const target = { kind: 'sqlite', filename: join(directory, 'pi.sqlite') };
	const responses = [];
	const requests = [];
	const server = createServer(async (request, response) => {
		let body = '';
		for await (const chunk of request) body += chunk;
		requests.push(JSON.parse(body).messages);
		responses.push(response);
		if (Array.isArray(failures) ? failures.includes(responses.length) : responses.length <= failures) {
			response.writeHead(500, { 'content-type': 'application/json' });
			response.end(JSON.stringify({ error: { message: 'Synthetic private provider error.' } }));
			return;
		}
		response.writeHead(200, { 'content-type': 'text/event-stream', 'x-routed-via': 'synthetic-route' });
		chunk(response, { role: 'assistant', reasoning_content: 'Checking the accepted request.' });
	});
	await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
	const config = { provider: 'jon-local', modelId: 'synthetic', apiKey: 'synthetic-key',
		baseUrl: `http://127.0.0.1:${server.address().port}/v1`, reasoning: true, contextWindow: 128000, maxTokens: 4096 };
	try { await run({ target, requests, responses, config, options: { target, resolveModel: async () => config } }); }
	finally { server.closeAllConnections(); await new Promise((resolve) => server.close(resolve)); await rm(directory, { recursive: true, force: true }); }
}
function chunk(response, delta, finish_reason = null) {
	response.write(`data: ${JSON.stringify({ id: 'synthetic', model: 'synthetic', choices: [{ index: 0, delta, finish_reason }] })}\n\n`);
}
function finish(response, text = 'Completed reply.') { chunk(response, { content: text }); chunk(response, {}, 'stop'); response.end('data: [DONE]\n\n'); }
async function until(read, predicate) {
	for (let attempt = 0; attempt < 750; attempt++) { const value = await read(); if (predicate(value)) return value; await delay(20); }
	throw new Error('Expected durable state was not reached.');
}

test('another instance reads live reasoning, rejects a competing turn, and ownership closes after settlement', async () => fixture(async ({ target, responses, options }) => {
	const reports = [];
	const turns = [];
	const background = [];
	const first = await openEngine({ ...options, keepAlive: (work) => background.push(work), report: (category) => reports.push(category),
		logTurn: (turn) => turns.push(turn) });
	const second = await openEngine(options);
	const manager = createDurableStorage(target);
	try {
		assert.equal(await manager.exists('learner:one'), false);
		assert.deepEqual(await first.snapshot('learner:one'), { revision: 0, messages: [], submissions: [] });
		assert.equal(await manager.exists('learner:one'), false);
		const id = await first.submit('learner:one', 'Help.');
		const live = await until(() => second.snapshot('learner:one'), (value) => !!value.messages[1]?.reasoning);
		assert.equal(live.submissions[0].id, id);
		assert.equal(live.submissions[0].outcome, undefined);
		await assert.rejects(second.submit('learner:one', 'Duplicate.'), /busy/i);
		assert.equal(responses.length, 1);
		finish(responses[0]);
		await Promise.all(background);
		const completed = await second.snapshot('learner:one');
		assert.equal(completed.submissions[0].outcome, 'completed');
		assert.equal(completed.messages[1].reasoning, 'Checking the accepted request.');
		assert.equal(completed.messages[1].metadata.socratink.routedModel, 'synthetic-route');
		const owner = await manager.acquire('learner:one');
		assert.ok(owner, 'a settled conversation must not retain execution ownership');
		await owner.close(context);
		assert.deepEqual(reports, []);
		assert.equal(turns.length, 1, 'one log record per executed turn');
		const { latencyMs, ...turn } = turns[0];
		assert.ok(Number.isInteger(latencyMs) && latencyMs >= 0);
		assert.deepEqual(turn, { conversationId: 'learner:one', submissionId: id, status: 'completed', model: 'synthetic-route' });
	} finally { await first.close(); await second.close(); await manager.close(); }
}));

test('a follower opened before the conversation exists matches a fresh snapshot at every step of a turn', async () => fixture(async ({ responses, options }) => {
	const background = [];
	const first = await openEngine({ ...options, keepAlive: (work) => background.push(work) });
	const second = await openEngine(options);
	const follower = second.follow('learner:follow');
	// Commits may land between the two reads; compare only at one revision.
	const matched = async () => {
		for (;;) {
			const followed = await follower.snapshot();
			const full = await second.snapshot('learner:follow');
			if (followed.revision === full.revision) { assert.deepEqual(followed, full); return followed; }
		}
	};
	try {
		assert.deepEqual(await matched(), { revision: 0, messages: [], submissions: [] });
		await first.submit('learner:follow', 'Help.');
		await until(matched, (value) => !!value.messages[1]?.reasoning);
		finish(responses[0]);
		await Promise.all(background);
		const settled = await matched();
		assert.equal(settled.submissions[0].outcome, 'completed');
		assert.equal(settled.messages[1].text, 'Completed reply.');
		assert.deepEqual(await follower.snapshot(), settled, 'a poll with no new commits returns the same state');
	} finally { await follower.close(); await first.close(); await second.close(); }
}));

test('cross-instance cancellation persists and does not abort the next admission', async () => fixture(async ({ responses, options }) => {
	const first = await openEngine(options);
	const second = await openEngine(options);
	try {
		const stopped = await first.submit('learner:abort', 'Stop this.');
		await until(() => second.snapshot('learner:abort'), (value) => !!value.messages[1]?.reasoning);
		assert.equal(await second.abort('learner:abort', stopped), true);
		await until(() => second.snapshot('learner:abort'), (value) => value.submissions[0]?.outcome === 'aborted');
		await first.close();
		await second.submit('learner:abort', 'Next turn.');
		await until(async () => responses.length, (value) => value === 2);
		finish(responses[1]);
		const completed = await until(() => second.snapshot('learner:abort'), (value) => value.submissions[1]?.outcome === 'completed');
		assert.equal(completed.submissions.length, 2);
	} finally { await first.close(); await second.close(); }
}));

test('a late Cancel for a settled reply leaves the next reply from another tab running', async () => fixture(async ({ responses, options }) => {
	const background = [];
	const first = await openEngine({ ...options, keepAlive: (work) => background.push(work) });
	const second = await openEngine(options);
	try {
		const earlier = await first.submit('learner:two-tabs', 'First tab.');
		await until(async () => responses.length, (value) => value === 1);
		finish(responses[0]);
		await until(() => second.snapshot('learner:two-tabs'), (value) => value.submissions[0]?.outcome === 'completed');
		await Promise.all(background);
		const later = await first.submit('learner:two-tabs', 'Second tab.');
		await until(() => second.snapshot('learner:two-tabs'), (value) => !!value.messages[3]?.reasoning);
		assert.equal(await second.abort('learner:two-tabs', earlier), false, 'the earlier reply had already settled');
		await delay(300);
		assert.equal((await second.snapshot('learner:two-tabs')).submissions[1].outcome, undefined, 'the later reply keeps running');
		finish(responses[1]);
		const settled = await until(() => second.snapshot('learner:two-tabs'), (value) => !!value.submissions[1]?.outcome);
		assert.equal(settled.submissions[1].id, later);
		assert.equal(settled.submissions[1].outcome, 'completed');
	} finally { await first.close(); await second.close(); }
}));

test('an execution slice leaves accepted work pending, releases ownership, and a later request recovers it', async () => fixture(async ({ target, responses, options }) => {
	const background = [];
	const reports = [];
	const turns = [];
	const first = await openEngine({ ...options, executionMs: 180, keepAlive: (work) => background.push(work), report: (category) => reports.push(category),
		logTurn: (turn) => turns.push(turn.status) });
	const second = await openEngine({ ...options, report: (category) => reports.push(category), logTurn: (turn) => turns.push(turn.status) });
	const manager = createDurableStorage(target);
	try {
		const id = await first.submit('learner:slice', 'Continue after interruption.');
		await Promise.all(background);
		const reader = await manager.read('learner:slice');
		const pending = await readSnapshot(reader);
		await reader.close(context);
		assert.equal(pending.submissions[0].outcome, undefined);
		assert.deepEqual(reports, []);
		await second.snapshot('learner:slice');
		await until(async () => responses.length, (value) => value === 2);
		finish(responses[1], 'Recovered reply.');
		const recovered = await until(() => second.snapshot('learner:slice'), (value) => value.submissions[0]?.outcome === 'completed');
		assert.equal(recovered.submissions[0].id, id);
		assert.equal(recovered.messages.filter((message) => message.role === 'user').length, 1);
		assert.deepEqual(reports, ['submission_recovery']);
		await until(async () => turns.length, (count) => count === 2);
		assert.deepEqual(turns, ['interrupted', 'completed'], 'the stopped slice and its recovery each log once');
	} finally { await first.close(); await second.close(); await manager.close(); }
}));

for (const failures of [1, 3]) test(`native retry monitoring: ${failures === 1 ? 'transient failure recovers' : 'exhausted retries settle once'}`, async () => fixture(async ({ responses, options }) => {
	const reports = [];
	const turns = [];
	const background = [];
	const engine = await openEngine({ ...options, keepAlive: (work) => background.push(work), report: (category) => reports.push(category),
		logTurn: (turn) => turns.push(turn) });
	try {
		await engine.submit('learner:failure', 'Synthetic private learner text.');
		if (failures === 1) {
			await until(async () => responses.length, (count) => count === 1);
			const failedAt = Date.now();
			await until(async () => responses.length, (count) => count === 2);
			assert.ok(Date.now() - failedAt >= 1_500, 'a failed model request waits before it retries, so a rate limit can clear');
			finish(responses[1]);
		}
		await Promise.all(background);
		const completed = await engine.snapshot('learner:failure');
		assert.equal(completed.submissions[0].outcome, failures === 1 ? 'completed' : 'failed');
		assert.equal(responses.length, failures === 1 ? 2 : 3);
		assert.deepEqual(reports, failures === 1 ? ['submission_recovery']
			: ['submission_recovery', 'submission_recovery', 'submission_failed']);
		if (failures === 3) assert.equal(completed.submissions[0].error, 'The model request could not complete.');
		assert.deepEqual(turns.map((turn) => turn.status), [failures === 1 ? 'completed' : 'failed']);
		assert.equal(turns[0].model, failures === 1 ? 'synthetic-route' : 'synthetic', 'a turn without a routed reply logs the configured model');
		assert.equal(turns[0].providerStatus, failures === 1 ? undefined : 500, 'a failed turn records the provider HTTP status');
		assert.equal(JSON.stringify(turns).includes('Synthetic private'), false, 'turn records carry no learner or provider text');
	} finally { await engine.close(); }
}, failures));

for (const retryAfterCrash of [false, true]) test(`SIGKILL recovery logs once${retryAfterCrash ? ' and still reports a later provider retry' : ''}`, async () => fixture(async ({ target, responses, config, options }) => {
	const reports = [];
	const engineUrl = new URL('../src/server/durable/engine.ts', import.meta.url).href;
	const child = spawn(process.execPath, ['--input-type=module', '--eval', `
		import { openEngine } from ${JSON.stringify(engineUrl)};
		const { target, config } = JSON.parse(process.env.DURABLE_ENGINE_FIXTURE);
		const engine = await openEngine({ target, resolveModel: async () => config });
		await engine.submit('learner:crash', 'Synthetic accepted request.');
		await new Promise(() => {});
	`], { env: { ...process.env, DURABLE_ENGINE_FIXTURE: JSON.stringify({ target, config }) }, stdio: 'ignore' });
	const engine = await openEngine({ ...options, report: (category) => reports.push(category) });
	try {
		await until(async () => responses.length, (count) => count === 1);
		const exited = once(child, 'exit'); child.kill('SIGKILL'); await exited;
		await engine.snapshot('learner:crash');
		const expectedCalls = retryAfterCrash ? 3 : 2;
		await until(async () => responses.length, (count) => count === expectedCalls);
		finish(responses.at(-1));
		const completed = await until(() => engine.snapshot('learner:crash'), (value) => value.submissions[0]?.outcome === 'completed');
		assert.equal(completed.submissions.length, 1);
		assert.equal(completed.messages.filter((message) => message.role === 'user').length, 1);
		assert.deepEqual(reports, retryAfterCrash ? ['submission_recovery', 'submission_recovery'] : ['submission_recovery']);
	} finally { child.kill('SIGKILL'); await engine.close(); }
}, retryAfterCrash ? [2] : 0));

for (const [name, streamed, hidden] of [
	['a closed block', '<think>Rayleigh scattering explains it.</think>\n\nWhat do you notice at sunset?', 'Rayleigh'],
	['an unbalanced block', '<think> ∝ 1/λ</think>\n<think>⁴)\n- The sky would look black.</think>\n\nWhat do you notice at sunset?', 'black'],
	['an unclosed block', 'What do you notice at sunset?<think>The sky would look black.', 'black'],
]) test(`reasoning that a provider sends in <think> tags (${name}) never shows as reply text`, async () => fixture(async ({ responses, options }) => {
	const background = [];
	const engine = await openEngine({ ...options, keepAlive: (work) => background.push(work) });
	try {
		await engine.submit('learner:think', 'Hello.');
		await until(async () => responses.length, (count) => count === 1);
		finish(responses[0], streamed);
		const settled = await until(() => engine.snapshot('learner:think'), (value) => value.submissions[0]?.outcome === 'completed');
		const reply = settled.messages.find((message) => message.role === 'assistant');
		assert.equal(reply.text, 'What do you notice at sunset?');
		assert.ok(reply.reasoning.includes(hidden), 'the tagged text stays available as reasoning');
	} finally { await engine.close(); }
}));

test('a literal "(no text)" reply, written after a mark check, never shows', async () => fixture(async ({ responses, options }) => {
	const background = [];
	const engine = await openEngine({ ...options, keepAlive: (work) => background.push(work) });
	try {
		await engine.submit('learner:empty', 'Hello.');
		await until(async () => responses.length, (count) => count === 1);
		finish(responses[0], '(no text)');
		const settled = await until(() => engine.snapshot('learner:empty'), (value) => value.submissions[0]?.outcome === 'completed');
		assert.equal(JSON.stringify(settled.messages).includes('(no text)'), false);
	} finally { await engine.close(); }
}));

test('a card written as JSON text is retried as a real card and never shows as text (#164)', async () => fixture(async ({ responses, options }) => {
	const background = [];
	const engine = await openEngine({ ...options, keepAlive: (work) => background.push(work) });
	const json = '{"prompt":"After checking the middle element, what happens next?","choices":["Search the left half only","Recheck the full list"],"reasoning":true}';
	try {
		await engine.submit('learner:json-card', 'Teach me binary search.');
		await until(async () => responses.length, (count) => count === 1);
		finish(responses[0], `Each check halves the list.\n\n${json}`);
		await until(async () => responses.length, (count) => count === 2);
		chunk(responses[1], { tool_calls: [{ index: 0, id: 'card_1', type: 'function',
			function: { name: 'present_question', arguments: json } }] });
		chunk(responses[1], {}, 'tool_calls');
		responses[1].end('data: [DONE]\n\n');
		const settled = await until(() => engine.snapshot('learner:json-card'), (value) => value.submissions[0]?.outcome === 'completed');
		const reply = settled.messages.find((message) => message.role === 'assistant');
		assert.equal(reply.data?.questionnaire?.[0]?.items?.[0]?.prompt, 'After checking the middle element, what happens next?');
		assert.equal(learnerVisibleText(reply.text), 'Each check halves the list.');
		assert.equal(responses.length, 2);
	} finally { await engine.close(); }
}));

test('card help the tutor never marks is still labelled from the click (#65)', async () => fixture(async ({ responses, options }) => {
	const background = [];
	const engine = await openEngine({ ...options, keepAlive: (work) => background.push(work) });
	try {
		await engine.submit('learner:help', 'Questionnaire answers:\n- A list has 16 items.\nWhich half do you search next?: Asked for a hint.');
		await until(async () => responses.length, (count) => count === 1);
		finish(responses[0], 'Think about what the middle element tells you. Which side can you rule out?');
		await until(async () => responses.length, (count) => count === 2);
		finish(responses[1], '');
		const settled = await until(() => engine.snapshot('learner:help'), (value) => value.submissions[0]?.outcome === 'completed');
		const reply = settled.messages.find((message) => message.role === 'assistant');
		assert.deepEqual(reply.data?.reveal, [{ kind: 'hint', target: 'A list has 16 items.\nWhich half do you search next?' }]);
	} finally { await engine.close(); }
}));

const paymentQuestion = { prompt: 'Which request reuses the first payment key?',
	choices: ['Retry the same payment', 'Make a separate purchase'], reasoning: true };
const paymentClue = 'Count how many purchases the customer intended.';
const guidingQuestion = 'How many purchases did the customer actually intend?';
const repeatedQuestions = 'Is this a new purchase? Which key should you use?';

function finishTool(stream, name, args, id = name) {
	chunk(stream, { tool_calls: [{ index: 0, id, type: 'function', function: { name, arguments: JSON.stringify(args) } }] });
	chunk(stream, {}, 'tool_calls');
	stream.end('data: [DONE]\n\n');
}

function withPaymentCard(run) {
	return fixture(async ({ target, responses, requests, options }) => {
		const work = [];
		const tracked = { ...options, keepAlive: (promise) => work.push(promise) };
		const engine = await openEngine(tracked);
		const reader = await openEngine(tracked);
		const id = 'learner:payment-hint';
		let index = 0;
		const nextResponse = () => { const position = index++; return until(() => responses[position], Boolean); };
		const settled = async () => { await Promise.all(work); return reader.snapshot(id); };
		try {
			await engine.submit(id, 'Quiz me on payment retries.');
			finishTool(await nextResponse(), 'present_question', paymentQuestion);
			const original = questionnaireFromReplyData((await settled()).messages.at(-1).data);
			const askForHint = (card) => engine.submit(id, formatQuestionnaireAnswers(card, [{ name: card.items[0].name, values: [], help: 'hint' }]));
			await run({ target, id, engine, reader, requests, original, askForHint, nextResponse, settled });
		} finally { await engine.close(); await reader.close(); }
	});
}

for (const { name, tutorText, clue } of [
	{ name: 'a clue followed by two questions', tutorText: `${paymentClue} ${repeatedQuestions}`, clue: paymentClue },
	{ name: 'a single guiding question', tutorText: guidingQuestion, clue: guidingQuestion },
	{ name: 'two questions followed by a statement', tutorText: `${paymentClue} ${repeatedQuestions} Take your time.`, clue: paymentClue },
]) {
	test(`a marked Hint keeps the payment card answerable after reload with ${name}`, () => withPaymentCard(async ({
		id, reader, original, askForHint, nextResponse, settled,
	}) => {
		const hintTurn = await askForHint(original);
		finish(await nextResponse(), tutorText);
		const mark = await nextResponse();
		const pending = (await reader.snapshot(id)).messages.find((m) => m.role === 'assistant' && m.submissionId === hintTurn);
		finishTool(mark, 'mark_reveal', { kind: 'hint' });
		const reply = (await settled()).messages.at(-1);
		const retry = questionnaireFromReplyData(reply.data);
		assert.deepEqual(retry, original);
		const shownClue = tutorText.endsWith('Take your time.') ? reply.text.replace(/\s+Take your time\.$/u, '') : reply.text;
		assert.equal(shownClue, clue);
		assert.doesNotMatch(pending?.text ?? '', /new purchase|Which key/);
		assert.deepEqual(reply.data.reveal, [{ kind: 'hint' }]);
		assert.deepEqual(reply.tools.map((call) => [call.name, call.state, call.isError]), [['mark_reveal', 'done', false]]);
		const item = retry.items[0];
		const answer = formatQuestionnaireAnswers(retry, [{ name: item.name, values: [item.choices[0].value], freeform: 'One purchase.' }]);
		await reader.submit(id, answer);
		finish(await nextResponse(), 'What if the customer buys it again tomorrow?');
		const submitted = (await settled()).submissions.at(-1);
		assert.equal(submitted.outcome, 'completed');
		assert.equal(submitted.text, answer);
		assert.ok(submitted.text.includes(item.choices[0].label + ', One purchase.'));
	}));
}

test('after repeated Hints the tutor receives the same question and shortcuts as the learner who types B', () => withPaymentCard(async ({
	id, reader, requests, original, askForHint, nextResponse, settled,
}) => {
	await askForHint(original);
	const fresh = await nextResponse();
	chunk(fresh, { content: guidingQuestion });
	finishTool(fresh, 'present_question', { ...paymentQuestion, reasoning: false }, 'fresh-payment');
	const first = (await settled()).messages.at(-1);
	const renewed = questionnaireFromReplyData(first.data);
	const expected = original.items[0].choices.toReversed().map((choice, i) => ({ ...choice, shortcut: ['A', 'B'][i] }));
	assert.deepEqual(renewed, { ...original, items: [{ ...original.items[0], choices: expected }] });
	assert.equal(first.text, guidingQuestion);
	assert.equal(first.data.reveal[0].kind, 'hint');

	await askForHint(renewed);
	const wrong = await nextResponse();
	chunk(wrong, { content: paymentClue });
	finishTool(wrong, 'present_question', { prompt: 'What is the weather?', choices: ['Rain', 'Sun'] }, 'wrong-weather');
	const second = (await settled()).messages.at(-1);
	const retained = questionnaireFromReplyData(second.data);
	assert.deepEqual(retained, renewed);
	assert.equal(second.text, paymentClue);
	assert.equal(second.data.reveal[0].kind, 'hint');

	await reader.submit(id, 'I think it is B. Is that right?');
	finish(await nextResponse(), 'What was your reason?');
	await settled();
	const history = requests.at(-1);
	assert.equal(history.at(-1).content, 'I think it is B. Is that right?');
	for (const [callId, card] of [['wrong-weather', retained], ['fresh-payment', renewed]]) {
		const output = history.find((message) => message.role === 'tool' && message.tool_call_id === callId).content;
		const item = card.items[0];
		assert.ok(output.includes(item.prompt), output);
		assert.deepEqual(output.split('\n').filter((line) => /^[A-B]\. /u.test(line)),
			item.choices.map((choice) => `${choice.shortcut}. ${choice.label}`));
	}
}));

test('reopening a Hint recorded in the old input format preserves its marked question and the learner answer', () => withPaymentCard(async ({
	target, id, engine, reader, original, askForHint, nextResponse, settled,
}) => {
	await askForHint(original);
	finish(await nextResponse(), guidingQuestion);
	finishTool(await nextResponse(), 'mark_reveal', { kind: 'hint' });
	await settled();
	await engine.submit(id, 'One.');
	finish(await nextResponse(), 'What tells you that?');
	await settled();

	// Old inputs recorded the click and tutor response without a source-card reference.
	const db = new DatabaseSync(target.filename);
	try {
		const records = db.prepare('SELECT seq, writes FROM pi_commits WHERE namespace = ? AND instr(writes, ?) > 0').all(id, '"hintCardFrom"');
		assert.ok(records.length);
		const replace = db.prepare('UPDATE pi_commits SET writes = ? WHERE namespace = ? AND seq = ?');
		for (const { seq, writes } of records) {
			const legacy = JSON.parse(writes, (key, value) => key === 'hintCardFrom' ? undefined : value);
			replace.run(JSON.stringify(legacy), id, seq);
		}
	} finally { db.close(); }

	const history = await reader.snapshot(id);
	assert.equal(history.messages[3].text, guidingQuestion);
	assert.equal(questionnaireFromReplyData(history.messages[3].data), undefined);
	assert.deepEqual(history.messages[3].data.reveal, [{ kind: 'hint' }]);
	assert.equal(history.messages[4].text, 'One.');
	assert.equal(history.messages[5].text, 'What tells you that?');
}));

test('a reveal after the learner asks for the answer is recorded as requested, even when the tutor omits it (#133)', async () => fixture(async ({ responses, options }) => {
	const background = [];
	const engine = await openEngine({ ...options, keepAlive: (work) => background.push(work) });
	try {
		await engine.submit('learner:asked', 'Why do the seasons change? Just tell me the answer.');
		await until(async () => responses.length, (count) => count === 1);
		chunk(responses[0], { tool_calls: [{ index: 0, id: 'reveal_1', type: 'function',
			function: { name: 'mark_reveal', arguments: JSON.stringify({ kind: 'full_answer' }) } }] });
		chunk(responses[0], {}, 'tool_calls');
		responses[0].end('data: [DONE]\n\n');
		await until(async () => responses.length, (count) => count === 2);
		finish(responses[1], 'Seasons come from the tilt of the axis. If Earth had no tilt, what would change?');
		const settled = await until(() => engine.snapshot('learner:asked'), (value) => value.submissions[0]?.outcome === 'completed');
		const reply = settled.messages.find((message) => message.role === 'assistant');
		assert.deepEqual(reply.data?.reveal, [{ kind: 'full_answer', requested: true }]);
	} finally { await engine.close(); }
}));

test('a turn log line names route, hashed session, model, latency and status, never the conversation id', async () => {
	const { logTurn } = await import('../src/server/logging.ts');
	const lines = [];
	const log = console.log;
	console.log = (line) => lines.push(line);
	try {
		logTurn({ conversationId: 'guest-user:nonce', submissionId: '4', latencyMs: 812, model: 'synthetic/model', status: 'completed' });
		logTurn({ conversationId: 'guest-user:nonce', submissionId: '5', latencyMs: 90, status: 'failed', providerStatus: 429 });
	} finally { console.log = log; }
	const [completed, failed] = lines.map((line) => JSON.parse(line));
	assert.deepEqual(Object.keys(completed), ['event', 'route', 'session', 'submission', 'model', 'latencyMs', 'status']);
	assert.equal(completed.event, 'socratink_turn');
	assert.equal(completed.route, '/api/agents/chat');
	assert.match(completed.session, /^[0-9a-f]{12}$/);
	assert.equal(failed.session, completed.session, 'turns of one conversation share a session hash');
	assert.equal(lines.join('').includes('guest-user'), false);
	assert.deepEqual({ model: failed.model, status: failed.status, error: failed.error, providerStatus: failed.providerStatus },
		{ model: null, status: 'failed', error: 'model_request_failed', providerStatus: 429 });
});
