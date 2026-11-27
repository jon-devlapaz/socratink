import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { chromium } from 'playwright';

export async function startOverBrowser(t, { composerOnly = false, history = 'empty', blockedStorage = false } = {}) {
	let browser;
	let context;
	const server = await createServer({
		configFile: new URL('../vite.config.ui.ts', import.meta.url).pathname,
		cacheDir: new URL(`../.cache/start-over-vite-${process.pid}-${composerOnly ? 'baseline' : 'production'}`, import.meta.url).pathname,
		server: { host: '127.0.0.1', port: 0 },
		plugins: composerOnly ? [{
			name: 'composer-only-regression-baseline',
			enforce: 'pre',
			transform(code, id) {
				if (!id.split('?')[0].endsWith('/src/ui/chat-page.tsx')) return;
				const marker = 'onStartOver={() => {';
				assert.ok(code.includes(marker));
				return code.replace(marker, marker + " const hasWork = () => Boolean(document.querySelector('#message')?.value.trim()); if (!hasWork()) return;");
			},
		}] : [],
	});
	t.after(async () => {
		await context?.close();
		await browser?.close();
		await server.close();
	});
	await server.listen();
	const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
	browser = await chromium.launch({ headless: true });
	context = await browser.newContext({ viewport: { width: 390, height: 844 } });
	if (blockedStorage) await context.addInitScript(() => {
		Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Blocked', 'SecurityError'); } });
	});
	const definition = { kind: 'question', submitLabel: 'Continue', items: [{
		name: 'tides', prompt: 'What drives the tides?', required: true, multiple: false,
		choices: [{ value: 'moon', label: 'The Moon' }, { value: 'wind', label: 'Wind' }],
		input: { label: 'Your reason' },
	}] };
	const messages = history === 'empty' ? [] : [
		{ role: 'user', display: 'visible', submissionId: 's1', parts: [{ type: 'text', text: 'Why do tides happen?', state: 'done' }] },
		{ role: 'assistant', display: 'visible', submissionId: 's1', parts: history === 'card'
			? [{ type: 'data-questionnaire', data: definition }]
			: [{ type: 'text', text: 'The Moon pulls on the oceans.', state: 'done' }] },
	];
	const errors = [];
	const mutations = [];
	t.after(() => assert.deepEqual(errors, []));
	await context.route('**/*', async (route) => {
		const request = route.request();
		const url = new URL(request.url());
		if (url.origin !== origin) return route.abort();
		if (url.pathname === '/api/session') return route.fulfill({ json: { userId: 'guest-start-over-risk', aliases: [], kind: 'guest' } });
		if (!url.pathname.startsWith('/api/')) return route.continue();
		if (request.method() !== 'GET') {
			mutations.push(request.method());
			return route.abort();
		}
		if (url.pathname.startsWith('/api/agents/chat/')) return route.fulfill({ json: {
			v: 1, conversationId: 'synthetic', messages, settlements: history === 'empty' ? [] : [{ submissionId: 's1', outcome: 'completed' }],
		} });
		if (url.pathname === '/api/auth/providers') return route.fulfill({ json: { google: false, github: false } });
		return route.abort();
	});
	const pages = [];
	const navigations = [];
	async function open() {
		const page = await context.newPage();
		page.on('pageerror', (error) => errors.push(error.message));
		await page.goto(origin);
		await page.waitForFunction(() => document.querySelector('#message')?.disabled === false);
		if (history === 'card') await page.locator('#active-turn .questionnaire').waitFor();
		pages.push(page);
		page.on('framenavigated', (frame) => {
			if (frame === page.mainFrame()) navigations.push(page);
		});
		return page;
	}
	const id = (page) => page.evaluate(() => localStorage.getItem('socratink-chat-conversation-id'));
	return {
		open, id,
		async protect(page) {
			const before = await Promise.all(pages.map(id));
			const originalNavigations = navigations.length;
			await requestStartOver(page);
			assert.equal(await page.locator('#start-over-dialog').count(), 1, 'work at risk needs confirmation');
			const description = await page.locator('#start-over-dialog [data-slot="dialog-description"]').innerText();
			assert.ok(description.includes('Saved conversations are in History.'));
			await page.getByRole('button', { name: 'Keep this conversation', exact: true }).click();
			await page.locator('#start-over-dialog').waitFor({ state: 'detached' });
			assert.deepEqual(await Promise.all(pages.map(id)), before);
			assert.equal(navigations.length, originalNavigations, 'cancel does not reload any tab');
			assert.deepEqual(mutations, []);
			assert.deepEqual(errors, []);
			return description;
		},
	};
}

export async function requestStartOver(page) {
	await page.locator('#menu-trigger').click();
	assert.equal(await page.locator('#history-trigger').isEnabled(), true);
	await page.locator('#start-over').click();
	await page.waitForTimeout(150);
}
