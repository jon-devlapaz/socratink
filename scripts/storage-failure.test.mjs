import assert from 'node:assert/strict';
import { before, after, test } from 'node:test';
import { createServer } from 'vite';
import { chromium } from 'playwright';
import { appConfig } from '../src/config/app.config.ts';

const guidance = 'You can keep chatting, but this browser cannot save your place. Reloading may not bring you back to this chat.';
let server;
let browser;
let origin;

before(async () => {
	server = await createServer({
		configFile: false,
		root: new URL('../src/ui', import.meta.url).pathname,
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

async function assertNoticeLayout(page, reply) {
	for (const width of [390, 1280]) {
		await page.setViewportSize({ width, height: 844 });
		await page.evaluate(() => document.fonts.ready);
		await page.waitForFunction((reply) => {
			const notice = document.querySelector('#storage-notice').getBoundingClientRect();
			const composer = document.querySelector('#chat').getBoundingClientRect();
			const stage = document.querySelector('.stage');
			const stageStyle = getComputedStyle(stage);
			const contentBottom = reply
				? [...document.querySelectorAll('#active-turn p')].find((p) => p.textContent === reply)?.getBoundingClientRect().bottom
				: stage.getBoundingClientRect().bottom - parseFloat(stageStyle.paddingBottom);
			const headingPresent = reply || getComputedStyle(stage, '::before').content.includes('Make the thinking your own.');
			return headingPresent && contentBottom <= notice.top - 1 && notice.bottom <= composer.top
				&& notice.top >= 0 && composer.bottom <= window.innerHeight;
		}, reply, { timeout: 5_000 });
	}
}

for (const [mode, description] of [
	['blocked', 'page-wide blocked storage uses default preferences and keeps chatting'],
	['read', 'a failed saved-ID read explains reload uncertainty and keeps chatting'],
	['quota', 'a saved-ID quota failure explains reload uncertainty and keeps chatting'],
	['retained', 'a readable retained ID is reused without promising reload recovery'],
]) {
	test(description, async (t) => {
		const context = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: 'light' });
		t.after(() => context.close());
		await context.addInitScript(({ mode, key }) => {
			if (mode === 'blocked') {
				Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Blocked', 'SecurityError'); } });
				return;
			}
			if (mode === 'retained') localStorage.setItem(key, 'guest-storage-test:retained');
			const get = Storage.prototype.getItem;
			const set = Storage.prototype.setItem;
			Storage.prototype.getItem = function (name) {
				if (this === localStorage && name === key && mode === 'read') throw new DOMException('Blocked read', 'SecurityError');
				return get.call(this, name);
			};
			Storage.prototype.setItem = function (name, value) {
				if (this === localStorage && name === key && (mode === 'quota' || mode === 'retained')) throw new DOMException('Full', 'QuotaExceededError');
				return set.call(this, name, value);
			};
		}, { mode, key: appConfig.chatConversationStorageKey });
		const sends = [];
		const snapshot = { v: 1, conversationId: 'synthetic', messages: [], settlements: [] };
		await context.route('**/*', async (route) => {
			const url = new URL(route.request().url());
			if (url.origin !== origin) return route.abort();
			if (url.pathname === '/api/session') return route.fulfill({ json: { userId: 'guest-storage-test', aliases: [], kind: 'guest' } });
			if (!url.pathname.startsWith('/api/agents/chat/')) return route.continue();
			if (route.request().method() === 'POST') {
				const text = route.request().postDataJSON().body;
				const id = `s${sends.length + 1}`;
				sends.push({ id: decodeURIComponent(url.pathname.split('/').at(-1)), text });
				snapshot.messages.push(
					{ id: `${id}:user`, role: 'user', display: 'visible', submissionId: id, parts: [{ type: 'text', text, state: 'done' }] },
					{ id: `${id}:assistant`, role: 'assistant', display: 'visible', submissionId: id, parts: [{ type: 'text', text: `Reply to ${text}`, state: 'done' }] },
				);
				snapshot.settlements.push({ submissionId: id, outcome: 'completed' });
				return route.fulfill({ json: { submissionId: id } });
			}
			if (url.pathname.endsWith('/events')) return route.fulfill({ contentType: 'text/event-stream', body: `data: ${JSON.stringify({ type: 'conversation-reset', snapshot })}\n\n` });
			return route.fulfill({ json: snapshot });
		});
		const page = await context.newPage();
		page.setDefaultTimeout(5_000);
		const errors = [];
		page.on('pageerror', (error) => errors.push(error.message));
		await page.goto(origin);
		const notice = page.getByText(guidance, { exact: true });
		await notice.waitFor({ timeout: 5_000 });
		await page.waitForFunction(() => document.querySelector('#message')?.disabled === false, null, { timeout: 5_000 });
		assert.equal(await notice.count(), 1);
		await assertNoticeLayout(page, null);
		if (mode === 'blocked') {
			assert.equal(await page.locator('#appearance-toggle').getAttribute('aria-pressed'), 'false');
			assert.equal(await page.locator('html').getAttribute('data-type-size'), 'medium');
			assert.equal(await page.locator('#sound-toggle').getAttribute('aria-pressed'), 'false');
			await page.locator('#menu-trigger').click();
			await page.locator('#type-size-toggle').click();
			await page.locator('#sound-toggle').click();
			await page.locator('#appearance-toggle').click();
			await page.waitForFunction(() => document.documentElement.dataset.theme === 'dark');
			assert.equal(await page.locator('html').getAttribute('data-type-size'), 'small');
			assert.equal(await page.locator('#sound-toggle').getAttribute('aria-pressed'), 'true');
			await page.keyboard.press('Escape');
		}
		for (const text of ['Why do tides happen?', 'What changes at night?']) {
			await page.locator('#message').fill(text);
			await page.getByRole('button', { name: 'Send message', exact: true }).click();
			await page.getByText(`Reply to ${text}`, { exact: true }).waitFor({ timeout: 5_000 });
			assert.equal(await page.locator('#message').isDisabled(), false);
			assert.equal(await notice.isVisible(), true);
			await assertNoticeLayout(page, `Reply to ${text}`);
		}
		assert.equal(sends.length, 2);
		assert.equal(sends[0].id, sends[1].id);
		assert.match(sends[0].id, /^guest-storage-test:/);
		if (mode === 'retained') assert.equal(sends[0].id, 'guest-storage-test:retained');
		assert.deepEqual(errors, []);
	});
}
