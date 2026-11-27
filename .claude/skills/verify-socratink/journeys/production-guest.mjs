#!/usr/bin/env node
import assert from 'node:assert/strict';
import { journey, send, waitForReply } from '../learner.mjs';

const lesson = 'Quiz me with one multiple-choice question card about why Earth has seasons. Give me four choices and wait for my answer. If I press “I don’t know”, give me one short hint without giving away the answer. I want to try the same card myself.';
const reasoning = 'Earth’s tilt changes the sunlight angle and the length of the day.';
const card = page => page.locator('#active-turn').getByRole('form', { name: 'Questions', exact: true });
const unknown = page => card(page).getByRole('button', { name: "I don't know", exact: true });
const hint = page => page.locator('#active-turn .turn.assistant .reveal-mark').filter({ hasText: /^Hint from Socratink$/u });

async function questionOn(page) {
	await unknown(page).waitFor({ timeout: 60_000 });
	const rows = card(page).locator('label').filter({ has: page.getByRole('radio') });
	return { prompt: await card(page).locator('legend').innerText(), choices: await rows.allTextContents() };
}

async function openSignInMenu(page) {
	await page.getByRole('button', { name: 'Open menu', exact: true }).click();
	const link = page.getByRole('link', { name: 'Sign in', exact: true });
	await link.waitFor();
	return link;
}

await journey('production-guest', async ({ learner, record, shot }) => {
	const page = await learner.newTab();
	await page.getByRole('heading', { name: 'Make the thinking your own.', exact: true }).waitFor();
	await openSignInMenu(page);
	await shot(page, 'fresh-guest-menu');
	await page.keyboard.press('Escape');

	await send(page, lesson);
	const original = await questionOn(page);
	assert.equal(original.choices.length, 4);
	await shot(page, 'original-card');
	const returnTab = await learner.newTab();
	assert.deepEqual(await questionOn(returnTab), original, 'a new tab resumes the same card');
	const signIn = await openSignInMenu(returnTab);
	await shot(returnTab, 'returning-guest-menu');
	await signIn.click();
	await returnTab.getByRole('heading', { name: 'Sign in', exact: true }).waitFor();
	await returnTab.close();
	record('returningGuest', { resumedSameCard: true, signInPageOpened: true });

	await unknown(page).click();
	const consent = page.getByText(/^I can show a (full answer|worked example)\.$/u);
	const partial = page.getByText('Partial explanation from Socratink', { exact: true });
	await hint(page).or(consent).or(partial).first().waitFor({ timeout: 60_000 });
	assert.ok(await hint(page).isVisible(), 'this trial needs a hint to check whether the original card remains available');
	assert.deepEqual(await questionOn(page), original);
	await page.reload();
	await hint(page).waitFor();
	assert.deepEqual(await questionOn(page), original);
	await shot(page, 'hint-and-card-after-reload');
	record('card', { original, sameCardAfterHintAndReload: true });

	const option = card(page).getByRole('radio', { name: /axial tilt|axis.*tilt|tilt.*axis/iu }).first();
	const row = option.locator('..');
	const choice = await row.locator('.questionnaire-choice-label').innerText();
	await row.click();
	assert.ok(await option.isChecked());
	await card(page).getByRole('textbox', { name: 'Your reasoning', exact: true }).fill(reasoning);
	await card(page).getByRole('button', { name: 'Submit', exact: true }).click();
	const answer = page.locator('#active-turn .turn.you').filter({ hasText: reasoning });
	await answer.waitFor();
	assert.ok((await answer.innerText()).includes(choice));
	await shot(page, 'answer-submitted');
	const reply = await waitForReply(page, { after: reasoning });
	await shot(page, 'reply-to-card-answer');
	record('answer', { choice, reasoning, reply });
}, { production: true });
