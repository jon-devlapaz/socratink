import assert from 'node:assert/strict';
import { test } from 'node:test';
import { startOverBrowser } from './start-over-browser.mjs';

for (const category of ['local', 'other-tab', 'card', 'past']) {
	test(`loss description names ${category} work honestly and cancel preserves it`, async (t) => {
		const ui = await startOverBrowser(t, { history: category === 'card' ? 'card' : category === 'past' ? 'past' : 'empty' });
		const page = await ui.open();
		let other;
		if (category === 'local') await page.locator('#message').fill('Local draft, unfinished.');
		if (category === 'other-tab') {
			other = await ui.open();
			await other.locator('#message').fill('Other draft, unfinished.');
		}
		if (category === 'card') await page.getByLabel('Your reason', { exact: true }).fill('Card reasoning, unfinished.');
		const before = await page.locator('#active-turn').innerText();
		const description = await ui.protect(page);
		const expected = {
			local: 'Your unsent text in this tab will be deleted. Saved conversations are in History.',
			'other-tab': 'Unsent work in your other open tabs could be deleted. Saved conversations are in History.',
			card: 'Your question-card work in this tab will be deleted. This conversation will close in this tab. Other open tabs could switch too. Saved conversations are in History.',
			past: 'This conversation will close in this tab. Other open tabs could switch too. Saved conversations are in History.',
		};
		assert.equal(description, `If the switch succeeds: ${expected[category]}`);
		assert.equal(await page.locator('#active-turn').innerText(), before);
		assert.equal(await page.locator('#message').inputValue(), category === 'local' ? 'Local draft, unfinished.' : '');
		if (other) assert.equal(await other.locator('#message').inputValue(), 'Other draft, unfinished.');
		if (category === 'card') assert.equal(await page.getByLabel('Your reason', { exact: true }).inputValue(), 'Card reasoning, unfinished.');
	});
}
