import assert from 'node:assert/strict';
import { before, after, test } from 'node:test';
import { createServer } from 'vite';
import { chromium, expect } from 'playwright/test';

let server;
let browser;
let origin;
const reason = 'Sign in to keep your conversations across devices.';
const guestLabel = 'Keep going as a guest';
const savedText = 'Why does 2 + 2 equal 4?';
const unsentText = 'Is it because two pairs make four?';

before(async () => {
	server = await createServer({
		configFile: new URL('../vite.config.ui.ts', import.meta.url).pathname,
		server: { host: '127.0.0.1', port: 0, hmr: false, watch: null },
	});
	await server.listen();
	origin = `http://127.0.0.1:${server.httpServer.address().port}`;
	browser = await chromium.launch({ headless: true });
});
after(async () => {
	await browser?.close();
	await server?.close();
});

async function fixture(t, width = 390, javaScriptEnabled = true) {
	const context = await browser.newContext({ viewport: { width, height: 844 }, reducedMotion: 'reduce', javaScriptEnabled });
	t.after(() => context.close());
	const state = { providers: { google: true, github: true }, conversationId: undefined, reads: [] };
	const errors = [];
	t.after(() => assert.deepEqual(errors, []));
	await context.route('**/*', async route => {
		const request = route.request();
		const url = new URL(request.url());
		if (url.origin !== origin) return route.abort();
		if (url.pathname === '/api/auth/providers') return route.fulfill({ json: state.providers });
		if (url.pathname === '/api/session') {
			const session = { userId: 'guest-sign-in-test', aliases: [], kind: 'guest' };
			if (request.method() === 'POST') return route.fulfill({
				json: session, headers: { 'set-cookie': 'socratink-session=synthetic-guest; Path=/; HttpOnly; SameSite=Lax' },
			});
			return request.headers().cookie?.includes('socratink-session=synthetic-guest')
				? route.fulfill({ json: session }) : route.fulfill({ status: 401 });
		}
		if (url.pathname.startsWith('/api/agents/chat/')) {
			assert.equal(request.method(), 'GET');
			const id = decodeURIComponent(url.pathname.slice('/api/agents/chat/'.length));
			state.conversationId ??= id;
			state.reads.push(id);
			return route.fulfill({ json: {
				v: 1, conversationId: id,
				messages: id === state.conversationId ? [{
					id: 'saved-learner-message', role: 'user', display: 'visible', submissionId: 'saved-turn',
					parts: [{ type: 'text', text: savedText, state: 'done' }],
				}] : [],
				settlements: [{ submissionId: 'saved-turn', outcome: 'completed' }],
			} });
		}
		if (url.pathname.startsWith('/api/')) return route.abort();
		return route.continue();
	});
	const page = await context.newPage();
	page.on('pageerror', error => errors.push(error.message));
	return { page, context, state };
}

async function assertReason(page, timeout = 5000) {
	await expect(page.getByText(reason, { exact: true })).toBeVisible({ timeout });
}

async function assertGuestReturn(page, timeout = 5000) {
	const link = page.getByRole('link', { name: guestLabel, exact: true });
	await expect(link).toBeVisible({ timeout });
	await expect(link).toHaveAttribute('href', '/');
	return link;
}

for (const width of [390, 1280]) {
	test(`guest return preserves saved conversation and session at ${width}px`, async t => {
		const { page, context, state } = await fixture(t, width);
		await page.goto(origin);
		await expect(page.locator('#message')).toBeEnabled();
		await expect(page.getByText(savedText, { exact: true })).toBeVisible();
		const id = await page.evaluate(() => localStorage.getItem('socratink-chat-conversation-id'));
		assert.equal(id, state.conversationId);
		const cookies = await context.cookies();
		assert.equal(cookies.find(cookie => cookie.name === 'socratink-session')?.value, 'synthetic-guest');
		await page.locator('#message').fill(unsentText);
		await page.locator('#menu-trigger').click();
		await page.getByRole('link', { name: 'Sign in', exact: true }).click();
		await expect(page).toHaveURL(`${origin}/login.html`);
		await assertReason(page);
		for (const name of ['Google', 'GitHub']) {
			await expect(page.getByRole('button', { name: `Continue with ${name}`, exact: true })).toBeVisible();
		}
		const guest = await assertGuestReturn(page);
		await guest.focus();
		await expect(guest).toBeFocused();
		await page.keyboard.press('Enter');
		await expect(page).toHaveURL(`${origin}/`);
		await expect(page.locator('#message')).toBeEnabled();
		await expect(page.getByText(savedText, { exact: true })).toBeVisible();
		await expect(page.locator('#message')).toHaveValue(unsentText);
		assert.equal(await page.evaluate(() => localStorage.getItem('socratink-chat-conversation-id')), id);
		assert.deepEqual(state.reads, [id, id]);
		assert.deepEqual(await context.cookies(), cookies);
	});
}

