import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { resolveAuthConfig } from './config/auth.ts';
import { appConfig } from './config/app.config.ts';
import { resolveSessionSecret } from './config/session.ts';
import { getAuthDb } from './server/auth-runtime.ts';
import { requireChatSession, requireSignedSession } from './server/chat-access.ts';
import { mountChatRoute } from './server/chat-route.ts';
import { getCredentialStore } from './server/credential-runtime.ts';
import { guestTurnGateMiddleware } from './server/guest-turns.ts';
import { mountOAuthRoutes } from './server/oauth.ts';
import { mountOpenaiKeyRoutes } from './server/openai-key.ts';
import {
	chatRateLimitMax,
	chatRateLimitWindowMs,
	createRateLimiter,
} from './server/rate-limit.ts';
import { mountSessionRoutes } from './server/session.ts';
import './server/provider.ts';
import { reportFailure } from './server/failure-logging.ts';

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

export function createApp(chatRouter: Hono, harness: 'pi-durable' | 'flue') {
	const app = new Hono();
	app.onError((_error, context) => {
		reportFailure('request_failed');
		return context.json({ error: { type: 'internal_error', message: 'Unable to complete this request.' } }, 500);
	});

	app.get('/healthz', (context) => context.json(harness === 'pi-durable' ? { status: 'ok', harness } : { status: 'ok' }));
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

	app.route(appConfig.chatAgentPath, chatRouter);
	app.all('/api/*', (context) =>
		context.json({ error: { type: 'not_found', message: 'API route not found.' } }, 404),
	);
	app.get('/login', (context) => context.redirect('/login.html'));
	app.use('*', serveStatic({ root: './dist/client' }));
	app.get('*', serveStatic({ path: './dist/client/index.html' }));

	return app;
}
