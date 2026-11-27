import assert from 'node:assert/strict';
import { before, after, test } from 'node:test';
import { createServer } from 'vite';
import { chromium } from 'playwright';

let server;
let browser;
let origin;

before(async () => {
	server = await createServer({
		configFile: new URL('../vite.config.ui.ts', import.meta.url).pathname,
		cacheDir: new URL('../.cache/start-over-empty-vite', import.meta.url).pathname,
		server: { host: '127.0.0.1', port: 0 },
	});
	await server.listen();
	origin = `http://127.0.0.1:${server.httpServer.address().port}`;
	browser = await chromium.launch({ headless: true });
});
after(async () => {
	await browser?.close();
	await server?.close();
});

async function emptyTabs(t) {
	const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
	t.after(() => context.close());
	const errors = [];
	const mutations = [];
	const navigations = [];
	t.after(() => assert.deepEqual(errors, []));
	await context.route('**/*', async (route) => {
		const request = route.request();
		const url = new URL(request.url());
		if (url.origin !== origin) return route.abort();
		if (url.pathname === '/api/session') {
			return route.fulfill({ json: { userId: 'guest-start-over-test', aliases: [], kind: 'guest' } });
		}
		if (!url.pathname.startsWith('/api/')) return route.continue();
		if (request.method() !== 'GET') {
			mutations.push(`${request.method()} ${url.pathname}`);
			return route.abort();
		}
		if (url.pathname.startsWith('/api/agents/chat/')) {
			return route.fulfill({ json: { v: 1, conversationId: 'synthetic', messages: [], settlements: [] } });
		}
		if (url.pathname === '/api/auth/providers') {
			return route.fulfill({ json: { google: false, github: false } });
		}
		return route.abort();
	});
	const pages = [];
	for (let index = 0; index < 2; index++) {
		const page = await context.newPage();
		page.on('pageerror', (error) => errors.push(error.message));
		await page.goto(origin);
		await page.waitForFunction(() => document.querySelector('#message')?.disabled === false);
		page.on('framenavigated', (frame) => {
			if (frame === page.mainFrame()) navigations.push(index);
		});
		pages.push(page);
	}
	const ids = () => Promise.all(pages.map((page) => page.evaluate(() =>
		localStorage.getItem('socratink-chat-conversation-id'))));
	const originalIds = await ids();
	assert.ok(originalIds[0]);
	assert.equal(originalIds[0], originalIds[1]);
	return {
		pages,
		async unchanged() {
			assert.deepEqual(await ids(), originalIds, 'conversation IDs stay unchanged in both tabs');
			assert.deepEqual(navigations, [], 'neither tab reloads');
			assert.deepEqual(mutations, [], 'no server mutation occurs');
		},
	};
}

async function startOver(page) {
	await page.locator('#menu-trigger').click();
	assert.equal(await page.locator('#history-trigger').isEnabled(), true, 'History stays available');
	await page.locator('#start-over').click();
}

test('Start over does nothing when both tabs and the conversation are empty', async (t) => {
	const ui = await emptyTabs(t);
	for (const page of ui.pages) assert.equal(await page.locator('#message').inputValue(), '');
	await startOver(ui.pages[0]);
	await ui.pages[0].waitForTimeout(200);
	await ui.unchanged();
	assert.equal(await ui.pages[0].locator('#start-over-dialog').count(), 0, 'an empty session needs no loss warning');
});

test('Start over still warns about a real composer draft and cancel keeps it', async (t) => {
	const ui = await emptyTabs(t);
	const page = ui.pages[0];
	await page.locator('#message').fill('A draft, not sent.');
	await startOver(page);
	const dialog = page.locator('#start-over-dialog');
	await dialog.waitFor();
	const description = await dialog.locator('[data-slot="dialog-description"]').innerText();
	assert.match(description, /(?:unsent|haven.t sent)/i);
	assert.ok(description.includes('Saved conversations are in History.'));
	await ui.unchanged();
	await dialog.getByRole('button', { name: 'Keep this conversation', exact: true }).click();
	await dialog.waitFor({ state: 'detached' });
	assert.equal(await page.locator('#message').inputValue(), 'A draft, not sent.');
	await ui.unchanged();
});
