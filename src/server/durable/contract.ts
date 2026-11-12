import type { DatabaseTarget } from '../../config/database.ts';
import type { ModelRouteRecord } from '../../config/model-route.ts';

export type ModelSelection = { provider: string; modelId: string };
export type ModelConfig = ModelSelection & {
	apiKey?: string; baseUrl?: string; reasoning?: boolean; contextWindow?: number; maxTokens?: number;
};
export type Outcome = 'completed' | 'failed' | 'aborted';
export type ProductTool = {
	id: string; name: string; input: Record<string, unknown>; output?: string; isError?: boolean; state: 'running' | 'done';
};
export type ProductMessage = {
	role: 'user' | 'assistant'; submissionId: string; text: string; reasoning?: string;
	data?: Record<string, unknown[]>; tools?: ProductTool[]; metadata?: { socratink: ModelRouteRecord };
};
export type Submission = { id: string; text: string; outcome?: Outcome; error?: string };
export type Snapshot = { revision: number; messages: ProductMessage[]; submissions: Submission[] };
/** How one execution of a turn ended, for logs: no learner text. */
export type TurnRecord = {
	conversationId: string; submissionId: string; latencyMs: number; model?: string;
	status: Outcome | 'interrupted' | 'error' | 'unsettled';
};
export type EngineOptions = {
	target: DatabaseTarget;
	resolveModel: (conversationId: string, selection?: ModelSelection) => Promise<ModelConfig>;
	keepAlive?: (promise: Promise<void>) => void;
	report?: (category: 'submission_failed' | 'submission_recovery') => void;
	logTurn?: (turn: TurnRecord) => void;
	executionMs?: number;
};
export type Engine = {
	submit: (conversationId: string, text: string, selection?: ModelSelection) => Promise<string>;
	snapshot: (conversationId: string) => Promise<Snapshot>;
	abort: (conversationId: string) => Promise<void>;
	close: () => Promise<void>;
};
