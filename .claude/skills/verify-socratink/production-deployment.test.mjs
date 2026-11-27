import assert from 'node:assert/strict';
import test from 'node:test';
import { readProductionDeployment } from './production-deployment.mjs';

const creator = { login: 'vercel[bot]' };
const deployed = {
	id: 42, environment: 'Production', creator, sha: 'ce7e311340a9410fd9b91a2bf462545c5aa13f9c',
};
const deploymentUrl = 'https://socratink-release.vercel.app';
const success = { state: 'success', creator, environment_url: deploymentUrl };

function readWithStatus(status) {
	return readProductionDeployment(endpoint => {
		if (endpoint === 'repos/jon-devlapaz/socratink/deployments?environment=Production&per_page=1') return [deployed];
		assert.equal(endpoint, 'repos/jon-devlapaz/socratink/deployments/42/statuses?per_page=1');
		return [status, success];
	});
}

test('the production commit and URL come from the same successful Vercel deployment', () => {
	assert.deepEqual(readWithStatus(success), { builtFrom: deployed.sha, deploymentUrl });
});

test('an earlier successful status cannot verify a pending production deployment', () => {
	assert.throws(() => readWithStatus({ ...success, state: 'in_progress' }), /must succeed/);
});

test('a deployment without a URL cannot verify production', () => {
	assert.throws(() => readWithStatus({ ...success, environment_url: '' }), /must have a URL/);
});
