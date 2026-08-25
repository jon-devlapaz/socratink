import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { RUBRIC } from '../src/r1/fixture.ts';
import { projectLearnerReceipt } from '../src/r1/record.ts';
import { R1Store } from '../src/r1/store.ts';

const directory = await mkdtemp(join(tmpdir(), 'socratink-r1-'));
const reviewToken = 'review-token-with-at-least-thirty-two-bytes';
const correctionToken = 'correction-token-with-at-least-thirty-two-bytes';
let clock = new Date('2026-08-24T12:00:00.000Z');
const environment = { SOCRATINK_R1_LOCAL: '1', SOCRATINK_R1_REVIEW_TOKEN: reviewToken, SOCRATINK_R1_REVIEWER_ID: 'human-2', SOCRATINK_R1_CORRECTION_TOKEN: correctionToken, SOCRATINK_R1_CORRECTION_REVIEWER_ID: 'human-3', SOCRATINK_R1_DATA_DIR: directory };
const disabled = await R1Store.fromEnvironment({});
assert.equal(disabled, undefined);
await assert.rejects(() => R1Store.fromEnvironment({ SOCRATINK_R1_LOCAL: '1', SOCRATINK_R1_REVIEW_TOKEN: 'short', SOCRATINK_R1_DATA_DIR: directory }), /32 bytes/);
await assert.rejects(() => R1Store.fromEnvironment({ SOCRATINK_R1_LOCAL: '1', SOCRATINK_R1_REVIEW_TOKEN: reviewToken, SOCRATINK_R1_DATA_DIR: directory }), /REVIEWER_ID/);
await assert.rejects(() => R1Store.fromEnvironment({ ...environment, SOCRATINK_R1_CORRECTION_TOKEN: reviewToken }), /must be distinct/);
await assert.rejects(() => R1Store.fromEnvironment({ ...environment, SOCRATINK_R1_CORRECTION_REVIEWER_ID: 'human-2' }), /must be nonempty, distinct/);
await assert.rejects(() => R1Store.fromEnvironment({ ...environment, SOCRATINK_R1_CORRECTION_REVIEWER_ID: undefined }), /configured together/);
const store = await R1Store.fromEnvironment(environment, { clock: () => clock });
assert.ok(store);
const { record: created, capabilityToken } = await store.create({ synthetic: true });
assert.equal((await stat(directory)).mode & 0o777, 0o700);
const path = join(directory, `${created.encounterId}.json`);
assert.equal((await stat(path)).mode & 0o777, 0o600);
const disk = await readFile(path, 'utf8');
assert.equal(disk.includes(capabilityToken), false);
assert.equal(disk.includes(reviewToken), false);

const conditions = { sourceClosed: true, assistance: 'none', assistanceDeclaration: 'none', sourceAccessDeclaration: 'closed', observationScope: 'current_page_session', elapsedMs: 1, pasteEventCount: 0, pastedCharacterCount: 0 };
const response = 'The request should not execute. Its form passes, but the actor is not authorized for the US invoice. Passing validity is not permission; both checks precede the refund or money could move improperly.';
const submitCommand = { type: 'submit_baseline', requestId: 'req-1', expectedRevision: 0, response, conditions };
const submitted = await store.mutate(created.encounterId, capabilityToken, submitCommand);
assert.equal(submitted.revision, 1);
const retried = await store.mutate(created.encounterId, capabilityToken, submitCommand);
assert.equal(retried.revision, 1);
assert.equal(retried.evidenceEvents[0]?.response, response);
await assert.rejects(() => store.mutate(created.encounterId, capabilityToken, { ...submitCommand, response: 'different' }), /different command/);
await assert.rejects(() => store.mutate(created.encounterId, capabilityToken, { type: 'persist_intervention', requestId: 'req-1', expectedRevision: 0 }), /different command/);
await assert.rejects(() => store.mutate(created.encounterId, capabilityToken, { type: 'adjudicate_baseline', requestId: 'learner-review', expectedRevision: 1, reviewerId: 'human-2', criteria: [] }), /cannot adjudicate/);
await assert.rejects(() => store.mutate(created.encounterId, capabilityToken, { type: 'persist_intervention', requestId: 'stale', expectedRevision: 0 }), /Revision conflict/);
await assert.rejects(() => store.read(created.encounterId, 'wrong-token'), /denied/);
await assert.rejects(() => store.readForReview(created.encounterId, correctionToken), /denied/);

