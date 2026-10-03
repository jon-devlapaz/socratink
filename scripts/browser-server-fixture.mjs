import { writeFile } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { setProvider } from '@flue/runtime';
import { start } from '@flue/runtime/node';
import { createAssistantMessageEventStream, createProvider } from '@earendil-works/pi-ai';
import { getAuthDb } from '../src/server/auth-runtime.ts';
import { getCredentialStore } from '../src/server/credential-runtime.ts';
import { writeSessionCookie } from '../src/server/session.ts';

if (!process.send) throw new Error('Start this disposable fixture through the browser test runner.');

// The runner supplies a temporary cwd and an allowlisted environment. As in the
// beta wiring tests, only persistence is primed locally before hosted app boot.
await writeFile('.env.braintrust', '');
const authDb = getAuthDb();
const credentials = getCredentialStore();
await authDb.createUser('browser-invited', 'browser@example.invalid');
Object.assign(process.env, {
	NODE_ENV: 'production', AI_GATEWAY_API_KEY: 'synthetic-browser-gateway-key',
	SESSION_SECRET: 'synthetic-browser-session-secret', CREDENTIALS_SECRET: 'synthetic-browser-credential-secret',
	DATABASE_URL: 'postgres://unused:unused@127.0.0.1:1/unused',
	SOCRATINK_BETA_INVITED_EMAILS: 'browser@example.invalid', SOCRATINK_BETA_PAUSED: '0',
	GOOGLE_CLIENT_ID: 'synthetic-google-client', GOOGLE_CLIENT_SECRET: 'synthetic-google-secret',
	AUTH_REDIRECT_BASE_URL: 'https://beta.example.invalid',
});
globalThis.fetch = async () => { throw new Error('Live network is forbidden in browser fixtures.'); };
const { default: app } = await import('../src/app.ts');
const { Chat } = await import('../src/agents/chat.ts');
const { chatModel } = await import('../src/config/chat-model.ts');
const model = {
	id: chatModel.modelId, name: 'Browser fixture', api: 'openai-completions', provider: chatModel.providerId,
	baseUrl: 'http://fixture.invalid/v1', reasoning: false, input: ['text'],
	cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 }, contextWindow: 8192, maxTokens: 128,
};
let modelCalls = 0;
function stream(_model, context, options) {
	modelCalls++;
	const output = createAssistantMessageEventStream();
	const message = {
		role: 'assistant', content: [{ type: 'text', text: '' }], api: model.api,
		provider: model.provider, model: model.id, timestamp: Date.now(), stopReason: 'stop',
		usage: { input: 1, output: 1, cacheRead: 0, cacheWrite: 0, totalTokens: 2,
			cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 } },
	};
	void (async () => {
		output.push({ type: 'start', partial: message });
		output.push({ type: 'text_start', contentIndex: 0, partial: message });
		const lastUser = context.messages.filter((entry) => entry.role === 'user').at(-1);
		if (JSON.stringify(lastUser?.content).includes('QA slow')) {
			await delay(30_000, undefined, { signal: options?.signal });
		}
		const text = 'Synthetic browser reply. Explain the distinction in your own words.';
		message.content[0].text = text;
		output.push({ type: 'text_delta', contentIndex: 0, delta: text, partial: message });
		output.push({ type: 'text_end', contentIndex: 0, content: text, partial: message });
		output.push({ type: 'done', reason: 'stop', message });
		output.end(message);
	})().catch((error) => {
		message.stopReason = options?.signal?.aborted ? 'aborted' : 'error';
		message.errorMessage = error.message;
		output.push({ type: 'error', reason: message.stopReason, error: message });
		output.end(message);
	});
	return output;
}
setProvider(createProvider({
	id: model.provider, models: [model],
	auth: { apiKey: { name: 'Synthetic only', resolve: async () => ({ auth: {} }) } },
	api: { stream, streamSimple: stream },
}));
const runtime = await start({ agents: [Chat], env: {} });

// Test-only wrapper: these routes are never mounted in the product application.
const fixture = new Hono();
fixture.get('/__qa/login', async (context) => {
	await writeSessionCookie(context, 'browser-invited', process.env.SESSION_SECRET, {}, 'registered');
	return context.redirect('/');
});
fixture.get('/__qa/metrics', (context) => context.json({ modelCalls }));
fixture.route('/', app);
const server = serve({ fetch: fixture.fetch, hostname: '127.0.0.1', port: 0 }, ({ port }) => {
	process.send({ origin: `http://127.0.0.1:${port}` });
});
process.once('SIGTERM', async () => {
	server.close();
	server.closeAllConnections();
	await runtime.stop();
	await credentials.close();
	await authDb.close();
	process.exit(0);
});
