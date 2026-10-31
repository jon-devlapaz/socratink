import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { namespacedConversationId } from '../src/config/session.ts';

// Opt-in browser proof using the same fake provider and signed session as smoke.
export async function verifyRevealBrowser({ origin, session, initialMessage, assistanceText,
	baselineChoice, baselineReason, comparisonChoice, comparisonReason, revisedChoice, revisedReason }) {
	const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
	const browser = await chromium.launch({
		executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
		headless: true,
	});
	const out = '.cache/reveal';
	await mkdir(out, { recursive: true });
	const context = await browser.newContext({ reducedMotion: 'reduce' });
	const equals = session.cookie.indexOf('=');
	await context.addCookies([{
		name: session.cookie.slice(0, equals), value: session.cookie.slice(equals + 1), url: origin,
	}]);
	await context.addInitScript((id) => {
		localStorage.setItem('socratink-chat-conversation-id', id);
	}, namespacedConversationId(session.userId, 'reveal-browser'));
	const page = await context.newPage();
	const artifacts = [];
	async function answer(choice, reason) {
		const form = page.locator('#active-turn .questionnaire');
		await form.getByText(choice, { exact: true }).click();
		await form.locator('input[type="text"]').fill(reason);
		await form.evaluate((node) => node.requestSubmit());
	}
	try {
		await page.goto(origin);
		await page.locator('#message').fill(initialMessage);
		await page.locator('#chat').evaluate((form) => form.requestSubmit());
		await answer(baselineChoice, baselineReason);
		await answer(comparisonChoice, comparisonReason);
		const supplied = page.locator('#active-turn .reveal-copy');
		await supplied.waitFor();
		assert.ok((await supplied.innerText()).includes(assistanceText));
		assert.equal(await supplied.locator('.reveal-mark').innerText(), 'answer');
		assert.ok((await supplied.ariaSnapshot()).includes('Socratink supplied an answer.'));
		assert.equal(await page.locator('.you .reveal-mark').count(), 0);
		const live = await supplied.evaluate((node) => ({
			text: node.textContent, color: getComputedStyle(node).color,
		}));
		for (const width of [390, 1280]) {
			await page.setViewportSize({ width, height: 900 });
			await page.reload();
			await supplied.waitFor();
			assert.deepEqual(await supplied.evaluate((node) => ({
				text: node.textContent, color: getComputedStyle(node).color,
			})), live);
			const geometry = await supplied.evaluate((node) => {
				const mark = node.querySelector('.reveal-mark').getBoundingClientRect();
				const copy = node.getBoundingClientRect();
				return { left: mark.left, right: mark.right, textLeft: copy.left + parseFloat(getComputedStyle(node).paddingLeft),
					overflow: document.documentElement.scrollWidth > innerWidth };
			});
			assert.ok(geometry.left >= 0 && geometry.right <= geometry.textLeft);
			assert.equal(geometry.overflow, false);
			assert.equal(await page.locator('.you .reveal-mark').count(), 0);
			await supplied.scrollIntoViewIfNeeded();
			await page.screenshot({ path: `${out}/${width}-restored.png` });
			artifacts.push({ width, live, geometry, accessibility: await supplied.ariaSnapshot() });
		}
		await answer(revisedChoice, revisedReason);
		await page.waitForFunction(() => document.querySelector('.alive-core')?.getAttribute('data-ink-expression') === 'connect');
		await page.reload();
		await page.locator('#trail-toggle').click();
		const earlier = page.locator('#messages .reveal-copy');
		await earlier.waitFor();
		assert.equal(await earlier.locator('.reveal-mark').innerText(), 'answer');
		assert.equal(await page.locator('#active-turn .reveal-mark').count(), 0);
		assert.equal(await page.locator('.you .reveal-mark').count(), 0);
		for (const width of [390, 1280]) {
			await page.setViewportSize({ width, height: 900 });
			await earlier.scrollIntoViewIfNeeded();
			await page.screenshot({ path: `${out}/${width}-trail.png` });
		}
		await writeFile(`${out}/proof.json`, JSON.stringify(artifacts, null, 2));
		console.log('Reveal browser passed: live answer, signed-session reload, accessible attribution, unchanged learner marks, 390px/1280px screenshots.');
	} finally {
		await browser.close();
	}
}
