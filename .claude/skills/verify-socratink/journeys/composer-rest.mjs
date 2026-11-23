#!/usr/bin/env node
// Feature: composer-rest (features/composer-rest.md). Origin: PR #158.
// A short conversation rests just above the composer while the reply streams and
// after it settles, and nothing jumps when the reply finishes. Desktop and phone sizes.
import assert from 'node:assert/strict';
import { composerGap, journey, send, trackLastTurn, view, waitForReply } from '../learner.mjs';

const maxGapPx = 64;
const maxSettleJumpPx = 4;

await journey('composer-rest', async ({ newLearner, record, shot }) => {
	for (const viewport of [{ width: 1440, height: 1080 }, { width: 390, height: 844 }]) {
		const size = `${viewport.width}x${viewport.height}`;
		const learner = await newLearner({ viewport });
		const tab = await learner.newTab();
		await shot(tab, `${size}-empty`);
		assert.equal(await tab.locator('#message').getAttribute('placeholder'), 'What are you working on?');

		const frames = await trackLastTurn(tab);
		await send(tab, 'Why do tides happen?');
		await tab.locator('#active-turn .turn.pending .turn-markdown').filter({ hasText: /\S/ }).waitFor();
		await shot(tab, `${size}-streaming`);
		const reply = await waitForReply(tab);
		await tab.waitForTimeout(500);
		const bottoms = await frames();
		await shot(tab, `${size}-settled`);

		const lastPending = bottoms.findLast((frame) => frame.pending)?.bottom;
		const firstSettled = bottoms.find((frame, i) => !frame.pending && bottoms[i - 1]?.pending)?.bottom;
		const gap = await composerGap(tab);
		const seen = await view(tab);
		record(size, { gapPx: gap, lastPendingBottom: lastPending, firstSettledBottom: firstSettled,
			settleJumpPx: Math.abs(firstSettled - lastPending), frames: bottoms.length, placeholder: seen.placeholder,
			replyChars: reply.length });

		assert.ok(reply.trim().length > 0, 'a real reply settled');
		assert.ok(gap !== null && gap >= 0 && gap <= maxGapPx, `${size}: reply rests on the composer (gap ${gap}px, max ${maxGapPx})`);
		assert.ok(Math.abs(firstSettled - lastPending) <= maxSettleJumpPx,
			`${size}: nothing jumps when the reply settles (${lastPending} -> ${firstSettled})`);
		assert.equal(seen.placeholder, 'Your reply', 'the in-conversation composer says "Your reply"');
	}
});
