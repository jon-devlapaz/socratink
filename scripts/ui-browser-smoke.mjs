import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { appConfig } from '../src/config/app.config.ts';
import { conversationTitle } from '../src/config/conversations.ts';
import { guestTurnLimit } from '../src/server/guest-turns.ts';
import { formatSteeringMessage } from '../src/ui/steering.ts';

export async function verifyUiBrowser({ browser, origin, session, out }) {
	await mkdir(out, { recursive: true });
	const results = [];
	async function check(name, run) {
		const context = await browser.newContext({ reducedMotion: 'reduce' });
		await context.tracing.start({ screenshots: true, snapshots: true });
		const page = await context.newPage();
		page.setDefaultTimeout(5_000);
		const errors = [];
		page.on('pageerror', (error) => errors.push(error.message));
		const fixture = createServices(origin, session);
		await context.route('**/*', async (route) => {
			const url = new URL(route.request().url());
			if (url.origin !== origin) return route.abort();
			if (url.pathname.startsWith('/api/')) return fixture.handle(route, url);
			return route.continue();
		});
		try {
			await run(page, fixture);
			assert.deepEqual(errors, [], 'browser has no unhandled request failures');
			await page.screenshot({ path: `${out}/${name}.png` });
			results.push({ name, passed: true });
		} catch (error) {
			results.push({ name, passed: false, error: error.message });
			await page.screenshot({ path: `${out}/${name}-failure.png` }).catch(() => {});
		} finally {
			await writeFile(`${out}/proof.json`, `${JSON.stringify(results, null, 2)}\n`);
			try {
				await context.tracing.stop({ path: `${out}/${name}-trace.zip` });
			} finally {
				await context.close();
			}
		}
	}

	for (const width of [390, 1280]) {
		await check(`skip-links-${width}`, async (page) => {
			await page.setViewportSize({ width, height: 900 });
			await page.goto(origin);
			const input = page.locator('#message');
			await page.locator('#message[placeholder="What are you working on?"]:enabled').waitFor();
			await skipToMain(page);
			await page.keyboard.press('Tab');
			assert.equal(await input.evaluate((node) => document.activeElement === node), true);
			assert.equal(await input.getAttribute('autocomplete'), 'off');
			await page.keyboard.type('Keyboard draft');
			assert.equal(await input.inputValue(), 'Keyboard draft');

			await page.goto(`${origin}/login.html`);
			await skipToMain(page);
		});

		await check(`skip-link-during-restore-${width}`, async (page) => {
			await page.setViewportSize({ width, height: 900 });
			const historyPath = `**${appConfig.chatAgentPath}/*`;
			const releaseHistory = Promise.withResolvers();
			await page.route(historyPath, async (route) => {
				await releaseHistory.promise;
				await route.fallback();
			});
			try {
				await Promise.all([page.waitForRequest(historyPath), page.goto(origin)]);
				assert.equal(await page.locator('#message').isDisabled(), true);
				await skipToMain(page);
			} finally {
				releaseHistory.resolve();
			}
			await page.locator('#message:enabled').waitFor();
			assert.equal(await page.evaluate(() => document.activeElement.id), 'main-content');
			await page.keyboard.press('Tab');
			assert.equal(await page.evaluate(() => document.activeElement.id), 'message');
		});
	}

	for (const forcedColors of ['none', 'active']) {
		await check(`keyboard-focus-decoration-${forcedColors}`, async (page, fixture) => {
			await page.emulateMedia({ forcedColors });
			await page.setViewportSize({ width: 390, height: 844 });
			await page.goto(origin);
			const input = page.locator('#message:enabled');
			await input.waitFor();
			await skipToMain(page);
			const composer = page.locator('#chat');
			const composerBefore = await readFocusPaint(composer);
			await page.keyboard.press('Tab');
			await assertNoFocusDecoration(input, composer, composerBefore);
			await page.locator('#menu-trigger').focus();
			await input.click({ position: { x: 24, y: 20 } });
			assert.equal(await input.evaluate((node) => node === document.activeElement), true);
			assert.deepEqual(await readFocusPaint(composer), composerBefore, 'clicking keeps the composer fill and border');
			await page.keyboard.type('Keyboard draft');

			const send = page.getByRole('button', { name: 'Send message', exact: true });
			const sendBefore = await readFocusPaint(send);
			await page.keyboard.press('Tab');
			if (await page.locator('#dictation-toggle:focus').count()) await page.keyboard.press('Tab');
			await assertNoFocusDecoration(send, send, sendBefore);

			await page.locator('#peek-handle').press('Enter');
			const startOver = page.locator('#start-over');
			const icon = startOver.locator(':scope > svg');
			const iconBefore = await readFocusPaint(icon);
			await page.locator('#sound-toggle').press('Tab');
			await assertNoFocusDecoration(startOver, icon, iconBefore);

			fixture.mode = 'guest-limit';
			await page.goto(origin);
			const question = page.getByRole('form', { name: 'Questions' });
			const choice = question.getByRole('radio').first();
			const choiceRow = question.locator('label.questionnaire-choice').first();
			await choice.waitFor();
			const choiceBefore = await readFocusPaint(choiceRow);
			await question.locator('fieldset').press('Tab');
			await assertNoFocusDecoration(choice, choiceRow, choiceBefore);

			await page.goto(`${origin}/login.html`);
			await skipToMain(page);
			const provider = page.locator('.login-oauth-btn').first();
			const providerBefore = await readFocusPaint(provider);
			await page.locator('.login-wordmark').press('Tab');
			await assertNoFocusDecoration(provider, provider, providerBefore);
		});
	}

	for (const width of [390, 1280]) {
		for (const source of ['composer', 'steering', 'question']) {
			await check(`guest-wall-${source}-${width}`, async (page, fixture) => {
				fixture.mode = 'guest-limit';
				await page.setViewportSize({ width, height: 900 });
				await page.goto(origin);
				await page.locator('#active-turn .questionnaire').waitFor();
				await page.evaluate(() => {
					window.guestButtons = [...document.querySelectorAll('#active-turn button')];
				});
				if (source === 'composer') await send(page, 'Keep my unsent question');
				else if (source === 'steering') await page.getByRole('button', { name: 'Smaller step', exact: true }).click();
				else await page.getByRole('button', { name: 'Hint', exact: true }).click();
				await page.locator('.chat-gate-card').waitFor();
				const expected = source === 'composer' ? 'Keep my unsent question'
					: source === 'steering' ? formatSteeringMessage('smaller-step')
						: 'Questionnaire answers:\n- Which step?: Asked for a hint.';
				assert.deepEqual(fixture.sent, [expected]);
				assert.equal(await page.locator('#message').inputValue(), expected);
				assert.equal(await page.locator('#message').isDisabled(), true);
				assert.equal(await page.getByRole('button', { name: 'Send message', exact: true }).isDisabled(), true);
				assert.equal(await page.locator('.chat-gate-message').innerText(),
					`You’ve had ${guestTurnLimit} turns. Sign in to save your conversation and keep learning.`);
				assert.equal(await page.locator('.chat-gate-card a').count(), 2);
				assert.equal(await page.locator('#active-turn .you, #messages .you').count(), 0);
				assert.equal(await page.locator('#active-turn .questionnaire, #active-turn .steering-bar').count(), 0);
				await page.locator('#chat').evaluate(form => form.requestSubmit());
				await page.evaluate(() => window.guestButtons.forEach(button => button.click()));
				await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
				assert.deepEqual(fixture.sent, [expected]);
				assert.equal(await page.locator('.chat-gate-card').count(), 1);
				assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
				await page.reload();
				await page.locator('#active-turn .questionnaire').waitFor();
				assert.equal(await page.locator('#active-turn .you, #messages .you').count(), 0);
				assert.equal(await page.locator('#message').inputValue(), source === 'composer' ? expected : '');
			});
		}
	}

	await check('controls-before-app-startup', async (page) => {
		await page.route('**/assets/*.js', (route) => route.abort());
		await page.goto(origin);
		assert.deepEqual({
			composerDisabled: await page.locator('#message').isDisabled(),
			sendDisabled: await page.getByRole('button', { name: 'Send message', exact: true }).isDisabled(),
			menuInert: await page.locator('#menu-layer').evaluate((node) => node.inert),
		}, { composerDisabled: true, sendDisabled: true, menuInert: true });
	});

	await check('menu-returns-focus-to-its-opener', async (page) => {
		await page.goto(origin);
		await page.locator('#message:enabled').waitFor();
		for (const selector of ['#menu-trigger', '#peek-handle']) {
			const trigger = page.locator(selector);
			await trigger.focus();
			await page.keyboard.press('Enter');
			await page.locator('#menu-layer.is-open').waitFor();
			await page.keyboard.press('Escape');
			assert.equal(await trigger.evaluate((node) => document.activeElement === node), true, selector);
		}
	});

	await check('unavailable-dictation-stays-hidden', async (page) => {
		await page.addInitScript(() => {
			window.SpeechRecognition = undefined;
			window.webkitSpeechRecognition = undefined;
		});
		await page.goto(origin);
		await page.locator('#message:enabled').waitFor();
		assert.equal(await page.locator('#dictation-toggle').isVisible(), false);
	});

	await check('composer-draft-scope', async (page, fixture) => {
		await page.goto(origin);
		const input = page.locator('#message');
		const ready = (tab) => tab.locator('#message[placeholder]').waitFor();
		await ready(page);
		const original = '  An unsent explanation.\nAnother line.  ';
		await input.fill(original);
		await page.reload();
		await ready(page);
		assert.equal(await input.inputValue(), original);

		// A page opened with an opener starts with a copy of its session storage.
		const [otherTab] = await Promise.all([
			page.waitForEvent('popup'),
			page.evaluate(() => { window.open(location.href); }),
		]);
		await ready(otherTab);
		assert.equal(await otherTab.locator('#message').inputValue(), '');
		await otherTab.reload();
		await ready(otherTab);
		assert.equal(await otherTab.locator('#message').inputValue(), '');
		await otherTab.close();
		assert.equal(await input.inputValue(), original);

		await page.locator('#chat').evaluate((form) => form.requestSubmit());
		await page.getByText('Fresh reply', { exact: true }).waitFor();
		assert.deepEqual(fixture.sent, [original.trim()]);
		await page.reload();
		await page.getByText('Fresh reply', { exact: true }).waitFor();
		assert.equal(await input.inputValue(), '');

		await input.fill('A draft for the old conversation');
		const initialId = await page.evaluate((key) => localStorage.getItem(key), appConfig.chatConversationStorageKey);
		await page.locator('#peek-handle').click();
		await Promise.all([page.waitForEvent('load'), page.getByRole('button', { name: 'Start over' }).click()]);
		await ready(page);
		assert.equal(await input.inputValue(), '');
		const newId = await page.evaluate((key) => localStorage.getItem(key), appConfig.chatConversationStorageKey);
		assert.notEqual(newId, initialId);
		await page.evaluate(({ key, initialId }) => localStorage.setItem(key, initialId), {
			key: appConfig.chatConversationStorageKey, initialId,
		});
		await page.reload();
		await ready(page);
		assert.equal(await input.inputValue(), '');
	});

	for (const colorScheme of ['light', 'dark']) for (const width of [390, 1280]) {
		await check(`history-${colorScheme}-${width}`, async (page) => {
			await page.emulateMedia({ colorScheme });
			await page.setViewportSize({ width, height: 900 });
			await page.goto(origin);
			const ready = () => page.locator('#message[placeholder]:enabled').waitFor();
			const storedId = () => page.evaluate((key) => localStorage.getItem(key), appConfig.chatConversationStorageKey);
			const openHistory = async () => {
				await page.locator('#peek-handle').click();
				await page.getByRole('button', { name: 'History' }).click();
				await page.locator('#history-dialog[open]').waitFor();
				// History loads from the server each time it opens.
				await page.getByText('Loading…', { exact: true }).waitFor({ state: 'hidden' });
			};
			await ready();
			await page.locator('#peek-handle').click();
			await page.getByRole('button', { name: 'History' }).waitFor();
			await page.screenshot({ path: `${out}/history-menu-${colorScheme}-${width}.png` });
			await page.keyboard.press('Escape');
			await openHistory();
			await page.getByText('Your conversations appear here after you send a message.').waitFor();
			await page.getByRole('button', { name: 'Back to conversation', exact: true }).click();
			assert.match(await page.evaluate(() => document.activeElement.id), /^(peek-handle|menu-trigger)$/);

			await send(page, 'Why is the sky blue?');
			// The fixture's history read repeats the last reply in every conversation.
			await page.locator('#active-turn').getByText('Fresh reply', { exact: true }).waitFor();
			const firstId = await storedId();
			await page.locator('#peek-handle').click();
			await Promise.all([page.waitForEvent('load'), page.getByRole('button', { name: 'Start over' }).click()]);
			await ready();
			await send(page, 'How do tides\nwork  in a bay?');
			// The fixture's history read repeats the last reply in every conversation.
			await page.locator('#active-turn').getByText('Fresh reply', { exact: true }).waitFor();
			await page.locator('#message').fill('Unsent thought about tides');
			const secondId = await storedId();

			await openHistory();
			const rows = page.locator('#history-list button');
			assert.equal(await rows.count(), 2);
			assert.match(await rows.nth(0).innerText(), /^How do tides work in a bay\?/);
			assert.equal(await rows.nth(0).getAttribute('aria-current'), 'true');
			assert.match(await rows.nth(0).innerText(), /Open now$/);
			assert.match(await rows.nth(1).innerText(), /^Why is the sky blue\?/);
			assert.doesNotMatch(await rows.nth(1).innerText(), /Open now/);
			assert.equal(await page.locator('#history-dialog').evaluate((node) => node.contains(document.activeElement)), true);
			await page.screenshot({ path: `${out}/history-open-${colorScheme}-${width}.png` });

			await Promise.all([page.waitForEvent('load'), rows.nth(1).click()]);
			await ready();
			assert.equal(await storedId(), firstId);
			await openHistory();
			// This fixture's history read has no learner turn, so opening does not reorder the list.
			assert.match(await page.locator('#history-list button[aria-current="true"]').innerText(), /^Why is the sky blue\?/);
			await Promise.all([page.waitForEvent('load'), page.locator('#history-list button:not([aria-current])').click()]);
			await ready();
			assert.equal(await storedId(), secondId);
			assert.equal(await page.locator('#message').inputValue(), 'Unsent thought about tides');
		});
	}

	const historyRows = (page) => page.locator('#history-list button');
	async function openHistory(page) {
		await page.locator('#peek-handle').click();
		await page.getByRole('button', { name: 'History' }).click();
		await page.locator('#history-dialog[open]').waitFor();
	}

	await check('history-says-when-it-cannot-load', async (page, fixture) => {
		await page.goto(origin);
		await send(page, 'A question to list');
		await page.locator('#active-turn').getByText('Fresh reply', { exact: true }).waitFor();
		fixture.listFailures = 1;
		await openHistory(page);
		await page.getByText('History could not load. Check your connection and try again.').waitFor();
		assert.equal(await historyRows(page).count(), 0);
		assert.equal(await page.evaluate(() => document.activeElement.id), 'history-retry');
		await page.getByRole('button', { name: 'Try again', exact: true }).click();
		await historyRows(page).first().waitFor();
		assert.match(await historyRows(page).nth(0).innerText(), /^A question to list\nOpen now$/);
		assert.equal(await page.locator('#history-retry').isHidden(), true);
	});

	await check('history-removes-browser-stored-titles', async (page) => {
		await page.addInitScript(() => {
			if (sessionStorage.getItem('seeded')) return;
			sessionStorage.setItem('seeded', '1');
			localStorage.setItem('socratink-chat-history:browser-user', '[{"id":"browser-user:x","title":"Old private title","usedAt":1}]');
			localStorage.setItem('socratink-chat-history', '[]');
		});
		await page.goto(origin);
		await page.locator('#message[placeholder]:enabled').waitFor();
		assert.deepEqual(await page.evaluate(() => Object.keys(localStorage).filter((key) => key.startsWith('socratink-chat-history'))), []);
	});

	await check('history-waits-for-pending-work', async (page, fixture) => {
		fixture.mode = 'cancel';
		await page.goto(origin);
		await send(page, 'Hold this reply');
		await page.locator('.turn.pending').waitFor();
		assert.equal(await page.locator('#history-trigger').isDisabled(), true);
		assert.equal(await page.locator('#start-over').isDisabled(), true);
		await page.getByRole('button', { name: 'Cancel', exact: true }).click();
		await page.getByText('You stopped this reply.', { exact: true }).waitFor();
		assert.equal(await page.locator('#history-trigger').isEnabled(), true);
	});

	await check('retry-clears-streamed-attempt', async (page, fixture) => {
		fixture.mode = 'stream-failure';
		await page.goto(origin);
		await send(page, 'Explain the constraint');
		const retry = page.getByRole('button', { name: 'Retry', exact: true });
		await retry.click();
		await page.locator('.turn.pending').waitFor();
		assert.equal(await page.locator('.turn.pending .tool-card').count(), 0);
		assert.doesNotMatch(await page.locator('.turn.pending').innerText(), /Old attempt/);
		fixture.finishReply();
		await page.getByText('Fresh reply', { exact: true }).waitFor();
		assert.equal(await page.locator('#active-turn .tool-card').count(), 0);
		assert.equal(await page.locator('#active-turn .turn.you').count(), 1);
		assert.deepEqual(fixture.sent, ['Explain the constraint', 'Explain the constraint']);
		assert.equal(await page.locator('#message').evaluate((node) => document.activeElement === node), true);
	});

	await check('retry-admission-rejection', async (page, fixture) => {
		fixture.mode = 'admission-failure';
		await page.goto(origin);
		await send(page, 'Keep this learner message');
		await page.getByRole('button', { name: 'Retry', exact: true }).click();
		await page.getByText('Fresh reply', { exact: true }).waitFor();
		assert.deepEqual(fixture.sent, ['Keep this learner message', 'Keep this learner message']);
		assert.equal(await page.locator('#active-turn .turn.you').count(), 1);
	});

	await check('retry-edited-oversized-message', async (page, fixture) => {
		await page.goto(origin);
		await send(page, 'x'.repeat(16_001));
		await page.getByRole('button', { name: 'Retry', exact: true }).waitFor();
		assert.deepEqual(fixture.sent, []);
		await page.locator('#message').fill('A shorter question');
		await page.getByRole('button', { name: 'Retry', exact: true }).click();
		await page.getByText('Fresh reply', { exact: true }).waitFor();
		assert.deepEqual(fixture.sent, ['A shorter question']);
	});

	await check('recheck-focus-and-confirmed-stop', async (page, fixture) => {
		fixture.mode = 'recovery';
		await page.goto(origin);
		await send(page, 'Recheck this admission');
		const recheck = page.getByRole('button', { name: 'Recheck', exact: true });
		await recheck.waitFor();
		assert.equal(await recheck.evaluate((node) => document.activeElement === node), true);
		assert.equal(await page.locator('#message').isDisabled(), true);
		assert.equal(await page.locator('#start-over').isEnabled(), true);
		await recheck.click();
		await page.getByRole('button', { name: 'Retry', exact: true }).waitFor();
		assert.equal(await page.locator('#message').isEnabled(), true);
		assert.equal(await page.locator('#message').evaluate((node) => document.activeElement === node), true);
		assert.deepEqual(fixture.sent, ['Recheck this admission']);
	});

	// Failure cases: a start and a cancel that settle on the same state paint
	// two blocks; the block says Socratink stopped what the learner stopped.
	await check('cancel-shows-one-block', async (page, fixture) => {
		fixture.mode = 'cancel';
		await page.goto(origin);
		await send(page, 'Stop this reply');
		await page.locator('.turn.pending').waitFor();
		await page.getByRole('button', { name: 'Cancel', exact: true }).click();
		await page.getByText('You stopped this reply.', { exact: true }).waitFor();
		await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
		assert.equal(await page.locator('#active-turn .request-state').count(), 1);
		assert.equal(await page.locator('#active-turn .request-state .turn-label').textContent(), 'Canceled');
		assert.equal(fixture.aborts, 1);
		assert.deepEqual(fixture.abortBodies, [{ submissionId: 'browser-submission-1' }], 'Cancel names the reply it stops');
		assert.deepEqual(fixture.sent, ['Stop this reply']);
	});

	await check('stored-model-preference-is-ignored', async (page, fixture) => {
		await page.addInitScript(() => localStorage.setItem('socratink-chat-model', 'openai/gpt-5-nano'));
		await page.goto(origin);
		await send(page, 'Use the operator model');
		await page.getByText('Fresh reply', { exact: true }).waitFor();
		assert.deepEqual(fixture.sent, ['Use the operator model']);
		assert.deepEqual(fixture.modelHeaders, [undefined]);
		assert.equal(await page.getByRole('button', { name: /Providers/ }).count(), 0);
		assert.equal(await page.getByRole('listbox', { name: /models/i }).count(), 0);
	});

	assert.equal(results.filter((result) => !result.passed).length, 0, JSON.stringify(results.filter((result) => !result.passed)));
	console.log(`UI browser passed: ${results.length} keyboard, retry, cancel, and operator scenarios.`);
}

