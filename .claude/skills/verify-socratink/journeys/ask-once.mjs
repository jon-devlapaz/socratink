#!/usr/bin/env node
// Feature: ask-once. Origin: #163.
// A reply whose text ends on a question and then calls present_question with
// that question shows it once: on the card. The text keeps its feedback,
// after the reply settles and after a reload. Scripted model only (ASKTWICE).
import assert from 'node:assert/strict';
import { journey, send, waitForReply } from '../learner.mjs';

const textQuestion = 'Which half do you search after checking the middle?';
const cardQuestion = 'After checking the middle element, which half do you search next?';

await journey('ask-once', async ({ newLearner, model, record, shot }) => {
	for (const viewport of [{ width: 1440, height: 1080 }, { width: 390, height: 844 }]) {
		const size = `${viewport.width}x${viewport.height}`;
		const learner = await newLearner({ viewport });
		const tab = await learner.newTab();
		await model.hold();
		await send(tab, 'ASKTWICE Teach me binary search.');
		await tab.locator('#active-turn .turn.pending .turn-markdown').filter({ hasText: /\S/ }).waitFor();
		await shot(tab, `${size}-streaming`);
		await model.release();
		await waitForReply(tab);
		await tab.getByText(cardQuestion).first().waitFor();
		await tab.waitForTimeout(300);
		await shot(tab, `${size}-settled`);
		const settled = await tab.locator('#active-turn').innerText();
		await tab.reload();
		await tab.getByText(cardQuestion).first().waitFor();
		await shot(tab, `${size}-reloaded`);
		const reloaded = await tab.locator('#active-turn').innerText();
		record(size, { settled, reloaded });
		for (const [name, text] of [['settled', settled], ['reloaded', reloaded]]) {
			assert.ok(text.includes('Each check halves the list.'), `${size} ${name}: the feedback stays`);
			assert.ok(!text.includes(textQuestion), `${size} ${name}: the text does not ask the card's question again`);
			assert.ok(text.includes(cardQuestion), `${size} ${name}: the card asks it`);
		}
	}
});