const observations = RUBRIC.map(({ id }) => ({ criterionId: id, status: 'met', excerpt: response }));
const reviewed = await store.mutateAsReviewer(created.encounterId, reviewToken, { type: 'adjudicate_baseline', requestId: 'req-2', expectedRevision: 1, criteria: observations });
assert.equal(reviewed.state, 'baseline_complete_no_intervention');
const lateRetry = await store.mutate(created.encounterId, capabilityToken, submitCommand);
assert.equal(lateRetry.revision, 1);
assert.equal(lateRetry.state, 'baseline_submitted');
await assert.rejects(() => store.mutateAsReviewer(created.encounterId, 'wrong-token-that-is-still-long-enough-1234', { type: 'adjudicate_baseline', requestId: 'x', expectedRevision: 1, criteria: observations }), /denied/);
await assert.rejects(() => store.mutateAsReviewer(created.encounterId, reviewToken, { type: 'adjudicate_baseline', requestId: 'caller-id', expectedRevision: 1, reviewerId: 'caller-controlled', criteria: observations }), /server configuration/);

const restarted = await R1Store.fromEnvironment(environment, { clock: () => clock });
assert.ok(restarted);
const replayed = await restarted.read(created.encounterId, capabilityToken);
assert.deepEqual(projectLearnerReceipt(replayed), projectLearnerReceipt(reviewed));
assert.equal(replayed.reveals.length, 0);
assert.equal(replayed.obligations.length, 0);
await writeFile(join(directory, `.${created.encounterId}.incomplete.tmp`), '{not-json', 'utf8');
await writeFile(join(directory, `.${created.encounterId}.second.tmp`), '{also-not-json', 'utf8');
await writeFile(join(directory, '.unrelated.tmp'), 'keep', 'utf8');
assert.equal((await restarted.read(created.encounterId, capabilityToken)).revision, 2);
const run = promisify(execFile);
const childScript = `import { R1Store } from './src/r1/store.ts'; const store = await R1Store.fromEnvironment(process.env); const record = await store.read(process.argv[1], process.argv[2]); console.log(record.revision);`;
const child = await run(process.execPath, ['--input-type=module', '--eval', childScript, created.encounterId, capabilityToken], { cwd: process.cwd(), env: { ...process.env, ...environment } });
assert.equal(child.stdout.trim(), '2');

const race = await restarted.create({ synthetic: true });
const raceResults = await Promise.allSettled([
	restarted.mutate(race.record.encounterId, race.capabilityToken, { type: 'submit_baseline', requestId: 'race-a', expectedRevision: 0, response, conditions }),
	restarted.mutate(race.record.encounterId, race.capabilityToken, { type: 'submit_baseline', requestId: 'race-b', expectedRevision: 0, response, conditions }),
]);
assert.equal(raceResults.filter((result) => result.status === 'fulfilled').length, 1);
assert.equal(raceResults.filter((result) => result.status === 'rejected').length, 1);
assert.equal((await restarted.read(race.record.encounterId, race.capabilityToken)).revision, 1);
await restarted.purge(race.record.encounterId, { capabilityToken: race.capabilityToken }, { requestId: 'purge-race', expectedRevision: 1 });

