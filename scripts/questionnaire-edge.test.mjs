import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { webkit } from 'playwright';
import { expect } from 'playwright/test';
import { createServer } from 'vite';
import { appConfig } from '../src/config/app.config.ts';
import { questionnaireFromPresentQuestion } from '../src/questionnaire.ts';

const setup = 'The factory uses a scanner. In this batch it flagged 40 tiles. The inspection team found a crack in 28 of those tiles; the rest were flagged for other reasons.';
const prompt = 'Of the tiles the scanner flags, what fraction has a crack, and which total belongs in the denominator?';
const choices = ['28 out of 40', '12 out of 40', '28 out of 100'];
const reasoning = 'I used the 40 flagged tiles as the denominator.';
const definition = questionnaireFromPresentQuestion({ prompt, choices, reasoning: true });
const userId = 'guest-questionnaire-edge';
const out = '.cache/questionnaire-edge';

async function openScanner(t) {
	const server = await createServer({
		configFile: fileURLToPath(new URL('../vite.config.ui.ts', import.meta.url)),
		envDir: false,
		server: { host: '127.0.0.1', port: 0, hmr: false, watch: null },
	});
	let browser;
	t.after(async () => {
		try { await browser?.close(); } finally { await server.close(); }
	});
	await server.listen();
	browser = await webkit.launch();
	const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
	const context = await browser.newContext({
		viewport: { width: 375, height: 667 }, isMobile: true, hasTouch: true,
		colorScheme: 'dark', reducedMotion: 'reduce', serviceWorkers: 'block',
	});
	const writes = [];
	await context.route('**/*', route => {
		const request = route.request();
		const url = new URL(request.url());
		if (url.origin !== origin) return route.abort();
		if (request.method() !== 'GET') {
			writes.push(url.pathname);
			return route.abort();
		}
		if (url.pathname === appConfig.sessionPath) return route.fulfill({ json: { userId, aliases: [], kind: 'guest' } });
		if (url.pathname === appConfig.authProvidersPath) return route.fulfill({ json: { google: false, github: false } });
		if (url.pathname.startsWith(`${appConfig.chatAgentPath}/`)) return route.fulfill({ json: {
			v: 1, conversationId: 'scanner', settlements: [{ submissionId: 'scanner-question', outcome: 'completed' }],
			messages: [
				{ role: 'user', display: 'visible', submissionId: 'scanner-question',
					parts: [{ type: 'text', text: 'Help me understand conditional probability.' }] },
				{ role: 'assistant', display: 'visible', submissionId: 'scanner-question', parts: [
					{ type: 'text', text: setup }, { type: 'data-questionnaire', data: definition },
				] },
			],
		} });
		if (url.pathname.startsWith('/api/')) return route.abort();
		return route.continue();
	});
	const page = await context.newPage();
	page.setDefaultTimeout(5_000);
	const errors = [];
	page.on('pageerror', error => errors.push(error.message));
	t.after(() => assert.deepEqual(errors, []));
	await page.goto(origin);
	return { page, writes };
}

async function geometry(actions, placeAtEdge = false) {
	return actions.evaluateAll((buttons, placeAtEdge) => {
		const scroller = buttons[0].closest('.active-scroll');
		const viewport = { left: 0, top: 0, right: innerWidth, bottom: innerHeight };
		const label = button => {
			const range = document.createRange();
			range.selectNodeContents(button);
			return range.getBoundingClientRect().toJSON();
		};
		if (placeAtEdge) {
			const lowestLabel = Math.max(...buttons.map(button => label(button).bottom));
			scroller.scrollTop += lowestLabel - scroller.getBoundingClientRect().bottom + 4;
		}
		return {
			viewport, scroll: scroller.getBoundingClientRect().toJSON(), top: scroller.scrollTop,
			max: scroller.scrollHeight - scroller.clientHeight,
			mask: getComputedStyle(scroller).maskImage,
			actions: buttons.map(button => {
				const text = label(button);
				const hit = document.elementFromPoint((text.left + text.right) / 2, (text.top + text.bottom) / 2);
				return {
					name: button.textContent, box: button.getBoundingClientRect().toJSON(), text,
					opacity: getComputedStyle(button).opacity, hit: button.contains(hit),
					focused: button === document.activeElement,
				};
			}),
		};
	}, placeAtEdge);
}

const contains = (outer, inner) => inner.left >= outer.left && inner.right <= outer.right &&
	inner.top >= outer.top && inner.bottom <= outer.bottom;
const overlaps = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

