import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
	BASELINE_PROMPT,
	CLAIM_TEXT,
	DELAYED_PROMPT,
	DOMAIN_SUPPORT_PROVENANCE,
	EXPLICIT_NON_INFERENCES,
	INTERVENTION_TEXT,
	LEARNING_TARGET,
	POST_PROMPT,
	R1_EVIDENCE_CONTRACT_ID,
	R1_FIXTURE_ID,
	R1_INTERVENTION_ID,
	R1_RUBRIC_ID,
	R1_TARGET_ID,
	RUBRIC,
	SCENARIOS,
	SOURCE_PROVENANCE,
} from '../src/r1/fixture.ts';
import { applyEncounterCommand, createEncounterRecord, feedbackOverlapSpans, hasHighFeedbackOverlap, projectLearnerReceipt, validPersistedReveal } from '../src/r1/record.ts';
import { projectLearnerView } from '../src/r1/routes.ts';

const now = new Date('2026-08-24T12:00:00.000Z');
const conditions = {
	sourceClosed: true,
	assistance: 'none',
	assistanceDeclaration: 'I used no assistance.',
	sourceAccessDeclaration: 'I did not open the source.',
	observationScope: 'current_page_session',
	elapsedMs: 42_000,
	pasteEventCount: 0,
	pastedCharacterCount: 0,
};
const postConditions = { ...conditions, assistance: 'fixed_feedback_only', assistanceDeclaration: 'I saw only the fixed Socratink feedback.' };
const pass = 'No. The request format and domain facts pass. The actor is not authorized for this resource. One does not prove the other, and both checks must happen before execution or money could move across regions.';
const fail = 'Yes. The invoice exists and the amount is below the balance, so it is safe.';
const ambiguous = 'No. It is not valid for this user, so block it.';

function fresh() {
	return createEncounterRecord({ encounterId: '00000000-0000-4000-8000-000000000001', learnerParticipantId: 'learner-1', capabilityHash: 'hash', synthetic: true, now });
}

function criteria(status, excerpt, unclearReason) {
	return RUBRIC.map(({ id }) => ({ criterionId: id, status, ...(status === 'unclear' ? { abstentionReason: unclearReason } : { excerpt }) }));
}

const corruptPromptLists = (record, scenarioId) => ({
	missing: record.prompts.filter((prompt) => prompt.scenarioId !== scenarioId),
	mismatched: record.prompts.map((prompt) => prompt.scenarioId === scenarioId ? { ...prompt, text: 'Different prompt text.' } : prompt),
	duplicate: [...record.prompts, record.prompts.find((prompt) => prompt.scenarioId === scenarioId)],
	invalidTimestamp: record.prompts.map((prompt) => prompt.scenarioId === scenarioId ? { ...prompt, openedAt: 'not-a-timestamp' } : prompt),
});

for (const [corruption, prompts] of Object.entries(corruptPromptLists(fresh(), SCENARIOS.baseline.id))) {
	const corrupt = { ...fresh(), prompts };
	assert.throws(
		() => applyEncounterCommand(corrupt, { type: 'submit_baseline', requestId: `corrupt-baseline-${corruption}`, expectedRevision: 0, response: pass, conditions }, now),
		/persisted prompt record/,
	);
}

