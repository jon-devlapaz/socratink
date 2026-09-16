import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

// Optional real-browser boundary for the deterministic smoke server. The host
// supplies Playwright; the normal smoke gate does not require browser tooling.
export async function verifyInkBrowser({ origin, initialMessage }) {
	const { chromium } = await import(
		process.env.PLAYWRIGHT_MODULE || 'playwright-core'
	);
	const browser = await chromium.launch({
		executablePath:
			process.env.CHROME_PATH ||
			'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
		headless: true,
		args: ['--use-gl=angle', '--use-angle=metal'],
	});
	const page = await browser.newPage({
		viewport: { width: 1280, height: 900 },
		deviceScaleFactor: 2,
	});
	const errors = [];
	page.on('pageerror', (error) => errors.push(error.message));
	page.on('console', (message) => {
		if (message.type() === 'error') errors.push({ text: message.text(), location: message.location().url });
	});
	const out = '.cache/ink-browser';
	await mkdir(out, { recursive: true });
	const expression = (kind) =>
		page.waitForSelector(`.alive-core[data-ink-expression="${kind}"]`);
	try {
		await page.addInitScript(() => {
			localStorage.setItem('socratink-demo-auth', '1');
			if (!localStorage.getItem('socratink-chat-conversation-id'))
				localStorage.setItem(
					'socratink-chat-conversation-id',
					'smoke-conversation',
				);
		});
		await page.goto(origin);
		await expression('connect');
		await page.waitForSelector('[data-ink-ready="true"]');
		await page.waitForTimeout(1800);
		await page.screenshot({ path: out + '/restored-connect.png' });
		assert.equal(
			await page
				.locator('.tool-list')
				.filter({ hasText: 'ink_express' })
				.count(),
			0,
		);
		await page.locator('#message').fill('An explanation in my own words.');
		await expression('explain');
		await page.locator('#message').fill('');
		await expression('connect');
		// Keep the existing dock as an operable button, including keyboard access.
		await page.locator('.alive-core').focus();
		await page.keyboard.press('Enter');
		assert.equal(
			await page.locator('.alive-core').getAttribute('aria-expanded'),
			'true',
		);
		await page.keyboard.press('Escape');
		await page.locator('#menu-trigger').click();
		await page.locator('#appearance-toggle').click();
		await page.keyboard.press('Escape');
		await page.waitForTimeout(1200);
		assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
		await page.screenshot({path:out+'/dark-connect.png'});
		await page.emulateMedia({ reducedMotion: 'reduce' });
		await page.locator('#message').fill('Static explanation');
		await expression('explain');
		await page.waitForTimeout(200);
		const before = await page
			.locator('.alive-core canvas')
			.evaluate((canvas) => canvas.toDataURL());
		await page.waitForTimeout(200);
		assert.equal(
			await page
				.locator('.alive-core canvas')
				.evaluate((canvas) => canvas.toDataURL()),
			before,
		);
		await page.setViewportSize({ width: 390, height: 844 });
		await page.waitForFunction(
			() => document.documentElement.scrollWidth <= innerWidth,
		);
		await page.screenshot({ path: out + '/mobile-explain.png' });
		await page.emulateMedia({ reducedMotion: 'no-preference' });
		await page.evaluate(() =>
			localStorage.setItem('socratink-chat-conversation-id', 'browser-ink'),
		);
		await page.reload();
		await expression('rest');
		await page.locator('#message').fill(initialMessage);
		await expression('explain');
		await page.locator('#chat').evaluate((form) => form.requestSubmit());
		await expression('question');
		await page.reload();
		await expression('question');
		await page.waitForSelector('[data-ink-ready="true"]');
		await page.waitForTimeout(1800);
		await page.screenshot({ path: out + '/question.png' });
		// A graphics reset must retain the usable dock and return to a lit symbol.
		await page.locator('.alive-core canvas').evaluate((canvas) => {
			window.__inkContext = canvas
				.getContext('webgl2')
				.getExtension('WEBGL_lose_context');
			window.__inkContext.loseContext();
		});
		await page.waitForSelector('[data-ink-ready="false"]');
		assert.equal(await page.locator('.living-ink-poster').isVisible(), true);
		await page.evaluate(() => window.__inkContext.restoreContext());
		await page.waitForSelector('[data-ink-ready="true"]');
		assert.equal(
			await page.locator('.alive-core').getAttribute('data-ink-expression'),
			'question',
		);
		// The SDK probes history before a fresh conversation exists; that one
		// documented 404 is expected. Missing assets and all other errors fail.
		const unexpectedErrors = errors.filter((error) => !(typeof error === 'object'
			&& error.location === `${origin}/api/agents/chat/browser-ink?view=history`
			&& error.text.includes('404')));
		assert.deepEqual(unexpectedErrors, []);
		console.log(
			'Ink browser passed: restored native tool cue, own-word typing, dock keyboard, reduced motion, mobile, real present_question round trip + reload, context recovery.',
		);
	} finally {
		await browser.close();
	}
}
