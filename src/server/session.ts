import { deleteCookie, getSignedCookie, setSignedCookie } from 'hono/cookie';
import type { Context } from 'hono';
import {
	sessionCookieName,
	sessionUsesSecureCookie,
	type SessionEnvironment,
} from '../config/session.ts';

export async function readSessionUserId(
	context: Context,
	secret: string,
): Promise<string | undefined> {
	const value = await getSignedCookie(context, secret, sessionCookieName);
	if (typeof value !== 'string' || value.length === 0 || value.includes(':')) return undefined;
	return value;
}

export async function writeSessionCookie(
	context: Context,
	userId: string,
	secret: string,
	environment: SessionEnvironment = {},
): Promise<void> {
	await setSignedCookie(context, sessionCookieName, userId, secret, {
		path: '/',
		httpOnly: true,
		sameSite: 'Lax',
		secure: sessionUsesSecureCookie(environment),
	});
}

export function clearSessionCookie(context: Context, environment: SessionEnvironment = {}): void {
	deleteCookie(context, sessionCookieName, {
		path: '/',
		secure: sessionUsesSecureCookie(environment),
	});
}

export async function mintSessionUserId(
	context: Context,
	secret: string,
	environment: SessionEnvironment = {},
): Promise<string> {
	const existing = await readSessionUserId(context, secret);
	if (existing) return existing;
	const userId = crypto.randomUUID();
	await writeSessionCookie(context, userId, secret, environment);
	return userId;
}
