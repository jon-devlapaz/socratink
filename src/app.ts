import { waitUntil } from '@vercel/functions';
import { Hono } from 'hono';
import { createApp } from './app-factory.ts';
import { resolveDatabaseTarget } from './config/database.ts';
import { createInference } from './inference/index.ts';
import { resolveChatModel } from './inference/operator.ts';
import { getAuthDb } from './server/auth-runtime.ts';
import { getCredentialStore } from './server/credential-runtime.ts';
import { mountBrowserBridge } from './server/durable/browser-bridge.ts';
import { openEngine } from './server/durable/engine.ts';
import { logTurn, reportFailure } from './server/logging.ts';

const target = resolveDatabaseTarget(process.env);
const inference = createInference({ authDb: getAuthDb(), store: getCredentialStore(),
	operator: () => resolveChatModel(process.env) });
const engine = await openEngine({ target, resolveModel: inference.resolveModel, keepAlive: waitUntil, report: reportFailure, logTurn });
const chat = new Hono();

mountBrowserBridge(chat, engine, inference.selection);

export default createApp(chat, inference);
