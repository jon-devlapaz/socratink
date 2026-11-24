import assert from 'node:assert/strict';
import { before, after, test } from 'node:test';
import { createServer } from 'vite';
import { chromium } from 'playwright';

let server;
let browser;
let origin;

before(async () => {
	server = await createServer({
		configFile: false,
		root: new URL('../src/ui', import.meta.url).pathname,
		server: { host: '127.0.0.1', port: 0 },
	});
	await server.listen();
	origin = `http://127.0.0.1:${server.httpServer.address().port}`;
	browser = await chromium.launch({ headless: true });
});
after(async () => {
	await browser?.close();
	await server?.close();
});

/** One learner with two tabs on one synthetic conversation. Only one turn runs at a time. */
async function twoTabs(t) {
	const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
	t.after(() => context.close());
	const snapshot = { v: 1, conversationId: 'synthetic', messages: [], settlements: [] };
	let sequence = 0;
	let hold;
	let release = () => {};
	await context.route('**/*', async (route) => {
		const url = new URL(route.request().url());
		if (url.origin !== origin) return route.abort();
		if (url.pathname === '/api/session') return route.fulfill({ json: { userId: 'guest-tabs-test', aliases: [], kind: 'guest' } });
		if (!url.pathname.startsWith('/api/agents/chat/')) return route.continue();
		if (route.request().method() === 'POST') {
			const running = snapshot.messages.some((m) => m.role === 'user' && !snapshot.settlements.some((s) => s.submissionId === m.submissionId));
			if (running) return route.fulfill({ status: 409, json: { error: { type: 'turn_in_progress', message: 'A reply is still running.' } } });
			const id = `s${++sequence}`;
			const text = route.request().postDataJSON().body;
			snapshot.messages.push({ id: `${id}:user`, role: 'user', display: 'visible', submissionId: id,
				parts: [{ type: 'text', text, state: 'done' }] });
			return route.fulfill({ json: { submissionId: id } });
		}
		if (url.pathname.endsWith('/events')) {
			if (hold) await hold;
			const open = snapshot.messages.find((m) => m.role === 'user' && !snapshot.settlements.some((s) => s.submissionId === m.submissionId));
			if (open) {
				snapshot.messages.push({ id: `${open.submissionId}:assistant`, role: 'assistant', display: 'visible', submissionId: open.submissionId,
					parts: [{ type: 'text', text: `Reply to ${open.parts[0].text}?`, state: 'done' }] });
				snapshot.settlements.push({ submissionId: open.submissionId, outcome: 'completed' });
			}
			return route.fulfill({ contentType: 'text/event-stream', body: `data: ${JSON.stringify({ type: 'conversation-reset', snapshot })}\n\n` });
		}
		return route.fulfill({ json: snapshot });
	});
	const open = async () => {
		const page = await context.newPage();
		const errors = [];
		page.on('pageerror', (error) => errors.push(error.message));
		t.after(() => assert.deepEqual(errors, []));
		await page.goto(origin);
		await page.waitForFunction(() => document.querySelector('#message')?.disabled === false);
		return page;
	};
	const tab1 = await open();
	const tab2 = await open();
	return {
		tab1, tab2,
		hold() { hold = new Promise((resolve) => { release = resolve; }); },
		release() { hold = undefined; release(); },
		async send(page, text) {
			await page.locator('#message').fill(text);
			await page.locator('.composer-send button[type="submit"]').click();
		},
		activeText: (page) => page.locator('#active-turn').innerText(),
	};
}

test('an idle tab shows a turn another tab finished, without a reload (#177)', async (t) => {
	const ui = await twoTabs(t);
	await ui.tab2.locator('#message').fill('half a thought');
	await ui.tab2.locator('#message').focus();
	await ui.send(ui.tab1, 'Why do tides happen');
	await ui.tab1.locator('#active-turn .turn.assistant').waitFor();
	await ui.tab2.waitForFunction(() => document.querySelector('#active-turn')?.innerText.includes('Reply to Why do tides happen?'), null, { timeout: 5_000 });
	const shown = await ui.activeText(ui.tab2);
	assert.equal(shown.split('Why do tides happen').length - 1, 2, 'the learner turn and the reply each show once');
	assert.equal(await ui.tab2.locator('#message').isDisabled(), false, 'the idle tab can still send');
	assert.equal(await ui.tab2.locator('#message').inputValue(), 'half a thought', 'the draft is kept');
	assert.equal(await ui.tab2.evaluate(() => document.activeElement?.id), 'message', 'typing focus is kept');
});

test('a tab told "Not sent" keeps its Retry notice when the other tab finishes', async (t) => {
	const ui = await twoTabs(t);
	ui.hold();
	await ui.send(ui.tab1, 'First from tab one');
	await ui.tab1.locator('#active-turn .turn.pending').waitFor();
	await ui.send(ui.tab2, 'Second from tab two');
	await ui.tab2.getByRole('button', { name: 'Retry', exact: true }).waitFor();
	ui.release();
	await ui.tab1.locator('#active-turn .turn.assistant').waitFor();
	await ui.tab1.waitForTimeout(500);
	assert.equal(await ui.tab2.getByRole('button', { name: 'Retry', exact: true }).count(), 1);
	assert.ok(!(await ui.activeText(ui.tab1)).includes('Second from tab two'), 'tab one never shows tab two’s message');
});
