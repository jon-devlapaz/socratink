import assert from 'node:assert/strict';
import { test } from 'node:test';
import { expect } from 'playwright/test';
import { composerHarness, engines, phones } from './composer-browser-harness.mjs';

// Failure case (#194): at phone width the field stops growing and the line
// being typed slides under the bottom fade, so the learner cannot see their
// newest words without scrolling the field.
const draft = 'The block floats because wood is less dense than water. The water pushes up with a force equal to the weight it moves aside. A heavy log floats for the same reason. A steel nail sinks although it weighs less than the log. So weight alone does not decide it. Density compared with water does.';

function gapBelowView(input) {
	return input.evaluate(node => ({
		overflows: node.scrollHeight > node.clientHeight + 1,
		gap: node.scrollHeight - node.scrollTop - node.clientHeight,
	}));
}

for (const [name, engine] of Object.entries(engines)) {
	for (const phone of phones) {
		test(`${name} ${phone.width}x${phone.height}: the line being typed stays above the fade`, async t => {
			const harness = await composerHarness(engine);
			t.after(() => harness.close());
			const { page } = await harness.page(t, phone);
			const input = page.locator('#message');
			await input.focus();
			await page.keyboard.type(draft);
			await page.keyboard.type(' A sponge floats until it soaks up water, then sits lower.');
			await expect(input).toBeFocused();
			let view = await gapBelowView(input);
			assert.ok(view.overflows, 'the draft is longer than the field');
			assert.ok(view.gap <= 1, `typing at the end leaves the field ${view.gap}px above its bottom`);
			await page.keyboard.press('Control+Home');
			await page.keyboard.press('Control+End');
			view = await gapBelowView(input);
			assert.ok(view.gap <= 1, `moving to the end leaves the field ${view.gap}px above its bottom`);
		});
	}
}
