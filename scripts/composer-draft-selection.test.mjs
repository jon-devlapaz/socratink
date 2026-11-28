import assert from 'node:assert/strict';
import { test } from 'node:test';
import { expect } from 'playwright/test';
import { composerHarness, engines, phones, tapBlank, expectActions } from './composer-browser-harness.mjs';

for (const [name, engine] of Object.entries(engines)) {
	for (const phone of phones) {
		test(`${name} ${phone.width}x${phone.height}: blank taps preserve draft and caret`, async t => {
			const harness = await composerHarness(engine);
			t.after(() => harness.close());
			const { page, submissions } = await harness.page(t, phone);
			const input = page.locator('#message');
			for (const caret of [2, 4]) {
				await input.fill('');
				await input.tap({ position: { x: 25, y: 15 } });
				await page.keyboard.type('abcd');
				await input.evaluate((node, caret) => node.setSelectionRange(caret, caret), caret);
				await page.locator('#main-content').focus();
				await tapBlank(page);
				await expect(input).toBeFocused();
				await expect(input).toHaveValue('abcd');
				assert.deepEqual(await input.evaluate(node => [node.selectionStart, node.selectionEnd]), [caret, caret]);
				await page.keyboard.type('x');
				await expect(input).toHaveValue(caret === 2 ? 'abxcd' : 'abcdx');
				await expectActions(page, { starts: 0, stops: 0, submits: 0 });
				assert.equal(submissions.length, 0);
			}
		});
	}
}

test('a late dictation result preserves the selected starter and the learner’s words', async t => {
	const harness = await composerHarness(engines.webkit);
	t.after(() => harness.close());
	const { page, submissions } = await harness.page(t, phones[1]);
	const input = page.locator('#message');
	await input.fill('My own question');
	await page.getByRole('button', { name: 'I want to understand…', exact: true }).tap();
	await expect(input).toHaveValue('I want to understand My own question');
	await page.getByRole('button', { name: 'Start dictation' }).tap();
	await expect(page.locator('#dictation-toggle')).toHaveAttribute('data-state', 'listening');
	await page.getByRole('button', { name: 'I’m stuck on…', exact: true }).tap();
	await expect(input).toHaveValue('I’m stuck on My own question');
	await page.evaluate(() => window.finishSpeech('late speech'));
	await expect(input).toHaveValue('I’m stuck on My own question');
	assert.equal(submissions.length, 0);
});
