/**
 * Flue conversation client for the existing chat surface.
 *
 * Purpose: isolate SDK wiring from DOM rendering.
 * Inputs: none. Outputs: a Flue client bound to a persisted conversation id.
 * Constraints: this is the current chat agent only.
 */
import { createFlueClient } from '@flue/sdk';
import { appConfig } from '../../config/app.config.ts';

export function openChatConversation() {
	const conversationId = localStorage.getItem(appConfig.conversationStorageKey) ?? crypto.randomUUID();
	localStorage.setItem(appConfig.conversationStorageKey, conversationId);
	return createFlueClient({
		url: `${appConfig.chatAgentPath}/${encodeURIComponent(conversationId)}`,
	});
}
