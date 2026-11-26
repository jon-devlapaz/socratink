import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { checkRuntimeLogs } from './runtime-monitor.mjs';
import { checkMonitorCommand, monitorResponses, runSilentMonitor } from './monitor-test-support.mjs';

const now = Date.parse('2026-11-14T12:00:00Z');
const privateText = 'PRIVATE_LEARNER_PROVIDER_TOKEN /private-request-path';
const warning = "(node:7) Warning: SECURITY WARNING: The SSL modes 'prefer', 'require', and 'verify-ca' are treated as aliases for 'verify-full'.";
const log = (message = privateText, extra = {}) => ({ level: 'error', message, ...extra });
const row = (logs = [log()], extra = {}) => ({ timestamp: new Date(now - 10_000).toISOString(), statusCode: 202, environment: 'production', logs, ...extra });
const output = (rows = [], extra = {}) => ({ rows, hasMoreRows: false, ...extra });

describe('checkRuntimeLogs', () => {
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
		['100 rows', output(Array.from({ length: 100 }, () => row([]))), output(), {}],
		['first instant in the window', output([row([], { timestamp: new Date(now - 2_700_000).toISOString() })]), output(), {}],
		['one millisecond before the window', output([row([], { timestamp: new Date(now - 2_700_001).toISOString() })]), output(), { incompleteReads: 1 }],
		['last instant in the window', output([row([], { timestamp: new Date(now).toISOString() })]), output(), {}],
		['one millisecond after the window', output([row([], { timestamp: new Date(now + 1).toISOString() })]), output(), { incompleteReads: 1 }],
		['over 100 rows', output(Array.from({ length: 101 }, () => row())), output(), { incompleteReads: 1 }],
		['oversized body is canceled', output(), output(), { incompleteReads: 1 }, { oversize: 'runtime' }],
		['missing error logs', output([row(undefined, { logs: undefined })]), output(), { incompleteReads: 1 }],
		['unused extra timestamp type', output([row([log(privateText, { timestamp: 123 })])]), output(), { runtimeErrors: 1 }],
		['stale row', output([row([], { timestamp: new Date(now - 3_000_000).toISOString() })]), output(), { incompleteReads: 1 }],
		['future row', output([row([], { timestamp: new Date(now + 600_000).toISOString() })]), output(), { incompleteReads: 1 }],
		['invalid timestamp', output([row([], { timestamp: privateText })]), output(), { readFailures: 1 }],
		['wrong environment', output([row([], { environment: 'preview' })]), output(), { readFailures: 1 }],
		['wrong project', output([row([], { projectId: 'prj_other' })]), output(), { readFailures: 1 }],
		['unexpected log level', output([row([log(privateText, { level: 'unknown' })])]), output(), { readFailures: 1 }],
		['wrong HTTP filter', output(), output([row([], { statusCode: 200 })]), { readFailures: 1 }],
		['HTTP permission failure', output(), output(), { readFailures: 2 }, { status: 403 }],
		['network failure', output(), output(), { readFailures: 2 }, { network: true }],
		['missing token sends no request', output(), output(), { readFailures: 2 }, { VERCEL_TOKEN: '' }],
		['explicit preview', output([row([log()], { deploymentId: 'dpl_synthetic', environment: 'preview' })]), output(), { runtimeErrors: 1 }, { MONITOR_PREVIEW_DEPLOYMENT: 'dpl_synthetic' }],
		['wrong preview', output([row([], { deploymentId: 'dpl_other', environment: 'preview' })]), output(), { readFailures: 1 }, { MONITOR_PREVIEW_DEPLOYMENT: 'dpl_synthetic' }],
		['invalid target', output(), output(), { invalidTarget: 1 }, { MONITOR_PREVIEW_DEPLOYMENT: privateText }],
	];
	for (const [name, runtime, requests, counts, overrides = {}] of cases) {
		it(name, async (t) => {
			const { oversize, network, status, ...settings } = overrides;
			const env = { VERCEL_TOKEN: 'synthetic-monitor-token', ...settings };
			const api = monitorResponses((url) => {
				if (network) throw new Error(privateText);
				const source = url.searchParams.has('level') ? 'runtime' : 'requests';
				if (oversize === source) return { bytes: 4 * 1024 * 1024 + 1 };
				return { data: source === 'runtime' ? runtime : requests, status };
			});
			const result = await runSilentMonitor(t, () => checkRuntimeLogs({ env, request: api.request, now: () => now }));
			const expected = { runtimeErrors: 0, http5xx: 0, ignoredPgSslWarnings: 0, readFailures: 0, incompleteReads: 0, invalidTarget: 0, ...counts };
			const failed = expected.runtimeErrors || expected.http5xx || expected.readFailures || expected.incompleteReads || expected.invalidTarget;
			assert.deepEqual(result, { counts: expected, exitCode: failed ? 1 : 0 });
			assert.equal(api.calls.length, counts.invalidTarget || !env.VERCEL_TOKEN ? 0 : 2);
			assert.deepEqual(api.canceled, oversize ? [api.calls[0].url] : []);
			for (const [index, { url, options }] of api.calls.entries()) {
				assert.equal(options.method ?? 'GET', 'GET');
				assert.equal(options.redirect, 'error');
				assert.ok(options.signal instanceof AbortSignal);
				assert.equal(options.headers.Authorization, 'Bearer synthetic-monitor-token');
				assert.equal(url.origin + url.pathname, 'https://api.vercel.com/v1/projects/prj_RRYb5o7zx5CaHbmCAYzzDY8bb33Q/request-logs');
				assert.deepEqual(Object.fromEntries(url.searchParams), {
					projectId: 'prj_RRYb5o7zx5CaHbmCAYzzDY8bb33Q', ownerId: 'team_bOdbOHK6yluaErCcwM1iZaUD',
					teamId: 'team_bOdbOHK6yluaErCcwM1iZaUD', page: '0', startDate: String(now - 2_700_000), endDate: String(now),
					...(env.MONITOR_PREVIEW_DEPLOYMENT ? { deploymentId: 'dpl_synthetic' } : { environment: 'production' }),
					...(index === 0 ? { level: 'error,fatal' } : { statusCode: '5xx' }),
				});
			}
		});
	}
});

describe('runtime-monitor command', () => {
	const counts = { runtimeErrors: 0, http5xx: 0, ignoredPgSslWarnings: 0, readFailures: 0, incompleteReads: 0, invalidTarget: 0 };
	it('a clean response', () => {
		checkMonitorCommand('scripts/runtime-monitor.mjs', {
			env: { VERCEL_TOKEN: 'synthetic-token' }, counts, exitCode: 0,
			preload: 'globalThis.fetch = async () => Response.json({ rows: [], hasMoreRows: false });',
		});
	});
	it('a private error returned by the log service', () => {
		checkMonitorCommand('scripts/runtime-monitor.mjs', {
			env: { VERCEL_TOKEN: 'synthetic-monitor-token' },
			preload: 'globalThis.fetch = async () => { throw new Error("synthetic private log"); };',
			counts: { ...counts, readFailures: 2 }, exitCode: 1,
		});
	});
	it('a missing token', () => {
		checkMonitorCommand('scripts/runtime-monitor.mjs', { env: {}, counts: { ...counts, readFailures: 2 }, exitCode: 1 });
	});
});
