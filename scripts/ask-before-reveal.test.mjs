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
const beforeMark = 'What do we know?';

async function fixture(run) {
	await mkdir('.cache', { recursive: true });
	const directory = await mkdtemp(resolve('.cache/ask-before-reveal-'));
	const responses = [];
	const server = createServer(async (request, response) => {
		let input = '';
		for await (const chunk of request) input += chunk;
		response.writeHead(200, { 'content-type': 'text/event-stream' });
		responses.push({ response, request: JSON.parse(input) });
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
		await run({ snapshot, poll, responses, submit: (learner) => engine.submit(id, learner), settle: () => Promise.all(work),
			async restart() { await Promise.all(work); await engine.close(); engine = await openEngine(options); },
			async turn(learner, reveal, text, inspect = () => {}, guardedRounds) {
				const input = typeof reveal === 'string' ? { kind: reveal } : reveal;
				const count = responses.length;
				const submissionId = await engine.submit(id, learner);
				const live = createLiveReply(learner);
				const progress = initialProgress();
				const observe = async () => {
					const state = await snapshot();
					if (guardedRounds) {
						const reply = state.messages.find((m) => m.submissionId === submissionId && m.role === 'assistant');
						assert.ok(!reply || reply.parts.every((part) => part.type === 'text'),
							'a guarded reply never shows a second card or any tool data');
					}
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
				if (guardedRounds) {
					for (const [index, round] of guardedRounds.entries()) {
						await poll(observe, () => responses.length > count + index);
						const { response, request } = responses[count + index];
						assert.equal(request.tool_choice, 'none');
						assert.match(JSON.stringify(request.messages), /I think it is 41/, 'the learner’s attempt stays in context');
						assert.doesNotMatch(JSON.stringify(request.messages), /The answer is 42|add one to your guess/,
							'the withheld answer and rejected replies are absent from the next request');
						emit(response, { role: 'assistant', content: round.text });
						await delay(100);
						await observe();
						if (round.reveal) {
							emit(response, { tool_calls: [{ index: 0, id: `blocked_${count + index}`, type: 'function',
								function: { name: 'mark_reveal', arguments: JSON.stringify({ kind: round.reveal }) } }] });
						}
						finish(response, round.reveal ? 'tool_calls' : 'stop');
					}
					const state = await poll(observe, (value) => value.settlements.some((s) => s.submissionId === submissionId));
					await Promise.all(work);
					assert.equal(responses.length - count, guardedRounds.length, 'the guarded action uses at most one correction');
					return { state, submissionId, reply: state.messages.find((m) => m.submissionId === submissionId && m.role === 'assistant') };
				}
				const first = responses[count].response;
				let writer = first;
				if (input) {
					emit(first, { role: 'assistant', content: beforeMark });
					await poll(observe, (value) => JSON.stringify(value).includes(beforeMark));
					emit(first, { tool_calls: [{ index: 0, id: `reveal_${count}`, type: 'function',
						function: { name: 'mark_reveal', arguments: JSON.stringify(input) } }] });
					finish(first, 'tool_calls');
					await poll(observe, () => responses.length > count + 1);
					writer = responses[count + 1].response;
				}
				emit(writer, { role: 'assistant', content: text.slice(0, 10) });
				await delay(100); await observe();
				emit(writer, { content: text.slice(10) });
				if (input && !input.requested && ['full_answer', 'worked_example'].includes(input.kind)) {
					await delay(500); await observe();
				} else {
					await poll(observe, (value) => JSON.stringify(value).includes(text));
				}
				finish(writer);
				const state = await poll(observe, (value) => value.settlements.some((s) => s.submissionId === submissionId));
				await Promise.all(work);
				return { state, request: responses[count].request,
					reply: state.messages.find((m) => m.submissionId === submissionId && m.role === 'assistant') };
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
			let prefixStreamed = false;
			const pending = await f.turn('I think it is 41.', kind, protectedText, (value) => {
				withheld(value);
				if (value.markdown === beforeMark && !value.state.settlements.length) prefixStreamed = true;
			});
			assert.equal(prefixStreamed, true, 'text before the mark streams');
			assert.doesNotMatch(JSON.stringify(pending.reply), /What do we know/, 'settlement hides pre-mark text too');
			const card = questionnaireFromParts(pending.reply.parts);
			assert.ok(card, 'the protected reply must become an existing question card');
			assert.equal(card.kind, 'reveal-consent');
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
				assert.equal(seen.reply.parts.filter((p) => p.type === 'text').map((p) => p.text).join(''), `${beforeMark}\n\n${protectedText}`);
				assert.deepEqual(seen.reply.parts.find((p) => p.type === 'data-reveal').data, { kind });
				const again = await f.turn('Another answer, please.', kind, protectedText, ({ state }) => {
					const latest = state.messages.filter((m) => m.submissionId === state.messages.at(-1).submissionId);
					assert.doesNotMatch(JSON.stringify(latest), /The answer|42\./);
				});
				assert.ok(questionnaireFromParts(again.reply.parts), 'permission applies to one reveal only');
			} else {
				const question = 'What would you try next?';
				const tried = await f.turn(answer, undefined, '', withheld, [{ reveal: kind, text: protectedText }, { text: question }]);
				assert.deepEqual(tried.reply.parts, [{ type: 'text', state: 'done', text: question }]);
				await f.turn('Let me try again.', undefined, 'What would you try next?', withheld);
				const retry = await f.turn('I think it is 41.', kind, protectedText, withheld);
				assert.ok(questionnaireFromParts(retry.reply.parts), 'an attempt does not grant permission');
			}
		}));
	}
}

test('prose that answers a no-text correction never reaches the browser, live or settled', async () => fixture(async (f) => {
	const question = 'What color would the sky look on the Moon?';
	const note = 'Your last reply only asked a question and supplied no target content, so no reveal was marked.';
	const seen = [];
	const watch = async () => { const state = await f.snapshot(); seen.push(JSON.stringify(state)); return state; };
	const submissionId = await f.submit('I do not know.');
	await f.poll(watch, () => f.responses.length === 1);
	emit(f.responses[0].response, { role: 'assistant', content: question });
	finish(f.responses[0].response);
	await f.poll(watch, () => f.responses.length === 2);
	emit(f.responses[1].response, { role: 'assistant', content: note.slice(0, 40) });
	await delay(100); await watch();
	emit(f.responses[1].response, { content: note.slice(40) });
	finish(f.responses[1].response);
	const state = await f.poll(watch, (value) => value.settlements.some((s) => s.submissionId === submissionId));
	await f.settle();
	assert.equal(seen.some((json) => json.includes('no target content') || json.includes('Your last reply')), false);
	const reply = state.messages.find((m) => m.submissionId === submissionId && m.role === 'assistant');
	assert.equal(reply.parts.find((p) => p.type === 'text').text, question);
}));

test('Try once more hides a marked hint and settles only the corrected question', async () => fixture(async (f) => {
	const pending = await f.turn('I think it is 41.', 'full_answer', protectedText, withheld);
	const card = questionnaireFromParts(pending.reply.parts);
	const answer = formatQuestionnaireAnswers(card, [{ name: card.items[0].name, values: ['try-once-more'] }]);
	const hint = 'Hint: add one to your guess.';
	const question = 'What could you try to check your guess?';
	const tried = await f.turn(answer, undefined, '', (value) => {
		withheld(value);
		assert.doesNotMatch(JSON.stringify(value), /add one|mark_reveal/);
	}, [{ reveal: 'hint', text: hint }, { text: question }]);
	assert.deepEqual(tried.reply.parts, [{ type: 'text', state: 'done', text: question }]);
	await f.restart();
	const followUp = await f.turn('I think it could be 40.', undefined, 'What did you check?');
	assert.ok(followUp.request.messages.some((m) => m.role === 'assistant' && m.content === question));
	assert.ok(!/add one to your guess|The learner chose Try once more/.test(JSON.stringify(followUp.request.messages)),
		'rejected hint and correction stay out of the first ordinary request after reopening');
	const later = await f.turn('I checked by counting.', undefined, 'How did you count?');
	assert.ok(later.request.messages.some((m) => m.role === 'assistant' && m.content === question));
	assert.ok(!/add one to your guess|The learner chose Try once more/.test(JSON.stringify(later.request.messages)),
		'rejected hint and correction stay out of later requests');
}));

test('Try once more rejects repeated bad replies and can be retried after reopening', async () => fixture(async (f) => {
	const pending = await f.turn('I think it is 41.', 'full_answer', protectedText, withheld);
	const card = questionnaireFromParts(pending.reply.parts);
	const answer = formatQuestionnaireAnswers(card, [{ name: card.items[0].name, values: ['try-once-more'] }]);
	const bad = [{ text: 'Hint: add one to your guess.' }, { reveal: 'full_answer', text: protectedText }];
	const tried = await f.turn(answer, undefined, '', (value) => {
		withheld(value);
		assert.doesNotMatch(JSON.stringify(value), /add one/);
	}, bad);
	assert.equal(tried.reply, undefined);
	assert.equal(tried.state.settlements.find((s) => s.submissionId === tried.submissionId)?.outcome, 'failed');
	await f.restart();
	const question = 'How would you check whether it is 41?';
	const retry = await f.turn(answer, undefined, '', withheld, [{ text: question }]);
	assert.deepEqual(retry.reply.parts, [{ type: 'text', state: 'done', text: question }]);
	const followUp = await f.turn('I can count again.', undefined, 'What would you count?');
	assert.ok(followUp.request.messages.some((m) => m.role === 'assistant' && m.content === question));
	assert.ok(!/add one to your guess|The learner chose Try once more/.test(JSON.stringify(followUp.request.messages)),
		'rejected replies from the failed attempt stay out after a successful retry');
}));

test('an unmarked reply streams before settlement', async () => fixture(async (f) => {
	let streamed = false;
	const text = 'What would you try next?';
	const { reply } = await f.turn('Let me try.', undefined, text, ({ state, markdown }) => {
		if (!state.settlements.length && markdown === text) streamed = true;
	});
	assert.equal(streamed, true, 'ordinary text must not wait for settlement');
	assert.equal(reply.parts.find((p) => p.type === 'text').text, text);
}));

for (const kind of ['full_answer', 'worked_example']) {
	test(`${kind}: an explicit answer request needs no consent card`, async () => fixture(async (f) => {
		const reveal = { kind, requested: true };
		let streamed = false;
		const { reply } = await f.turn('Just tell me the answer.', reveal, protectedText, ({ state, markdown }) => {
			if (!state.settlements.length && markdown.includes(protectedText)) streamed = true;
		});
		assert.equal(streamed, true);
		assert.equal(questionnaireFromParts(reply.parts), undefined);
		assert.ok(reply.parts.find((p) => p.type === 'text').text.includes(protectedText));
		assert.deepEqual(reply.parts.find((p) => p.type === 'data-reveal').data, reveal);
	}));

	test(`${kind}: a first message that asks a question and asks for the answer shows it with no card (#133)`, async () => fixture(async (f) => {
		// The tutor did not set requested, as in the live run. The learner's words decide.
		const { reply } = await f.turn('Why do the seasons change on Earth? just tell me the answer', kind, protectedText);
		assert.equal(questionnaireFromParts(reply.parts), undefined);
		assert.ok(reply.parts.find((p) => p.type === 'text').text.includes(protectedText));
		assert.deepEqual(reply.parts.find((p) => p.type === 'data-reveal').data, { kind });
		const later = await f.turn("Just tell me if I'm right: it is 41.", kind, protectedText);
		assert.ok(questionnaireFromParts(later.reply.parts), 'asking to check an attempt is not asking for the answer');
		assert.doesNotMatch(JSON.stringify(later.reply), /The answer|42\./);
	}));

	for (const target of [undefined, 'If the Sun emitted only red light, the sky would look nearly black']) {
		test(`${kind}: consent line ${target ? 'never shows a target that states the answer' : 'keeps the default without a target'}`, async () => fixture(async (f) => {
			const { reply } = await f.turn('I think it is 41.', { kind, ...(target ? { target } : {}) }, protectedText, withheld);
			const card = questionnaireFromParts(reply.parts);
			assert.equal(card.items[0].prompt, kind === 'full_answer' ? 'I can show a full answer.' : 'I can show a worked example.');
		}));
	}
}

for (const kind of ['hint', 'partial']) test(`${kind} arrives without a consent card and keeps its provenance`, async () => fixture(async (f) => {
	let liveHint = false;
	const { reply } = await f.turn('Give me a hint.', kind, 'Consider the units.', ({ state, markdown }) => {
		if (!state.settlements.length && markdown.includes('Consider the units.')) liveHint = true;
	});
	assert.equal(liveHint, true, 'the hint is visible before settlement without a choice');
	assert.equal(questionnaireFromParts(reply.parts), undefined);
	assert.equal(reply.parts.find((p) => p.type === 'text').text, `${beforeMark}\n\nConsider the units.`);
	assert.deepEqual(reply.parts.find((p) => p.type === 'data-reveal').data, { kind });
}));
