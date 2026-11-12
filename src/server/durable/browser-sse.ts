import { setTimeout as delay } from 'node:timers/promises';
import type { Engine, Snapshot } from './contract.ts';
import type { WireSnapshot } from '../../config/chat-wire.ts';
import { project } from './browser-projection.ts';
import { initialProgress, progressEvents, type NewEvent } from './browser-events.ts';

export const sseTiming = { pollMs: 200, heartbeatMs: 15_000, maxMs: 250_000 };

/** One conversation's live events as Server-Sent Events, diffed per connection
 * from engine snapshots. Nothing is journaled. Each connection opens with a
 * reset holding everything except the assistant replies of pending turns,
 * which then stream as deltas from their start, so a reconnect needs no cursor.
 * The stream ends once no turn is pending, or at maxMs so a client reconnects
 * before the platform cuts the function off. */
export function conversationEvents(engine: Engine, id: string, signal: AbortSignal, timing = sseTiming): ReadableStream<Uint8Array> {
	const encoder = new TextEncoder();
	const stop = new AbortController();
	const stopped = AbortSignal.any([signal, stop.signal]);
	return new ReadableStream({
		async start(controller) {
			// Nothing current reads position: a tab still running an older bundle needs it.
			let index = 0;
			const write = (text: string) => { if (!stopped.aborted) controller.enqueue(encoder.encode(text)); };
			const send = (event: NewEvent) => write(`data: ${JSON.stringify({ ...event, conversationId: id, position: { batch: 0, index: index++ } })}\n\n`);
			const opened = Date.now();
			let beat = opened;
			try {
				let state = await engine.snapshot(id);
				const progress = initialProgress();
				const settledView = withoutPendingReplies(project(id, state), state);
				progressEvents(settledView, progress);
				send({ type: 'conversation-reset', snapshot: settledView });
				for (;;) {
					for (const event of progressEvents(project(id, state), progress)) send(event);
					if (!pending(state).size || stopped.aborted || Date.now() - opened >= timing.maxMs) break;
					if (Date.now() - beat >= timing.heartbeatMs) { write(': ping\n\n'); beat = Date.now(); }
					await delay(timing.pollMs, undefined, { signal: stopped }).catch(() => {});
					if (stopped.aborted) break;
					// snapshot() also recovers work a dead process left pending.
					state = await engine.snapshot(id);
				}
			} catch (error) {
				if (!stopped.aborted) controller.error(error);
				return;
			}
			if (!stop.signal.aborted) controller.close();
		},
		cancel() { stop.abort(); },
	});
}

function pending(state: Snapshot): Set<string> {
	return new Set(state.submissions.filter((s) => !s.outcome).map((s) => s.id));
}

function withoutPendingReplies(snapshot: WireSnapshot, state: Snapshot): WireSnapshot {
	const open = pending(state);
	return { ...snapshot, messages: snapshot.messages.filter((m) => m.role !== 'assistant' || !open.has(m.submissionId ?? '')) };
}
