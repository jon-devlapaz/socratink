import assert from 'node:assert/strict';
import { before, after, test } from 'node:test';
import { createServer } from 'vite';
import { chromium, webkit, expect } from 'playwright/test';

let server;
let origin;
const names = { google: 'Google', github: 'GitHub' };

before(async () => {
	server = await createServer({
		configFile: new URL('../vite.config.ui.ts', import.meta.url).pathname,
		server: { host: '127.0.0.1', port: 0, hmr: false, watch: null },
	});
	await server.listen();
	origin = `http://127.0.0.1:${server.httpServer.address().port}`;
});
after(async () => server?.close());

async function fixture(t, browser, theme = 'light', forcedColors = 'none', providers = { google: true, github: true }) {
	const context = await browser.newContext({
		viewport: { width: 375, height: 667 }, reducedMotion: 'reduce', hasTouch: true,
		colorScheme: theme, forcedColors,
	});
	t.after(() => context.close());
	const destinations = [];
	await context.route('**/*', route => {
		const url = new URL(route.request().url());
		if (url.origin !== origin) return route.abort();
		if (url.pathname === '/api/auth/providers') return route.fulfill({ json: providers });
		if (/^\/api\/auth\/(google|github)\/login$/.test(url.pathname)) {
			destinations.push(url.pathname);
			return route.abort('aborted');
		}
		if (url.pathname.startsWith('/api/')) return route.abort();
		return route.continue();
	});
	const page = await context.newPage();
	await page.goto(`${origin}/login.html`);
	await expect(page.getByRole('link', { name: 'Keep going as a guest', exact: true })).toBeVisible();
	for (const [provider, enabled] of Object.entries(providers)) {
		await expect(button(page, provider)).toHaveCount(enabled ? 1 : 0);
	}
	await page.evaluate(async theme => {
		document.documentElement.dataset.theme = theme;
		await document.fonts.ready;
	}, theme);
	await page.mouse.move(0, 0);
	return { page, destinations };
}

function button(page, provider) {
	return page.getByRole('button', { name: `Continue with ${names[provider]}`, exact: true });
}

async function tabTo(page, provider) {
	for (let i = 0; i < 8; i++) {
		await page.keyboard.press('Tab');
		if (await button(page, provider).evaluate(node => node === document.activeElement)) return;
	}
	assert.fail(`Tab did not reach ${provider}`);
}

async function labelPixels(page, provider) {
	const box = await button(page, provider).locator('span').boundingBox();
	const png = await page.screenshot({ clip: {
		x: Math.floor(box.x), y: Math.floor(box.y),
		width: Math.ceil(box.width), height: Math.ceil(box.height) + 5,
	} });
	return page.evaluate(async data => {
		const image = new Image();
		image.src = `data:image/png;base64,${data}`;
		await image.decode();
		const canvas = document.createElement('canvas');
		canvas.width = image.width;
		canvas.height = image.height;
		const context = canvas.getContext('2d');
		context.drawImage(image, 0, 0);
		return Array.from(context.getImageData(0, 0, image.width, image.height).data);
	}, png.toString('base64'));
}

function assertMark(baseline, focused) {
	assert.equal(focused.length, baseline.length, 'label region must not move or resize');
	let changed = 0;
	for (let i = 0; i < baseline.length; i += 4) {
		if (Math.max(...[0, 1, 2].map(channel => Math.abs(baseline[i + channel] - focused[i + channel]))) > 24) changed++;
	}
	assert.ok(changed >= 40, `visible label mark needs at least 40 changed pixels, got ${changed}`);
}

function assertNoMark(actual, baselines, message) {
	assert.ok(baselines.some(baseline => baseline.length === actual.length && baseline.every((value, i) => value === actual[i])), message);
}

async function hoverBaseline(page, provider) {
	await button(page, provider).hover();
	await page.waitForTimeout(200);
	const pixels = await labelPixels(page, provider);
	await finishPointer(page);
	return pixels;
}

async function finishPointer(page) {
	await page.mouse.move(10, 10);
	await page.mouse.move(0, 0);
	await page.waitForTimeout(200);
}

async function treatment(page, provider) {
	return button(page, provider).evaluate(node => {
		const style = getComputedStyle(node);
		return {
			background: style.backgroundColor, shadow: style.boxShadow,
			outline: style.outlineStyle, outlineWidth: style.outlineWidth,
			borderWidth: style.borderWidth,
		};
	});
}

