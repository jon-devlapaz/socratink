const project = 'prj_RRYb5o7zx5CaHbmCAYzzDY8bb33Q', team = 'team_bOdbOHK6yluaErCcwM1iZaUD';
const counts = { runtimeErrors: 0, http5xx: 0, ignoredPgSslWarnings: 0, readFailures: 0, incompleteReads: 0, invalidTarget: 0 };
const pgWarning = /^\(node:\d+\) Warning: SECURITY WARNING: The SSL modes 'prefer', 'require', and 'verify-ca' are treated as aliases for 'verify-full'\./;
const preview = process.env.MONITOR_PREVIEW_DEPLOYMENT;
if (preview && !/^dpl_[A-Za-z0-9]+$/.test(preview)) counts.invalidTarget = 1;
const end = Date.now(), start = end - 2_700_000;
const environment = preview ? 'preview' : 'production';

for (const source of counts.invalidTarget ? [] : ['runtime', 'requests']) {
	try {
		if (!process.env.VERCEL_TOKEN) throw new Error();
		const query = new URLSearchParams({ projectId: project, ownerId: team, teamId: team,
			page: '0', startDate: String(start), endDate: String(end),
			...(preview ? { deploymentId: preview } : { environment }),
			...(source === 'runtime' ? { level: 'error,fatal' } : { statusCode: '5xx' }) });
		const response = await fetch(`https://api.vercel.com/v1/projects/${project}/request-logs?${query}`, {
			headers: { Authorization: `Bearer ${process.env.VERCEL_TOKEN}` }, redirect: 'error', signal: AbortSignal.timeout(45_000),
		});
		if (!response.ok) { await response.body?.cancel(); throw new Error(); }
		let bytes = 0, body = '';
		const decoder = new TextDecoder();
		for await (const chunk of response.body) {
			bytes += chunk.byteLength;
			if (bytes > 4 * 1024 * 1024) break;
			body += decoder.decode(chunk, { stream: true });
		}
		if (bytes > 4 * 1024 * 1024) { counts.incompleteReads++; continue; }
		const data = JSON.parse(body + decoder.decode());
		if (!Array.isArray(data?.rows) || data.hasMoreRows !== false || data.rows.length > 100) {
			counts.incompleteReads++; continue;
		}
		let incomplete = false;
		for (const row of data.rows) {
			if (!row || typeof row.timestamp !== 'string' || !Number.isFinite(Date.parse(row.timestamp))) throw new Error();
			if (Date.parse(row.timestamp) < start || Date.parse(row.timestamp) > end) { incomplete = true; continue; }
			if (row.environment !== undefined && row.environment !== environment) throw new Error();
			if (row.projectId !== undefined && row.projectId !== project) throw new Error();
			if (row.deploymentId !== undefined && (typeof row.deploymentId !== 'string' || !/^dpl_[A-Za-z0-9]+$/.test(row.deploymentId)
				|| (preview && row.deploymentId !== preview))) throw new Error();
			if (source === 'runtime' && row.logs === undefined) { incomplete = true; continue; }
			if (row.logs !== undefined && !Array.isArray(row.logs)) throw new Error();
			for (const log of row.logs ?? []) {
				if (!log || !['error', 'fatal', 'info', 'warning'].includes(log.level) || typeof log.message !== 'string'
					|| (log.messageTruncated !== undefined && typeof log.messageTruncated !== 'boolean')) throw new Error();
				if (log.messageTruncated === true) { incomplete = true; continue; }
				if (source !== 'runtime' || !['error', 'fatal'].includes(log.level)) continue;
				if (log.level === 'error' && pgWarning.test(log.message)) counts.ignoredPgSslWarnings++;
				else counts.runtimeErrors++;
			}
			if (source === 'requests') {
				if (!Number.isInteger(row.statusCode) || row.statusCode < 500 || row.statusCode > 599) throw new Error();
				counts.http5xx++;
			}
		}
		if (incomplete) counts.incompleteReads++;
	} catch {
		// Response bodies and errors can contain private learner/provider content.
		counts.readFailures++;
	}
}

console.log(JSON.stringify(counts));
process.exitCode = counts.runtimeErrors + counts.http5xx + counts.readFailures + counts.incompleteReads + counts.invalidTarget > 0 ? 1 : 0;
