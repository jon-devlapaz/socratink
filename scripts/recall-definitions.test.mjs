import assert from 'node:assert/strict';
import test from 'node:test';
import { createActiveTurn } from '../src/ui/turn-view.ts';

class Element {
	constructor(tag) { this.tag = tag; }
	children = [];
	className = '';
	dataset = {};
	value = '';
	listeners = {};
	classList = { add() {} };
	append(...children) { this.children.push(...children); }
	replaceChildren(...children) { this.children = children; }
	setAttribute() {}
	addEventListener(name, handler) { this.listeners[name] = handler; }
	focus() {}
	click() { this.listeners.click?.(); }
}

const nodes = (root) => [root, ...root.children.flatMap(nodes)];
const button = (root, label) => nodes(root).find((node) => node.tag === 'button' && node.textContent === label);
const reference = (root) => nodes(root).find((node) => node.className === 'recall-reference')?.textContent;

for (const [name, source] of [
	['paragraph', 'Introductory prose.\n**First**: The first line\ncontinues with **important** meaning.\n**Second**: A separate reference.\n\nUnrelated paragraph.'],
	['unordered list', '- **First**: The first line\n  continues with **important** meaning.\n- **Second**: A separate reference.\n- Not a definition.'],
	['ordered list', '1. **First**: The first line\n   continues with **important** meaning.\n2. **Second**: A separate reference.'],
]) {
	test(`public turn reveals the full ${name} definition without merging entries`, () => {
		const original = Object.getOwnPropertyDescriptor(globalThis, 'document');
		globalThis.document = {
			createElement: (tag) => new Element(tag),
			createElementNS: (_ns, tag) => new Element(tag),
			createTextNode: (textContent) => Object.assign(new Element('text'), { textContent }),
		};
		try {
			const root = createActiveTurn({ role: 'Assistant', text: source }, { steering: true }, { trackRenderer() {} }, {
				onSteer() { assert.fail('Recall requested a model turn'); },
				onQuestionnaireSubmit() { assert.fail('Recall submitted a questionnaire'); },
			});
			assert.ok(button(root, 'Recall terms'));
			button(root, 'Recall terms').click();
			button(root, 'Reveal reference').click();
			assert.equal(reference(root), 'The first line\ncontinues with important meaning.');
			button(root, 'Next term').click();
			button(root, 'Reveal reference').click();
			assert.equal(reference(root), 'A separate reference.');
			assert.ok(button(root, 'Finish recall'));
		} finally {
			if (original) Object.defineProperty(globalThis, 'document', original);
			else delete globalThis.document;
		}
	});
}
