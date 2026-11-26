import type { RevealDefinition } from '../reveal.ts';

const revealLabels = {
	hint: 'Hint from Socratink',
	worked_example: 'Worked example from Socratink',
	partial: 'Partial explanation from Socratink',
	full_answer: 'Full answer from Socratink',
} satisfies Record<RevealDefinition['kind'], string>;

export function RevealMark({ reveal }: { reveal: RevealDefinition }) {
	return <span className="reveal-mark">{revealLabels[reveal.kind]}</span>;
}
