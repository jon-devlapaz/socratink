import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { checkMonitorCadence } from './monitor-cadence.mjs';
import { checkMonitorCommand, monitorResponses, runSilentMonitor } from './monitor-test-support.mjs';

const now = Date.parse('2026-11-14T12:00:00Z');
const privateText = 'PRIVATE_TOKEN_AND_API_BODY';
const run = (id = 10, extra = {}) => ({ id, head_branch: 'main', status: 'completed', conclusion: 'success', ...extra });
const step = (age = 600_000, extra = {}) => ({ name: 'Check runtime failures', conclusion: 'success', started_at: new Date(now - age).toISOString(), ...extra });
const jobs = (steps = [step()], extra = {}) => ({ total_count: 1, jobs: [{ name: 'Production monitor', steps, ...extra }] });
const fixture = (runs = [run()], jobReads = { 10: jobs() }) => ({ runs: { workflow_runs: runs }, jobs: jobReads });

describe('checkMonitorCadence', () => {
	const cases = [
		['recent scan', fixture(), {}],
		['just inside the 45-minute boundary', fixture([run()], { 10: jobs([step(2_699_999)]) }), {}],
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
		['more than 10 runs', fixture(Array.from({ length: 11 }, (_, id) => run(id + 1))), { readFailures: 1 }],
		['missing jobs', fixture([run()], { 10: {} }), { readFailures: 1 }],
		['incomplete job list', fixture([run()], { 10: { ...jobs(), total_count: 2 } }), { readFailures: 1 }],
		['missing steps', fixture([run()], { 10: jobs(undefined, { steps: undefined }) }), { readFailures: 1 }],
		['malformed JSON', { runs: privateText, jobs: {} }, { readFailures: 1 }],
		['HTTP failure', fixture(), { readFailures: 1 }, { status: 403 }],
		['network failure', fixture(), { readFailures: 1 }, { network: true }],
		['oversized response is canceled', fixture(), { readFailures: 1 }, { oversize: true }],
		['missing token sends no request', fixture(), { readFailures: 1 }, { GITHUB_TOKEN: '' }],
		['invalid current run sends no request', fixture(), { readFailures: 1 }, { GITHUB_RUN_ID: privateText }],
		['bounded 10-run search', fixture(Array.from({ length: 10 }, (_, id) => run(id + 1)), Object.fromEntries(Array.from({ length: 10 }, (_, id) => [id + 1, jobs([], { name: 'Preview monitor' })]))), { missingBaseline: 1 }],
	];
	for (const [name, reads, counts, overrides = {}] of cases) {
		it(name, async (t) => {
			const { oversize, network, status, ...settings } = overrides;
			const env = { GITHUB_TOKEN: 'synthetic-cadence-token', GITHUB_RUN_ID: '100', ...settings };
			const api = monitorResponses((url) => {
				if (network) throw new Error(privateText);
				if (oversize) return { bytes: 1024 * 1024 + 1 };
				const runId = url.pathname.match(/\/runs\/(\d+)\/jobs$/)?.[1];
				return { data: runId ? reads.jobs[runId] : reads.runs, status };
			});
			const result = await runSilentMonitor(t, () => checkMonitorCadence({ env, request: api.request, now: () => now }));
			const expected = { cadenceGaps: 0, missingBaseline: 0, readFailures: 0, ...counts };
			assert.deepEqual(result, { counts: expected, exitCode: Object.values(expected).some(Boolean) ? 1 : 0 });
			assert.ok(api.calls.length <= 11);
			assert.deepEqual(api.canceled, oversize ? [api.calls[0].url] : []);
			if (!env.GITHUB_TOKEN || env.GITHUB_RUN_ID !== '100') assert.equal(api.calls.length, 0);
			else assert.ok(api.calls.length >= 1);
			if (name === 'bounded 10-run search') assert.equal(api.calls.length, 11);
			for (const [index, { url, options }] of api.calls.entries()) {
				assert.equal(options.method ?? 'GET', 'GET');
				assert.equal(options.redirect, 'error');
				assert.ok(options.signal instanceof AbortSignal);
				assert.equal(options.headers.Authorization, 'Bearer synthetic-cadence-token');
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
	}
});

describe('monitor-cadence command', () => {
	it('a recent scan', () => {
		const response = JSON.stringify(fixture());
		checkMonitorCommand('scripts/monitor-cadence.mjs', {
			env: { GITHUB_TOKEN: 'synthetic-token', GITHUB_RUN_ID: '100' },
			preload: `Date.now = () => ${now}; const data = ${response}; globalThis.fetch = async url => Response.json(url.includes('/jobs?') ? data.jobs[10] : data.runs);`,
			counts: { cadenceGaps: 0, missingBaseline: 0, readFailures: 0 }, exitCode: 0,
		});
	});
	it('a private error returned by GitHub', () => {
		checkMonitorCommand('scripts/monitor-cadence.mjs', {
			env: { GITHUB_TOKEN: 'synthetic-cadence-token', GITHUB_RUN_ID: '100' },
			preload: 'globalThis.fetch = async () => { throw new Error("synthetic private response"); };',
			counts: { cadenceGaps: 0, missingBaseline: 0, readFailures: 1 }, exitCode: 1,
		});
	});
	it('a missing token', () => {
		checkMonitorCommand('scripts/monitor-cadence.mjs', {
			env: {}, counts: { cadenceGaps: 0, missingBaseline: 0, readFailures: 1 }, exitCode: 1,
		});
	});
});
