import { ChatApiError, ChatTurnError, replyFrom, type WireAdmission, type WireEvent, type WireReply, type WireSnapshot } from '../../config/chat-wire.ts';

type Headers = Record<string, string> | (() => Record<string, string>);
type ReadOptions = { signal?: AbortSignal; onEvent?: (event: WireEvent) => void | Promise<void> };

const firstRetryMs = 250;
const lastRetryMs = 5_000;

/** A chat client over plain HTTP: POST to send, one Server-Sent Events GET per
 * turn to follow it. Every events connection opens with a full reset, so a
 * dropped connection just reconnects; nothing needs a cursor. */
export function createStreamClient(options: { url: string; headers?: Headers }) {
	const { url } = options;
	const headers = () => (typeof options.headers === 'function' ? options.headers() : options.headers) ?? {};
	const json = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
		const response = await fetch(`${url}${path}`, { ...init, cache: 'no-store',
			headers: { ...headers(), ...(init.body ? { 'content-type': 'application/json' } : {}) } });
		if (!response.ok) throw await apiError(response);
		return response.json() as Promise<T>;
	};

	return {
		url,
		send({ message, signal }: { message: { kind: 'user'; body: string }; signal?: AbortSignal }) {
			return json<WireAdmission>('', { method: 'POST', body: JSON.stringify(message), signal });
		},
		abort({ signal }: { signal?: AbortSignal } = {}) {
			return json<{ aborted: boolean }>('/abort', { method: 'POST', signal });
		},
		history({ signal }: { signal?: AbortSignal } = {}) {
			return json<WireSnapshot>('', { signal });
		},
		async read(target: WireAdmission | string, { signal, onEvent }: ReadOptions = {}): Promise<WireReply> {
			const submissionId = typeof target === 'string' ? target : target.submissionId;
			const fresh = deduplicator();
			let retryMs = firstRetryMs;
			for (;;) {
				signal?.throwIfAborted();
				let latest: WireSnapshot | undefined;
				try {
					const response = await fetch(`${url}/events`, { headers: headers(), signal, cache: 'no-store' });
					if (!response.ok) {
						if (response.status < 500) throw await apiError(response);
					} else {
						for await (const event of serverEvents(response.body!)) {
							retryMs = firstRetryMs;
							if (event.type === 'conversation-reset') latest = event.snapshot;
							const forward = fresh(event);
							if (forward) await onEvent?.(forward);
						}
					}
				} catch (error) {
					if (signal?.aborted) throw signal.reason;
					if (error instanceof ChatApiError) throw error;
					// A dropped connection reconnects below.
				}
				const settlement = latest?.settlements.find((s) => s.submissionId === submissionId);
				if (latest && settlement) {
					if (settlement.outcome === 'completed') return { ...replyFrom(latest, submissionId), submissionId };
					throw new ChatTurnError({ submissionId, failure: settlement.outcome, error: settlement.error });
				}
				if (latest && !hasPendingTurn(latest) && !latest.messages.some((m) => m.submissionId === submissionId)) {
					throw new ChatTurnError({ submissionId, failure: 'terminal_event_missing' });
				}
				if (!latest) {
					await pause(retryMs, signal);
					retryMs = Math.min(retryMs * 2, lastRetryMs);
				}
			}
		},
	};
}

export type StreamClient = ReturnType<typeof createStreamClient>;

async function apiError(response: Response): Promise<ChatApiError> {
	const text = await response.text();
	let body: unknown = text;
	try { body = JSON.parse(text); } catch { /* keep the text */ }
	return new ChatApiError(response.status, body);
}

async function* serverEvents(body: ReadableStream<Uint8Array>): AsyncGenerator<WireEvent> {
	const reader = body.getReader();
	const decoder = new TextDecoder();
	let buffer = '';
	for (;;) {
		const { done, value } = await reader.read();
		if (done) return;
		buffer += decoder.decode(value, { stream: true });
		let end: number;
		while ((end = buffer.indexOf('\n\n')) >= 0) {
			const block = buffer.slice(0, end);
			buffer = buffer.slice(end + 2);
			const data = block.split('\n').filter((line) => line.startsWith('data: ')).map((line) => line.slice(6)).join('\n');
			if (data) yield JSON.parse(data) as WireEvent;
		}
	}
}

/** Each connection replays pending turns from their start. Pass on only what
 * this reader has not delivered yet. Resets are state, not progress. */
function deduplicator() {
	const once = new Set<string>();
	const delivered = new Map<string, string>();
	let replayed = new Map<string, string>();
	return (event: WireEvent): WireEvent | undefined => {
		switch (event.type) {
			case 'conversation-reset':
				replayed = new Map();
				return undefined;
			case 'message-delta': {
				const key = `${event.messageId}\u0000${event.kind}`;
				const text = (replayed.get(key) ?? '') + event.delta;
				replayed.set(key, text);
				const before = delivered.get(key) ?? '';
				if (text.length <= before.length) return undefined;
				delivered.set(key, text);
				return { ...event, delta: text.slice(before.length) };
			}
			default: {
				const key = `${event.type}\u0000${'messageId' in event && event.type === 'message-started' ? event.messageId
					: 'toolCallId' in event ? event.toolCallId : 'submissionId' in event ? event.submissionId : ''}`;
				if (once.has(key)) return undefined;
				once.add(key);
				return event;
			}
		}
	};
}

function hasPendingTurn(snapshot: WireSnapshot): boolean {
	const settled = new Set(snapshot.settlements.map((s) => s.submissionId));
	return snapshot.messages.some((m) => m.role === 'user' && m.submissionId && !settled.has(m.submissionId));
}

function pause(ms: number, signal?: AbortSignal): Promise<void> {
	return new Promise((resolve, reject) => {
		const timer = setTimeout(done, ms);
		function done() { signal?.removeEventListener('abort', stop); resolve(); }
		function stop() { clearTimeout(timer); reject(signal!.reason); }
		signal?.addEventListener('abort', stop, { once: true });
	});
}
