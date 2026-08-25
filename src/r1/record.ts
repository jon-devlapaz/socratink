import { createHash, randomUUID } from 'node:crypto';
import {
	BASELINE_PROMPT,
	CLAIM_TEXT,
	INTERVENTION_TEXT,
	POST_PROMPT,
	R1_EVIDENCE_CONTRACT_ID,
	R1_FIXTURE_ID,
	R1_INTERVENTION_ID,
	R1_RUBRIC_ID,
	R1_TARGET_ID,
	SCENARIOS,
} from './fixture.ts';

export type EncounterState =
	| 'baseline_open'
	| 'baseline_submitted'
	| 'stopped_invalid_or_ambiguous'
	| 'baseline_complete_no_intervention'
	| 'intervention_eligible'
	| 'post_open'
	| 'post_submitted'
	| 'stopped_invalid'
	| 'verification_pending';

export type CriterionStatus = 'met' | 'not_met' | 'unclear';
export type AdjudicationOutcome =
	| 'observed_distinction'
	| 'distinction_not_observed'
	| 'human_adjudication_required'
	| 'invalid_evidence'
	| 'assisted_nonqualifying';

export interface AttemptConditions {
	readonly sourceClosed: boolean;
	readonly assistance: 'none' | 'fixed_feedback_only' | 'substantive_ai_help' | 'other';
	readonly assistanceDeclaration: string;
	readonly sourceAccessDeclaration: string;
	readonly observationScope: 'current_page_session';
	readonly elapsedMs: number;
	readonly pasteEventCount: number;
	readonly pastedCharacterCount: number;
}

export interface EvidenceEvent {
	readonly id: string;
	readonly targetId: typeof R1_TARGET_ID;
	readonly scenarioId: (typeof SCENARIOS)[keyof typeof SCENARIOS]['id'];
	readonly author: 'learner';
	readonly prompt: string;
	readonly response: string;
	readonly conditions: AttemptConditions;
	readonly revealsBefore: readonly string[];
	readonly submittedAt: string;
}

export interface CriterionObservation {
	readonly criterionId: 'R1' | 'R2' | 'R3' | 'R4' | 'R5';
	readonly status: CriterionStatus;
	readonly excerpt?: string;
	readonly abstentionReason?: string;
}

export interface HumanAdjudication {
	readonly id: string;
	readonly evidenceEventId: string;
	readonly reviewerId: string;
	readonly reviewerKind: 'human';
	readonly rubricId: typeof R1_RUBRIC_ID;
	readonly reviewedAt: string;
	readonly criteria: readonly CriterionObservation[];
	readonly evidenceValid: boolean;
	readonly invalidReason?: string;
	readonly outcome: AdjudicationOutcome;
	readonly overlapObservation?: 'none' | 'high_feedback_overlap';
	readonly feedbackOverlapSpans?: readonly FeedbackOverlapSpan[];
	readonly scenarioReasoningExcerpt?: string;
	readonly supersedesAdjudicationId?: string;
}

export interface LearnerStateClaim {
	readonly id: string;
	readonly targetId: typeof R1_TARGET_ID;
	readonly evidenceEventId: string;
	readonly adjudicationId: string;
	readonly text: (typeof CLAIM_TEXT)[keyof typeof CLAIM_TEXT];
	readonly boundedTo: 'one_baseline_scenario' | 'one_assisted_immediate_scenario';
	readonly createdAt: string;
	readonly supersedesClaimId?: string;
}

export interface RevealEvent {
	readonly id: string;
	readonly actor: 'system';
	readonly interventionId: typeof R1_INTERVENTION_ID;
	readonly text: typeof INTERVENTION_TEXT;
	readonly revealedAt: string;
}

export interface VerificationObligation {
	readonly id: 'delayed-reconstruction.tool-boundary.v1';
	readonly targetId: typeof R1_TARGET_ID;
	readonly fixtureId: typeof R1_FIXTURE_ID;
	readonly reason: 'immediate assisted performance may be short-lived';
	readonly scenarioId: typeof SCENARIOS.delayed.id;
	readonly requiredCondition: 'source-closed, no hints or prior responses';
	readonly dueAfter: string;
	readonly dueBefore: string;
	readonly status: 'pending';
	readonly evidenceEventId?: string;
}

export interface ProcessedRequest {
	readonly requestId: string;
	readonly commandFingerprint: string;
	readonly result: EncounterSnapshot;
}

export type EncounterSnapshot = Omit<EncounterRecord, 'processedRequests'>;

