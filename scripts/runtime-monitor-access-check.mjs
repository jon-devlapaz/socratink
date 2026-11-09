// Temporary status-only diagnosis for the operator-approved preview drill.
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const project = 'prj_RRYb5o7zx5CaHbmCAYzzDY8bb33Q';
const team = 'team_bOdbOHK6yluaErCcwM1iZaUD';
const preview = process.env.MONITOR_PREVIEW_DEPLOYMENT;
if (!/^dpl_[A-Za-z0-9]+$/.test(preview ?? '')) process.exit(1);
console.log(JSON.stringify({ tokenPresent: Boolean(process.env.VERCEL_TOKEN) }));
const requestLogs = new URLSearchParams({ projectId: project, ownerId: team, teamId: team,
	page: '0', startDate: String(Date.now() - 2_700_000), endDate: String(Date.now()), deploymentId: preview, level: 'error,fatal' });
for (const [stage, path] of [['project', `/v9/projects/${project}?teamId=${team}`], ['deployment', `/v13/deployments/${preview}?teamId=${team}`],
	['project-request-logs', `/v1/projects/${project}/request-logs?${requestLogs}`]]) {
	try {
		const response = await fetch(`https://api.vercel.com${path}`, {
			headers: { Authorization: `Bearer ${process.env.VERCEL_TOKEN}` }, redirect: 'error', signal: AbortSignal.timeout(15_000),
		});
		console.log(JSON.stringify({ stage, httpStatus: response.status }));
		await response.body?.cancel();
	} catch { console.log(JSON.stringify({ stage, networkFailure: true })); }
}
const reasons = new Set(['permission_denied', 'not_found', 'invalid_arguments', 'plan_upgrade_required', 'rate_limited', 'authentication_required', 'api_error']);
for (const source of ['runtime', 'requests']) {
	try {
		const response = await fetch(`https://api.vercel.com/v1/observability/events?teamId=${team}`, {
			method: 'POST', redirect: 'error', signal: AbortSignal.timeout(15_000),
			headers: { Authorization: `Bearer ${process.env.VERCEL_TOKEN}`, 'Content-Type': 'application/json', 'x-vercel-observability-query-reason': `cli/logs-${source}` },
			body: JSON.stringify({ event: source === 'runtime' ? 'vercel.log' : 'vercel.proxy_response',
				scope: { ownerId: team, projectIds: [project] },
				timeRange: { start: new Date(Date.now() - 300_000).toISOString(), end: new Date().toISOString() },
				select: source === 'runtime' ? ['level', 'truncated'] : ['httpStatus'], order: 'desc', limit: 1,
				filter: `deploymentId:"${preview}" AND ${source === 'runtime' ? 'level:(error OR fatal)' : 'NOT pathType:"background_func" AND httpStatus >=500'}`,
			}),
		});
		console.log(JSON.stringify({ stage: `${source}-api`, httpStatus: response.status }));
		await response.body?.cancel();
	} catch { console.log(JSON.stringify({ stage: `${source}-api`, networkFailure: true })); }
	try {
		await promisify(execFile)('vercel', ['logs', source, '--project', project, '--since', '45m', '--limit', '100', '--json', '--query',
			source === 'runtime' ? 'level:(error OR fatal)' : 'httpStatus >=500', '--deployment', preview,
		], { encoding: 'utf8', timeout: 45_000, maxBuffer: 4 * 1024 * 1024, env: { ...process.env, VERCEL_ORG_ID: team, VERCEL_PROJECT_ID: project } });
		console.log(JSON.stringify({ source, exitCode: 0 }));
	} catch (error) {
		let reason = 'unstructured_error', httpStatus = 0;
		for (const line of String(error.stderr ?? '').split('\n')) {
			try {
				const row = JSON.parse(line);
				if (row.status !== 'error') continue;
				if (reasons.has(row.reason)) reason = row.reason;
				if (Number.isInteger(row.data?.httpStatus) && row.data.httpStatus >= 100 && row.data.httpStatus <= 599) httpStatus = row.data.httpStatus;
			} catch { /* Never publish unstructured error text. */ }
		}
		console.log(JSON.stringify({ source, exitCode: Number.isInteger(error.code) ? error.code : -1, reason, httpStatus }));
	}
}
