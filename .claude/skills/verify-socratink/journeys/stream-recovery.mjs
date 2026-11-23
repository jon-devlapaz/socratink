#!/usr/bin/env node
// Feature: stream-recovery (features/stream-recovery.md). Origin: PR #159 and the durable reconnect work before it.
// While a reply streams: (1) the learner's network drops for 6 s, (2) something keeps closing
// the reply stream every 300 ms. Either way the tab pauses longer between reconnects, then
// shows the same reply once, without sending the message to the model again.
import assert from 'node:assert/strict';
import { journey, send, view, waitForReply } from '../learner.mjs';

const watchMs = 6_000;
const maxAttempts = 8; // 250 ms doubling to 5 s gives about 5 in 6 s; a loop without pauses gives 15+.

async function heldReply(tab, model, text) {
	await model.hold();
	await send(tab, text);
	await tab.locator('#active-turn .turn.pending .turn-markdown').filter({ hasText: /\S/ }).waitFor();
	return (await model.calls()).calls;
}

async function reconnects(tab, cut, restore) {
	const before = tab.streams.length;
	const start = Date.now();
	cut();
	await tab.waitForTimeout(watchMs);
	const attempts = tab.streams.slice(before).map((t) => t - start);
	restore();
	return attempts;
}

function assertBackoff(label, attempts) {
	const pauses = attempts.map((t, i) => t - (attempts[i - 1] ?? 0));
	assert.ok(attempts.length >= 2, `${label}: the tab tries to reconnect (${attempts.length} attempts)`);
	assert.ok(attempts.length <= maxAttempts, `${label}: reconnects back off instead of looping (${attempts.length} in ${watchMs} ms)`);
	assert.ok(pauses.every((pause, i) => i === 0 || pause >= pauses[i - 1] * 0.8), `${label}: each pause is longer: ${pauses.join(', ')} ms`);
}

async function assertRecovered(tab, model, callsBefore, message) {
	await model.release();
	const reply = await waitForReply(tab);
	await tab.waitForTimeout(1_000);
	const after = await view(tab);
	const lastLine = reply.trim().split('\n').at(-1);
	assert.equal(after.activeTurn.split(lastLine).length - 1, 1, 'the reply shows exactly once');
	assert.equal(after.activeTurn.split(message).length - 1, 1, 'the learner message shows once');
	assert.equal((await model.calls()).calls, callsBefore, 'recovery did not send the message to the model again');
	return after;
}

await journey('stream-recovery', async ({ learner, model, network, record, shot }) => {
	if (!model) throw new Error('stream-recovery needs the scripted provider to hold a reply mid-stream.');
	const tab = await learner.newTab();

	const outageMessage = 'Why do tides happen?';
	const outageCalls = await heldReply(tab, model, outageMessage);
	const outage = await reconnects(tab, () => network.drop(), () => network.restore());
	await shot(tab, 'outage-pending');
	record('outage', { reconnectAttemptsMs: outage, pendingView: await view(tab) });
	assertBackoff('network outage', outage);
	record('outageRecovered', await assertRecovered(tab, model, outageCalls, outageMessage));
	await shot(tab, 'outage-recovered');

	const closingMessage = 'Is it the moon or the sun?';
	const closingCalls = await heldReply(tab, model, closingMessage);
	const closing = await reconnects(tab, () => network.closeStreamsAfter(300), () => network.restoreStreams());
	await shot(tab, 'closing-pending');
	record('streamKeepsClosing', { reconnectAttemptsMs: closing, pendingView: await view(tab) });
	assertBackoff('stream keeps closing', closing);
	record('closingRecovered', await assertRecovered(tab, model, closingCalls, closingMessage));
	await shot(tab, 'closing-recovered');
});
