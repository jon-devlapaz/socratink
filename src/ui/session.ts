import { appConfig } from '../config/app.config.ts';

export type SessionUser = {
	userId: string;
};

export function isPlausibleEmail(value: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export async function readSession(): Promise<SessionUser | undefined> {
	try {
		const response = await fetch(appConfig.sessionPath, { credentials: 'same-origin' });
		if (!response.ok) return undefined;
		return sessionUserFromUnknown(await response.json());
	} catch {
		return undefined;
	}
}

export async function createSession(): Promise<SessionUser> {
	const response = await fetch(appConfig.sessionPath, {
		method: 'POST',
		credentials: 'same-origin',
	});
	if (!response.ok) throw new Error('Unable to start a session.');
	const session = sessionUserFromUnknown(await response.json());
	if (!session) throw new Error('Unable to start a session.');
	return session;
}

export async function clearSession(): Promise<void> {
	try {
		await fetch(appConfig.sessionPath, { method: 'DELETE', credentials: 'same-origin' });
	} finally {
		localStorage.removeItem(appConfig.chatConversationStorageKey);
	}
}

function sessionUserFromUnknown(value: unknown): SessionUser | undefined {
	if (typeof value !== 'object' || value === null || !('userId' in value)) return undefined;
	const userId = value.userId;
	if (typeof userId !== 'string' || userId.length === 0 || userId.includes(':')) return undefined;
	return { userId };
}