assert.equal(R1_FIXTURE_ID, 'r1.tool-boundary.v1');
assert.equal(R1_TARGET_ID, 'tool-boundary.validity-authz.v1');
assert.equal(R1_RUBRIC_ID, 'tool-boundary-rubric.v1');
assert.equal(R1_EVIDENCE_CONTRACT_ID, 'tool-boundary-evidence-contract.v1');
assert.equal(R1_INTERVENTION_ID, 'tool-boundary-contrastive-repair.v1');
assert.equal(LEARNING_TARGET, 'Given a syntactically valid agent-tool request and an explicit actor/resource policy, the learner distinguishes request validity from execution authorization, identifies which check fails, and explains why neither check substitutes for the other before a side effect occurs.');
assert.deepEqual(SOURCE_PROVENANCE, { repository: 'https://github.com/bryanyzhu/agentic-ai-system-course', author: 'Yi Zhu / bryanyzhu', commit: 'b886cb05df2153785ad0f4f461ea4bfc9de1f45b', path: 'course/03-tools-validation.md', sha256: '95e82bb9824896b8d303218805beabc1a23e353d089bc067158f79253c6d7dcd', license: 'MIT, Copyright (c) 2026 Yi Zhu', licenseSha256: 'e5279037ef03c9f9ad972c5ea20f4c5c13a57ed3800ac7a73b28c93e7a7dd94c' });
assert.equal(DOMAIN_SUPPORT_PROVENANCE.commit, 'ef539da38a09a1ff05bb895c94580cdd5b8da340');
assert.deepEqual(CLAIM_TEXT, {
	baselinePass: "In this one scenario, the learner's submitted response distinguished request validity from execution authorization and correctly withheld execution under declared source-closed, no-assistance conditions.",
	baselineFail: 'In this one source-closed scenario, the response did not yet demonstrate the required validity/authorization distinction.',
	postPass: 'After targeted feedback, the learner produced the validity/authorization distinction on one fresh inverse scenario under assisted immediate conditions.',
	postFail: 'After targeted feedback, the response did not demonstrate the distinction on the fresh inverse scenario under these conditions.',
});
assert.equal(SCENARIOS.baseline.prompt, BASELINE_PROMPT);
assert.equal(SCENARIOS.post.prompt, POST_PROMPT);
assert.equal(RUBRIC.length, 5);
const frozenFixtureDigest = createHash('sha256').update(JSON.stringify({ BASELINE_PROMPT, CLAIM_TEXT, DELAYED_PROMPT, DOMAIN_SUPPORT_PROVENANCE, EXPLICIT_NON_INFERENCES, INTERVENTION_TEXT, LEARNING_TARGET, POST_PROMPT, R1_EVIDENCE_CONTRACT_ID, R1_FIXTURE_ID, R1_INTERVENTION_ID, R1_RUBRIC_ID, R1_TARGET_ID, RUBRIC, SCENARIOS, SOURCE_PROVENANCE })).digest('hex');
assert.equal(frozenFixtureDigest, '6a376564da80061721d958211110b2d2ac6b391792387e2d5c4ea00765752615');
assert.equal(hasHighFeedbackOverlap(`Preface ${INTERVENTION_TEXT}`), true);
assert.equal(hasHighFeedbackOverlap('These are different checks.'), false);
assert.ok(feedbackOverlapSpans(INTERVENTION_TEXT)[0].responseTokenEnd >= 12);

let record = fresh();
record = applyEncounterCommand(record, { type: 'submit_baseline', requestId: 'submit-pass', expectedRevision: 0, response: pass, conditions }, now);
record = applyEncounterCommand(record, { type: 'adjudicate_baseline', requestId: 'review-pass', expectedRevision: 1, reviewerId: 'reviewer-1', criteria: criteria('met', pass) }, now);
assert.equal(record.state, 'baseline_complete_no_intervention');
assert.deepEqual(record.claims.map((claim) => claim.text), [CLAIM_TEXT.baselinePass]);
assert.equal(record.obligations.length, 0);
assert.throws(() => applyEncounterCommand(record, { type: 'persist_intervention', requestId: 'illegal', expectedRevision: 2 }, now), /not eligible/);

let selfReview = fresh();
selfReview = applyEncounterCommand(selfReview, { type: 'submit_baseline', requestId: 'self-submit', expectedRevision: 0, response: pass, conditions }, now);
assert.throws(() => applyEncounterCommand(selfReview, { type: 'adjudicate_baseline', requestId: 'self-review', expectedRevision: 1, reviewerId: 'learner-1', criteria: criteria('met', pass) }, now), /cannot adjudicate/);
assert.throws(() => applyEncounterCommand(selfReview, { type: 'adjudicate_baseline', requestId: 'contradictory-baseline', expectedRevision: 1, reviewerId: 'reviewer-1', criteria: criteria('met', pass), invalidReason: 'This contradicts valid evidence.' }, now), /only permitted/);

