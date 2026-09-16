import type { Context, Hono } from 'hono';
import { appConfig } from '../config/app.config.ts';
import type { CredentialStore } from './credentials.ts';
import { learnerChatStatusForUser } from './learner-key.ts';
import {
	requireSignedSession,
	unauthorizedChatError,
} from './chat-access.ts';
import type { RateLimiter } from './rate-limit.ts';
import { readSessionUserId } from './session.ts';

type ChatRouteStore = Pick<CredentialStore, 'hasUserKey'>;

export function mountChatRoute(
	app: Hono,
	options: {
		secret: string;
		rateLimiter: RateLimiter;
		store: ChatRouteStore;
	},
): void {
	app.use(
		appConfig.chatRoutePath,
		requireSignedSession({
			secret: options.secret,
			rateLimiter: options.rateLimiter,
		}),
	);
	app.get(appConfig.chatRoutePath, (context) => learnerChatStatusResponse(context, options));
}

export async function learnerChatStatusResponse(
	context: Context,
	options: { secret: string; store: ChatRouteStore },
) {
	const userId = await readSessionUserId(context, options.secret);
	if (!userId) return context.json({ error: unauthorizedChatError }, 401);
	return context.json(await learnerChatStatusForUser({ store: options.store, userId }));
}
