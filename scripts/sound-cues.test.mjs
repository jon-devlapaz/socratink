import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { before, after, test } from 'node:test';
import { createServer } from 'vite';
import { chromium } from 'playwright';

const source = await readFile(new URL('../src/ui/sound-cues.ts', import.meta.url), 'utf8');
const faults = {
	assistance: ['revealFromReply(reply.data)', 'false'],
	history: ['if (!pending) return;', ''],
	off: ['!enabled || ', ''],
	motion: ["window.matchMedia('(prefers-reduced-motion: reduce)').matches", 'false'],
	duplicate: ['oscillator.start(now);', 'oscillator.start(now); oscillator.start(now);'],
	'duplicate-guard': ['\n\t\t\tpending = false;', ''],
};
let server;
let browser;
let origin;

before(async () => {
	const fault = process.env.SOUND_CUES_FAULT;
	if (fault) assert.ok(source.includes(faults[fault][0]), `fault target exists: ${fault}`);
	server = await createServer({
		configFile: false,
		root: new URL('../src/ui', import.meta.url).pathname,
		server: { host: '127.0.0.1', port: 0 },
		plugins: [{
			name: 'sound-guard-fault',
			enforce: 'pre',
			transform(code, id) {
				if (!fault || !id.endsWith('/sound-cues.ts')) return;
				return code.replaceAll(...faults[fault]);
			},
		}],
	});
	await server.listen();
	origin = `http://127.0.0.1:${server.httpServer.address().port}`;
	browser = await chromium.launch({ headless: true });
});
after(async () => {
	await browser?.close();
	await server?.close();
});

async function setup(t, { saved = false, restored = false, unsettled = false } = {}) {
	const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
	t.after(() => context.close());
	await context.addInitScript(({ saved }) => {
		if (saved) localStorage.setItem('socratink-sound', 'on');
		window.audio = { starts: [], gains: [], stops: [], contexts: 0 };
		window.AudioContext = class {
			constructor() { window.audio.contexts++; }
			state = 'running';
			currentTime = 10;
			destination = {};
			resume() { return Promise.resolve(); }
			createOscillator() {
				return {
					frequency: { setValueAtTime() {} },
					connect() {}, disconnect() {},
					start(time) { window.audio.starts.push(time); },
					stop(time) { window.audio.stops.push(time); },
				};
			}
			createGain() {
				return {
					gain: {
						setValueAtTime(value) { window.audio.gains.push(value); },
						linearRampToValueAtTime(value) { window.audio.gains.push(value); },
					},
					connect() {}, disconnect() {},
				};
			}
		};
	}, { saved });
	const page = await context.newPage();
	const errors = [];
	page.on('pageerror', error => errors.push(error.message));
	t.after(() => assert.deepEqual(errors, []));
	let snapshot = { v: 1, conversationId: 'synthetic', messages: [], settlements: [] };
	let sequence = 0;
	let mark;
	let duplicate = false;
	let hold;
	let release;
	if (unsettled) hold = new Promise(resolve => { release = resolve; });
	function addReply(kind, pending = false) {
		const id = `s${++sequence}`;
		snapshot.messages.push({ id: `${id}:user`, role: 'user', display: 'visible', submissionId: id,
			parts: [{ type: 'text', text: 'How does photosynthesis store energy?', state: 'done' }] });
		if (!pending) {
			snapshot.messages.push({ id: `${id}:assistant`, role: 'assistant', display: 'visible', submissionId: id,
				parts: [{ type: 'text', text: 'What form of energy is stored in sugar?', state: 'done' },
					...(kind ? [{ type: 'data-reveal', data: { kind } }] : [])] });
			snapshot.settlements.push({ submissionId: id, outcome: 'completed' });
		}
		return id;
	}
	if (restored || unsettled) addReply(undefined, unsettled);
	await page.route('**/*', async route => {
		const url = new URL(route.request().url());
		if (url.origin !== origin) return route.abort();
		if (url.pathname === '/api/session') return route.fulfill({ json: { userId: 'guest-sound-test', aliases: [], kind: 'guest' } });
		if (!url.pathname.startsWith('/api/agents/chat/')) return route.continue();
		if (route.request().method() === 'POST') {
			const body = route.request().postDataJSON();
			assert.equal(body.body, 'How does photosynthesis store energy?');
			return route.fulfill({ json: { submissionId: addReply(mark) } });
		}
		if (url.pathname.endsWith('/events')) {
			if (hold) await hold;
			if (unsettled && !snapshot.settlements.length) {
				const id = 's1';
				snapshot.messages.push({ id: `${id}:assistant`, role: 'assistant', display: 'visible', submissionId: id,
					parts: [{ type: 'text', text: 'Recovered reply.', state: 'done' }] });
				snapshot.settlements.push({ submissionId: id, outcome: 'completed' });
			}
			const event = `data: ${JSON.stringify({ type: 'conversation-reset', snapshot })}\n\n`;
			return route.fulfill({ contentType: 'text/event-stream', body: event.repeat(duplicate ? 2 : 1) });
		}
		return route.fulfill({ json: snapshot });
	});
	await page.goto(origin);
	await page.waitForFunction(() => document.querySelector('#sound-toggle')?.textContent === 'Sound on'
		|| document.querySelector('#message')?.disabled === false);
	if (unsettled) {
		await page.locator('#peek-handle').click();
		release();
	}
	const toggle = page.locator('#sound-toggle');
	async function enable() {
		await page.locator('#peek-handle').click();
		await toggle.click();
		assert.equal(await toggle.getAttribute('aria-pressed'), 'true');
		await page.keyboard.press('Escape');
	}
	async function send(kind, { repeat = false, paused = false, synthetic = false } = {}) {
		mark = kind;
		duplicate = repeat;
		if (paused) hold = new Promise(resolve => { release = resolve; });
		await page.locator('#message').fill('How does photosynthesis store energy?');
		if (synthetic) await page.locator('#chat').evaluate(form => form.requestSubmit());
		else await page.locator('.composer-send button[type="submit"]').click();
		if (!paused) await settled();
	}
	async function settled() {
		await page.waitForFunction(() => document.querySelector('#active-turn .turn.assistant') && !document.querySelector('#message').disabled);
		await page.evaluate(() => new Promise(requestAnimationFrame));
	}
	return { page, toggle, enable, send, settled, release: () => release(),
		starts: () => page.evaluate(() => window.audio.starts.length) };
}

