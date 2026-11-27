import assert from 'node:assert/strict';
import test from 'node:test';
import { chromium } from 'playwright';
import { waitForReply } from './learner.mjs';

test('the production check waits for the reply to the submitted card answer', async () => {
	const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });
	try {
		const page = await browser.newPage();
		const answer = 'Tilt changes the angle of sunlight.';
		await page.setContent(`
			<div id="active-turn">
				<div class="turn assistant">Hint from Socratink</div>
				<div class="turn you">${answer}</div>
			</div>
		`);
		const wait = () => waitForReply(page, { after: answer, timeout: 250 });
		await assert.rejects(wait, { name: 'TimeoutError' }, 'the hint can stay visible before Thinking appears');

		const activeTurn = page.locator('#active-turn');
		await activeTurn.evaluate(node => node.insertAdjacentHTML('beforeend', '<div class="turn pending">Thinking</div>'));
		await assert.rejects(wait, { name: 'TimeoutError' }, 'Thinking is still waiting for the new reply');

		await activeTurn.locator('.pending').evaluate(node => {
			node.outerHTML = '<div class="turn assistant">Correct. Tilt changes the sunlight angle.</div>';
		});
		assert.equal(await waitForReply(page, { after: answer, timeout: 5_000 }), 'Correct. Tilt changes the sunlight angle.');
	} finally {
		await browser.close();
	}
});
