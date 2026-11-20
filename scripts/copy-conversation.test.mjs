import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import test from 'node:test';
import { chromium } from 'playwright';
import { appConfig } from '../src/config/app.config.ts';

const question = {
	kind: 'question', submitLabel: 'Continue', items: [{
		name: 'next', prompt: 'Which comes next?', required: true, multiple: false,
		choices: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }],
	}],
};
const initialMarkdown = '## You\n\nExplain **order**.\n\n## Socratink\n\nFirst, keep `a`.\n\n## You\n\nThen what?\n\n## Socratink\n\nWhich comes next?\n- A\n- B';

function fixtureServer() {
	const messages = [];
	const settlements = [];
	let submissionId;
	let held;
	let hold = false;
	const snapshot = () => ({ v: 1, conversationId: 'copy-test', messages, settlements });
	const server = createServer(async (req, res) => {
		try {
			const path = new URL(req.url, 'http://localhost').pathname;
			const json = (body, status = 200) => {
				res.writeHead(status, { 'content-type': 'application/json' });
				res.end(JSON.stringify(body));
			};
			if (path === appConfig.sessionPath) return json({ userId: 'copy-test-learner', aliases: [], kind: 'registered' });
			if (path === appConfig.authProvidersPath) return json({ google: false, github: false });
			if (path.startsWith(`${appConfig.chatAgentPath}/`)) {
				if (req.method === 'POST') {
					let body = '';
					for await (const chunk of req) body += chunk;
					submissionId = `copy-${settlements.length + 1}`;
					messages.push({ role: 'user', display: 'visible', submissionId, parts: [{ type: 'text', text: JSON.parse(body).body }] });
					return json({ submissionId }, 202);
				}
				if (!path.endsWith('/events')) return json(snapshot());
				res.writeHead(200, { 'content-type': 'text/event-stream' });
				let index = 0;
				const emit = (event) => res.write(`data: ${JSON.stringify({ ...event, conversationId: 'copy-test', position: { batch: 1, index: index++ } })}\n\n`);
				emit({ type: 'conversation-reset', snapshot: snapshot() });
				if (hold) {
					emit({ type: 'message-delta', messageId: 'live', kind: 'text', delta: 'Still writing' });
					await held.promise;
					if (res.destroyed) return;
					hold = false;
				}
				const parts = settlements.length === 0 ? [{ type: 'text', text: 'First, keep `a`.' }]
					: settlements.length === 1 ? [{ type: 'data-questionnaire', data: question }]
						: [{ type: 'text', text: 'Here is a hint.' }, { type: 'data-reveal', data: { kind: 'hint', target: 'Order' } }];
				messages.push({ role: 'assistant', display: 'visible', submissionId, parts });
				settlements.push({ submissionId, outcome: 'completed' });
				emit({ type: 'conversation-reset', snapshot: snapshot() });
				res.end();
				return;
			}
			if (path.startsWith('/api/')) return json({ error: 'Unexpected test API' }, 404);
			const root = resolve('dist/client');
			const file = resolve(root, `.${path === '/' ? '/index.html' : path}`);
			if (!file.startsWith(`${root}/`)) return json({}, 403);
			const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };
			res.writeHead(200, { 'content-type': mime[extname(file)] ?? 'application/octet-stream' });
			res.end(await readFile(file));
		} catch (error) {
			if (!res.headersSent) res.writeHead(500);
			res.end(String(error));
		}
	});
	return { server, holdReply() { hold = true; held = Promise.withResolvers(); }, finishReply() { held?.resolve(); } };
}

async function pasteConversation(page, expected) {
	await page.getByRole('button', { name: 'Copy conversation', exact: true }).click();
	await page.getByRole('status').filter({ hasText: 'Conversation copied' }).waitFor();
	await page.evaluate(() => {
		const area = document.createElement('textarea');
		area.id = 'clipboard-destination';
		area.style.cssText = 'position:fixed;inset:0;z-index:9999';
		document.body.append(area);
		area.focus();
	});
	await page.keyboard.press(process.platform === 'darwin' ? 'Meta+V' : 'Control+V');
	assert.equal(await page.locator('#clipboard-destination').inputValue(), expected);
	await page.locator('#clipboard-destination').evaluate((area) => area.remove());
}

async function send(page, text) {
	await page.locator('#message:enabled').fill(text);
	await page.locator('#chat').evaluate((form) => form.requestSubmit());
}

