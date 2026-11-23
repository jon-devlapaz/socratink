import type { ConversationSummary } from '../config/conversations.ts';
import { fetchConversations } from './client/conversation-list.ts';
import { switchChatConversation } from './client/conversation.ts';
import { requireElement } from './dom.ts';
import './history.css';
import './buttons.css';

type HistoryOptions = Readonly<{
	currentId: string;
	closeMenu: () => void;
	beforeSwitch: () => void;
}>;

const legacyHistoryKeyPrefix = 'socratink-chat-history';

export function mountHistory(options: HistoryOptions) {
	const trigger = requireElement<HTMLButtonElement>('#history-trigger');
	const dialog = requireElement<HTMLDialogElement>('#history-dialog');
	const list = requireElement<HTMLOListElement>('#history-list');
	const empty = requireElement<HTMLElement>('#history-empty');
	const status = requireElement<HTMLElement>('#history-status');
	const retry = requireElement<HTMLButtonElement>('#history-retry');
	const close = requireElement<HTMLButtonElement>('#history-close');
	forgetLegacyHistory();
	let latest = 0;

	trigger.addEventListener('click', () => {
		options.closeMenu();
		dialog.showModal();
		void load();
	});
	retry.addEventListener('click', () => void load());
	close.addEventListener('click', () => dialog.close());

	async function load() {
		const request = ++latest;
		show({ status: 'Loading…' });
		const entries = await fetchConversations().catch(() => undefined);
		if (request !== latest || !dialog.open) return;
		if (!entries) {
			show({ status: 'History could not load. Check your connection and try again.', retry: true });
			retry.focus();
			return;
		}
		show({ empty: entries.length === 0 });
		render(entries);
	}

	function show(state: { status?: string; retry?: boolean; empty?: boolean }) {
		status.textContent = state.status ?? '';
		status.hidden = !state.status;
		retry.hidden = !state.retry;
		empty.hidden = !state.empty;
		list.hidden = Boolean(state.status) || Boolean(state.empty);
		if (state.status) list.replaceChildren();
	}

	function render(entries: readonly ConversationSummary[]) {
		list.replaceChildren(...entries.map((entry) => {
			const item = document.createElement('li');
			const open = document.createElement('button');
			open.type = 'button';
			const title = document.createElement('span');
			title.className = 'history-title';
			title.textContent = entry.title;
			const current = entry.id === options.currentId;
			const when = document.createElement(current ? 'span' : 'time');
			when.className = 'history-when';
			if (when instanceof HTMLTimeElement) when.dateTime = entry.updatedAt;
			when.textContent = current ? 'Open now' : usedLabel(entry.updatedAt);
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

function forgetLegacyHistory() {
	try {
		for (const key of Object.keys(localStorage)) if (key.startsWith(legacyHistoryKeyPrefix)) localStorage.removeItem(key);
	} catch {
	}
}

function usedLabel(usedAt: string, now = new Date()): string {
	const used = new Date(usedAt);
	if (used.toDateString() === now.toDateString()) {
		return used.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
	}
	return used.toLocaleDateString(undefined, {
		month: 'short', day: 'numeric', ...(used.getFullYear() === now.getFullYear() ? {} : { year: 'numeric' }),
	});
}
