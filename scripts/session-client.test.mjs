import assert from 'node:assert/strict';
import test from 'node:test';
import { loadAuthProviders, readOrCreateSession } from '../src/ui/session.ts';

async function withFetch(handler, run) {
	const original = globalThis.fetch;
	globalThis.fetch = handler;
	try {
		return await run();
	} finally {
		globalThis.fetch = original;
	}
}

test('loadAuthProviders returns server flags and fails closed without providers', async () => {
	await withFetch(async () => Response.json({ google: true, github: false }), async () => {
		assert.deepEqual(await loadAuthProviders(), { google: true, github: false });
	});
	await withFetch(async () => new Response('not found', { status: 404 }), async () => {
		assert.deepEqual(await loadAuthProviders(), { google: false, github: false });
	});
	await withFetch(async () => Response.json({ google: 'yes' }), async () => {
		assert.deepEqual(await loadAuthProviders(), { google: false, github: false });
	});
	await withFetch(
		async () => {
			throw new Error('offline');
		},
		async () => {
			assert.deepEqual(await loadAuthProviders(), { google: false, github: false });
		},
	);
});

test('readOrCreateSession mints a guest session when none exists', async () => {
	const calls = [];
	await withFetch(
		async (url, init) => {
			calls.push(init?.method ?? 'GET');
			if (calls.length === 1) return new Response('unauthorized', { status: 401 });
			return Response.json({ userId: 'guest-a', aliases: [], kind: 'guest' });
		},
		async () => {
			assert.deepEqual(await readOrCreateSession(), { userId: 'guest-a', aliases: [], kind: 'guest' });
		},
	);
	assert.deepEqual(calls, ['GET', 'POST']);
	await withFetch(
		async () => new Response('down', { status: 500 }),
		async () => {
			assert.equal(await readOrCreateSession(), undefined);
		},
	);
});
