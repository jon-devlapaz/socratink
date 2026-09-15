import { appConfig } from './app.config.ts';

export const sessionCookieName = 'socratink-session';

export type SessionEnvironment = Readonly<{
	SESSION_SECRET?: string;
	NF_PROJECT_ID?: string;
	NODE_ENV?: string;
	VERCEL?: string;
}>;

export function resolveSessionSecret(environment: SessionEnvironment): string {
	const secret = environment.SESSION_SECRET?.trim();
	if (secret) return secret;

	if (
		environment.NODE_ENV === 'production' ||
		environment.NF_PROJECT_ID ||
		environment.VERCEL === '1'
	) {
		throw new Error('SESSION_SECRET is required for hosted learner sessions.');
	}

	return 'socratink-local-session-secret';
}

export function sessionUsesSecureCookie(environment: SessionEnvironment): boolean {
	return (
		environment.NODE_ENV === 'production' ||
		Boolean(environment.NF_PROJECT_ID) ||
		environment.VERCEL === '1'
	);
}

export function isSessionUserId(value: unknown): value is string {
	return typeof value === 'string' && value.length > 0 && !value.includes(':');
}

export function namespacedConversationId(userId: string, nonce: string): string {
	return `${userId}:${nonce}`;
}

export function conversationBelongsToUser(conversationId: string, userId: string): boolean {
	if (!isSessionUserId(userId)) return false;
	const prefix = `${userId}:`;
	return conversationId.startsWith(prefix) && conversationId.length > prefix.length;
}

export function chatConversationIdFromPath(path: string): string | undefined {
	const prefix = `${appConfig.chatAgentPath}/`;
	if (!path.startsWith(prefix)) return undefined;
	const id = path.slice(prefix.length).split('/')[0];
	if (!id) return undefined;
	try {
		return decodeURIComponent(id);
	} catch {
		return id;
	}
}
