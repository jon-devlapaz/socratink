import assert from 'node:assert/strict';
import { test } from 'node:test';
import { startOverBrowser, requestStartOver } from './start-over-browser.mjs';

for (const composerOnly of [false, true]) {
	for (const category of ['other-tab', 'card']) {
		test(`${category} protection ${composerOnly ? 'rejects a composer-only detector' : 'uses all work, not just the composer'}`, async (t) => {
			const ui = await startOverBrowser(t, { composerOnly, history: category === 'card' ? 'card' : 'empty' });
			const page = await ui.open();
			let other;
			if (category === 'other-tab') {
				other = await ui.open();
				await other.locator('#message').fill('Other tab, unfinished.');
			} else {
				await page.getByRole('radio', { name: 'The Moon', exact: true }).click();
				await page.getByLabel('Your reason', { exact: true }).fill('My unfinished card work.');
			}
			assert.equal(await page.locator('#message').inputValue(), '');
			if (composerOnly) {
				await assert.rejects(() => ui.protect(page), /work at risk needs confirmation/);
				return;
			}
			const description = await ui.protect(page);
			if (other) {
				assert.match(description, /[Uu]nsent work in your other open tabs could be deleted/);
				assert.equal(await other.locator('#message').inputValue(), 'Other tab, unfinished.');
			} else {
				assert.match(description, /question-card work/);
				assert.equal(await page.getByRole('radio', { name: 'The Moon', exact: true }).getAttribute('aria-checked'), 'true');
				assert.equal(await page.getByLabel('Your reason', { exact: true }).inputValue(), 'My unfinished card work.');
			}
		});
	}
}

test('past turns with no unsent work still need confirmation and cancel retains them', async (t) => {
	const ui = await startOverBrowser(t, { history: 'past' });
	const page = await ui.open();
	const before = await page.locator('#active-turn').innerText();
	assert.ok(before.includes('Why do tides happen?'));
	assert.equal(await page.locator('#message').inputValue(), '');
	assert.match(await ui.protect(page), /This conversation will close/);
	assert.equal(await page.locator('#active-turn').innerText(), before);
});

test('another tab clearing its draft makes the session empty again', async (t) => {
	const ui = await startOverBrowser(t);
	const page = await ui.open();
	const other = await ui.open();
	await other.locator('#message').fill('Unfinished.');
	await ui.protect(page);
	await other.locator('#message').fill('');
	await requestStartOver(page);
	assert.equal(await page.locator('#start-over-dialog').count(), 0);
});

test('another tab reloading restores its draft and warning', async (t) => {
	const ui = await startOverBrowser(t);
	const page = await ui.open();
	const other = await ui.open();
	await other.locator('#message').fill('Other tab, unfinished.');
	await other.reload();
	await other.waitForFunction(() => document.querySelector('#message')?.disabled === false);
	assert.equal(await other.locator('#message').inputValue(), 'Other tab, unfinished.');
	assert.match(await ui.protect(page), /[Uu]nsent work in your other open tabs/);
});

test('closing a draft tab removes its work flag', async (t) => {
	const ui = await startOverBrowser(t);
	const page = await ui.open();
	const other = await ui.open();
	await other.locator('#message').fill('Other tab, unfinished.');
	await other.close();
	await requestStartOver(page);
	assert.equal(await page.locator('#start-over-dialog').count(), 0);
});

for (const history of ['empty', 'card']) {
	test(`${history} work is stored only as a boolean flag and timestamp, never as text or answers`, async (t) => {
		const ui = await startOverBrowser(t, { history });
		const page = await ui.open();
		if (history === 'card') await page.getByLabel('Your reason', { exact: true }).fill('Private synthetic reasoning.');
		else await page.locator('#message').fill('Private synthetic composer.');
		const flags = await page.evaluate(() => Object.entries(localStorage).filter(([key]) => key.startsWith('socratink-unsent-work:')));
		assert.equal(flags.length, 1);
		const flag = JSON.parse(flags[0][1]);
		assert.deepEqual(Object.keys(flag).sort(), ['hasWork', 'updatedAt']);
		assert.equal(flag.hasWork, true);
		assert.equal(typeof flag.updatedAt, 'number');
		assert.ok(!JSON.stringify(flags).includes('Private synthetic'));
	});
}

test('blocked storage keeps a conservative warning instead of assuming other tabs are empty', async (t) => {
	const ui = await startOverBrowser(t, { blockedStorage: true });
	const page = await ui.open();
	await requestStartOver(page);
	assert.match(await page.locator('#start-over-dialog').innerText(), /Unsent work in other open tabs could be deleted/);
});

test('a suspended page keeps its flag and refreshes it on pageshow', async (t) => {
	const ui = await startOverBrowser(t);
	const page = await ui.open();
	const other = await ui.open();
	await other.locator('#message').fill('Other tab, unfinished.');
	await other.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true })));
	assert.match(await ui.protect(page), /[Uu]nsent work in your other open tabs/);
	await other.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })));
	assert.equal(await other.locator('#message').inputValue(), 'Other tab, unfinished.');
	assert.match(await ui.protect(page), /[Uu]nsent work in your other open tabs/);
});

test('a different learner\'s work flag does not make this learner\'s session nonempty', async (t) => {
	const ui = await startOverBrowser(t);
	const page = await ui.open();
	await page.evaluate(() => localStorage.setItem('socratink-unsent-work:guest-someone-else:synthetic', '1'));
	await requestStartOver(page);
	assert.equal(await page.locator('#start-over-dialog').count(), 0);
});