test('Sound defaults off and the plain menu toggle saves its state', async t => {
	const ui = await setup(t);
	assert.equal(await ui.toggle.getAttribute('aria-pressed'), 'false');
	assert.equal(await ui.starts(), 0);
	assert.equal(await ui.page.evaluate(() => window.audio.contexts), 0);
	await ui.enable();
	await ui.page.reload();
	await ui.page.waitForFunction(() => document.querySelector('#message')?.disabled === false);
	assert.equal(await ui.toggle.getAttribute('aria-pressed'), 'true');
	assert.equal(await ui.starts(), 0);
	await ui.page.locator('#peek-handle').click();
	await ui.toggle.click();
	await ui.page.reload();
	assert.equal(await ui.toggle.getAttribute('aria-pressed'), 'false');
});

test('saved Sound on requires a user gesture before audio can start', async t => {
	const ui = await setup(t, { saved: true });
	await ui.page.evaluate(() => {
		document.dispatchEvent(new MouseEvent('click', { bubbles: true }));
		document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
	});
	await ui.send(undefined, { synthetic: true });
	assert.equal(await ui.starts(), 0);
	await ui.send();
	assert.equal(await ui.starts(), 1);
});

test('one fresh reply ticks only after completion, quietly and briefly', async t => {
	const ui = await setup(t);
	await ui.enable();
	await ui.send(undefined, { paused: true });
	assert.equal(await ui.starts(), 0);
	ui.release();
	await ui.settled();
	assert.equal(await ui.starts(), 1);
	const audio = await ui.page.evaluate(() => window.audio);
	assert.ok(Math.max(...audio.gains) <= 0.025);
	assert.ok(audio.stops[0] - audio.starts[0] <= 0.06);
});

test('marked assistance stays silent for hints and supplied answers', async t => {
	const ui = await setup(t);
	await ui.enable();
	for (const kind of ['hint', 'full_answer', 'partial', 'worked_example']) {
		await ui.send(kind);
		assert.equal(await ui.starts(), 0, kind);
	}
});

test('restored history and recovered completion stay silent', async t => {
	for (const unsettled of [false, true]) {
		const ui = await setup(t, { saved: true, restored: !unsettled, unsettled });
		await ui.settled();
		await ui.page.keyboard.press('Tab');
		assert.equal(await ui.starts(), 0);
	}
});

test('Sound off stays silent, including when turned off during a reply', async t => {
	const ui = await setup(t);
	await ui.send();
	assert.equal(await ui.starts(), 0);
	await ui.enable();
	await ui.send(undefined, { paused: true });
	await ui.page.locator('#peek-handle').click();
	await ui.toggle.click();
	ui.release();
	await ui.settled();
	assert.equal(await ui.starts(), 0);
});

test('reduced motion stays silent even when changed during a reply', async t => {
	const ui = await setup(t);
	await ui.enable();
	await ui.send(undefined, { paused: true });
	await ui.page.emulateMedia({ reducedMotion: 'reduce' });
	ui.release();
	await ui.settled();
	assert.equal(await ui.starts(), 0);
});

test('duplicate completion delivery produces one tick total', async t => {
	const ui = await setup(t);
	await ui.enable();
	await ui.send(undefined, { repeat: true });
	assert.equal(await ui.starts(), 1);
	await ui.page.evaluate(async wirePath => {
		const { mountSoundCues } = await import('/sound-cues.ts');
		const { replyFrom } = await import('/@fs' + wirePath);
		const id = localStorage.getItem('socratink-chat-conversation-id');
		const history = await (await fetch(`/api/agents/chat/${encodeURIComponent(id)}`)).json();
		const submissionId = history.settlements.at(-1).submissionId;
		const reply = { ...replyFrom(history, submissionId), submissionId };
		const probe = mountSoundCues(document.createElement('button'));
		window.completeSoundProbe = () => {
			probe.beginReply();
			probe.complete(reply);
			probe.complete(reply);
		};
	}, new URL('../src/config/chat-wire.ts', import.meta.url).pathname);
	await ui.page.keyboard.press('Tab');
	await ui.page.evaluate(() => window.completeSoundProbe());
	assert.equal(await ui.starts(), 2);
});
