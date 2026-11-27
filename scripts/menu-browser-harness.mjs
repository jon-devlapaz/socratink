import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { chromium } from 'playwright';

export async function menuHarness() {
	const server = await createServer({
		configFile: new URL('../vite.config.ui.ts', import.meta.url).pathname,
		server: { host: '127.0.0.1', port: 0, hmr: false, watch: null },
	});
	let browser;
	try {
		await server.listen();
		browser = await chromium.launch({ headless: true });
	} catch (error) {
		await server.close();
		throw error;
	}
	const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
	return {
		async page(t, width) {
			const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
			t.after(() => context.close());
			const page = await context.newPage();
			page.setDefaultTimeout(5000);
			const errors = [];
			page.on('pageerror', error => errors.push(error.message));
			t.after(() => assert.deepEqual(errors, []));
			await page.route('**/*', route => {
				const url = new URL(route.request().url());
				if (url.origin !== origin) return route.abort();
				if (url.pathname === '/api/session') return route.fulfill({ json: {
					userId: 'guest-menu-test', aliases: [], kind: 'guest',
				} });
				if (url.pathname.startsWith('/api/agents/chat/')) return route.fulfill({ json: {
					v: 1, conversationId: 'synthetic', messages: [], settlements: [],
				} });
				if (url.pathname.startsWith('/api/')) return route.abort();
				return route.continue();
			});
			await page.goto(origin);
			await page.locator('#message:enabled').waitFor();
			return page;
		},
		async close() {
			await browser.close();
			await server.close();
		},
	};
}

export async function pullMenu(page) {
	await page.emulateMedia({ reducedMotion: 'no-preference' });
	const touch = await page.context().newCDPSession(page);
	try {
		for (const [type, y] of [['touchStart', 10], ['touchMove', 90], ['touchEnd']]) {
			await touch.send('Input.dispatchTouchEvent', {
				type, touchPoints: y === undefined ? [] : [{ x: 195, y }],
			});
		}
	} finally {
		await touch.detach();
	}
}
