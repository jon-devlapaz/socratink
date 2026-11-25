import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { chatRequestControls, type ChatRequestState } from './client/conversation.ts';

export type RequestControlElements = {
	input: HTMLTextAreaElement;
	button: HTMLButtonElement;
	lockup: HTMLButtonElement;
	activeTurn: HTMLElement;
};

export function applyRequestControlState(
	state: ChatRequestState,
	elements: RequestControlElements,
): void {
	const controls = chatRequestControls(state);
	elements.input.disabled = controls.composerLocked;
	elements.button.disabled = controls.composerLocked;
	elements.lockup.classList.toggle('is-working', controls.busy);
}

export function focusAfterRequestStatePaint(
	state: ChatRequestState,
	elements: Pick<RequestControlElements, 'input' | 'activeTurn'>,
): void {
	if (document.querySelector('[role="dialog"][data-state="open"]')) return;
	if (chatRequestControls(state).composerLocked) {
		const action = elements.activeTurn.querySelector<HTMLElement>(
			'.request-actions .request-action, .chat-gate-btn',
		);
		if (action) {
			action.focus();
			return;
		}
	}
	const question = elements.activeTurn.querySelector<HTMLElement>('.questionnaire fieldset');
	if (question) question.focus({ preventScroll: true });
	else elements.input.focus();
}

type ActionState = Extract<ChatRequestState, { kind: 'recovery' | 'terminal' }>;

const outcomeLabel = {
	aborted: 'Canceled',
	'not-admitted': 'Not sent',
	failed: 'Socratink couldn’t reply',
} satisfies Record<Extract<ActionState, { kind: 'terminal' }>['outcome'], string>;

export function RequestStateTurn({ state, onAction }: { state: ActionState; onAction: () => void }) {
	const [attempt, setAttempt] = useState<ActionState>();
	const outcome = state.kind === 'terminal' ? state.outcome : 'recovery';
	return (
		<div className={`turn request-state ${outcome}`} role="status" aria-live="polite">
			<span className="turn-label">{state.kind === 'terminal' ? outcomeLabel[state.outcome] : 'Outcome unknown'}</span>
			<p>{state.detail}</p>
			<div className="request-actions">
				<Button type="button" variant="outline" className="request-action" disabled={attempt === state}
					onClick={() => { setAttempt(state); onAction(); }}>
					{state.kind === 'terminal' ? 'Retry' : 'Recheck'}
				</Button>
			</div>
		</div>
	);
}
