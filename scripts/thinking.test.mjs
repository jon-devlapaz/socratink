import assert from 'node:assert/strict';
import test from 'node:test';
import {
	applyReasoningStreamEvent,
	createLiveReasoning,
	pendingThinkingFallback,
	resetLiveReasoning,
	visibleThinkingStep,
} from '../src/ui/thinking.ts';

test('reasoning deltas append into the live buffer and ignore other stream kinds', () => {
	const buffer = createLiveReasoning();
	assert.equal(
		applyReasoningStreamEvent(buffer, {
			type: 'message-delta',
			conversationId: 'c',
			messageId: 'm',
			kind: 'text',
			delta: 'answer',
			position: { batch: 1, index: 0 },
		}),
		false,
	);
	assert.equal(buffer.text, '');
	assert.equal(
		applyReasoningStreamEvent(buffer, {
			type: 'message-delta',
			conversationId: 'c',
			messageId: 'm',
			kind: 'reasoning',
			delta: 'Check the constraint. ',
			position: { batch: 1, index: 1 },
		}),
		true,
	);
	assert.equal(
		applyReasoningStreamEvent(buffer, {
			type: 'message-delta',
			conversationId: 'c',
			messageId: 'm',
			kind: 'reasoning',
			delta: 'Ask one question.',
			position: { batch: 1, index: 2 },
		}),
		true,
	);
	assert.equal(buffer.text, 'Check the constraint. Ask one question.');
	assert.equal(visibleThinkingStep(buffer.text), 'Check the constraint. Ask one question.');
	assert.equal(visibleThinkingStep(''), pendingThinkingFallback);
});

test('caps streamed reasoning instead of growing without bound', () => {
	const buffer = createLiveReasoning();
	assert.equal(
		applyReasoningStreamEvent(buffer, {
			type: 'message-delta',
			conversationId: 'c',
			messageId: 'm',
			kind: 'reasoning',
			delta: 'x'.repeat(8_010),
			position: { batch: 1, index: 0 },
		}),
		true,
	);
	assert.equal(buffer.text.length, 8_002);
	assert.match(buffer.text, /…$/);
	assert.equal(
		applyReasoningStreamEvent(buffer, {
			type: 'message-delta',
			conversationId: 'c',
			messageId: 'm',
			kind: 'reasoning',
			delta: 'more',
			position: { batch: 1, index: 1 },
		}),
		false,
	);
	resetLiveReasoning(buffer);
	assert.equal(buffer.text, '');
	assert.equal(buffer.truncated, false);
});
