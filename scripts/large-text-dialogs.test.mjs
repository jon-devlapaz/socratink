import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from 'playwright';
import { createServer } from 'vite';
import { requestStartOver } from './start-over-browser.mjs';

const draft = 'Local draft, unfinished.';
const localWarning = 'Your unsent text in this tab will be deleted. Saved conversations are in History.';
const cardWarning = 'Your question-card work in this tab will be deleted. This conversation will close in your open tabs. Saved conversations are in History.';

async function harness(t) {
	await mkdir('.cache', { recursive: true });
	const profile = await mkdtemp(resolve('.cache/large-text-profile-'));
	await mkdir(`${profile}/Default`);
	await writeFile(`${profile}/Default/Preferences`, JSON.stringify({ webkit: { webprefs: {
		default_font_size: 32, default_fixed_font_size: 32,
	} } }));
	const server = await createServer({
		configFile: resolve('vite.config.ui.ts'),
		server: { host: '127.0.0.1', port: 0, watch: null, hmr: false },
	});
	let context;
	t.after(async () => { await context?.close(); await server.close(); });
	await server.listen();
	context = await chromium.launchPersistentContext(profile, {
		channel: 'chromium', headless: true, viewport: { width: 375, height: 667 }, reducedMotion: 'reduce',
	});
	const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
	await context.route('**/*', route => {
		const url = new URL(route.request().url());
		if (url.origin !== origin) return route.abort();
		if (url.pathname === '/neutral') return route.fulfill({ contentType: 'text/html', body: '<!doctype html><p>Browser default font</p>' });
		if (url.pathname === '/api/session') return route.fulfill({ json: { userId: 'guest-large-text', aliases: [], kind: 'guest' } });
		if (url.pathname === '/api/conversations') return route.fulfill({ json: { conversations: [
			{ id: 'synthetic', title: 'Synthetic tides', updatedAt: '2026-11-27T10:00:00Z' },
		] } });
		if (url.pathname.startsWith('/api/agents/chat/')) return route.fulfill({ json: {
			v: 1, conversationId: 'synthetic', messages: [], settlements: [],
		} });
		if (url.pathname === '/api/auth/providers') return route.fulfill({ json: { google: false, github: false } });
		if (url.pathname.startsWith('/api/')) return route.abort();
		return route.continue();
	});
	const neutral = await context.newPage();
	await neutral.goto(`${origin}/neutral`);
	assert.equal(await neutral.locator('p').evaluate(p => getComputedStyle(p).fontSize), '32px', 'actual browser default font');
	assert.equal(await neutral.evaluate(() => visualViewport.scale), 1, 'no zoom');
	await neutral.close();
	return async (card = false) => {
		const page = await context.newPage();
		page.setDefaultTimeout(5000);
		const errors = [];
		page.on('pageerror', error => errors.push(error.message));
		t.after(() => assert.deepEqual(errors, []));
		if (card) await page.route('**/api/agents/chat/**', route => route.fulfill({ json: {
			v: 1, conversationId: 'synthetic', settlements: [{ submissionId: 's1', outcome: 'completed' }], messages: [
				{ role: 'user', display: 'visible', submissionId: 's1', parts: [{ type: 'text', text: 'Why do tides happen?', state: 'done' }] },
				{ role: 'assistant', display: 'visible', submissionId: 's1', parts: [{ type: 'data-questionnaire', data: {
					kind: 'question', submitLabel: 'Continue', items: [{ name: 'tides', prompt: 'What drives the tides?', required: true, multiple: false,
						choices: [{ value: 'moon', label: 'The Moon' }, { value: 'wind', label: 'Wind' }], input: { label: 'Your reason' } }],
				} }] },
			],
		} }));
		await page.goto(origin);
		await page.locator('#message:enabled').waitFor({ state: 'attached' });
		await page.evaluate(() => document.fonts.ready);
		return page;
	};
}

async function contained(page, selector, container) {
	const result = await page.locator(selector).evaluate((element, containerSelector) => {
		const parent = document.querySelector(containerSelector);
		const bounds = parent.getBoundingClientRect();
		const box = element.getBoundingClientRect();
		const range = document.createRange();
		range.selectNodeContents(element);
		const rects = [box, ...range.getClientRects()];
		return { bounds: { left: bounds.left, right: bounds.right }, rects: rects.map(r => ({ left: r.left, right: r.right })), ok: rects.every(r => r.left >= bounds.left - 1 && r.right <= bounds.right + 1 && r.left >= -1 && r.right <= innerWidth + 1) };
	}, container);
	assert.ok(result.ok, `horizontal containment: ${selector} ${JSON.stringify(result)}`);
}

async function reachable(page, selector, container) {
	await page.locator(selector).scrollIntoViewIfNeeded();
	const result = await page.locator(selector).evaluate((element, containerSelector) => {
		const box = element.getBoundingClientRect();
		const parent = document.querySelector(containerSelector).getBoundingClientRect();
		return box.top >= Math.max(0, parent.top) - 1 && box.bottom <= Math.min(innerHeight, parent.bottom) + 1;
	}, container);
	assert.ok(result, `vertical reachability: ${selector}`);
}

