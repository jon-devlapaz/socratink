const repository = 'https://api.github.com/repos/jon-devlapaz/socratink';
const counts = { cadenceGaps: 0, missingBaseline: 0, readFailures: 0 };

// One transient GitHub failure (network, 429 or 5xx) gets one retry, so a
// single blip does not page; a repeat, or any other status, still fails closed.
async function readMetadata(path, retry = true) {
	let response;
	try {
		response = await fetch(`${repository}${path}`, {
			headers: {
				Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
				Accept: 'application/vnd.github+json',
				'X-GitHub-Api-Version': '2026-03-10',
			},
			redirect: 'error',
			signal: AbortSignal.timeout(10_000),
		});
	} catch (error) {
		if (!retry) throw error;
		await new Promise((done) => setTimeout(done, 1000));
		return readMetadata(path, false);
	}
	if (!response.ok || !response.body) {
		await response.body?.cancel();
		if (retry && (response.status === 429 || response.status >= 500)) {
			await new Promise((done) => setTimeout(done, 1000));
			return readMetadata(path, false);
		}
		throw new Error();
	}
	const chunks = [];
	let bytes = 0;
	for await (const chunk of response.body) {
		bytes += chunk.byteLength;
		if (bytes > 1024 * 1024) throw new Error();
		chunks.push(chunk);
	}
	return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

try {
	const currentRun = process.env.GITHUB_RUN_ID;
	if (!process.env.GITHUB_TOKEN || !/^[1-9]\d*$/.test(currentRun ?? '')) throw new Error();
	const result = await readMetadata('/actions/workflows/runtime-monitor.yml/runs?branch=main&status=completed&per_page=10&page=1');
	if (!Array.isArray(result.workflow_runs) || result.workflow_runs.length > 10) throw new Error();
	let latestScan = null;
	for (const run of result.workflow_runs) {
		if (!Number.isSafeInteger(run.id) || run.id <= 0 || run.head_branch !== 'main' || run.status !== 'completed') throw new Error();
		if (String(run.id) === currentRun) continue;
		const result = await readMetadata(`/actions/runs/${run.id}/jobs?filter=latest&per_page=10&page=1`);
		if (!Array.isArray(result.jobs) || result.jobs.length > 10 || result.total_count !== result.jobs.length) throw new Error();
		for (const job of result.jobs) {
			if (job.name !== 'Production monitor') continue;
			if (!Array.isArray(job.steps)) throw new Error();
			for (const step of job.steps) {
				if (step.name !== 'Check runtime failures' || step.conclusion !== 'success') continue;
				const started = typeof step.started_at === 'string' ? Date.parse(step.started_at) : NaN;
				if (!Number.isFinite(started) || started > Date.now()) throw new Error();
				latestScan = Math.max(latestScan ?? started, started);
			}
		}
	}
	// Step start is a conservative bound on the scan's 45-minute window end.
	// A successful scan counts even when the same run reported an earlier gap.
	if (latestScan === null) counts.missingBaseline = 1;
	else if (Date.now() - latestScan > 2_700_000) counts.cadenceGaps = 1;
} catch {
	counts.readFailures = 1;
}

console.log(JSON.stringify(counts));
process.exitCode = Object.values(counts).some(Boolean) ? 1 : 0;
