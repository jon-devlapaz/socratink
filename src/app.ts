import './braintrust.ts';
import { createAgentRouter } from '@flue/runtime/routing';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { Chat } from './agents/chat.ts';
import { createR1Router } from './r1/routes.ts';
import './server/provider.ts';

const app = new Hono();

app.route('/api/agents/chat', createAgentRouter(Chat));
const r1Router = await createR1Router();
if (r1Router) app.route('/api/r1', r1Router);
app.use('*', serveStatic({ root: './dist/client' }));
app.get('*', serveStatic({ path: './dist/client/index.html' }));

export default app;
