import { createHash } from 'node:crypto';
import { appConfig } from '../config/app.config.ts';
import type { TurnRecord } from './durable/contract.ts';

/** Server log lines carry categories, ids and timings only. Runtime events and
 * provider errors can contain learner text and credentials, so neither is logged. */
export function reportFailure(category: 'submission_failed' | 'submission_recovery' | 'request_failed'): void {
	console.error(JSON.stringify({ event: 'socratink_failure', category }));
}

const turnErrors: Partial<Record<TurnRecord['status'], string>> = {
	failed: 'model_request_failed', error: 'engine_error', interrupted: 'execution_stopped', unsettled: 'no_settlement',
};

/** One line per chat turn. The conversation id embeds the learner's id, so the
 * line carries a short hash of it that still groups one conversation's turns. */
export function logTurn(turn: TurnRecord): void {
	const error = turnErrors[turn.status];
	console.log(JSON.stringify({ event: 'socratink_turn', route: appConfig.chatAgentPath,
		session: createHash('sha256').update(turn.conversationId).digest('hex').slice(0, 12),
		submission: turn.submissionId, model: turn.model ?? null, latencyMs: turn.latencyMs, status: turn.status,
		...(error ? { error } : {}) }));
}
