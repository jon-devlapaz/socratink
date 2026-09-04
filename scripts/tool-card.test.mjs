import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
	applyToolStreamEvent,
	formatToolOutput,
	toolStateLabel,
	toolsFromParts,
	visibleCardTools,
	visibleToolOutput,
} from '../src/ui/tool-card.ts';

test('projects Flue dynamic-tool parts into name, state, and output', () => {
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
				durationMs: 12,
			},
			{
				type: 'dynamic-tool',
				toolName: 'verify',
				toolCallId: 'call_3',
				state: 'output-error',
				input: {},
				errorText: 'timeout',
				durationMs: 1500,
			},
		]),
		[
			{ id: 'call_1', name: 'present_question', state: 'running' },
			{
				id: 'call_2',
				name: 'trace_code',
				state: 'done',
				output: '{\n  "ok": true\n}',
				durationMs: 12,
			},
			{
				id: 'call_3',
				name: 'verify',
				state: 'failed',
				output: 'timeout',
				durationMs: 1500,
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
			position: { batch: 1, index: 0 },
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
			durationMs: 4,
			position: { batch: 2, index: 0 },
		}),
		true,
	);
	assert.deepEqual(calls, [
		{
			id: 'call_1',
			name: 'present_question',
			state: 'done',
			output: 'Question presented on the card.',
			durationMs: 4,
		},
	]);
	assert.equal(
		applyToolStreamEvent(calls, {
			type: 'message-delta',
			conversationId: 'c',
			messageId: 'm',
			kind: 'text',
			delta: 'hi',
			position: { batch: 3, index: 0 },
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
			position: { batch: 1, index: 0 },
		}),
		false,
	);
	assert.equal(calls[0]?.state, 'done');
});

test('formats object output as JSON and labels each execution state', () => {
	assert.equal(formatToolOutput('plain'), 'plain');
	assert.equal(formatToolOutput({ a: 1 }), '{\n  "a": 1\n}');
	assert.equal(toolStateLabel('running'), 'Running');
	assert.equal(toolStateLabel('done'), 'Done');
	assert.equal(toolStateLabel('failed'), 'Failed');
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

test('the live card mounts tool calls from history parts and admission stream events', async () => {
	const turnsSource = await readFile(new URL('../src/ui/chat-turns.ts', import.meta.url), 'utf8');
	const turnSource = await readFile(new URL('../src/ui/turn-view.ts', import.meta.url), 'utf8');
	const surfaceSource = await readFile(new URL('../src/ui/chat-surface.ts', import.meta.url), 'utf8');
	const conversationSource = await readFile(
		new URL('../src/ui/client/conversation.ts', import.meta.url),
		'utf8',
	);
	assert.match(turnsSource, /toolsFromParts\(message\.parts\)/);
	assert.match(turnsSource, /visibleCardTools\(/);
	assert.match(turnSource, /createToolList\(item\.tools\)/);
	assert.match(turnSource, /createToolList\(tools\)/);
	assert.match(surfaceSource, /applyToolStreamEvent\(liveTools, event\)/);
	assert.match(surfaceSource, /isQuietToolStreamEvent\(event, quietToolIds\)/);
	assert.match(surfaceSource, /visibleCardTools\(liveTools/);
	assert.match(surfaceSource, /\.\.\.\(tools\.length \? \{ tools \} : \{\}\)/);
	assert.match(conversationSource, /onEvent\?: \(event: ConversationStreamChunk\) => void/);
	assert.match(conversationSource, /\.\.\.\(onEvent \? \{ onEvent \} : \{\}\)/);
	const cssSource = await readFile(new URL('../src/ui/tool-card.css', import.meta.url), 'utf8');
	assert.doesNotMatch(cssSource, /\.tool-card \{[^}]*box-shadow/);
	assert.doesNotMatch(cssSource, /\.tool-card \{[^}]*background:/);
});
