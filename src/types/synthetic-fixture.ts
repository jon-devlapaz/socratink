/**
 * In-memory synthetic encounter used to prove the R1 record contracts compile.
 *
 * This is not a frozen EXP-0001 target and is not a run of R1.
 */
import { emptyAssistance } from '../evidence/assistance.ts';
import { collectEvidenceEvent } from '../evidence/collect.ts';
import { createEvaluator } from '../evaluation/evaluate.ts';
import type {
	EvidenceContract,
	Evaluation,
	LearnerStateClaim,
	LearningTarget,
	PedagogicalDecision,
	ReplayableTrace,
	Rubric,
	VerificationObligation,
} from './evidence.ts';

export const SYNTHETIC_TARGET: LearningTarget = {
	targetId: 'synthetic.placeholder.target.v0',
	statement: 'Placeholder Learning Target for architecture contract tests. Not a frozen EXP-0001 target.',
	evidenceContractId: 'synthetic.placeholder.contract.v0',
	scope: 'architecture-fixture',
};

export const SYNTHETIC_CONTRACT: EvidenceContract = {
	evidenceContractId: 'synthetic.placeholder.contract.v0',
	version: 'v0',
	targetId: SYNTHETIC_TARGET.targetId,
	observablePerformance: 'A short learner-authored explanation produced before any reveal.',
	conditions: 'Text only; no source material; no hints at baseline.',
	allowedInference: 'Whether the baseline explanation included the targeted distinction under these conditions.',
	nonInferences: [
		'broad mastery',
		'durable retention',
		'transfer',
		'causal effect of the intervention',
	],
};

export const SYNTHETIC_RUBRIC: Rubric = {
	rubricId: 'synthetic.placeholder.rubric.v0',
	version: 'v0',
	targetId: SYNTHETIC_TARGET.targetId,
	criteria: [
		{
			id: 'C1',
			statement: 'The learner states the targeted distinction in their own words.',
		},
	],
	instructions: 'Judge only the written artifact against C1. Do not infer mastery or durability.',
};

