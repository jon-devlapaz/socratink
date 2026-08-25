import { createFlueClient } from '@flue/sdk';
import { appConfig } from '../../config/app.config.ts';

export function openChatConversation() {
	const conversationId =
		localStorage.getItem(appConfig.chatConversationStorageKey) ?? crypto.randomUUID();
	localStorage.setItem(appConfig.chatConversationStorageKey, conversationId);
	return createFlueClient({
		url: `${appConfig.chatAgentPath}/${encodeURIComponent(conversationId)}`,
	});
}
