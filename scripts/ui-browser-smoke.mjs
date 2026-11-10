import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { appConfig } from '../src/config/app.config.ts';

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

	for (const failure of ['http', 'invalid', 'network']) {
		await check(`provider-status-${failure}`, async (page, fixture) => {
			fixture.statusFailure = failure;
			await page.addInitScript((key) => localStorage.setItem(key, 'openai/gpt-5-mini'), appConfig.chatModelStorageKey);
			await page.goto(origin);
			await openProviders(page);
			await page.locator('#openai-key-status[role="alert"]').waitFor();
			assert.doesNotMatch(await page.locator('#providers-status .is-live').innerText(), /Chat uses/);
			assert.doesNotMatch(await page.locator('#providers-toggle').getAttribute('aria-label'), /Chat uses/);
			assert.equal(await page.evaluate((key) => localStorage.getItem(key), appConfig.chatModelStorageKey), 'openai/gpt-5-mini');
			assert.equal(await page.locator('#openai-key-connect').isEnabled(), true);
		});
	}

	await check('provider-key-request-recovery', async (page, fixture) => {
		await page.goto(origin);
		await openProviders(page);
		fixture.keyFailure = true;
		await page.locator('#openai-key-input').fill('synthetic-browser-key');
		await page.locator('#openai-key-connect').click();
		await page.getByText('Could not store that key. Try again.', { exact: true }).waitFor();
		assert.equal(await page.locator('#openai-key-connect').isEnabled(), true);
		fixture.keyFailure = false;
		await page.locator('#openai-key-connect').click();
		await page.locator('#openai-key-disconnect').waitFor();
		await page.getByRole('option', { name: 'GPT-5 mini', exact: true }).click();
		await page.waitForFunction(() => document.querySelector('[data-specifier="openai/gpt-5-mini"]')?.getAttribute('aria-selected') === 'true');
		fixture.statusFailure = 'network';
		await page.getByRole('option', { name: 'GPT-5 mini', exact: true }).click();
		await page.locator('#openai-key-status[role="alert"]').waitFor();
		assert.equal(await page.locator('#providers-status .is-live').innerText(), 'Chat uses your OpenAI key.');
		assert.equal(await page.evaluate((key) => localStorage.getItem(key), appConfig.chatModelStorageKey), 'openai/gpt-5-mini');
		fixture.statusFailure = undefined;
		fixture.keyFailure = true;
		await page.locator('#openai-key-disconnect').click();
		await page.getByText('Could not disconnect that key. Try again.', { exact: true }).waitFor();
		assert.equal(await page.locator('#openai-key-disconnect').isEnabled(), true);
		fixture.keyFailure = false;
		await page.locator('#openai-key-disconnect').click();
		await page.locator('#openai-key-connect').waitFor();
		assert.equal(await page.evaluate((key) => localStorage.getItem(key), appConfig.chatModelStorageKey), null);
		assert.deepEqual(fixture.keyMethods, ['PUT', 'PUT', 'DELETE', 'DELETE']);
	});

	await check('provider-mutation-owns-status', async (page, fixture) => {
		await page.goto(origin);
		await openProviders(page);
		fixture.statusFailure = 'http';
		await page.locator('#openai-key-input').fill('synthetic-browser-key');
		await page.locator('#openai-key-connect').click();
		await page.locator('#openai-key-disconnect').waitFor();
		assert.equal(await page.locator('#providers-status .is-live').innerText(), 'Chat uses your OpenAI key.');
		await page.locator('#openai-key-disconnect').click();
		await page.locator('#openai-key-connect').waitFor();
		assert.equal(await page.locator('#providers-status .is-live').innerText(), 'Chat uses the local Socratink model.');
	});

	await check('provider-ignores-older-status-read', async (page, fixture) => {
		fixture.holdInitialStatus = true;
		await page.goto(origin);
		await openProviders(page);
		await page.locator('#openai-key-input').fill('synthetic-browser-key');
		await page.locator('#openai-key-connect').click();
		await page.locator('#openai-key-disconnect').waitFor();
		const staleResponse = page.waitForResponse((response) => new URL(response.url()).pathname === appConfig.chatRoutePath);
		fixture.releaseStatusRead();
		await (await staleResponse).finished();
		await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
		assert.equal(await page.locator('#openai-key-disconnect').isVisible(), true);
		assert.equal(await page.locator('#providers-status .is-live').innerText(), 'Chat uses your OpenAI key.');
	});

	assert.equal(results.filter((result) => !result.passed).length, 0, JSON.stringify(results.filter((result) => !result.passed)));
	console.log(`UI browser passed: ${results.length} retry/provider scenarios.`);
}

async function send(page, text) {
	await page.locator('#message').fill(text);
	await page.locator('#chat').evaluate((form) => form.requestSubmit());
}

