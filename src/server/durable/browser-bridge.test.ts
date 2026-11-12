import assert from 'node:assert/strict';
import test from 'node:test';
import { Hono } from 'hono';
import { mountBrowserBridge } from './browser-bridge.ts';
import type { Engine, Snapshot } from './contract.ts';
import { InferenceUnavailableError } from '../../inference/index.ts';

test('a GET reads the private history snapshot without submitting work', async () => {
	const snapshot: Snapshot = {
		revision: 1,
		messages: [{ role: 'user', submissionId: 'submission', text: 'Synthetic question' }],
		submissions: [{ id: 'submission', text: 'Synthetic question', outcome: 'completed' }],
	};
	const engine: Engine = {
		snapshot: async () => snapshot,
		submit: async () => { throw new Error('Read requests must not submit work'); },
		abort: async () => { throw new Error('Read requests must not abort work'); },
		follow: () => { throw new Error('Plain requests must not follow'); },
		close: async () => {},
	};
	const app = new Hono();
	mountBrowserBridge(app, engine, async () => { throw new Error('Read requests must not resolve credentials'); });
	const history = await app.request('/synthetic');
	assert.equal(history.status, 200);
	assert.equal(history.headers.get('Cache-Control'), 'no-store');
	const body = await history.json();
	assert.equal(body.conversationId, 'synthetic');
	assert.deepEqual(body.messages.map((m: { id: string }) => m.id), ['submission:user']);
	assert.deepEqual(body.settlements, [{ submissionId: 'submission', outcome: 'completed' }]);
	assert.equal('sourceRevision' in body, false, 'the internal revision stays on the server');
});

test('a send with no model provider is refused before admission, with a reason the browser can show', async () => {
	const engine: Engine = {
		snapshot: async () => ({ revision: 0, messages: [], submissions: [] }),
		submit: async () => { throw new Error('Unconfigured inference must not admit work'); },
		abort: async () => {},
		follow: () => { throw new Error('Plain requests must not follow'); },
		close: async () => {},
	};
	const app = new Hono();
	app.use('*', async (c, next) => { c.set('socratinkSession' as never, { userId: 'guest' } as never); await next(); });
	mountBrowserBridge(app, engine, async () => { throw new InferenceUnavailableError(); });
	const response = await app.request('/guest:synthetic', { method: 'POST',
		headers: { 'content-type': 'application/json' }, body: JSON.stringify({ kind: 'user', body: 'Hello' }) });
	assert.equal(response.status, 503);
	assert.equal((await response.json()).error.type, 'inference_unconfigured');
});

test('an admitted send answers with only its submission id', async () => {
	const engine: Engine = {
		snapshot: async () => ({ revision: 0, messages: [], submissions: [] }),
		submit: async () => 'submission-1',
		abort: async () => {},
		follow: () => { throw new Error('Plain requests must not follow'); },
		close: async () => {},
	};
	const app = new Hono();
	app.use('*', async (c, next) => { c.set('socratinkSession' as never, { userId: 'learner' } as never); await next(); });
	mountBrowserBridge(app, engine, async () => ({ provider: 'synthetic', modelId: 'synthetic' }));
	const response = await app.request('/learner:synthetic', { method: 'POST',
		headers: { 'content-type': 'application/json' }, body: JSON.stringify({ kind: 'user', body: 'Hello' }) });
	assert.equal(response.status, 202);
	assert.deepEqual(await response.json(), { submissionId: 'submission-1' });
});
