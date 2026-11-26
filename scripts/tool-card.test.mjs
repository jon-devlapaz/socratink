import assert from 'node:assert/strict';
import test from 'node:test';
import {
	applyToolStreamEvent,
	formatToolOutput,
	toolStateLabel,
	toolsFromParts,
	visibleCardTools,
	visibleToolOutput,
} from '../src/ui/tool-state.ts';

test('projects dynamic-tool parts into name, state, and output', () => {
	assert.deepEqual(
		toolsFromParts([
			{ type: 'text', text: 'aside', state: 'done' },
			{
				type: 'dynamic-tool',
				toolName: 'present_question',
				toolCallId: 'call_1',
				state: 'input-available',
				input: { kind: 'question' },
			},
			{
				type: 'dynamic-tool',
				toolName: 'trace_code',
				toolCallId: 'call_2',
				state: 'output-available',
				input: { path: 'app.ts' },
				output: { ok: true },
			},
			{
				type: 'dynamic-tool',
				toolName: 'verify',
				toolCallId: 'call_3',
				state: 'output-error',
				input: {},
				errorText: 'timeout',
			},
		]),
		[
			{ id: 'call_1', name: 'present_question', state: 'running' },
			{
				id: 'call_2',
				name: 'trace_code',
				state: 'done',
				output: '{\n  "ok": true\n}',
			},
			{
				id: 'call_3',
				name: 'verify',
				state: 'failed',
				output: 'timeout',
			},
		],
	);
});

test('stream events advance one tool from running to done or failed', () => {
	const calls = [];
	assert.equal(
		applyToolStreamEvent(calls, {
			type: 'tool-input',
			conversationId: 'c',
			messageId: 'm',
			toolCallId: 'call_1',
			toolName: 'present_question',
			input: {},
		}),
		true,
	);
	assert.deepEqual(calls, [{ id: 'call_1', name: 'present_question', state: 'running' }]);
	assert.equal(
		applyToolStreamEvent(calls, {
			type: 'tool-output',
			conversationId: 'c',
			toolCallId: 'call_1',
			output: 'Question presented on the card.',
		}),
		true,
	);
	assert.deepEqual(calls, [
		{
			id: 'call_1',
			name: 'present_question',
			state: 'done',
			output: 'Question presented on the card.',
		},
	]);
	assert.equal(
		applyToolStreamEvent(calls, {
			type: 'message-delta',
			conversationId: 'c',
			messageId: 'm',
			kind: 'text',
			delta: 'hi',
		}),
		false,
	);
});

test('a late input event does not reopen a settled tool', () => {
	const calls = [
		{ id: 'call_1', name: 'present_question', state: 'done', output: 'shown' },
	];
	assert.equal(
		applyToolStreamEvent(calls, {
			type: 'tool-input',
			conversationId: 'c',
			messageId: 'm',
			toolCallId: 'call_1',
			toolName: 'present_question',
			input: {},
		}),
		false,
	);
	assert.equal(calls[0]?.state, 'done');
});

for (const [name, input, expected] of [
	['plain text', 'plain', 'plain'], ['object output', { a: 1 }, '{\n  "a": 1\n}'],
	['null', null, ''], ['undefined', undefined, ''], ['a bigint', 7n, '7'],
]) {
	test(`formatToolOutput with ${name}`, () => assert.equal(formatToolOutput(input), expected));
}

for (const size of [7_999, 8_000, 8_001]) {
	test(`formatToolOutput with ${size} characters`, () => {
		const input = 'a'.repeat(size);
		assert.equal(formatToolOutput(input), size === 8_001 ? 'a'.repeat(8_000) + '\n…' : input);
	});
}

for (const [state, label] of [['running', 'Running'], ['done', 'Done'], ['failed', 'Failed']]) {
	test(`toolStateLabel for ${state}`, () => assert.equal(toolStateLabel(state), label));
}

test('a failure received before its input shows the error under a generic tool name', () => {
	const calls = [];
	const event = { type: 'tool-output-error', toolCallId: 'lost-input', errorText: 'Try again.' };
	assert.equal(applyToolStreamEvent(calls, event), true);
	assert.deepEqual(calls, [{ id: 'lost-input', name: 'tool', state: 'failed', output: 'Try again.' }]);
	assert.equal(applyToolStreamEvent(calls, event), false);
});

test('a failed question tool still shows the error', () => {
	assert.equal(visibleToolOutput({ id: 'q', name: 'present_question', state: 'failed', output: 'Missing choice.' }), 'Missing choice.');
});

test('a tool with no output has nothing to show', () => {
	assert.equal(visibleToolOutput({ id: 't', name: 'trace', state: 'running' }), undefined);
});

test('keeps present_question output off the card once the form is up', () => {
	assert.equal(
		visibleToolOutput({
			id: 'call_1',
			name: 'present_question',
			state: 'done',
			output: 'Question presented on the card.',
		}),
		undefined,
	);
	assert.equal(
		visibleToolOutput({
			id: 'call_2',
			name: 'trace_code',
			state: 'done',
			output: '{\n  "ok": true\n}',
		}),
		'{\n  "ok": true\n}',
	);
	assert.equal(
		visibleToolOutput({
			id: 'call_3',
			name: 'verify',
			state: 'failed',
			output: 'timeout',
		}),
		'timeout',
	);
	assert.equal(
		visibleToolOutput({
			id: 'call_4',
			name: 'mark_reveal',
			state: 'done',
			output: 'Reveal recorded.',
		}),
		undefined,
	);
});

test('keeps mark_reveal off the card, and present_question once the form is up', () => {
	const reveal = {
		id: 'call_reveal',
		name: 'mark_reveal',
		state: 'done',
		output: 'Reveal recorded.',
	};
	const question = {
		id: 'call_q',
		name: 'present_question',
		state: 'done',
		output: 'Question presented on the card.',
	};
	const trace = {
		id: 'call_trace',
		name: 'trace_code',
		state: 'done',
		output: 'ok',
	};
	assert.deepEqual(visibleCardTools([reveal, question, trace]), [question, trace]);
	assert.deepEqual(visibleCardTools([reveal, question, trace], { questionnaire: { kind: 'question' } }), [
		trace,
	]);
});
