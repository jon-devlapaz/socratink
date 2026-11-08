import assert from 'node:assert/strict';
import test from 'node:test';
import { createActiveTurn } from '../src/ui/turn-view.ts';

const source = '**Retrieval**: Producing an answer from memory.\n\n**Feedback**: Information about an attempt.';
const nodes = (root) => [root, ...root.children.flatMap(nodes)];
const find = (root, name) => nodes(root).find((node) => node.className === name);
const button = (root, label) => nodes(root).find((node) => node.tag === 'button' && node.textContent === label);

class Element {
	constructor(tag) { this.tag = tag; }
	className = '';
	textContent = '';
	children = [];
	attributes = {};
	dataset = {};
	listeners = {};
	value = '';
	hidden = false;
	classList = { add: (name) => { this.className += ` ${name}`; } };
	append(...nodes) { this.children.push(...nodes); }
	prepend(...nodes) { this.children.unshift(...nodes); }
	replaceChildren(...nodes) { this.children = nodes; }
	setAttribute(name, value) { this.attributes[name] = value; }
	addEventListener(name, fn) { this.listeners[name] = fn; }
	focus() { document.activeElement = this; }
	click() { if (!this.disabled && !this.hidden) this.listeners.click?.(); }
}

function withDocument(run) {
	const original = Object.getOwnPropertyDescriptors(globalThis);
	const forbidden = () => { throw new Error('Recall must not call models, persist or schedule work'); };
	globalThis.document = {
		createElement: (tag) => new Element(tag),
		createElementNS: (_ns, tag) => new Element(tag),
		createTextNode: (text) => Object.assign(new Element('text'), { textContent: text }),
	};
	for (const name of ['fetch', 'setTimeout', 'setInterval', 'localStorage', 'sessionStorage', 'indexedDB']) {
		Object.defineProperty(globalThis, name, { configurable: true, value: forbidden });
	}
	try { run(); } finally {
		for (const name of ['document', 'fetch', 'setTimeout', 'setInterval', 'localStorage', 'sessionStorage', 'indexedDB']) {
			if (original[name]) Object.defineProperty(globalThis, name, original[name]);
			else delete globalThis[name];
		}
	}
}

function turn(text = source, options = { steering: true }) {
	return createActiveTurn({ role: 'Assistant', text }, options, { trackRenderer() {} }, {
		onQuestionnaireSubmit() { assert.fail('Recall must not submit a questionnaire'); },
		onSteer() { assert.fail('Recall must not request a model turn'); },
	});
}

test('production turn offers private recall, then immediate reference comparison, then the next term', () => withDocument(() => {
	const root = turn();
	button(root, 'Recall terms').click();
	const recall = find(root, 'recall-session');
	assert.equal(recall.dataset.active, 'true');
	assert.equal(find(root, 'recall-term').textContent, 'Retrieval');
	assert.equal(find(root, 'recall-reference'), undefined, 'the reference must not exist before reveal');
	assert.equal(button(root, 'Next term'), undefined);
	const attempt = find(root, 'recall-attempt');
	assert.equal(document.activeElement, attempt);
	attempt.value = 'Remembering without looking';
	button(root, 'Reveal reference').click();
	assert.equal(find(root, 'recall-reference').textContent, 'Producing an answer from memory.');
	assert.equal(attempt.value, 'Remembering without looking');
	assert.equal(attempt.readOnly, true, 'the pre-reveal attempt must stay unchanged');
	assert.equal(document.activeElement, button(root, 'Next term'));
	button(root, 'Next term').click();
	assert.equal(find(root, 'recall-term').textContent, 'Feedback');
	assert.equal(find(root, 'recall-reference'), undefined);
	assert.equal(find(root, 'recall-attempt').value, '');
	button(root, 'Reveal reference').click();
	assert.equal(find(root, 'recall-reference').textContent, 'Information about an attempt.');
	button(root, 'Finish recall').click();
	assert.equal(recall.dataset.active, undefined);
	assert.equal(document.activeElement, button(root, 'Recall terms'));
	button(root, 'Recall terms').click();
	assert.equal(find(root, 'recall-attempt').value, '', 'a new practice has no retained attempt');
	button(root, 'Back to conversation').click();
	assert.equal(recall.dataset.active, undefined);
}));

test('completion and early exit create no scheduled work, persistence, model calls, scores or questionnaire state', () => withDocument(() => {
	const root = turn();
	button(root, 'Recall terms').click();
	const recall = find(root, 'recall-session');
	assert.deepEqual(Object.keys(recall.dataset), ['active']);
	for (let index = 0; index < 2; index++) {
		button(root, 'Reveal reference').click();
		assert.doesNotMatch(nodes(recall).map((node) => node.textContent).join(' '), /mastered|correct!|score|tomorrow|scheduled/i);
		button(root, index === 0 ? 'Next term' : 'Finish recall').click();
	}
	assert.deepEqual(recall.dataset, {});
	assert.equal(nodes(recall).filter((node) => node.tag === 'textarea').length, 0);
	assert.equal(nodes(root).some((node) => node.className.includes('questionnaire')), false);
}));

test('only explicit definition entries in settled assistant copy become terms, never code, quotes or guessed prose', () => withDocument(() => {
	for (const text of ['Ordinary explanation.', '```md\n**Fake**: code sample\n```', '> **Quoted**: not a definition', '**Empty**:', '**Only a heading**']) {
		assert.equal(button(turn(text), 'Recall terms'), undefined);
	}
	assert.equal(button(turn(source, {}), 'Recall terms'), undefined);
	const root = turn('- **Retrieval**: Producing an answer from memory.\n- **Feedback**: Information about an attempt.');
	button(root, 'Recall terms').click();
	assert.equal(find(root, 'recall-term').textContent, 'Retrieval');
}));