export function createSyntheticTrace(): ReplayableTrace {
	const baseline = collectEvidenceEvent({
		eventId: 'evt-baseline',
		learnerId: 'learner-synthetic',
		targetId: SYNTHETIC_TARGET.targetId,
		encounterId: 'encounter-synthetic',
		attemptId: 'attempt-1',
		timestamp: '2026-08-24T18:00:00.000Z',
		taskPrompt: 'Explain the targeted distinction in your own words.',
		artifactParts: [{ authorship: 'learner', text: 'The distinction is that tools act; callers decide.' }],
		conditions: {
			sourceAccess: 'none',
			toolAccess: 'none',
		},
		assistance: emptyAssistance('none before baseline'),
		evidenceContractId: SYNTHETIC_CONTRACT.evidenceContractId,
		evidenceContractVersion: SYNTHETIC_CONTRACT.version,
		appCommit: 'synthetic',
		runtime: 'socratink-test',
	});

	const post = collectEvidenceEvent({
		eventId: 'evt-post',
		learnerId: 'learner-synthetic',
		targetId: SYNTHETIC_TARGET.targetId,
		encounterId: 'encounter-synthetic',
		attemptId: 'attempt-2',
		timestamp: '2026-08-24T18:10:00.000Z',
		taskPrompt: 'Explain the targeted distinction again without copying the feedback.',
		artifactParts: [
			{
				authorship: 'learner',
				text: 'Callers remain responsible for authorization even when a tool is available.',
			},
		],
		conditions: {
			sourceAccess: 'none',
			toolAccess: 'none',
		},
		assistance: {
			hints: [],
			reveals: ['Fixed feedback: name who decides authorization.'],
			substantiveAiAssistance: false,
			workedContent: [],
			declaration: 'fixed feedback after baseline; no answer reveal of the second prompt',
		},
		evidenceContractId: SYNTHETIC_CONTRACT.evidenceContractId,
		evidenceContractVersion: SYNTHETIC_CONTRACT.version,
		appCommit: 'synthetic',
		runtime: 'socratink-test',
	});

	const evaluator = createEvaluator((event, rubric) => ({
		evaluationId: `eval-${event.eventId}`,
		eventId: event.eventId,
		evaluatorId: 'synthetic.deterministic.v0',
		evaluatorType: 'deterministic',
		evaluatorVersion: 'v0',
		method: 'fixture-observation',
		rubricId: rubric.rubricId,
		rubricVersion: rubric.version,
		result:
			event.eventId === baseline.eventId
				? 'C1 not observed in baseline artifact'
				: 'C1 observed in post-intervention artifact',
		uncertainty: 'Synthetic fixture observation; not a human adjudication.',
		limitations: ['Not a frozen EXP-0001 evaluator.', 'Does not license durability.'],
		timestamp: event.timestamp,
	}));

	const evaluations: readonly Evaluation[] = [evaluator.evaluate(baseline, SYNTHETIC_RUBRIC), evaluator.evaluate(post, SYNTHETIC_RUBRIC)];
	const baselineEvaluation = evaluations[0]!;
	const postEvaluation = evaluations[1]!;

	const baselineClaim: LearnerStateClaim = {
		claimId: 'claim-1',
		learnerId: baseline.learnerId,
		targetId: SYNTHETIC_TARGET.targetId,
		capability: 'Baseline artifact did not include the targeted distinction under source-closed conditions.',
		evidenceBasis: {
			eventIds: [baseline.eventId],
			evaluationIds: [baselineEvaluation.evaluationId],
		},
		uncertainty: 'Same-session observation only.',
		limitations: SYNTHETIC_CONTRACT.nonInferences,
		derivationModel: 'architecture-fixture',
		createdAt: '2026-08-24T18:01:00.000Z',
	};

	const laterClaim: LearnerStateClaim = {
		claimId: 'claim-2',
		learnerId: post.learnerId,
		targetId: SYNTHETIC_TARGET.targetId,
		capability: 'After fixed feedback, the learner produced the previously missing distinction in a new artifact.',
		evidenceBasis: {
			eventIds: [baseline.eventId, post.eventId],
			evaluationIds: [baselineEvaluation.evaluationId, postEvaluation.evaluationId],
		},
		uncertainty: 'Immediate second attempt; not delayed verification.',
		limitations: SYNTHETIC_CONTRACT.nonInferences,
		derivationModel: 'architecture-fixture',
		supersedesClaimId: baselineClaim.claimId,
		createdAt: '2026-08-24T18:11:00.000Z',
	};

	const decision: PedagogicalDecision = {
		decisionId: 'decision-1',
		targetId: SYNTHETIC_TARGET.targetId,
		encounterId: baseline.encounterId,
		interventionId: 'synthetic.fixed-feedback.v0',
		rationale: 'Baseline evaluation recorded a local gap eligible for targeted corrective feedback.',
		decidedAt: '2026-08-24T18:02:00.000Z',
		evidenceBasis: {
			eventIds: [baseline.eventId],
			claimIds: [baselineClaim.claimId],
		},
	};

	const obligation: VerificationObligation = {
		obligationId: 'obligation-1',
		targetId: SYNTHETIC_TARGET.targetId,
		reason: 'Immediate assisted performance may be short-lived; delayed reconstruction is owed.',
		intendedCondition: 'Source-closed reconstruction after a delay, without the prior feedback visible.',
		dueWindow: 'after 24h and before 14d',
		status: 'pending',
	};

	return {
		schemaVersion: 1,
		synthetic: true,
		target: SYNTHETIC_TARGET,
		evidenceContract: SYNTHETIC_CONTRACT,
		rubric: SYNTHETIC_RUBRIC,
		events: [baseline, post],
		evaluations,
		claims: [baselineClaim, laterClaim],
		decisions: [decision],
		obligations: [obligation],
	};
}
