import { steeringPrefix } from '../config/chat-message.ts';

export type SteeringKind = 'smaller-step' | 'try-unaided';

export const steeringCopy: Record<SteeringKind, { label: string; body: string; said: string }> = {
	'smaller-step': {
		label: 'Smaller step',
		body: 'smaller step. The last turn moved too fast or assumed more footing than I have. Slow down to one smaller step, and check a missing assumption before continuing.',
		said: 'Smaller step, please.',
	},
	'try-unaided': {
		label: 'Try on my own',
		body: 'try unaided. I have enough footing. Withhold the next reveal and let me attempt the target.',
		said: 'Let me try this unaided.',
	},
};

export const steeringKinds = ['smaller-step', 'try-unaided'] as const satisfies readonly SteeringKind[];

export function formatSteeringMessage(kind: SteeringKind): string {
	switch (kind) {
		case 'smaller-step':
		case 'try-unaided':
			return `${steeringPrefix} ${steeringCopy[kind].body}`;
		default: {
			const exhaustive: never = kind;
			return exhaustive;
		}
	}
}

/** The short line a sent steering message shows as, or undefined when the
 * text is not one of these controls' messages. */
export function steeringSaidText(text: string): string | undefined {
	const kind = steeringKinds.find((candidate) => formatSteeringMessage(candidate) === text);
	return kind && steeringCopy[kind].said;
}

export function turnSnippetToCopy(sourceText: string, selectedText = ''): string {
	const selected = selectedText.trim();
	return selected || sourceText;
}