export interface EncounterRecord {
	readonly schemaVersion: 1;
	readonly encounterId: string;
	readonly learnerParticipantId: string;
	readonly capabilityHash: string;
	readonly synthetic: boolean;
	readonly fixtureId: typeof R1_FIXTURE_ID;
	readonly targetId: typeof R1_TARGET_ID;
	readonly rubricId: typeof R1_RUBRIC_ID;
	readonly evidenceContractId: typeof R1_EVIDENCE_CONTRACT_ID;
	readonly state: EncounterState;
	readonly revision: number;
	readonly createdAt: string;
	readonly retentionExpiresAt: string;
	readonly prompts: readonly { readonly scenarioId: string; readonly text: string; readonly openedAt: string }[];
	readonly evidenceEvents: readonly EvidenceEvent[];
	readonly reveals: readonly RevealEvent[];
	readonly adjudications: readonly HumanAdjudication[];
	readonly claims: readonly LearnerStateClaim[];
	readonly policyDecisions: readonly {
		readonly interventionId: typeof R1_INTERVENTION_ID;
		readonly decision: 'eligible';
		readonly rationale: 'clear rubric gap eligible for frozen corrective feedback';
		readonly decidedAt: string;
	}[];
	readonly obligations: readonly VerificationObligation[];
	readonly terminalReason?: string;
	readonly processedRequests: readonly ProcessedRequest[];
}

type CommandBase = { readonly requestId: string; readonly expectedRevision: number };
export type LearnerCommand =
	| (CommandBase & { readonly type: 'submit_baseline'; readonly response: string; readonly conditions: AttemptConditions })
	| (CommandBase & { readonly type: 'persist_intervention' })
	| (CommandBase & { readonly type: 'submit_post'; readonly response: string; readonly conditions: AttemptConditions });
export type ReviewerCommand =
	| (CommandBase & { readonly type: 'adjudicate_baseline'; readonly reviewerId: string; readonly criteria: readonly CriterionObservation[]; readonly evidenceValid?: boolean; readonly invalidReason?: string })
	| (CommandBase & { readonly type: 'adjudicate_post'; readonly reviewerId: string; readonly criteria: readonly CriterionObservation[]; readonly evidenceValid?: boolean; readonly invalidReason?: string; readonly scenarioReasoningExcerpt?: string })
	| (CommandBase & { readonly type: 'correct_post_adjudication'; readonly reviewerId: string; readonly supersedesAdjudicationId: string; readonly criteria: readonly CriterionObservation[]; readonly scenarioReasoningExcerpt: string });
export type EncounterCommand = LearnerCommand | ReviewerCommand;
type WithoutReviewerId<T> = T extends { readonly reviewerId: string } ? Omit<T, 'reviewerId'> : never;
export type StoreReviewerCommand = WithoutReviewerId<ReviewerCommand>;

export interface FeedbackOverlapSpan {
	readonly responseTokenStart: number;
	readonly responseTokenEnd: number;
	readonly feedbackTokenStart: number;
	readonly feedbackTokenEnd: number;
}

export interface LearnerReceipt {
	readonly demonstrated: readonly string[];
	readonly helpUsed: readonly string[];
	readonly uncertain: readonly string[];
	readonly checkLater: readonly string[];
}

export class EncounterContractError extends Error {}

export function validPersistedPrompt(
	record: EncounterRecord,
	scenarioId: string,
	expectedText: string,
): { readonly scenarioId: string; readonly text: string; readonly openedAt: string } | null {
	const matches = record.prompts.filter((prompt) => prompt.scenarioId === scenarioId);
	if (matches.length !== 1) return null;
	const [prompt] = matches;
	const openedAtMilliseconds = prompt ? Date.parse(prompt.openedAt) : Number.NaN;
	if (!prompt || prompt.text !== expectedText || !Number.isFinite(openedAtMilliseconds) || new Date(openedAtMilliseconds).toISOString() !== prompt.openedAt) return null;
	return prompt;
}

function canonicalTimestampMilliseconds(value: string): number | null {
	const milliseconds = Date.parse(value);
	return Number.isFinite(milliseconds) && new Date(milliseconds).toISOString() === value ? milliseconds : null;
}

