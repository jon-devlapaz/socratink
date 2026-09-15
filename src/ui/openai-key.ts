import { appConfig } from '../config/app.config.ts';

const connectedCopy = 'Connected. Chat uses your OpenAI key.';
const disconnectedCopy = 'Not connected. Chat uses the local Socratink model.';

export function mountOpenaiKey(form?: HTMLFormElement): void {
	const root = form ?? requireElement<HTMLFormElement>('#openai-key');
	const status = requireElement<HTMLElement>('#openai-key-status', root);
	const field = requireElement<HTMLElement>('#openai-key-field', root);
	const input = requireElement<HTMLInputElement>('#openai-key-input', root);
	const connect = requireElement<HTMLButtonElement>('#openai-key-connect', root);
	const disconnect = requireElement<HTMLButtonElement>('#openai-key-disconnect', root);

	function paint(connected: boolean) {
		status.textContent = connected ? connectedCopy : disconnectedCopy;
		field.hidden = connected;
		connect.hidden = connected;
		disconnect.hidden = !connected;
		input.required = !connected;
		if (connected) input.value = '';
	}

	async function refresh() {
		const response = await fetch(appConfig.openaiKeyPath, { credentials: 'same-origin' });
		if (!response.ok) {
			paint(false);
			return;
		}
		paint(connectedFromUnknown(await response.json()));
	}

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
				status.textContent = 'Could not store that key. Try again.';
				return;
			}
			paint(true);
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
				status.textContent = 'Could not disconnect that key. Try again.';
				return;
			}
			paint(false);
		} finally {
			disconnect.disabled = false;
		}
	});

	void refresh();
}

function connectedFromUnknown(value: unknown): boolean {
	return typeof value === 'object' && value !== null && 'connected' in value && value.connected === true;
}

function requireElement<T extends Element>(selector: string, root: ParentNode = document): T {
	const node = root.querySelector<T>(selector);
	if (!node) throw new Error('Socratink chat markup is missing required nodes.');
	return node;
}
