import { before, after, test } from 'node:test';
import { expect } from 'playwright/test';
import { menuHarness, pullMenu } from './menu-browser-harness.mjs';

let harness;
before(async () => { harness = await menuHarness(); });
after(async () => { await harness?.close(); });

for (const width of [390, 1280]) {
	test(`menu returns focus to the accessible opener at ${width}px`, async t => {
		const page = await harness.page(t, width);
		const opener = page.getByRole('button', { name: 'Open menu', exact: true });
		const menu = page.getByRole('dialog', { name: 'Menu', exact: true });
		await expect(opener).toHaveCount(1);
		for (const key of ['Enter', 'Space']) {
			await opener.focus();
			await page.keyboard.press(key);
			await expect(menu).toBeVisible();
			await expect(menu.locator(':focus')).toHaveCount(1);
			await page.keyboard.press('Escape');
			await expect(menu).toBeHidden();
			await expect(opener).toBeVisible();
			await expect(opener).toBeFocused();
		}
		await opener.click();
		await page.getByRole('button', { name: 'Close menu', exact: true }).click();
		await expect(menu).toBeHidden();
		await expect(opener).toBeFocused();
		if (width === 390) {
			await pullMenu(page);
			await expect(menu).toBeVisible();
			await menu.evaluate(node => Promise.all(node.getAnimations().map(animation => animation.finished)));
			const handle = page.getByRole('button', { name: 'Close menu', exact: true });
			await expect(handle).toBeInViewport();
			const box = await handle.boundingBox();
			await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
			await page.mouse.down();
			await page.mouse.move(box.x + box.width / 2, 0, { steps: 10 });
			await expect(menu).toHaveAttribute('style', /transform: translateY\(-/);
			await page.mouse.up();
			await expect(menu).toBeHidden();
			await expect(opener).toBeVisible();
			await expect(opener).toBeFocused();
		}
	});
}
