import type { FreeLlmAutoModelId } from '../../config/chat-auto.ts';
import type { DatabaseTarget } from '../../config/database.ts';
import type { ModelRouteRecord } from '../../config/model-route.ts';

export type ModelSelection = { provider: string; modelId: string; autoModel?: FreeLlmAutoModelId };
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
export type EngineOptions = {
	target: DatabaseTarget;
	resolveModel: (conversationId: string, selection?: ModelSelection) => Promise<ModelConfig>;
	keepAlive?: (promise: Promise<void>) => void;
	report?: (category: 'submission_failed' | 'submission_recovery') => void;
	executionMs?: number;
};
export type Engine = {
	exists: (conversationId: string) => Promise<boolean>;
	submit: (conversationId: string, text: string, selection?: ModelSelection) => Promise<string>;
	snapshot: (conversationId: string) => Promise<Snapshot>;
	abort: (conversationId: string) => Promise<void>;
	close: () => Promise<void>;
};
