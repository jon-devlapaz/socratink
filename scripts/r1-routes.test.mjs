import assert from 'node:assert/strict';
import { execFile, spawn } from 'node:child_process';
import { access, mkdtemp, readFile, stat, unlink, writeFile } from 'node:fs/promises';
import { request as httpRequest } from 'node:http';
import { createServer } from 'node:net';
import { networkInterfaces, tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { INTERVENTION_TEXT, RUBRIC } from '../src/r1/fixture.ts';
import { createR1Router, projectLearnerView } from '../src/r1/routes.ts';
import { R1Store } from '../src/r1/store.ts';

const run = promisify(execFile);
const directory = await mkdtemp(join(tmpdir(), 'socratink-r1-routes-'));
const reviewToken = 'review-token-with-at-least-thirty-two-bytes';
const correctionToken = 'correction-token-with-at-least-thirty-two-bytes';
const environment = {
	...process.env,
	NODE_ENV: 'test',
	SOCRATINK_R1_LOCAL: '1',
	SOCRATINK_R1_REVIEW_TOKEN: reviewToken,
	SOCRATINK_R1_REVIEWER_ID: 'human-reviewer',
	SOCRATINK_R1_CORRECTION_TOKEN: correctionToken,
	SOCRATINK_R1_CORRECTION_REVIEWER_ID: 'human-correction-reviewer',
	SOCRATINK_R1_DATA_DIR: directory,
};
let routeNow = new Date('2026-08-24T12:00:00.000Z');
const clock = () => routeNow;

assert.equal(await createR1Router({ environment: {} }), undefined);
const store = await R1Store.fromEnvironment(environment, { clock });
assert.ok(store);
await assert.rejects(() => createR1Router({ store, testPeerAddress: '127.0.0.1' }), /NODE_ENV=test/);
const router = await createR1Router({ store, environment, testPeerAddress: '127.0.0.1' });
assert.ok(router);
const deniedPeerRouter = await createR1Router({ store, environment, testPeerAddress: '192.168.1.9' });
assert.ok(deniedPeerRouter);

async function request(path, init = {}) {
	return router.request(`http://localhost${path}`, init);
}

async function json(response) {
	return response.json();
}

function rawPostStatus(port, host) {
	return new Promise((resolve, reject) => {
		const outgoing = httpRequest({ hostname: '127.0.0.1', port, path: '/api/r1/encounters', method: 'POST', headers: { host, 'content-type': 'application/json', 'content-length': '2' } }, (incoming) => {
			incoming.resume();
			incoming.on('end', () => resolve(incoming.statusCode));
		});
		outgoing.on('error', reject);
		outgoing.end('{}');
	});
}

let response = await router.request('http://example.com/encounters', {
	method: 'POST',
	headers: { 'content-type': 'application/json', host: 'example.com' },
	body: '{}',
});
assert.equal(response.status, 403);
response = await deniedPeerRouter.request('http://localhost/encounters', {
	method: 'POST',
	headers: { 'content-type': 'application/json' },
	body: '{}',
});
assert.equal(response.status, 403);
response = await request('/encounters', {
	method: 'POST',
	headers: { 'content-type': 'application/json', 'x-forwarded-host': 'example.com' },
	body: '{}',
});
assert.equal(response.status, 403);

response = await request('/encounters', { method: 'POST', body: '{}' });
assert.equal(response.status, 415);
response = await request('/encounters', {
	method: 'POST',
	headers: { 'content-type': 'application/json' },
	body: '[]',
});
assert.equal(response.status, 400);
response = await request('/encounters', {
	method: 'POST',
	headers: { 'content-type': 'application/json' },
	body: JSON.stringify({ synthetic: true, extra: true }),
});
assert.equal(response.status, 400);
response = await request('/encounters', {
	method: 'POST',
	headers: { 'content-type': 'application/json' },
	body: JSON.stringify({ padding: 'x'.repeat(129 * 1024) }),
});
assert.equal(response.status, 413);

response = await request('/encounters', {
	method: 'POST',
	headers: { 'content-type': 'application/json; charset=utf-8' },
	body: JSON.stringify({ synthetic: true }),
});
assert.equal(response.status, 201);
const created = await json(response);
const { capabilityToken } = created;
const encounterId = created.encounter.encounterId;
assert.equal(created.encounter.synthetic, true);
assert.equal(created.encounter.state, 'baseline_open');
assert.equal(created.encounter.currentPrompt.scenarioId, 'refund-region');
assert.equal(JSON.stringify(created.encounter).includes('expected'), false);
assert.equal(JSON.stringify(created.encounter).includes('capabilityHash'), false);
assert.equal(JSON.stringify(created.encounter).includes('adjudications'), false);
assert.equal(JSON.stringify(created.encounter).includes('processedRequests'), false);
assert.equal(created.encounter.currentPrompt.openedAt, '2026-08-24T12:00:00.000Z');

response = await request(`/encounters/${encounterId}`);
assert.equal(response.status, 403);
response = await request(`/encounters/${encounterId}`, { headers: { authorization: 'Bearer wrong' } });
assert.equal(response.status, 403);
response = await request(`/encounters/${encounterId}`, { headers: { authorization: `Bearer ${capabilityToken}` } });
assert.equal(response.status, 200);

const conditions = {
	sourceClosed: true,
	assistance: 'none',
	assistanceDeclaration: 'I used no assistance.',
	sourceAccessDeclaration: 'I did not open the source.',
	observationScope: 'current_page_session',
	elapsedMs: 10_000,
	pasteEventCount: 0,
	pastedCharacterCount: 0,
};
const baselineResponse = 'Yes. The invoice exists and the amount is within the balance, so execute it.';
response = await request(`/encounters/${encounterId}/commands`, {
	method: 'POST',
	headers: { authorization: `Bearer ${capabilityToken}`, 'content-type': 'application/json' },
	body: JSON.stringify({ type: 'adjudicate_baseline', requestId: 'bad', expectedRevision: 0 }),
});
assert.equal(response.status, 400);
response = await request(`/encounters/${encounterId}/commands`, {
	method: 'POST',
	headers: { authorization: `Bearer ${capabilityToken}`, 'content-type': 'application/json' },
	body: JSON.stringify({ type: 'submit_baseline', requestId: 'submit-1', expectedRevision: 0, response: baselineResponse, conditions: { ...conditions, privateNote: 'must not persist' } }),
});
assert.equal(response.status, 400);
const { observationScope: omittedScope, ...unscopedConditions } = conditions;
assert.equal(omittedScope, 'current_page_session');
response = await request(`/encounters/${encounterId}/commands`, {
	method: 'POST',
	headers: { authorization: `Bearer ${capabilityToken}`, 'content-type': 'application/json' },
	body: JSON.stringify({ type: 'submit_baseline', requestId: 'submit-unscoped', expectedRevision: 0, response: baselineResponse, conditions: unscopedConditions }),
});
assert.equal(response.status, 400);
response = await request(`/encounters/${encounterId}/commands`, {
	method: 'POST',
	headers: { authorization: `Bearer ${capabilityToken}`, 'content-type': 'application/json' },
	body: JSON.stringify({ type: 'submit_baseline', requestId: 'submit-1', expectedRevision: 0, response: baselineResponse, conditions, reviewerId: 'smuggled' }),
});
assert.equal(response.status, 400);
response = await request(`/encounters/${encounterId}/commands`, {
	method: 'POST',
	headers: { authorization: `Bearer ${capabilityToken}`, 'content-type': 'application/json' },
	body: JSON.stringify({ type: 'submit_baseline', requestId: 'submit-1', expectedRevision: 0, response: baselineResponse, conditions }),
});
assert.equal(response.status, 200);
assert.equal((await json(response)).encounter.state, 'baseline_submitted');

const criteria = RUBRIC.map(({ id }) => ({ criterionId: id, status: 'not_met', excerpt: baselineResponse }));
const adjudicationPath = join(directory, 'baseline-adjudication.json');
await writeFile(adjudicationPath, `${JSON.stringify({ requestId: 'review-1', expectedRevision: 1, criteria })}\n`, 'utf8');

const liveRouter = await createR1Router({ store, environment: { ...environment, NODE_ENV: 'production' } });
assert.ok(liveRouter);
response = await liveRouter.request('http://localhost/encounters', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' });
assert.equal(response.status, 403);
const liveApp = new Hono();
liveApp.route('/api/r1', liveRouter);
let resolveAddress;
const listening = new Promise((resolve) => { resolveAddress = resolve; });
const server = serve({ fetch: liveApp.fetch, hostname: '127.0.0.1', port: 0 }, (info) => resolveAddress(info));
const address = await listening;
const baseUrl = `http://127.0.0.1:${address.port}/api/r1`;
environment.SOCRATINK_R1_BASE_URL = baseUrl;

assert.equal(await rawPostStatus(address.port, 'example.com'), 403);
response = await fetch(`${baseUrl}/encounters`, {
	method: 'POST',
	headers: { 'content-type': 'application/json' },
	body: JSON.stringify({ synthetic: true }),
});
assert.equal(response.status, 201);
const socketCreated = await response.json();
assert.equal(socketCreated.encounter.state, 'baseline_open');
const lanAddress = Object.values(networkInterfaces()).flat().find((entry) => entry && entry.family === 'IPv4' && !entry.internal)?.address;
if (lanAddress) {
	await assert.rejects(() => fetch(`http://${lanAddress}:${address.port}/api/r1/encounters`, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: '{}',
	}));
}

const review = await run(process.execPath, ['scripts/r1-review.mjs', 'adjudicate-baseline', encounterId, adjudicationPath], {
	cwd: process.cwd(),
	env: environment,
});
assert.deepEqual(JSON.parse(review.stdout), {
	state: 'intervention_eligible',
	revision: 2,
	adjudicationOutcome: 'distinction_not_observed',
});
assert.equal(review.stdout.includes(reviewToken), false);
assert.equal(review.stdout.includes('capability'), false);

const shown = await run(process.execPath, ['scripts/r1-review.mjs', 'show', encounterId], {
	cwd: process.cwd(),
	env: environment,
});
assert.equal(shown.stdout.includes(baselineResponse), true);
assert.equal(shown.stdout.includes('capabilityHash'), false);
assert.equal(shown.stdout.includes(reviewToken), false);
assert.equal(shown.stdout.includes(directory), false);
const inspector = JSON.parse(shown.stdout);
for (const field of ['fixtureId', 'targetId', 'rubricId', 'evidenceContractId', 'rubric', 'prompts', 'evidenceEvents', 'reveals', 'policyDecisions', 'adjudications', 'claims', 'obligations', 'state', 'revision', 'retentionExpiresAt', 'synthetic']) {
	assert.ok(field in inspector, `review inspector omitted ${field}`);
}
assert.equal(shown.stdout.includes('learnerParticipantId'), false);
assert.equal(inspector.adjudications[0].reviewerKind, 'human');
assert.equal(typeof inspector.adjudications[0].rubricId, 'string');
for (const field of ['overlapObservation', 'feedbackOverlapSpans', 'scenarioReasoningExcerpt', 'supersedesAdjudicationId']) {
	assert.ok(field in inspector.adjudications[0], `review adjudication omitted ${field}`);
}
assert.ok('supersedesClaimId' in inspector.claims[0]);
assert.ok('terminalReason' in inspector);

const raceCreatedResponse = await fetch(`${baseUrl}/encounters`, {
	method: 'POST',
	headers: { 'content-type': 'application/json' },
	body: JSON.stringify({ synthetic: true }),
});
const raceCreated = await raceCreatedResponse.json();
await fetch(`${baseUrl}/encounters/${raceCreated.encounter.encounterId}/commands`, {
	method: 'POST',
	headers: { authorization: `Bearer ${raceCreated.capabilityToken}`, 'content-type': 'application/json' },
	body: JSON.stringify({ type: 'submit_baseline', requestId: 'race-submit', expectedRevision: 0, response: baselineResponse, conditions }),
});
const raceBody = (requestId) => JSON.stringify({ type: 'adjudicate_baseline', requestId, expectedRevision: 1, criteria });
const raceResults = await Promise.all([
	fetch(`${baseUrl}/review/encounters/${raceCreated.encounter.encounterId}/commands`, { method: 'POST', headers: { 'x-r1-review-token': reviewToken, 'content-type': 'application/json' }, body: raceBody('race-review-a') }),
	fetch(`${baseUrl}/review/encounters/${raceCreated.encounter.encounterId}/commands`, { method: 'POST', headers: { 'x-r1-review-token': reviewToken, 'content-type': 'application/json' }, body: raceBody('race-review-b') }),
]);
assert.deepEqual(raceResults.map((item) => item.status).sort(), [200, 409]);

response = await request(`/encounters/${encounterId}/commands`, {
	method: 'POST',
	headers: { authorization: `Bearer ${capabilityToken}`, 'content-type': 'application/json' },
	body: JSON.stringify({ type: 'persist_intervention', requestId: 'reveal-1', expectedRevision: 2 }),
});
assert.equal(response.status, 200);
const revealed = (await json(response)).encounter;
assert.equal(revealed.state, 'post_open');
assert.equal(revealed.currentPrompt.scenarioId, 'release-version');
assert.equal(typeof revealed.feedback, 'string');
const persistedBeforeResponseUse = JSON.parse(await readFile(join(directory, `${encounterId}.json`), 'utf8'));
assert.equal(persistedBeforeResponseUse.revision, 3);
assert.equal(persistedBeforeResponseUse.reveals.length, 1);
const corruptRevealProjection = projectLearnerView({
	...persistedBeforeResponseUse,
	reveals: [{ ...persistedBeforeResponseUse.reveals[0], text: 'Different feedback.' }],
});
assert.equal(corruptRevealProjection.feedback, null);
assert.equal(corruptRevealProjection.currentPrompt, null);

const copiedPost = `${INTERVENTION_TEXT} For v2..4, authorization passes but validity fails, so do not deploy it.`;
const postConditions = { ...conditions, assistance: 'fixed_feedback_only', assistanceDeclaration: 'I saw only the fixed Socratink feedback.' };
response = await fetch(`${baseUrl}/encounters/${encounterId}/commands`, {
	method: 'POST',
	headers: { authorization: `Bearer ${capabilityToken}`, 'content-type': 'application/json' },
	body: JSON.stringify({ type: 'submit_post', requestId: 'post-submit-1', expectedRevision: 3, response: copiedPost, conditions: postConditions }),
});
assert.equal(response.status, 200);
const copiedCriteria = RUBRIC.map(({ id }) => ({ criterionId: id, status: 'met', excerpt: copiedPost }));
const postAdjudicationPath = join(directory, 'post-adjudication.json');
await writeFile(postAdjudicationPath, `${JSON.stringify({ requestId: 'post-review-1', expectedRevision: 4, criteria: copiedCriteria })}\n`, 'utf8');
const postReview = await run(process.execPath, ['scripts/r1-review.mjs', 'adjudicate-post', encounterId, postAdjudicationPath], { cwd: process.cwd(), env: environment });
assert.equal(JSON.parse(postReview.stdout).adjudicationOutcome, 'assisted_nonqualifying');
const afterPost = await store.readForReview(encounterId, reviewToken);
const overlapAdjudication = afterPost.adjudications.at(-1);
const correctionBody = {
	type: 'correct_post_adjudication',
	requestId: 'post-correction-1',
	expectedRevision: 5,
	supersedesAdjudicationId: overlapAdjudication.id,
	criteria: copiedCriteria,
	scenarioReasoningExcerpt: 'For v2..4, authorization passes but validity fails, so do not deploy it.',
};
response = await fetch(`${baseUrl}/review/encounters/${encounterId}/commands`, {
	method: 'POST',
	headers: { 'x-r1-review-token': reviewToken, 'content-type': 'application/json' },
	body: JSON.stringify(correctionBody),
});
assert.equal(response.status, 403);
response = await fetch(`${baseUrl}/review/encounters/${encounterId}/commands`, {
	method: 'POST',
	headers: { 'x-r1-review-token': correctionToken, 'content-type': 'application/json' },
	body: JSON.stringify({ ...correctionBody, reviewerId: 'forged-label' }),
});
assert.equal(response.status, 400);
const correctionPath = join(directory, 'post-correction.json');
const { type: _, ...correctionFile } = correctionBody;
await writeFile(correctionPath, `${JSON.stringify(correctionFile)}\n`, 'utf8');
const corrected = await run(process.execPath, ['scripts/r1-review.mjs', 'correct-post', encounterId, correctionPath], { cwd: process.cwd(), env: environment });
assert.equal(JSON.parse(corrected.stdout).revision, 6);
assert.equal((await store.readForReview(encounterId, reviewToken)).adjudications.at(-1).reviewerId, 'human-correction-reviewer');

const blank = await request('/encounters', {
	method: 'POST',
	headers: { 'content-type': 'application/json' },
	body: '{}',
});
const blankCreated = await json(blank);
response = await request(`/encounters/${blankCreated.encounter.encounterId}/commands`, {
	method: 'POST',
	headers: { 'x-r1-capability': blankCreated.capabilityToken, 'content-type': 'application/json' },
	body: JSON.stringify({ type: 'submit_baseline', requestId: 'blank-1', expectedRevision: 0, response: '   ', conditions }),
});
assert.equal((await json(response)).encounter.state, 'stopped_invalid_or_ambiguous');

response = await request(`/encounters/${encounterId}`, {
	method: 'DELETE',
	headers: { authorization: `Bearer ${capabilityToken}`, 'content-type': 'application/json' },
	body: JSON.stringify({ requestId: 'purge-1', expectedRevision: 6 }),
});
assert.equal(response.status, 200);
assert.deepEqual(await json(response), { purged: true });
response = await request(`/encounters/${encounterId}`, { headers: { authorization: `Bearer ${capabilityToken}` } });
assert.equal(response.status, 404);

const expiredCreation = await request('/encounters', {
	method: 'POST',
	headers: { 'content-type': 'application/json' },
	body: '{}',
});
const expiredCreated = await json(expiredCreation);
routeNow = new Date('2026-09-01T12:00:00.000Z');
response = await request(`/encounters/${expiredCreated.encounter.encounterId}`, { headers: { authorization: 'Bearer wrong' } });
assert.equal(response.status, 403);
assert.equal(JSON.stringify(await json(response)).includes('purge'), false);
response = await request(`/encounters/${expiredCreated.encounter.encounterId}`, { headers: { authorization: `Bearer ${expiredCreated.capabilityToken}` } });
assert.equal(response.status, 410);
const expiredBody = await json(response);
assert.deepEqual(Object.keys(expiredBody).sort(), ['error', 'purge']);
assert.deepEqual(expiredBody.purge, {
	encounterId: expiredCreated.encounter.encounterId,
	revision: 0,
	retentionExpiresAt: expiredCreated.encounter.retentionExpiresAt,
});
assert.equal(JSON.stringify(expiredBody).includes('response'), false);
assert.equal(JSON.stringify(expiredBody).includes('claim'), false);
response = await request(`/encounters/${expiredCreated.encounter.encounterId}`, {
	method: 'DELETE',
	headers: { authorization: `Bearer ${expiredCreated.capabilityToken}`, 'content-type': 'application/json' },
	body: JSON.stringify({ requestId: 'purge-expired-route', expectedRevision: expiredBody.purge.revision }),
});
assert.equal(response.status, 200);
response = await request(`/encounters/${expiredCreated.encounter.encounterId}`, { headers: { authorization: `Bearer ${expiredCreated.capabilityToken}` } });
assert.equal(response.status, 404);

const corruptRecord = (await store.create({ synthetic: true })).record;
assert.equal(projectLearnerView({ ...corruptRecord, prompts: [] }).currentPrompt, null);
const corruptProjection = projectLearnerView({
	...corruptRecord,
	state: 'post_open',
	reveals: [],
});
assert.equal(corruptProjection.feedback, null);

const help = await run(process.execPath, ['scripts/r1-review.mjs', '--help'], { cwd: process.cwd(), env: {} });
assert.equal(help.stdout.includes('never pass it as an argument'), true);
await assert.rejects(
	() => run(process.execPath, ['scripts/r1-review.mjs', 'show', encounterId], { cwd: process.cwd(), env: { ...environment, SOCRATINK_R1_BASE_URL: 'https://example.com/api/r1' } }),
	(error) => error.stderr.includes('plain loopback HTTP URL'),
);

await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));