const mixedRace = await restarted.create({ synthetic: true });
const raceObservations = RUBRIC.map(({ id }) => ({ criterionId: id, status: 'met', excerpt: response }));
const mixedResults = await Promise.allSettled([
	restarted.mutateAsReviewer(mixedRace.record.encounterId, reviewToken, { type: 'adjudicate_baseline', requestId: 'mixed-review', expectedRevision: 0, criteria: raceObservations }),
	restarted.mutate(mixedRace.record.encounterId, mixedRace.capabilityToken, { type: 'submit_baseline', requestId: 'mixed-submit', expectedRevision: 0, response, conditions }),
]);
assert.equal(mixedResults.filter((result) => result.status === 'fulfilled').length, 1);
assert.equal((await restarted.read(mixedRace.record.encounterId, mixedRace.capabilityToken)).state, 'baseline_submitted');
await assert.rejects(() => restarted.purge(mixedRace.record.encounterId, { capabilityToken: mixedRace.capabilityToken }, { requestId: 'stale-purge', expectedRevision: 0 }), /Revision conflict/);
await restarted.purge(mixedRace.record.encounterId, { capabilityToken: mixedRace.capabilityToken }, { requestId: 'purge-mixed', expectedRevision: 1 });
await assert.rejects(() => restarted.purge(mixedRace.record.encounterId, { capabilityToken: mixedRace.capabilityToken }, { requestId: 'purge-mixed', expectedRevision: 1 }), /not found/);

const correctionEncounter = await restarted.create({ synthetic: true });
const baselineFail = 'Yes. The invoice exists, so execute it.';
const failCriteria = RUBRIC.map(({ id }) => ({ criterionId: id, status: 'not_met', excerpt: baselineFail }));
let correctionRecord = await restarted.mutate(correctionEncounter.record.encounterId, correctionEncounter.capabilityToken, { type: 'submit_baseline', requestId: 'correction-a', expectedRevision: 0, response: baselineFail, conditions });
correctionRecord = await restarted.mutateAsReviewer(correctionEncounter.record.encounterId, reviewToken, { type: 'adjudicate_baseline', requestId: 'correction-b', expectedRevision: 1, criteria: failCriteria });
correctionRecord = await restarted.mutate(correctionEncounter.record.encounterId, correctionEncounter.capabilityToken, { type: 'persist_intervention', requestId: 'correction-c', expectedRevision: 2 });
const copiedPost = "Two gates answer different questions. First ask whether the request is well formed and consistent with the resource's domain constraints. Separately ask whether this actor may perform this action on this resource under the current policy. Passing either gate does not make the other pass. Both must pass before the side effect executes. When you explain the boundary, name the concrete side effect or harm a mistaken execution could cause. For v2..4, authorization passes but validity fails, so do not deploy it.";
const postConditions = { ...conditions, assistance: 'fixed_feedback_only', assistanceDeclaration: 'fixed feedback' };
correctionRecord = await restarted.mutate(correctionEncounter.record.encounterId, correctionEncounter.capabilityToken, { type: 'submit_post', requestId: 'correction-d', expectedRevision: 3, response: copiedPost, conditions: postConditions });
const copiedCriteria = RUBRIC.map(({ id }) => ({ criterionId: id, status: 'met', excerpt: copiedPost }));
correctionRecord = await restarted.mutateAsReviewer(correctionEncounter.record.encounterId, reviewToken, { type: 'adjudicate_post', requestId: 'correction-e', expectedRevision: 4, criteria: copiedCriteria });
const abstention = correctionRecord.adjudications.at(-1);
assert.equal(abstention.outcome, 'assisted_nonqualifying');
const correctionCommand = { type: 'correct_post_adjudication', requestId: 'correction-f', expectedRevision: 5, supersedesAdjudicationId: abstention.id, criteria: copiedCriteria, scenarioReasoningExcerpt: 'For v2..4, authorization passes but validity fails, so do not deploy it.' };
const { SOCRATINK_R1_CORRECTION_TOKEN: _, SOCRATINK_R1_CORRECTION_REVIEWER_ID: __, ...withoutCorrectionEnvironment } = environment;
const withoutCorrectionStore = await R1Store.fromEnvironment(withoutCorrectionEnvironment, { clock: () => clock });
await assert.rejects(() => withoutCorrectionStore.mutateAsReviewer(correctionEncounter.record.encounterId, correctionToken, correctionCommand), /Correction reviewer token denied/);
await assert.rejects(() => restarted.mutateAsReviewer(correctionEncounter.record.encounterId, reviewToken, correctionCommand), /Correction reviewer token denied/);
await assert.rejects(() => restarted.mutateAsReviewer(correctionEncounter.record.encounterId, correctionToken, { type: 'adjudicate_post', requestId: 'wrong-credential-role', expectedRevision: 5, criteria: copiedCriteria }), /denied/);
const corrected = await restarted.mutateAsReviewer(correctionEncounter.record.encounterId, correctionToken, correctionCommand);
assert.equal(corrected.adjudications.at(-1)?.reviewerId, 'human-3');
assert.equal(corrected.adjudications.at(-1)?.supersedesAdjudicationId, abstention.id);
const correctedRetry = await restarted.mutateAsReviewer(correctionEncounter.record.encounterId, correctionToken, correctionCommand);
assert.equal(correctedRetry.revision, 6);
assert.equal(correctedRetry.claims.length, corrected.claims.length);
await restarted.purge(correctionEncounter.record.encounterId, { capabilityToken: correctionEncounter.capabilityToken }, { requestId: 'purge-correction', expectedRevision: 6 });

