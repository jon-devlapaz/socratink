import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { clientFor, gate, until } from './durable-smoke-support.mjs';

async function openBrowser(app, session, conversationId, out) {
	const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
	const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, headless: true });
	const context = await browser.newContext({ viewport: { width: 1000, height: 900 }, reducedMotion: 'reduce' });
	await context.addCookies(session.cookie.split(';').map((pair) => {
		const equals = pair.indexOf('=');
		return { name: pair.slice(0, equals).trim(), value: pair.slice(equals + 1), url: app.origin };
	}));
	await context.addInitScript((id) => localStorage.setItem('socratink-chat-conversation-id', id), conversationId);
	await context.route('**/*', (route) => new URL(route.request().url()).origin === app.origin ? route.continue() : route.abort());
	const page = await context.newPage();
	const errors = [];
	page.on('pageerror', (error) => errors.push(error.message));
	const paths = [];
	page.on('request', (request) => paths.push(new URL(request.url()).pathname));
	page.setDefaultTimeout(15_000);
	await mkdir(out, { recursive: true });
	return { browser, page, errors, paths };
}

export async function verifyDurableBrowser({ app, session, fixture, out }) {
	const marker = 'DURABLE_BROWSER';
	const reasoning = 'I am comparing this synthetic learner response with the earlier evidence.';
	const text = 'The synthetic browser reply is complete.';
	const held = gate();
	fixture.plan(marker, { reasoning, text, afterReasoning: held });
	const id = `${session.userId}:durable-browser`;
	const { browser, page, errors, paths } = await openBrowser(app, session, id, out);
	try {
		await page.goto(app.origin);
		await page.locator('#message').fill(marker);
		await page.locator('#chat').evaluate((form) => form.requestSubmit());
		await until(async () => (await page.locator('#active-turn .pending .thinking-step-copy').allTextContents()).join('') === reasoning,
			'actual browser receives live reasoning while provider remains held');
		assert.equal(fixture.count(marker), 1);
		assert.equal(await page.locator('#active-turn .assistant').count(), 0);
		assert.equal(await page.locator('#active-turn .you p').innerText(), marker);
		await page.screenshot({ path: join(out, 'reasoning-pending.png') });
		await page.reload();
		await page.locator('#active-turn .request-state.recovery').waitFor();
		assert.equal(fixture.count(marker), 1, 'pending reload must not resubmit');
		await page.screenshot({ path: join(out, 'reasoning-recovery.png') });
		held.release();
		await until(async () => (await page.locator('#active-turn .assistant').allTextContents()).join('').includes(text),
			'reloaded browser reattaches to existing admission');
		assert.equal((await page.locator('#active-turn .assistant').innerText()).includes(reasoning), false);
		assert.equal((await page.locator('#active-turn .you').innerText()).includes(reasoning), false);
		assert.equal(await page.locator('#active-turn .assistant .turn-model').innerText(), 'synthetic/routed-model · ↻1');
		await page.screenshot({ path: join(out, 'reasoning-completed.png') });
		await page.reload();
		await page.locator('#active-turn .assistant').filter({ hasText: text }).waitFor();
		assert.equal(await page.locator('#active-turn .assistant .turn-model').innerText(), 'synthetic/routed-model · ↻1');
		assert.equal(fixture.count(marker), 1);
		assert.equal((await clientFor(app, session, id).history()).settlements.at(-1).outcome, 'completed');
		await page.screenshot({ path: join(out, 'reasoning-reloaded.png') });
		assert.ok(paths.some((path) => path.endsWith('/events')), 'the browser follows turns over SSE');
		assert.deepEqual(errors, []);
		return { browser: browser.version(), liveReasoningBeforeCompletion: true, pendingReloadNoResubmit: true,
			completedReload: true, screenshots: 4 };
	} finally {
		held.release();
		await browser.close();
	}
}

export async function verifyDurableHistoryBrowser({ app, session, conversationId, expectedText, question, reveal, out }) {
	const { browser, page, errors } = await openBrowser(app, session, conversationId, out);
	try {
		for (const action of ['loaded', 'reloaded']) {
			if (action === 'loaded') await page.goto(app.origin); else await page.reload();
			await page.locator('#active-turn .assistant').waitFor();
			assert.ok((await page.locator('#active-turn .assistant').innerText()).includes(expectedText));
			assert.equal(await page.locator('#active-turn .assistant .turn-model').innerText(), 'synthetic/routed-model · ↻1');
			if (question) await page.locator('#active-turn .questionnaire').filter({ hasText: question }).waitFor();
			if (reveal) {
				assert.equal(await page.locator('#active-turn .assistant .reveal-mark').count(), 1);
				assert.equal(await page.locator('#active-turn .you .reveal-mark').count(), 0);
			}
			await page.screenshot({ path: join(out, `history-${action}.png`) });
		}
		assert.deepEqual(errors, []);
		return { loaded: true, reloaded: true, screenshots: 2 };
	} finally {
		await browser.close();
	}
}
