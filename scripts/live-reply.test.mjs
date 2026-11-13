import assert from 'node:assert/strict';
import test from 'node:test';
import { replyFrom } from '../src/config/chat-wire.ts';
import { initialProgress, progressEvents } from '../src/server/durable/browser-events.ts';
import { project } from '../src/server/durable/browser-projection.ts';
import { formatQuestionnaireAnswers } from '../src/questionnaire.ts';
import { learnerVisibleAssistantText } from '../src/ui/assistant-text.ts';
import { createLiveReply } from '../src/ui/live-reply.ts';

// Failure cases: live text differs from the settled reply; a half-arrived
// marker flashes; reasoning or other event kinds leak into the text; supplied
// content shows without its mark.
const learner = 'Synthetic question';
const question = { role: 'user', submissionId: 's1', text: learner };
const pending = [{ id: 's1', text: learner }];

function fold(live, events) {
	for (const event of events) live.apply(event);
	return live.view();
}

function delta(delta, messageId = 's1:assistant', kind = 'text') {
	return { type: 'message-delta', messageId, kind, delta };
}

test('live text from the server events equals the settled reply text, across text, tool call, text', () => {
	const tool = { id: 't1', name: 'lookup', input: {}, state: 'done', output: 'ok' };
	const states = [
		{ text: '«DIAGNOSTIC» Fir' },
		{ text: '«DIAGNOSTIC» First part.', tools: [{ ...tool, state: 'running' }] },
		{ text: '«DIAGNOSTIC» First part.\n\nSecond **part**', tools: [tool] },
		{ text: '«DIAGNOSTIC» First part.\n\nSecond **part**.', tools: [tool] },
	];
	const progress = initialProgress();
	const live = createLiveReply(learner);
	const seen = [];
	for (const [revision, reply] of states.entries()) {
		const snapshot = project('c', { revision, messages: [question, { role: 'assistant', submissionId: 's1', ...reply }], submissions: pending });
		seen.push(fold(live, progressEvents(snapshot, progress)).markdown);
	}
	const settled = project('c', { revision: 9, messages: [question, { role: 'assistant', submissionId: 's1', ...states.at(-1) }],
		submissions: [{ ...pending[0], outcome: 'completed' }] });
	const final = learnerVisibleAssistantText(replyFrom(settled, 's1').text);
	assert.deepEqual(seen, ['Fir', 'First part.', 'First part.\n\nSecond **part**', final]);
	assert.equal(final, 'First part.\n\nSecond **part**.');
});

test('a reply of several messages shows its last, as the settled reply does', () => {
	const live = createLiveReply(learner);
	const view = fold(live, [
		{ type: 'message-started', messageId: 'm1' }, delta('Earlier message.', 'm1'),
		{ type: 'message-started', messageId: 'm2' },
	]);
	assert.equal(view.markdown, '');
	const snapshot = { messages: [
		{ id: 'm1', role: 'assistant', submissionId: 's1', parts: [{ type: 'text', text: 'Earlier message.', state: 'done' }] },
		{ id: 'm2', role: 'assistant', submissionId: 's1', parts: [{ type: 'text', text: 'Last message.', state: 'done' }] },
	] };
	assert.equal(fold(live, [delta('Last message.', 'm2'), delta(' More.', 'm1')]).markdown, replyFrom(snapshot, 's1').text);
});

test('leading markers are stripped when complete and held while half-arrived', () => {
	const steps = [
		['«', ''], ['DIAG', ''], ['NOSTIC', ''], ['»', ''], [' ', ''], ['«', ''], ['RE', ''], ['VIEW» ', ''],
		['What', 'What'], [' do you «think»?', 'What do you «think»?'],
	];
	const live = createLiveReply(learner);
	for (const [chunk, shown] of steps) {
		live.apply(delta(chunk));
		assert.equal(live.view().markdown, shown, `after ${JSON.stringify(chunk)}`);
	}
	assert.equal(fold(createLiveReply(learner), [delta('No marker at all.')]).markdown, 'No marker at all.');
	assert.equal(fold(createLiveReply(learner), [delta('«not a marker')]).markdown, '«not a marker');
});

