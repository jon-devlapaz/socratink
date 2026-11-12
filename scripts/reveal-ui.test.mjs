import assert from 'node:assert/strict';
import test from 'node:test';
import { revealFromReply } from '../src/reveal.ts';
import { visibleTurnsFromHistory } from '../src/ui/chat-turns.ts';
import { createActiveTurn, createHistoryStep } from '../src/ui/turn-view.ts';

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
		withDocument(() => {
			const sinks = { trackRenderer() {} };
			const handlers = { onQuestionnaireSubmit() {}, onSteer() {} };
			for (const turn of turns) {
				const active = createActiveTurn(turn, {}, sinks, handlers);
				const history = createHistoryStep([turn], 0);
				for (const root of [active, history]) {
					const marks = descendants(root).filter((node) => node.className === 'reveal-mark');
					assert.equal(marks.length, turn.reveal ? 1 : 0);
					if (!turn.reveal) continue;
					assert.equal(marks[0].textContent, word);
					assert.equal(marks[0].attributes['aria-hidden'], 'true');
					const article = ['example', 'answer'].includes(word) ? 'an' : 'a';
					assert.ok(descendants(root).some((node) =>
						node.className === 'sr-only' && node.textContent === `Socratink supplied ${article} ${word}.`));
					assert.ok(descendants(root).some((node) => node.className.includes('reveal-copy')));
				}
			}
		});
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
	withDocument(() => {
		const sinks = { trackRenderer() {} };
		const handlers = { onQuestionnaireSubmit() {}, onSteer() {} };
		const text = (root) => descendants(root).map((node) => node.textContent).join(' ');
		for (const root of [createActiveTurn(turns[0], {}, sinks, handlers), createHistoryStep([turns[0]], 0)]) {
			assert.match(text(root), /Which request has the provider seen\?/);
			assert.equal(descendants(root).filter((node) => node.className === 'reveal-mark').length, 0);
		}
		for (const root of [createActiveTurn(turns[1], {}, sinks, handlers), createHistoryStep([turns[1]], 0)]) {
			assert.match(text(root), /The first, it arrived/);
			assert.doesNotMatch(text(root), /Questionnaire answers|Which request/);
		}
	});
});

test('completed replies use the last validated reveal write', () => {
	assert.equal(revealFromReply(undefined), undefined);
	assert.equal(revealFromReply({ reveal: [] }), undefined);
	assert.deepEqual(revealFromReply({ reveal: [{ kind: 'hint' }, { kind: 'full_answer' }] }), { kind: 'full_answer' });
	assert.equal(revealFromReply({ reveal: [{ kind: 'hint' }, { kind: 'score' }] }), undefined);
});

class Element {
	className = '';
	textContent = '';
	children = [];
	attributes = {};
	classList = { add: (name) => { this.className += ` ${name}`; } };
	append(...nodes) { this.children.push(...nodes); }
	prepend(...nodes) { this.children.unshift(...nodes); }
	replaceChildren(...nodes) { this.children = nodes; }
	setAttribute(name, value) { this.attributes[name] = value; }
}
function descendants(node) {
	return [node, ...(node.children ?? []).flatMap(descendants)];
}
function withDocument(run) {
	const previous = globalThis.document;
	globalThis.document = {
		createElement: () => new Element(),
		createTextNode: (text) => Object.assign(new Element(), { textContent: text }),
	};
	try { run(); } finally {
		if (previous === undefined) delete globalThis.document;
		else globalThis.document = previous;
	}
}
