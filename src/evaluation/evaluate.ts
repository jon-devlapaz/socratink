/**
 * Frozen evaluator contract.
 *
 * Purpose: turn an Evidence Event and a versioned rubric into an Evaluation.
 * Inputs: `(event, rubric) → Evaluation`.
 * Outputs: an observation record that does not mutate the event or write a claim.
 * Constraints: evaluator output is observation, not learner-state truth.
 */
import type { Evaluation, EvidenceEvent, Rubric } from '../types/evidence.ts';

export type Evaluate = (event: EvidenceEvent, rubric: Rubric) => Evaluation;

export type Evaluator = {
	readonly evaluate: Evaluate;
};

export function createEvaluator(evaluate: Evaluate): Evaluator {
	return { evaluate };
}
