import { appConfig } from '../config/app.config.ts';
import type { LearnerChatStatus } from '../config/chat-model.ts';
import { openaiChatStatusCopy, readLearnerChatStatus } from './chat-route.ts';
import { requireElement } from './dom.ts';

export function mountOpenaiKey(applyStatus: (status: LearnerChatStatus) => void) {
	const form = requireElement<HTMLFormElement>('#openai-key');
	const status = requireElement<HTMLElement>('#openai-key-status', form);
	const field = requireElement<HTMLElement>('#openai-key-field', form);
	const input = requireElement<HTMLInputElement>('#openai-key-input', form);
	const connect = requireElement<HTMLButtonElement>('#openai-key-connect', form);
	const disconnect = requireElement<HTMLButtonElement>('#openai-key-disconnect', form);

	function showError(message: string) {
		status.hidden = false;
		status.textContent = message;
		status.setAttribute('role', 'alert');
	}

	async function changeKey(method: 'PUT' | 'DELETE', apiKey?: string) {
		const button = method === 'PUT' ? connect : disconnect;
		button.disabled = true;
		try {
			const response = await fetch(appConfig.openaiKeyPath, {
				method,
				credentials: 'same-origin',
				...(method === 'PUT' ? {
					headers: { 'content-type': 'application/json' },
					body: JSON.stringify({ apiKey }),
				} : {}),
			});
			if (!response.ok) throw new Error('Key request failed.');
			input.value = '';
			applyStatus(await readLearnerChatStatus(response));
		} catch {
			showError(method === 'PUT'
				? 'Could not store that key. Try again.'
				: 'Could not disconnect that key. Try again.');
		} finally {
			button.disabled = false;
		}
	}

	form.addEventListener('submit', (event) => {
		event.preventDefault();
		const apiKey = input.value.trim();
		if (apiKey && !connect.disabled) void changeKey('PUT', apiKey);
	});
	disconnect.addEventListener('click', () => {
		if (!disconnect.disabled) void changeKey('DELETE');
	});

	return {
		showError,
		paint(route: LearnerChatStatus) {
			const copy = openaiChatStatusCopy(route);
			status.textContent = copy;
			status.hidden = copy.length === 0;
			status.removeAttribute('role');
			field.hidden = route.openai;
			connect.hidden = route.openai;
			disconnect.hidden = !route.openai;
			input.required = !route.openai;
			if (route.openai) input.value = '';
		},
	};
}