test('copies ordered Markdown through the browser clipboard, including restored and live turns', { timeout: 90_000 }, async () => {
	const fixture = fixtureServer();
	await new Promise((done) => fixture.server.listen(0, '127.0.0.1', done));
	const origin = `http://127.0.0.1:${fixture.server.address().port}`;
	let browser;
	try {
		browser = await chromium.launch({ headless: true });
		const context = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'], reducedMotion: 'reduce' });
		await context.route('**/*', (route) => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
		const page = await context.newPage();
		page.setDefaultTimeout(5000);
		const errors = [];
		page.on('pageerror', (error) => errors.push(error.message));
		await page.goto(origin);
		await page.locator('#message:enabled').waitFor();
		assert.equal(await page.locator('#copy-conversation').isVisible(), false);
		await send(page, 'Explain **order**.');
		await page.locator('#copy-conversation:enabled').waitFor();
		await send(page, 'Then what?');
		await page.getByText('Which comes next?', { exact: true }).waitFor();
		await page.locator('#copy-conversation:enabled').waitFor();
		assert.equal(await page.locator('#messages').isVisible(), false);
		await pasteConversation(page, initialMarkdown);
		await page.reload();
		await page.locator('#copy-conversation:enabled').waitFor();
		await pasteConversation(page, initialMarkdown);

		await mkdir('.cache/copy-conversation', { recursive: true });
		for (const width of [390, 1280]) {
			for (const theme of ['light', 'dark']) {
				await page.setViewportSize({ width, height: 900 });
				await page.evaluate((theme) => { document.documentElement.dataset.theme = theme; }, theme);
				const control = page.getByRole('button', { name: 'Copy conversation', exact: true });
				assert.equal(await control.count(), 1);
				await control.focus();
				await page.keyboard.press('Tab');
				await page.keyboard.press('Shift+Tab');
				assert.equal(await control.evaluate((node) => {
					const style = getComputedStyle(node);
					const rect = node.getBoundingClientRect();
					return document.activeElement === node && style.outlineStyle === 'solid'
						&& style.borderTopWidth === '0px' && style.borderRadius === '0px'
						&& style.boxShadow === 'none' && style.backgroundColor === 'rgba(0, 0, 0, 0)'
						&& rect.left >= 0 && rect.right <= innerWidth && rect.bottom <= innerHeight;
				}), true);
				await page.screenshot({ path: `.cache/copy-conversation/${width}-${theme}-focus.png` });
				await pasteConversation(page, initialMarkdown);
				await page.screenshot({ path: `.cache/copy-conversation/${width}-${theme}-copied.png` });
			}
		}

		fixture.holdReply();
		await page.getByRole('radio', { name: 'A', exact: true }).check();
		await page.getByRole('button', { name: 'Continue', exact: true }).click();
		await page.getByText('Still writing', { exact: true }).waitFor();
		assert.equal(await page.locator('#copy-conversation').isDisabled(), true);
		assert.equal(await page.locator('#copy-conversation-status').textContent(), '');
		await page.locator('#copy-conversation').evaluate((node) => node.click());
		assert.equal(await page.evaluate(() => navigator.clipboard.readText()), initialMarkdown);
		await Promise.all([
			page.waitForRequest((request) => new URL(request.url()).pathname.endsWith('/events')),
			page.reload(),
		]);
		await page.getByRole('button', { name: 'Recheck', exact: true }).waitFor();
		assert.equal(await page.locator('#copy-conversation').isEnabled(), false);
		assert.equal(await page.locator('#copy-conversation-status').textContent(), '');
		fixture.finishReply();
		await page.locator('#copy-conversation:enabled').waitFor();
		const complete = `${initialMarkdown}\n\n## You\n\nA\n\n## Socratink\n\nSocratink supplied hint: Order.\n\nHere is a hint.`;
		await pasteConversation(page, complete);
		await page.reload();
		await page.locator('#copy-conversation:enabled').waitFor();
		await pasteConversation(page, complete);
		await page.evaluate(() => {
			Object.defineProperty(navigator.clipboard, 'writeText', { configurable: true, value: async () => { throw new DOMException('Denied', 'NotAllowedError'); } });
		});
		await page.locator('#copy-conversation').click();
		await page.getByText('Could not copy. Try again.', { exact: true }).first().waitFor();
		assert.equal(await page.locator('#copy-conversation-status').textContent(), 'Could not copy. Try again.');
		assert.equal(await page.locator('#copy-conversation').isEnabled(), true);
		await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { value: undefined }));
		await page.locator('#copy-conversation').click();
		assert.equal(await page.locator('#copy-conversation-status').textContent(), 'Could not copy. Try again.');
		assert.deepEqual(errors, []);
		await context.close();
	} finally {
		fixture.finishReply();
		await browser?.close();
		fixture.server.closeAllConnections();
		await new Promise((done) => fixture.server.close(done));
	}
});