async function dialogGeometry(page, warning) {
	assert.equal(await page.locator('#start-over-dialog p').innerText(), warning);
	assert.equal(await page.locator('.start-over-actions button').nth(0).innerText(), 'Keep this conversation');
	assert.equal(await page.locator('#start-over-confirm').innerText(), 'Start new conversation');
	for (const selector of ['#start-over-dialog p', '.start-over-actions button:first-child', '#start-over-confirm']) {
		await contained(page, selector, '#start-over-dialog');
		if (selector.endsWith(' p')) {
			const lines = await page.locator(selector).evaluate(p => {
				const range = document.createRange(); range.selectNodeContents(p);
				return [...range.getClientRects()].map(r => ({ top: r.top, bottom: r.bottom }));
			});
			assert.ok(lines.length > 1, 'large warning wraps');
		}
		await reachable(page, selector, '#start-over-dialog');
	}
	assert.ok(await page.locator('#start-over-dialog').evaluate(dialog => dialog.scrollWidth <= dialog.clientWidth), 'no horizontal dialog scrolling');
}

async function activate(page, selector, keyboard) {
	if (keyboard) {
		await page.locator(selector).focus();
		await page.keyboard.press('Enter');
	} else await page.locator(selector).click();
}

for (const card of [false, true]) {
	test(`32 px browser font: ${card ? 'question-card' : 'local draft'} warning and actions`, async t => {
		const open = await harness(t);
		for (const keyboard of [false, true]) {
			const page = await open(card);
			const input = card ? page.getByLabel('Your reason', { exact: true }) : page.locator('#message');
			await input.fill(card ? 'Card reasoning, unfinished.' : draft);
			const before = await page.evaluate(() => localStorage.getItem('socratink-chat-conversation-id'));
			await requestStartOver(page);
			await dialogGeometry(page, card ? cardWarning : localWarning);
			await activate(page, '.start-over-actions button:first-child', keyboard);
			await page.locator('#start-over-dialog').waitFor({ state: 'detached' });
			assert.equal(await input.inputValue(), card ? 'Card reasoning, unfinished.' : draft);
			assert.equal(await page.evaluate(() => localStorage.getItem('socratink-chat-conversation-id')), before);
			await requestStartOver(page);
			await dialogGeometry(page, card ? cardWarning : localWarning);
			if (card) await page.unroute('**/api/agents/chat/**');
			await Promise.all([page.waitForEvent('load'), activate(page, '#start-over-confirm', keyboard)]);
			await page.locator('#message:enabled').waitFor();
			assert.equal(await page.locator('#message').inputValue(), '');
			assert.notEqual(await page.evaluate(() => localStorage.getItem('socratink-chat-conversation-id')), before);
			await page.close();
		}
	});
}

test('32 px browser font: History return stays visible and works', async t => {
	const open = await harness(t);
	for (const keyboard of [false, true]) {
		const page = await open(true);
		await page.locator('#menu-trigger').click();
		await page.locator('#history-trigger').click();
		await page.getByText('Synthetic tides', { exact: true }).waitFor();
		assert.equal(await page.locator('#history-close').innerText(), 'Back to conversation');
		await contained(page, '#history-close', '#history-dialog');
		await reachable(page, '#history-close', '#history-dialog');
		assert.ok(await page.evaluate(() => [document.documentElement, document.querySelector('#history-dialog')].every(e => e.scrollWidth <= e.clientWidth)), 'no horizontal scrolling');
		await activate(page, '#history-close', keyboard);
		await page.locator('#history-dialog').waitFor({ state: 'detached' });
		await page.locator('#active-turn .questionnaire').waitFor();
		await page.close();
	}
});

test('frozen old layout fails the same horizontal containment check', async t => {
	const open = await harness(t);
	const page = await open();
	await page.setContent(`<!doctype html><style>
		@font-face { font-family: Inter; src: url('/fonts/inter.woff2'); font-weight: 100 900; }
		* { box-sizing: border-box; } body { margin: 0; font-family: Inter, sans-serif; letter-spacing: -.01em; }
		#old-dialog { position: fixed; left: 50%; transform: translateX(-50%); width: min(30rem, calc(100% - 2rem)); padding: 1rem; }
		.old-content { display: grid; gap: .8rem; } .old-actions { display: flex; flex-wrap: wrap; gap: .5rem; }
		button { flex-shrink: 0; white-space: nowrap; height: 2.5rem; padding: 0 1.1rem; font: inherit; font-size: .875rem; font-weight: 500; }
		#old-history { width: 100%; padding: 1.25rem; }
	</style><div id="old-dialog"><div class="old-content"><p>${localWarning}</p><div class="old-actions"><button>Keep this conversation</button><button>Start new conversation</button></div></div></div><div id="old-history"><button>Back to conversation</button></div>`);
	await page.evaluate(() => document.fonts.ready);
	await assert.rejects(() => contained(page, '.old-actions button:first-child', '#old-dialog'), /horizontal containment/);
	await assert.rejects(() => contained(page, '#old-history button', '#old-history'), /horizontal containment/);
});
