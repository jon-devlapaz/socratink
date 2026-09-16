import type { LearnerChatStatus } from '../config/chat-model.ts';
import { providersChatStatusCopy } from './chat-route.ts';

const providerKinds = ['operator', 'openai', 'openrouter'] as const;

export function paintProviders(status: LearnerChatStatus): void {
	const toggle = requireElement<HTMLButtonElement>('#providers-toggle');
	const panel = requireElement<HTMLElement>('#providers-panel');
	const statusNode = requireElement<HTMLElement>('#providers-status');
	const clip = requireElement<HTMLElement>('.providers-panel-clip', panel);
	const openai = requireElement<HTMLFormElement>('#openai-key', clip);
	const openrouter = requireElement<HTMLFormElement>('#openrouter', clip);

	toggle.dataset.kind = status.kind;
	panel.dataset.kind = status.kind;
	statusNode.dataset.kind = status.kind;
	toggle.setAttribute('aria-label', `Providers. ${providersChatStatusCopy(status)}`);

	for (const kind of providerKinds) {
		const line = requireElement<HTMLElement>(`.providers-status-line.is-${kind}`, statusNode);
		const live = kind === status.kind;
		line.classList.toggle('is-live', live);
		line.toggleAttribute('aria-hidden', !live);
	}

	if (status.kind === 'openrouter') clip.append(openrouter, openai);
	else clip.append(openai, openrouter);
}

export function mountProviders(): void {
	const toggle = requireElement<HTMLButtonElement>('#providers-toggle');
	const panel = requireElement<HTMLElement>('#providers-panel');
	toggle.addEventListener('click', () => {
		const open = toggle.getAttribute('aria-expanded') !== 'true';
		setProvidersExpanded(toggle, panel, open);
	});
	setProvidersExpanded(toggle, panel, false);
}

function setProvidersExpanded(
	toggle: HTMLButtonElement,
	panel: HTMLElement,
	open: boolean,
): void {
	toggle.setAttribute('aria-expanded', String(open));
	panel.classList.toggle('is-open', open);
	panel.inert = !open;
	if (!open && panel.contains(document.activeElement)) toggle.focus();
}

function requireElement<T extends Element>(selector: string, root: ParentNode = document): T {
	const node = root.querySelector<T>(selector);
	if (!node) throw new Error('Socratink chat markup is missing required nodes.');
	return node;
}
