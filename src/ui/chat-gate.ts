import { betaSignInError } from '../config/beta-access.ts';
import type { ChatRequestState } from './client/conversation.ts';
import type { AuthProviders } from './session.ts';

const guestSignInMessage = 'You\u2019ve had 3 turns. Sign in to save your conversation and keep learning.';

export function authGateMessage(state: ChatRequestState): string | undefined {
	if (state.kind !== 'terminal' || state.outcome !== 'not-admitted') return undefined;
	if (state.code === betaSignInError.type) return betaSignInError.message;
	return state.code === 'guest_turn_limit' ? guestSignInMessage : undefined;
}

export function hasAuthProvider(providers: AuthProviders): boolean {
	return providers.google || providers.github;
}

export function createAuthGateCard(providers: AuthProviders, messageText = guestSignInMessage): HTMLElement {
	const card = document.createElement('div');
	card.className = 'chat-gate-card';
	card.setAttribute('role', 'status');
	card.setAttribute('aria-live', 'polite');

	const message = document.createElement('p');
	message.className = 'chat-gate-message';
	message.textContent = messageText;
	card.append(message);

	const actions = document.createElement('div');
	actions.className = 'chat-gate-actions';

	if (providers.google) {
		actions.append(createGateLink('Continue with Google', '/api/auth/google/login', 'google'));
	}
	if (providers.github) {
		actions.append(createGateLink('Continue with GitHub', '/api/auth/github/login', 'github'));
	}
	card.append(actions);

	return card;
}

function createGateLink(label: string, href: string, provider: string): HTMLAnchorElement {
	const link = document.createElement('a');
	link.className = `chat-gate-btn chat-gate-${provider}`;
	link.href = href;
	link.textContent = label;
	return link;
}
