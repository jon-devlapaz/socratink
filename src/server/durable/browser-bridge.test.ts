import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { Hono } from 'hono';
import { mountBrowserBridge } from './browser-bridge.ts';
import { openBrowserStream } from './browser-stream.ts';
import type { Engine, Snapshot } from './contract.ts';
import { InferenceUnavailableError } from '../../inference/index.ts';

test('browser reads default to history and keep history, updates and HEAD private with matching cursors', async () => {
	const directory = await mkdtemp(join(tmpdir(), 'socratink-browser-bridge-'));
	const stream = await openBrowserStream(join(directory, 'browser.sqlite'));
	try {
		const snapshot: Snapshot = {
			revision: 1,
			messages: [{ role: 'user', submissionId: 'submission', text: 'Synthetic question' }],
			submissions: [{ id: 'submission', text: 'Synthetic question', outcome: 'completed' }],
		};
		const engine: Engine = {
			exists: async () => true,
			snapshot: async () => snapshot,
			submit: async () => { throw new Error('Read requests must not submit work'); },
			abort: async () => { throw new Error('Read requests must not abort work'); },
			close: async () => {},
		};
		const app = new Hono();
		mountBrowserBridge(app, engine, async () => { throw new Error('Read requests must not resolve credentials'); }, stream);
		const history = await app.request('/synthetic');
		assert.equal(history.status, 200);
		const body = await history.json();
		assert(Array.isArray(body.messages), 'a bare GET returns the history snapshot, not update chunks');
		assert.equal(body.messages.length, 1);
		assert.equal(history.headers.get('Cache-Control'), 'no-store');
		assert.equal(history.headers.get('Stream-Next-Offset'), body.offset);
		assert.equal(history.headers.get('Stream-Up-To-Date'), 'true');
		const explicit = await app.request('/synthetic?view=history');
		assert.deepEqual(await explicit.json(), body);
		assert.equal(explicit.headers.get('Cache-Control'), 'no-store');
		assert.equal(explicit.headers.get('Stream-Next-Offset'), body.offset);
		const updates = await app.request('/synthetic?view=updates&offset=-1');
		assert.equal(updates.status, 200);
		const events = await updates.json();
		assert(Array.isArray(events));
		assert(events.length > 0, 'explicit updates still return the recorded events');
		assert.equal(updates.headers.get('Cache-Control'), 'no-store');
		assert.equal(updates.headers.get('Stream-Next-Offset'), body.offset);
		const head = await app.request('/synthetic', { method: 'HEAD' });
		assert.equal(head.status, 200);
		assert.equal(await head.text(), '');
		assert.equal(head.headers.get('Cache-Control'), 'no-store');
		assert.equal(head.headers.get('Stream-Next-Offset'), body.offset);
		assert.equal(head.headers.get('Stream-Up-To-Date'), 'true');
	} finally {
		await stream.close();
		await rm(directory, { recursive: true, force: true });
	}
});

test('a send with no model provider is refused before admission, with a reason the browser can show', async () => {
	const directory = await mkdtemp(join(tmpdir(), 'socratink-browser-bridge-'));
	const stream = await openBrowserStream(join(directory, 'browser.sqlite'));
	try {
		const engine: Engine = {
			exists: async () => false,
			snapshot: async () => ({ revision: 0, messages: [], submissions: [] }),
			submit: async () => { throw new Error('Unconfigured inference must not admit work'); },
			abort: async () => {},
			close: async () => {},
		};
		const app = new Hono();
		app.use('*', async (c, next) => { c.set('socratinkSession' as never, { userId: 'guest' } as never); await next(); });
		mountBrowserBridge(app, engine, async () => { throw new InferenceUnavailableError(); }, stream);
		const response = await app.request('/guest:synthetic', { method: 'POST',
			headers: { 'content-type': 'application/json' }, body: JSON.stringify({ kind: 'user', body: 'Hello' }) });
		assert.equal(response.status, 503);
		assert.equal((await response.json()).error.type, 'inference_unconfigured');
	} finally {
		await stream.close();
		await rm(directory, { recursive: true, force: true });
	}
});
