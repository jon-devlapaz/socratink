/**
 * Replayable trace export and inspection.
 *
 * Purpose: give a reviewer a frozen JSON trace, not a learner-facing inspector UI.
 * Inputs: the in-memory R1 record graph.
 * Outputs: a `ReplayableTrace` and EXP-0001 question coverage excerpts.
 * Constraints: inspection reports whether fields exist; it does not adjudicate learning.
 */
import type { AssistanceState, ReplayableTrace } from '../types/evidence.ts';

export type TraceInspection = {
	readonly question: string;
	readonly answerable: boolean;
	readonly excerpt?: string;
};

export function exportTrace(trace: ReplayableTrace): ReplayableTrace {
	return {
		schemaVersion: 1,
		synthetic: trace.synthetic,
		target: trace.target,
		evidenceContract: trace.evidenceContract,
		rubric: trace.rubric,
		events: [...trace.events],
		evaluations: [...trace.evaluations],
		claims: [...trace.claims],
		decisions: [...trace.decisions],
		obligations: [...trace.obligations],
	};
}

export function serializeTrace(trace: ReplayableTrace): string {
	return `${JSON.stringify(exportTrace(trace), null, 2)}\n`;
}

export function parseTrace(serialized: string): ReplayableTrace {
	return JSON.parse(serialized) as ReplayableTrace;
}

export function inspectTrace(trace: ReplayableTrace): readonly TraceInspection[] {
	const [baseline, post] = trace.events;
	const [baselineClaim, laterClaim] = trace.claims;
	const decision = trace.decisions[0];
	const obligation = trace.obligations[0];
	const baselineAssistance = baseline?.assistance;
	const reveals = [
		...(baselineAssistance?.reveals ?? []),
		...(baselineAssistance?.workedContent ?? []),
		...(post?.assistance?.reveals ?? []),
		...(post?.assistance?.workedContent ?? []),
	];

	return [
		inspect('What exact capability was targeted?', trace.target.statement),
		inspect('What did the learner produce before intervention?', baseline?.artifact),
		inspect(
			'What assistance had the learner received at that point?',
			baselineAssistance?.declaration ?? assistanceSummary(baselineAssistance),
		),
		inspect('What bounded inference did that evidence permit?', baselineClaim?.capability),
		inspect('Why was the chosen intervention eligible?', decision?.rationale),
		inspect('What did Socratink reveal or supply?', reveals[0]),
		inspect('What did the learner produce afterward?', post?.artifact),
		inspect(
			'What changed in the learner-state record, and which events support that change?',
			laterClaim
				? `${laterClaim.capability} [${laterClaim.evidenceBasis.eventIds.join(', ')}]`
				: undefined,
		),
		inspect(
			'What stronger claims were explicitly withheld?',
			trace.evidenceContract.nonInferences[0],
		),
		inspect('What later verification is now owed?', obligation?.reason),
	];
}

function inspect(question: string, excerpt: string | undefined): TraceInspection {
	const trimmed = excerpt?.trim();
	if (!trimmed) return { question, answerable: false };
	return { question, answerable: true, excerpt: trimmed };
}

function assistanceSummary(assistance: AssistanceState | undefined): string | undefined {
	if (!assistance) return undefined;
	return assistance.declaration;
}