function isCanonicalUuidV4(value: string): boolean {
	return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function validPersistedReveal(record: EncounterRecord): RevealEvent | null {
	if (record.reveals.length !== 1) return null;
	const [reveal] = record.reveals;
	const postPrompt = validPersistedPrompt(record, SCENARIOS.post.id, POST_PROMPT);
	if (!reveal || !postPrompt || !isCanonicalUuidV4(reveal.id) || reveal.actor !== 'system' || reveal.interventionId !== R1_INTERVENTION_ID || reveal.text !== INTERVENTION_TEXT) return null;
	const revealedAt = canonicalTimestampMilliseconds(reveal.revealedAt);
	const postOpenedAt = canonicalTimestampMilliseconds(postPrompt.openedAt);
	const baselineEvents = record.evidenceEvents.filter((event) => event.scenarioId === SCENARIOS.baseline.id);
	if (baselineEvents.length !== 1) return null;
	const baselineEvent = baselineEvents[0]!;
	if (baselineEvent.author !== 'learner' || baselineEvent.prompt !== BASELINE_PROMPT) return null;
	const baselineSubmittedAt = canonicalTimestampMilliseconds(baselineEvent.submittedAt);
	const baselineAdjudications = record.adjudications.filter((adjudication) => adjudication.evidenceEventId === baselineEvent.id);
	if (baselineAdjudications.length !== 1 || record.policyDecisions.length !== 1) return null;
	const decisions = record.policyDecisions.filter((decision) => decision.interventionId === R1_INTERVENTION_ID && decision.decision === 'eligible');
	if (decisions.length !== 1) return null;
	if (baselineAdjudications[0]!.outcome !== 'distinction_not_observed' || !baselineAdjudications[0]!.evidenceValid) return null;
	const reviewedAt = canonicalTimestampMilliseconds(baselineAdjudications[0]!.reviewedAt);
	const decidedAt = canonicalTimestampMilliseconds(decisions[0]!.decidedAt);
	if (baselineSubmittedAt === null || revealedAt === null || postOpenedAt === null || reviewedAt === null || decidedAt === null) return null;
	if (reviewedAt !== decidedAt || baselineSubmittedAt > reviewedAt || reviewedAt > revealedAt || revealedAt > postOpenedAt) return null;
	return reveal;
}

function assertPersistedPrompt(record: EncounterRecord, scenarioId: string, expectedText: string): void {
	if (!validPersistedPrompt(record, scenarioId, expectedText)) {
		throw new EncounterContractError('The persisted prompt record is missing, duplicated, mismatched, or has an invalid opening timestamp.');
	}
}

function assertPersistedReveal(record: EncounterRecord): void {
	if (!validPersistedReveal(record)) {
		throw new EncounterContractError('The persisted fixed-feedback reveal is missing, duplicated, mismatched, or out of order.');
	}
}

const LIMITS = {
	id: 128,
	declaration: 2_000,
	response: 100_000,
	elapsedMs: 86_400_000,
	pasteEvents: 10_000,
	pastedCharacters: 1_000_000,
} as const;

function assertBoundedString(value: unknown, label: string, maximum: number, allowBlank = false): asserts value is string {
	if (typeof value !== 'string' || value.length > maximum || (!allowBlank && value.trim().length === 0)) {
		throw new EncounterContractError(`${label} must be a ${allowBlank ? '' : 'nonempty '}string of at most ${maximum} characters.`);
	}
}

function assertCount(value: unknown, label: string, maximum: number): asserts value is number {
	if (!Number.isInteger(value) || (value as number) < 0 || (value as number) > maximum) {
		throw new EncounterContractError(`${label} must be a nonnegative integer no greater than ${maximum}.`);
	}
}

function assertConditions(value: unknown): asserts value is AttemptConditions {
	if (!value || typeof value !== 'object') throw new EncounterContractError('Attempt conditions are required.');
	const conditions = value as Partial<AttemptConditions>;
	if (typeof conditions.sourceClosed !== 'boolean' || !['none', 'fixed_feedback_only', 'substantive_ai_help', 'other'].includes(conditions.assistance ?? '')) {
		throw new EncounterContractError('Attempt source and assistance declarations are invalid.');
	}
	if (conditions.observationScope !== 'current_page_session') throw new EncounterContractError('Observation scope must be current_page_session.');
	assertBoundedString(conditions.assistanceDeclaration, 'Assistance declaration', LIMITS.declaration);
	assertBoundedString(conditions.sourceAccessDeclaration, 'Source-access declaration', LIMITS.declaration);
	assertCount(conditions.elapsedMs, 'Elapsed time', LIMITS.elapsedMs);
	assertCount(conditions.pasteEventCount, 'Paste-event count', LIMITS.pasteEvents);
	assertCount(conditions.pastedCharacterCount, 'Pasted-character count', LIMITS.pastedCharacters);
}

function assertCommand(command: EncounterCommand): void {
	assertBoundedString(command.requestId, 'Request ID', LIMITS.id);
	assertCount(command.expectedRevision, 'Expected revision', Number.MAX_SAFE_INTEGER);
	if (command.type === 'submit_baseline' || command.type === 'submit_post') {
		assertBoundedString(command.response, 'Learner response', LIMITS.response, true);
		assertConditions(command.conditions);
	}
	if (command.type === 'adjudicate_baseline' || command.type === 'adjudicate_post' || command.type === 'correct_post_adjudication') {
		assertBoundedString(command.reviewerId, 'Reviewer ID', LIMITS.id);
		if (!Array.isArray(command.criteria)) throw new EncounterContractError('Criterion records are required.');
	}
	if ((command.type === 'adjudicate_baseline' || command.type === 'adjudicate_post') && command.evidenceValid !== undefined && typeof command.evidenceValid !== 'boolean') throw new EncounterContractError('Evidence-valid must be boolean.');
	if ((command.type === 'adjudicate_baseline' || command.type === 'adjudicate_post') && command.invalidReason !== undefined) assertBoundedString(command.invalidReason, 'Invalid-evidence reason', LIMITS.declaration);
	if (command.type === 'adjudicate_post' && command.scenarioReasoningExcerpt !== undefined) assertBoundedString(command.scenarioReasoningExcerpt, 'Scenario-reasoning excerpt', LIMITS.response);
	if (command.type === 'correct_post_adjudication') {
		assertBoundedString(command.supersedesAdjudicationId, 'Superseded adjudication ID', LIMITS.id);
		assertBoundedString(command.scenarioReasoningExcerpt, 'Scenario-reasoning excerpt', LIMITS.response);
	}
}

export function createEncounterRecord(input: {
	encounterId: string;
	learnerParticipantId: string;
	capabilityHash: string;
	synthetic: boolean;
	now: Date;
}): EncounterRecord {
	assertBoundedString(input.encounterId, 'Encounter ID', LIMITS.id);
	assertBoundedString(input.learnerParticipantId, 'Learner participant ID', LIMITS.id);
	assertBoundedString(input.capabilityHash, 'Capability hash', LIMITS.id);
	const createdAt = input.now.toISOString();
	return {
		schemaVersion: 1,
		encounterId: input.encounterId,
		learnerParticipantId: input.learnerParticipantId,
		capabilityHash: input.capabilityHash,
		synthetic: input.synthetic,
		fixtureId: R1_FIXTURE_ID,
		targetId: R1_TARGET_ID,
		rubricId: R1_RUBRIC_ID,
		evidenceContractId: R1_EVIDENCE_CONTRACT_ID,
		state: 'baseline_open',
		revision: 0,
		createdAt,
		retentionExpiresAt: new Date(input.now.getTime() + 7 * 24 * 60 * 60 * 1_000).toISOString(),
		prompts: [{ scenarioId: SCENARIOS.baseline.id, text: BASELINE_PROMPT, openedAt: createdAt }],
		evidenceEvents: [],
		reveals: [],
		adjudications: [],
		claims: [],
		policyDecisions: [],
		obligations: [],
		processedRequests: [],
	};
}

function assertCriteria(criteria: readonly CriterionObservation[], response: string): void {
	if (!Array.isArray(criteria) || criteria.some((criterion) => !criterion || typeof criterion !== 'object')) {
		throw new EncounterContractError('Criterion records must be objects.');
	}
	const ids = criteria.map((criterion) => criterion.criterionId);
	if (criteria.length !== 5 || new Set(ids).size !== 5 || !['R1', 'R2', 'R3', 'R4', 'R5'].every((id) => ids.includes(id as CriterionObservation['criterionId']))) {
		throw new EncounterContractError('A complete, unique R1-R5 criterion record is required.');
	}
	for (const criterion of criteria) {
		if (!['met', 'not_met', 'unclear'].includes(criterion.status)) throw new EncounterContractError(`${criterion.criterionId} has an invalid status.`);
		if (criterion.status === 'unclear') {
			assertBoundedString(criterion.abstentionReason, `${criterion.criterionId} abstention reason`, LIMITS.declaration);
		} else {
			assertBoundedString(criterion.excerpt, `${criterion.criterionId} excerpt`, LIMITS.response);
			if (!response.includes(criterion.excerpt)) throw new EncounterContractError(`${criterion.criterionId} requires an exact excerpt from the learner response.`);
		}
	}
}

function deriveOutcome(criteria: readonly CriterionObservation[], evidenceValid: boolean): AdjudicationOutcome {
	if (!evidenceValid) return 'invalid_evidence';
	if (criteria.some((criterion) => criterion.status === 'unclear')) return 'human_adjudication_required';
	if (criteria.some((criterion) => criterion.status === 'not_met')) return 'distinction_not_observed';
	return 'observed_distinction';
}

function normalizedWords(text: string): string[] {
	return text.normalize('NFKC').toLocaleLowerCase('en-US').split(/[^\p{L}\p{N}]+/u).filter(Boolean);
}

export function feedbackOverlapSpans(response: string): FeedbackOverlapSpan[] {
	const responseWords = normalizedWords(response);
	const feedbackWords = normalizedWords(INTERVENTION_TEXT);
	const spans: FeedbackOverlapSpan[] = [];
	for (let responseStart = 0; responseStart <= responseWords.length - 12; responseStart += 1) {
		for (let feedbackStart = 0; feedbackStart <= feedbackWords.length - 12; feedbackStart += 1) {
			let length = 0;
			while (responseWords[responseStart + length] === feedbackWords[feedbackStart + length] && responseWords[responseStart + length] !== undefined) length += 1;
			if (length >= 12) spans.push({ responseTokenStart: responseStart, responseTokenEnd: responseStart + length, feedbackTokenStart: feedbackStart, feedbackTokenEnd: feedbackStart + length });
		}
	}
	return spans.filter((span, index) => !spans.some((other, otherIndex) => otherIndex !== index && other.responseTokenStart <= span.responseTokenStart && other.responseTokenEnd >= span.responseTokenEnd && (other.responseTokenStart < span.responseTokenStart || other.responseTokenEnd > span.responseTokenEnd)));
}

export function hasHighFeedbackOverlap(response: string): boolean {
	return feedbackOverlapSpans(response).length > 0;
}

function excerptIsTextuallyIndependent(response: string, excerpt: string, overlaps: readonly FeedbackOverlapSpan[]): boolean {
	if (!response.includes(excerpt)) return false;
	const responseWords = normalizedWords(response);
	const excerptWords = normalizedWords(excerpt);
	if (excerptWords.length === 0) return false;
	const occurrences: { start: number; end: number }[] = [];
	for (let start = 0; start <= responseWords.length - excerptWords.length; start += 1) {
		if (excerptWords.every((word, index) => responseWords[start + index] === word)) occurrences.push({ start, end: start + excerptWords.length });
	}
	return occurrences.length === 1 && overlaps.every((overlap) => occurrences[0]!.end <= overlap.responseTokenStart || occurrences[0]!.start >= overlap.responseTokenEnd);
}

function makeClaim(event: EvidenceEvent, adjudication: HumanAdjudication, text: LearnerStateClaim['text'], now: string, supersedesClaimId?: string): LearnerStateClaim {
	return {
		id: randomUUID(),
		targetId: R1_TARGET_ID,
		evidenceEventId: event.id,
		adjudicationId: adjudication.id,
		text,
		boundedTo: event.scenarioId === SCENARIOS.baseline.id ? 'one_baseline_scenario' : 'one_assisted_immediate_scenario',
		createdAt: now,
		...(supersedesClaimId ? { supersedesClaimId } : {}),
	};
}

function stableValue(value: unknown): unknown {
	if (Array.isArray(value)) return value.map(stableValue);
	if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).sort(([left], [right]) => left.localeCompare(right)).map(([key, entry]) => [key, stableValue(entry)]));
	return value;
}

