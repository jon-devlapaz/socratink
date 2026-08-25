/**
 * Frozen R1 record contracts.
 *
 * Purpose: typed records for the Learner Agent Contract so EXP-0001 can be
 * implemented later without inventing schema during the encounter.
 *
 * Inputs: none at runtime. These are compile-time contracts.
 * Outputs: the record shapes a replayable trace must be able to hold.
 *
 * Constraints:
 * - Learner-state primitive is a bounded sentence, never a mastery score.
 * - Evidence events are immutable; evaluations and claims must not mutate them.
 * - Split `Evaluation` records are a proposed operationalization, not accepted Canon.
 * - These types do not mean R1 has been implemented or run.
 */

export type IsoTimestamp = string;
export type AuthorshipKind = 'learner' | 'model' | 'mixed';
export type Modality = 'text';
export type EvaluatorType = 'deterministic' | 'probabilistic' | 'human';
export type VerificationObligationStatus = 'pending' | 'fulfilled' | 'cancelled';

type BannedLearnerStateKeys = 'mastery' | 'masteryScore' | 'score' | 'theta' | 'progress';

type AssertNoBannedKeys<T> = Extract<keyof T, BannedLearnerStateKeys> extends never
	? true
	: ['must not include mastery/score fields', Extract<keyof T, BannedLearnerStateKeys>];

export type LearningTarget = {
	readonly targetId: string;
	readonly statement: string;
	readonly evidenceContractId: string;
	readonly scope?: string;
};

export type EvidenceContract = {
	readonly evidenceContractId: string;
	readonly version: string;
	readonly targetId: string;
	readonly observablePerformance: string;
	readonly conditions: string;
	readonly allowedInference: string;
	readonly nonInferences: readonly string[];
};

export type ArtifactPart = {
	readonly authorship: 'learner' | 'model';
	readonly text: string;
};

export type AssistanceState = {
	readonly hints: readonly string[];
	readonly reveals: readonly string[];
	readonly substantiveAiAssistance: boolean;
	readonly workedContent: readonly string[];
	readonly declaration: string;
};

export type TaskConditions = {
	readonly sourceAccess: string;
	readonly toolAccess: string;
	readonly delay?: string;
};

export type EvaluatorProvenance = {
	readonly evaluatorId: string;
	readonly evaluatorType: EvaluatorType;
	readonly evaluatorVersion: string;
	readonly rubricId: string;
	readonly rubricVersion: string;
};

export type RuntimeProvenance = {
	readonly appCommit: string;
	readonly runtime: string;
};

/**
 * Immutable record of what occurred. Does not store mastery, projection state,
 * or policy choice. Observation results belong on `Evaluation`.
 */
export type EvidenceEvent = {
	readonly eventId: string;
	readonly learnerId: string;
	readonly targetId: string;
	readonly encounterId: string;
	readonly attemptId: string;
	readonly timestamp: IsoTimestamp;
	readonly modality: Modality;
	readonly taskPrompt: string;
	readonly artifact: string;
	readonly artifactParts: readonly ArtifactPart[];
	readonly authorship: AuthorshipKind;
	readonly conditions: TaskConditions;
	readonly assistance: AssistanceState;
	readonly evidenceContractId: string;
	readonly evidenceContractVersion: string;
	readonly evaluatorProvenance?: EvaluatorProvenance;
	readonly provenance: RuntimeProvenance;
};

export type RubricCriterion = {
	readonly id: string;
	readonly statement: string;
};

export type Rubric = {
	readonly rubricId: string;
	readonly version: string;
	readonly targetId: string;
	readonly criteria: readonly RubricCriterion[];
	readonly instructions: string;
};

/**
 * Append-only interpretation of an Evidence Event. The result is an observation
 * against a rubric, not a learner-state claim.
 */
export type Evaluation = {
	readonly evaluationId: string;
	readonly eventId: string;
	readonly evaluatorId: string;
	readonly evaluatorType: EvaluatorType;
	readonly evaluatorVersion: string;
	readonly method: string;
	readonly rubricId: string;
	readonly rubricVersion: string;
	readonly result: string;
	readonly uncertainty: string;
	readonly limitations: readonly string[];
	readonly timestamp: IsoTimestamp;
	readonly model?: {
		readonly provider: string;
		readonly model: string;
		readonly modelVersion: string;
		readonly instructions: string;
	};
};

/**
 * Bounded inference licensed by specific evidence. `capability` is a sentence.
 * Numeric mastery is not representable as a field on this type.
 */
export type LearnerStateClaim = {
	readonly claimId: string;
	readonly learnerId: string;
	readonly targetId: string;
	readonly capability: string;
	readonly evidenceBasis: {
		readonly eventIds: readonly string[];
		readonly evaluationIds: readonly string[];
	};
	readonly uncertainty: string;
	readonly limitations: readonly string[];
	readonly derivationModel: string;
	readonly supersedesClaimId?: string;
	readonly createdAt: IsoTimestamp;
};

export type VerificationObligation = {
	readonly obligationId: string;
	readonly targetId: string;
	readonly reason: string;
	readonly intendedCondition: string;
	readonly dueWindow: string;
	readonly status: VerificationObligationStatus;
	readonly fulfilledByEventId?: string;
};

export type PedagogicalDecision = {
	readonly decisionId: string;
	readonly targetId: string;
	readonly encounterId: string;
	readonly interventionId: string;
	readonly rationale: string;
	readonly decidedAt: IsoTimestamp;
	readonly evidenceBasis: {
		readonly eventIds: readonly string[];
		readonly claimIds: readonly string[];
	};
};

export type ReplayableTrace = {
	readonly schemaVersion: 1;
	readonly synthetic: boolean;
	readonly target: LearningTarget;
	readonly evidenceContract: EvidenceContract;
	readonly rubric: Rubric;
	readonly events: readonly EvidenceEvent[];
	readonly evaluations: readonly Evaluation[];
	readonly claims: readonly LearnerStateClaim[];
	readonly decisions: readonly PedagogicalDecision[];
	readonly obligations: readonly VerificationObligation[];
};

export const _evidenceEventHasNoMastery: AssertNoBannedKeys<EvidenceEvent> = true;
export const _claimHasNoMastery: AssertNoBannedKeys<LearnerStateClaim> = true;
export const _evaluationHasNoMastery: AssertNoBannedKeys<Evaluation> = true;
