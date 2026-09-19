import type { Context, Hono, MiddlewareHandler } from 'hono';
import { appConfig } from '../config/app.config.ts';
import type { CredentialStore } from './credentials.ts';
import { learnerChatStatusForUser } from './learner-key.ts';
import { unauthorizedChatError } from './chat-access.ts';
import { sessionFromContext } from './session.ts';

type ChatRouteStore = Pick<CredentialStore, 'hasUserKey'>;

export function mountChatRoute(
	app: Hono,
	options: {
		signed: MiddlewareHandler;
		store: ChatRouteStore;
	},
): void {
	app.use(appConfig.chatRoutePath, options.signed);
	app.get(appConfig.chatRoutePath, (context) => learnerChatStatusResponse(context, options));
}

export async function learnerChatStatusResponse(
	context: Context,
	options: { store: ChatRouteStore },
) {
	const userId = sessionFromContext(context)?.userId;
	if (!userId) return context.json({ error: unauthorizedChatError }, 401);
	return context.json(await learnerChatStatusForUser({ store: options.store, userId }));
}
