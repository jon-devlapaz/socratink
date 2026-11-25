import type { RevealDefinition } from '../reveal.ts';

const revealWords = {
	hint: 'hint',
	worked_example: 'example',
	partial: 'partial',
	full_answer: 'answer',
} as const;

export function RevealMark({ reveal }: { reveal: RevealDefinition }) {
	const word = revealWords[reveal.kind];
	const article = word === 'example' || word === 'answer' ? 'an' : 'a';
	return <>
		<span className="sr-only">Socratink supplied {article} {word}.</span>
		<span className="reveal-mark" aria-hidden="true">{word}</span>
	</>;
}
