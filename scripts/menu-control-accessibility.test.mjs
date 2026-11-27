import assert from 'node:assert/strict';
import { before, after, test } from 'node:test';
import { expect } from 'playwright/test';
import { menuHarness } from './menu-browser-harness.mjs';

let harness;
before(async () => { harness = await menuHarness(); });
after(async () => { await harness?.close(); });

async function assertOpener(page) {
	await expect(page.getByRole('button', { name: 'Open menu', exact: true })).toHaveCount(1);
}

async function assertSound(page, on) {
	const label = `Sound: ${on ? 'on' : 'off'}`;
	const sound = page.getByRole('button', { name: label, exact: true });
	await expect(sound).toBeVisible();
	await expect(sound).toHaveText(label);
	await expect(sound).toHaveAttribute('aria-pressed', String(on));
}

for (const width of [390, 1280]) {
	test(`menu and sound expose their state at ${width}px`, async t => {
		const page = await harness.page(t, width);
		await assertOpener(page);
		await page.getByRole('button', { name: 'Open menu', exact: true }).click();
		await assertSound(page, false);
		await page.locator('#sound-toggle').click();
		await assertSound(page, true);
		await page.keyboard.press('Escape');
		await page.reload();
		await page.locator('#message:enabled').waitFor();
		await assertOpener(page);
		await page.getByRole('button', { name: 'Open menu', exact: true }).click();
		await assertSound(page, true);
		await page.locator('#sound-toggle').click();
		await assertSound(page, false);
	});
}

test('the same assertions reject old controls and incorrect pressed states', async t => {
	const page = await harness.page(t, 390);
	await page.setContent('<button>Open menu</button><button>Open menu</button><button aria-pressed="false">Sound off</button>');
	await assert.rejects(() => assertOpener(page));
	await assert.rejects(() => assertSound(page, false));
	for (const on of [false, true]) {
		for (const pressed of [undefined, String(!on)]) {
			await page.setContent(`<button ${pressed === undefined ? '' : `aria-pressed="${pressed}"`}>Sound: ${on ? 'on' : 'off'}</button>`);
			await assert.rejects(() => assertSound(page, on));
		}
	}
});
