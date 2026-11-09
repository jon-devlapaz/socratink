import {
	formatLearnerChatSpecifier,
	learnerChatModelChoices,
	specifierForLearnerChat,
	type LearnerChatStatus,
} from '../config/chat-model.ts';
import { learnerChatStatusFromStoredPick, storedLearnerChatSpecifier, writeLearnerChatSpecifier } from './chat-pick.ts';
import { loadLearnerChatStatus, providersChatStatusCopy } from './chat-route.ts';
import { mountOpenaiKey } from './openai-key.ts';
import { requireElement } from './dom.ts';

const providerKinds = ['operator', 'openai'] as const;

function paintProviders(status: LearnerChatStatus): void {
	const toggle = requireElement<HTMLButtonElement>('#providers-toggle');
	const panel = requireElement<HTMLElement>('#providers-panel');
	const statusNode = requireElement<HTMLElement>('#providers-status');

	toggle.dataset.kind = status.kind;
	panel.dataset.kind = status.kind;
	statusNode.dataset.kind = status.kind;
	toggle.setAttribute('aria-label', `Providers. ${providersChatStatusCopy(status)}`);

	for (const kind of providerKinds) {
		const line = requireElement<HTMLElement>(`.providers-status-line.is-${kind}`, statusNode);
		const live = kind === status.kind;
		if (live) line.textContent = providersChatStatusCopy(status);
		line.classList.toggle('is-live', live);
		line.toggleAttribute('aria-hidden', !live);
	}

	paintProviderModels(status);
}

export function mountProviders(): void {
	const toggle = requireElement<HTMLButtonElement>('#providers-toggle');
	const panel = requireElement<HTMLElement>('#providers-panel');
	const initialStatus = requireElement<HTMLElement>('#providers-status .is-live');
	let statusKnown = false;
	let revision = 0;
	function showUnconfirmedStatus(message: string) {
		initialStatus.textContent = message;
		toggle.setAttribute('aria-label', `Providers. ${message}`);
	}
	showUnconfirmedStatus('Checking chat provider…');
	const key = mountOpenaiKey(applyStatus);
	function applyStatus(status: LearnerChatStatus) {
		revision += 1;
		statusKnown = true;
		const selected = learnerChatStatusFromStoredPick(status);
		paintProviders(selected);
		key.paint(selected);
	}
	async function refresh() {
		const currentRevision = ++revision;
		try {
			const status = await loadLearnerChatStatus();
			if (revision === currentRevision) applyStatus(status);
		} catch {
			if (revision !== currentRevision) return;
			if (!statusKnown) showUnconfirmedStatus('Chat provider unavailable.');
			key.showError('Could not refresh the chat provider. Try again.');
		}
	}
	fillProviderModels();
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
	void refresh();
}

function fillProviderModels(): void {
	const list = requireElement<HTMLElement>('#openai-models');
	if (list.childElementCount > 0) return;
	for (const choice of learnerChatModelChoices) {
		const button = document.createElement('button');
		button.type = 'button';
		button.className = 'provider-model';
		button.setAttribute('role', 'option');
		button.dataset.specifier = formatLearnerChatSpecifier({
			kind: 'openai',
			modelId: choice.openaiModelId,
		});
		button.textContent = choice.label;
		list.append(button);
	}
}

function paintProviderModels(status: LearnerChatStatus): void {
	const stored = storedLearnerChatSpecifier();
	const selected = status.kind === 'openai' ? (stored ?? specifierForLearnerChat({ kind: 'openai' })) : undefined;
	const list = requireElement<HTMLElement>('#openai-models');
	list.hidden = !status.openai;
	for (const button of list.querySelectorAll<HTMLButtonElement>('.provider-model')) {
		const active = Boolean(status.openai && selected && button.dataset.specifier === selected);
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
