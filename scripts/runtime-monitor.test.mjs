import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import test from 'node:test';

// Failures: wrong target/window; errors hidden by HTTP202; missed5xx; broad
// warning suppression; incomplete/malformed reads; auth failures; private output.
const privateText = 'PRIVATE_LEARNER_PROVIDER_TOKEN /private-request-path';
const warning = "(node:7) Warning: SECURITY WARNING: The SSL modes 'prefer', 'require', and 'verify-ca' are treated as aliases for 'verify-full'.";
const log = (message = privateText, extra = {}) => ({ level: 'error', message, ...extra });
const row = (logs = [log()], extra = {}) => ({ timestamp: new Date(Date.now() - 10_000).toISOString(), statusCode: 202, environment: 'production', logs, ...extra });
const output = (rows = [], extra = {}) => ({ rows, hasMoreRows: false, ...extra });

test('runtime monitor fails closed and keeps log contents private through the HTTP boundary', async (t) => {
	const dir = await mkdtemp(join(tmpdir(), 'socratink-monitor-'));
	const capture = join(dir, 'requests.jsonl'), preload = join(dir, 'fetch.mjs');
	await writeFile(preload, `import { appendFileSync } from 'node:fs';
globalThis.fetch = async (input, options) => {
 const url = new URL(input);
 appendFileSync(process.env.MONITOR_FAKE_ARGS, JSON.stringify({ url: url.href, method: options.method ?? 'GET',
  redirect: options.redirect, timed: options.signal instanceof AbortSignal,
  authenticated: options.headers.Authorization === 'Bearer synthetic-monitor-token' }) + '\\n');
 if (process.env.MONITOR_FAKE_NETWORK) throw new Error(process.env.MONITOR_FAKE_PRIVATE);
 const source = url.searchParams.has('level') ? 'runtime' : 'requests';
 const data = JSON.parse(process.env.MONITOR_FAKE_READS)[source];
 if (process.env.MONITOR_FAKE_OVERSIZE === source) return new Response(new ReadableStream({
  start(controller) { controller.enqueue(new TextEncoder().encode(JSON.stringify({ ...data, padding: 'x'.repeat(4 * 1024 * 1024) }))); },
  cancel() { appendFileSync(process.env.MONITOR_FAKE_ARGS + '.canceled', '1'); }
 }));
 return new Response(typeof data === 'string' ? data : JSON.stringify(data), { status: Number(process.env.MONITOR_FAKE_STATUS || 200) });
};`);
	const cases = [
		['clean', output(), output(), {}],
		['HTTP202 retains runtime errors with context', output([row([log(), log(privateText, { level: 'fatal' }), log('Context', { level: 'info' }), log('Context', { level: 'warning' })])]), output(), { runtimeErrors: 2 }],
		['HTTP5xx without runtime logs', output(), output([row(undefined, { statusCode: 503, logs: undefined })]), { http5xx: 1 }],
		['known pg warning', output([row([log(warning)])]), output(), { ignoredPgSslWarnings: 1 }],
		['fatal never suppressed', output([row([log(warning, { level: 'fatal' })])]), output(), { runtimeErrors: 1 }],
		['other warning not suppressed', output([row([log('(node:7) Warning: another warning')])]), output(), { runtimeErrors: 1 }],
		['malformed JSON', privateText, output(), { readFailures: 1 }],
		['API error body', { error: privateText }, output(), { incompleteReads: 1 }],
		['truncated message', output([row([log(privateText, { messageTruncated: true })])]), output(), { incompleteReads: 1 }],
		['more pages', output([], { hasMoreRows: true }), output(), { incompleteReads: 1 }],
		['missing pagination', { rows: [] }, output(), { incompleteReads: 1 }],
		['missing rows', { hasMoreRows: false }, output(), { incompleteReads: 1 }],
		['over100 rows', output(Array.from({ length: 101 }, () => row())), output(), { incompleteReads: 1 }],
		['oversized body is canceled', output(), output(), { incompleteReads: 1 }, { MONITOR_FAKE_OVERSIZE: 'runtime' }],
		['missing error logs', output([row(undefined, { logs: undefined })]), output(), { incompleteReads: 1 }],
		['unused extra timestamp type', output([row([log(privateText, { timestamp: 123 })])]), output(), { runtimeErrors: 1 }],
		['stale row', output([row([], { timestamp: new Date(Date.now() - 3_000_000).toISOString() })]), output(), { incompleteReads: 1 }],
		['future row', output([row([], { timestamp: new Date(Date.now() + 600_000).toISOString() })]), output(), { incompleteReads: 1 }],
		['invalid timestamp', output([row([], { timestamp: privateText })]), output(), { readFailures: 1 }],
		['wrong environment', output([row([], { environment: 'preview' })]), output(), { readFailures: 1 }],
		['wrong project', output([row([], { projectId: 'prj_other' })]), output(), { readFailures: 1 }],
		['unexpected log level', output([row([log(privateText, { level: 'unknown' })])]), output(), { readFailures: 1 }],
		['wrong HTTP filter', output(), output([row([], { statusCode: 200 })]), { readFailures: 1 }],
		['HTTP permission failure', output(), output(), { readFailures: 2 }, { MONITOR_FAKE_STATUS: '403' }],
		['network failure', output(), output(), { readFailures: 2 }, { MONITOR_FAKE_NETWORK: '1' }],
		['missing token sends no request', output(), output(), { readFailures: 2 }, { VERCEL_TOKEN: '' }],
		['explicit preview', output([row([log()], { deploymentId: 'dpl_synthetic', environment: 'preview' })]), output(), { runtimeErrors: 1 }, { MONITOR_PREVIEW_DEPLOYMENT: 'dpl_synthetic' }],
		['wrong preview', output([row([], { deploymentId: 'dpl_other', environment: 'preview' })]), output(), { readFailures: 1 }, { MONITOR_PREVIEW_DEPLOYMENT: 'dpl_synthetic' }],
		['invalid target', output(), output(), { invalidTarget: 1 }, { MONITOR_PREVIEW_DEPLOYMENT: privateText }],
	];
	try {
		for (const [name, runtime, requests, counts, extraEnv] of cases) await t.test(name, async () => {
			await writeFile(capture, '');
			await writeFile(capture + '.canceled', '');
			const env = { ...process.env, MONITOR_PREVIEW_DEPLOYMENT: '', VERCEL_TOKEN: 'synthetic-monitor-token',
				VERCEL_API_URL: 'https://invalid.example', MONITOR_BASE_URL: 'https://invalid.example',
				MONITOR_FAKE_ARGS: capture, MONITOR_FAKE_READS: JSON.stringify({ runtime, requests }),
				MONITOR_FAKE_PRIVATE: privateText, MONITOR_FAKE_STATUS: '', MONITOR_FAKE_NETWORK: '', MONITOR_FAKE_OVERSIZE: '', ...extraEnv };
			let status = 0, stdout, stderr = '';
			try { stdout = execFileSync(process.execPath, ['--import', preload, resolve('scripts/runtime-monitor.mjs')], { env, encoding: 'utf8', stdio: 'pipe' }); }
			catch (error) { status = error.status; stdout = error.stdout; stderr = error.stderr; }
			const expected = { runtimeErrors: 0, http5xx: 0, ignoredPgSslWarnings: 0, readFailures: 0, incompleteReads: 0, invalidTarget: 0, ...counts };
			assert.equal(status, expected.runtimeErrors + expected.http5xx + expected.readFailures + expected.incompleteReads + expected.invalidTarget ? 1 : 0);
			assert.deepEqual(JSON.parse(stdout), expected); assert.equal(stderr, ''); assert.ok(!stdout.includes(privateText));
			const captured = (await readFile(capture, 'utf8')).trim();
			const calls = captured ? captured.split('\n').map(JSON.parse) : [];
			assert.equal(calls.length, counts.invalidTarget || !env.VERCEL_TOKEN ? 0 : 2);
			assert.equal(await readFile(capture + '.canceled', 'utf8'), extraEnv?.MONITOR_FAKE_OVERSIZE ? '1' : '');
			for (const [index, call] of calls.entries()) {
				assert.equal(call.method, 'GET'); assert.equal(call.redirect, 'error'); assert.equal(call.timed, true); assert.equal(call.authenticated, true);
				const url = new URL(call.url), params = Object.fromEntries(url.searchParams);
				assert.equal(url.origin + url.pathname, 'https://api.vercel.com/v1/projects/prj_RRYb5o7zx5CaHbmCAYzzDY8bb33Q/request-logs');
				assert.equal(Number(params.endDate) - Number(params.startDate), 2_700_000);
				assert.ok(Math.abs(Date.now() - Number(params.endDate)) < 5000);
				delete params.startDate; delete params.endDate;
				assert.deepEqual(params, { projectId: 'prj_RRYb5o7zx5CaHbmCAYzzDY8bb33Q', ownerId: 'team_bOdbOHK6yluaErCcwM1iZaUD', teamId: 'team_bOdbOHK6yluaErCcwM1iZaUD', page: '0',
					...(extraEnv?.MONITOR_PREVIEW_DEPLOYMENT ? { deploymentId: 'dpl_synthetic' } : { environment: 'production' }),
					...(index === 0 ? { level: 'error,fatal' } : { statusCode: '5xx' }) });
			}
			if (calls.length) assert.equal(new URL(calls[0].url).searchParams.get('endDate'), new URL(calls[1].url).searchParams.get('endDate'));
		});
	} finally { await rm(dir, { recursive: true, force: true }); }
});
