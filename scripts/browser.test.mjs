import assert from 'node:assert/strict';
import { fork } from 'node:child_process';
import { cp, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, test } from 'node:test';
import { chromium } from 'playwright';
import { verifyCancellation, verifyRejectedRetry } from './chat-request-browser.mjs';

let directory;
let server;
let serverExited;
let browser;
let origin;
let currentHtml;
const learnerSelector = '#messages .history-turn.you > p, #active-turn .turn.you > p';
const isSend = (request) => request.method() === 'POST'
	&& request.url().includes('/api/agents/chat/') && !request.url().endsWith('/abort');
const rejectSend = (route) => isSend(route.request()) ? route.fulfill({
	status: 503, json: { error: { type: 'beta_paused', message: 'Beta replies are paused. You can still read your conversation.' } },
}) : route.fallback();

before(async () => {
	currentHtml = await readFile(new URL('../dist/client/index.html', import.meta.url), 'utf8');
	directory = await mkdtemp(join(tmpdir(), 'socratink-browser-'));
	await cp(new URL('../dist/client/', import.meta.url), join(directory, 'dist/client'), { recursive: true });
	server = fork(new URL('./browser-server-fixture.mjs', import.meta.url), [], {
		cwd: directory, execArgv: [], silent: true,
		env: { PATH: process.env.PATH, HOME: process.env.HOME, TMPDIR: process.env.TMPDIR, CI: '1' },
	});
	serverExited = new Promise((resolve) => server.once('exit', resolve));
	origin = await new Promise((resolve, reject) => {
		let log = '';
		server.stdout.on('data', (data) => { log = (log + data).slice(-8000); });
		server.stderr.on('data', (data) => { log = (log + data).slice(-8000); });
		const timer = setTimeout(() => reject(new Error(`Browser fixture startup timed out.\n${log}`)), 15_000);
		server.once('message', (message) => { clearTimeout(timer); resolve(message.origin); });
		server.once('error', (error) => { clearTimeout(timer); reject(error); });
		server.once('exit', (code) => { clearTimeout(timer); reject(new Error(`Browser fixture exited ${code}.\n${log}`)); });
	});
	browser = await chromium.launch();
}, { timeout: 25_000 });

after(async () => {
	await browser?.close();
	let code = server?.exitCode;
	if (server?.pid && server.exitCode === null && server.signalCode === null) {
		server.kill('SIGTERM');
		const timer = setTimeout(() => server.kill('SIGKILL'), 5_000);
		code = await serverExited;
		clearTimeout(timer);
	}
	if (directory) await rm(directory, { recursive: true, force: true });
	if (server?.pid) assert.equal(code, 0, 'the disposable server must shut down cleanly');
});

async function withPage(t, width, run, { signedIn = true } = {}) {
	const context = await browser.newContext({
		viewport: { width, height: 900 }, isMobile: width < 600, hasTouch: width < 600,
	});
	t.after(() => context.close());
	const external = [];
	await context.route('**/*', (route) => {
		if (route.request().url().startsWith(`${origin}/`)) return route.continue();
		external.push(route.request().url());
		return route.abort('blockedbyclient');
	});
	const page = await context.newPage();
	page.setDefaultTimeout(10_000);
	const errors = [];
	const providerSettings = [];
	page.on('pageerror', (error) => errors.push(error.message));
	page.on('request', (request) => {
		if (/\/api\/(chat-route|openai-key|openrouter)(?:[/?]|$)/.test(request.url())) providerSettings.push(request.url());
	});
	const response = await page.goto(`${origin}${signedIn ? '/__qa/login' : '/'}`);
	assert.equal(await response.text(), currentHtml, 'test the freshly built UI, never an old browser tab or bundle');
	await page.waitForFunction(() => document.querySelector('#message')?.placeholder === 'What are you working on?'
		&& !document.querySelector('#message').disabled);
	await run(page);
	assert.deepEqual(errors, [], 'no uncaught browser exceptions');
	assert.deepEqual(external, [], 'no live browser services');
	assert.deepEqual(providerSettings, [], 'the removed settings must not boot or fetch');
	assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'no horizontal overflow');
}

async function modelCalls() {
	return (await (await fetch(`${origin}/__qa/metrics`)).json()).modelCalls;
}

async function completed(page, action) {
	const admission = page.waitForResponse((response) => isSend(response.request()) && response.status() === 202);
	await action();
	await admission;
	await page.waitForFunction(() => !document.querySelector('#message').disabled
		&& !document.querySelector('#active-turn .request-state') && document.querySelector('#active-turn .assistant'));
	await page.waitForTimeout(250);
}

async function send(page, text) {
	await page.locator('#message').fill(text);
	await completed(page, () => page.getByRole('button', { name: 'Send message', exact: true }).click());
}

