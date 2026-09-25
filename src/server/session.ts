import { deleteCookie, getSignedCookie, setSignedCookie } from 'hono/cookie';
import type { Context, Hono } from 'hono';
import {
	encodeSessionCookieValue,
	generateSessionNonce,
	parseSessionCookieValue,
	sessionCookieName,
	sessionUsesSecureCookie,
	type SessionCookie,
	type SessionCookieKind,
	type SessionEnvironment,
} from '../config/session.ts';
import type { AuthDb } from './auth-db.ts';

export const unauthorizedSessionError = {
	type: 'unauthorized',
	message: 'A signed session is required.',
} as const;

type SessionEnv = { Variables: { socratinkSession?: SessionCookie | null } };

export function mountSessionRoutes(app: Hono, options: { secret: string; authDb: AuthDb }): void {
	app.get('/api/session', async (context) => {
		const session = await readSession(context, options.secret, options.authDb);
		if (!session) {
			return context.json({ error: unauthorizedSessionError }, 401);
		}
		const aliases = await options.authDb.findAliases(session.userId);
		return context.json({ userId: session.userId, aliases, kind: session.kind });
	});
	app.post('/api/session', async (context) => {
		const userId = await mintSessionUserId(context, options.secret, process.env, options.authDb);
		const aliases = await options.authDb.findAliases(userId);
		const session = sessionFromContext(context);
		if (!session) {
			return context.json({ error: unauthorizedSessionError }, 401);
		}
		return context.json({ userId, aliases, kind: session.kind });
	});
	app.get('/api/session/logout', (context) => {
		clearSessionCookie(context, process.env);
		return context.redirect('/login.html');
	});
}

// HMAC-verified cookie after guest revocation. Cached on the request so chat
// middleware and handlers do not re-hit users/aliases.
export async function readSession(
	context: Context,
	secret: string,
	authDb: AuthDb,
): Promise<SessionCookie | undefined> {
	const cached = sessionSlot(context);
	if (cached !== undefined) return cached ?? undefined;

	const value = await getSignedCookie(context, secret, sessionCookieName);
	const cookie = parseSessionCookieValue(value);
	const session = cookie ? await liveSession(cookie, authDb) : undefined;
	setSessionSlot(context, session ?? null);
	return session;
}

export function sessionFromContext(context: Context): SessionCookie | undefined {
	return sessionSlot(context) ?? undefined;
}

export async function writeSessionCookie(
	context: Context,
	userId: string,
	secret: string,
	environment: SessionEnvironment,
	kind: SessionCookieKind,
): Promise<void> {
	const cookie: SessionCookie = { userId, kind, nonce: generateSessionNonce() };
	await setSignedCookie(context, sessionCookieName, encodeSessionCookieValue(cookie), secret, {
		path: '/',
		httpOnly: true,
		sameSite: 'Lax',
		secure: sessionUsesSecureCookie(environment),
	});
	setSessionSlot(context, cookie);
}

export function clearSessionCookie(context: Context, environment: SessionEnvironment = {}): void {
	deleteCookie(context, sessionCookieName, {
		path: '/',
		secure: sessionUsesSecureCookie(environment),
	});
	setSessionSlot(context, null);
}

export async function mintSessionUserId(
	context: Context,
	secret: string,
	environment: SessionEnvironment,
	authDb: AuthDb,
): Promise<string> {
	const existing = await readSession(context, secret, authDb);
	if (existing) return existing.userId;
	const userId = crypto.randomUUID();
	await writeSessionCookie(context, userId, secret, environment, 'guest');
	return userId;
}

async function liveSession(cookie: SessionCookie, authDb: AuthDb): Promise<SessionCookie | undefined> {
	if (cookie.kind === 'registered') return cookie;
	const [user, owner] = await Promise.all([
		authDb.findUserById(cookie.userId),
		authDb.findAliasOwner(cookie.userId),
	]);
	if (user || owner) return undefined;
	return cookie;
}

function sessionSlot(context: Context): SessionCookie | null | undefined {
	return (context as Context<SessionEnv>).get('socratinkSession');
}

function setSessionSlot(context: Context, value: SessionCookie | null): void {
	(context as Context<SessionEnv>).set('socratinkSession', value);
}