async function openProviders(page) {
	await page.locator('#peek-handle').click();
	await page.locator('#providers-toggle').click();
}

function createServices(origin, session) {
	let submissionId = '';
	let connected = false;
	let completed = false;
	let reads = 0;
	let statusReads = 0;
	let releaseReply;
	const replyReady = new Promise((resolve) => { releaseReply = resolve; });
	let releaseStatus;
	const statusReady = new Promise((resolve) => { releaseStatus = resolve; });
	const chatStatus = () => ({ kind: connected ? 'openai' : 'operator', openai: connected, openrouter: false });
	const fixture = {
		mode: 'success',
		statusFailure: undefined,
		keyFailure: false,
		holdInitialStatus: false,
		sent: [],
		keyMethods: [],
		finishReply() { releaseReply(); },
		releaseStatusRead() { releaseStatus(); },
		async handle(route, url) {
			const json = (body, status = 200, headers = {}) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body), headers });
			if (url.pathname === appConfig.sessionPath) {
				return json({ userId: session.userId, aliases: [], kind: 'registered' });
			}
			if (url.pathname === appConfig.authProvidersPath) return json({ google: false, github: false });
			if (url.pathname === appConfig.chatRoutePath) {
				const status = chatStatus();
				if (++statusReads === 1 && fixture.holdInitialStatus) await statusReady;
				if (fixture.statusFailure === 'network') return route.abort('failed');
				if (fixture.statusFailure === 'http') return json({}, 500);
				if (fixture.statusFailure === 'invalid') return json({ unexpected: true });
				return json(status);
			}
			if (url.pathname === appConfig.openaiKeyPath) {
				fixture.keyMethods.push(route.request().method());
				if (fixture.keyFailure) return route.abort('failed');
				connected = route.request().method() === 'PUT';
				return json(chatStatus());
			}
			if (!url.pathname.startsWith(`${appConfig.chatAgentPath}/`)) throw new Error(`Unexpected API request: ${url.pathname}`);
			if (route.request().method() === 'POST') {
				fixture.sent.push(route.request().postDataJSON().body);
				if (fixture.mode === 'admission-failure' && fixture.sent.length === 1) {
					return json({ error: { type: 'rejected', message: 'Admission rejected.' } }, 400);
				}
				submissionId = `browser-submission-${fixture.sent.length}`;
				return json({ submissionId, streamUrl: `${origin}${url.pathname}`, offset: '-1' }, 202);
			}
			if (url.searchParams.get('view') === 'history') {
				return json({ messages: completed ? [{ role: 'assistant', display: 'visible', submissionId, parts: [{ type: 'text', text: 'Fresh reply' }] }] : [], settlements: [] });
			}
			const events = url.pathname.endsWith('/events');
			if (!events && url.searchParams.get('view') !== 'updates') throw new Error(`Unexpected chat request: ${url}`);
			reads += 1;
			if (fixture.mode === 'recovery' && reads === 1) return json({ error: { type: 'interrupted', message: 'Read interrupted.' } }, 400);
			const failed = fixture.mode === 'stream-failure' && fixture.sent.length === 1;
			if (fixture.mode === 'stream-failure' && !failed) await replyReady;
			completed = !failed;
			const chunks = failed ? [
				{ type: 'message-delta', kind: 'reasoning', delta: 'Old attempt reasoning' },
				{ type: 'tool-input', toolCallId: 'old-tool', toolName: 'inspect', input: { note: 'Old attempt tool' } },
			] : [];
			const settlement = { submissionId, outcome: fixture.mode === 'recovery' ? 'aborted' : failed ? 'failed' : 'completed' };
			chunks.push({ type: 'submission-settled', ...settlement });
			const positioned = (list) => list.map((event, index) => ({ ...event, conversationId: 'browser-conversation', position: { batch: 1, index } }));
			if (events) {
				const snapshot = (settlements, messages = []) => ({ v: 1, conversationId: 'browser-conversation', offset: '0', messages, settlements });
				const reply = completed ? [{ id: `${submissionId}:assistant`, role: 'assistant', purpose: 'assistant', display: 'visible', submissionId, parts: [{ type: 'text', text: 'Fresh reply', state: 'done' }] }] : [];
				const frames = positioned([{ type: 'conversation-reset', snapshot: snapshot([]) }, ...chunks, { type: 'conversation-reset', snapshot: snapshot([settlement], reply) }]);
				return route.fulfill({ status: 200, contentType: 'text/event-stream', body: frames.map((frame) => `data: ${JSON.stringify(frame)}\n\n`).join('') });
			}
			return json(positioned(chunks), 200, {
				'Stream-Next-Offset': '1', 'Stream-Closed': 'true', 'Stream-Up-To-Date': 'true',
			});
		},
	};
	return fixture;
}