for (const [engine, browserType] of Object.entries({ chromium, webkit })) {
	let browser;
	before(async () => { browser = await browserType.launch({ headless: true }); });
	after(async () => browser?.close());
	for (const theme of ['light', 'dark']) {
		for (const forcedColors of ['none', 'active']) {
			test(`${engine} ${theme} forced-colors=${forcedColors}: keyboard mark transfers and pointer clears it`, async t => {
				const { page, destinations } = await fixture(t, browser, theme, forcedColors);
				if (forcedColors === 'active' && !await page.evaluate(() => matchMedia('(forced-colors: active)').matches)) {
					t.skip(`${engine} does not support forced-colors emulation; native rendered evidence is still required`);
					return;
				}
				const baseline = {};
				const styles = {};
				const hovered = {};
				for (const provider of Object.keys(names)) {
					baseline[provider] = await labelPixels(page, provider);
					styles[provider] = await treatment(page, provider);
					hovered[provider] = await hoverBaseline(page, provider);
				}
				await tabTo(page, 'google');
				for (const [provider, key] of [['google', null], ['github', 'Tab'], ['google', 'Shift+Tab']]) {
					if (key) await page.keyboard.press(key);
					await expect(button(page, provider)).toBeFocused();
					assertMark(baseline[provider], await labelPixels(page, provider));
					const other = provider === 'google' ? 'github' : 'google';
					assert.deepEqual(await labelPixels(page, other), baseline[other], 'unfocused label has no mark');
					assert.deepEqual(await treatment(page, provider), styles[provider], 'focus must not add outline, ring or fill');
				}
				for (const method of ['click', 'tap']) {
					for (const provider of Object.keys(names)) {
						await tabTo(page, provider);
						const count = destinations.length;
						await button(page, provider)[method]();
						await expect.poll(() => destinations.length).toBe(count + 1);
						assert.equal(destinations.at(-1), `/api/auth/${provider}/login`);
						await finishPointer(page);
						for (const name of Object.keys(names)) assertNoMark(await labelPixels(page, name), [baseline[name], hovered[name]], `${method} after keyboard use leaves no mark, including sticky touch hover`);
					}
				}
			});
		}
	}
	test(`${engine}: fresh pointer visits and Enter preserve provider destinations`, async t => {
		for (const provider of Object.keys(names)) {
			for (const method of ['Enter', 'click', 'tap']) {
				const { page, destinations } = await fixture(t, browser);
				const baseline = await labelPixels(page, provider);
				const hovered = await hoverBaseline(page, provider);
				if (method === 'Enter') {
					await tabTo(page, provider);
					assertMark(baseline, await labelPixels(page, provider));
					await page.keyboard.press('Enter');
				} else {
					await button(page, provider)[method]();
				}
				await expect.poll(() => destinations.length).toBe(1);
				assert.deepEqual(destinations, [`/api/auth/${provider}/login`]);
				await finishPointer(page);
				if (method !== 'Enter') assertNoMark(await labelPixels(page, provider), [baseline, hovered], 'fresh pointer activation leaves no mark');
			}
		}
	});
	test(`${engine}: a single enabled provider keeps a keyboard mark`, async t => {
		for (const provider of Object.keys(names)) {
			const { page } = await fixture(t, browser, 'light', 'none', { google: provider === 'google', github: provider === 'github' });
			const baseline = await labelPixels(page, provider);
			await tabTo(page, provider);
			assertMark(baseline, await labelPixels(page, provider));
		}
		const { page } = await fixture(t, browser, 'light', 'none', { google: false, github: false });
		await expect(page.locator('.login-oauth-btn')).toHaveCount(0);
	});
	test(`${engine}: the same pixel assertion rejects the frozen no-mark baseline`, async t => {
		const { page } = await fixture(t, browser);
		await page.setContent(`<style>
			body { background: #fffcf0; color: #100f0f; font: 14px sans-serif; }
			button { min-height: 44px; background: #f2f0e9; color: inherit; }
			button:focus-visible { outline: none; }
		</style><button><span>Continue with Google</span></button><button><span>Continue with GitHub</span></button>`);
		for (const provider of Object.keys(names)) {
			const baseline = await labelPixels(page, provider);
			await tabTo(page, provider);
			const focused = await labelPixels(page, provider);
			assert.throws(() => assertMark(baseline, focused), /visible label mark/);
		}
	});
}
