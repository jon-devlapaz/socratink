import assert from 'node:assert/strict';
import test from 'node:test';
import { createAuthGateCard, hasAuthProvider } from '../src/ui/chat-gate.ts';
import { loadAuthProviders, readOrCreateSession } from '../src/ui/session.ts';

class FakeElement {
	constructor(tagName) {
		this.tagName = tagName.toUpperCase();
		this.childNodes = [];
		this.className = '';
		this.textContent = '';
		this.href = '';
		this.attributes = {};
	}
	setAttribute(name, value) {
		this.attributes[name] = value;
	}
	append(...nodes) {
		this.childNodes.push(...nodes);
	}
}

function links(element) {
	const found = [];
	const walk = (node) => {
		if (node.tagName === 'A') found.push(node);
		for (const child of node.childNodes ?? []) walk(child);
	};
	walk(element);
	return found;
}

async function withDocument(run) {
	const original = globalThis.document;
	globalThis.document = { createElement: (tag) => new FakeElement(tag) };
	try {
		return await run();
	} finally {
		if (original === undefined) delete globalThis.document;
		else globalThis.document = original;
	}
}

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

test('gate card renders only configured provider links', async () => {
	await withDocument(async () => {
		assert.equal(hasAuthProvider({ google: false, github: false }), false);
		assert.equal(hasAuthProvider({ google: true, github: false }), true);
		const both = links(createAuthGateCard({ google: true, github: true }));
		assert.deepEqual(
			both.map((link) => link.href),
			['/api/auth/google/login', '/api/auth/github/login'],
		);
		const googleOnly = links(createAuthGateCard({ google: true, github: false }));
		assert.deepEqual(
			googleOnly.map((link) => link.href),
			['/api/auth/google/login'],
		);
		assert.deepEqual(links(createAuthGateCard({ google: false, github: false })), []);
	});
});
