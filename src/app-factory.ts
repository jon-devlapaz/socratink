import { existsSync } from 'node:fs';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { resolveAuthConfig } from './config/auth.ts';
import { appConfig } from './config/app.config.ts';
import { resolveSessionSecret } from './config/session.ts';
import { getAuthDb } from './server/auth-runtime.ts';
import { requireChatSession } from './server/chat-access.ts';
import { guestTurnGateMiddleware } from './server/guest-turns.ts';
import { mountOAuthRoutes } from './server/oauth.ts';
import {
	chatRateLimitMax,
	chatRateLimitWindowMs,
	createRateLimiter,
} from './server/rate-limit.ts';
import { mountSessionRoutes } from './server/session.ts';
import { mountFeedbackRoute } from './server/feedback-route.ts';
import { reportFailure } from './server/logging.ts';
import type { Inference } from './inference/index.ts';

const sessionSecret = resolveSessionSecret(process.env);
const authDb = getAuthDb();
const authConfig = resolveAuthConfig(process.env);
const chatRateLimiter = createRateLimiter({
	windowMs: chatRateLimitWindowMs,
	max: chatRateLimitMax,
});

export function createApp(chatRouter: Hono, inference: Pick<Inference, 'operatorStatus'>) {
	const app = new Hono();
	app.onError((_error, context) => {
		reportFailure('request_failed');
		return context.json({ error: { type: 'internal_error', message: 'Unable to complete this request.' } }, 500);
	});

	// Unconfigured inference fails the health check so the monitor alerts before a learner does.
	app.get('/healthz', (context) => {
		const status = inference.operatorStatus();
		return status.state === 'ready'
			? context.json({ status: 'ok', inference: status.route })
			: context.json({ status: 'unconfigured', inference: 'unconfigured' }, 503);
	});
	mountSessionRoutes(app, { secret: sessionSecret, authDb });
	mountFeedbackRoute(app, { secret: sessionSecret, authDb });
	if (authConfig) {
		mountOAuthRoutes(app, {
			config: authConfig,
			secret: sessionSecret,
			authDb,
			onRekey: async () => {},
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
	// Vercel serves the built UI from its CDN, and its function bundle has no
	// dist/client. Mounting there only logs a missing-root error on every cold start.
	if (existsSync('./dist/client')) {
		app.use('*', serveStatic({ root: './dist/client' }));
		app.get('*', serveStatic({ path: './dist/client/index.html' }));
	}

	return app;
}
