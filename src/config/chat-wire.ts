/** The chat wire format between the Socratink server and browser: a JSON
 * snapshot of the conversation, and Server-Sent Events that update it. */

export type WirePart =
	| { type: 'text'; text: string; state: 'streaming' | 'done' }
	| { type: `data-${string}`; data: unknown }
	| ({ type: 'dynamic-tool'; toolName: string; toolCallId: string } & (
		| { state: 'input-available'; input: unknown }
		| { state: 'output-available'; input: unknown; output: unknown }
		| { state: 'output-error'; input: unknown; errorText: string }));

export type WireMessage = {
	id: string;
	role: 'user' | 'assistant';
	// Nothing current reads it: a tab still running an older bundle hides a message without it.
	display: 'visible';
	submissionId?: string;
	parts: WirePart[];
	metadata?: Record<string, unknown>;
};

export type WireSettlement = {
	submissionId: string;
	outcome: 'completed' | 'failed' | 'aborted';
	error?: unknown;
};

export type WireSnapshot = {
	v: 1;
	conversationId: string;
	messages: WireMessage[];
	settlements: WireSettlement[];
};

export type WireEventBody =
	| { type: 'conversation-reset'; snapshot: WireSnapshot }
	| { type: 'message-started'; messageId: string; submissionId?: string }
	| { type: 'message-delta'; messageId: string; kind: 'text'; delta: string }
	| { type: 'tool-input'; messageId: string; toolCallId: string; toolName: string; input: unknown }
	| { type: 'tool-output'; toolCallId: string; output: unknown }
	| { type: 'tool-output-error'; toolCallId: string; errorText: string }
	| ({ type: 'submission-settled' } & WireSettlement);

export type WireEvent = WireEventBody & { conversationId: string };

export type WireAdmission = { submissionId: string };

export type WireReply = { submissionId: string; text: string; data: Record<string, unknown[]>; metadata?: Record<string, unknown> };

/** An HTTP request the server refused, with its error envelope as `body`. */
export class ChatApiError extends Error {
	readonly status: number;
	readonly body: unknown;
	constructor(status: number, body: unknown) {
		const envelope = typeof body === 'object' && body !== null && 'error' in body ? (body as { error?: { message?: unknown } }).error : undefined;
		super(typeof envelope?.message === 'string' ? envelope.message : `Request failed with status ${status}.`);
		this.name = 'ChatApiError';
		this.status = status;
		this.body = body;
	}
}

export type TurnFailure = 'failed' | 'aborted' | 'terminal_event_missing';

/** An admitted turn that settled without a reply. */
export class ChatTurnError extends Error {
	readonly submissionId: string;
	readonly failure: TurnFailure;
	readonly error: unknown;
	constructor(options: { submissionId: string; failure: TurnFailure; error?: unknown }) {
		const detail = typeof options.error === 'string' ? options.error
			: typeof options.error === 'object' && options.error !== null && 'message' in options.error && typeof options.error.message === 'string'
				? options.error.message : undefined;
		super(options.failure === 'terminal_event_missing'
			? `Agent submission ${options.submissionId} ended without a terminal event`
			: `Agent submission ${options.submissionId} ${options.failure === 'aborted' ? 'was aborted' : 'failed'}${detail ? `: ${detail}` : ''}`);
		this.name = 'ChatTurnError';
		this.submissionId = options.submissionId;
		this.failure = options.failure;
		this.error = options.error;
	}
}

/** The reply a submission produced: its last assistant message. */
export function replyFrom(snapshot: Pick<WireSnapshot, 'messages'>, submissionId: string): Omit<WireReply, 'submissionId'> {
	const reply = snapshot.messages.filter((m) => m.role === 'assistant' && m.submissionId === submissionId).at(-1);
	if (!reply) return { text: '', data: {} };
	const data: Record<string, unknown[]> = {};
	for (const part of reply.parts) {
		if (!part.type.startsWith('data-')) continue;
		(data[part.type.slice(5)] ??= []).push((part as { data: unknown }).data);
	}
	const text = reply.parts.flatMap((part) => part.type === 'text' ? [part.text] : []).join('\n\n');
	return { text, data, ...(reply.metadata ? { metadata: reply.metadata } : {}) };
}
