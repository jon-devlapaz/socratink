import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { deriveAuthorship, originalArtifactText } from '../src/evidence/authorship.ts';
import { createAssistanceTracker } from '../src/evidence/assistance.ts';
import { collectEvidenceEvent } from '../src/evidence/collect.ts';
import { appendEvent, loadEvents } from '../src/evidence/persist.ts';
import { createEvaluator } from '../src/evaluation/evaluate.ts';
import { inspectTrace, parseTrace, serializeTrace } from '../src/evaluation/trace.ts';
import { createSyntheticTrace } from '../src/types/synthetic-fixture.ts';

const bannedKeys = ['mastery', 'masteryScore', 'score', 'theta', 'progress'];

function assertNoBannedKeys(value, label) {
	for (const key of bannedKeys) {
		assert.equal(Object.hasOwn(value, key), false, `${label} must not include ${key}`);
	}
}

{
	assert.throws(() => deriveAuthorship([]), /at least one authored part/);
	assert.equal(deriveAuthorship([{ authorship: 'learner', text: 'mine' }]), 'learner');
	assert.equal(deriveAuthorship([{ authorship: 'model', text: 'generated' }]), 'model');
	assert.equal(
		deriveAuthorship([
			{ authorship: 'learner', text: 'mine' },
			{ authorship: 'model', text: ' hint' },
		]),
		'mixed',
	);
	assert.equal(
		originalArtifactText([
			{ authorship: 'learner', text: 'mine' },
			{ authorship: 'model', text: ' hint' },
		]),
		'mine hint',
	);
}

{
	const tracker = createAssistanceTracker();
	tracker.recordHint('try naming the actor');
	tracker.recordReveal('Fixed feedback: callers decide authorization.');
	const snapshot = tracker.snapshot();
	assert.deepEqual(snapshot.hints, ['try naming the actor']);
	assert.deepEqual(snapshot.reveals, ['Fixed feedback: callers decide authorization.']);
	assert.equal(snapshot.substantiveAiAssistance, false);
	tracker.markSubstantiveAiAssistance('model drafted the answer');
	assert.equal(tracker.snapshot().substantiveAiAssistance, true);
	assert.deepEqual(snapshot.hints, ['try naming the actor']);
}

{
	const mixed = collectEvidenceEvent({
		eventId: 'evt-mixed',
		learnerId: 'learner-synthetic',
		targetId: 'synthetic.placeholder.target.v0',
		encounterId: 'encounter-mixed',
		attemptId: 'attempt-mixed',
		timestamp: '2026-08-24T18:00:00.000Z',
		taskPrompt: 'Explain the distinction.',
		artifactParts: [
			{ authorship: 'learner', text: 'I think callers decide. ' },
			{ authorship: 'model', text: 'Tools only execute.' },
		],
		conditions: { sourceAccess: 'none', toolAccess: 'none' },
		assistance: {
			hints: [],
			reveals: [],
			substantiveAiAssistance: true,
			workedContent: ['Tools only execute.'],
			declaration: 'model completed the second sentence',
		},
		evidenceContractId: 'synthetic.placeholder.contract.v0',
		evidenceContractVersion: 'v0',
		appCommit: 'synthetic',
		runtime: 'socratink-test',
	});

	assert.equal(mixed.authorship, 'mixed');
	assert.equal(mixed.artifact, 'I think callers decide. Tools only execute.');
	assert.equal(mixed.artifactParts[0].authorship, 'learner');
	assert.equal(mixed.artifactParts[1].authorship, 'model');
	assertNoBannedKeys(mixed, 'mixed evidence event');
}

const trace = createSyntheticTrace();
assert.equal(trace.synthetic, true);
assert.equal(trace.events.length, 2);
assert.equal(trace.evaluations.length, 2);
assert.equal(trace.claims.length, 2);
assert.equal(trace.events[0].authorship, 'learner');
assert.equal(trace.events[1].assistance.reveals.length, 1);
assert.equal(trace.claims[0].capability.includes('Baseline'), true);
assert.equal(trace.claims[1].supersedesClaimId, 'claim-1');
assert.equal(trace.obligations[0].status, 'pending');
assertNoBannedKeys(trace.events[0], 'baseline event');
assertNoBannedKeys(trace.claims[1], 'later claim');
assertNoBannedKeys(trace.evaluations[0], 'baseline evaluation');
assert.equal(typeof trace.claims[1].capability, 'string');
assert.equal(typeof trace.claims[1].capability === 'number', false);

{
	const evaluator = createEvaluator((event, rubric) => ({
		evaluationId: 'eval-rerun',
		eventId: event.eventId,
		evaluatorId: 'synthetic.deterministic.v1',
		evaluatorType: 'deterministic',
		evaluatorVersion: 'v1',
		method: 'second-evaluator-version',
		rubricId: rubric.rubricId,
		rubricVersion: rubric.version,
		result: 'appended observation',
		uncertainty: 'A new evaluator version must not mutate the event.',
		limitations: ['observation only'],
		timestamp: '2026-08-24T18:20:00.000Z',
	}));
	const rerun = evaluator.evaluate(trace.events[0], trace.rubric);
	assert.equal(rerun.eventId, trace.events[0].eventId);
	assert.equal(rerun.evaluatorVersion, 'v1');
	assert.equal(trace.evaluations[0].evaluatorVersion, 'v0');
	assert.notEqual(rerun.evaluationId, trace.evaluations[0].evaluationId);
}

const inspections = inspectTrace(trace);
assert.equal(inspections.length, 10);
for (const item of inspections) {
	assert.equal(item.answerable, true, item.question);
	assert.ok(item.excerpt, item.question);
}

const serialized = serializeTrace(trace);
const parsed = parseTrace(serialized);
assert.equal(parsed.synthetic, true);
assert.deepEqual(parsed.events.map((event) => event.eventId), ['evt-baseline', 'evt-post']);
assert.equal(parsed.claims[1].derivationModel, 'architecture-fixture');

{
	const fixtureRoot = await mkdtemp(join(tmpdir(), 'socratink-evidence-'));
	const filePath = join(fixtureRoot, 'encounter-synthetic.jsonl');
	try {
		await appendEvent(filePath, trace.events[0]);
		await appendEvent(filePath, trace.events[1]);
		await assert.rejects(() => appendEvent(filePath, trace.events[0]), /already exists/);
		const loaded = await loadEvents(filePath);
		assert.deepEqual(
			loaded.map((event) => event.eventId),
			['evt-baseline', 'evt-post'],
		);
		assert.equal(loaded[0].artifact, trace.events[0].artifact);
		const raw = await readFile(filePath, 'utf8');
		assert.equal(raw.split('\n').filter(Boolean).length, 2);
	} finally {
		await rm(fixtureRoot, { recursive: true, force: true });
	}
}

console.log('Evidence architecture contracts passed.');
