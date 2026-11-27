import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const deployments = 'repos/jon-devlapaz/socratink/deployments';
const vercel = 'vercel[bot]';

function github(endpoint) {
	return JSON.parse(execFileSync('gh', ['api', endpoint], { encoding: 'utf8', timeout: 15_000 }));
}

export function readProductionDeployment(read = github) {
	const [deployment] = read(`${deployments}?environment=Production&per_page=1`);
	assert.ok(deployment?.environment === 'Production' && deployment.creator?.login === vercel
		&& Number.isSafeInteger(deployment.id) && /^[a-f0-9]{40}$/u.test(deployment.sha),
		'GitHub did not return a Vercel production deployment with a commit.');
	const [status] = read(`${deployments}/${deployment.id}/statuses?per_page=1`);
	assert.ok(status?.state === 'success' && status.creator?.login === vercel,
		'The latest Vercel production deployment must succeed before this check can verify it.');
	assert.match(status.environment_url ?? '', /^https:\/\/\S+$/u, 'The production deployment must have a URL.');
	return { builtFrom: deployment.sha, deploymentUrl: status.environment_url };
}
