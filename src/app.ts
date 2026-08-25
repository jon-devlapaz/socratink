import { createAgentRouter } from '@flue/runtime/routing';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { Chat } from './agents/chat.ts';
import { configureBraintrust } from './braintrust.ts';
import './server/provider.ts';

configureBraintrust(process.env);

const app = new Hono();

app.route('/api/agents/chat', createAgentRouter(Chat));
app.use('*', serveStatic({ root: './dist/client' }));
app.get('*', serveStatic({ path: './dist/client/index.html' }));

export default app;