async function readFocusPaint(locator) {
	return locator.evaluate(async (node) => {
		await Promise.all(node.getAnimations().map((animation) => animation.finished.catch(() => {})));
		const style = getComputedStyle(node);
		return {
			backgroundColor: style.backgroundColor,
			borderColor: style.borderColor,
			boxShadow: style.boxShadow,
		};
	});
}

async function assertNoFocusDecoration(control, paintTarget, before) {
	assert.equal(await control.evaluate((node) => node.matches(':focus-visible')), true,
		`${control} receives keyboard focus`);
	assert.equal(await control.evaluate((node) => getComputedStyle(node).outlineStyle), 'none',
		`${control} has no focus outline`);
	assert.deepEqual(await readFocusPaint(paintTarget), before, `${paintTarget} keeps its fill, border, and shadow on keyboard focus`);
}

async function skipToMain(page) {
	const link = page.getByRole('link', { name: 'Skip to main content', exact: true });
	assert.equal(await link.evaluate((node) => getComputedStyle(node).clipPath), 'inset(50%)');
	await page.keyboard.press('Tab');
	assert.equal(await link.evaluate((node) => {
		const rect = node.getBoundingClientRect();
		const style = getComputedStyle(node);
		return document.activeElement === node && style.clipPath === 'none' && style.outlineStyle === 'none'
			&& rect.left >= 0 && rect.top >= 0 && rect.right <= innerWidth && rect.bottom <= innerHeight;
	}), true);
	await page.keyboard.press('Enter');
	assert.equal(await page.evaluate(() => document.activeElement === document.querySelector('main')), true);
}

