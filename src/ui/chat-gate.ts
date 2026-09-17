// Inline auth gate card shown after the guest turn limit is reached.
// Rendered into the conversation transcript, not as a modal or redirect.
import type { AuthProviders } from './session.ts';

export function hasAuthProvider(providers: AuthProviders): boolean {
	return providers.google || providers.github;
}

export function createAuthGateCard(providers: AuthProviders): HTMLElement {
	const card = document.createElement('div');
	card.className = 'chat-gate-card';
	card.setAttribute('role', 'status');
	card.setAttribute('aria-live', 'polite');

	const message = document.createElement('p');
	message.className = 'chat-gate-message';
	message.textContent =
		'You\u2019ve had 3 turns. Sign in to save your conversation and keep learning.';
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
