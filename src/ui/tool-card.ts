import { toolStateLabel, visibleToolOutput, type DisplayedToolCall } from './tool-state.ts';

export function createToolList(calls: readonly DisplayedToolCall[]): HTMLDivElement {
	const list = document.createElement('div');
	list.className = 'tool-list';
	list.replaceChildren(...calls.map(createToolCard));
	return list;
}

export function createToolCard(call: DisplayedToolCall): HTMLElement {
	const card = document.createElement('article');
	card.className = 'tool-card';
	card.dataset.state = call.state;
	card.setAttribute('aria-label', `${call.name}, ${toolStateLabel(call.state)}`);
	if (call.state === 'running') card.setAttribute('aria-live', 'polite');
	const head = document.createElement('header');
	head.className = 'tool-card-head';
	const name = document.createElement('span');
	name.className = 'tool-card-name';
	name.textContent = call.name;
	const state = document.createElement('span');
	state.className = 'tool-card-state';
	state.textContent = toolStateLabel(call.state);
	head.append(name, state);
	card.append(head);
	const outputText = visibleToolOutput(call);
	if (outputText) {
		const output = document.createElement('pre');
		output.className = 'tool-card-output';
		output.textContent = outputText;
		card.append(output);
	}
	return card;
}
