import { createHash } from 'node:crypto';
import { appConfig } from '../config/app.config.ts';
import type { TurnRecord } from './durable/contract.ts';

export function reportFailure(...failure: ['submission_failed' | 'submission_recovery' | 'request_failed' | 'conversation_index_failed']
	| ['probe_failed', number | null]): void {
	const [category, providerStatus] = failure;
	console.error(JSON.stringify({ event: 'socratink_failure', category,
		...(category === 'probe_failed' ? { providerStatus } : {}) }));
}

const turnErrors: Partial<Record<TurnRecord['status'], string>> = {
	failed: 'model_request_failed', error: 'engine_error', interrupted: 'execution_stopped', unsettled: 'no_settlement',
};

export function logTurn(turn: TurnRecord): void {
	const error = turnErrors[turn.status];
	console.log(JSON.stringify({ event: 'socratink_turn', route: appConfig.chatAgentPath,
		session: createHash('sha256').update(turn.conversationId).digest('hex').slice(0, 12),
		submission: turn.submissionId, model: turn.model ?? null, latencyMs: turn.latencyMs, status: turn.status,
		...(error ? { error } : {}), ...(turn.providerStatus ? { providerStatus: turn.providerStatus } : {}) }));
}
