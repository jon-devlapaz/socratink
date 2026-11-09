import { serve } from '@hono/node-server';
import app from './app.ts';

const port = Number.parseInt(process.env.PORT || '3000', 10);
const server = serve({ fetch: app.fetch, port, hostname: process.env.HOST, serverOptions: { requestTimeout: 0 } },
	() => console.log(`Socratink listening on http://localhost:${port}`));

function stop(exitCode: number) {
	setTimeout(() => process.exit(exitCode), 10_000).unref();
	server.close(() => process.exit(exitCode));
}

process.on('SIGINT', () => stop(130));
process.on('SIGTERM', () => stop(143));