function assertReadableLabels(frame) {
	assert.doesNotMatch(frame.mask, /(?:transparent|rgba\(0, 0, 0, 0\)) 100%\)$/, 'no bottom fade');
	for (const action of frame.actions) {
		assert.ok(action.text.width > 0 && action.text.height > 0, `${action.name} has a rendered label`);
		assert.ok(contains(frame.viewport, action.text) && contains(frame.scroll, action.text), `${action.name} label is not clipped`);
		assert.ok(action.hit, `${action.name} label is not covered`);
		assert.equal(action.opacity, '1', `${action.name} is not dimmed`);
		assert.equal(action.focused, false, `${action.name} was not focused to bring it into view`);
	}
}

async function assertVisibleCue(cue, frame) {
	await expect(cue, 'visible overflow cue').toBeVisible();
	const paint = await cue.evaluate(node => {
		const style = getComputedStyle(node);
		return { stroke: style.stroke, opacity: style.opacity, box: node.getBoundingClientRect().toJSON() };
	});
	assert.ok(contains(frame.viewport, paint.box), 'cue is in the viewport');
	assert.ok(paint.stroke !== 'none' && Number(paint.opacity) > 0, 'cue has visible ink');
	for (const action of frame.actions) assert.ok(!overlaps(paint.box, action.text), `cue does not cover ${action.name}`);
}

test('375 × 667 WebKit: the scanner question shows overflow without dimming or changing the answer', { timeout: 60_000 }, async t => {
	const { page, writes } = await openScanner(t);
	const form = page.getByRole('form', { name: 'Questions', exact: true });
	const choice = form.getByRole('radio', { name: choices[0], exact: true });
	const field = form.getByRole('textbox', { name: 'Your reasoning' });
	const actions = form.getByRole('button', { name: /^(Hint|Submit)$/ });
	const scroller = page.locator('.active-scroll');
	const cue = page.locator('.question-overflow-cue');
	await expect(page.getByText(setup, { exact: true })).toBeVisible();
	await expect(form.locator('legend')).toHaveText(prompt);
	await expect(form.getByRole('radio')).toHaveCount(3);
	await expect(actions).toHaveCount(2);
	await page.evaluate(() => document.fonts.ready.then(() => {}));
	await choice.click();
	await field.fill(reasoning);
	await field.blur();

	async function answer() {
		return {
			checked: await form.getByRole('radio', { checked: true }).evaluateAll(nodes => nodes.map(node => node.value)),
			reasoning: await field.inputValue(),
			draft: await page.evaluate(() => Object.entries(sessionStorage).find(([key]) => key.startsWith('socratink-question-draft:'))?.[1]),
			enabled: await Promise.all((await actions.all()).map(button => button.isEnabled())),
		};
	}
	const before = await answer();
	assert.deepEqual(before.checked, [definition.items[0].choices[0].value]);
	assert.equal(before.reasoning, reasoning);
	assert.deepEqual(JSON.parse(before.draft).answer, { values: before.checked, freeform: reasoning });
	assert.deepEqual(before.enabled, [true, true]);

	await geometry(actions, true);
	await expect(page.locator('#jump-latest')).toBeHidden();
	const edge = await geometry(actions);
	assert.deepEqual(edge.viewport, { left: 0, top: 0, right: 375, bottom: 667 });
	assert.ok(edge.max - edge.top > 1 && edge.max - edge.top <= 48, `content remains at the live edge: ${JSON.stringify(edge)}`);
	for (const action of edge.actions) {
		assert.ok(edge.scroll.bottom - action.text.bottom <= 12 && action.box.bottom > edge.scroll.bottom,
			`${action.name} label is at the lower edge and its button is partly clipped: ${JSON.stringify(edge)}`);
	}
	assertReadableLabels(edge);
	await mkdir(out, { recursive: true });
	await page.screenshot({ path: `${out}/edge.png` });
	await assertVisibleCue(cue, edge);

	const withoutCue = await page.addStyleTag({ content: '.question-overflow-cue { display: none !important; }' });
	assertReadableLabels(await geometry(actions));
	await assert.rejects(assertVisibleCue(cue, edge), /visible overflow cue/);
	await withoutCue.evaluate(node => node.remove());

	await scroller.evaluate(node => { node.scrollTop += 110; });
	const full = await geometry(actions);
	assert.ok(Math.abs(full.top - Math.min(edge.top + 110, full.max)) <= 1 && full.top > edge.top, '110px scroll, clamped at the end');
	for (const action of full.actions) {
		assert.ok(contains(full.viewport, action.box) && contains(full.scroll, action.box), `${action.name} is fully visible`);
	}
	assertReadableLabels(full);
	assert.deepEqual(await answer(), before);
	assert.deepEqual(writes, []);
	await page.screenshot({ path: `${out}/full.png` });
	assert.ok(full.max - full.top <= 1, 'at the scroll end');
	await expect(cue).toBeHidden();

	await page.setViewportSize({ width: 375, height: 1000 });
	await expect.poll(async () => (await geometry(actions)).max).toBe(0);
	await expect(cue).toBeHidden();
});
