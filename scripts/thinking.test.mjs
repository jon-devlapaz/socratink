import assert from 'node:assert/strict';
import test from 'node:test';
import { initialProgress, progressEvents } from '../src/server/durable/browser-events.ts';
import { project } from '../src/server/durable/browser-projection.ts';

// Raw reasoning can state the verdict before the learner sees the answer.
const reasoning = 'This is actually correct! The user said light reactions.';
const question = { role: 'user', submissionId: 's1', text: 'Synthetic answer' };
const reply = (text) => ({ role: 'assistant', submissionId: 's1', text, reasoning });

test('the browser snapshot never carries raw model reasoning, pending or settled', () => {
	for (const outcome of [undefined, 'completed']) {
		const snapshot = project('c', { revision: 1, messages: [question, reply('Close.')],
			submissions: [{ id: 's1', text: 'Synthetic answer', ...(outcome ? { outcome } : {}) }] });
		assert.deepEqual(snapshot.messages[1].parts, [{ type: 'text', text: 'Close.', state: outcome ? 'done' : 'streaming' }]);
		assert.equal(JSON.stringify(snapshot).includes(reasoning), false);
	}
});

test('live events stream reply text only, even while reasoning arrives first', () => {
	const progress = initialProgress();
	const pending = [{ id: 's1', text: 'Synthetic answer' }];
	const events = [
		...progressEvents(project('c', { revision: 1, messages: [question, reply('')], submissions: pending }), progress),
		...progressEvents(project('c', { revision: 2, messages: [question, reply('Close.')], submissions: pending }), progress),
	];
	assert.deepEqual(events.map((e) => e.type), ['message-started', 'message-delta']);
	assert.equal(events[1].kind, 'text');
	assert.equal(JSON.stringify(events).includes(reasoning), false);
});

test('a reveal call reaches the browser before the text it labels, even in one poll', () => {
	const progress = initialProgress();
	const pending = [{ id: 's1', text: 'Synthetic answer' }];
	const tools = [{ id: 'r1', name: 'mark_reveal', input: { kind: 'hint' }, state: 'done', output: 'Reveal recorded.' }];
	const events = progressEvents(project('c', { revision: 1, messages: [question, { ...reply('A supplied hint.'), tools }], submissions: pending }), progress);
	assert.deepEqual(events.map((e) => e.type), ['message-started', 'tool-input', 'tool-output', 'message-delta']);
});
