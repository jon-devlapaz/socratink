#!/usr/bin/env node
// Feature: two-tabs (features/two-tabs.md). Origin: PRs #149 and #159.
// One learner, two tabs on the same conversation.
// Part 1: tab 1's reply is mid-stream when tab 2 sends. Tab 2 sees "Not sent" and Retry works;
//         tab 1 keeps only its own reply.
// Part 2: tab 1 loses its reply stream, its reply finishes unseen, and tab 2 starts the next
//         turn. When streams come back, tab 1 settles on its own reply and never shows tab 2's.
import assert from 'node:assert/strict';
import { journey, send, view, waitForReply } from '../learner.mjs';

const chatPost = (r) => r.request().method() === 'POST' && /\/api\/agents\/chat\/[^/]+$/.test(new URL(r.url()).pathname);
const liveText = (tab) => tab.locator('#active-turn .turn.pending .turn-markdown').filter({ hasText: /\S/ }).waitFor();

await journey('two-tabs', async ({ learner, model, network, record, shot }) => {
	if (!model) throw new Error('two-tabs needs the scripted provider to hold a reply mid-stream.');
	const first = await learner.newTab();
	await send(first, 'Why do tides happen?');
	await waitForReply(first);
	const second = await learner.newTab();
	assert.ok((await view(second)).activeTurn.includes('Why do tides happen?'), 'tab 2 opens the same conversation');

	// Part 1: one pending reply per conversation.
	await model.hold();
	await send(first, 'Because of the moon?');
	await liveText(first);
	const refused = second.waitForResponse(chatPost);
	await send(second, 'A question from tab 2');
	const status = (await refused).status();
	await second.locator('#active-turn .request-state').filter({ hasText: 'Not sent' }).waitFor();
	await shot(first, 'part1-tab1-streaming');
	await shot(second, 'part1-tab2-not-sent');
	record('part1', { tab2PostStatus: status, tab1: await view(first), tab2: await view(second) });
	assert.equal(status, 409, 'the server admits one pending reply per conversation');
	assert.equal((await view(first)).pending, true, 'tab 1 is still streaming its own reply');
	assert.equal((await view(first)).activeTurn.includes('A question from tab 2'), false, 'tab 1 never shows tab 2\'s message');

	await model.release();
	await waitForReply(first);
	await first.waitForTimeout(1_000);
	assert.equal((await view(first)).activeTurn.includes('A question from tab 2'), false, 'tab 1 keeps only its own turn');
	await second.locator('#active-turn .request-state').getByRole('button', { name: 'Retry' }).click();
	await waitForReply(second);
	await second.waitForTimeout(1_000);
	const retried = await view(second);
	await shot(second, 'part1-tab2-retried');
	record('part1Retry', retried);
	assert.ok(retried.activeTurn.includes('A question from tab 2'), 'tab 2 sends its message on Retry');
	assert.equal(retried.activeTurn.includes('Not sent'), false, 'the Not sent notice clears');

	// Part 2: a reconnect replay that carries another tab's turn.
	await first.reload();
	await first.locator('#message[placeholder]:enabled').waitFor();
	await model.hold();
	await send(first, 'Tab one follow up');
	await liveText(first);
	network.dropStreams();
	await model.release();
	await first.waitForTimeout(1_500);
	await model.hold();
	const admitted = second.waitForResponse(chatPost);
	await send(second, 'Tab two follow up');
	assert.equal((await admitted).status(), 202, 'tab 2 starts the next turn once tab 1\'s reply has finished');
	network.restoreStreams();
	await first.waitForTimeout(4_000);
	const tab1WhileTab2Held = await view(first);
	await shot(first, 'part2-tab1-after-replay');
	await shot(second, 'part2-tab2-held');
	record('part2', { tab1WhileTab2Held, tab2: await view(second) });
	assert.equal(tab1WhileTab2Held.pending, false, 'tab 1 settles on its own reply while tab 2\'s turn still runs');
	assert.ok(tab1WhileTab2Held.activeTurn.includes('Tab one follow up'), 'tab 1 shows its own turn');
	assert.equal(tab1WhileTab2Held.activeTurn.includes('Tab two follow up'), false, 'tab 1 does not show tab 2\'s message');

	await model.release();
	await waitForReply(second);
	await first.reload();
	await first.locator('#active-turn').getByText('Tab two follow up').waitFor();
	await shot(first, 'part2-tab1-reloaded');
	record('part2Reloaded', await view(first));
});
