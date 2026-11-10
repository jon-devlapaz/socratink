import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { appConfig } from '../src/config/app.config.ts';

// Failures: restored legacy fields disappear; validation or keyboard input
// breaks; skip leaks an earlier selection; submitted text loses reasoning.
export async function verifyQuestionnaireBrowser({ browser, origin, session, out }) {
	await mkdir(out, { recursive: true });
	const results = [];
	for (const width of [390, 1280]) {
		for (const kind of ['required', 'skip', 'multiple']) {
			const context = await browser.newContext({ reducedMotion: 'reduce', viewport: { width, height: 900 } });
			await context.tracing.start({ screenshots: true, snapshots: true });
			const page = await context.newPage();
			page.setDefaultTimeout(5_000);
			const errors = [];
			page.on('pageerror', error => errors.push(error.message));
			const sent = [];
			const definition = legacyQuestion(kind);
			await context.route('**/*', route => respond(route, { origin, session, definition, sent }));
			try {
				await page.goto(origin);
				const form = page.locator('#active-turn .questionnaire');
				await form.waitFor();
				assert.equal(await form.getAttribute('aria-label'), kind === 'multiple' ? 'Quiz' : 'Questions');
				assert.equal(await form.getByText('Saved card context', { exact: true }).count(), 1);
				assert.equal(await form.getByText('First saved choice', { exact: true }).count(), 1);
				assert.equal(await form.getByRole('button', { name: 'Previous', exact: true }).isVisible(), false);
				assert.equal(await form.getByRole('button', { name: 'Next', exact: true }).isVisible(), false);
				if (kind === 'required') {
					await form.getByRole('button', { name: 'Continue', exact: true }).click();
					assert.equal(await form.locator('[aria-invalid="true"]').count(), 1);
					assert.deepEqual(sent, []);
				}
				await form.locator('fieldset').focus();
				await page.keyboard.press('a');
				assert.equal(await form.locator('input[value="first"]').isChecked(), true);
				if (kind === 'multiple') {
					await page.keyboard.press('b');
					assert.equal(await form.locator('input:checked').count(), 2);
				}
				await form.getByLabel('Your reason', { exact: true }).fill('My own reasoning');
				if (kind === 'skip') await form.getByRole('button', { name: 'Skip', exact: true }).click();
				assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
				await page.screenshot({ path: `${out}/${kind}-${width}.png` });
				if (kind === 'required') await form.getByLabel('Your reason', { exact: true }).press('Enter');
				else await form.getByRole('button', { name: 'Continue', exact: true }).click();
				await page.getByText('Recorded reply', { exact: true }).waitFor();
				const answer = kind === 'skip' ? 'Skipped.' : `${kind === 'multiple' ? 'First, Second' : 'First'}, My own reasoning`;
				assert.deepEqual(sent, [`Questionnaire answers:\n- Saved question?: ${answer}`]);
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
	console.log('Questionnaire browser passed: restored required, skipped and multiple-choice cards; shortcuts, reasoning, Enter, validation and narrow/wide screens.');
}

function legacyQuestion(kind) {
	return {
		kind: kind === 'multiple' ? 'quiz' : 'question', submitLabel: 'Continue', items: [{
			name: 'saved', prompt: 'Saved question?', description: 'Saved card context',
			required: kind === 'required', multiple: kind === 'multiple',
			choices: [
				{ value: 'first', label: 'First', description: 'First saved choice', shortcut: 'a' },
				{ value: 'second', label: 'Second', shortcut: 'b' },
			],
			input: { label: 'Your reason', placeholder: 'Saved placeholder' },
		}],
	};
}

async function respond(route, { origin, session, definition, sent }) {
	const url = new URL(route.request().url());
	if (url.origin !== origin) return route.abort();
	if (!url.pathname.startsWith('/api/')) return route.continue();
	const json = (body, status = 200, headers = {}) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body), headers });
	if (url.pathname === appConfig.sessionPath) return json({ userId: session.userId, aliases: [], kind: 'registered' });
	if (url.pathname === appConfig.authProvidersPath) return json({ google: false, github: false });
	if (url.pathname === appConfig.chatRoutePath) return json({ kind: 'operator', openai: false, openrouter: false });
	if (!url.pathname.startsWith(`${appConfig.chatAgentPath}/`)) throw new Error(`Unexpected API request: ${url.pathname}`);
	const submissionId = 'saved-card-answer';
	if (route.request().method() === 'POST') {
		sent.push(route.request().postDataJSON().body);
		return json({ submissionId }, 202);
	}
	const messages = [{
		role: 'assistant', display: 'visible', submissionId,
		parts: sent.length ? [{ type: 'text', text: 'Recorded reply' }] : [{ type: 'data-questionnaire', data: definition }],
	}];
	if (url.pathname.endsWith('/events')) {
		const snapshot = { v: 1, conversationId: 'saved-card', offset: '0', messages, settlements: [{ submissionId, outcome: 'completed' }] };
		const frame = { type: 'conversation-reset', conversationId: 'saved-card', snapshot, position: { batch: 0, index: 0 } };
		return route.fulfill({ status: 200, contentType: 'text/event-stream', body: `data: ${JSON.stringify(frame)}\n\n` });
	}
	return json({ messages, settlements: [] });
}
