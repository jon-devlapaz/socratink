/** The chat wire format the Socratink server speaks. These are the subset of
 * shapes our projection emits, kept local so the browser can drop the SDK. */

export type WirePart =
	| { type: 'text' | 'reasoning'; text: string; state: 'streaming' | 'done' }
	| { type: `data-${string}`; data: unknown }
	| ({ type: 'dynamic-tool'; toolName: string; toolCallId: string } & (
		| { state: 'input-available'; input: unknown }
		| { state: 'output-available'; input: unknown; output: unknown }
		| { state: 'output-error'; input: unknown; errorText: string }));

export type WireMessage = {
	id: string;
	role: 'user' | 'assistant';
	purpose: 'user' | 'assistant';
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
	offset: string;
	messages: WireMessage[];
	settlements: WireSettlement[];
};

type Positioned<T> = T & { conversationId: string; position: { batch: number; index: number } };

export type WireEvent = Positioned<
	| { type: 'conversation-reset'; snapshot: WireSnapshot }
	| { type: 'message-started'; messageId: string; submissionId?: string }
	| { type: 'message-delta'; messageId: string; kind: 'text' | 'reasoning'; delta: string }
	| { type: 'tool-input'; messageId: string; toolCallId: string; toolName: string; input: unknown }
	| { type: 'tool-output'; toolCallId: string; output: unknown }
	| { type: 'tool-output-error'; toolCallId: string; errorText: string }
	| ({ type: 'submission-settled' } & WireSettlement)
>;

export type WireAdmission = { submissionId: string; streamUrl: string; offset: string; uid: string };

export type WireReply = { submissionId: string; uid?: string; text: string; data: Record<string, unknown[]>; metadata?: Record<string, unknown> };

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
