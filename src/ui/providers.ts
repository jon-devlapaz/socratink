import {
	formatLearnerChatSpecifier,
	learnerChatModelChoices,
	specifierForLearnerChat,
	type LearnerChatStatus,
} from '../config/chat-model.ts';
import { storedLearnerChatSpecifier, writeLearnerChatSpecifier } from './chat-pick.ts';
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
	paintProviderModels(status);
}

export function mountProviders(refresh: () => Promise<void>): void {
	const toggle = requireElement<HTMLButtonElement>('#providers-toggle');
	const panel = requireElement<HTMLElement>('#providers-panel');
	fillProviderModels('#openai-models', 'openai');
	fillProviderModels('#openrouter-models', 'openrouter');
	panel.addEventListener('click', (event) => {
		const button = (event.target as HTMLElement | null)?.closest<HTMLButtonElement>(
			'button.provider-model',
		);
		if (!button || !panel.contains(button)) return;
		const specifier = button.dataset.specifier;
		if (!specifier) return;
		writeLearnerChatSpecifier(specifier);
		void refresh();
	});
	toggle.addEventListener('click', () => {
		const open = toggle.getAttribute('aria-expanded') !== 'true';
		setProvidersExpanded(toggle, panel, open);
	});
	setProvidersExpanded(toggle, panel, false);
}

function fillProviderModels(selector: string, kind: 'openai' | 'openrouter'): void {
	const list = requireElement<HTMLElement>(selector);
	if (list.childElementCount > 0) return;
	for (const choice of learnerChatModelChoices) {
		const button = document.createElement('button');
		button.type = 'button';
		button.className = 'provider-model';
		button.setAttribute('role', 'option');
		button.dataset.specifier = formatLearnerChatSpecifier(
			kind === 'openai'
				? { kind: 'openai', modelId: choice.openaiModelId }
				: { kind: 'openrouter', modelId: choice.openrouterModelId },
		);
		button.textContent = choice.label;
		list.append(button);
	}
}

function paintProviderModels(status: LearnerChatStatus): void {
	const stored = storedLearnerChatSpecifier();
	paintProviderModelList(
		'#openai-models',
		status.openai,
		status.kind === 'openai' ? (stored ?? specifierForLearnerChat({ kind: 'openai' })) : undefined,
	);
	paintProviderModelList(
		'#openrouter-models',
		status.openrouter,
		status.kind === 'openrouter'
			? (stored ?? specifierForLearnerChat({ kind: 'openrouter' }))
			: undefined,
	);
}

function paintProviderModelList(
	selector: string,
	connected: boolean,
	selected: string | undefined,
): void {
	const list = requireElement<HTMLElement>(selector);
	list.hidden = !connected;
	for (const button of list.querySelectorAll<HTMLButtonElement>('.provider-model')) {
		const active = Boolean(connected && selected && button.dataset.specifier === selected);
		button.classList.toggle('is-selected', active);
		button.setAttribute('aria-selected', String(active));
	}
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