test('only text deltas reach the learner; reasoning and other events do not', () => {
	const live = createLiveReply(learner);
	const changed = [
		delta('Private verdict', 's1:assistant', 'reasoning'),
		{ type: 'tool-input', messageId: 's1:assistant', toolCallId: 't1', toolName: 'present_question', input: {} },
		{ type: 'tool-output', toolCallId: 't1', output: 'Question presented on the card.' },
		{ type: 'submission-settled', submissionId: 's1', outcome: 'completed' },
	].map((event) => live.apply(event));
	assert.deepEqual(changed, [false, false, false, false]);
	assert.deepEqual(live.view(), { markdown: '' });
	live.apply(delta('Visible.'));
	assert.deepEqual(live.view(), { markdown: 'Visible.' });
});

test('a mark_reveal call marks the live text as soon as it arrives', () => {
	const live = createLiveReply(learner);
	const reveal = { type: 'tool-input', messageId: 's1:assistant', toolCallId: 'r1', toolName: 'mark_reveal',
		input: { kind: 'worked_example', target: '  Recover a dropped stream  ' } };
	assert.equal(live.apply(reveal), true);
	assert.deepEqual(fold(live, [delta('Here is one way.')]), {
		markdown: 'Here is one way.', reveal: { kind: 'worked_example', target: 'Recover a dropped stream' },
	});
	const invalid = createLiveReply(learner);
	assert.equal(invalid.apply({ ...reveal, toolCallId: 'r2', input: { kind: 'score' } }), false, 'a failing call records nothing');
	assert.deepEqual(fold(invalid, [delta('Ordinary feedback.')]), { markdown: 'Ordinary feedback.' });
});

test('text the server would still check for an unmarked reveal waits for the mark', () => {
	const card = { items: [{ name: 'item', prompt: 'Which request reuses the key?', choices: [] }] };
	const help = formatQuestionnaireAnswers(card, [{ name: 'item', values: [], help: 'hint' }]);
	for (const learnerText of [help, 'Honestly I do not know.']) {
		const live = createLiveReply(learnerText);
		assert.deepEqual(fold(live, [delta('Think about what the provider saw.')]), { markdown: '' });
		live.apply({ type: 'tool-input', messageId: 's1:assistant', toolCallId: 'r1', toolName: 'mark_reveal', input: { kind: 'hint' } });
		assert.deepEqual(live.view(), { markdown: 'Think about what the provider saw.', reveal: { kind: 'hint' } });
	}
});

test('a reveal cue mid-stream freezes the text already shown until the mark arrives', () => {
	const cue = createLiveReply(learner);
	assert.deepEqual(fold(cue, [delta('Close. ')]), { markdown: 'Close. ' });
	assert.deepEqual(fold(cue, [delta('The key idea is reuse.')]), { markdown: 'Close. ' }, 'the cue holds: no vanishing, no growth');
	assert.deepEqual(fold(cue, [delta(' Keep the same key.')]), { markdown: 'Close. ' }, 'still frozen while more text arrives');
	cue.apply({ type: 'tool-input', messageId: 's1:assistant', toolCallId: 'r1', toolName: 'mark_reveal', input: { kind: 'partial' } });
	assert.deepEqual(cue.view(), {
		markdown: 'Close. The key idea is reuse. Keep the same key.', reveal: { kind: 'partial' },
	}, 'the mark resumes the full text, marked');
});

test('a turn held from its start still shows nothing', () => {
	const card = { items: [{ name: 'item', prompt: 'Which request reuses the key?', choices: [] }] };
	const help = formatQuestionnaireAnswers(card, [{ name: 'item', values: [], help: 'unknown' }]);
	for (const learnerText of [help, 'Just tell me the answer.']) {
		const live = createLiveReply(learnerText);
		for (const chunk of ['Here', ' is', ' the whole answer.']) {
			assert.deepEqual(fold(live, [delta(chunk)]), { markdown: '' }, learnerText);
		}
	}
});
