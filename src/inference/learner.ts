import {
	learnerChatRoute,
	type LearnerChatStatus,
	type LearnerCredentialName,
} from '../config/chat-model.ts';
import type { CredentialStore } from '../server/credentials.ts';

export const openaiCredentialName: LearnerCredentialName = 'openai';

export const openrouterCredentialName: LearnerCredentialName = 'openrouter';

export async function learnerChatStatusForUser(options: {
	store: Pick<CredentialStore, 'hasUserKey'>;
	userId: string;
}): Promise<LearnerChatStatus> {
	const [openai, openrouter] = await Promise.all([
		options.store.hasUserKey({ userId: options.userId, name: openaiCredentialName }),
		options.store.hasUserKey({ userId: options.userId, name: openrouterCredentialName }),
	]);
	return { kind: learnerChatRoute({ openai, openrouter }).kind, openai, openrouter };
}
