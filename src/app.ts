import { createAgentRouter } from '@flue/runtime/routing';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { Chat } from './agents/chat.ts';
import { configureBraintrust } from './braintrust.ts';
import { chatAutoModelHeader, chatAllowsAutoSelection } from './config/chat-auto.ts';
import { chatModel } from './config/chat-model.ts';
import { resolveSessionSecret } from './config/session.ts';
import { requireChatSession, unauthorizedChatError } from './server/chat-access.ts';
import { chatConversationIdFromPath, rememberConversationAuto } from './server/chat-auto.ts';
import {
	chatRateLimitMax,
	chatRateLimitWindowMs,
	createRateLimiter,
} from './server/rate-limit.ts';
import {
	clearSessionCookie,
	mintSessionUserId,
	readSessionUserId,
} from './server/session.ts';
import './server/provider.ts';

configureBraintrust(process.env);

const sessionSecret = resolveSessionSecret(process.env);
const chatRateLimiter = createRateLimiter({
	windowMs: chatRateLimitWindowMs,
	max: chatRateLimitMax,
});

const app = new Hono();

app.get('/healthz', (context) => context.json({ status: 'ok' }));
app.get('/api/session', async (context) => {
	const userId = await readSessionUserId(context, sessionSecret);
	if (!userId) {
		return context.json({ error: unauthorizedChatError }, 401);
	}
	return context.json({ userId });
});
app.post('/api/session', async (context) => {
	const userId = await mintSessionUserId(context, sessionSecret, process.env);
	return context.json({ userId });
});
app.delete('/api/session', (context) => {
	clearSessionCookie(context, process.env);
	return context.json({ ok: true });
});
app.get('/api/session/logout', (context) => {
	clearSessionCookie(context, process.env);
	return context.redirect('/login.html');
});
app.use(
	'/api/agents/chat/*',
	requireChatSession({ secret: sessionSecret, rateLimiter: chatRateLimiter }),
);
app.use('/api/agents/chat/*', async (context, next) => {
	if (chatAllowsAutoSelection(chatModel.modelId)) {
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
