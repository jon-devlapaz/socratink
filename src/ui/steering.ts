import { steeringMessages } from '../config/chat-message.ts';

export type SteeringKind = keyof typeof steeringMessages;

export const steeringCopy: Record<SteeringKind, { label: string; said: string }> = {
	'smaller-step': {
		label: 'Smaller step',
		said: 'Smaller step, please.',
	},
	'try-unaided': {
		label: 'Try on my own',
		said: 'Let me try this unaided.',
	},
};

export const steeringKinds = ['smaller-step', 'try-unaided'] as const satisfies readonly SteeringKind[];

export function formatSteeringMessage(kind: SteeringKind): string {
	return steeringMessages[kind];
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
