import { createAgentRouter } from '@flue/runtime/routing';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { Chat } from './agents/chat.ts';
import { resolveAuthConfig } from './config/auth.ts';
import { chatAutoModelHeader, chatAllowsAutoSelection } from './config/chat-auto.ts';
import { chatModelHeader, type LearnerChatRoute } from './config/chat-model.ts';
import { chatModel } from './config/operator-model.ts';
import { appConfig } from './config/app.config.ts';
import { chatConversationIdFromPath, resolveSessionSecret } from './config/session.ts';
import { getAuthDb } from './server/auth-runtime.ts';
import { requireChatSession, requireSignedSession } from './server/chat-access.ts';
import { rememberConversationAuto } from './server/chat-auto.ts';
import { mountChatRoute } from './server/chat-route.ts';
import { getCredentialStore } from './server/credential-runtime.ts';
import { guestTurnGateMiddleware } from './server/guest-turns.ts';
import { learnerChatStatusForUser, rememberConversationChatPick } from './server/learner-key.ts';
import { mountOAuthRoutes } from './server/oauth.ts';
import { mountOpenaiKeyRoutes } from './server/openai-key.ts';
import {
	chatRateLimitMax,
	chatRateLimitWindowMs,
	createRateLimiter,
} from './server/rate-limit.ts';
import { mountSessionRoutes, sessionFromContext } from './server/session.ts';
import './server/provider.ts';

const sessionSecret = resolveSessionSecret(process.env);
const credentialStore = getCredentialStore();
const authDb = getAuthDb();
const authConfig = resolveAuthConfig(process.env);
const chatRateLimiter = createRateLimiter({
	windowMs: chatRateLimitWindowMs,
	max: chatRateLimitMax,
});
const signedSession = requireSignedSession({
	secret: sessionSecret,
	rateLimiter: chatRateLimiter,
	authDb,
});

const app = new Hono();

app.get('/healthz', (context) => context.json({ status: 'ok' }));
mountSessionRoutes(app, { secret: sessionSecret, authDb });
mountOpenaiKeyRoutes(app, {
	signed: signedSession,
	store: credentialStore,
});
mountChatRoute(app, {
	signed: signedSession,
	store: credentialStore,
});
if (authConfig) {
	mountOAuthRoutes(app, {
		config: authConfig,
		secret: sessionSecret,
		authDb,
		onRekey: (guestUserId, durableUserId) =>
			credentialStore.rekeyUser({ fromUserId: guestUserId, toUserId: durableUserId }),
	});
}
app.use(
	`${appConfig.chatAgentPath}/*`,
	guestTurnGateMiddleware({ secret: sessionSecret, authDb }),
);
app.use(
	`${appConfig.chatAgentPath}/*`,
	requireChatSession({ secret: sessionSecret, rateLimiter: chatRateLimiter, authDb }),
);
app.use(`${appConfig.chatAgentPath}/*`, async (context, next) => {
	const userId = sessionFromContext(context)?.userId;
	const route: LearnerChatRoute = userId
		? await learnerChatStatusForUser({ store: credentialStore, userId })
		: { kind: 'operator' };
	const conversationId = chatConversationIdFromPath(context.req.path);
	if (route.kind === 'operator' && chatAllowsAutoSelection(chatModel.modelId)) {
		rememberConversationAuto(conversationId, context.req.header(chatAutoModelHeader));
	}
	rememberConversationChatPick(conversationId, context.req.header(chatModelHeader));
	return next();
});
app.route(appConfig.chatAgentPath, createAgentRouter(Chat));
app.all('/api/*', (context) =>
	context.json({ error: { type: 'not_found', message: 'API route not found.' } }, 404),
);
app.get('/login', (context) => context.redirect('/login.html'));
app.use('*', serveStatic({ root: './dist/client' }));
app.get('*', serveStatic({ path: './dist/client/index.html' }));

export default app;
