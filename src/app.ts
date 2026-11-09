import { waitUntil } from '@vercel/functions';
import { Hono } from 'hono';
import { createApp } from './app-factory.ts';
import { resolveDatabaseTarget } from './config/database.ts';
import { createInference } from './inference/index.ts';
import { resolveChatModel } from './inference/operator.ts';
import { getAuthDb } from './server/auth-runtime.ts';
import { getCredentialStore } from './server/credential-runtime.ts';
import { mountBrowserBridge } from './server/durable/browser-bridge.ts';
import { openPostgresBrowserStream } from './server/durable/browser-postgres.ts';
import { openBrowserStream } from './server/durable/browser-stream.ts';
import { openEngine } from './server/durable/engine.ts';
import { reportFailure } from './server/failure-logging.ts';

const target = resolveDatabaseTarget(process.env);
const inference = createInference({ authDb: getAuthDb(), store: getCredentialStore(),
	operator: () => resolveChatModel(process.env) });
const engine = await openEngine({ target, resolveModel: inference.resolveModel, keepAlive: waitUntil, report: reportFailure });
const stream = target.kind === 'postgres'
	? await openPostgresBrowserStream(target.connectionString)
	: openBrowserStream(target.filename);
const chat = new Hono();

mountBrowserBridge(chat, engine, inference.selection, stream);

export default createApp(chat, inference);
