import { createServer } from 'vite';

const server = await createServer({
	configFile: new URL('../vite.config.ui.ts', import.meta.url).pathname,
	cacheDir: new URL('../.cache/start-over-preview-vite', import.meta.url).pathname,
	server: { host: '127.0.0.1', port: 4173, strictPort: true },
	plugins: [{
		name: 'synthetic-start-over-preview',
		configureServer(vite) {
			vite.middlewares.use((request, response, next) => {
				const path = new URL(request.url, 'http://127.0.0.1:4173').pathname;
				if (!path.startsWith('/api/')) return next();
				response.setHeader('Content-Type', 'application/json');
				if (request.method !== 'GET') {
					response.statusCode = 503;
					response.end(JSON.stringify({ error: { type: 'synthetic_preview', message: 'This preview cannot send messages.' } }));
					return;
				}
				const body = path === '/api/session' ? { userId: 'guest-start-over-preview', aliases: [], kind: 'guest' }
					: path === '/api/auth/providers' ? { google: false, github: false }
					: path === '/api/conversations' ? { conversations: [] }
					: path.startsWith('/api/agents/chat/') ? { v: 1, conversationId: 'synthetic', messages: [], settlements: [] }
					: undefined;
				response.statusCode = body ? 200 : 404;
				response.end(JSON.stringify(body ?? { error: 'Not found' }));
			});
		},
	}],
});
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, async () => {
	await server.close();
	process.exit(0);
});
await server.listen();
console.log('Synthetic Start over preview: http://127.0.0.1:4173');
