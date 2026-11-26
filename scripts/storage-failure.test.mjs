import assert from 'node:assert/strict';
import { before, after, test } from 'node:test';
import { createServer } from 'vite';
import { chromium } from 'playwright';
import { appConfig } from '../src/config/app.config.ts';

const guidance = 'Reloading this page could lose your place in this chat. You can keep chatting in this tab.';
let server;
let browser;
let origin;

before(async () => {
	server = await createServer({
		configFile: new URL('../vite.config.ui.ts', import.meta.url).pathname,
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
	for (const width of [375, 390, 1280]) {
		await page.setViewportSize({ width, height: 844 });
		await page.evaluate(() => document.fonts.ready);
		await page.waitForFunction((reply) => {
			const content = reply
				? [[...document.querySelectorAll('#active-turn p')].find((p) => p.textContent === reply)]
				: [document.querySelector('h1#intro-title'), document.querySelector('.intro p')];
			const elements = [...content, document.querySelector('#storage-notice'), document.querySelector('#chat')];
			if (!reply) elements.push(document.querySelector('ul[aria-label="Ways to start"]'));
			if (!elements.every((element) => element?.checkVisibility())) return false;
			const boxes = elements.map((element) => element.getBoundingClientRect());
			return boxes.every((box, index) => box.height > 0 && box.top >= 0 && box.bottom <= innerHeight
				&& box.left >= 0 && box.right <= innerWidth && (index === 0 || boxes[index - 1].bottom <= box.top + 1));
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
				const parts = text === 'Show me a question' ? [{ type: 'data-questionnaire', data: {
					kind: 'question', submitLabel: 'Submit', items: [{
						name: 'season', prompt: 'What causes the seasons?', required: true, multiple: false,
						choices: [{ value: 'tilt', label: 'Earth’s axial tilt' }, { value: 'distance', label: 'Earth’s distance from the Sun' }],
					}],
				} }] : [{ type: 'text', text: `Reply to ${text}`, state: 'done' }];
				sends.push({ id: decodeURIComponent(url.pathname.split('/').at(-1)), text });
				snapshot.messages.push(
					{ id: `${id}:user`, role: 'user', display: 'visible', submissionId: id, parts: [{ type: 'text', text, state: 'done' }] },
					{ id: `${id}:assistant`, role: 'assistant', display: 'visible', submissionId: id, parts },
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
		await page.getByRole('heading', { level: 1, name: 'Make the thinking your own.', exact: true }).waitFor();
		await assertNoticeLayout(page, null);
		if (mode === 'blocked') {
			await page.locator('#menu-trigger').click();
			assert.equal(await page.locator('#appearance-toggle').getAttribute('aria-pressed'), 'false');
			assert.equal(await page.locator('html').getAttribute('data-type-size'), 'medium');
			assert.equal(await page.locator('#sound-toggle').getAttribute('aria-pressed'), 'false');
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
		if (mode === 'quota') {
			await page.locator('#message').fill('Show me a question');
			await page.getByRole('button', { name: 'Send message', exact: true }).click();
			const card = page.locator('#active-turn .questionnaire');
			await card.waitFor();
			await page.locator('.dock').evaluate(async (dock) => {
				await Promise.allSettled(dock.getAnimations().map((animation) => animation.finished));
			});
			for (const width of [375, 390, 1280]) {
				await page.setViewportSize({ width, height: 844 });
				await page.waitForFunction(() => {
					const notice = document.querySelector('#storage-notice').getBoundingClientRect();
					const transcript = document.querySelector('.active-scroll').getBoundingClientRect();
					return notice.height > 0 && notice.bottom <= innerHeight && transcript.bottom <= notice.top;
				});
				assert.equal(await page.locator('#chat').isVisible(), false);
				assert.equal(await notice.isVisible(), true);
			}
			await card.getByRole('radio', { name: /tilt/i }).check();
			await card.getByRole('button', { name: 'Submit', exact: true }).click();
			await page.locator('#chat').waitFor();
			assert.equal(await notice.isVisible(), true);
		}
		assert.deepEqual(errors, []);
	});
}
