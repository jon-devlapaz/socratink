import { deleteCookie, getSignedCookie, setSignedCookie } from 'hono/cookie';
import type { Context, Hono } from 'hono';
import {
	isSessionUserId,
	sessionCookieName,
	sessionUsesSecureCookie,
	type SessionEnvironment,
} from '../config/session.ts';
import type { AuthDb } from './auth-db.ts';

export const unauthorizedSessionError = {
	type: 'unauthorized',
	message: 'A signed session is required.',
} as const;

export function mountSessionRoutes(app: Hono, options: { secret: string; authDb: AuthDb }): void {
	app.get('/api/session', async (context) => {
		const userId = await readSessionUserId(context, options.secret);
		if (!userId) {
			return context.json({ error: unauthorizedSessionError }, 401);
		}
		const aliases = await options.authDb.findAliases(userId);
		return context.json({ userId, aliases });
	});
	app.post('/api/session', async (context) => {
		const userId = await mintSessionUserId(context, options.secret, process.env);
		const aliases = await options.authDb.findAliases(userId);
		return context.json({ userId, aliases });
	});
	app.get('/api/session/logout', (context) => {
		clearSessionCookie(context, process.env);
		return context.redirect('/login.html');
	});
}

export async function readSessionUserId(
	context: Context,
	secret: string,
): Promise<string | undefined> {
	const value = await getSignedCookie(context, secret, sessionCookieName);
	return isSessionUserId(value) ? value : undefined;
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
