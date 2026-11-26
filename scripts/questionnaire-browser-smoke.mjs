import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { assertHelpLayout } from './reveal-browser-layout.mjs';
import { formatSteeringMessage } from '../src/ui/steering.ts';
import { namespacedConversationId } from '../src/config/session.ts';
import { appConfig } from '../src/config/app.config.ts';
import { questionnaireFromPresentQuestion } from '../src/questionnaire.ts';

// Failures: restored legacy fields disappear; validation or keyboard input
// breaks; skip leaks an earlier selection; submitted text loses reasoning;
// a card offers no way to ask for help instead of guessing; the learner turn
// shows the protocol header or the question instead of the learner's answer;
// Tab or Shift+Tab reaches the composer that the card hides (#120).
export async function verifyQuestionnaireBrowser({ browser, origin, session, out }) {
	await mkdir(out, { recursive: true });
	const results = [];
	for (const width of [375, 390, 1280]) {
		for (const kind of ['required', 'skip', 'multiple', 'hint', 'unknown']) {
			const largeDarkHint = kind === 'hint' && width === 375;
			const context = await browser.newContext({ reducedMotion: 'reduce', colorScheme: largeDarkHint ? 'dark' : 'light', viewport: { width, height: 900 } });
			if (largeDarkHint) await context.addInitScript(key => localStorage.setItem(key, 'big'), appConfig.typeSizeStorageKey);
			await context.tracing.start({ screenshots: true, snapshots: true });
			const page = await context.newPage();
			page.setDefaultTimeout(5_000);
			const errors = [];
			page.on('pageerror', error => errors.push(error.message));
			const sent = [];
			const definition = legacyQuestion(kind);
			await context.route('**/*', route => respond(route, { origin, session, definition, sent, nextCard: kind === 'hint' }));
			try {
				await page.goto(origin);
				const form = page.locator('#active-turn .questionnaire');
				await form.waitFor();
				assert.equal(await form.getAttribute('aria-label'), kind === 'multiple' ? 'Quiz' : 'Questions');
				assert.equal(await form.getByText('Saved card context', { exact: true }).count(), 1);
				assert.equal(await form.getByText('First saved choice', { exact: true }).count(), 1);
				assert.equal(await form.getByRole('button', { name: 'Previous', exact: true }).isVisible(), false);
				assert.equal(await form.getByRole('button', { name: 'Next', exact: true }).isVisible(), false);
				assert.equal(await form.getByRole('button', { name: 'Hint', exact: true }).isVisible(), true);
				assert.equal(await form.getByRole('button', { name: "I don't know", exact: true }).isVisible(), true);
				await page.waitForFunction(() => getComputedStyle(document.querySelector('.dock')).opacity === '0');
				for (const key of ['Tab', 'Shift+Tab']) {
					await form.locator('fieldset').focus();
					for (let press = 0; press < 20; press += 1) {
						await page.keyboard.press(key);
						assert.equal(await page.evaluate(() => Boolean(document.activeElement?.closest('.dock'))), false,
							`${key} must not focus the hidden composer`);
					}
				}
				if (kind === 'required') {
					await form.getByRole('button', { name: 'Continue', exact: true }).click();
					assert.equal(await form.locator('[aria-invalid="true"]').count(), 1);
					assert.deepEqual(sent, []);
				}
				await form.locator('fieldset').focus();
				await page.keyboard.press('Control+a');
				assert.equal(await form.locator('[data-choice-for][aria-checked="true"]').count(), 0, 'browser commands keep their normal meaning');
				await page.keyboard.press('a');
				assert.equal(await form.getByRole(kind === 'multiple' ? 'checkbox' : 'radio', { name: /First/ }).isChecked(), true);
				assert.equal(await form.locator('[aria-invalid="true"]').count(), 0);
				if (kind === 'multiple') {
					await page.keyboard.press('b');
					assert.equal(await form.locator('[data-choice-for][aria-checked="true"]').count(), 2);
				}
				assert.deepEqual(sent, [], 'ordinary choices still require submission');
				const field = form.getByRole('textbox', { name: 'Your reason', exact: true });
				let reasoning = 'My own reasoning';
				if (kind === 'required' && width === 375) {
					reasoning = await writePhoneReasoning(field);
					assert.equal(await form.getByRole('radio', { name: /First/ }).isChecked(), true, 'typing leaves the selected choice intact');
					assert.deepEqual(sent, [], 'typing and confirming composition must not submit');
				} else await field.fill(reasoning);
				if (kind === 'skip') await form.getByRole('button', { name: 'Skip', exact: true }).click();
				assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
				await page.screenshot({ path: `${out}/${kind}-${width}.png` });
				if (kind === 'required') await field.press('Enter');
				else if (kind in help) await form.getByRole('button', { name: help[kind].button, exact: true }).click();
				else await form.getByRole('button', { name: 'Continue', exact: true }).click();
				const reply = page.getByText(kind === 'hint' ? hintClue : 'Recorded reply', { exact: true });
				await reply.waitFor();
				const answer = kind in help ? help[kind].answer : kind === 'skip' ? 'Skipped.'
					: `${kind === 'multiple' ? 'First, Second' : 'First'}, ${reasoning}`;
				const expected = { kind: 'user', body: `Questionnaire answers:\n- Saved question?: ${answer}` };
				if (kind in help) {
					expected.cardHelp = { kind, sourceId: 'original-card' };
					const action = page.locator('#active-turn .you p.turn-action');
					assert.equal(await action.innerText(), help[kind].label);
					if (kind === 'hint') await assertCardDraft(form, ['first'], 'My own reasoning');
					await page.reload();
					await reply.waitFor();
					assert.equal(await action.innerText(), help[kind].label);
				} else {
					assert.equal(await page.locator('#active-turn .you p').innerText(), answer);
				}
				if (kind === 'hint') {
					assert.equal(await page.locator('#active-turn .reveal-mark').innerText(), 'Hint from Socratink');
					await assertHelpLayout(page.locator('#active-turn .reveal-copy'));
					assert.equal(await form.locator('legend').innerText(), definition.items[0].prompt);
					assert.equal(await form.getByRole('radio', { name: /First/ }).isEnabled(), true);
					await assertCardDraft(form, ['first'], 'My own reasoning');
				}
				assert.deepEqual(sent, [expected]);
				if (kind === 'hint' && width === 375) {
					await form.getByRole('radio', { name: /Second/ }).click();
					await form.getByLabel('Your reason').fill('My revised reasoning');
					await form.getByRole('button', { name: 'Hint', exact: true }).click();
					await page.locator('#trail-toggle').click();
					assert.equal(await page.locator('.history-turn.you.turn-action p').innerText(), help.hint.label);
					assert.deepEqual(sent[1], { ...expected, cardHelp: { kind: 'hint', sourceId: 'saved-card-answer-1' } });
					await page.locator('#trail-toggle').click();
					await assertCardDraft(form, ['second'], 'My revised reasoning');
					const nextPost = page.waitForRequest(req => req.method() === 'POST');
					await form.getByRole('button', { name: 'Hint', exact: true }).click();
					assert.deepEqual((await nextPost).postDataJSON(), { ...expected, cardHelp: { kind: 'hint', sourceId: 'saved-card-answer-2' } });
					await form.getByRole('button', { name: 'Continue', exact: true }).click();
					await page.getByText('Recorded reply', { exact: true }).waitFor();
					assert.deepEqual(sent[3], { kind: 'user', body: 'Questionnaire answers:\n- Saved question?: Second, My revised reasoning' });
					await assertCardDraft(form, [], '');
				}
				assert.deepEqual(errors, []);
				results.push({ kind, width, passed: true, submitted: sent[0] });
			} catch (error) {
				results.push({ kind, width, passed: false, error: error.message });
				await page.screenshot({ path: `${out}/${kind}-${width}-failure.png` }).catch(() => {});
				throw error;
			} finally {
				await writeFile(`${out}/proof.json`, `${JSON.stringify(results, null, 2)}\n`);
				try {
					await context.tracing.stop({ path: `${out}/${kind}-${width}-trace.zip` });
				} finally {
					await context.close();
				}
			}
		}
	}
	for (const width of [375, 390, 1280]) {
		for (const choice of ['See it', 'Try once more']) {
			for (const activation of ['click', 'Enter', 'Space']) {
				const context = await browser.newContext({ viewport: { width, height: 900 } });
				const page = await context.newPage();
				page.setDefaultTimeout(5_000);
				const sent = [];
				const definition = { ...questionnaireFromPresentQuestion({
					prompt: 'I can show a full answer.', choices: ['See it', 'Try once more'],
				}), kind: 'reveal-consent' };
				await context.route('**/*', route => respond(route, { origin, session, definition, sent }));
				try {
					await page.goto(origin);
					const form = page.locator('#active-turn .questionnaire');
					await form.waitFor();
					assert.deepEqual(await form.getByRole('button').allTextContents(), ['See it', 'Try once more']);
					assert.equal(await form.locator('input, textarea').count(), 0);
					const button = form.getByRole('button', { name: choice, exact: true });
					await button.focus();
					assert.equal(await button.evaluate(node => document.activeElement === node && node.tabIndex === 0), true);
					if (activation === 'click') await button.click();
					else await button.press(activation);
					await page.getByText('Recorded reply', { exact: true }).waitFor();
					assert.deepEqual(sent, [{ kind: 'user', body: `Questionnaire answers:\n- I can show a full answer.: ${choice}` }]);
					results.push({ kind: 'reveal-consent', width, choice, activation, passed: true });
				} finally {
					await writeFile(`${out}/proof.json`, `${JSON.stringify(results, null, 2)}\n`);
					await context.close();
				}
			}
		}
	}
	await verifyHelpOrigin(browser, origin, session);
	await verifyPendingHintDraft(browser, origin, session);
	await verifySteeringDraft(browser, origin, session);
	console.log('Questionnaire browser passed: restored required, skipped and multiple-choice cards; hint and I don\'t know; shortcuts, reasoning, Enter, validation and narrow/wide screens; consent choices by click, Enter and Space.');
}