async function send(page, text) {
	await page.locator('#message').fill(text);
	await page.locator('#chat').evaluate((form) => form.requestSubmit());
}

function createServices(origin, session) {
	let submissionId = '';
	let completed = false;
	let reads = 0;
	let releaseReply;
	const replyReady = new Promise((resolve) => { releaseReply = resolve; });
	let releaseAbort;
	const abortRequested = new Promise((resolve) => { releaseAbort = resolve; });
	const fixture = {
		mode: 'success',
		sent: [],
		// Stands in for the server's conversation index; the rules themselves
		// are proven by conversation-index.test.mjs and the real-server smoke.
		conversations: [],
		listFailures: 0,
		aborts: 0,
		abortBodies: [],
		modelHeaders: [],
		finishReply() { releaseReply(); },
		async handle(route, url) {
			const json = (body, status = 200, headers = {}) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body), headers });
			if (url.pathname === appConfig.sessionPath) {
				return json({ userId: session.userId, aliases: [], kind: 'registered' });
			}
			if (url.pathname === `${appConfig.sessionPath}/logout`) {
				return route.fulfill({ status: 200, contentType: 'text/html', body: '<p>Signed out</p>' });
			}
			if (url.pathname === appConfig.conversationsPath) {
				if (fixture.listFailures > 0) {
					fixture.listFailures -= 1;
					return json({ error: { type: 'internal_error', message: 'Unable to complete this request.' } }, 500);
				}
				// A real server takes time; the page must wait for the list, not race it.
				await new Promise((resolve) => setTimeout(resolve, 250));
				return json({ conversations: [...fixture.conversations].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)) });
			}
			if (url.pathname === appConfig.authProvidersPath) return json({ google: fixture.mode === 'guest-limit', github: fixture.mode === 'guest-limit' });
			if (!url.pathname.startsWith(`${appConfig.chatAgentPath}/`)) throw new Error(`Unexpected API request: ${url.pathname}`);
			if (url.pathname.endsWith('/abort')) {
				fixture.aborts += 1;
				fixture.abortBodies.push(route.request().postDataJSON());
				releaseAbort();
				return json({ aborted: true });
			}
			if (route.request().method() === 'POST') {
				fixture.modelHeaders.push(route.request().headers()['x-socratink-chat-model']);
				fixture.sent.push(route.request().postDataJSON().body);
				if (fixture.mode === 'guest-limit') {
					return json({ error: { type: 'guest_turn_limit', message: 'Sign in to continue this conversation.' } }, 403);
				}
				if (fixture.mode === 'admission-failure' && fixture.sent.length === 1) {
					return json({ error: { type: 'rejected', message: 'Admission rejected.' } }, 400);
				}
				submissionId = `browser-submission-${fixture.sent.length}`;
				const id = decodeURIComponent(url.pathname.slice(appConfig.chatAgentPath.length + 1));
				const updatedAt = new Date(Date.UTC(2026, 10, 22, 12, fixture.sent.length)).toISOString();
				const known = fixture.conversations.find((row) => row.id === id);
				if (known) known.updatedAt = updatedAt;
				else fixture.conversations.push({ id, title: conversationTitle(route.request().postDataJSON().body), updatedAt });
				return json({ submissionId }, 202);
			}
			if (!url.pathname.endsWith('/events')) {
				if (fixture.mode === 'guest-limit') return json({ messages: [{
					role: 'assistant', display: 'visible', parts: [
						{ type: 'text', text: 'What would you check?' },
						{ type: 'data-questionnaire', data: { kind: 'question', submitLabel: 'Submit', items: [{
							name: 'item', prompt: 'Which step?', required: true, multiple: false,
							choices: [{ value: 'check', label: 'Check' }, { value: 'retry', label: 'Retry' }],
						}] } },
					],
				}], settlements: [] });
				return json({ messages: completed ? [{ role: 'assistant', display: 'visible', submissionId, parts: [{ type: 'text', text: 'Fresh reply' }] }] : [], settlements: [] });
			}
			reads += 1;
			if (fixture.mode === 'recovery' && reads === 1) return json({ error: { type: 'interrupted', message: 'Read interrupted.' } }, 400);
			if (fixture.mode === 'cancel') {
				// The first read is held until the learner cancels; the page drops it.
				if (!fixture.aborts) return abortRequested.then(() => route.abort()).catch(() => {});
				const settlement = { submissionId, outcome: 'aborted' };
				const frame = { type: 'conversation-reset', conversationId: 'browser-conversation', position: { batch: 1, index: 0 },
					snapshot: { v: 1, conversationId: 'browser-conversation', messages: [], settlements: [settlement] } };
				return route.fulfill({ status: 200, contentType: 'text/event-stream', body: `data: ${JSON.stringify(frame)}\n\n` });
			}
			const failed = fixture.mode === 'stream-failure' && fixture.sent.length === 1;
			if (fixture.mode === 'stream-failure' && !failed) await replyReady;
			completed = !failed;
			const chunks = failed ? [
				{ type: 'message-delta', kind: 'reasoning', delta: 'Old attempt reasoning' },
				{ type: 'tool-input', toolCallId: 'old-tool', toolName: 'inspect', input: { note: 'Old attempt tool' } },
			] : [];
			const settlement = { submissionId, outcome: fixture.mode === 'recovery' ? 'aborted' : failed ? 'failed' : 'completed' };
			chunks.push({ type: 'submission-settled', ...settlement });
			const snapshot = (settlements, messages = []) => ({ v: 1, conversationId: 'browser-conversation', messages, settlements });
			const reply = completed ? [{ id: `${submissionId}:assistant`, role: 'assistant', display: 'visible', submissionId, parts: [{ type: 'text', text: 'Fresh reply', state: 'done' }] }] : [];
			const frames = [{ type: 'conversation-reset', snapshot: snapshot([]) }, ...chunks, { type: 'conversation-reset', snapshot: snapshot([settlement], reply) }]
				.map((event, index) => ({ ...event, conversationId: 'browser-conversation', position: { batch: 1, index } }));
			return route.fulfill({ status: 200, contentType: 'text/event-stream', body: frames.map((frame) => `data: ${JSON.stringify(frame)}\n\n`).join('') });
		},
	};
	return fixture;
}