for (const width of [1280, 390]) {
	test(`rejected Retry preserves edited/blank drafts and one unsent turn (${width}px)`, { timeout: 60_000 }, async (t) => {
		await withPage(t, width, async (page) => {
			await page.route('**/api/agents/chat/**', rejectSend);
			const before = await modelCalls();
			await verifyRejectedRetry(page);
			assert.equal(await modelCalls(), before, 'rejected sends never reach a model');
		});
	});

	test(`menu works without provider controls (${width}px)`, { timeout: 60_000 }, async (t) => {
		await withPage(t, width, async (page) => {
			assert.equal(await page.locator('#providers-toggle, #providers-panel, #openai-key, #openrouter').count(), 0);
			await page.locator('#peek-handle').click();
			await page.waitForFunction(() => document.querySelector('#menu-layer').getAttribute('aria-hidden') === 'false');
			for (const id of ['type-size-toggle', 'appearance-toggle', 'start-over', 'auth-link']) {
				assert.equal(await page.locator(`#${id}`).isVisible(), true);
			}
			await page.locator('#auth-link').focus();
			await page.keyboard.press('Tab');
			assert.equal(await page.locator('#type-size-toggle').evaluate((element) => element === document.activeElement), true);
			await page.keyboard.press('Shift+Tab');
			assert.equal(await page.locator('#auth-link').evaluate((element) => element === document.activeElement), true);
			await page.locator('#type-size-toggle').click();
			const size = await page.locator('html').getAttribute('data-type-size');
			assert.ok(['small', 'medium', 'big'].includes(size));
			await page.locator('#appearance-toggle').click();
			await page.waitForFunction(() => document.documentElement.dataset.theme === localStorage.getItem('socratink-theme'));
			await page.keyboard.press('Escape');
			assert.equal(await page.locator('#peek-handle').getAttribute('aria-expanded'), 'false');
			await page.reload();
			assert.equal(await page.locator('html').getAttribute('data-type-size'), size);
		});
	});
}

test('Retry preserves identical accepted history, recovers admission, and survives reload', { timeout: 60_000 }, async (t) => {
	await withPage(t, 1280, async (page) => {
		const text = 'QA retry: keep this original learner message.';
		await send(page, text);
		await send(page, text);
		assert.deepEqual(await page.locator(learnerSelector).allTextContents(), [text, text]);
		await page.route('**/api/agents/chat/**', rejectSend);
		await verifyRejectedRetry(page);
		await page.unroute('**/api/agents/chat/**', rejectSend);
		const composed = await page.locator('#message').inputValue();
		await completed(page, () => page.getByRole('button', { name: 'Retry', exact: true }).click());
		const accepted = [text, text, composed];
		assert.deepEqual(await page.locator(learnerSelector).allTextContents(), accepted);
		await page.reload();
		await page.waitForFunction(() => !document.querySelector('#message').disabled);
		assert.deepEqual(await page.locator(learnerSelector).allTextContents(), accepted);
		const before = await modelCalls();
		await page.locator('#message').evaluate((input) => input.removeAttribute('maxlength'));
		await page.locator('#message').fill('x'.repeat(16001));
		await page.getByRole('button', { name: 'Send message', exact: true }).click();
		await page.waitForFunction(() => document.querySelector('#active-turn .not-admitted')?.textContent.includes('16,001'));
		assert.equal(await modelCalls(), before, 'local length validation does not dispatch');
		assert.deepEqual(await page.locator(learnerSelector).allTextContents(), accepted);
		await page.locator('#message').fill('QA corrected length.');
		await completed(page, () => page.getByRole('button', { name: 'Retry', exact: true }).click());
		assert.deepEqual(await page.locator(learnerSelector).allTextContents(), [...accepted, 'QA corrected length.']);
	});
});

test('cancellation settles one card and never erases an already admitted learner turn', { timeout: 60_000 }, async (t) => {
	await withPage(t, 1280, async (page) => {
		await verifyCancellation(page);
		const aborted = await page.locator(learnerSelector).allTextContents();
		await page.route('**/api/agents/chat/**', rejectSend);
		await page.getByRole('button', { name: 'Retry', exact: true }).click();
		await page.waitForFunction(() => document.querySelector('#active-turn .not-admitted'));
		await page.unroute('**/api/agents/chat/**', rejectSend);
		await send(page, 'QA new message after cancellation.');
		const expected = [...aborted, 'QA new message after cancellation.'];
		assert.deepEqual(await page.locator(learnerSelector).allTextContents(), expected);
		await page.reload();
		await page.waitForFunction(() => !document.querySelector('#message').disabled);
		assert.deepEqual(await page.locator(learnerSelector).allTextContents(), expected);
	});
});

test('hosted guests see the existing sign-in card, not provider setup', { timeout: 60_000 }, async (t) => {
	await withPage(t, 390, async (page) => {
		const before = await modelCalls();
		await page.locator('#message').fill('Synthetic guest message.');
		await page.getByRole('button', { name: 'Send message', exact: true }).click();
		await page.getByRole('link', { name: /Google/ }).waitFor();
		assert.match(await page.locator('#active-turn').textContent(), /sign in/i);
		assert.equal(await modelCalls(), before);
	}, { signedIn: false });
});