record = fresh();
record = applyEncounterCommand(record, { type: 'submit_baseline', requestId: 'submit-fail', expectedRevision: 0, response: fail, conditions }, now);
record = applyEncounterCommand(record, { type: 'adjudicate_baseline', requestId: 'review-fail', expectedRevision: 1, reviewerId: 'reviewer-1', criteria: criteria('not_met', fail) }, now);
assert.equal(record.state, 'intervention_eligible');
assert.equal(record.claims[0]?.text, CLAIM_TEXT.baselineFail);
record = applyEncounterCommand(record, { type: 'persist_intervention', requestId: 'reveal', expectedRevision: 2 }, now);
assert.equal(record.state, 'post_open');
assert.equal(record.reveals[0]?.text, INTERVENTION_TEXT);
assert.equal(record.prompts.at(-1)?.text, POST_PROMPT);

const validReveal = record.reveals[0];
const revealCorruptions = {
	text: { ...record, reveals: [{ ...validReveal, text: 'Different feedback.' }] },
	interventionId: { ...record, reveals: [{ ...validReveal, interventionId: 'different-intervention' }] },
	actor: { ...record, reveals: [{ ...validReveal, actor: 'learner' }] },
	blankRevealId: { ...record, reveals: [{ ...validReveal, id: '' }] },
	malformedRevealId: { ...record, reveals: [{ ...validReveal, id: 'not-a-uuid' }] },
	invalidTimestamp: { ...record, reveals: [{ ...validReveal, revealedAt: 'not-a-timestamp' }] },
	afterPostPrompt: { ...record, reveals: [{ ...validReveal, revealedAt: new Date(Date.parse(record.prompts.at(-1).openedAt) + 1_000).toISOString() }] },
	beforeDecision: { ...record, reveals: [{ ...validReveal, revealedAt: new Date(Date.parse(record.policyDecisions[0].decidedAt) - 1_000).toISOString() }] },
	duplicate: { ...record, reveals: [validReveal, { ...validReveal, id: '00000000-0000-4000-8000-000000000099' }] },
	duplicateBaselineEvent: { ...record, evidenceEvents: [...record.evidenceEvents, { ...record.evidenceEvents[0], id: 'duplicate-baseline-event' }] },
	invalidBaselineSubmittedAt: { ...record, evidenceEvents: record.evidenceEvents.map((event) => event.scenarioId === SCENARIOS.baseline.id ? { ...event, submittedAt: 'not-a-timestamp' } : event) },
	baselinePromptMismatch: { ...record, evidenceEvents: record.evidenceEvents.map((event) => event.scenarioId === SCENARIOS.baseline.id ? { ...event, prompt: 'Different prompt.' } : event) },
	adjudicationReferenceMismatch: { ...record, adjudications: record.adjudications.map((adjudication) => ({ ...adjudication, evidenceEventId: 'different-event' })) },
	decisionBeforeReview: { ...record, policyDecisions: record.policyDecisions.map((decision) => ({ ...decision, decidedAt: new Date(Date.parse(record.adjudications[0].reviewedAt) - 1_000).toISOString() })) },
	reviewBeforeSubmission: { ...record, adjudications: record.adjudications.map((adjudication) => ({ ...adjudication, reviewedAt: new Date(Date.parse(record.evidenceEvents[0].submittedAt) - 1_000).toISOString() })) },
};
for (const [corruption, corrupt] of Object.entries(revealCorruptions)) {
	const before = structuredClone(corrupt);
	assert.equal(validPersistedReveal(corrupt), null, `${corruption} reveal must not validate`);
	assert.equal(projectLearnerView(corrupt).feedback, null, `${corruption} projection must hide feedback`);
	assert.equal(projectLearnerView(corrupt).currentPrompt, null, `${corruption} projection must hide the post prompt`);
	assert.throws(
		() => applyEncounterCommand(corrupt, { type: 'submit_post', requestId: `corrupt-reveal-${corruption}`, expectedRevision: 3, response: pass, conditions: postConditions }, now),
		/persisted fixed-feedback reveal/,
	);
	assert.deepEqual(corrupt, before, `${corruption} rejection must not mutate the record`);
}

