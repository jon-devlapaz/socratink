import {
	learnerChatRoute,
	type LearnerChatStatus,
	type LearnerCredentialName,
} from '../config/chat-model.ts';
import type { CredentialStore } from '../server/credentials.ts';

export const openaiCredentialName: LearnerCredentialName = 'openai';

export async function learnerChatStatusForUser(options: {
	store: Pick<CredentialStore, 'hasUserKey'>;
	userId: string;
}): Promise<LearnerChatStatus> {
	const openai = await options.store.hasUserKey({ userId: options.userId, name: openaiCredentialName });
	return { kind: learnerChatRoute({ openai }).kind, openai };
}
