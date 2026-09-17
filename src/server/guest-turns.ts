import { deleteCookie, getSignedCookie, setSignedCookie } from 'hono/cookie';
import type { Context, MiddlewareHandler } from 'hono';
import {
	sessionUsesSecureCookie,
	type SessionEnvironment,
} from '../config/session.ts';
import { readSessionUserId } from './session.ts';
import type { AuthDb } from './auth-db.ts';

export const guestTurnsCookieName = 'socratink-guest-turns';
export const guestTurnLimit = 3;
export const guestTurnsHeader = 'X-Socratink-Guest-Turns';

export const guestTurnLimitError = {
	type: 'guest_turn_limit',
	message: 'Sign in to continue this conversation.',
} as const;

export async function readGuestTurnCount(
	context: Context,
	secret: string,
): Promise<number> {
	const raw = await getSignedCookie(context, secret, guestTurnsCookieName);
	if (!raw) return 0;
	const parsed = Number(raw);
	return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : 0;
}

export async function incrementGuestTurns(
	context: Context,
	secret: string,
	environment: SessionEnvironment = {},
): Promise<number> {
	const current = await readGuestTurnCount(context, secret);
	const next = current + 1;
	await setSignedCookie(context, guestTurnsCookieName, String(next), secret, {
		path: '/',
		httpOnly: true,
		sameSite: 'Lax',
		secure: sessionUsesSecureCookie(environment),
	});
	return next;
}

export function clearGuestTurns(
	context: Context,
	environment: SessionEnvironment = {},
): void {
	deleteCookie(context, guestTurnsCookieName, {
		path: '/',
		secure: sessionUsesSecureCookie(environment),
	});
}

// Checks whether the user is a registered (authenticated) user.
async function isRegisteredUser(
	authDb: AuthDb,
	userId: string,
): Promise<boolean> {
	const user = await authDb.findUserById(userId);
	return user !== undefined;
}

export function guestTurnGateMiddleware(options: {
	secret: string;
	authDb: AuthDb;
}): MiddlewareHandler {
	return async (context, next) => {
		// Only gate POST requests that submit a new turn (not aborts or reads).
		if (context.req.method !== 'POST') return next();
		if (context.req.path.endsWith('/abort')) return next();

		const userId = await readSessionUserId(context, options.secret);
		if (!userId) return next();

		// Registered users have no turn cap.
		if (await isRegisteredUser(options.authDb, userId)) return next();

		const count = await readGuestTurnCount(context, options.secret);
		if (count >= guestTurnLimit) {
			return context.json({ error: guestTurnLimitError }, 403);
		}

		const updated = await incrementGuestTurns(context, options.secret, process.env);
		context.header(guestTurnsHeader, String(updated));
		return next();
	};
}
