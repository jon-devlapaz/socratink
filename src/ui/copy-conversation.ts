import type { DisplayedTurn } from './chat-turns.ts';
import { conversationMarkdown } from './conversation-markdown.ts';

export function mountConversationCopy(
	button: HTMLButtonElement,
	status: HTMLElement,
	getTurns: () => readonly DisplayedTurn[] | undefined,
) {
	let writing = false;
	let revision = 0;
	let hasConversation = false;
	function sync() {
		revision += 1;
		const turns = getTurns();
		if (turns?.length) hasConversation = true;
		button.hidden = !hasConversation;
		button.disabled = writing || !turns?.length;
		button.textContent = 'Copy conversation';
		status.textContent = '';
	}
	button.addEventListener('click', async () => {
		const turns = getTurns();
		if (writing || !turns?.length) return;
		writing = true;
		button.disabled = true;
		const started = revision;
		let message: string;
		try {
			if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
			await navigator.clipboard.writeText(conversationMarkdown(turns));
			message = 'Conversation copied';
		} catch {
			message = 'Could not copy. Try again.';
		} finally {
			writing = false;
		}
		if (started !== revision) {
			sync();
			return;
		}
		button.disabled = !getTurns()?.length;
		button.textContent = message;
		status.textContent = message;
		window.setTimeout(() => {
			if (started === revision) sync();
		}, 2500);
	});
	sync();
	return sync;
}
