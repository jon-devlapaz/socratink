import { createHash } from 'node:crypto';
import { appConfig } from '../config/app.config.ts';
import type { FailureDetail, TurnRecord } from './durable/contract.ts';

type FailureCategory = 'submission_failed' | 'submission_recovery' | 'request_failed' | 'conversation_index_failed' | 'probe_failed';

/** One error line per failure. It names the hashed session, submission, model and
 * provider status where known, so it joins its socratink_turn line, and never
 * learner text or the raw conversation id. */
export function reportFailure(category: FailureCategory,
	{ conversationId, ...detail }: Partial<Omit<FailureDetail, 'providerStatus'>> & { providerStatus?: number | null } = {}): void {
	console.error(JSON.stringify({ event: 'socratink_failure', category,
		...(conversationId ? { session: sessionHash(conversationId) } : {}),
		...(detail.submissionId ? { submission: detail.submissionId } : {}),
		...(detail.model ? { model: detail.model } : {}),
		...(detail.providerStatus !== undefined ? { providerStatus: detail.providerStatus } : {}) }));
}

function sessionHash(conversationId: string): string {
	return createHash('sha256').update(conversationId).digest('hex').slice(0, 12);
}

const turnErrors: Partial<Record<TurnRecord['status'], string>> = {
	failed: 'model_request_failed', error: 'engine_error', interrupted: 'execution_stopped', unsettled: 'no_settlement',
};

export function logTurn(turn: TurnRecord): void {
	const error = turnErrors[turn.status];
	console.log(JSON.stringify({ event: 'socratink_turn', route: appConfig.chatAgentPath,
		session: sessionHash(turn.conversationId),
		submission: turn.submissionId, model: turn.model ?? null, latencyMs: turn.latencyMs, status: turn.status,
		...(error ? { error } : {}), ...(turn.providerStatus ? { providerStatus: turn.providerStatus } : {}) }));
}
