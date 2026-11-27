// Drive a launched Socratink instance as a learner, in a real browser.
// Import from a journey or an ad-hoc script run from the repository root:
//
//   import { connect } from './.claude/skills/verify-socratink/learner.mjs';
//   const { learner, model, evidence } = await connect();
//   const tab = await learner.newTab();
//   await send(tab, 'Why do tides happen?');
//
// One learner is one browser context: one guest cookie and one localStorage, so its
// tabs share the same conversation, exactly like two tabs in a learner's own browser.
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { connect as tcpConnect, createServer } from 'node:net';
import { join } from 'node:path';
import { readState } from './control.mjs';
import { readProductionDeployment } from './production-deployment.mjs';

// The browser reaches the app through this loopback proxy, so a run can drop the
// learner's network, or only the reply streams (GET .../events), the way a flaky
// connection or an intermediary that closes long requests does.
const streamRequest = /^GET \/api\/agents\/chat\/[^ ]+\/events /;

async function startNetwork(target) {
	const { port: targetPort } = new URL(target);
	const sockets = new Set();
	const streams = new Set();
	let down = false;
	let streamsDown = false;
	let streamLifeMs;
	const server = createServer((client) => {
		if (down) { client.destroy(); return; }
		const upstream = tcpConnect(Number(targetPort), '127.0.0.1');
		const pair = [client, upstream];
		for (const socket of pair) {
			sockets.add(socket);
			socket.on('error', () => {});
			socket.on('close', () => { sockets.delete(socket); streams.delete(client); for (const other of pair) other.destroy(); });
		}
		// Keep-alive sockets carry several requests, so check each request line as it passes.
		client.on('data', (chunk) => {
			if (!streamRequest.test(chunk.toString('latin1', 0, 200))) return;
			if (streamsDown) { client.destroy(); return; }
			streams.add(client);
			if (streamLifeMs !== undefined) setTimeout(() => client.destroy(), streamLifeMs);
		});
		client.pipe(upstream).pipe(client);
	});
	await new Promise((done) => server.listen(0, '127.0.0.1', done));
	return {
		origin: `http://127.0.0.1:${server.address().port}`,
		/** Cut every open connection and refuse new ones until restore(). */
		drop() { down = true; for (const socket of sockets) socket.destroy(); },
		restore() { down = false; },
		/** Cut open reply streams and refuse new ones; other requests (sending, history) still work. */
		dropStreams() { streamsDown = true; for (const socket of streams) socket.destroy(); },
		/** Let every reply stream open, then close it after `ms`, again and again. */
		closeStreamsAfter(ms) { streamLifeMs = ms; for (const socket of streams) setTimeout(() => socket.destroy(), ms); },
		restoreStreams() { streamsDown = false; streamLifeMs = undefined; },
		close() { for (const socket of sockets) socket.destroy(); return new Promise((done) => server.close(done)); },
	};
}

export async function connect({ run, production = false, viewport = { width: 1440, height: 1080 } } = {}) {
	const runId = production ? `production-${Date.now()}` : undefined;
	const state = production ? {
		runId, origin: 'https://app.socratink.ai', provider: 'gateway',
		evidenceDir: join('.cache', 'verify-socratink', 'evidence', runId),
	} : readState(run);
	const network = production ? undefined : await startNetwork(state.origin);
	const origin = network?.origin ?? state.origin;
	const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
	const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, headless: true });
	const model = state.modelOrigin ? {
		hold: () => fetch(`${state.modelOrigin}/control/hold`, { method: 'POST' }),
		release: () => fetch(`${state.modelOrigin}/control/release`, { method: 'POST' }),
		calls: () => fetch(`${state.modelOrigin}/control/calls`).then((r) => r.json()),
	} : undefined;
	const learners = [];
	async function newLearner(options = {}) {
		const context = await browser.newContext({ viewport, ...options });
		// Keep the run offline from third parties (analytics, fonts CDNs); the app itself is untouched.
		await context.route('**/*', (route) => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
		const tabs = [];
		const learner = {
			context, tabs,
			async newTab() {
				const page = await context.newPage();
				page.setDefaultTimeout(20_000);
				page.errors = [];
				page.streams = [];
				page.on('pageerror', (error) => page.errors.push(error.message));
				page.on('request', (request) => {
					if (new URL(request.url()).pathname.endsWith('/events')) page.streams.push(Date.now());
				});
				tabs.push(page);
				await page.goto(origin);
				if (!production) await page.locator('#message[placeholder]:enabled').waitFor();
				return page;
			},
		};
		learners.push(learner);
		return learner;
	}
	const learner = await newLearner();
	const evidenceDir = state.evidenceDir;
	return {
		state, origin, browser, model, network, learner, newLearner,
		evidence(feature, file) {
			mkdirSync(join(evidenceDir, feature), { recursive: true });
			return join(evidenceDir, feature, file);
		},
		async close() { await browser.close(); await network?.close(); },
	};
}