const hintClue = 'Try one example first.';
const help = {
	hint: { button: 'Hint', answer: 'Asked for a hint.', label: 'You asked for a hint' },
	unknown: { button: "I don't know", answer: "I don't know.", label: 'You selected “I don’t know”' },
};

async function writePhoneReasoning(field) {
	const firstLine = 'I predict the reading stays the same. The jar is closed, so the water and the trapped air are still on the scale.';
	await field.pressSequentially(firstLine);
	const fits = await field.evaluate(node => node.scrollWidth === node.clientWidth && node.scrollHeight === node.clientHeight);
	assert.equal(fits, true, 'the full explanation must be readable without scrolling the field');
	for (const composition of [{ isComposing: true }, { keyCode: 229 }]) {
		await field.dispatchEvent('keydown', { key: 'Enter', ...composition });
	}
	await field.press('Shift+Enter');
	await field.pressSequentially('Both stay inside.');
	const text = `${firstLine}\nBoth stay inside.`;
	assert.equal(await field.inputValue(), text);
	return text;
}

async function assertCardDraft(form, values, reason) {
	const checked = await form.locator('[data-choice-for][aria-checked="true"]').evaluateAll(nodes => nodes.map(node => node.value));
	assert.deepEqual(checked.sort(), [...values].sort());
	assert.equal(await form.getByLabel('Your reason', { exact: true }).inputValue(), reason);
}

