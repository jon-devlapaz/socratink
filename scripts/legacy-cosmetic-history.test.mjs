import assert from 'node:assert/strict';
import test from 'node:test';
import { visibleTurnsFromHistory } from '../src/ui/chat-turns.ts';
import { createActiveTurn } from '../src/ui/turn-view.ts';

const questionnaire = {
	kind: 'question',
	submitLabel: 'Continue',
	items: [{
		name: 'recovery',
		prompt: 'What should be checked before retrying?',
		required: true,
		multiple: false,
		choices: [
			{ value: 'admission', label: 'Whether work was admitted' },
			{ value: 'spinner', label: 'Whether the spinner stopped' },
		],
	}],
};

const savedHistory = JSON.stringify({
	settlements: [],
	messages: [
		{
			display: 'visible', role: 'user',
			parts: [{ type: 'text', text: 'The connection dropped after admission.' }],
		},
		{
			display: 'visible', role: 'assistant',
			parts: [
				{ type: 'text', text: 'Check the admitted request before resending.' },
				{ type: 'data-ink', data: { expression: 'connect' } },
				{
					type: 'dynamic-tool', toolName: 'ink_express', toolCallId: 'legacy-cosmetic',
					state: 'output-available', input: { expression: 'connect' },
					output: 'Visual cue recorded.',
				},
				{
					type: 'dynamic-tool', toolName: 'present_question', toolCallId: 'question',
					state: 'output-available', input: {}, output: 'Question presented on the card.',
				},
				{ type: 'data-questionnaire', data: questionnaire },
			],
		},
	],
});

test('restores legacy cosmetic history without losing text or questionnaires or showing a cosmetic card', () => {
	const turns = visibleTurnsFromHistory(JSON.parse(savedHistory));
	assert.deepEqual(turns.map(({ role, text }) => ({ role, text })), [
		{ role: 'You', text: 'The connection dropped after admission.' },
		{ role: 'Assistant', text: 'Check the admitted request before resending.' },
	]);
	assert.deepEqual(turns[1].questionnaire, questionnaire);
	assert.equal(turns[1].tools, undefined, 'legacy cosmetic calls must not become visible cards');

	const previous = globalThis.document;
	globalThis.document = {
		createElement: () => new Element(),
		createTextNode: (text) => Object.assign(new Element(), { textContent: text }),
	};
	try {
		const rendered = turns.map((turn) => createActiveTurn(turn, { interactive: true },
			{ trackRenderer() {} }, { onQuestionnaireSubmit() {}, onSteer() {} }));
		const nodes = rendered.flatMap(descendants);
		assert.ok(nodes.some((node) => node.textContent === questionnaire.items[0].prompt));
		for (const choice of questionnaire.items[0].choices) {
			assert.ok(nodes.some((node) => node.textContent === choice.label));
		}
		assert.equal(nodes.filter((node) => node.className === 'tool-card').length, 0);
	} finally {
		if (previous === undefined) delete globalThis.document;
		else globalThis.document = previous;
	}
});

class Element {
	className = '';
	textContent = '';
	children = [];
	attributes = {};
	dataset = {};
	style = {};
	classList = { add: (name) => { this.className += ` ${name}`; } };
	append(...nodes) { this.children.push(...nodes); }
	replaceChildren(...nodes) { this.children = nodes; }
	setAttribute(name, value) { this.attributes[name] = value; }
	addEventListener() {}
	focus() {}
}

function descendants(node) {
	return [node, ...(node.children ?? []).flatMap(descendants)];
}
