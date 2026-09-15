import { appConfig } from '../config/app.config.ts';
import { isSessionUserId } from '../config/session.ts';

export type SessionUser = {
	userId: string;
};

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

function sessionUserFromUnknown(value: unknown): SessionUser | undefined {
	if (typeof value !== 'object' || value === null || !('userId' in value)) return undefined;
	return isSessionUserId(value.userId) ? { userId: value.userId } : undefined;
}