async function verifyPendingHintDraft(browser, origin, session) {
	const context = await browser.newContext({ viewport: { width: 375, height: 667 }, reducedMotion: 'reduce' });
	await context.addInitScript(key => localStorage.setItem(key, 'big'), appConfig.typeSizeStorageKey);
	const { promise: waitForClue, resolve: showClue } = Promise.withResolvers();
	try {
		const page = await context.newPage();
		page.setDefaultTimeout(5_000);
		const definition = legacyQuestion('multiple');
		definition.items[0].description = 'Compare what crosses the boundary of the jar with what stays inside. Explain how each choice would change the scale reading.';
		definition.items[0].choices.push({ value: 'third', label: 'Third' });
		const sent = [];
		let pending = true;
		await context.route('**/*', async route => {
			if (new URL(route.request().url()).pathname.endsWith('/events')) await waitForClue;
			await respond(route, { origin, session, definition, sent, pending });
		});
		await page.goto(origin);
		const form = page.locator('#active-turn .questionnaire');
		await form.getByRole('checkbox', { name: /First/ }).click();
		await form.getByRole('checkbox', { name: /Second/ }).click();
		await form.getByLabel('Your reason').fill('I am comparing two choices.');
		const reading = () => page.waitForRequest(req => new URL(req.url()).pathname.endsWith('/events'));
		const firstRead = reading();
		await form.getByRole('button', { name: 'Hint', exact: true }).click();
		await firstRead;
		const restoredRead = reading();
		await page.reload({ waitUntil: 'domcontentloaded' });
		await restoredRead;
		pending = false;
		showClue();
		await page.getByText(hintClue, { exact: true }).waitFor();
		await assertCardDraft(form, ['first', 'second'], 'I am comparing two choices.');
		const scroller = page.locator('.active-scroll');
		await scroller.evaluate(node => node.scrollTo(0, 0));
		await page.waitForFunction(() => document.querySelector('.active-scroll').classList.contains('is-fading-bottom'));
		const mask = await scroller.evaluate(node => getComputedStyle(node).maskImage);
		assert.doesNotMatch(mask, /(?:transparent|rgba\(0, 0, 0, 0\)) 100%\)$/, 'enabled question actions keep their ink at the lower scroll edge');
		assert.deepEqual(sent, [{ kind: 'user', body: 'Questionnaire answers:\n- Saved question?: Asked for a hint.',
			cardHelp: { kind: 'hint', sourceId: 'original-card' } }]);
	} finally {
		showClue();
		await context.close();
	}
}

