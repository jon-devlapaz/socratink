import {
	createFlueClient,
	FlueApiError,
	FlueExecutionError,
	type AgentReadResult,
	type AgentSendResult,
	type ConversationStreamChunk,
	type FlueClient,
	type FlueConversationSnapshot,
} from '@flue/sdk';
import { appConfig } from '../../config/app.config.ts';
import { chatAutoModelHeader, parseFreeLlmAutoModelId } from '../../config/chat-auto.ts';

type ChatTurnClient = Pick<FlueClient, 'send' | 'read' | 'abort'>;
type SubmissionReference = Pick<AgentSendResult, 'submissionId'>;

export const abortRequestTimeoutMs = 5_000;
// Recheck and reload follow an already-admitted turn. 8s cut a live
// FreeLLMAPI teaching reply off mid-stream; 90s matches Flue's stale-stream window.
export const settlementReadTimeoutMs = 90_000;

export type ChatRequestState =
	| { kind: 'idle' }
	| { kind: 'restoring' }
	| { kind: 'waiting'; text: string }
	| { kind: 'canceling'; text: string }
	| {
			kind: 'recovery';
			text: string;
			detail: string;
			admission?: SubmissionReference;
	  }
	| {
			kind: 'terminal';
			text: string;
			outcome: 'aborted' | 'failed' | 'not-admitted';
			detail: string;
	  }
	| { kind: 'completed'; text: string; reply: AgentReadResult };

export function chatRequestControls(state: ChatRequestState): {
	busy: boolean;
	composerLocked: boolean;
	startOverDisabled: boolean;
} {
	switch (state.kind) {
		case 'idle':
		case 'completed':
			return { busy: false, composerLocked: false, startOverDisabled: false };
		case 'restoring':
		case 'waiting':
		case 'canceling':
			return { busy: true, composerLocked: true, startOverDisabled: true };
		case 'recovery':
			return { busy: false, composerLocked: true, startOverDisabled: false };
		case 'terminal':
			// Confirmed stop/fail: Retry remains, but a new message is allowed.
			return { busy: false, composerLocked: false, startOverDisabled: false };
		default: {
			const exhaustive: never = state;
			return exhaustive;
		}
	}
}

type PendingRequest = {
	text: string;
	controller: AbortController;
	admission?: SubmissionReference;
	canceling: boolean;
	admissionResult: Deferred<SubmissionReference | undefined>;
	cancelResult: Deferred<ChatRequestState>;
};

type ChatRequestCoordinatorOptions = {
	abortSignal?: () => AbortSignal;
	settlementSignal?: () => AbortSignal;
	onEvent?: (event: ConversationStreamChunk) => void;
};

export function openChatConversation() {
	const conversationId =
		localStorage.getItem(appConfig.chatConversationStorageKey) ?? crypto.randomUUID();
	localStorage.setItem(appConfig.chatConversationStorageKey, conversationId);
	return createFlueClient({
		url: `${appConfig.chatAgentPath}/${encodeURIComponent(conversationId)}`,
		headers: (): Record<string, string> => {
			const model =
				parseFreeLlmAutoModelId(localStorage.getItem(appConfig.chatAutoModelStorageKey)) ?? 'auto';
			return { [chatAutoModelHeader]: model };
		},
	});
}

export function startNewChatConversation() {
	localStorage.removeItem(appConfig.chatConversationStorageKey);
	location.reload();
}

export function unsettledSubmissionFromHistory(
	history: Pick<FlueConversationSnapshot, 'messages' | 'settlements'>,
): { text: string; submissionId: string } | undefined {
	const settled = new Set(history.settlements.map((settlement) => settlement.submissionId));
	for (let index = history.messages.length - 1; index >= 0; index -= 1) {
		const message = history.messages[index];
		if (
			message?.display !== 'visible'
			|| message.role !== 'user'
			|| !message.submissionId
		) {
			continue;
		}
		if (settled.has(message.submissionId)) return undefined;
		return {
			submissionId: message.submissionId,
			text: message.parts
				.filter((part) => part.type === 'text')
				.map((part) => part.text)
				.join('\n\n'),
		};
	}
	return undefined;
}

export class ChatRequestCoordinator {
	state: ChatRequestState = { kind: 'idle' };
	private pending: PendingRequest | undefined;
	private commandPending = false;
	private readonly conversation: ChatTurnClient;
	private readonly abortSignal: () => AbortSignal;
	private readonly settlementSignal: () => AbortSignal;
	private readonly onEvent?: (event: ConversationStreamChunk) => void;

	constructor(
		conversation: ChatTurnClient,
		options: ChatRequestCoordinatorOptions = {},
	) {
		this.conversation = conversation;
		this.abortSignal = options.abortSignal ?? (() => AbortSignal.timeout(abortRequestTimeoutMs));
		this.settlementSignal =
			options.settlementSignal ?? (() => AbortSignal.timeout(settlementReadTimeoutMs));
		this.onEvent = options.onEvent;
	}

