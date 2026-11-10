import assert from 'node:assert/strict';
import { createStreamClient } from '../src/ui/client/conversation-stream.ts';
import { clientFor, gate, until, userMessages } from './durable-smoke-support.mjs';

export function streamClientFor(app, session, nonce) {
	const id = nonce.includes(':') ? nonce : `${session.userId}:${nonce}`;
	return createStreamClient({ url: `${app.origin}/api/agents/chat/${encodeURIComponent(id)}`, headers: { cookie: session.cookie } });
}

export const timingHoldMs = 100;

/** Wire cost of one plain turn: time from 202 to the first delta and to the
 * settled reply, and how many GETs the client made. The provider holds for
 * timingHoldMs after admission and then answers at once, so anything beyond
 * that hold is transport overhead, not model latency. */
export async function measureTurn(makeClient, fixture, marker) {
	const hold = gate();
	fixture.plan(marker, { before: hold, reasoning: 'Synthetic timing reasoning.', text: 'Synthetic timing answer.' });
	const realFetch = globalThis.fetch;
	let gets = 0;
	globalThis.fetch = (input, init = {}) => {
		if ((init.method ?? 'GET') === 'GET' && String(input).includes('/api/agents/chat/')) gets += 1;
		return realFetch(input, init);
	};
	try {
		// The SDK binds fetch when it is created, so count before creating it.
		const client = makeClient();
		const admission = await client.send({ message: { kind: 'user', body: marker } });
		const admitted = performance.now();
		setTimeout(hold.release, timingHoldMs);
		let firstDelta;
		const reply = await client.read(admission, { signal: AbortSignal.timeout(20_000), onEvent: (event) => {
			if (event.type === 'message-delta' && firstDelta === undefined) firstDelta = performance.now();
		} });
		assert.equal(reply.text, 'Synthetic timing answer.');
		return { firstDeltaMs: Math.round((firstDelta ?? NaN) - admitted), settledMs: Math.round(performance.now() - admitted), gets };
	} finally {
		globalThis.fetch = realFetch;
	}
}

/** The SSE client against the real server: live reasoning, a dropped read that
 * reattaches by id, tool events, the same history the SDK reads, and cancel. */
export async function verifyStreamClient({ app, session, fixture }) {
	const client = streamClientFor(app, session, 'stream');
	const reasoning = 'Streaming synthetic reasoning before the hint.';
	const text = 'A streamed synthetic hint.';
	const reveal = { kind: 'hint', target: 'Synthetic stream action' };
	const held = gate();
	fixture.plan('DURABLE_STREAM', { reasoning, afterReasoning: held,
		tools: [{ name: 'mark_reveal', arguments: reveal }] }, { text });
	const admission = await client.send({ message: { kind: 'user', body: 'DURABLE_STREAM' } });
	const events = [];
	const dropped = new AbortController();
	const firstRead = client.read(admission, { signal: dropped.signal, onEvent: (event) => events.push(event) })
		.then(() => ({ unexpectedlyCompleted: true }), (error) => ({ error }));
	await until(() => events.some((event) => event.type === 'message-delta' && event.kind === 'reasoning' && event.delta === reasoning),
		'SSE reasoning before provider completion');
	dropped.abort();
	assert.ok((await firstRead).error, 'dropping one read interrupts only that read');
	const reattached = [];
	const secondRead = client.read(admission.submissionId, { signal: AbortSignal.timeout(20_000), onEvent: (event) => reattached.push(event) });
	held.release();
	const reply = await secondRead;
	assert.equal(reply.text, text);
	assert.deepEqual(reply.data.reveal, [reveal]);
	assert.equal(fixture.count('DURABLE_STREAM'), 2, 'one tool step and one final step, with no resubmission');
	assert.ok(reattached.some((event) => event.type === 'tool-input' && event.toolName === 'mark_reveal'));
	assert.ok(reattached.some((event) => event.type === 'tool-output'));
	for (const collection of [events, reattached]) {
		const positions = collection.map((event) => JSON.stringify(event.position));
		assert.equal(new Set(positions).size, positions.length, 'one reader never delivers a position twice');
		const texts = collection.filter((event) => event.type === 'message-delta' && event.kind === 'text').map((event) => event.delta).join('');
		assert.ok(text.startsWith(texts) || texts === '', 'deltas never repeat text');
	}
	const history = await client.history();
	assert.equal(userMessages(history).length, 1);
	assert.deepEqual(history, await clientFor(app, session, 'stream').history(), 'both clients read the same history');

	const cancelGate = gate();
	fixture.plan('DURABLE_STREAM_CANCEL', { before: cancelGate, text: 'Must not become a streamed answer.' });
	const cancel = streamClientFor(app, session, 'stream-cancel');
	const cancelled = await cancel.send({ message: { kind: 'user', body: 'DURABLE_STREAM_CANCEL' } });
	await until(() => fixture.count('DURABLE_STREAM_CANCEL') === 1, 'cancelled provider call');
	assert.equal((await cancel.abort()).aborted, true);
	await assert.rejects(cancel.read(cancelled, { signal: AbortSignal.timeout(15_000) }), (error) => error.failure === 'aborted');
	cancelGate.release();
	return { liveEvents: events.length, reattachedEvents: reattached.length };
}
