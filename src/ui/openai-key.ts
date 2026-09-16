import { appConfig } from '../config/app.config.ts';
import type { LearnerChatStatus } from '../config/chat-model.ts';
import { openaiChatStatusCopy } from './chat-route.ts';

export function paintOpenaiKey(status: LearnerChatStatus, form?: HTMLFormElement): void {
	const root = form ?? requireElement<HTMLFormElement>('#openai-key');
	const statusNode = requireElement<HTMLElement>('#openai-key-status', root);
	const field = requireElement<HTMLElement>('#openai-key-field', root);
	const input = requireElement<HTMLInputElement>('#openai-key-input', root);
	const connect = requireElement<HTMLButtonElement>('#openai-key-connect', root);
	const disconnect = requireElement<HTMLButtonElement>('#openai-key-disconnect', root);
	const copy = openaiChatStatusCopy(status);
	statusNode.textContent = copy;
	statusNode.hidden = copy.length === 0;
	statusNode.removeAttribute('role');
	field.hidden = status.openai;
	connect.hidden = status.openai;
	disconnect.hidden = !status.openai;
	input.required = !status.openai;
	if (status.openai) input.value = '';
}

export function mountOpenaiKey(refresh: () => Promise<void>, form?: HTMLFormElement): void {
	const root = form ?? requireElement<HTMLFormElement>('#openai-key');
	const status = requireElement<HTMLElement>('#openai-key-status', root);
	const input = requireElement<HTMLInputElement>('#openai-key-input', root);
	const connect = requireElement<HTMLButtonElement>('#openai-key-connect', root);
	const disconnect = requireElement<HTMLButtonElement>('#openai-key-disconnect', root);

	root.addEventListener('submit', async (event) => {
		event.preventDefault();
		const apiKey = input.value.trim();
		if (!apiKey) return;
		connect.disabled = true;
		try {
			const response = await fetch(appConfig.openaiKeyPath, {
				method: 'PUT',
				credentials: 'same-origin',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ apiKey }),
			});
			if (!response.ok) {
				status.hidden = false;
				status.textContent = 'Could not store that key. Try again.';
				status.setAttribute('role', 'alert');
				return;
			}
			await refresh();
		} finally {
			connect.disabled = false;
		}
	});

	disconnect.addEventListener('click', async () => {
		disconnect.disabled = true;
		try {
			const response = await fetch(appConfig.openaiKeyPath, {
				method: 'DELETE',
				credentials: 'same-origin',
			});
			if (!response.ok) {
				status.hidden = false;
				status.textContent = 'Could not disconnect that key. Try again.';
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
