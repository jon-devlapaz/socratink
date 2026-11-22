import { appConfig } from '../../config/app.config.ts';
import { conversationBelongsToUser, userIdFromConversationId } from '../../config/session.ts';

/** One past conversation, as this browser remembers it. The server keeps the
 * conversation itself; this list only lets the learner find it again. Each
 * learner has their own list, cleared when they sign out. */
type PastConversation = { id: string; title: string; usedAt: number };

/** `admitted`: the server accepted this learner message. It names a new
 * conversation and marks it used now. `restored`: the server's first learner
 * message, read back on open. It owns the title and leaves the time alone. */
export type ConversationEvidence = { kind: 'admitted' | 'restored'; firstLearnerText: string };

export const historyLimit = 50;

export function conversationTitle(text: string): string {
	const line = text.replace(/\s+/g, ' ').trim();
	return line.length > 60 ? `${line.slice(0, 59).trimEnd()}…` : line;
}

export function rememberConversation(id: string, evidence: ConversationEvidence, now = Date.now()) {
	const owner = userIdFromConversationId(id);
	const title = conversationTitle(evidence.firstLearnerText);
	if (!owner || !title) return;
	const entries = readHistory(owner);
	const existing = entries.find((entry) => entry.id === id);
	const entry = evidence.kind === 'admitted'
		? { id, title: existing?.title ?? title, usedAt: now }
		: { id, title, usedAt: existing?.usedAt ?? now };
	const next = [entry, ...entries.filter((item) => item.id !== id)]
		.sort((a, b) => b.usedAt - a.usedAt)
		.slice(0, historyLimit);
	try {
		localStorage.setItem(historyKey(owner), JSON.stringify(next));
	} catch {
		// Storage can be full or blocked. The conversation is still saved on the server.
	}
}

export function pastConversations(userId: string, aliases: readonly string[] = []): PastConversation[] {
	return [userId, ...aliases].flatMap(readHistory)
		.filter((entry) => conversationBelongsToUser(entry.id, userId, aliases))
		.sort((a, b) => b.usedAt - a.usedAt);
}

/** Sign-out removes this learner's titles from the browser. */
export function forgetPastConversations(userId: string, aliases: readonly string[] = []) {
	for (const id of [userId, ...aliases]) {
		try {
			localStorage.removeItem(historyKey(id));
		} catch {
			// Nothing to remove without storage access.
		}
	}
}

function historyKey(userId: string): string {
	return `${appConfig.chatHistoryStorageKey}:${userId}`;
}

function readHistory(userId: string): PastConversation[] {
	let parsed: unknown;
	try {
		parsed = JSON.parse(localStorage.getItem(historyKey(userId)) ?? '[]');
	} catch {
		return [];
	}
	if (!Array.isArray(parsed)) return [];
	return parsed.filter((entry): entry is PastConversation =>
		typeof entry?.id === 'string' && typeof entry.title === 'string' && Number.isFinite(entry.usedAt));
}