for (const [corruption, prompts] of Object.entries(corruptPromptLists(record, SCENARIOS.post.id))) {
	const corrupt = { ...record, prompts };
	assert.throws(
		() => applyEncounterCommand(corrupt, { type: 'submit_post', requestId: `corrupt-post-${corruption}`, expectedRevision: 3, response: pass, conditions: postConditions }, now),
		/persisted prompt record/,
	);
}

const post = 'Do not execute. Authorization passes for this release manager, but v2..4 fails domain validity. Permission cannot repair an invalid version. Both checks precede deployment or an unregistered build could reach production.';
record = applyEncounterCommand(record, { type: 'submit_post', requestId: 'post', expectedRevision: 3, response: post, conditions: { ...conditions, assistance: 'fixed_feedback_only', assistanceDeclaration: 'I saw the fixed feedback.' } }, now);
assert.throws(() => applyEncounterCommand(record, { type: 'adjudicate_post', requestId: 'wrong-reviewer', expectedRevision: 4, reviewerId: 'reviewer-2', criteria: criteria('met', post) }, now), /baseline reviewer/);
assert.throws(() => applyEncounterCommand(record, { type: 'adjudicate_post', requestId: 'contradictory-post', expectedRevision: 4, reviewerId: 'reviewer-1', criteria: criteria('met', post), invalidReason: 'This contradicts valid evidence.' }, now), /only permitted/);
record = applyEncounterCommand(record, { type: 'adjudicate_post', requestId: 'review-post', expectedRevision: 4, reviewerId: 'reviewer-1', criteria: criteria('met', post) }, now);
assert.equal(record.state, 'verification_pending');
assert.equal(record.claims.at(-1)?.text, CLAIM_TEXT.postPass);
assert.equal(record.obligations.length, 1);
assert.match(projectLearnerReceipt(record).uncertain[0], /does not establish mastery/);
assert.match(projectLearnerReceipt(record).helpUsed.join(' '), /only the persisted fixed feedback/);
assert.match(projectLearnerReceipt(record).helpUsed.join(' '), /I saw the fixed feedback\./);
assert.match(projectLearnerReceipt(record).helpUsed.join(' '), /not independently detected/);

let unclear = fresh();
unclear = applyEncounterCommand(unclear, { type: 'submit_baseline', requestId: 'submit-unclear', expectedRevision: 0, response: ambiguous, conditions }, now);
unclear = applyEncounterCommand(unclear, { type: 'adjudicate_baseline', requestId: 'review-unclear', expectedRevision: 1, reviewerId: 'reviewer-1', criteria: criteria('unclear', undefined, 'The terms conflate the gates.') }, now);
assert.equal(unclear.state, 'stopped_invalid_or_ambiguous');
assert.equal(unclear.claims.length, 0);

let assistedBaseline = fresh();
assistedBaseline = applyEncounterCommand(assistedBaseline, { type: 'submit_baseline', requestId: 'submit-assisted', expectedRevision: 0, response: pass, conditions: { ...conditions, assistance: 'substantive_ai_help', assistanceDeclaration: 'An AI polished this answer.' } }, now);
assistedBaseline = applyEncounterCommand(assistedBaseline, { type: 'adjudicate_baseline', requestId: 'review-assisted', expectedRevision: 1, reviewerId: 'reviewer-1', criteria: criteria('met', pass) }, now);
assert.equal(assistedBaseline.state, 'stopped_invalid_or_ambiguous');
assert.equal(assistedBaseline.adjudications[0]?.outcome, 'invalid_evidence');
assert.equal(assistedBaseline.claims.length, 0);
assert.match(projectLearnerReceipt(assistedBaseline).helpUsed.join(' '), /An AI polished this answer\./);