async function verifySteeringDraft(browser, origin, session) {
	const reason = 'I still think the second choice fits.';
	const steering = { kind: 'user', body: formatSteeringMessage('try-unaided') };
	for (const scenario of ['same question', 'different question', 'failed', 'not-admitted']) {
		const context = await browser.newContext({ viewport: { width: 375, height: 667 }, reducedMotion: 'reduce' });
		const { promise, resolve } = Promise.withResolvers();
		try {
			const page = await context.newPage();
			page.setDefaultTimeout(5_000);
			const definition = legacyQuestion('required');
			const nextQuestion = structuredClone(definition);
			const different = scenario === 'different question';
			if (different) nextQuestion.items[0].prompt = 'Another question?';
			const failed = scenario === 'failed' || scenario === 'not-admitted';
			let pending = scenario === 'same question';
			let learner = session;
			const original = namespacedConversationId(session.userId, 'original-lesson');
			const otherLesson = namespacedConversationId(session.userId, 'another-lesson');
			await context.addInitScript(({ key, id }) => {
				if (!localStorage.getItem(key)) localStorage.setItem(key, id);
			}, { key: appConfig.chatConversationStorageKey, id: original });
			const sent = [];
			await context.route('**/*', async route => {
				const { pathname } = new URL(route.request().url());
				if (pathname === appConfig.conversationsPath) return route.fulfill({ json: { conversations: [
					{ id: original, title: 'First lesson', updatedAt: '2026-11-25' },
					{ id: otherLesson, title: 'Second lesson', updatedAt: '2026-11-24' },
				] } });
				if (pending && sent.length === 2 && pathname.endsWith('/events')) await promise;
				return respond(route, { origin, session: learner, definition, sent, nextQuestion,
					pending: pending && sent.length === 2, failure: failed ? scenario : undefined, failAt: 2 });
			});
			await page.goto(origin);
			const form = page.locator('#active-turn .questionnaire');
			await form.getByRole('radio', { name: /Second/ }).click();
			await form.getByLabel('Your reason').fill(reason);
			await form.getByRole('button', { name: 'Hint', exact: true }).click();
			await page.getByText(hintClue, { exact: true }).waitFor();
			const events = () => page.waitForRequest(req => new URL(req.url()).pathname.endsWith('/events'));
			const event = pending && events();
			await form.getByRole('button', { name: 'More options' }).click();
			await page.getByRole('menuitem', { name: 'Try on my own' }).click();
			if (pending) {
				await event;
				const resumed = events();
				await page.reload({ waitUntil: 'domcontentloaded' });
				await resumed;
				pending = false;
				resolve();
			}
			if (failed) await page.getByRole('button', { name: 'Retry', exact: true }).click();
			const reply = page.getByText('Recorded reply', { exact: true });
			await reply.waitFor();
			assert.deepEqual(sent[0], { kind: 'user', body: 'Questionnaire answers:\n- Saved question?: Asked for a hint.',
				cardHelp: { kind: 'hint', sourceId: 'original-card' } });
			assert.deepEqual(sent.slice(1), failed ? [steering, steering] : [steering]);
			for (const reload of [false, true]) {
				if (reload) await page.reload();
				await form.waitFor();
				assert.equal(await form.locator('legend').innerText(), nextQuestion.items[0].prompt);
				await assertCardDraft(form, different ? [] : ['second'], different ? '' : reason);
				await page.locator('#trail-toggle').click();
				await page.locator('.history-turn .reveal-mark').filter({ hasText: 'Hint from Socratink' }).waitFor();
				const saved = page.getByRole('complementary', { name: 'Unsent draft in this tab' });
				if (different) {
					await saved.getByText(reason, { exact: true }).waitFor();
					assert.equal(await saved.getByText('Second', { exact: true }).count(), 1);
					assert.equal(await saved.locator('..').locator('.history-question').innerText(), definition.items[0].prompt);
				} else assert.equal(await saved.count(), 0);
				await page.locator('#trail-toggle').click();
			}
			if (different) {
				await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin });
				await page.locator('#trail-toggle').click();
				const selected = await page.evaluate(reason => {
					const words = [...document.querySelectorAll('.history-draft p')].find(node => node.textContent === reason).firstChild;
					const tutor = document.querySelector('#active-turn .turn.assistant .turn-markdown p').firstChild;
					const selection = getSelection();
					selection.setBaseAndExtent(tutor, tutor.length, words, 0);
					return selection.toString();
				}, reason);
				assert.ok(selected.includes(reason));
				await form.getByRole('button', { name: 'More options' }).click();
				await page.getByRole('menuitem', { name: 'Copy this turn' }).click();
				assert.equal(await page.evaluate(() => navigator.clipboard.readText()), 'Recorded reply');
				await form.getByLabel('Your reason').fill('New answer');
				await page.reload();
				await assertCardDraft(form, [], 'New answer');
				const switchLesson = async (tab, name) => {
					await tab.locator('#menu-trigger').click();
					await tab.getByRole('button', { name: 'History', exact: true }).click();
					await tab.getByRole('button', { name: new RegExp(name) }).click();
					await tab.locator('#active-turn .questionnaire').waitFor();
				};
				await switchLesson(page, 'Second lesson');
				await assertCardDraft(form, [], '');
				const [otherTab] = await Promise.all([
					page.waitForEvent('popup'), page.evaluate(() => { window.open(location.href); }),
				]);
				await switchLesson(otherTab, 'First lesson');
				await otherTab.locator('#trail-toggle').click();
				assert.equal(await otherTab.getByText(reason, { exact: true }).count(), 0);
				await assertCardDraft(otherTab.locator('#active-turn .questionnaire'), [], '');
				await otherTab.close();
				await form.waitFor();
				await assertCardDraft(form, [], 'New answer');
				await page.locator('#trail-toggle').click();
				await page.getByText(reason, { exact: true }).waitFor();
				learner = { userId: 'a-different-learner' };
				await page.reload();
				await form.waitFor();
				await assertCardDraft(form, [], '');
				await page.locator('#trail-toggle').click();
				assert.equal(await page.getByText(reason, { exact: true }).count(), 0);
			} else {
				await form.getByRole('radio', { name: /First/ }).click();
				await form.getByLabel('Your reason').fill('My revision.');
				await form.getByRole('button', { name: 'Continue', exact: true }).click();
				await page.getByText('First, My revision.', { exact: true }).waitFor();
				assert.deepEqual(sent.at(-1), { kind: 'user', body: 'Questionnaire answers:\n- Saved question?: First, My revision.' });
			}
		} finally {
			resolve();
			await context.close();
		}
	}
}

