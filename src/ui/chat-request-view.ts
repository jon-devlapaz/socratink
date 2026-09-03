import { chatRequestControls, type ChatRequestState } from './client/conversation.ts';

export type RequestControlElements = {
	input: HTMLTextAreaElement;
	button: HTMLButtonElement;
	startOver: HTMLButtonElement;
	core: HTMLButtonElement;
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
	elements.startOver.disabled = controls.startOverDisabled;
	elements.core.classList.toggle('is-working', controls.busy);
	elements.lockup.classList.toggle('is-working', controls.busy);
}

export function focusAfterRequestStatePaint(
	state: ChatRequestState,
	elements: Pick<RequestControlElements, 'input' | 'activeTurn'>,
): void {
	if (chatRequestControls(state).composerLocked) {
		const action = elements.activeTurn.querySelector<HTMLButtonElement>(
			'.request-actions .request-action',
		);
		if (action) {
			action.focus();
			return;
		}
	}
	elements.input.focus();
}

export function buildRequestStateTurn(
	state: Extract<ChatRequestState, { kind: 'recovery' | 'terminal' }>,
	action: () => Promise<ChatRequestState>,
	runRequestCommand: (result: Promise<ChatRequestState>) => void,
): HTMLElement {
	const wrap = document.createElement('div');
	wrap.className = `turn request-state ${state.kind === 'terminal' ? state.outcome : 'recovery'}`;
	wrap.setAttribute('role', 'status');
	wrap.setAttribute('aria-live', 'polite');
	const label = document.createElement('span');
	label.className = 'turn-label';
	label.textContent = state.kind === 'recovery'
		? 'Outcome unknown'
		: state.outcome === 'aborted'
			? 'Canceled'
			: state.outcome === 'not-admitted'
				? 'Not sent'
				: 'Reply failed';
	const body = document.createElement('p');
	body.textContent = state.detail;
	const actions = document.createElement('div');
	actions.className = 'request-actions';
	const button = document.createElement('button');
	button.className = 'request-action';
	button.type = 'button';
	button.textContent = state.kind === 'terminal' ? 'Retry' : 'Recheck';
	button.addEventListener('click', () => {
		for (const actionButton of button.parentElement?.querySelectorAll('button') ?? []) {
			actionButton.disabled = true;
		}
		runRequestCommand(action());
	});
	actions.append(button);
	wrap.append(label, body, actions);
	return wrap;
}
