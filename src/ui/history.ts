import { pastConversations } from './client/conversation-history.ts';
import { switchChatConversation } from './client/conversation.ts';
import { requireElement } from './dom.ts';
import './history.css';

type HistoryOptions = Readonly<{
	userId: string;
	aliases: readonly string[];
	currentId: string;
	closeMenu: () => void;
	beforeSwitch: () => void;
}>;

export function mountHistory(options: HistoryOptions) {
	const trigger = requireElement<HTMLButtonElement>('#history-trigger');
	const dialog = requireElement<HTMLDialogElement>('#history-dialog');
	const list = requireElement<HTMLOListElement>('#history-list');
	const empty = requireElement<HTMLElement>('#history-empty');
	const close = requireElement<HTMLButtonElement>('#history-close');

	trigger.addEventListener('click', () => {
		options.closeMenu();
		render();
		dialog.showModal();
	});
	// The dialog returns focus to the control that opened the menu.
	close.addEventListener('click', () => dialog.close());

	function render() {
		const entries = pastConversations(options.userId, options.aliases);
		empty.hidden = entries.length > 0;
		list.hidden = entries.length === 0;
		list.replaceChildren(...entries.map((entry) => {
			const item = document.createElement('li');
			const open = document.createElement('button');
			open.type = 'button';
			const title = document.createElement('span');
			title.className = 'history-title';
			title.textContent = entry.title;
			const current = entry.id === options.currentId;
			// Color is never the only signal for the open conversation.
			const when = document.createElement(current ? 'span' : 'time');
			when.className = 'history-when';
			if (when instanceof HTMLTimeElement) when.dateTime = new Date(entry.usedAt).toISOString();
			when.textContent = current ? 'Open now' : usedLabel(entry.usedAt);
			open.append(title, when);
			if (current) {
				open.setAttribute('aria-current', 'true');
				open.addEventListener('click', () => dialog.close());
			} else {
				open.addEventListener('click', () => {
					options.beforeSwitch();
					switchChatConversation(entry.id);
				});
			}
			item.append(open);
			return item;
		}));
	}
}

function usedLabel(usedAt: number, now = new Date()): string {
	const used = new Date(usedAt);
	if (used.toDateString() === now.toDateString()) {
		return used.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
	}
	return used.toLocaleDateString(undefined, {
		month: 'short', day: 'numeric', ...(used.getFullYear() === now.getFullYear() ? {} : { year: 'numeric' }),
	});
}
