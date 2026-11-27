import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { chromium, webkit } from 'playwright';
import { expect } from 'playwright/test';

export const phones = [
	{ width: 390, height: 664, colorScheme: 'light' },
	{ width: 375, height: 667, colorScheme: 'dark' },
];
export const engines = { chromium, webkit };

export async function composerHarness(engine) {
	const server = await createServer({
		configFile: new URL('../vite.config.ui.ts', import.meta.url).pathname,
		server: { host: '127.0.0.1', port: 0, hmr: false, watch: null },
	});
	let browser;
	try {
		await server.listen();
		browser = await engine.launch({ headless: true });
	} catch (error) {
		await server.close();
		throw error;
	}
	const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
	return {
		async page(t, phone, { speech = true } = {}) {
			const { colorScheme, ...viewport } = phone;
			const context = await browser.newContext({ viewport, colorScheme, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
			t.after(() => context.close());
			await context.addInitScript(({ speech }) => {
				window.composerActions = { starts: 0, stops: 0, submits: 0 };
				window.composerPointers = [];
				document.addEventListener('pointerdown', event => {
					window.composerPointers.push({ focused: document.activeElement?.id, trusted: event.isTrusted });
				});
				window.SpeechRecognition = speech ? class extends EventTarget {
					start() { window.composerActions.starts++; this.dispatchEvent(new Event('start')); }
					stop() { window.composerActions.stops++; this.dispatchEvent(new Event('end')); }
					abort() { this.dispatchEvent(new Event('end')); }
				} : undefined;
				window.webkitSpeechRecognition = undefined;
				document.addEventListener('submit', () => window.composerActions.submits++, true);
			}, { speech });
			const page = await context.newPage();
			page.setDefaultTimeout(5000);
			const errors = [];
			const submissions = [];
			page.on('pageerror', error => errors.push(error.message));
			t.after(() => assert.deepEqual(errors, []));
			await page.route('**/*', route => {
				const request = route.request();
				const url = new URL(request.url());
				if (url.origin !== origin) return route.abort();
				if (url.pathname === '/api/session') return route.fulfill({ json: {
					userId: 'guest-composer-test', aliases: [], kind: 'guest',
				} });
				if (request.method() === 'POST') {
					submissions.push({ path: url.pathname, body: request.postDataJSON() });
					return route.fulfill({ status: 503, json: { error: 'synthetic_unavailable' } });
				}
				if (url.pathname.startsWith('/api/agents/chat/')) return route.fulfill({ json: {
					v: 1, conversationId: 'synthetic', messages: [], settlements: [],
				} });
				if (url.pathname.startsWith('/api/')) return route.abort();
				return route.continue();
			});
			await page.goto(origin);
			await expect(page.locator('#message')).toBeEnabled();
			return { page, submissions };
		},
		async close() {
			try { await browser.close(); } finally { await server.close(); }
		},
	};
}

export async function tapBlank(page, region = 'footer') {
	const point = await page.locator('#chat').evaluate((form, region) => {
		const box = form.getBoundingClientRect();
		const footer = form.querySelector('.composer-footer').getBoundingClientRect();
		const points = {
			footer: { x: footer.left + 4, y: footer.top + footer.height / 2 },
			left: { x: box.left + 4, y: footer.top + footer.height / 2 },
			bottom: { x: box.left + box.width / 3, y: box.bottom - 4 },
		};
		const point = points[region];
		const hit = document.elementFromPoint(point.x, point.y);
		if (!form.inert && (!form.contains(hit) || hit.closest('button'))) throw new Error(`Invalid blank tap: ${region}`);
		return point;
	}, region);
	await page.touchscreen.tap(point.x, point.y);
	return page.evaluate(() => window.composerPointers.at(-1));
}

export async function expectTypedX(page) {
	await expect(page.locator('#message')).toBeFocused();
	await page.keyboard.type('x');
	await expect(page.locator('#message')).toHaveValue('x');
}

export async function expectActions(page, expected) {
	assert.deepEqual(await page.evaluate(() => window.composerActions), expected);
}
