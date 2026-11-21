import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { createServer } from 'node:http';
import { resolve, join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import test from 'node:test';
import { openEngine } from '../src/server/durable/engine.ts';
import { project } from '../src/server/durable/browser-projection.ts';
import { progressEvents, initialProgress } from '../src/server/durable/browser-events.ts';
import { createLiveReply } from '../src/ui/live-reply.ts';
import { visibleTurnsFromHistory } from '../src/ui/chat-turns.ts';
import { formatQuestionnaireAnswers, questionnaireFromParts } from '../src/questionnaire.ts';

const protectedText = 'The answer is 42.';

async function fixture(run) {
	await mkdir('.cache', { recursive: true });
	const directory = await mkdtemp(resolve('.cache/ask-before-reveal-'));
	const responses = [];
	const server = createServer(async (request, response) => {
		for await (const _chunk of request) {}
		response.writeHead(200, { 'content-type': 'text/event-stream' });
		responses.push(response);
	});
	await new Promise((done) => server.listen(0, '127.0.0.1', done));
	const work = [];
	const options = { target: { kind: 'sqlite', filename: join(directory, 'pi.sqlite') },
		resolveModel: async () => ({ provider: 'jon-local', modelId: 'synthetic', apiKey: 'synthetic',
			baseUrl: `http://127.0.0.1:${server.address().port}/v1`, contextWindow: 128000, maxTokens: 4096 }),
		keepAlive: (promise) => work.push(promise) };
	let engine = await openEngine(options);
	const id = 'learner:consent';
	const snapshot = async () => project(id, await engine.snapshot(id));
	const poll = async (read, predicate) => {
		for (let n = 0; n < 300; n++) {
			const value = await read();
			if (predicate(value)) return value;
			await delay(10);
		}
		throw new Error('Synthetic conversation did not reach the expected state.');
	};
	try {
		await run({ snapshot, poll,
			async restart() { await Promise.all(work); await engine.close(); engine = await openEngine(options); },
			async turn(learner, kind, text, inspect = () => {}) {
				const count = responses.length;
				const submissionId = await engine.submit(id, learner);
				const live = createLiveReply(learner);
				const progress = initialProgress();
				const observe = async () => {
					const state = await snapshot();
					for (const event of progressEvents(state, progress)) {
						if (event.type === 'message-started' && event.submissionId !== submissionId) continue;
						if (event.type === 'message-delta' && event.messageId !== `${submissionId}:assistant`) continue;
						live.apply(event);
						inspect({ state, markdown: live.view().markdown });
					}
					inspect({ state, markdown: live.view().markdown });
					return state;
				};
				await poll(observe, () => responses.length > count);
				const first = responses[count];
				emit(first, { role: 'assistant', content: text.slice(0, 10) });
				await delay(100); await observe();
				emit(first, { content: text.slice(10) });
				await delay(100); await observe();
				if (kind) {
					emit(first, { tool_calls: [{ index: 0, id: `reveal_${count}`, type: 'function',
						function: { name: 'mark_reveal', arguments: JSON.stringify({ kind }) } }] });
					finish(first, 'tool_calls');
					await poll(observe, () => responses.length > count + 1);
					finish(responses[count + 1]);
				} else finish(first);
				const state = await poll(observe, (value) => value.settlements.some((s) => s.submissionId === submissionId));
				await Promise.all(work);
				return { state, reply: state.messages.find((m) => m.submissionId === submissionId && m.role === 'assistant') };
			},
		});
	} finally {
		await engine.close();
		server.closeAllConnections();
		await new Promise((done) => server.close(done));
		await rm(directory, { recursive: true, force: true });
	}
}

function emit(response, delta, finish_reason = null) {
	response.write(`data: ${JSON.stringify({ id: 'synthetic', model: 'synthetic', choices: [{ index: 0, delta, finish_reason }] })}\n\n`);
}
function finish(response, reason = 'stop') {
	emit(response, {}, reason);
	response.end('data: [DONE]\n\n');
}
function withheld({ state, markdown }) {
	assert.doesNotMatch(JSON.stringify(state), /The answer|42\./, 'protected content must not reach the browser before permission');
	assert.doesNotMatch(markdown, /The answer|42\./);
	assert.doesNotMatch(JSON.stringify(visibleTurnsFromHistory(state)), /The answer|42\./);
}

for (const kind of ['full_answer', 'worked_example']) {
	for (const choice of ['see-it', 'try-once-more']) {
		test(`${kind}: ${choice}, intermediate text and restored pending choice`, async () => fixture(async (f) => {
			const pending = await f.turn('Just tell me the answer.', kind, protectedText, withheld);
			const card = questionnaireFromParts(pending.reply.parts);
			assert.ok(card, 'the protected reply must become an existing question card');
			assert.deepEqual(card.items[0].choices.map((c) => c.label), ['See it', 'Try once more']);
			assert.match(card.items[0].prompt, kind === 'full_answer' ? /full answer/ : /worked example/);
			assert.doesNotMatch(card.items[0].prompt, /\n/);
			await f.restart();
			const restored = await f.snapshot();
			withheld({ state: restored, markdown: '' });
			assert.deepEqual(questionnaireFromParts(restored.messages.at(-1).parts), card);
			const answer = formatQuestionnaireAnswers(card, [{ name: card.items[0].name, values: [choice] }]);
			if (choice === 'see-it') {
				const seen = await f.turn(answer, kind, protectedText);
				assert.equal(seen.reply.parts.filter((p) => p.type === 'text').map((p) => p.text).join(''), protectedText);
				assert.deepEqual(seen.reply.parts.find((p) => p.type === 'data-reveal').data, { kind });
				const again = await f.turn('Another answer, please.', kind, protectedText, ({ state }) => {
					const latest = state.messages.filter((m) => m.submissionId === state.messages.at(-1).submissionId);
					assert.doesNotMatch(JSON.stringify(latest), /The answer|42\./);
				});
				assert.ok(questionnaireFromParts(again.reply.parts), 'permission applies to one reveal only');
			} else {
				await f.turn(answer, kind, protectedText, withheld);
				await f.turn('Let me try again.', undefined, 'What would you try next?', withheld);
				const retry = await f.turn('I think it is 41.', kind, protectedText, withheld);
				assert.ok(questionnaireFromParts(retry.reply.parts), 'an attempt does not grant permission');
			}
		}));
	}
}

test('a hint arrives without a consent card and keeps its provenance', async () => fixture(async (f) => {
	let liveHint = false;
	const { reply } = await f.turn('Give me a hint.', 'hint', 'Consider the units.', ({ state, markdown }) => {
		if (!state.settlements.length && markdown === 'Consider the units.') liveHint = true;
	});
	assert.equal(liveHint, true, 'the hint is visible before settlement without a choice');
	assert.equal(questionnaireFromParts(reply.parts), undefined);
	assert.equal(reply.parts.find((p) => p.type === 'text').text, 'Consider the units.');
	assert.deepEqual(reply.parts.find((p) => p.type === 'data-reveal').data, { kind: 'hint' });
}));
