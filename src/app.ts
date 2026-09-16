import { createAgentRouter } from '@flue/runtime/routing';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { Chat } from './agents/chat.ts';
import { configureBraintrust } from './braintrust.ts';
import { chatAutoModelHeader, chatAllowsAutoSelection } from './config/chat-auto.ts';
import { chatModel, type LearnerChatRoute } from './config/chat-model.ts';
import { chatConversationIdFromPath, resolveSessionSecret } from './config/session.ts';
import { requireChatSession } from './server/chat-access.ts';
import { rememberConversationAuto } from './server/chat-auto.ts';
import { getCredentialStore } from './server/credential-runtime.ts';
import { learnerChatRouteForUser } from './server/learner-key.ts';
import { mountOpenaiKeyRoutes } from './server/openai-key.ts';
import { mountOpenrouterRoutes } from './server/openrouter.ts';
import {
	chatRateLimitMax,
	chatRateLimitWindowMs,
	createRateLimiter,
} from './server/rate-limit.ts';
import {
	clearSessionCookie,
	mintSessionUserId,
	readSessionUserId,
	unauthorizedSessionError,
} from './server/session.ts';
import './server/provider.ts';

configureBraintrust(process.env);

const sessionSecret = resolveSessionSecret(process.env);
const credentialStore = getCredentialStore();
const chatRateLimiter = createRateLimiter({
	windowMs: chatRateLimitWindowMs,
	max: chatRateLimitMax,
});

const app = new Hono();

app.get('/healthz', (context) => context.json({ status: 'ok' }));
app.get('/api/session', async (context) => {
	const userId = await readSessionUserId(context, sessionSecret);
	if (!userId) {
		return context.json({ error: unauthorizedSessionError }, 401);
	}
	return context.json({ userId });
});
app.post('/api/session', async (context) => {
	const userId = await mintSessionUserId(context, sessionSecret, process.env);
	return context.json({ userId });
});
app.get('/api/session/logout', (context) => {
	clearSessionCookie(context, process.env);
	return context.redirect('/login.html');
});
mountOpenaiKeyRoutes(app, {
	secret: sessionSecret,
	rateLimiter: chatRateLimiter,
	store: credentialStore,
});
mountOpenrouterRoutes(app, {
	secret: sessionSecret,
	rateLimiter: chatRateLimiter,
	store: credentialStore,
});
app.use(
	'/api/agents/chat/*',
	requireChatSession({ secret: sessionSecret, rateLimiter: chatRateLimiter }),
);
app.use('/api/agents/chat/*', async (context, next) => {
	const userId = await readSessionUserId(context, sessionSecret);
	const route: LearnerChatRoute = userId
		? await learnerChatRouteForUser({ store: credentialStore, userId })
		: { kind: 'operator' };
	if (route.kind === 'operator' && chatAllowsAutoSelection(chatModel.modelId)) {
		rememberConversationAuto(
			chatConversationIdFromPath(context.req.path),
			context.req.header(chatAutoModelHeader),
		);
	}
	return next();
});
app.route('/api/agents/chat', createAgentRouter(Chat));
app.all('/api/*', (context) =>
	context.json({ error: { type: 'not_found', message: 'API route not found.' } }, 404),
);
app.get('/login', (context) => context.redirect('/login.html'));
app.use('*', serveStatic({ root: './dist/client' }));
app.get('*', serveStatic({ path: './dist/client/index.html' }));

export default app;
