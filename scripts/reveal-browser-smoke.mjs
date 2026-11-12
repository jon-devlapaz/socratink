import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { namespacedConversationId } from '../src/config/session.ts';

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
	async function answer(choice, reason) {
		const form = page.locator('#active-turn .questionnaire');
		await form.getByText(choice, { exact: true }).click();
		await form.locator('input[type="text"]').fill(reason);
		await form.evaluate((node) => node.requestSubmit());
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
				assert.equal(await input.inputValue(), 'Check input');
				await input.fill('');
				const peek = page.locator('#peek-handle');
				await peek.click();
				assert.equal(await peek.getAttribute('aria-expanded'), 'true');
				assert.equal(await page.locator('#menu-layer').evaluate((node) =>
					!node.inert && node.contains(document.activeElement)), true);
				await page.keyboard.press('Escape');
				assert.equal(await peek.getAttribute('aria-expanded'), 'false');
				assert.equal(await peek.evaluate((node) => document.activeElement === node), true);
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
		await page.locator('#peek-handle').click();
		await page.locator('#appearance-toggle').click();
		await page.locator('#type-size-toggle').click();
		await page.locator('#type-size-toggle').click();
		assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
		assert.equal(await page.locator('#type-size-label').innerText(), 'Big');
		const blockModules = route => route.abort();
		await page.route('**/assets/*.js', blockModules);
		try {
			await page.reload({ waitUntil: 'domcontentloaded' });
			assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
			assert.equal(await page.locator('html').getAttribute('data-type-size'), 'big');
			assert.equal(await page.locator('#theme-color').getAttribute('content'), '#100f0f');
		} finally {
			await page.unroute('**/assets/*.js', blockModules);
		}
		await page.reload();
		await page.locator('#peek-handle').click();
		assert.equal(await page.locator('#appearance-toggle').getAttribute('aria-pressed'), 'true');
		assert.equal(await page.locator('#type-size-label').innerText(), 'Big');
		await page.locator('#appearance-toggle').click();
		await page.locator('#type-size-toggle').click();
		await page.keyboard.press('Escape');
		artifacts.push({ kind: 'preferences', restoredBeforeAppModule: true, themeAndTextSizeSurviveReload: true });
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
		const fourthTurnResponse = page.waitForResponse(response =>
			response.request().method() === 'POST' && response.url().startsWith(`${origin}/api/agents/chat/`));
		await answer(revisedChoice, revisedReason);
		const rejected = await fourthTurnResponse;
		assert.equal(rejected.status(), 403);
		assert.equal((await rejected.json()).error.type, 'guest_turn_limit');
		const notSent = page.locator('#active-turn .request-state.not-admitted');
		await notSent.getByText('Not sent', { exact: true }).waitFor();
		assert.ok((await notSent.innerText()).includes('Sign in to continue this conversation.'));
		assert.equal(await notSent.getByRole('button', { name: 'Retry', exact: true }).isEnabled(), true);
		assert.equal(await supplied.locator('.reveal-mark').innerText(), 'answer');
		await page.reload();
		await supplied.waitFor();
		assert.equal(await supplied.locator('.reveal-mark').innerText(), 'answer');
		artifacts.push({ kind: 'guest-limit', fourthTurnRejected: true, priorRevealRestored: true });
		await page.evaluate(id => localStorage.setItem('socratink-chat-conversation-id', id), savedConversationId);
		await page.reload();
		await page.locator('#trail-toggle').click();
		// The saved smoke conversation also holds a card hint and a corrected
		// reply to "no idea", which is the active turn.
		const earlier = page.locator('#messages .reveal-copy');
		await earlier.first().waitFor();
		assert.deepEqual(await earlier.locator('.reveal-mark').allInnerTexts(), ['answer', 'hint']);
		assert.equal(await page.locator('#active-turn .reveal-mark').innerText(), 'hint');
		assert.equal(await page.locator('.you .reveal-mark').count(), 0);
		for (const width of [390, 1280]) {
			await page.setViewportSize({ width, height: 900 });
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
