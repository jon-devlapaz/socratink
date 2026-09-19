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
	return Boolean(
		environment.NODE_ENV === 'production' ||
		environment.NF_PROJECT_ID ||
		environment.VERCEL === '1',
	);
}

export function isSessionUserId(value: unknown): value is string {
	return typeof value === 'string' && value.length > 0 && !value.includes(':');
}

// Signed session cookie payload. The cookie nonce is per-cookie randomness and
// is unrelated to the nonce in `${userId}:${nonce}` conversation ids.
export type SessionCookieKind = 'guest' | 'registered';

export type SessionCookie = Readonly<{
	userId: string;
	kind: SessionCookieKind;
	nonce: string;
}>;

const sessionCookieVersion = '1';
const sessionNonceBytes = 16;
const sessionNoncePattern = /^[0-9a-f]{32}$/;

export function generateSessionNonce(): string {
	const bytes = new Uint8Array(sessionNonceBytes);
	crypto.getRandomValues(bytes);
	return [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function encodeSessionCookieValue(cookie: SessionCookie): string {
	const kind = cookie.kind === 'registered' ? 'r' : 'g';
	return `${sessionCookieVersion}.${kind}.${cookie.userId}.${cookie.nonce}`;
}

export function parseSessionCookieValue(value: unknown): SessionCookie | undefined {
	if (typeof value !== 'string' || value.length === 0) return undefined;
	const versionEnd = value.indexOf('.');
	const kindEnd = versionEnd < 0 ? -1 : value.indexOf('.', versionEnd + 1);
	const nonceStart = value.lastIndexOf('.');
	if (versionEnd <= 0 || kindEnd <= versionEnd + 1 || nonceStart <= kindEnd + 1) return undefined;
	if (value.slice(0, versionEnd) !== sessionCookieVersion) return undefined;
	const kindSegment = value.slice(versionEnd + 1, kindEnd);
	if (kindSegment !== 'g' && kindSegment !== 'r') return undefined;
	const userId = value.slice(kindEnd + 1, nonceStart);
	const nonce = value.slice(nonceStart + 1);
	if (!isSessionUserId(userId) || !sessionNoncePattern.test(nonce)) return undefined;
	return { userId, kind: kindSegment === 'r' ? 'registered' : 'guest', nonce };
}

export function namespacedConversationId(userId: string, nonce: string): string {
	return `${userId}:${nonce}`;
}

export function conversationBelongsToUser(
	conversationId: string,
	userId: string,
	aliases: readonly string[] = [],
): boolean {
	if (!isSessionUserId(userId)) return false;
	const ids = [userId, ...aliases.filter((alias) => isSessionUserId(alias))];
	return ids.some((id) => {
		const prefix = `${id}:`;
		return conversationId.startsWith(prefix) && conversationId.length > prefix.length;
	});
}

export function userIdFromConversationId(conversationId: string | undefined): string | undefined {
	if (!conversationId) return undefined;
	const separator = conversationId.indexOf(':');
	if (separator <= 0) return undefined;
	const userId = conversationId.slice(0, separator);
	return conversationBelongsToUser(conversationId, userId) ? userId : undefined;
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
