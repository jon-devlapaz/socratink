import { appConfig } from '../../config/app.config.ts';
import { parseConversationList, type ConversationSummary } from '../../config/conversations.ts';

/** This learner's conversations from the server, newest first. Throws when
 * they cannot be read, so the page can say so instead of showing nothing. */
export async function fetchConversations(): Promise<ConversationSummary[]> {
	const response = await fetch(appConfig.conversationsPath, { cache: 'no-store', credentials: 'same-origin' });
	const list = response.ok ? parseConversationList(await response.json().catch(() => null)) : undefined;
	if (!list) throw new Error(`History could not load (${response.status}).`);
	return list;
}
