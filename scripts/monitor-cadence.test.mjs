import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import test from 'node:test';

const now = Date.parse('2026-11-14T12:00:00Z');
const privateText = 'PRIVATE_TOKEN_AND_API_BODY';
const run = (id = 10, extra = {}) => ({ id, head_branch: 'main', status: 'completed', conclusion: 'success', ...extra });
const step = (age = 600_000, extra = {}) => ({ name: 'Check runtime failures', conclusion: 'success', started_at: new Date(now - age).toISOString(), ...extra });
const jobs = (steps = [step()], extra = {}) => ({ total_count: 1, jobs: [{ name: 'Production monitor', steps, ...extra }] });
const fixture = (runs = [run()], jobReads = { 10: jobs() }) => ({ runs: { workflow_runs: runs }, jobs: jobReads });

test('cadence check uses completed production scans and fails closed through the HTTP boundary', async (t) => {
	const dir = await mkdtemp(join(tmpdir(), 'socratink-cadence-'));
	const capture = join(dir, 'requests.jsonl'), preload = join(dir, 'fetch.mjs');
	await writeFile(preload, `import { appendFileSync } from 'node:fs';
Date.now = () => ${now};
globalThis.fetch = async (input, options) => {
 const url = new URL(input);
 appendFileSync(process.env.CADENCE_FAKE_CAPTURE, JSON.stringify({ url: url.href, method: options.method ?? 'GET',
  redirect: options.redirect, timed: options.signal instanceof AbortSignal,
  authenticated: options.headers.Authorization === 'Bearer synthetic-cadence-token' }) + '\\n');
 if (process.env.CADENCE_FAKE_NETWORK) throw new Error(process.env.CADENCE_FAKE_PRIVATE);
 const fixture = JSON.parse(process.env.CADENCE_FAKE_READS);
 const runId = url.pathname.match(/\\/runs\\/(\\d+)\\/jobs$/)?.[1];
 const data = runId ? fixture.jobs[runId] : fixture.runs;
 if (process.env.CADENCE_FAKE_OVERSIZE) return new Response(new ReadableStream({
  start(controller) { controller.enqueue(new TextEncoder().encode('x'.repeat(1024 * 1024 + 1))); },
  cancel() { appendFileSync(process.env.CADENCE_FAKE_CAPTURE + '.canceled', '1'); }
 }));
 return new Response(typeof data === 'string' ? data : JSON.stringify(data), { status: Number(process.env.CADENCE_FAKE_STATUS || 200) });
};`);
	const cases = [
		['recent scan', fixture(), {}],
		['45-minute boundary', fixture([run()], { 10: jobs([step(2_700_000)]) }), {}],
		['stale scan', fixture([run()], { 10: jobs([step(2_700_001)]) }), { cadenceGaps: 1 }],
		['recovery uses successful scan from failed workflow', fixture([run(10, { conclusion: 'failure' })], { 10: jobs([step()], { conclusion: 'failure' }) }), {}],
		['current run cannot hide gap', fixture([run(100), run()], { 10: jobs([step(3_000_000)]) }), { cadenceGaps: 1 }],
		['preview cannot hide gap', fixture([run(11), run()], { 11: jobs([step()], { name: 'Preview monitor' }), 10: jobs([step(3_000_000)]) }), { cadenceGaps: 1 }],
		['newer failed scan does not hide older success', fixture([run(11), run()], { 11: jobs([step(1000, { conclusion: 'failure' })]), 10: jobs() }), {}],
		['later run order does not hide fresh rerun', fixture([run(11), run()], { 11: jobs([step(3_000_000)]), 10: jobs() }), {}],
		['no prior runs', fixture([]), { missingBaseline: 1 }],
		['no successful scan', fixture([run()], { 10: jobs([step(1000, { conclusion: 'failure' })]) }), { missingBaseline: 1 }],
		['preview only', fixture([run()], { 10: jobs([step()], { name: 'Preview monitor' }) }), { missingBaseline: 1 }],
		['missing timestamp', fixture([run()], { 10: jobs([step(1000, { started_at: undefined })]) }), { readFailures: 1 }],
		['invalid timestamp', fixture([run()], { 10: jobs([step(1000, { started_at: privateText })]) }), { readFailures: 1 }],
		['future timestamp', fixture([run()], { 10: jobs([step(-1000)]) }), { readFailures: 1 }],
		['wrong branch', fixture([run(10, { head_branch: 'other' })]), { readFailures: 1 }],
		['unfinished run', fixture([run(10, { status: 'in_progress' })]), { readFailures: 1 }],
		['invalid run id', fixture([run(privateText)]), { readFailures: 1 }],
		['missing runs', { runs: {}, jobs: {} }, { readFailures: 1 }],
		['more than10 runs', fixture(Array.from({ length: 11 }, (_, id) => run(id + 1))), { readFailures: 1 }],
		['missing jobs', fixture([run()], { 10: {} }), { readFailures: 1 }],
		['incomplete job list', fixture([run()], { 10: { ...jobs(), total_count: 2 } }), { readFailures: 1 }],
		['missing steps', fixture([run()], { 10: jobs(undefined, { steps: undefined }) }), { readFailures: 1 }],
		['malformed JSON', { runs: privateText, jobs: {} }, { readFailures: 1 }],
		['HTTP failure', fixture(), { readFailures: 1 }, { CADENCE_FAKE_STATUS: '403' }],
		['network failure', fixture(), { readFailures: 1 }, { CADENCE_FAKE_NETWORK: '1' }],
		['oversized response is canceled', fixture(), { readFailures: 1 }, { CADENCE_FAKE_OVERSIZE: '1' }],
		['missing token sends no request', fixture(), { readFailures: 1 }, { GITHUB_TOKEN: '' }],
		['invalid current run sends no request', fixture(), { readFailures: 1 }, { GITHUB_RUN_ID: privateText }],
		['bounded10-run search', fixture(Array.from({ length: 10 }, (_, id) => run(id + 1)), Object.fromEntries(Array.from({ length: 10 }, (_, id) => [id + 1, jobs([], { name: 'Preview monitor' })]))), { missingBaseline: 1 }],
	];
	try {
		for (const [name, reads, counts, extraEnv] of cases) await t.test(name, async () => {
			await writeFile(capture, '');
			await writeFile(capture + '.canceled', '');
			const env = { GITHUB_TOKEN: 'synthetic-cadence-token', GITHUB_RUN_ID: '100',
				CADENCE_FAKE_CAPTURE: capture, CADENCE_FAKE_READS: JSON.stringify(reads), CADENCE_FAKE_PRIVATE: privateText, ...extraEnv };
			let status = 0, stdout, stderr = '';
			try { stdout = execFileSync(process.execPath, ['--import', preload, resolve('scripts/monitor-cadence.mjs')], { env, encoding: 'utf8', stdio: 'pipe', timeout: 5000 }); }
			catch (error) { status = error.status; stdout = error.stdout; stderr = error.stderr; }
			const expected = { cadenceGaps: 0, missingBaseline: 0, readFailures: 0, ...counts };
			assert.equal(status, Object.values(expected).some(Boolean) ? 1 : 0);
			assert.deepEqual(JSON.parse(stdout), expected);
			assert.equal(stderr, '');
			assert.ok(!stdout.includes(privateText));
			assert.ok(!stdout.includes(env.GITHUB_TOKEN || 'synthetic-cadence-token'));
			const captured = (await readFile(capture, 'utf8')).trim();
			const calls = captured ? captured.split('\n').map(JSON.parse) : [];
			assert.ok(calls.length <= 11);
			assert.equal(await readFile(capture + '.canceled', 'utf8'), extraEnv?.CADENCE_FAKE_OVERSIZE ? '1' : '');
			if (!env.GITHUB_TOKEN || env.GITHUB_RUN_ID !== '100') assert.equal(calls.length, 0);
			else assert.ok(calls.length >= 1);
			if (name === 'bounded10-run search') assert.equal(calls.length, 11);
			for (const [index, call] of calls.entries()) {
				assert.equal(call.method, 'GET'); assert.equal(call.redirect, 'error'); assert.equal(call.timed, true); assert.equal(call.authenticated, true);
				const url = new URL(call.url);
				assert.equal(url.origin, 'https://api.github.com');
				if (index === 0) {
					assert.equal(url.pathname, '/repos/jon-devlapaz/socratink/actions/workflows/runtime-monitor.yml/runs');
					assert.deepEqual(Object.fromEntries(url.searchParams), { branch: 'main', status: 'completed', per_page: '10', page: '1' });
				} else {
					assert.match(url.pathname, /^\/repos\/jon-devlapaz\/socratink\/actions\/runs\/\d+\/jobs$/);
					assert.notEqual(url.pathname, '/repos/jon-devlapaz/socratink/actions/runs/100/jobs');
					assert.deepEqual(Object.fromEntries(url.searchParams), { filter: 'latest', per_page: '10', page: '1' });
				}
			}
		});
	} finally { await rm(dir, { recursive: true, force: true }); }
});
