import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createServer } from 'vite';
import { chromium } from 'playwright';
import { appConfig } from '../src/config/app.config.ts';

const draft = 'Unfinished thought, keep this.';
const guidance = 'Browser storage could not save the switch. Your conversation and unsent work are still here. You can keep chatting, or allow site storage in your browser and try again.';
const oldSwitch = `export function switchChatConversation(conversationId: string) {
	localStorage.setItem(appConfig.chatConversationStorageKey, conversationId);
	localStorage.setItem(appConfig.chatConversationResetKey, conversationId);
	location.reload();
}`;

async function run(t, baseline, mode, action) {
	const server = await createServer({
		configFile: new URL('../vite.config.ui.ts', import.meta.url).pathname,
		cacheDir: new URL(`../.cache/navigation-${baseline}-${process.pid}`, import.meta.url).pathname,
		server: { host: '127.0.0.1', port: 0 },
		plugins: baseline ? [{
			name: 'pre-fix-navigation', enforce: 'pre',
			transform(code, id) {
				if (!id.split('?')[0].endsWith('/src/ui/client/conversation.ts')) return;
				const pattern = /export function switchChatConversation\([\s\S]*?\n}/;
				assert.match(code, pattern);
				return code.replace(pattern, oldSwitch);
			},
		}] : [],
	});
	let browser;
	try {
		await server.listen();
		const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
		browser = await chromium.launch({ headless: true });
		const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
		await context.addInitScript(({ mode, key }) => {
			if (mode === 'blocked') {
				Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Blocked', 'SecurityError'); } });
				return;
			}
			const get = Storage.prototype.getItem;
			const set = Storage.prototype.setItem;
			Storage.prototype.getItem = function (name) {
				if (name === key && mode === 'read') throw new DOMException('Read failed', 'SecurityError');
				return get.call(this, name);
			};
			Storage.prototype.setItem = function (name, value) {
				if (mode === 'quota') throw new DOMException('Full', 'QuotaExceededError');
				return set.call(this, name, value);
			};
		}, { mode, key: appConfig.chatConversationStorageKey });
		const b = 'guest-navigation:conversation-b';
		let a;
		const snapshots = new Map([[b, { v: 1, conversationId: b, messages: [
			{ role: 'user', display: 'visible', submissionId: 'b1', parts: [{ type: 'text', text: 'Why is Mars red?', state: 'done' }] },
			{ role: 'assistant', display: 'visible', submissionId: 'b1', parts: [{ type: 'text', text: 'Iron oxide colors Mars.', state: 'done' }] },
		], settlements: [{ submissionId: 'b1', outcome: 'completed' }] }]]);
		const requests = [];
		await context.route('**/*', async (route) => {
			const request = route.request();
			const url = new URL(request.url());
			if (url.origin !== origin) return route.abort();
			if (url.pathname === '/api/session') return route.fulfill({ json: { userId: 'guest-navigation', aliases: [], kind: 'guest' } });
			if (url.pathname === '/api/conversations') return route.fulfill({ json: { conversations: [
				{ id: a, title: 'Why do tides happen?', updatedAt: new Date().toISOString() },
				{ id: b, title: 'Why is Mars red?', updatedAt: new Date().toISOString() },
			] } });
			if (url.pathname === '/api/auth/providers') return route.fulfill({ json: { google: false, github: false } });
			if (!url.pathname.startsWith('/api/agents/chat/')) return route.continue();
			const id = decodeURIComponent(url.pathname.split('/')[4]);
			requests.push(id);
			if (!snapshots.has(id)) snapshots.set(id, { v: 1, conversationId: id, messages: [], settlements: [] });
			const snapshot = snapshots.get(id);
			if (request.method() === 'POST') {
				a ??= id;
				const text = request.postDataJSON().body;
				const submissionId = `s${snapshot.settlements.length}`;
				snapshot.messages.push(
					{ role: 'user', display: 'visible', submissionId, parts: [{ type: 'text', text, state: 'done' }] },
					{ role: 'assistant', display: 'visible', submissionId, parts: [{ type: 'text', text: `Ocean reply to ${text}`, state: 'done' }] },
				);
				snapshot.settlements.push({ submissionId, outcome: 'completed' });
				return route.fulfill({ json: { submissionId } });
			}
			if (url.pathname.endsWith('/events')) return route.fulfill({ contentType: 'text/event-stream', body: `data: ${JSON.stringify({ type: 'conversation-reset', snapshot })}\n\n` });
			return route.fulfill({ json: snapshot });
		});
		const page = await context.newPage();
		page.setDefaultTimeout(3000);
		const errors = [];
		page.on('pageerror', (error) => errors.push(error.message));
		await page.goto(origin);
		await page.waitForFunction(() => document.querySelector('#message')?.disabled === false);
		await page.locator('#message').fill('Why do tides happen?');
		await page.getByRole('button', { name: 'Send message', exact: true }).click();
		await page.getByText('Ocean reply to Why do tides happen?', { exact: true }).waitFor();
		await page.locator('#message').fill(draft);
		const beforeRequests = requests.length;
		let reloads = 0;
		page.on('framenavigated', (frame) => { if (frame === page.mainFrame()) reloads++; });
		await page.locator('#menu-trigger').click();
		if (action === 'start') {
			await page.locator('#start-over').click();
			const copy = await page.locator('#start-over-dialog [data-slot="dialog-description"]').innerText();
			if (!baseline) {
				const otherWork = mode === 'read' ? '' : 'Unsent work in other open tabs could be deleted. ';
				assert.equal(copy, `Your unsent text in this tab will be deleted. ${otherWork}This conversation will close in your open tabs. Saved conversations are in History.`);
			}
			await page.locator('#start-over-confirm').click();
		} else {
			await page.locator('#history-trigger').click();
			await page.getByRole('button', { name: /Why do tides happen\?/ }).click();
			await page.locator('#history-dialog').waitFor({ state: 'detached' });
			assert.equal(reloads, 0, 'current entry only closes History');
			assert.equal(await page.locator('#message').inputValue(), draft);
			await page.locator('#menu-trigger').click();
			await page.locator('#history-trigger').click();
			await page.getByRole('button', { name: /Why is Mars red\?/ }).click();
		}
		await page.waitForTimeout(350);
		if (baseline && mode === 'read') {
			for (const deadline = Date.now() + 5000; requests.at(-1) === a && Date.now() < deadline;) await page.waitForTimeout(50);
			assert.notEqual(requests.at(-1), a, 'pre-fix reload abandons A');
			assert.notEqual(requests.at(-1), b, 'pre-fix reload does not open B');
			assert.equal(await page.getByText('Iron oxide colors Mars.', { exact: true }).count(), 0);
		}
		assert.deepEqual(errors, [], 'navigation must not throw');
		assert.equal(reloads, 0, 'failed navigation must not reload into another conversation');
		await page.getByRole('alert').getByText(guidance, { exact: true }).waitFor();
		await page.keyboard.press('Escape');
		assert.equal(await page.locator('#message').inputValue(), draft);
		assert.equal(await page.getByText('Ocean reply to Why do tides happen?', { exact: true }).isVisible(), true);
		assert.equal(requests.length, beforeRequests, 'no request may target B or a fresh conversation');
		if (!baseline && mode === 'quota') {
			await page.evaluate(({ key, b }) => window.dispatchEvent(new StorageEvent('storage', { key, newValue: b })), { key: appConfig.chatConversationResetKey, b });
			await page.waitForTimeout(150);
			assert.equal(reloads, 0, 'failed reset write must preserve this tab');
			assert.equal(await page.locator('#message').inputValue(), draft);
			await page.locator('#storage-notice').getByText(guidance, { exact: true }).waitFor();
			assert.deepEqual(errors, []);
		}
		await page.locator('#message').fill('Keep talking about tides');
		await page.getByRole('button', { name: 'Send message', exact: true }).click();
		await page.getByText('Ocean reply to Keep talking about tides', { exact: true }).waitFor();
		assert.ok(requests.every((id) => id === a), 'continued chat keeps conversation A');
	} finally {
		await browser?.close();
		await server.close();
	}
}

for (const mode of ['blocked', 'read', 'quota']) {
	for (const action of ['start', 'history']) {
		test(`${mode}: ${action} preserves work and explains failure`, async (t) => run(t, false, mode, action));
		test(`${mode}: ${action} rejects pre-fix navigation`, async (t) => {
			await assert.rejects(run(t, true, mode, action), (error) => {
				assert.match(error.message, /navigation must not throw|failed navigation must not reload/);
				return true;
			});
		});
	}
}
