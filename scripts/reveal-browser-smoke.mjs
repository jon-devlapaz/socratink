import assert from 'node:assert/strict';
import { expect } from 'playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { assertHelpLayout } from './reveal-browser-layout.mjs';
import { assertAccessible } from './browser-accessibility.mjs';
import { namespacedConversationId } from '../src/config/session.ts';
import { guestTurnLimit, guestTurnsHeader } from '../src/server/guest-turns.ts';

// Browser proof uses only the fake provider and synthetic session from smoke.
export async function verifyRevealBrowser({ origin, session, savedConversationId, initialMessage, assistanceText,
	baselineChoice, baselineReason, comparisonChoice, comparisonReason, revisedChoice, revisedReason }) {
	const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
	const browser = await chromium.launch({
		executablePath: process.env.CHROME_PATH || undefined,
		headless: true,
	});
	const out = process.env.BROWSER_PROOF_DIR || '.cache/reveal';
	await mkdir(out, { recursive: true });
	await writeFile(`${out}/runtime.json`, JSON.stringify({
		node: process.version, platform: process.platform, arch: process.arch, browser: browser.version(),
	}, null, 2));
	const context = await browser.newContext({ reducedMotion: 'reduce' });
	await context.tracing.start({ screenshots: true, snapshots: true });
	const equals = session.cookie.indexOf('=');
	await context.addCookies([{
		name: session.cookie.slice(0, equals), value: session.cookie.slice(equals + 1), url: origin,
	}]);
	await context.addInitScript((id) => {
		if (!localStorage.getItem('socratink-chat-conversation-id')) {
			localStorage.setItem('socratink-chat-conversation-id', id);
		}
	}, namespacedConversationId(session.userId, 'reveal-browser'));
	const page = await context.newPage();
	const artifacts = [];
	let guestTurns = 0;
	async function answer(choice, reason) {
		const form = page.getByRole('form', { name: 'Questions', exact: true });
		await form.getByText(choice, { exact: true }).click();
		await form.getByRole('textbox').fill(reason);
		await form.getByRole('button', { name: 'Submit', exact: true }).click();
		guestTurns += 1;
	}
	try {
		const { verifyUiBrowser } = await import('./ui-browser-smoke.mjs');
		await verifyUiBrowser({ browser, origin, session, out: `${out}/ui` });
		const { verifyQuestionnaireBrowser } = await import('./questionnaire-browser-smoke.mjs');
		await verifyQuestionnaireBrowser({ browser, origin, session, out: `${out}/questionnaires` });
		for (const reducedMotion of ['no-preference', 'reduce']) {
			await page.emulateMedia({ reducedMotion });
			for (const width of [390, 1280]) {
				await page.setViewportSize({ width, height: 900 });
				await page.goto(origin);
				const input = page.locator('#message');
				await input.fill('Check input');
				await expect(input).toHaveValue('Check input');
				await input.fill('');
				const trigger = page.locator('#menu-trigger');
				await trigger.click();
				await expect(trigger).toHaveAttribute('aria-expanded', 'true');
				assert.equal(await page.locator('#menu-dialog').evaluate((node) =>
					!node.inert && node.contains(document.activeElement)), true);
				await page.keyboard.press('Escape');
				await expect(trigger).toHaveAttribute('aria-expanded', 'false');
				await expect(trigger).toBeFocused();
				assert.equal(await input.evaluate((node) => !!node.closest('[inert]')), false);
				const shell = await input.evaluate((node) => ({
					bodyCursor: getComputedStyle(document.body).cursor,
					inputCursor: getComputedStyle(node).cursor,
					overflow: document.documentElement.scrollWidth > innerWidth,
				}));
				assert.notEqual(shell.bodyCursor, 'none');
				assert.notEqual(shell.inputCursor, 'none');
				assert.equal(shell.overflow, false);
				await page.screenshot({ path: `${out}/${width}-${reducedMotion}-shell.png` });
				artifacts.push({ kind: 'shell', width, reducedMotion, ...shell, menuKeyboard: 'passed' });
			}
		}
		await page.emulateMedia({ colorScheme: 'light' });
		await page.locator('#menu-trigger').click();
		await page.locator('#appearance-toggle').click();
		await page.locator('#type-size-toggle').click();
		await page.locator('#type-size-toggle').click();
		await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
		assert.equal(await page.locator('#type-size-label').innerText(), 'Big');
		await assertAccessible(page, 'Menu, dark theme and large text');
		const blockModules = route => route.abort();
		await page.route('**/assets/*.js', blockModules);
		try {
			await page.reload({ waitUntil: 'domcontentloaded' });
			await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
			await expect(page.locator('html')).toHaveAttribute('data-type-size', 'big');
			await expect(page.locator('#theme-color')).toHaveAttribute('content', '#100f0f');
		} finally {
			await page.unroute('**/assets/*.js', blockModules);
		}
		await page.reload();
		await page.locator('#menu-trigger').click();
		await expect(page.locator('#appearance-toggle')).toHaveAttribute('aria-pressed', 'true');
		assert.equal(await page.locator('#type-size-label').innerText(), 'Big');
		await page.locator('#appearance-toggle').click();
		await page.locator('#type-size-toggle').click();
		await page.keyboard.press('Escape');
		await assertAccessible(page, 'Empty conversation, light theme');
		artifacts.push({ kind: 'preferences', restoredBeforeAppModule: true, themeAndTextSizeSurviveReload: true });
		await page.getByRole('textbox', { name: 'Message Socratink', exact: true }).fill(initialMessage);
		await page.getByRole('button', { name: 'Send message', exact: true }).click();
		guestTurns += 1;
		await answer(baselineChoice, baselineReason);
		await answer(comparisonChoice, comparisonReason);
		const consent = page.locator('#active-turn .questionnaire');
		const consentLine = 'I can show a full answer.';
		await consent.getByText(consentLine, { exact: true }).waitFor();
		assert.equal((await page.locator('#active-turn').innerText()).includes(assistanceText), false);
		await page.reload();
		await consent.getByText(consentLine, { exact: true }).waitFor();
		assert.deepEqual(await consent.getByRole('button').allTextContents(), ['See it', 'Try once more']);
		await consent.getByRole('button', { name: 'See it', exact: true }).click();
		guestTurns += 1;
		// The settled turn, not the pending turn that may show the same text live.
		const supplied = page.locator('#active-turn .turn.assistant .reveal-copy');
		await supplied.waitFor();
		await assertAccessible(page, 'Supplied answer in the conversation');
		assert.ok((await supplied.innerText()).includes(assistanceText));
		assert.equal(await supplied.locator('.reveal-mark').innerText(), 'Full answer from Socratink');
		assert.equal((await supplied.ariaSnapshot()).split('Full answer from Socratink').length - 1, 1);
		await expect(page.locator('.you .reveal-mark')).toHaveCount(0);
		const live = await supplied.evaluate((node) => ({
			text: node.textContent, color: getComputedStyle(node).color,
		}));
		for (const width of [375, 390, 1280]) {
			await page.setViewportSize({ width, height: 900 });
			await page.reload();
			await supplied.waitFor();
			assert.deepEqual(await supplied.evaluate((node) => ({
				text: node.textContent, color: getComputedStyle(node).color,
			})), live);
			const geometry = await assertHelpLayout(supplied);
			await expect(page.locator('.you .reveal-mark')).toHaveCount(0);
			await supplied.scrollIntoViewIfNeeded();
			await page.screenshot({ path: `${out}/${width}-restored.png` });
			artifacts.push({ width, live, geometry, accessibility: await supplied.ariaSnapshot() });
		}
		for (let turn = guestTurns; turn < guestTurnLimit; turn++) {
			const response = await context.request.post(`${origin}/api/agents/chat/not-owned`);
			assert.equal(response.status(), 403);
			assert.notEqual((await response.json()).error.type, 'guest_turn_limit');
			assert.equal(response.headers()[guestTurnsHeader.toLowerCase()], String(turn + 1));
		}
		const limitResponse = page.waitForResponse(response =>
			response.request().method() === 'POST' && response.url().startsWith(`${origin}/api/agents/chat/`));
		await answer(revisedChoice, revisedReason);
		const rejected = await limitResponse;
		assert.equal(rejected.status(), 403);
		assert.equal((await rejected.json()).error.type, 'guest_turn_limit');
		const notSent = page.locator('#active-turn .request-state.not-admitted');
		await notSent.getByText('Not sent', { exact: true }).waitFor();
		assert.ok((await notSent.innerText()).includes('Sign in to continue this conversation.'));
		await expect(notSent.getByRole('button', { name: 'Retry', exact: true })).toBeEnabled();
		assert.equal(await supplied.locator('.reveal-mark').innerText(), 'Full answer from Socratink');
		await page.reload();
		await supplied.waitFor();
		assert.equal(await supplied.locator('.reveal-mark').innerText(), 'Full answer from Socratink');
		artifacts.push({ kind: 'guest-limit', rejectedTurn: guestTurnLimit + 1, priorRevealRestored: true });
		await page.evaluate(id => localStorage.setItem('socratink-chat-conversation-id', id), savedConversationId);
		await page.reload();
		await page.setViewportSize({ width: 375, height: 667 });
		const earlierSteps = page.getByRole('button', { name: /^\d+ earlier steps?$/ });
		await earlierSteps.waitFor();
		const bookmark = await earlierSteps.evaluate(button => {
			const label = button.querySelector('span');
			return {
				fits: label.scrollWidth <= label.clientWidth + 1 && label.clientHeight > 1,
				ink: getComputedStyle(label).color, paper: getComputedStyle(document.documentElement).backgroundColor,
				height: button.getBoundingClientRect().height,
				clearOfText: button.getBoundingClientRect().bottom <= document.querySelector('.active-scroll').getBoundingClientRect().top + 1,
			};
		});
		assert.ok(bookmark.fits && bookmark.clearOfText, 'earlier step count fits above the transcript');
		assert.notEqual(bookmark.ink, bookmark.paper, 'the collapsed label is visible before hover');
		assert.ok(bookmark.height >= 44, 'Earlier steps has a full touch target');
		await earlierSteps.press('Enter');
		// The saved smoke conversation also holds a card hint and a corrected
		// reply to "no idea", which is the active turn.
		const earlier = page.locator('#messages .reveal-copy');
		await earlier.first().waitFor();
		assert.deepEqual(await earlier.locator('.reveal-mark').allInnerTexts(), ['Full answer from Socratink', 'Hint from Socratink']);
		assert.equal(await page.locator('#active-turn .reveal-mark').innerText(), 'Hint from Socratink');
		await expect(page.locator('.you .reveal-mark')).toHaveCount(0);
		for (const width of [375, 390, 1280]) {
			await page.setViewportSize({ width, height: 900 });
			await assertHelpLayout(earlier.nth(1));
			await earlier.first().scrollIntoViewIfNeeded();
			await page.screenshot({ path: `${out}/${width}-trail.png` });
		}
		artifacts.push({ kind: 'saved-history', earlierRevealAttributed: true });
		console.log('Reveal browser passed: native cursor, menu keyboard recovery, normal/reduced motion, prepaint preferences, live answer, signed-session reload, accessible attribution, guest turn limit, 390px/1280px screenshots.');
	} catch (error) {
		await page.screenshot({ path: `${out}/failure.png` }).catch(() => {});
		throw error;
	} finally {
		await writeFile(`${out}/proof.json`, JSON.stringify(artifacts, null, 2));
		try {
			await context.tracing.stop({ path: `${out}/trace.zip` });
		} finally {
			await browser.close();
		}
	}
}
