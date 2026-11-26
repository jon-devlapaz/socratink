import assert from 'node:assert/strict';
import { expect } from 'playwright/test';
import { assertAccessible } from './browser-accessibility.mjs';

export async function verifySignInBrowser({ browser, app, fixture }) {
	const context = await browser.newContext({ reducedMotion: 'reduce' });
	const consentPage = new URL('/oauth/authorize', fixture.origin);
	consentPage.hostname = 'localhost';
	try {
		await context.route('**/*', async (route) => {
			const url = new URL(route.request().url());
			if (url.origin !== app.origin && url.origin !== consentPage.origin) return route.abort();
			if (url.origin !== app.origin || url.pathname !== '/api/auth/google/login') return route.continue();
			const login = await route.fetch({ maxRedirects: 0 });
			assert.equal(login.status(), 302);
			const provider = new URL(login.headers().location);
			assert.equal(provider.origin + provider.pathname, 'https://accounts.google.com/o/oauth2/v2/auth');
			await route.fulfill({ response: login, headers: {
				...login.headers(), location: `${consentPage.href}${provider.search}`,
			} });
		});
		const page = await context.newPage();
		await page.goto(app.origin);
		const composer = page.getByRole('textbox', { name: 'Message Socratink' });
		await expect(composer).toBeEnabled();
		await page.locator('#peek-handle').click();
		const feedback = page.getByRole('button', { name: 'Feedback', exact: true });
		if (process.env.VITE_MODEM_FEEDBACK_TOKEN?.trim()) await expect(feedback).toBeVisible();
		const feedbackAvailable = await feedback.isVisible();
		if (feedbackAvailable) {
			await feedback.click();
			const dialog = page.getByRole('dialog', { name: 'Send feedback' });
			await expect(dialog.getByRole('heading', { name: 'Send feedback', exact: true })).toBeFocused();
			await expect(dialog.getByRole('textbox', { name: 'Message', exact: true })).toBeEditable();
			await assertAccessible(page, 'Guest feedback dialog');
			await dialog.getByRole('button', { name: 'Close', exact: true }).click();
			await page.locator('#peek-handle').click();
		}
		await page.getByRole('link', { name: 'Sign in', exact: true }).click();
		const google = page.getByRole('button', { name: 'Google', exact: true });
		await expect(google).toBeVisible();
		await assertAccessible(page, 'Sign in');
		await google.click();
		await page.getByRole('button', { name: 'Decline' }).click();
		await expect(page.getByRole('alert')).toHaveText("Sign-in didn't complete. Please try again.");
		await assertAccessible(page, 'Sign-in failure');
		await google.click();
		await page.getByRole('button', { name: 'Allow' }).click();
		await expect(composer).toBeEnabled();
		await page.locator('#peek-handle').click();
		await expect(page.getByRole('link', { name: 'Sign out' })).toBeVisible();
		await page.reload();
		await expect(composer).toBeEnabled();
		await page.locator('#peek-handle').click();
		await expect(page.getByRole('link', { name: 'Sign out' })).toBeVisible();
		assert.equal((await (await page.request.get(`${app.origin}/api/session`)).json()).kind, 'registered');
		return { guestFeedbackDialogScanned: feedbackAvailable };
	} finally {
		await context.close();
	}
}
