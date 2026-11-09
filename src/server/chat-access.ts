import type { Context, MiddlewareHandler } from 'hono';
import {
	chatConversationIdFromPath,
	conversationBelongsToUser,
} from '../config/session.ts';
import type { AuthDb } from './auth-db.ts';
import type { RateLimiter } from './rate-limit.ts';
import { readSession, unauthorizedSessionError } from './session.ts';

export const forbiddenChatError = {
	type: 'forbidden',
	message: 'This conversation does not belong to the current session.',
} as const;

export const rateLimitedChatError = {
	type: 'rate_limited',
	message: 'Too many Chat requests for this session.',
} as const;

type SessionAdmissionOptions = {
	secret: string;
	rateLimiter: RateLimiter;
	authDb: AuthDb;
};

export function requireSignedSession(options: SessionAdmissionOptions): MiddlewareHandler {
	return async (context, next) => {
		const admitted = await admitSignedSession(context, options);
		return admitted instanceof Response ? admitted : next();
	};
}

export function requireChatSession(options: SessionAdmissionOptions): MiddlewareHandler {
	return async (context, next) => {
		const admitted = await admitSignedSession(context, options);
		if (admitted instanceof Response) return admitted;

		const conversationId = chatConversationIdFromPath(context.req.path);
		const aliases = await options.authDb.findAliases(admitted.userId);
		if (!conversationId || !conversationBelongsToUser(conversationId, admitted.userId, aliases)) {
			return jsonError(context, 403, forbiddenChatError);
		}
		return next();
	};
}

async function admitSignedSession(context: Context, options: SessionAdmissionOptions) {
	const session = await readSession(context, options.secret, options.authDb);
	if (!session) return jsonError(context, 401, unauthorizedSessionError);

	const limited = options.rateLimiter.consume(session.userId);
	if (!limited.ok) {
		const retryAfterSeconds = Math.max(1, Math.ceil(limited.retryAfterMs / 1000));
		context.header('Retry-After', String(retryAfterSeconds));
		return jsonError(context, 429, rateLimitedChatError);
	}
	return session;
}

function jsonError(
	context: Context,
	status: 401 | 403 | 429,
	error: { type: string; message: string },
) {
	return context.json({ error }, status);
}