export function commandFingerprint(command: EncounterCommand): string {
	return createHash('sha256').update(JSON.stringify(stableValue(command))).digest('hex');
}

function snapshot(record: EncounterRecord): EncounterSnapshot {
	const { processedRequests: _, ...result } = record;
	return structuredClone(result);
}

function finish(record: EncounterRecord, command: EncounterCommand, patch: Partial<EncounterRecord>): EncounterRecord {
	const revision = record.revision + 1;
	const next = {
		...record,
		...patch,
		revision,
	};
	return { ...next, processedRequests: [...record.processedRequests, { requestId: command.requestId, commandFingerprint: commandFingerprint(command), result: snapshot(next) }] };
}

export function applyEncounterCommand(record: EncounterRecord, command: EncounterCommand, now = new Date()): EncounterRecord {
	assertCommand(command);
	const duplicate = record.processedRequests.find((entry) => entry.requestId === command.requestId);
	if (duplicate) {
		if (duplicate.commandFingerprint !== commandFingerprint(command)) throw new EncounterContractError('Request ID was already used for a different command.');
		const priorRequests = record.processedRequests.slice(0, record.processedRequests.indexOf(duplicate) + 1);
		return { ...structuredClone(duplicate.result), processedRequests: structuredClone(priorRequests) };
	}
	if (command.expectedRevision !== record.revision) throw new EncounterContractError('Revision conflict.');
	const timestamp = now.toISOString();

	if (command.type === 'submit_baseline') {
		if (record.state !== 'baseline_open') throw new EncounterContractError('Baseline submission is not open.');
		assertPersistedPrompt(record, SCENARIOS.baseline.id, BASELINE_PROMPT);
		const event: EvidenceEvent = { id: randomUUID(), targetId: R1_TARGET_ID, scenarioId: SCENARIOS.baseline.id, author: 'learner', prompt: BASELINE_PROMPT, response: command.response, conditions: command.conditions, revealsBefore: [], submittedAt: timestamp };
		if (!command.response.trim()) return finish(record, command, { state: 'stopped_invalid_or_ambiguous', evidenceEvents: [...record.evidenceEvents, event], terminalReason: 'blank_baseline_response' });
		return finish(record, command, { state: 'baseline_submitted', evidenceEvents: [...record.evidenceEvents, event] });
	}

	if (command.type === 'adjudicate_baseline') {
		if (record.state !== 'baseline_submitted') throw new EncounterContractError('Baseline is not ready for adjudication.');
		if (command.reviewerId === record.learnerParticipantId) throw new EncounterContractError('The learner cannot adjudicate their own response.');
		const event = record.evidenceEvents.at(-1)!;
		assertCriteria(command.criteria, event.response);
		const declaredBaselineConditions = event.conditions.sourceClosed && event.conditions.assistance === 'none';
		const evidenceValid = (command.evidenceValid ?? true) && declaredBaselineConditions;
		const invalidReason = command.invalidReason ?? (declaredBaselineConditions ? undefined : 'Baseline was not declared source-closed and unassisted.');
		if (evidenceValid && command.invalidReason !== undefined) throw new EncounterContractError('Invalid-evidence reason is only permitted when evidence is invalid.');
		if (!evidenceValid && !invalidReason?.trim()) throw new EncounterContractError('Invalid evidence requires a reason.');
		const outcome = deriveOutcome(command.criteria, evidenceValid);
		const adjudication: HumanAdjudication = { id: randomUUID(), evidenceEventId: event.id, reviewerId: command.reviewerId, reviewerKind: 'human', rubricId: R1_RUBRIC_ID, reviewedAt: timestamp, criteria: command.criteria, evidenceValid, invalidReason, outcome };
		const adjudications = [...record.adjudications, adjudication];
		if (outcome === 'observed_distinction') return finish(record, command, { state: 'baseline_complete_no_intervention', adjudications, claims: [...record.claims, makeClaim(event, adjudication, CLAIM_TEXT.baselinePass, timestamp)], terminalReason: 'no corrective intervention eligible' });
		if (outcome === 'distinction_not_observed') return finish(record, command, { state: 'intervention_eligible', adjudications, claims: [...record.claims, makeClaim(event, adjudication, CLAIM_TEXT.baselineFail, timestamp)], policyDecisions: [...record.policyDecisions, { interventionId: R1_INTERVENTION_ID, decision: 'eligible', rationale: 'clear rubric gap eligible for frozen corrective feedback', decidedAt: timestamp }] });
		return finish(record, command, { state: 'stopped_invalid_or_ambiguous', adjudications, terminalReason: outcome });
	}

	if (command.type === 'persist_intervention') {
		if (record.state !== 'intervention_eligible') throw new EncounterContractError('Intervention is not eligible.');
		const reveal: RevealEvent = { id: randomUUID(), actor: 'system', interventionId: R1_INTERVENTION_ID, text: INTERVENTION_TEXT, revealedAt: timestamp };
		return finish(record, command, { state: 'post_open', reveals: [...record.reveals, reveal], prompts: [...record.prompts, { scenarioId: SCENARIOS.post.id, text: POST_PROMPT, openedAt: timestamp }] });
	}

	if (command.type === 'submit_post') {
		if (record.state !== 'post_open') throw new EncounterContractError('Post submission requires the persisted frozen reveal.');
		assertPersistedPrompt(record, SCENARIOS.post.id, POST_PROMPT);
		assertPersistedReveal(record);
		const event: EvidenceEvent = { id: randomUUID(), targetId: R1_TARGET_ID, scenarioId: SCENARIOS.post.id, author: 'learner', prompt: POST_PROMPT, response: command.response, conditions: command.conditions, revealsBefore: [record.reveals[0]!.id], submittedAt: timestamp };
		if (!command.response.trim()) return finish(record, command, { state: 'stopped_invalid', evidenceEvents: [...record.evidenceEvents, event], terminalReason: 'blank_post_response' });
		if (!command.conditions.sourceClosed || command.conditions.assistance !== 'fixed_feedback_only') return finish(record, command, { state: 'stopped_invalid', evidenceEvents: [...record.evidenceEvents, event], terminalReason: 'post_conditions_invalid' });
		return finish(record, command, { state: 'post_submitted', evidenceEvents: [...record.evidenceEvents, event] });
	}

	if (command.type === 'adjudicate_post') {
		if (record.state !== 'post_submitted') throw new EncounterContractError('Post response is not ready for adjudication.');
		if (command.reviewerId === record.learnerParticipantId) throw new EncounterContractError('The learner cannot adjudicate their own response.');
		const baselineReviewerId = record.adjudications.find((item) => record.evidenceEvents.find((event) => event.id === item.evidenceEventId)?.scenarioId === SCENARIOS.baseline.id)?.reviewerId;
		if (baselineReviewerId !== command.reviewerId) throw new EncounterContractError('The baseline reviewer must perform the initial post adjudication.');
		const event = record.evidenceEvents.at(-1)!;
		assertCriteria(command.criteria, event.response);
		const evidenceValid = command.evidenceValid ?? true;
		if (evidenceValid && command.invalidReason !== undefined) throw new EncounterContractError('Invalid-evidence reason is only permitted when evidence is invalid.');
		if (!evidenceValid && !command.invalidReason?.trim()) throw new EncounterContractError('Invalid evidence requires a reason.');
		let outcome = deriveOutcome(command.criteria, evidenceValid);
		const overlapSpans = evidenceValid ? feedbackOverlapSpans(event.response) : [];
		const highOverlap = overlapSpans.length > 0;
		if (evidenceValid && highOverlap) {
			const excerpt = command.scenarioReasoningExcerpt;
			const excerptIsUsable = outcome === 'observed_distinction' && Boolean(excerpt && excerptIsTextuallyIndependent(event.response, excerpt, overlapSpans));
			outcome = excerptIsUsable ? 'observed_distinction' : 'assisted_nonqualifying';
		}
		const adjudication: HumanAdjudication = { id: randomUUID(), evidenceEventId: event.id, reviewerId: command.reviewerId, reviewerKind: 'human', rubricId: R1_RUBRIC_ID, reviewedAt: timestamp, criteria: command.criteria, evidenceValid, invalidReason: command.invalidReason, outcome, overlapObservation: highOverlap ? 'high_feedback_overlap' : 'none', feedbackOverlapSpans: overlapSpans, scenarioReasoningExcerpt: command.scenarioReasoningExcerpt };
		const adjudications = [...record.adjudications, adjudication];
		if (outcome === 'invalid_evidence') return finish(record, command, { state: 'stopped_invalid', adjudications, terminalReason: 'invalid_evidence' });
		const claims = [...record.claims];
		if (outcome === 'observed_distinction') claims.push(makeClaim(event, adjudication, CLAIM_TEXT.postPass, timestamp));
		if (outcome === 'distinction_not_observed') claims.push(makeClaim(event, adjudication, CLAIM_TEXT.postFail, timestamp));
		const obligation: VerificationObligation = { id: 'delayed-reconstruction.tool-boundary.v1', targetId: R1_TARGET_ID, fixtureId: R1_FIXTURE_ID, reason: 'immediate assisted performance may be short-lived', scenarioId: SCENARIOS.delayed.id, requiredCondition: 'source-closed, no hints or prior responses', dueAfter: new Date(now.getTime() + 48 * 60 * 60 * 1_000).toISOString(), dueBefore: new Date(now.getTime() + 72 * 60 * 60 * 1_000).toISOString(), status: 'pending' };
		return finish(record, command, { state: 'verification_pending', adjudications, claims, obligations: [...record.obligations, obligation] });
	}

	if (command.type === 'correct_post_adjudication') {
		if (record.state !== 'verification_pending') throw new EncounterContractError('Only a completed post adjudication may be corrected.');
		if (command.reviewerId === record.learnerParticipantId) throw new EncounterContractError('The learner cannot adjudicate their own response.');
		const prior = record.adjudications.find((item) => item.id === command.supersedesAdjudicationId);
		if (!prior || prior.outcome !== 'assisted_nonqualifying') throw new EncounterContractError('Only the recorded overlap abstention may be corrected.');
		if (record.adjudications.some((item) => item.supersedesAdjudicationId === prior.id)) throw new EncounterContractError('This adjudication has already been corrected.');
		if (prior.reviewerId === command.reviewerId) throw new EncounterContractError('A correction requires a different human reviewer.');
		const event = record.evidenceEvents.find((item) => item.id === prior.evidenceEventId)!;
		assertCriteria(command.criteria, event.response);
		if (command.criteria.some((item) => item.status !== 'met')) throw new EncounterContractError('A correction requires R1-R5 to be met.');
		const overlapSpans = feedbackOverlapSpans(event.response);
		if (!excerptIsTextuallyIndependent(event.response, command.scenarioReasoningExcerpt, overlapSpans)) {
			throw new EncounterContractError('A correction requires an exact non-overlapping scenario-reasoning excerpt.');
		}
		const adjudication: HumanAdjudication = { id: randomUUID(), evidenceEventId: event.id, reviewerId: command.reviewerId, reviewerKind: 'human', rubricId: R1_RUBRIC_ID, reviewedAt: timestamp, criteria: command.criteria, evidenceValid: true, outcome: 'observed_distinction', overlapObservation: 'high_feedback_overlap', feedbackOverlapSpans: overlapSpans, scenarioReasoningExcerpt: command.scenarioReasoningExcerpt, supersedesAdjudicationId: prior.id };
		const priorClaim = record.claims.findLast((claim) => claim.evidenceEventId === event.id);
		return finish(record, command, { adjudications: [...record.adjudications, adjudication], claims: [...record.claims, makeClaim(event, adjudication, CLAIM_TEXT.postPass, timestamp, priorClaim?.id)] });
	}

	throw new EncounterContractError('Unsupported command.');
}