let otherBaseline = fresh();
otherBaseline = applyEncounterCommand(otherBaseline, { type: 'submit_baseline', requestId: 'submit-other', expectedRevision: 0, response: pass, conditions: { ...conditions, assistance: 'other', assistanceDeclaration: 'A colleague suggested an example.' } }, now);
otherBaseline = applyEncounterCommand(otherBaseline, { type: 'adjudicate_baseline', requestId: 'review-other', expectedRevision: 1, reviewerId: 'reviewer-1', criteria: criteria('met', pass) }, now);
assert.equal(otherBaseline.state, 'stopped_invalid_or_ambiguous');
assert.match(projectLearnerReceipt(otherBaseline).helpUsed.join(' '), /A colleague suggested an example\./);

let contradictoryNone = fresh();
contradictoryNone = applyEncounterCommand(contradictoryNone, { type: 'submit_baseline', requestId: 'submit-contradictory-none', expectedRevision: 0, response: pass, conditions: { ...conditions, assistance: 'none', assistanceDeclaration: 'I used AI help despite selecting none.' } }, now);
assert.match(projectLearnerReceipt(contradictoryNone).helpUsed.join(' '), /I used AI help despite selecting none\./);

let blankBaseline = fresh();
blankBaseline = applyEncounterCommand(blankBaseline, { type: 'submit_baseline', requestId: 'blank-base', expectedRevision: 0, response: '  ', conditions }, now);
assert.equal(blankBaseline.state, 'stopped_invalid_or_ambiguous');
assert.equal(blankBaseline.evidenceEvents[0]?.response, '  ');
assert.equal(blankBaseline.terminalReason, 'blank_baseline_response');
assert.equal(blankBaseline.claims.length, 0);
assert.throws(() => applyEncounterCommand(blankBaseline, { type: 'submit_baseline', requestId: 'repair-blank', expectedRevision: 1, response: pass, conditions }, now), /not open/);

let invalidPost = fresh();
invalidPost = applyEncounterCommand(invalidPost, { type: 'submit_baseline', requestId: 'pa', expectedRevision: 0, response: fail, conditions }, now);
invalidPost = applyEncounterCommand(invalidPost, { type: 'adjudicate_baseline', requestId: 'pb', expectedRevision: 1, reviewerId: 'reviewer-1', criteria: criteria('not_met', fail) }, now);
invalidPost = applyEncounterCommand(invalidPost, { type: 'persist_intervention', requestId: 'pc', expectedRevision: 2 }, now);
invalidPost = applyEncounterCommand(invalidPost, { type: 'submit_post', requestId: 'pd', expectedRevision: 3, response: post, conditions: { ...postConditions, sourceClosed: false, sourceAccessDeclaration: 'I opened the source.' } }, now);
assert.equal(invalidPost.state, 'stopped_invalid');
assert.equal(invalidPost.evidenceEvents.at(-1)?.response, post);
assert.equal(invalidPost.obligations.length, 0);
assert.match(projectLearnerReceipt(invalidPost).helpUsed.join(' '), /source access/);
assert.match(projectLearnerReceipt(invalidPost).helpUsed.join(' '), /I opened the source\./);

let assistedPost = fresh();
assistedPost = applyEncounterCommand(assistedPost, { type: 'submit_baseline', requestId: 'aa', expectedRevision: 0, response: fail, conditions }, now);
assistedPost = applyEncounterCommand(assistedPost, { type: 'adjudicate_baseline', requestId: 'ab', expectedRevision: 1, reviewerId: 'reviewer-1', criteria: criteria('not_met', fail) }, now);
assistedPost = applyEncounterCommand(assistedPost, { type: 'persist_intervention', requestId: 'ac', expectedRevision: 2 }, now);
assistedPost = applyEncounterCommand(assistedPost, { type: 'submit_post', requestId: 'ad', expectedRevision: 3, response: post, conditions: { ...postConditions, assistance: 'substantive_ai_help', assistanceDeclaration: 'I used another AI.' } }, now);
assert.equal(assistedPost.state, 'stopped_invalid');
assert.equal(assistedPost.evidenceEvents.at(-1)?.response, post);
assert.match(projectLearnerReceipt(assistedPost).helpUsed.join(' '), /substantive AI help/);
assert.match(projectLearnerReceipt(assistedPost).helpUsed.join(' '), /I used another AI\./);

