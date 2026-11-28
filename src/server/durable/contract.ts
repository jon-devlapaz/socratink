import type { DatabaseTarget } from '../../config/database.ts';
import type { ModelRouteRecord } from '../../config/model-route.ts';
import type { CardHelpAction } from '../../questionnaire.ts';

export const inputKind = 'socratink.input';

export type ModelSelection = { provider: string; modelId: string };
export type CardHelp = CardHelpAction & { target: string };
export type InputData = { requestId: string; selection?: ModelSelection; revealConsent?: true; tryOnceMore?: true; cardHelp?: CardHelp; hintCardFrom?: string };

/** Older entries stored only the card to show again. That link cannot identify a button press. */
export function hintCardSource(input: Pick<InputData, 'cardHelp' | 'hintCardFrom'>): string | undefined {
	return input.cardHelp?.kind === 'hint' ? input.cardHelp.sourceId : input.hintCardFrom;
}
export type ModelConfig = ModelSelection & {
	apiKey?: string; baseUrl?: string; reasoning?: boolean; contextWindow?: number; maxTokens?: number;
	/** Models the gateway tries in order when the primary model fails. */
	fallbackModelIds?: readonly string[];
};
type Outcome = 'completed' | 'failed' | 'aborted';
export type ProductTool = {
	id: string; name: string; input: Record<string, unknown>; output?: string; isError?: boolean; state: 'running' | 'done';
};
export type ProductMessage = {
	role: 'user' | 'assistant'; submissionId: string; text: string; reasoning?: string;
	data?: Record<string, unknown[]>; tools?: ProductTool[]; metadata?: { socratink?: ModelRouteRecord; cardHelp?: CardHelpAction };
};
type Submission = { id: string; text: string; outcome?: Outcome; error?: string; tryOnceMore?: true; cardHelp?: CardHelp; hintCardFrom?: string };
export type Snapshot = { revision: number; messages: ProductMessage[]; submissions: Submission[] };
export type TurnRecord = {
	conversationId: string; submissionId: string; latencyMs: number; model?: string;
	status: Outcome | 'interrupted' | 'error' | 'unsettled';
	providerStatus?: number;
};
/** What a failure log may name: never learner text or the raw conversation id. */
export type FailureDetail = { conversationId: string; submissionId?: string; model?: string; providerStatus?: number };
export type EngineOptions = {
	target: DatabaseTarget;
	resolveModel: (conversationId: string, selection?: ModelSelection) => Promise<ModelConfig>;
	keepAlive?: (promise: Promise<void>) => void;
	report?: (category: 'submission_failed' | 'submission_recovery', detail: FailureDetail) => void;
	logTurn?: (turn: TurnRecord) => void;
	executionMs?: number;
};
export type Engine = {
	submit: (conversationId: string, text: string, selection?: ModelSelection, cardHelp?: CardHelpAction) => Promise<string>;
	snapshot: (conversationId: string) => Promise<Snapshot>;
	/** Repeated snapshots of one conversation that read only new commits. Call
	 * snapshot() one at a time, and close() when done. */
	follow: (conversationId: string) => { snapshot: () => Promise<Snapshot>; close: () => Promise<void> };
	/** Cancels one submission if it is still pending, and says whether it was. */
	abort: (conversationId: string, submissionId: string) => Promise<boolean>;
	close: () => Promise<void>;
};
