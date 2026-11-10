import assert from 'node:assert/strict';
import { gate } from './durable-smoke-support.mjs';

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