let blankPost = fresh();
blankPost = applyEncounterCommand(blankPost, { type: 'submit_baseline', requestId: 'ba', expectedRevision: 0, response: fail, conditions }, now);
blankPost = applyEncounterCommand(blankPost, { type: 'adjudicate_baseline', requestId: 'bb', expectedRevision: 1, reviewerId: 'reviewer-1', criteria: criteria('not_met', fail) }, now);
blankPost = applyEncounterCommand(blankPost, { type: 'persist_intervention', requestId: 'bc', expectedRevision: 2 }, now);
blankPost = applyEncounterCommand(blankPost, { type: 'submit_post', requestId: 'bd', expectedRevision: 3, response: '', conditions: postConditions }, now);
assert.equal(blankPost.state, 'stopped_invalid');
assert.equal(blankPost.evidenceEvents.at(-1)?.response, '');
assert.equal(blankPost.obligations.length, 0);

assert.throws(() => applyEncounterCommand(fresh(), { type: 'submit_baseline', requestId: '', expectedRevision: 0, response: pass, conditions }, now), /Request ID/);
assert.throws(() => applyEncounterCommand(fresh(), { type: 'submit_baseline', requestId: 'bad-count', expectedRevision: 0, response: pass, conditions: { ...conditions, elapsedMs: Number.NaN } }, now), /Elapsed time/);
assert.throws(() => applyEncounterCommand(fresh(), { type: 'submit_baseline', requestId: 'bad-scope', expectedRevision: 0, response: pass, conditions: { ...conditions, observationScope: 'all_time' } }, now), /Observation scope/);
assert.throws(() => applyEncounterCommand(selfReview, { type: 'adjudicate_baseline', requestId: 'bad-status', expectedRevision: 1, reviewerId: 'reviewer-1', criteria: criteria('bogus', pass) }, now), /invalid status/);

let copied = fresh();
copied = applyEncounterCommand(copied, { type: 'submit_baseline', requestId: 'a', expectedRevision: 0, response: fail, conditions }, now);
copied = applyEncounterCommand(copied, { type: 'adjudicate_baseline', requestId: 'b', expectedRevision: 1, reviewerId: 'reviewer-1', criteria: criteria('not_met', fail) }, now);
copied = applyEncounterCommand(copied, { type: 'persist_intervention', requestId: 'c', expectedRevision: 2 }, now);
const copiedResponse = `${INTERVENTION_TEXT} For v2..4, authorization passes but validity fails, so do not deploy it.`;
copied = applyEncounterCommand(copied, { type: 'submit_post', requestId: 'd', expectedRevision: 3, response: copiedResponse, conditions: postConditions }, now);
copied = applyEncounterCommand(copied, { type: 'adjudicate_post', requestId: 'e', expectedRevision: 4, reviewerId: 'reviewer-1', criteria: criteria('met', copiedResponse) }, now);
assert.equal(copied.adjudications.at(-1)?.outcome, 'assisted_nonqualifying');
assert.equal(copied.claims.length, 1);
const overlapAbstention = copied.adjudications.at(-1);
assert.throws(() => applyEncounterCommand(copied, { type: 'correct_post_adjudication', requestId: 'f', expectedRevision: 5, reviewerId: 'reviewer-1', supersedesAdjudicationId: overlapAbstention.id, criteria: criteria('met', copiedResponse), scenarioReasoningExcerpt: 'For v2..4, authorization passes but validity fails, so do not deploy it.' }, now), /different human/);
copied = applyEncounterCommand(copied, { type: 'correct_post_adjudication', requestId: 'g', expectedRevision: 5, reviewerId: 'reviewer-2', supersedesAdjudicationId: overlapAbstention.id, criteria: criteria('met', copiedResponse), scenarioReasoningExcerpt: 'For v2..4, authorization passes but validity fails, so do not deploy it.' }, now);
assert.equal(copied.adjudications.at(-1)?.supersedesAdjudicationId, overlapAbstention.id);
assert.equal(copied.claims.at(-1)?.text, CLAIM_TEXT.postPass);
const correctedClaims = copied.claims.length;
copied = applyEncounterCommand(copied, { type: 'correct_post_adjudication', requestId: 'g', expectedRevision: 5, reviewerId: 'reviewer-2', supersedesAdjudicationId: overlapAbstention.id, criteria: criteria('met', copiedResponse), scenarioReasoningExcerpt: 'For v2..4, authorization passes but validity fails, so do not deploy it.' }, now);
assert.equal(copied.claims.length, correctedClaims);
assert.throws(() => applyEncounterCommand(copied, { type: 'correct_post_adjudication', requestId: 'h', expectedRevision: 6, reviewerId: 'reviewer-3', supersedesAdjudicationId: overlapAbstention.id, criteria: criteria('met', copiedResponse), scenarioReasoningExcerpt: 'For v2..4, authorization passes but validity fails, so do not deploy it.' }, now), /already been corrected/);

