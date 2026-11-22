import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const tlaVersion = '1.7.4';
const tlaSha256 = '936a262061c914694dfd669a543be24573c45d5aa0ff20a8b96b23d01e050e88';
const cache = resolve('.cache/tla');
const jar = join(cache, `tla2tools-${tlaVersion}.jar`);

const cases = [
	{ config: 'CancelTarget.cfg', expect: 'pass',
		says: 'Cancel stops only the reply its own tab meant to stop' },
	{ config: 'CancelTarget-before-119.cfg', expect: 'CancelStopsOnlyIntendedReply',
		says: 'the conversation-wide abort from before #119 lets a late Cancel stop a later reply' },
	{ config: 'CancelTarget-cancel-works.cfg', expect: 'NoReplyEverAborted',
		says: 'Cancel can still stop the intended reply' },
];

async function ensureJar() {
	if (existsSync(jar) && sha256(readFileSync(jar)) === tlaSha256) return;
	mkdirSync(cache, { recursive: true });
	const response = await fetch(`https://github.com/tlaplus/tlaplus/releases/download/v${tlaVersion}/tla2tools.jar`);
	if (!response.ok) throw new Error(`TLA+ tools download failed: HTTP ${response.status}`);
	const bytes = Buffer.from(await response.arrayBuffer());
	if (sha256(bytes) !== tlaSha256) throw new Error('TLA+ tools checksum mismatch; refusing to run.');
	writeFileSync(jar, bytes);
}

function sha256(bytes) {
	return createHash('sha256').update(bytes).digest('hex');
}

function check({ config }) {
	const metadir = join(cache, 'states', config);
	rmSync(metadir, { recursive: true, force: true });
	const run = spawnSync('java', ['-XX:+UseParallelGC', '-cp', jar, 'tlc2.TLC', '-deadlock', '-workers', 'auto',
		'-metadir', metadir, '-config', config, 'CancelTarget.tla'], { cwd: 'formal', encoding: 'utf8' });
	if (run.error) throw run.error;
	const output = `${run.stdout}${run.stderr}`;
	if (/Model checking completed\. No error has been found\./.test(output)) return { result: 'pass', output };
	const violated = /Invariant (\w+) is violated/.exec(output)?.[1];
	return { result: violated ?? 'error', output };
}

await ensureJar();
let failed = false;
for (const entry of cases) {
	const { result, output } = check(entry);
	const ok = result === entry.expect;
	console.log(`${ok ? 'ok' : 'FAIL'}  ${entry.config}: ${entry.says} (expected ${entry.expect}, got ${result})`);
	if (!ok) { failed = true; console.log(output); }
}
if (failed) process.exit(1);