	start(text: string): Promise<ChatRequestState> {
		if (this.state.kind === 'terminal') {
			this.pending = undefined;
			this.state = { kind: 'idle' };
		}
		if (this.state.kind !== 'idle') throw new Error('A chat request is already active.');
		const pending: PendingRequest = {
			text,
			controller: new AbortController(),
			canceling: false,
			admissionResult: deferred(),
			cancelResult: deferred(),
		};
		this.pending = pending;
		this.state = { kind: 'waiting', text };
		return this.sendAndRead(pending);
	}

	beginRestore(): void {
		if (this.state.kind !== 'idle') throw new Error('A chat request is already active.');
		this.state = { kind: 'restoring' };
	}

	finishRestore(): void {
		if (this.state.kind !== 'restoring') return;
		this.state = { kind: 'idle' };
	}

	hydrate(text: string, submissionId: string): ChatRequestState {
		if (this.state.kind !== 'idle' && this.state.kind !== 'restoring') {
			throw new Error('A chat request is already active.');
		}
		const admission = { submissionId };
		const admissionResult = deferred<SubmissionReference | undefined>();
		admissionResult.resolve(admission);
		this.pending = {
			text,
			controller: new AbortController(),
			admission,
			canceling: false,
			admissionResult,
			cancelResult: deferred(),
		};
		this.state = {
			kind: 'recovery',
			text,
			detail: 'This admitted reply is still settling. Recheck before sending again.',
			admission,
		};
		return this.state;
	}

	async cancel(): Promise<ChatRequestState> {
		const pending = this.pending;
		if (!pending || this.commandPending) return this.state;
		this.commandPending = true;
		pending.canceling = true;
		pending.controller.abort();
		this.state = { kind: 'canceling', text: pending.text };
		const abortRequest = this.conversation.abort({ signal: this.abortSignal() }).then(
			(result) => ({ result }),
			(error: unknown) => ({ error }),
		);
		let admissionKnown = true;
		let admission: SubmissionReference | undefined;
		try {
			admission = await awaitWithSignal(pending.admissionResult.promise, this.settlementSignal());
		} catch {
			admissionKnown = false;
			admission = pending.admission;
		}
		const abortOutcome = await abortRequest;
		if ('error' in abortOutcome) {
			const error = abortOutcome.error;
			const state = this.recoveryState(
				pending,
				`Cancellation could not be confirmed. ${chatTurnErrorMessage(error)}`,
				admission,
			);
			return this.finishCancel(pending, state);
		}
		const abortResult = abortOutcome.result;
		if (!admissionKnown) {
			return this.finishCancel(
				pending,
				this.recoveryState(
					pending,
					'Cancellation was requested, but admission status is still unknown. Recheck before retrying.',
					admission,
				),
			);
		}

		if (admission) {
			const state = await this.readTerminal(pending, admission);
			return this.finishCancel(pending, state);
		}
		return this.finishCancel(
			pending,
			this.recoveryState(
				pending,
				abortResult.aborted
					? 'Cancellation was requested, but admission and settlement are still unknown. Recheck before retrying.'
					: 'No active work was found, but admission is still unknown. Recheck before retrying.',
			),
		);
	}

	async recheck(): Promise<ChatRequestState> {
		if (this.state.kind !== 'recovery' || this.commandPending) return this.state;
		this.commandPending = true;
		const pending = this.pending;
		if (!pending) return this.releaseCommand(this.state);
		if (this.state.admission) {
			return this.releaseCommand(await this.readTerminal(pending, this.state.admission));
		}
		try {
			await this.conversation.abort({ signal: this.abortSignal() });
			return this.releaseCommand(
				this.recoveryState(
					pending,
					'Admission and settlement are still unknown. Recheck later or start over.',
				),
			);
		} catch (error) {
			return this.releaseCommand(
				this.recoveryState(
					pending,
					`Cancellation still cannot be confirmed. ${chatTurnErrorMessage(error)}`,
				),
			);
		}
	}

	retry(): Promise<ChatRequestState> {
		if (this.state.kind !== 'terminal') {
			throw new Error('Retry requires a confirmed terminal request.');
		}
		const text = this.state.text;
		this.pending = undefined;
		this.state = { kind: 'idle' };
		return this.start(text);
	}

	acknowledgeCompleted(): void {
		if (this.state.kind !== 'completed') return;
		this.pending = undefined;
		this.state = { kind: 'idle' };
	}

