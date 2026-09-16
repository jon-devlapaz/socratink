import { appConfig } from '../config/app.config.ts';

const connectedCopy = 'Connected. Chat uses your OpenRouter key.';
const disconnectedCopy = 'Not connected. Chat uses the local Socratink model.';

export function mountOpenrouter(form?: HTMLFormElement): void {
	const root = form ?? requireElement<HTMLFormElement>('#openrouter');
	const status = requireElement<HTMLElement>('#openrouter-status', root);
	const connect = requireElement<HTMLButtonElement>('#openrouter-connect', root);
	const disconnect = requireElement<HTMLButtonElement>('#openrouter-disconnect', root);

	function paint(connected: boolean) {
		status.textContent = connected ? connectedCopy : disconnectedCopy;
		connect.hidden = connected;
		disconnect.hidden = !connected;
	}

	async function refresh() {
		const response = await fetch(appConfig.openrouterPath, { credentials: 'same-origin' });
		if (!response.ok) {
			paint(false);
			return;
		}
		paint(connectedFromUnknown(await response.json()));
	}

	disconnect.addEventListener('click', async () => {
		disconnect.disabled = true;
		try {
			const response = await fetch(appConfig.openrouterPath, {
				method: 'DELETE',
				credentials: 'same-origin',
			});
			if (!response.ok) {
				status.textContent = 'Could not disconnect OpenRouter. Try again.';
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