export function projectLearnerReceipt(record: EncounterRecord): LearnerReceipt {
	const helpUsed: string[] = [];
	for (const event of record.evidenceEvents) {
		const label = event.scenarioId === SCENARIOS.baseline.id ? 'Baseline' : 'Fresh response';
		const declarationPrefix = `${label}: learner declaration, not independently detected`;
		if (event.conditions.assistance === 'none') helpUsed.push(`${declarationPrefix} — no assistance: ${event.conditions.assistanceDeclaration}`);
		if (event.conditions.assistance === 'fixed_feedback_only') helpUsed.push(`${declarationPrefix} — only the persisted fixed feedback shown by Socratink: ${event.conditions.assistanceDeclaration}`);
		if (event.conditions.assistance === 'substantive_ai_help') helpUsed.push(`${declarationPrefix} — substantive AI help: ${event.conditions.assistanceDeclaration}`);
		if (event.conditions.assistance === 'other') helpUsed.push(`${declarationPrefix} — other help: ${event.conditions.assistanceDeclaration}`);
		if (event.conditions.sourceClosed) helpUsed.push(`${label}: the learner declared source-closed conditions. This was not independently detected.`);
		else helpUsed.push(`${label}: the learner declared source access: ${event.conditions.sourceAccessDeclaration}`);
		helpUsed.push(`${label}: elapsed and paste observations cover the current browser page session; elapsed time is capped at 24 hours.`);
	}
	if (record.reveals.length > 0 && !record.evidenceEvents.some((event) => event.conditions.assistance === 'fixed_feedback_only')) {
		helpUsed.push('The persisted fixed feedback was shown before the fresh inverse scenario.');
	}
	if (helpUsed.length === 0) helpUsed.push('No submitted assistance declaration is available yet.');
	return {
		demonstrated: record.claims.map((claim) => claim.text),
		helpUsed,
		uncertain: record.adjudications.some((item) => item.outcome === 'human_adjudication_required' || item.outcome === 'assisted_nonqualifying') ? ['The human review did not support a learner-state sentence for at least one response.'] : ['This record does not establish mastery, retention, transfer, or causal learning benefit.'],
		checkLater: record.obligations.map((obligation) => `Recheck ${obligation.scenarioId} between ${obligation.dueAfter} and ${obligation.dueBefore} under ${obligation.requiredCondition} conditions.`),
	};
}