if (process.env.SOCRATINK_R1_TEST_BUILT_RUNNER === '1') {
	const runnerDirectory = await mkdtemp(join(tmpdir(), 'socratink-r1-built-runner-'));
	const lockPath = join(runnerDirectory, '.writer.lock');
	async function availablePort() {
		return new Promise((resolve, reject) => {
			const probe = createServer();
			probe.once('error', reject);
			probe.listen(0, '127.0.0.1', () => {
				const probeAddress = probe.address();
				const selected = typeof probeAddress === 'object' && probeAddress ? probeAddress.port : undefined;
				probe.close((error) => error ? reject(error) : resolve(selected));
			});
		});
	}
	function launchRunner(port) {
		const child = spawn(process.execPath, ['scripts/r1-local.mjs'], {
			cwd: process.cwd(),
			env: { ...environment, NODE_ENV: 'production', PORT: String(port), SOCRATINK_R1_DATA_DIR: runnerDirectory },
			stdio: ['ignore', 'pipe', 'pipe'],
		});
		let output = '';
		child.stdout.on('data', (chunk) => { output += chunk; });
		child.stderr.on('data', (chunk) => { output += chunk; });
		return { child, output: () => output };
	}
	async function waitUntilReady(runner, port) {
		for (let attempt = 0; attempt < 60; attempt += 1) {
			if (runner.child.exitCode !== null || runner.child.signalCode !== null) throw new Error(`R1 local runner exited early: ${runner.output()}`);
			try {
				return await fetch(`http://127.0.0.1:${port}/api/r1/encounters`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' });
			} catch {
				await new Promise((resolve) => setTimeout(resolve, 50));
			}
		}
		throw new Error(`R1 local runner did not become ready: ${runner.output()}`);
	}
	async function waitForExit(child) {
		if (child.exitCode !== null || child.signalCode !== null) return;
		await new Promise((resolve) => child.once('exit', resolve));
	}

	const port = await availablePort();
	let runner = launchRunner(port);
	try {
		const runnerResponse = await waitUntilReady(runner, port);
		assert.equal(runnerResponse.status, 201);
		assert.equal((await stat(lockPath)).mode & 0o777, 0o600);
		const lockMetadata = JSON.parse(await readFile(lockPath, 'utf8'));
		assert.deepEqual(Object.keys(lockMetadata).sort(), ['createdAt', 'nonce', 'pid', 'schemaVersion']);
		assert.equal(lockMetadata.pid, runner.child.pid);
		if (lanAddress) {
			await assert.rejects(() => fetch(`http://${lanAddress}:${port}/api/r1/encounters`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' }));
		}

		const competingPort = await availablePort();
		await assert.rejects(
			() => run(process.execPath, ['scripts/r1-local.mjs'], { cwd: process.cwd(), env: { ...environment, NODE_ENV: 'production', PORT: String(competingPort), SOCRATINK_R1_DATA_DIR: runnerDirectory } }),
			(error) => error.stderr.includes('already has a live writer'),
		);
		await assert.rejects(() => fetch(`http://127.0.0.1:${competingPort}/api/r1/encounters`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' }));

		runner.child.kill('SIGKILL');
		await waitForExit(runner.child);
		await access(lockPath);
		const replacementPort = await availablePort();
		runner = launchRunner(replacementPort);
		assert.equal((await waitUntilReady(runner, replacementPort)).status, 201);
		runner.child.kill('SIGTERM');
		await waitForExit(runner.child);
		await assert.rejects(() => access(lockPath), (error) => error.code === 'ENOENT');

		await writeFile(lockPath, 'not-json\n', { encoding: 'utf8', mode: 0o600 });
		const malformedPort = await availablePort();
		await assert.rejects(
			() => run(process.execPath, ['scripts/r1-local.mjs'], { cwd: process.cwd(), env: { ...environment, NODE_ENV: 'production', PORT: String(malformedPort), SOCRATINK_R1_DATA_DIR: runnerDirectory } }),
			(error) => error.stderr.includes('Malformed R1 writer lock'),
		);
		assert.equal(await readFile(lockPath, 'utf8'), 'not-json\n');
		await unlink(lockPath);
	} finally {
		if (runner.child.exitCode === null && runner.child.signalCode === null) {
			runner.child.kill('SIGTERM');
			await waitForExit(runner.child);
		}
	}
}

console.log('R1 route and reviewer CLI tests passed');
