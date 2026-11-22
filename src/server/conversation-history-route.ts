import type { Hono } from 'hono';
import { appConfig } from '../config/app.config.ts';
import { chatConversationIdFromPath } from '../config/session.ts';
import type { AuthDb } from './auth-db.ts';
import { admitSignedSession } from './chat-access.ts';
import type { ConversationIndex } from './conversation-index.ts';
import { reportFailure } from './logging.ts';
import type { RateLimiter } from './rate-limit.ts';

type ConversationHistoryOptions = Readonly<{
	secret: string;
	rateLimiter: RateLimiter;
	authDb: AuthDb;
	index: ConversationIndex;
}>;

export function mountConversationHistory(app: Hono, options: ConversationHistoryOptions) {
	app.use(`${appConfig.chatAgentPath}/*`, async (context, next) => {
		const message = context.req.method === 'POST' ? await context.req.json().catch(() => null) : null;
		await next();
		if (context.res.status !== 202 || typeof message?.body !== 'string') return;
		const conversationId = chatConversationIdFromPath(context.req.path);
		if (!conversationId) return;
		try {
			await options.index.recordAdmitted(conversationId, message.body);
		} catch {
			reportFailure('conversation_index_failed');
		}
	});

	app.get(appConfig.conversationsPath, async (context) => {
		const session = await admitSignedSession(context, options);
		if (session instanceof Response) return session;
		const aliases = await options.authDb.findAliases(session.userId);
		context.header('Cache-Control', 'no-store');
		return context.json({ conversations: await options.index.list([session.userId, ...aliases]) });
	});
}
