import { createAgentRouter } from '@flue/runtime/routing';
import { waitUntil } from '@vercel/functions';
import { Hono } from 'hono';
import { Chat } from './agents/chat.ts';
import { createApp } from './app-factory.ts';
import { appConfig } from './config/app.config.ts';
import { chatConversationIdFromPath } from './config/session.ts';
import { resolveDatabaseTarget } from './config/database.ts';
import { resolveChatModel } from './config/operator-model.ts';
import { getAuthDb } from './server/auth-runtime.ts';
import { getCredentialStore } from './server/credential-runtime.ts';
import { mountBrowserBridge } from './server/durable/browser-bridge.ts';
import { openPostgresBrowserStream } from './server/durable/browser-postgres.ts';
import { openBrowserStream } from './server/durable/browser-stream.ts';
import { openEngine } from './server/durable/engine.ts';
import { modelRouting } from './server/durable/model-routing.ts';
import { rememberLegacySelection } from './server/legacy-selection.ts';
import { reportFailure } from './server/failure-logging.ts';

const target = resolveDatabaseTarget(process.env);
const routing = modelRouting({ authDb: getAuthDb(), store: getCredentialStore(),
	operator: () => resolveChatModel(process.env) });
const engine = await openEngine({ target, resolveModel: routing.resolveModel, keepAlive: waitUntil, report: reportFailure });
const stream = target.kind === 'postgres'
	? await openPostgresBrowserStream(target.connectionString)
	: openBrowserStream(target.filename);
const legacy = new Hono().route(appConfig.chatAgentPath, createAgentRouter(Chat));
const chat = new Hono();

chat.use('*', async (context, next) => {
	const id = chatConversationIdFromPath(context.req.path);
	if (!id) return context.notFound();
	if (!(await engine.exists(id))) {
		// HEAD reads Flue's stream metadata without admitting work or creating history.
		const probeUrl = new URL(context.req.url);
		probeUrl.pathname = `${appConfig.chatAgentPath}/${encodeURIComponent(id)}`;
		probeUrl.search = '';
		const existing = await legacy.fetch(new Request(probeUrl, { method: 'HEAD' }), context.env);
		if (existing.ok) {
			await rememberLegacySelection(context);
			return legacy.fetch(context.req.raw, context.env);
		}
		// A database failure must never silently start a second conversation in Pi.
		if (existing.status !== 404) return existing;
	}
	return next();
});

mountBrowserBridge(chat, engine, routing.selection, stream);

export default createApp(chat, 'pi-durable');