test('a completed sign-in returns the unsent message once', async t => {
	const { page } = await fixture(t);
	await page.route(`${origin}/api/auth/google/login`, route => route.fulfill({ status: 302, headers: { location: '/' } }));
	await page.goto(origin);
	await expect(page.locator('#message')).toBeEnabled();
	await page.locator('#message').fill(unsentText);
	await page.locator('#menu-trigger').click();
	await page.getByRole('link', { name: 'Sign in', exact: true }).click();
	await page.getByRole('button', { name: 'Continue with Google', exact: true }).click();
	await expect(page).toHaveURL(`${origin}/`);
	await expect(page.locator('#message')).toBeEnabled();
	await expect(page.locator('#message')).toHaveValue(unsentText);
	// A later visit that is not a return from sign-in keeps the existing new-page rule.
	await page.goto(origin);
	await expect(page.locator('#message')).toBeEnabled();
	await expect(page.locator('#message')).toHaveValue('');
});

test('sign-in controls fit phone and desktop with enlarged text in both themes', async t => {
	for (const width of [390, 1280]) {
		const { page } = await fixture(t, width);
		await page.goto(`${origin}/login.html`);
		for (const theme of ['light', 'dark']) {
			await page.evaluate(theme => {
				document.documentElement.dataset.theme = theme;
				document.documentElement.style.fontSize = '200%';
			}, theme);
			await assertReason(page);
			const guest = await assertGuestReturn(page);
			for (const control of [guest, page.getByRole('button', { name: 'Continue with Google', exact: true }), page.getByRole('button', { name: 'Continue with GitHub', exact: true })]) {
				await control.scrollIntoViewIfNeeded();
				await expect(control).toBeInViewport();
				const box = await control.boundingBox();
				assert.ok(box.height >= 44);
				assert.ok(box.x >= 0 && box.x + box.width <= width);
				assert.equal(await control.evaluate(node => node.scrollWidth <= node.clientWidth), true);
			}
			assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
		}
	}
});

test('provider availability and OAuth start destinations stay unchanged', async t => {
	const { page, state } = await fixture(t);
	for (const providers of [{ google: true, github: false }, { google: false, github: true }, { google: false, github: false }]) {
		state.providers = providers;
		const loaded = page.waitForResponse(response => new URL(response.url()).pathname === '/api/auth/providers');
		await page.goto(`${origin}/login.html`);
		await loaded;
		await assertGuestReturn(page);
		for (const [provider, name] of [['google', 'Google'], ['github', 'GitHub']]) {
			await expect(page.getByRole('button', { name: `Continue with ${name}`, exact: true })).toHaveCount(providers[provider] ? 1 : 0);
		}
	}
	state.providers = { google: true, github: true };
	for (const [provider, name] of [['google', 'Google'], ['github', 'GitHub']]) {
		await page.goto(`${origin}/login.html`);
		const destination = `${origin}/api/auth/${provider}/login`;
		await page.route(destination, route => route.fulfill({ contentType: 'text/html', body: '<p>Synthetic OAuth start</p>' }));
		await page.getByRole('button', { name: `Continue with ${name}`, exact: true }).click();
		await expect(page).toHaveURL(destination);
	}
});

test('404 keeps destinations and uses Sign in, including without JavaScript', async t => {
	const { page } = await fixture(t, 390, false);
	await page.goto(`${origin}/404.html`);
	await expect(page.getByRole('link', { name: 'Sign in', exact: true })).toHaveAttribute('href', '/login');
	await expect(page.getByRole('link', { name: 'Home', exact: true })).toHaveAttribute('href', '/');
	await expect(page.getByRole('link', { name: 'Log in', exact: true })).toHaveCount(0);
});

test('known OAuth errors keep actionable feedback and unknown codes stay quiet', async t => {
	const { page } = await fixture(t);
	for (const [code, text] of [
		['auth_failed', "Sign-in didn't complete. Please try again."],
		['unverified_email', "That account's email isn't verified. Verify it with the provider, then try again."],
		['unknown', undefined],
	]) {
		await page.goto(`${origin}/login.html?error=${code}&keep=1`);
		await expect(page).toHaveURL(`${origin}/login.html?keep=1`);
		if (text) await expect(page.getByRole('alert')).toHaveText(text);
		else await expect(page.getByRole('alert')).toHaveCount(0);
		await assertGuestReturn(page);
	}
});

test('original page rejects the reason, guest return and provider-label assertions independently', async t => {
	const { page } = await fixture(t);
	await page.setContent('<main><h1>Sign in</h1><a href="/" aria-label="Socratink home">Socratink</a><button>Google</button><button>GitHub</button></main>');
	await assert.rejects(() => assertReason(page, 100));
	await assert.rejects(() => assertGuestReturn(page, 100));
	for (const name of ['Google', 'GitHub']) {
		await assert.rejects(() => expect(page.getByRole('button', { name: `Continue with ${name}`, exact: true })).toBeVisible({ timeout: 100 }));
	}
});
