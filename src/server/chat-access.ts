import type { Context, MiddlewareHandler } from 'hono';
import {
	chatConversationIdFromPath,
	conversationBelongsToUser,
} from '../config/session.ts';
import type { AuthDb } from './auth-db.ts';
import type { RateLimiter } from './rate-limit.ts';
import { readSession } from './session.ts';

export const unauthorizedChatError = {
	type: 'unauthorized',
	message: 'A signed session is required.',
} as const;

export const forbiddenChatError = {
	type: 'forbidden',
	message: 'This conversation does not belong to the current session.',
} as const;

export const rateLimitedChatError = {
	type: 'rate_limited',
	message: 'Too many Chat requests for this session.',
} as const;

export function requireSignedSession(options: {
	secret: string;
	rateLimiter: RateLimiter;
	authDb: AuthDb;
}): MiddlewareHandler {
	return async (context, next) => {
		const session = await readSession(context, options.secret, options.authDb);
		if (!session) return jsonError(context, 401, unauthorizedChatError);

		const limited = options.rateLimiter.consume(session.userId);
		if (!limited.ok) {
			const retryAfterSeconds = Math.max(1, Math.ceil(limited.retryAfterMs / 1000));
			context.header('Retry-After', String(retryAfterSeconds));
			return jsonError(context, 429, rateLimitedChatError);
		}

		return next();
	};
}

export function requireChatSession(options: {
	secret: string;
	rateLimiter: RateLimiter;
	authDb: AuthDb;
}): MiddlewareHandler {
	return async (context, next) => {
		const session = await readSession(context, options.secret, options.authDb);
		if (!session) return jsonError(context, 401, unauthorizedChatError);

		const limited = options.rateLimiter.consume(session.userId);
		if (!limited.ok) {
			const retryAfterSeconds = Math.max(1, Math.ceil(limited.retryAfterMs / 1000));
			context.header('Retry-After', String(retryAfterSeconds));
			return jsonError(context, 429, rateLimitedChatError);
		}

		const conversationId = chatConversationIdFromPath(context.req.path);
		const aliases = await options.authDb.findAliases(session.userId);
		if (!conversationId || !conversationBelongsToUser(conversationId, session.userId, aliases)) {
			return jsonError(context, 403, forbiddenChatError);
		}

		return next();
	};
}

function jsonError(
	context: Context,
	status: 401 | 403 | 429,
	error: { type: string; message: string },
) {
	return context.json({ error }, status);
}
