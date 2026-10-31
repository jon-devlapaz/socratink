import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveJevConnection } from '../src/config/jev.ts';
import { learnerMoveQuestion, learnerMoveSignalBody, readLearnerMove } from '../src/learner-move.ts';

const connection = { apiKey: 'jev-test-key', baseUrl: 'http://jev.test', timeoutMs: 50 };
const turn = { tutorQuestion: 'Why does a retry need an idempotency key?', learnerReply: 'just tell me' };

function answering(choice, probability, status = 200) {
	const requests = [];
	const fetchImpl = async (url, init) => {
		requests.push({ url, init, body: JSON.parse(init.body) });
		return new Response(
			JSON.stringify({ answers: { learner_move: { type: 'choice', choice, probabilities: { [choice]: probability } } } }),
			{ status },
		);
	};
	return { fetchImpl, requests };
}

test('no key means no Jev connection, and hosted environments ignore a base URL override', () => {
	assert.equal(resolveJevConnection({}), undefined);
	assert.equal(resolveJevConnection({ TYPESAFE_API_KEY: '  ' }), undefined);
	assert.equal(
		resolveJevConnection({ TYPESAFE_API_KEY: 'k', TYPESAFE_BASE_URL: 'http://127.0.0.1:9' }).baseUrl,
		'http://127.0.0.1:9',
	);
	for (const hosted of [{ VERCEL: '1' }, { NODE_ENV: 'production' }, { NF_PROJECT_ID: 'p' }]) {
		assert.equal(
			resolveJevConnection({ TYPESAFE_API_KEY: 'k', TYPESAFE_BASE_URL: 'http://127.0.0.1:9', ...hosted }).baseUrl,
			'https://api.typesafe.ai',
		);
	}
});

test('a sure request for the answer becomes a private signal, sent with the shipped question', async () => {
	const { fetchImpl, requests } = answering('asks_for_answer', 0.95);
	const move = await readLearnerMove(turn, connection, fetchImpl);
	assert.equal(move, 'asks_for_answer');
	assert.match(learnerMoveSignalBody(move), /asking for the answer/);
	assert.equal(requests[0].url, 'http://jev.test/v1/systemone');
	assert.equal(requests[0].init.headers.authorization, 'Bearer jev-test-key');
	assert.deepEqual(requests[0].body.state, { tutor_question: turn.tutorQuestion, learner_reply: turn.learnerReply });
	assert.deepEqual(requests[0].body.questions, { learner_move: learnerMoveQuestion });
});

test('attempts and off-topic messages are read but never signalled', async () => {
	assert.equal(learnerMoveSignalBody(await readLearnerMove(turn, connection, answering('attempt', 0.99).fetchImpl)), undefined);
	assert.equal(learnerMoveSignalBody(await readLearnerMove(turn, connection, answering('other', 0.99).fetchImpl)), undefined);
	assert.match(learnerMoveSignalBody('dont_know'), /do not know/);
});

test('an unsure, failed, malformed, or slow reading yields nothing and never throws', async () => {
	assert.equal(await readLearnerMove(turn, connection, answering('asks_for_answer', 0.6).fetchImpl), undefined);
	assert.equal(await readLearnerMove(turn, connection, answering('asks_for_answer', 0.95, 529).fetchImpl), undefined);
	assert.equal(await readLearnerMove(turn, connection, answering('shrug', 0.95).fetchImpl), undefined);
	assert.equal(await readLearnerMove(turn, connection, async () => new Response('not json')), undefined);
	assert.equal(
		await readLearnerMove(turn, connection, async () => {
			throw new TypeError('fetch failed');
		}),
		undefined,
	);
	const started = performance.now();
	// A real fetch holds the event loop open; AbortSignal.timeout alone does not.
	const hanging = (_url, init) =>
		new Promise((_resolve, reject) => {
			const keepAlive = setTimeout(() => {}, 5000);
			init.signal.addEventListener('abort', () => {
				clearTimeout(keepAlive);
				reject(init.signal.reason);
			});
		});
	assert.equal(await readLearnerMove(turn, connection, hanging), undefined);
	assert.ok(performance.now() - started < 1000, 'the timeout bounds the wait');
});
