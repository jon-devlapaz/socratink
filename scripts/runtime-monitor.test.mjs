import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { chmod, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { delimiter, join, resolve } from 'node:path';
import test from 'node:test';

// Failures: wrong project/environment/window; missed errors or 5xx; broad warning
// suppression; incomplete/malformed reads; CLI/auth failure; private log leakage.
const privateText = 'PRIVATE_LEARNER_PROVIDER_TOKEN /private-request-path';
const warning = "(node:7) Warning: SECURITY WARNING: The SSL modes 'prefer', 'require', and 'verify-ca' are treated as aliases for 'verify-full'.";
const log = (message = privateText, extra = {}) => ({ type: 'log', data: { level: 'error', message, truncated: false, ...extra } });
const request = { type: 'request', data: { httpStatus: 503, requestPath: privateText } };
function output(rows = [], summary = {}) {
	return [...rows, { type: 'summary', recordsReturned: rows.length,
		timeRange: { start: new Date(Date.now() - 2_700_000).toISOString(), end: new Date().toISOString() },
		pagination: { hasMore: false, next: null }, excludedIntervals: [], ...summary }].map(JSON.stringify).join('\n');
}

test('runtime monitor reports only fixed counts and fails closed through the CLI boundary', async (t) => {
	const dir = await mkdtemp(join(tmpdir(), 'socratink-monitor-'));
	const capture = join(dir, 'arguments.jsonl');
	await writeFile(join(dir, 'vercel'), `#!${process.execPath}
import { appendFileSync } from 'node:fs';
appendFileSync(process.env.MONITOR_FAKE_ARGS, JSON.stringify(process.argv.slice(2)) + '\\n');
process.stderr.write(process.env.MONITOR_FAKE_PRIVATE);
if (process.env.MONITOR_FAKE_EXIT === '1') process.exit(1);
process.stdout.write(JSON.parse(process.env.MONITOR_FAKE_READS)[process.argv[3]]);
`);
	await chmod(join(dir, 'vercel'), 0o755);
	const cases = [
		['clean', output(), output(), {}],
		['runtime errors and HTTP5xx', output([log(), log(privateText, { level: 'fatal' })]), output([request]), { runtimeErrors: 2, http5xx: 1 }],
		['only the known pg warning', output([log(warning)]), output(), { ignoredPgSslWarnings: 1 }],
		['fatal is never a pg warning', output([log(warning, { level: 'fatal' })]), output(), { runtimeErrors: 1 }],
		['other warning is not suppressed', output([log('(node:7) Warning: another warning')]), output(), { runtimeErrors: 1 }],
		['malformed', privateText, output(), { readFailures: 1 }],
		['API error record', output([{ type: 'error', data: { message: privateText } }]), output(), { readFailures: 1 }],
		['truncated record', output([log(privateText, { truncated: true })]), output(), { incompleteReads: 1 }],
		['more pages', output([], { pagination: { hasMore: true, next: privateText } }), output(), { incompleteReads: 1 }],
		['cursor without more flag', output([], { pagination: { hasMore: false, next: privateText } }), output(), { incompleteReads: 1 }],
		['excluded interval', output([], { excludedIntervals: [{ reason: privateText }] }), output(), { incompleteReads: 1 }],
		['missing summary', JSON.stringify(log()), output(), { incompleteReads: 1 }],
		['count mismatch', output([], { recordsReturned: 1 }), output(), { incompleteReads: 1 }],
		['row limit exceeded', output(Array.from({ length: 101 }, () => log())), output(), { incompleteReads: 1 }],
		['shortened window', output([], { timeRange: { start: '2026-01-01', end: '2026-01-01' } }), output(), { incompleteReads: 1 }],
		['stale window', output([], { timeRange: { start: new Date(Date.now() - 3_300_000).toISOString(), end: new Date(Date.now() - 600_000).toISOString() } }), output(), { incompleteReads: 1 }],
		['future window', output([], { timeRange: { start: new Date(Date.now() - 2_100_000).toISOString(), end: new Date(Date.now() + 600_000).toISOString() } }), output(), { incompleteReads: 1 }],
		['CLI or auth failure', output(), output(), { readFailures: 2 }, { MONITOR_FAKE_EXIT: '1' }],
		['explicit preview', output(), output(), {}, { MONITOR_PREVIEW_DEPLOYMENT: 'dpl_synthetic' }],
		['invalid preview target', output(), output(), { invalidTarget: 1 }, { MONITOR_PREVIEW_DEPLOYMENT: `--environment ${privateText}` }],
	];
	try {
		for (const [name, runtime, requests, counts, extraEnv] of cases) await t.test(name, async () => {
			await writeFile(capture, '');
			const env = { ...process.env, PATH: `${dir}${delimiter}${process.env.PATH}`, MONITOR_PREVIEW_DEPLOYMENT: '',
				MONITOR_FAKE_ARGS: capture, MONITOR_FAKE_READS: JSON.stringify({ runtime, requests }),
				MONITOR_FAKE_PRIVATE: privateText, MONITOR_FAKE_EXIT: '', ...extraEnv };
			let status = 0, stdout, stderr = '';
			try { stdout = execFileSync(process.execPath, [resolve('scripts/runtime-monitor.mjs')], { env, encoding: 'utf8', stdio: 'pipe' }); }
			catch (error) { status = error.status; stdout = error.stdout; stderr = error.stderr; }
			const expected = { runtimeErrors: 0, http5xx: 0, ignoredPgSslWarnings: 0, readFailures: 0, incompleteReads: 0, invalidTarget: 0, ...counts };
			assert.equal(status, expected.runtimeErrors + expected.http5xx + expected.readFailures + expected.incompleteReads + expected.invalidTarget ? 1 : 0);
			assert.deepEqual(JSON.parse(stdout), expected);
			assert.equal(stderr, '');
			assert.ok(!stdout.includes(privateText));
			const captured = (await readFile(capture, 'utf8')).trim();
			const calls = captured ? captured.split('\n').map(JSON.parse) : [];
			assert.deepEqual(calls, (counts.invalidTarget ? [] : ['runtime', 'requests']).map((source) => ['logs', source,
				'--project', 'prj_RRYb5o7zx5CaHbmCAYzzDY8bb33Q', '--scope', 'jon-devlapazs-projects',
				'--since', '45m', '--limit', '100', '--json', '--query', source === 'runtime' ? 'level:(error OR fatal)' : 'httpStatus >=500',
				...(extraEnv?.MONITOR_PREVIEW_DEPLOYMENT ? ['--deployment', 'dpl_synthetic'] : ['--environment', 'production'])]));
		});
	} finally { await rm(dir, { recursive: true, force: true }); }
});
