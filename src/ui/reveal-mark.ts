import type { RevealDefinition } from '../reveal.ts';

const revealWords = {
	hint: 'hint',
	worked_example: 'example',
	partial: 'partial',
	full_answer: 'answer',
} as const;

export function markSuppliedCopy(copy: HTMLElement, reveal: RevealDefinition): void {
	const word = revealWords[reveal.kind];
	copy.classList.add('reveal-copy');
	const mark = document.createElement('span');
	mark.className = 'reveal-mark';
	mark.textContent = word;
	mark.setAttribute('aria-hidden', 'true');
	const spoken = document.createElement('span');
	spoken.className = 'sr-only';
	const article = word === 'example' || word === 'answer' ? 'an' : 'a';
	spoken.textContent = `Socratink supplied ${article} ${word}.`;
	copy.prepend(spoken, mark);
}
