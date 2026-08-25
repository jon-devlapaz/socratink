import { createFlueClient } from '@flue/sdk';
import { appConfig } from '../../config/app.config.ts';

export function openChatConversation() {
	const conversationId = localStorage.getItem(appConfig.conversationStorageKey) ?? crypto.randomUUID();
	localStorage.setItem(appConfig.conversationStorageKey, conversationId);
	return createFlueClient({
		url: `${appConfig.chatAgentPath}/${encodeURIComponent(conversationId)}`,
	});
}