let invalidCopied = fresh();
invalidCopied = applyEncounterCommand(invalidCopied, { type: 'submit_baseline', requestId: 'ia', expectedRevision: 0, response: fail, conditions }, now);
invalidCopied = applyEncounterCommand(invalidCopied, { type: 'adjudicate_baseline', requestId: 'ib', expectedRevision: 1, reviewerId: 'reviewer-1', criteria: criteria('not_met', fail) }, now);
invalidCopied = applyEncounterCommand(invalidCopied, { type: 'persist_intervention', requestId: 'ic', expectedRevision: 2 }, now);
invalidCopied = applyEncounterCommand(invalidCopied, { type: 'submit_post', requestId: 'id', expectedRevision: 3, response: copiedResponse, conditions: postConditions }, now);
invalidCopied = applyEncounterCommand(invalidCopied, { type: 'adjudicate_post', requestId: 'ie', expectedRevision: 4, reviewerId: 'reviewer-1', criteria: criteria('met', copiedResponse), evidenceValid: false, invalidReason: 'Rubric binding is missing.' }, now);
assert.equal(invalidCopied.state, 'stopped_invalid');
assert.equal(invalidCopied.adjudications.at(-1)?.outcome, 'invalid_evidence');
assert.equal(invalidCopied.obligations.length, 0);

let shortCopied = fresh();
shortCopied = applyEncounterCommand(shortCopied, { type: 'submit_baseline', requestId: 'sa', expectedRevision: 0, response: fail, conditions }, now);
shortCopied = applyEncounterCommand(shortCopied, { type: 'adjudicate_baseline', requestId: 'sb', expectedRevision: 1, reviewerId: 'reviewer-1', criteria: criteria('not_met', fail) }, now);
shortCopied = applyEncounterCommand(shortCopied, { type: 'persist_intervention', requestId: 'sc', expectedRevision: 2 }, now);
shortCopied = applyEncounterCommand(shortCopied, { type: 'submit_post', requestId: 'sd', expectedRevision: 3, response: copiedResponse, conditions: postConditions }, now);
const elevenCopiedTokens = 'Two gates answer different questions. First ask whether the request is';
shortCopied = applyEncounterCommand(shortCopied, { type: 'adjudicate_post', requestId: 'se', expectedRevision: 4, reviewerId: 'reviewer-1', criteria: criteria('met', copiedResponse), scenarioReasoningExcerpt: elevenCopiedTokens }, now);
assert.equal(shortCopied.adjudications.at(-1)?.outcome, 'assisted_nonqualifying');

console.log('R1 contract tests passed');