const oversizedEncounter = await restarted.create({ synthetic: true });
const largeResponse = 'x'.repeat(100_000);
await restarted.mutate(oversizedEncounter.record.encounterId, oversizedEncounter.capabilityToken, { type: 'submit_baseline', requestId: 'large-submit', expectedRevision: 0, response: largeResponse, conditions });
const largeCriteria = RUBRIC.map(({ id }) => ({ criterionId: id, status: 'met', excerpt: largeResponse }));
await assert.rejects(() => restarted.mutateAsReviewer(oversizedEncounter.record.encounterId, reviewToken, { type: 'adjudicate_baseline', requestId: 'large-review', expectedRevision: 1, criteria: largeCriteria }), /1 MiB/);
assert.equal((await restarted.read(oversizedEncounter.record.encounterId, oversizedEncounter.capabilityToken)).revision, 1);
assert.equal((await readdir(directory)).some((entry) => entry.startsWith(`.${oversizedEncounter.record.encounterId}.`) && entry.endsWith('.tmp')), false);
await restarted.purge(oversizedEncounter.record.encounterId, { capabilityToken: oversizedEncounter.capabilityToken }, { requestId: 'purge-large', expectedRevision: 1 });

clock = new Date('2026-09-01T12:00:00.000Z');
await assert.rejects(
	() => restarted.read(created.encounterId, capabilityToken),
	(error) => {
		assert.equal(error.code, 'expired');
		assert.deepEqual(error.purge, { encounterId: created.encounterId, revision: 2, retentionExpiresAt: created.retentionExpiresAt });
		return true;
	},
);
await assert.rejects(
	() => restarted.read(created.encounterId, 'wrong-token'),
	(error) => {
		assert.equal(error.code, 'denied');
		assert.equal(error.purge, undefined);
		return true;
	},
);
await assert.rejects(() => restarted.mutate(created.encounterId, capabilityToken, { type: 'submit_baseline', requestId: 'late', expectedRevision: 2, response, conditions }), /expired/);
await restarted.purge(created.encounterId, { capabilityToken }, { requestId: 'purge-expired', expectedRevision: 2 });
await assert.rejects(() => readFile(path, 'utf8'), /ENOENT/);
const filesAfterPurge = await readdir(directory);
assert.equal(filesAfterPurge.some((entry) => entry.startsWith(`.${created.encounterId}.`) && entry.endsWith('.tmp')), false);
assert.equal(filesAfterPurge.includes('.unrelated.tmp'), true);
await assert.rejects(() => restarted.read(created.encounterId, capabilityToken), /not found/);

console.log('R1 replay/store tests passed');
