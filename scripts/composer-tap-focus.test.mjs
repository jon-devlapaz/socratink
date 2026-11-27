import assert from 'node:assert/strict';
import { test } from 'node:test';
import { expect } from 'playwright/test';
import { composerHarness, engines, phones, tapBlank, expectTypedX, expectActions } from './composer-browser-harness.mjs';

for (const [name, engine] of Object.entries(engines)) {
	for (const phone of phones) {
		test(`${name} ${phone.width}x${phone.height}: composer touch actions`, async t => {
			const harness = await composerHarness(engine);
			t.after(() => harness.close());
			const { page, submissions } = await harness.page(t, phone);
			const input = page.locator('#message');
			for (const region of ['footer', 'left', 'bottom']) {
				await input.fill('');
				await page.locator('#main-content').focus();
				const pointer = await tapBlank(page, region);
				if (region === 'footer') assert.deepEqual(pointer, { focused: 'message', trusted: true });
				await expectTypedX(page);
				await expectActions(page, { starts: 0, stops: 0, submits: 0 });
				assert.equal(submissions.length, 0);
			}
			await page.locator('#dictation-toggle .is-mic svg').tap();
			await expectActions(page, { starts: 1, stops: 0, submits: 0 });
			await page.locator('#dictation-toggle .is-stop svg').tap();
			await expectActions(page, { starts: 1, stops: 1, submits: 0 });
			assert.equal(submissions.length, 0);
			await page.locator('button[type="submit"] span').tap();
			await expect.poll(() => submissions.length).toBe(1);
			await expectActions(page, { starts: 1, stops: 1, submits: 1 });
			assert.match(submissions[0].path, /^\/api\/agents\/chat\//);
			assert.deepEqual(submissions[0].body, { kind: 'user', body: 'x' });
		});

		test(`${name} ${phone.width}: unsupported speech and noninteractive composer`, async t => {
			const harness = await composerHarness(engine);
			t.after(() => harness.close());
			const { page, submissions } = await harness.page(t, phone, { speech: false });
			const input = page.locator('#message');
			await expect(page.locator('#dictation-toggle')).toBeHidden();
			await tapBlank(page);
			await expectTypedX(page);
			await input.fill('');
			await page.locator('#main-content').focus();
			await input.evaluate(node => { node.disabled = true; });
			await tapBlank(page);
			await expect(input).not.toBeFocused();
			await input.evaluate(node => { node.disabled = false; });
			await page.locator('#chat').evaluate(node => { node.inert = true; });
			await tapBlank(page);
			await expect(input).not.toBeFocused();
			await page.keyboard.type('x');
			await expect(input).toHaveValue('');
			await expectActions(page, { starts: 0, stops: 0, submits: 0 });
			assert.equal(submissions.length, 0);
		});

		test(`${name} ${phone.width}: old inert-footer behavioral baseline rejects touch typing`, async t => {
			const harness = await composerHarness(engine);
			t.after(() => harness.close());
			const { page } = await harness.page(t, phone);
			await page.locator('.composer-footer').evaluate(footer => {
				footer.addEventListener('pointerdown', event => event.stopPropagation());
				footer.addEventListener('click', event => event.stopPropagation());
			});
			await tapBlank(page);
			await page.keyboard.type('x');
			await expect(page.locator('#message')).not.toBeFocused();
			await expect(page.locator('#message')).toHaveValue('');
			await assert.rejects(expectTypedX(page));
			await page.locator('#message').tap({ position: { x: 25, y: 15 } });
			await expectTypedX(page);
		});
	}
}