/** Type a message and press Send, the way a learner does. */
export async function send(page, text) {
	await page.locator('#message').fill(text);
	await page.getByRole('button', { name: 'Send message', exact: true }).click();
}

/** Wait for a settled tutor reply. Pass the submitted learner text to match its reply. */
export async function waitForReply(page, { after, timeout = 60_000 } = {}) {
	const settled = await page.waitForFunction((submitted) => {
		const turns = [...document.querySelectorAll('#active-turn .turn')];
		const reply = turns.at(-1);
		const learner = turns.at(-2);
		if (!reply?.matches('.assistant') || turns.some(turn => turn.matches('.pending'))) return;
		if (submitted && !(learner?.matches('.you') && learner.innerText.includes(submitted))) return;
		return reply.innerText;
	}, after, { timeout });
	try {
		return await settled.jsonValue();
	} finally {
		await settled.dispose();
	}
}

/** Pixels between the bottom of the last visible turn and the top of the composer. */
export function composerGap(page) {
	return page.evaluate(() => {
		const turns = [...document.querySelectorAll('#active-turn > *')].filter((node) => node.getBoundingClientRect().height > 0);
		const last = turns.at(-1)?.getBoundingClientRect();
		const composer = document.querySelector('.composer-shell')?.getBoundingClientRect();
		return last && composer ? Math.round(composer.top - last.bottom) : null;
	});
}

/** Record the last turn's bottom edge on every animation frame, to catch jumps. */
export async function trackLastTurn(page) {
	await page.evaluate(() => {
		window.__turnBottoms = [];
		const tick = () => {
			const turns = [...document.querySelectorAll('#active-turn > *')].filter((node) => node.getBoundingClientRect().height > 0);
			const bottom = turns.at(-1)?.getBoundingClientRect().bottom;
			if (bottom !== undefined) window.__turnBottoms.push({ t: performance.now(), bottom: Math.round(bottom),
				pending: Boolean(document.querySelector('#active-turn .turn.pending')) });
			window.__turnFrame = requestAnimationFrame(tick);
		};
		tick();
	});
	return async () => page.evaluate(() => { cancelAnimationFrame(window.__turnFrame); return window.__turnBottoms; });
}

/** Snapshot of what the learner sees in a tab, for result files. */
export function view(page) {
	return page.evaluate(() => ({
		activeTurn: document.querySelector('#active-turn')?.innerText.replace(/\s+/g, ' ').trim(),
		pending: Boolean(document.querySelector('#active-turn .turn.pending')),
		composerLocked: document.querySelector('#message')?.disabled,
		placeholder: document.querySelector('#message')?.placeholder,
	}));
}

/**
 * Run one journey: connect, run `body`, save evidence/<feature>/result.json, close.
 * `body` gets the connect() result plus `record(key, value)` and `shot(page, name)`.
 * Exits 1 when an assertion fails; the failure is saved in result.json too.
 */
export async function journey(feature, body, options) {
	const session = await connect(options);
	const result = { feature, run: session.state.runId, provider: session.state.provider, builtFrom: session.state.commit,
		...(options?.production && { origin: session.origin }),
		startedAt: new Date().toISOString(), observed: {}, screenshots: [] };
	const record = (key, value) => { result.observed[key] = value; };
	const shot = async (page, name) => {
		const path = session.evidence(feature, `${name}.png`);
		await page.screenshot({ path });
		result.screenshots.push(path);
	};
	try {
		const deployment = options?.production ? readProductionDeployment() : undefined;
		await body({ ...session, record, shot });
		const errors = session.learner.tabs.flatMap((tab) => tab.errors);
		if (errors.length) throw new Error(`Page errors: ${errors.join('; ')}`);
		if (deployment) {
			assert.deepEqual(readProductionDeployment(), deployment, 'Production changed during the guest check.');
			Object.assign(result, deployment);
		}
		result.passed = true;
	} catch (error) {
		result.passed = false;
		result.failure = error.stack ?? String(error);
		for (const [index, tab] of session.learner.tabs.entries()) await shot(tab, `failure-tab-${index + 1}`).catch(() => {});
		process.exitCode = 1;
	} finally {
		await session.model?.release();
		await session.close();
		writeFileSync(session.evidence(feature, 'result.json'), JSON.stringify(result, null, '\t'));
		console.log(`${result.passed ? 'PASS' : 'FAIL'} ${feature}: ${session.evidence(feature, 'result.json')}`);
		if (!result.passed) console.error(result.failure);
	}
}
