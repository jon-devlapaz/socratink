import assert from 'node:assert/strict';
import test from 'node:test';
import { revealFromReply } from '../src/reveal.ts';
import { visibleTurnsFromHistory } from '../src/ui/chat-turns.ts';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { JSDOM } from 'jsdom';
import { ActiveTurn, HistoryStep, PendingTurn } from '../src/ui/turn-view.tsx';

// Failure cases: lost history metadata, wrong kind, learner/neighbor spillover,
// invalid metadata, missing accessible copy, and marks absent from either view.
const kinds = { hint: 'hint', worked_example: 'example', partial: 'partial', full_answer: 'answer' };
const message = (role, text, reveal) => ({
	display: 'visible', role,
	parts: [{ type: 'text', text }, ...(reveal ? [{ type: 'data-reveal', data: reveal }] : [])],
});

for (const [kind, word] of Object.entries(kinds)) {
	test(`${kind} survives history and labels active and earlier supplied text`, () => {
		const reveal = { kind };
		const turns = visibleTurnsFromHistory({ settlements: [], messages: [
			message('user', 'My own words', reveal),
			message('assistant', 'Supplied text', reveal),
			message('assistant', 'Ordinary feedback'),
			message('assistant', 'Invalid reveal', { kind: 'score' }),
		] });
		assert.deepEqual(turns.map((turn) => turn.reveal), [undefined, reveal, undefined, undefined]);
		for (const turn of turns) {
			for (const root of renderViews(turn)) {
				const marks = root.querySelectorAll('.reveal-mark');
				assert.equal(marks.length, turn.reveal ? 1 : 0);
				if (!turn.reveal) continue;
				assert.equal(marks[0].textContent, word);
				assert.equal(marks[0].getAttribute('aria-hidden'), 'true');
				const article = ['example', 'answer'].includes(word) ? 'an' : 'a';
				assert.equal(root.querySelector('.reveal-copy .sr-only').textContent, `Socratink supplied ${article} ${word}.`);
			}
		}
		const pending = render(PendingTurn, { view: { markdown: 'Supplied text', reveal }, tools: [], onCancel() {}, cancelDisabled: false });
		assert.equal(pending.querySelector('.turn-markdown[aria-hidden=true] .reveal-mark').textContent, word);
	});
}

// Failure cases: an answered card-only turn shows an empty body, or a learner
// turn shows the message sent to the tutor instead of the learner's words.
test('an answered card shows its question and the answer shows as the learner\'s', () => {
	const card = { kind: 'question', submitLabel: 'Submit', items: [{
		name: 'q', prompt: 'Which request has the provider seen?', required: true, multiple: false,
		choices: [{ value: 'a', label: 'The first' }, { value: 'b', label: 'The retry' }],
	}] };
	const turns = visibleTurnsFromHistory({ settlements: [], messages: [
		{ display: 'visible', role: 'assistant', parts: [{ type: 'data-questionnaire', data: card }] },
		message('user', 'Questionnaire answers:\n- Which request has the provider seen?: The first, it arrived'),
	] });
	for (const root of renderViews(turns[0])) {
		assert.match(root.textContent, /Which request has the provider seen\?/);
		assert.equal(root.querySelectorAll('.reveal-mark').length, 0);
	}
	for (const root of renderViews(turns[1])) {
		assert.match(root.textContent, /The first, it arrived/);
		assert.doesNotMatch(root.textContent, /Questionnaire answers|Which request/);
	}
});

test('earlier steps preserve the learner’s literal symbols and line breaks', () => {
	const words = '# My calculation\n\n3 * 4 * 5 = 60';
	const [turn] = visibleTurnsFromHistory({ settlements: [], messages: [message('user', words)] });
	assert.equal(render(HistoryStep, { step: [turn], index: 0 }).querySelector('p').textContent, words);
});

test('completed replies use the last validated reveal write', () => {
	assert.equal(revealFromReply(undefined), undefined);
	assert.equal(revealFromReply({ reveal: [] }), undefined);
	assert.deepEqual(revealFromReply({ reveal: [{ kind: 'hint' }, { kind: 'full_answer' }] }), { kind: 'full_answer' });
	assert.equal(revealFromReply({ reveal: [{ kind: 'hint' }, { kind: 'score' }] }), undefined);
});

function render(component, props) {
	return JSDOM.fragment(renderToStaticMarkup(createElement(component, props)));
}

function renderViews(turn) {
	return [
		render(ActiveTurn, { item: turn, onQuestionnaireSubmit() {}, onSteer() {} }),
		render(HistoryStep, { step: [turn], index: 0 }),
	];
}
