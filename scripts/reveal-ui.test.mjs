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
