#!/usr/bin/env node
// A reply that is only a mark_reveal input written as JSON text never shows;
// the correction turns it into a recorded hint the learner can read.
// Needs the scripted provider (MARKJSON).
import { connect, send, waitForReply } from '../learner.mjs';

const { learner, evidence, close } = await connect();
let passed = false;
try {
	const tab = await learner.newTab();
	await send(tab, 'Why does ice float? MARKJSON');
	const settled = await waitForReply(tab);
	await tab.screenshot({ path: evidence('tool-json-as-text', 'settled.png') });
	await tab.reload();
	const reloaded = await waitForReply(tab);
	await tab.screenshot({ path: evidence('tool-json-as-text', 'reloaded.png') });
	const leaked = [settled, reloaded].some((text) => text.includes('{"'));
	passed = !leaked && reloaded.includes('Compare how tightly');
	console.log(JSON.stringify({ settled, reloaded, leaked }, null, 2));
} finally { await close(); }
console.log(passed ? 'PASS' : 'FAIL', evidence('tool-json-as-text', ''));
process.exit(passed ? 0 : 1);