	private async sendAndRead(pending: PendingRequest): Promise<ChatRequestState> {
		try {
			const admission = await this.conversation.send({
				message: { kind: 'user', body: pending.text },
				signal: pending.controller.signal,
			});
			pending.admission = admission;
			pending.admissionResult.resolve(admission);
			const reply = await this.readWithLostStreamFallback(admission, pending.controller.signal);
			if (pending.canceling) return pending.cancelResult.promise;
			return this.completedState(pending, reply);
		} catch (error) {
			pending.admissionResult.resolve(pending.admission);
			if (pending.canceling) return pending.cancelResult.promise;
			if (pending.admission) return this.errorAfterAdmission(pending, error);
			if (error instanceof FlueApiError) {
				return this.terminalState(pending, 'not-admitted', chatTurnErrorMessage(error));
			}
			return this.recoveryState(
				pending,
				`Sending may have been interrupted before admission was confirmed. ${chatTurnErrorMessage(error)}`,
			);
		}
	}

	private async readWithLostStreamFallback(admission: AgentSendResult, signal: AbortSignal) {
		const onEvent = this.onEvent;
		try {
			return await this.conversation.read(admission, {
				signal,
				...(onEvent ? { onEvent } : {}),
			});
		} catch (error) {
			if (!isLostConversationStream(error)) throw error;
			return this.conversation.read(admission.submissionId, {
				signal,
				...(onEvent ? { onEvent } : {}),
			});
		}
	}

	private async readTerminal(pending: PendingRequest, admission: SubmissionReference) {
		try {
			const reply = await this.conversation.read(admission.submissionId, {
				signal: this.settlementSignal(),
			});
			return this.completedState(pending, reply);
		} catch (error) {
			return this.errorAfterAdmission(pending, error);
		}
	}

	private errorAfterAdmission(pending: PendingRequest, error: unknown): ChatRequestState {
		if (error instanceof FlueExecutionError && error.failure === 'aborted') {
			return this.terminalState(pending, 'aborted', 'Socratink stopped this reply.');
		}
		if (error instanceof FlueExecutionError && error.failure === 'failed') {
			return this.terminalState(pending, 'failed', chatTurnErrorMessage(error));
		}
		return this.recoveryState(
			pending,
			`The admitted reply has not reached a confirmed outcome. ${chatTurnErrorMessage(error)}`,
			pending.admission,
		);
	}

	private completedState(pending: PendingRequest, reply: AgentReadResult): ChatRequestState {
		this.state = { kind: 'completed', text: pending.text, reply };
		return this.state;
	}

	private terminalState(
		pending: PendingRequest,
		outcome: 'aborted' | 'failed' | 'not-admitted',
		detail: string,
	): ChatRequestState {
		this.state = { kind: 'terminal', text: pending.text, outcome, detail };
		return this.state;
	}

	private recoveryState(
		pending: PendingRequest,
		detail: string,
		admission?: SubmissionReference,
	): ChatRequestState {
		this.state = { kind: 'recovery', text: pending.text, detail, ...(admission ? { admission } : {}) };
		return this.state;
	}

	private finishCancel(pending: PendingRequest, state: ChatRequestState): ChatRequestState {
		this.commandPending = false;
		pending.cancelResult.resolve(state);
		return state;
	}

	private releaseCommand(state: ChatRequestState): ChatRequestState {
		this.commandPending = false;
		return state;
	}
}

type Deferred<T> = {
	promise: Promise<T>;
	resolve: (value: T) => void;
};

function deferred<T>(): Deferred<T> {
	let resolve!: (value: T) => void;
	const promise = new Promise<T>((done) => {
		resolve = done;
	});
	return { promise, resolve };
}

function awaitWithSignal<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
	if (signal.aborted) return Promise.reject(signal.reason);
	return new Promise<T>((resolve, reject) => {
		const abort = () => {
			cleanup();
			reject(signal.reason);
		};
		const cleanup = () => signal.removeEventListener('abort', abort);
		signal.addEventListener('abort', abort, { once: true });
		promise.then(
			(value) => {
				cleanup();
				resolve(value);
			},
			(error) => {
				cleanup();
				reject(error);
			},
		);
	});
}

export function chatTurnErrorMessage(error: unknown): string {
	if (isLostConversationStream(error)) {
		return 'This conversation was interrupted before a reply arrived. Send again or start over.';
	}
	return error instanceof Error ? error.message : 'Unable to get a reply.';
}

export function isLostConversationStream(error: unknown): boolean {
	if (!hasStatus(error, 404)) return false;
	return envelopeType(error) === 'stream_not_found';
}

function hasStatus(error: unknown, status: number): boolean {
	return typeof error === 'object' && error !== null && 'status' in error && error.status === status;
}

function envelopeType(error: unknown): string | undefined {
	if (typeof error !== 'object' || error === null) return undefined;
	const record = error as { json?: unknown; body?: unknown };
	const payload = record.json ?? record.body;
	if (typeof payload !== 'object' || payload === null) return undefined;
	const envelope = 'error' in payload ? (payload as { error: unknown }).error : payload;
	if (typeof envelope !== 'object' || envelope === null || !('type' in envelope)) return undefined;
	const type = envelope.type;
	return typeof type === 'string' ? type : undefined;
}
