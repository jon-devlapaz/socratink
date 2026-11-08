import { compactMarkdownText, parseMarkdownBlocks } from './chat-markdown-parse.ts';

type Term = { term: string; reference: string };

export function createRecallSession(source: string): HTMLElement | undefined {
	const terms = definitionEntries(source);
	if (!terms.length) return undefined;
	const root = document.createElement('section');
	root.className = 'recall-session';
	root.setAttribute('aria-label', 'Recall terms from this reply');
	const start = action('Recall terms', () => {
		root.dataset.active = 'true';
		showTerm(0);
	});
	const close = () => {
		delete root.dataset.active;
		root.replaceChildren(start);
		start.focus();
	};
	const showTerm = (index: number) => {
		const entry = terms[index];
		if (!entry) throw new Error('Recall term is missing.');
		const heading = document.createElement('h2');
		heading.className = 'recall-term';
		heading.textContent = entry.term;
		const instruction = document.createElement('p');
		instruction.className = 'recall-instruction';
		instruction.textContent = 'Recall the meaning before you reveal it.';
		const comparison = document.createElement('div');
		comparison.className = 'recall-comparison';
		const attemptLabel = document.createElement('label');
		attemptLabel.className = 'recall-column';
		const label = document.createElement('span');
		label.textContent = 'Your attempt';
		const attempt = document.createElement('textarea');
		attempt.className = 'recall-attempt';
		attempt.rows = 4;
		attempt.maxLength = 4000;
		attempt.placeholder = 'Recall privately, or jot it down here…';
		attemptLabel.append(label, attempt);
		comparison.append(attemptLabel);
		const privacy = document.createElement('p');
		privacy.className = 'recall-note';
		privacy.textContent = 'Only here for this practice. Not sent or saved.';
		const controls = document.createElement('div');
		controls.className = 'recall-controls';
		const reveal = action('Reveal reference', () => {
			attempt.readOnly = true;
			const supplied = document.createElement('div');
			supplied.className = 'recall-column';
			supplied.setAttribute('role', 'status');
			const attribution = document.createElement('span');
			attribution.textContent = 'Reference from Socratink’s reply';
			const reference = document.createElement('p');
			reference.className = 'recall-reference';
			reference.textContent = entry.reference;
			supplied.append(attribution, reference);
			comparison.append(supplied);
			comparison.dataset.revealed = 'true';
			if (!attempt.value.trim()) attempt.placeholder = 'No written attempt.';
			const next = index + 1 < terms.length
				? action('Next term', () => showTerm(index + 1))
				: action('Finish recall', close);
			controls.replaceChildren(next);
			next.focus();
		});
		controls.append(reveal);
		root.replaceChildren(action('Back to conversation', close), heading, instruction, comparison, privacy, controls);
		attempt.focus();
	};
	root.append(start);
	return root;
}

function action(label: string, onClick: () => void): HTMLButtonElement {
	const button = document.createElement('button');
	button.type = 'button';
	button.textContent = label;
	button.addEventListener('click', onClick);
	return button;
}

function definitionEntries(source: string): Term[] {
	const entries: Term[] = [];
	for (const block of parseMarkdownBlocks(source)) {
		const lines = block.type === 'list' ? block.items : block.type === 'paragraph' ? block.text.split('\n') : [];
		for (const line of lines) {
			const match = /^\*\*([^*\n:]{1,100})\*\*:\s+(.+)$/.exec(line.trim());
			if (!match) continue;
			const term = compactMarkdownText(match[1] ?? '').trim();
			const reference = compactMarkdownText(match[2] ?? '').trim();
			if (term && reference) entries.push({ term, reference });
		}
	}
	return entries;
}
