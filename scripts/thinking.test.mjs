import assert from 'node:assert/strict';
import test from 'node:test';
import { initialProgress, progressEvents } from '../src/server/durable/browser-events.ts';
import { project } from '../src/server/durable/browser-projection.ts';

// Raw reasoning can state the verdict before the learner sees the answer.
const reasoning = 'This is actually correct! The user said light reactions.';
const question = { role: 'user', submissionId: 's1', text: 'Synthetic answer' };
const reply = (text) => ({ role: 'assistant', submissionId: 's1', text, reasoning });

for (const [name, outcome, state] of [['pending', undefined, 'streaming'], ['settled', 'completed', 'done']]) {
	test(`the ${name} browser snapshot contains only public message and settlement fields`, () => {
		const snapshot = project('c', { revision: 1, messages: [question, reply('Close.')],
			submissions: [{ id: 's1', text: 'Synthetic answer', ...(outcome ? { outcome } : {}) }] });
		assert.deepEqual(snapshot, {
			v: 1, conversationId: 'c',
			messages: [
				{ id: 's1:user', role: 'user', display: 'visible', submissionId: 's1', parts: [{ type: 'text', text: 'Synthetic answer', state }] },
				{ id: 's1:assistant', role: 'assistant', display: 'visible', submissionId: 's1', parts: [{ type: 'text', text: 'Close.', state }] },
			],
			settlements: outcome ? [{ submissionId: 's1', outcome }] : [],
		});
	});
}

test('live events stream reply text only, even while reasoning arrives first', () => {
	const progress = initialProgress();
	const pending = [{ id: 's1', text: 'Synthetic answer' }];
	const events = [
		...progressEvents(project('c', { revision: 1, messages: [question, reply('')], submissions: pending }), progress),
		...progressEvents(project('c', { revision: 2, messages: [question, reply('Close.')], submissions: pending }), progress),
	];
	assert.deepEqual(events, [
		{ type: 'message-started', messageId: 's1:assistant', submissionId: 's1' },
		{ type: 'message-delta', messageId: 's1:assistant', kind: 'text', delta: 'Close.' },
	]);
});

test('a reveal call reaches the browser before the text it labels, even in one poll', () => {
	const progress = initialProgress();
	const pending = [{ id: 's1', text: 'Synthetic answer' }];
	const tools = [{ id: 'r1', name: 'mark_reveal', input: { kind: 'hint' }, state: 'done', output: 'Reveal recorded.' }];
	const events = progressEvents(project('c', { revision: 1, messages: [question, { ...reply('A supplied hint.'), tools }], submissions: pending }), progress);
	assert.deepEqual(events, [
		{ type: 'message-started', messageId: 's1:assistant', submissionId: 's1' },
		{ type: 'tool-input', messageId: 's1:assistant', toolCallId: 'r1', toolName: 'mark_reveal', input: { kind: 'hint' } },
		{ type: 'tool-output', toolCallId: 'r1', output: 'Reveal recorded.' },
		{ type: 'message-delta', messageId: 's1:assistant', kind: 'text', delta: 'A supplied hint.' },
	]);
});

test('a failed tool sends its error once across repeated polls', () => {
	const tool = { id: 't', name: 'present_question', state: 'done', isError: true, input: {}, output: 'Missing choices.' };
	const snapshot = project('c', {
		revision: 2, messages: [{ ...reply(''), tools: [tool] }], submissions: [{ id: 's1', text: 'Synthetic answer' }],
	});
	const progress = initialProgress();
	assert.deepEqual(progressEvents(snapshot, progress), [
		{ type: 'message-started', messageId: 's1:assistant', submissionId: 's1' },
		{ type: 'tool-input', messageId: 's1:assistant', toolCallId: 't', toolName: 'present_question', input: {} },
		{ type: 'tool-output-error', toolCallId: 't', errorText: 'Missing choices.' },
	]);
	assert.deepEqual(progressEvents(snapshot, progress), []);
});