test('confirmed Start over resets both tabs and clears their work flags', async (t) => {
	const ui = await startOverBrowser(t);
	const page = await ui.open();
	const other = await ui.open();
	const before = await ui.id(page);
	await other.locator('#message').fill('Other tab, unfinished.');
	await page.locator('#message').fill('Local draft, unfinished.');
	await requestStartOver(page);
	await page.locator('#start-over-confirm').click();
	for (const tab of [page, other]) {
		await tab.waitForFunction((before) => localStorage.getItem('socratink-chat-conversation-id') !== before
			&& document.querySelector('#message')?.disabled === false && document.querySelector('#message')?.value === '', before);
	}
	assert.equal(await ui.id(page), await ui.id(other));
	const flags = await page.evaluate(() => Object.entries(localStorage).filter(([key]) => key.startsWith('socratink-unsent-work:')));
	assert.equal(flags.length, 2);
	assert.ok(flags.every(([, value]) => JSON.parse(value).hasWork === false));
	await requestStartOver(page);
	assert.equal(await page.locator('#start-over-dialog').count(), 0);
});

test('malformed and expired empty flags do not warn on an empty session and are removed', async (t) => {
	const ui = await startOverBrowser(t);
	const page = await ui.open();
	await page.evaluate(() => {
		localStorage.setItem('socratink-unsent-work:guest-start-over-risk:crashed', '1');
		localStorage.setItem('socratink-unsent-work:guest-start-over-risk:expired', JSON.stringify({ hasWork: false, updatedAt: Date.now() - 300_000 }));
	});
	await requestStartOver(page);
	assert.equal(await page.locator('#start-over-dialog').count(), 0);
	assert.equal(await page.evaluate(() => localStorage.getItem('socratink-unsent-work:guest-start-over-risk:crashed')), null);
	assert.equal(await page.evaluate(() => localStorage.getItem('socratink-unsent-work:guest-start-over-risk:expired')), null);
});

test('an expired flag with work, as from a frozen tab, still warns and is removed only on confirm', async (t) => {
	const ui = await startOverBrowser(t);
	const page = await ui.open();
	const frozen = 'socratink-unsent-work:guest-start-over-risk:frozen';
	await page.evaluate((frozen) => localStorage.setItem(frozen, JSON.stringify({ hasWork: true, updatedAt: Date.now() - 300_000 })), frozen);
	await requestStartOver(page);
	await page.locator('#start-over-dialog').waitFor();
	assert.match(await page.locator('#start-over-dialog').innerText(), /Unsent work in other open tabs could be deleted/);
	assert.notEqual(await page.evaluate((frozen) => localStorage.getItem(frozen), frozen), null);
	await page.locator('#start-over-confirm').click();
	await page.waitForFunction(() => document.querySelector('#message')?.disabled === false);
	assert.equal(await page.evaluate((frozen) => localStorage.getItem(frozen), frozen), null);
});

test('confirmed Start over removes expired flags without touching another learner', async (t) => {
	const ui = await startOverBrowser(t);
	const page = await ui.open();
	await page.locator('#message').fill('A synthetic draft.');
	await requestStartOver(page);
	await page.evaluate(() => {
		localStorage.setItem('socratink-unsent-work:guest-start-over-risk:crashed', '1');
		localStorage.setItem('socratink-unsent-work:guest-someone-else:crashed', '1');
	});
	await page.locator('#start-over-confirm').click();
	await page.waitForFunction(() => document.querySelector('#message')?.disabled === false && document.querySelector('#message')?.value === '');
	assert.equal(await page.evaluate(() => localStorage.getItem('socratink-unsent-work:guest-start-over-risk:crashed')), null);
	assert.equal(await page.evaluate(() => localStorage.getItem('socratink-unsent-work:guest-someone-else:crashed')), '1');
});

test('idle live flags refresh past expiry and disposal removes listeners and heartbeat', async (t) => {
	const ui = await startOverBrowser(t);
	const page = await ui.open();
	await page.clock.install();
	await page.evaluate(async () => {
		const { mountUnsentWork } = await import(new URL('/client/unsent-work.ts', location.href).href);
		window.syntheticWork = mountUnsentWork('guest-lifecycle-test', () => true);
	});
	const flags = () => page.evaluate(() => Object.entries(localStorage).filter(([key]) => key.startsWith('socratink-unsent-work:guest-lifecycle-test:')));
	const initial = await flags();
	assert.equal(initial.length, 1);
	await page.clock.runFor(180_000);
	const refreshed = await flags();
	assert.equal(JSON.parse(refreshed[0][1]).hasWork, true);
	assert.ok(JSON.parse(refreshed[0][1]).updatedAt - JSON.parse(initial[0][1]).updatedAt > 120_000);
	assert.ok(await page.evaluate(() => Date.now()) - JSON.parse(refreshed[0][1]).updatedAt <= 15_000);
	await page.evaluate(async () => {
		document.dispatchEvent(new Event('input'));
		window.syntheticWork.dispose();
		for (const type of ['input', 'change', 'click']) document.dispatchEvent(new Event(type));
		window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }));
		window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true }));
		await Promise.resolve();
	});
	await page.clock.runFor(180_000);
	assert.deepEqual(await flags(), []);
});
