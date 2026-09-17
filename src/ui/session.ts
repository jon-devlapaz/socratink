import { appConfig } from '../config/app.config.ts';
import { isSessionUserId } from '../config/session.ts';

export type SessionUser = {
	userId: string;
	aliases: string[];
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

export async function readOrCreateSession(): Promise<SessionUser | undefined> {
	try {
		return (await readSession()) ?? (await createSession());
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

export type AuthProviders = {
	google: boolean;
	github: boolean;
};

const noAuthProviders: AuthProviders = { google: false, github: false };

export async function loadAuthProviders(): Promise<AuthProviders> {
	try {
		const response = await fetch(appConfig.authProvidersPath, { credentials: 'same-origin' });
		if (!response.ok) return noAuthProviders;
		return authProvidersFromUnknown(await response.json());
	} catch {
		return noAuthProviders;
	}
}

function authProvidersFromUnknown(value: unknown): AuthProviders {
	if (typeof value !== 'object' || value === null) return noAuthProviders;
	const record = value as { google?: unknown; github?: unknown };
	return {
		google: record.google === true,
		github: record.github === true,
	};
}

function sessionUserFromUnknown(value: unknown): SessionUser | undefined {
	if (typeof value !== 'object' || value === null || !('userId' in value) || !('aliases' in value)) {
		return undefined;
	}
	if (!isSessionUserId(value.userId) || !Array.isArray(value.aliases)) return undefined;
	return { userId: value.userId, aliases: value.aliases.filter(isSessionUserId) };
}
