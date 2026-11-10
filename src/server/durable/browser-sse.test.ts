import assert from 'node:assert/strict';
import test from 'node:test';
import { Hono } from 'hono';
import { mountBrowserBridge } from './browser-bridge.ts';
import { conversationEvents } from './browser-sse.ts';
import type { Engine, Snapshot } from './contract.ts';

const fast = { pollMs: 1, heartbeatMs: 60_000, maxMs: 5_000 };

function engineOf(states: Snapshot[]): Engine & { calls: number } {
	const engine = {
		calls: 0,
		exists: async () => true,
		snapshot: async () => states[Math.min(engine.calls++, states.length - 1)]!,
		submit: async () => { throw new Error('SSE must not submit work'); },
		abort: async () => { throw new Error('SSE must not abort work'); },
		close: async () => {},
	};
	return engine;
}

async function frames(body: ReadableStream<Uint8Array>): Promise<{ events: any[]; comments: string[] }> {
	const text = await new Response(body).text();
	const blocks = text.split('\n\n').filter(Boolean);
	return {
		events: blocks.filter((b) => b.startsWith('data: ')).map((b) => JSON.parse(b.slice(6))),
		comments: blocks.filter((b) => b.startsWith(':')),
	};
}

const earlier = { role: 'user' as const, submissionId: 's1', text: 'Earlier question' };
const earlierReply = { role: 'assistant' as const, submissionId: 's1', text: 'Earlier answer' };
const question = { role: 'user' as const, submissionId: 's2', text: 'Synthetic question' };
const done = { id: 's1', text: 'Earlier question', outcome: 'completed' as const };

test('a settled conversation sends one reset with every reply, then ends', async () => {
	const engine = engineOf([{ revision: 3, messages: [earlier, earlierReply], submissions: [done] }]);
	const { events } = await frames(conversationEvents(engine, 'c', new AbortController().signal, fast));
	assert.deepEqual(events.map((e) => e.type), ['conversation-reset']);
	assert.deepEqual(events[0].snapshot.messages.map((m: any) => m.id), ['s1:user', 's1:assistant']);
	assert.equal(events[0].conversationId, 'c');
	assert.equal(engine.calls, 1);
});

test('a pending reply streams from its start after the reset, then settles and ends', async () => {
	const open = { id: 's2', text: 'Synthetic question' };
	const engine = engineOf([
		{ revision: 4, messages: [earlier, earlierReply, question, { role: 'assistant', submissionId: 's2', text: 'An', reasoning: 'Thinking' }], submissions: [done, open] },
		{ revision: 5, messages: [earlier, earlierReply, question, { role: 'assistant', submissionId: 's2', text: 'An answer', reasoning: 'Thinking' }], submissions: [done, open] },
		{ revision: 6, messages: [earlier, earlierReply, question, { role: 'assistant', submissionId: 's2', text: 'An answer.', reasoning: 'Thinking' }], submissions: [done, { ...open, outcome: 'completed' }] },
	]);
	const { events } = await frames(conversationEvents(engine, 'c', new AbortController().signal, fast));
	assert.deepEqual(events.map((e) => e.type), ['conversation-reset', 'message-started', 'message-delta', 'message-delta',
		'message-delta', 'message-delta', 'submission-settled', 'conversation-reset']);
	assert.deepEqual(events[0].snapshot.messages.map((m: any) => m.id), ['s1:user', 's1:assistant', 's2:user'],
		'the opening reset leaves out the pending reply so its deltas are not applied twice');
	const text = events.filter((e) => e.type === 'message-delta' && e.kind === 'text').map((e) => e.delta).join('');
	assert.equal(text, 'An answer.');
	assert.equal(events.find((e) => e.kind === 'reasoning').delta, 'Thinking');
	assert.equal(events.at(-1).snapshot.messages.at(-1).parts.at(-1).text, 'An answer.');
	assert.deepEqual(events.map((e) => e.position.index), events.map((_, i) => i));
});

test('a long pending turn gets heartbeats and ends at the time cap', async () => {
	const engine = engineOf([{ revision: 1, messages: [question], submissions: [{ id: 's2', text: 'Synthetic question' }] }]);
	const { events, comments } = await frames(conversationEvents(engine, 'c', new AbortController().signal, { pollMs: 5, heartbeatMs: 10, maxMs: 60 }));
	assert.deepEqual(events.map((e) => e.type), ['conversation-reset']);
	assert.ok(comments.length >= 2, `expected heartbeats, got ${comments.length}`);
});

test('a dropped client stops the snapshot loop', async () => {
	const engine = engineOf([{ revision: 1, messages: [question], submissions: [{ id: 's2', text: 'Synthetic question' }] }]);
	const reader = conversationEvents(engine, 'c', new AbortController().signal, fast).getReader();
	await reader.read();
	await reader.cancel();
	const calls = engine.calls;
	await new Promise((resolve) => setTimeout(resolve, 30));
	assert.ok(engine.calls <= calls + 1, 'no polling after cancel');
});

test('the bridge serves events as an uncached event stream', async () => {
	const app = new Hono();
	mountBrowserBridge(app, engineOf([{ revision: 1, messages: [earlier, earlierReply], submissions: [done] }]),
		async () => { throw new Error('Event reads must not resolve credentials'); });
	const response = await app.request('/c/events');
	assert.equal(response.status, 200);
	assert.equal(response.headers.get('Content-Type'), 'text/event-stream');
	assert.equal(response.headers.get('Cache-Control'), 'no-store');
	assert.deepEqual((await frames(response.body!)).events.map((e) => e.type), ['conversation-reset']);
});
