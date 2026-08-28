import { createFlueClient, type FlueClient } from '@flue/sdk';
import { appConfig } from '../../config/app.config.ts';

type ChatTurnClient = Pick<FlueClient, 'send' | 'read'>;

export function openChatConversation() {
	const conversationId =
		localStorage.getItem(appConfig.chatConversationStorageKey) ?? crypto.randomUUID();
	localStorage.setItem(appConfig.chatConversationStorageKey, conversationId);
	return createFlueClient({
		url: `${appConfig.chatAgentPath}/${encodeURIComponent(conversationId)}`,
	});
}

export function startNewChatConversation() {
	localStorage.removeItem(appConfig.chatConversationStorageKey);
	location.reload();
}

export async function sendChatTurn(conversation: ChatTurnClient, text: string) {
	const admission = await conversation.send({ message: { kind: 'user', body: text } });
	try {
		return await conversation.read(admission);
	} catch (error) {
		if (!isLostConversationStream(error)) throw error;
		return await conversation.read(admission.submissionId);
	}
}

export function chatTurnErrorMessage(error: unknown): string {
	if (isLostConversationStream(error)) {
		return 'This conversation was interrupted before a reply arrived. Send again or start over.';
	}
	return error instanceof Error ? error.message : 'Unable to get a reply.';
}

export function isLostConversationStream(error: unknown): boolean {
	if (!hasStatus(error, 404)) return false;
	return envelopeType(error) === 'stream_not_found';
}

function hasStatus(error: unknown, status: number): boolean {
	return typeof error === 'object' && error !== null && 'status' in error && error.status === status;
}

function envelopeType(error: unknown): string | undefined {
	if (typeof error !== 'object' || error === null) return undefined;
	const record = error as { json?: unknown; body?: unknown };
	const payload = record.json ?? record.body;
	if (typeof payload !== 'object' || payload === null) return undefined;
	const envelope = 'error' in payload ? (payload as { error: unknown }).error : payload;
	if (typeof envelope !== 'object' || envelope === null || !('type' in envelope)) return undefined;
	const type = envelope.type;
	return typeof type === 'string' ? type : undefined;
}