async function verifyHelpOrigin(browser, origin, session) {
	for (const { kind, failure, edit } of [
		{ kind: 'hint' },
		{ kind: 'unknown' },
		{ kind: 'hint', failure: 'failed' },
		{ kind: 'unknown', failure: 'not-admitted' },
		{ kind: 'hint', failure: 'not-admitted', edit: 'My own explanation.' },
	]) {
		const context = await browser.newContext({ viewport: { width: 375, height: 667 }, reducedMotion: 'reduce' });
		try {
			const page = await context.newPage();
			page.setDefaultTimeout(5_000);
			const sent = [];
			const definition = legacyQuestion('required');
			await context.route('**/*', route => respond(route, { origin, session, definition, sent, failure }));
			await page.goto(origin);
			const form = page.locator('#active-turn .questionnaire');
			const { button, answer, label } = help[kind];
			const cardHelp = { kind, sourceId: 'original-card' };
			const body = `Questionnaire answers:\n- Saved question?: ${answer}`;
			if (failure) {
				if (kind === 'hint') {
					await form.getByRole('radio', { name: /First/ }).click();
					await form.getByLabel('Your reason').fill('Still thinking about the first choice.');
				}
				await form.getByRole('button', { name: button, exact: true }).click();
				const retry = page.getByRole('button', { name: 'Retry', exact: true });
				await retry.waitFor();
				if (edit) await page.locator('#message').fill(edit);
				await retry.click();
				assert.deepEqual(sent[0], { kind: 'user', body, cardHelp });
			} else {
				await form.getByLabel('Your reason', { exact: true }).fill(answer);
				await form.getByRole('button', { name: 'Continue', exact: true }).click();
			}
			const marked = Boolean(failure && !edit);
			const reply = page.getByText(marked && kind === 'hint' ? hintClue : 'Recorded reply', { exact: true });
			await reply.waitFor();
			if (marked && kind === 'hint') await assertCardDraft(form, ['first'], 'Still thinking about the first choice.');
			assert.equal(sent.length, failure ? 2 : 1);
			assert.deepEqual(sent.at(-1), { kind: 'user', body: edit ?? body, ...(marked && { cardHelp }) });
			const learner = page.locator('#active-turn .you p');
			assert.equal(await learner.innerText(), marked ? label : edit ?? answer);
			await page.reload();
			await reply.waitFor();
			assert.equal(await learner.innerText(), marked ? label : edit ?? answer);
		} finally {
			await context.close();
		}
	}
}

