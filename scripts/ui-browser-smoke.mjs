import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { appConfig } from '../src/config/app.config.ts';
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
				else if (source === 'steering') await page.getByRole('button', { name: 'Too fast: need a smaller step', exact: true }).click();
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
			});
		}
	}

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

async function skipToMain(page) {
	const link = page.getByRole('link', { name: 'Skip to main content', exact: true });
	assert.equal(await link.evaluate((node) => getComputedStyle(node).clipPath), 'inset(50%)');
	await page.keyboard.press('Tab');
	assert.equal(await link.evaluate((node) => {
		const rect = node.getBoundingClientRect();
		const style = getComputedStyle(node);
		return document.activeElement === node && style.clipPath === 'none' && style.outlineStyle === 'solid'
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
		aborts: 0,
		modelHeaders: [],
		finishReply() { releaseReply(); },
		async handle(route, url) {
			const json = (body, status = 200, headers = {}) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body), headers });
			if (url.pathname === appConfig.sessionPath) {
				return json({ userId: session.userId, aliases: [], kind: 'registered' });
			}
			if (url.pathname === appConfig.authProvidersPath) return json({ google: fixture.mode === 'guest-limit', github: fixture.mode === 'guest-limit' });
			if (!url.pathname.startsWith(`${appConfig.chatAgentPath}/`)) throw new Error(`Unexpected API request: ${url.pathname}`);
			if (url.pathname.endsWith('/abort')) {
				fixture.aborts += 1;
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
