import { appConfig } from '../config/app.config.ts';
import type { LearnerChatStatus } from '../config/chat-model.ts';
import { openrouterChatStatusCopy } from './chat-route.ts';

export function paintOpenrouter(status: LearnerChatStatus, form?: HTMLFormElement): void {
	const root = form ?? requireElement<HTMLFormElement>('#openrouter');
	const statusNode = requireElement<HTMLElement>('#openrouter-status', root);
	const connect = requireElement<HTMLButtonElement>('#openrouter-connect', root);
	const disconnect = requireElement<HTMLButtonElement>('#openrouter-disconnect', root);
	const copy = openrouterChatStatusCopy(status);
	statusNode.textContent = copy;
	statusNode.hidden = copy.length === 0;
	statusNode.removeAttribute('role');
	connect.hidden = status.openrouter;
	disconnect.hidden = !status.openrouter;
}

export function mountOpenrouter(refresh: () => Promise<void>, form?: HTMLFormElement): void {
	const root = form ?? requireElement<HTMLFormElement>('#openrouter');
	const status = requireElement<HTMLElement>('#openrouter-status', root);
	const disconnect = requireElement<HTMLButtonElement>('#openrouter-disconnect', root);

	disconnect.addEventListener('click', async () => {
		disconnect.disabled = true;
		try {
			const response = await fetch(appConfig.openrouterPath, {
				method: 'DELETE',
				credentials: 'same-origin',
			});
			if (!response.ok) {
				status.hidden = false;
				status.textContent = 'Could not disconnect OpenRouter. Try again.';
				status.setAttribute('role', 'alert');
				return;
			}
			await refresh();
		} finally {
			disconnect.disabled = false;
		}
	});
}

function requireElement<T extends Element>(selector: string, root: ParentNode = document): T {
	const node = root.querySelector<T>(selector);
	if (!node) throw new Error('Socratink chat markup is missing required nodes.');
	return node;
}
