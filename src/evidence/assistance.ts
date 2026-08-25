/**
 * Assistance and reveal tracking.
 *
 * Purpose: preserve what the system supplied before or during an attempt (EVD-0002).
 * Inputs: hints, reveals, worked content, and whether substantive AI help occurred.
 * Outputs: an immutable `AssistanceState` snapshot for an Evidence Event.
 * Constraints: tracking assistance is not scoring the learner.
 */
import type { AssistanceState } from '../types/evidence.ts';

export type AssistanceTracker = {
	recordHint(text: string): void;
	recordReveal(text: string): void;
	recordWorkedContent(text: string): void;
	markSubstantiveAiAssistance(declaration: string): void;
	snapshot(declaration?: string): AssistanceState;
};

export function createAssistanceTracker(): AssistanceTracker {
	const hints: string[] = [];
	const reveals: string[] = [];
	const workedContent: string[] = [];
	let substantiveAiAssistance = false;
	let recordedDeclaration = 'none';

	return {
		recordHint(text) {
			hints.push(text);
		},
		recordReveal(text) {
			reveals.push(text);
		},
		recordWorkedContent(text) {
			workedContent.push(text);
		},
		markSubstantiveAiAssistance(declaration) {
			substantiveAiAssistance = true;
			recordedDeclaration = declaration;
		},
		snapshot(declaration = recordedDeclaration) {
			return {
				hints: [...hints],
				reveals: [...reveals],
				substantiveAiAssistance,
				workedContent: [...workedContent],
				declaration,
			};
		},
	};
}

export function emptyAssistance(declaration = 'none'): AssistanceState {
	return {
		hints: [],
		reveals: [],
		substantiveAiAssistance: false,
		workedContent: [],
		declaration,
	};
}
