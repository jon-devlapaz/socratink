import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const run = promisify(execFile);
const counts = { runtimeErrors: 0, http5xx: 0, ignoredPgSslWarnings: 0, readFailures: 0, incompleteReads: 0, invalidTarget: 0 };
const pgWarning = /^\(node:\d+\) Warning: SECURITY WARNING: The SSL modes 'prefer', 'require', and 'verify-ca' are treated as aliases for 'verify-full'\./;
const preview = process.env.MONITOR_PREVIEW_DEPLOYMENT;
if (preview && !/^dpl_[A-Za-z0-9]+$/.test(preview)) counts.invalidTarget = 1;
const target = preview
	? ['--deployment', preview]
	: ['--environment', 'production'];

for (const source of counts.invalidTarget ? [] : ['runtime', 'requests']) {
	try {
		const queryStartedAt = Date.now();
		const { stdout } = await run('vercel', ['logs', source,
			'--project', 'prj_RRYb5o7zx5CaHbmCAYzzDY8bb33Q', '--scope', 'jon-devlapazs-projects',
			'--since', '45m', '--limit', '100', '--json', '--query',
			source === 'runtime' ? 'level:(error OR fatal)' : 'httpStatus >=500', ...target,
		], { timeout: 45_000, maxBuffer: 4 * 1024 * 1024, encoding: 'utf8' });
		const records = stdout.trim().split('\n').map(line => JSON.parse(line));
		const summary = records.pop();
		const windowEnd = Date.parse(summary?.timeRange?.end);
		const duration = windowEnd - Date.parse(summary?.timeRange?.start);
		const age = queryStartedAt - windowEnd;
		if (summary?.type !== 'summary' || summary.recordsReturned !== records.length || records.length > 100
			|| summary.pagination?.hasMore !== false || summary.pagination?.next !== null
			|| !Array.isArray(summary.excludedIntervals) || summary.excludedIntervals.length !== 0
			|| !Number.isFinite(duration) || Math.abs(duration - 2_700_000) > 1000
			|| age > 300_000 || age < -60_000
			|| records.some(row => row?.data?.truncated === true)) {
			counts.incompleteReads++;
			continue;
		}
		for (const row of records) {
			const data = row?.data;
			if (!data || row.type !== (source === 'runtime' ? 'log' : 'request')) throw new Error();
			if (source === 'runtime') {
				if (!['error', 'fatal'].includes(data.level) || typeof data.message !== 'string' || data.truncated !== false) throw new Error();
				if (data.level === 'error' && pgWarning.test(data.message)) counts.ignoredPgSslWarnings++;
				else counts.runtimeErrors++;
			} else {
				if (!Number.isInteger(data.httpStatus) || data.httpStatus < 500) throw new Error();
				counts.http5xx++;
			}
		}
	} catch {
		// CLI errors can contain credentials, request paths and provider payloads.
		counts.readFailures++;
	}
}

console.log(JSON.stringify(counts));
process.exitCode = counts.runtimeErrors + counts.http5xx + counts.readFailures + counts.incompleteReads + counts.invalidTarget > 0 ? 1 : 0;