function legacyQuestion(kind) {
	return {
		kind: kind === 'multiple' ? 'quiz' : 'question', submitLabel: 'Continue', items: [{
			name: 'saved', prompt: 'Saved question?', description: 'Saved card context',
			required: kind === 'required' || kind in help, multiple: kind === 'multiple',
			choices: [
				{ value: 'first', label: 'First', description: 'First saved choice', shortcut: 'a' },
				{ value: 'second', label: 'Second', shortcut: 'b' },
			],
			input: { label: 'Your reason', placeholder: 'Saved placeholder' },
		}],
	};
}

async function respond(route, { origin, session, definition, sent, failure, failAt = 1, nextCard, nextQuestion, pending }) {
	const url = new URL(route.request().url());
	if (url.origin !== origin) return route.abort();
	if (!url.pathname.startsWith('/api/')) return route.continue();
	const json = (body, status = 200, headers = {}) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body), headers });
	if (url.pathname === appConfig.sessionPath) return json({ userId: session.userId, aliases: [], kind: 'registered' });
	if (url.pathname === appConfig.authProvidersPath) return json({ google: false, github: false });
	if (!url.pathname.startsWith(`${appConfig.chatAgentPath}/`)) throw new Error(`Unexpected API request: ${url.pathname}`);
	const posting = route.request().method() === 'POST';
	if (posting) sent.push(route.request().postDataJSON());
	const submissionId = `saved-card-answer-${sent.length}`;
	if (posting) {
		if (failure === 'not-admitted' && sent.length === failAt) return json({ error: { type: 'rejected', message: 'Admission rejected.' } }, 400);
		return json({ submissionId }, 202);
	}
	const card = { type: 'data-questionnaire', data: definition };
	const messages = [{ role: 'assistant', display: 'visible', submissionId: 'original-card', parts: [card] }];
	const settlements = [];
	for (const [index, input] of sent.entries()) {
		if (failure === 'not-admitted' && index + 1 === failAt) continue;
		const id = `saved-card-answer-${index + 1}`;
		messages.push({ role: 'user', display: 'visible', submissionId: id, parts: [{ type: 'text', text: input.body }],
			...(input.cardHelp && { metadata: { cardHelp: input.cardHelp } }) });
		if (pending && index === sent.length - 1) continue;
		const failed = failure === 'failed' && index + 1 === failAt;
		settlements.push({ submissionId: id, outcome: failed ? 'failed' : 'completed' });
		if (failed) continue;
		const item = definition.items[0];
		const reorderedCard = { ...card, data: { ...definition, items: [{ ...item, choices: [...item.choices].reverse() }] } };
		const followingCard = nextQuestion && input.body === formatSteeringMessage('try-unaided')
			? { ...card, data: nextQuestion } : nextCard && card;
		const reply = input.cardHelp?.kind === 'hint'
			? [{ type: 'text', text: hintClue }, { type: 'data-reveal', data: { kind: 'hint', target: item.prompt } }, reorderedCard]
			: [{ type: 'text', text: 'Recorded reply' }, ...(followingCard ? [followingCard] : [])];
		messages.push({ role: 'assistant', display: 'visible', submissionId: id, parts: reply });
	}
	if (url.pathname.endsWith('/events')) {
		const snapshot = { v: 1, conversationId: 'saved-card', messages, settlements };
		const frame = { type: 'conversation-reset', conversationId: 'saved-card', snapshot, position: { batch: 0, index: 0 } };
		return route.fulfill({ status: 200, contentType: 'text/event-stream', body: `data: ${JSON.stringify(frame)}\n\n` });
	}
	return json({ messages, settlements });
}
