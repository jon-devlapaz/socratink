import { createAgentRouter } from '@flue/runtime/routing';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { Chat } from './agents/chat.ts';
import { configureBraintrust } from './braintrust.ts';
import { chatAutoModelHeader, chatAllowsAutoSelection } from './config/chat-auto.ts';
import { chatModel } from './config/chat-model.ts';
import { chatConversationIdFromPath, rememberConversationAuto } from './server/chat-auto.ts';
import './server/provider.ts';

configureBraintrust(process.env);

const app = new Hono();

app.get('/healthz', (context) => context.json({ status: 'ok' }));
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
app.use('*', serveStatic({ root: './dist/client' }));
app.get('*', serveStatic({ path: './dist/client/index.html' }));

export default app;
