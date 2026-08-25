/**
 * Evidence event collection.
 *
 * Purpose: turn a learner attempt into an immutable Evidence Event.
 * Inputs: target, encounter, original artifact parts, conditions, assistance.
 * Outputs: one `EvidenceEvent` with derived authorship.
 * Constraints: does not score, infer capability, or attach policy choice.
 */
import { deriveAuthorship, originalArtifactText } from './authorship.ts';
import type { ArtifactPart, AssistanceState, EvidenceEvent, TaskConditions } from '../types/evidence.ts';

export type CollectEvidenceEventInput = {
	readonly eventId: string;
	readonly learnerId: string;
	readonly targetId: string;
	readonly encounterId: string;
	readonly attemptId: string;
	readonly timestamp: string;
	readonly taskPrompt: string;
	readonly artifactParts: readonly ArtifactPart[];
	readonly conditions: TaskConditions;
	readonly assistance: AssistanceState;
	readonly evidenceContractId: string;
	readonly evidenceContractVersion: string;
	readonly appCommit: string;
	readonly runtime: string;
};

export function collectEvidenceEvent(input: CollectEvidenceEventInput): EvidenceEvent {
	return {
		eventId: input.eventId,
		learnerId: input.learnerId,
		targetId: input.targetId,
		encounterId: input.encounterId,
		attemptId: input.attemptId,
		timestamp: input.timestamp,
		modality: 'text',
		taskPrompt: input.taskPrompt,
		artifact: originalArtifactText(input.artifactParts),
		artifactParts: input.artifactParts,
		authorship: deriveAuthorship(input.artifactParts),
		conditions: input.conditions,
		assistance: input.assistance,
		evidenceContractId: input.evidenceContractId,
		evidenceContractVersion: input.evidenceContractVersion,
		provenance: {
			appCommit: input.appCommit,
			runtime: input.runtime,
		},
	};
}
