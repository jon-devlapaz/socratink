import { randomUUID } from 'node:crypto';
import { BACKGROUND_CONTEXT as context } from '@earendil-works/chord/context';
import { Harness, LiveDoc, ROOT_CONVERSATION_ID, type Conversation, type Cursor, type SubmissionId } from '@earendil-works/pi-durable';
import { inputKind, type Engine, type EngineOptions, type ModelSelection, type Snapshot, type TurnRecord } from './contract.ts';
import { productRegistry } from './extension.ts';
import { feedbackExtension } from './feedback-extension.ts';
import { readSnapshot, type InputData } from './projection.ts';
import { conversationModels, modelRef, providerHttpStatus } from './provider.ts';
import { createDurableStorage, type OwnedStorage, type ReadStorage } from './storage.ts';

export class DurableBusyError extends Error {
	constructor() { super('This conversation is busy.'); this.name = 'DurableBusyError'; }
}
type Owner = { storage: OwnedStorage; harness: Harness; root: Conversation; modelId: () => string | undefined;
	stop: () => Promise<void>; done?: Promise<void>; interrupted: boolean };

export async function openEngine(options: EngineOptions): Promise<Engine> {
	const manager = createDurableStorage(options.target);
	const active = new Map<string, Owner>();
	const opening = new Map<string, Promise<Owner | undefined>>();
	const retryAfter = new Map<string, ReturnType<typeof setTimeout>>();
	let closed = false;
	function report(category: 'submission_failed' | 'submission_recovery') {
		bestEffort(() => options.report?.(category));
	}
	async function snapshot(id: string): Promise<Snapshot> {
		const reader = await manager.read(id);
		try { return await readSnapshot(reader); } finally { await reader.close(context); }
	}
	function follow(id: string) {
		let reader: Promise<ReadStorage> | undefined;
		return {
			async snapshot() {
				if (reader) await (await reader).refresh();
				else reader = manager.read(id);
				const value = await readSnapshot(await reader);
				if (value.submissions.some((entry) => !entry.outcome)) await recover(id);
				return value;
			},
			async close() { await (await reader?.catch(() => undefined))?.close(context); },
		};
	}
	function claim(id: string): Promise<Owner | undefined> {
		if (closed) return Promise.reject(new Error('Engine is closed.'));
		if (active.has(id) || opening.has(id)) return Promise.resolve(undefined);
		const pending = (async () => {
			const storage = await manager.acquire(id);
			if (!storage) return undefined;
			try {
				const owner = await openOwner(id, storage, options, () => report('submission_recovery'));
				active.set(id, owner);
				return owner;
			} catch (error) { await storage.close(context); throw error; }
		})();
		opening.set(id, pending);
		void pending.finally(() => opening.delete(id)).catch(() => {});
		return pending;
	}
	function run(id: string, owner: Owner, submissionId: SubmissionId) {
		let cancellation: Promise<void> | undefined;
		let cancelled = false;
		let failed = false;
		const reportFailed = () => { if (!failed && !owner.interrupted) { failed = true; report('submission_failed'); } };
		const started = Date.now();
		let ended: Pick<TurnRecord, 'status' | 'model' | 'providerStatus'> = { status: 'unsettled' };
		const checkCancellation = () => {
			if (cancellation || cancelled || owner.interrupted) return;
			cancellation = (async () => {
				if (await owner.storage.cancelThrough() >= submissionId) {
					cancelled = true;
					await owner.root.abort(context);
				}
			})().finally(() => { cancellation = undefined; });
			void cancellation.catch(() => {});
		};
		const poll = setInterval(checkCancellation, 100);
		const timer = setTimeout(() => { owner.interrupted = true; void owner.stop().catch(() => {}); }, options.executionMs ?? 240_000);
		const done = owner.done = (async () => {
			try {
				checkCancellation();
				await owner.root.waitForIdle(context);
				if (!owner.interrupted) {
					const turn = await readSnapshot(owner.storage);
					const submission = turn.submissions.find((entry) => entry.id === String(submissionId));
					const reply = turn.messages.findLast((m) => m.role === 'assistant' && m.submissionId === submission?.id);
					ended = { status: submission?.outcome ?? 'unsettled', model: reply?.metadata?.socratink.routedModel ?? owner.modelId() };
					if (submission?.outcome === 'failed') {
						reportFailed();
						const recent = await owner.storage.scanEntries({ conversationId: ROOT_CONVERSATION_ID, order: 'descending' }, 20, undefined, context);
						const reply = recent.items.flatMap((entry) => [...(entry.model ?? [])].reverse())
							.find((message) => message.role === 'assistant' && message.stopReason === 'error');
						const status = reply?.role === 'assistant' ? providerHttpStatus(reply.errorMessage) : undefined;
						if (status) ended.providerStatus = status;
					}
				}
			} catch { ended = { status: 'error' }; reportFailed(); }
			finally {
				clearInterval(poll); clearTimeout(timer);
				bestEffort(() => options.logTurn?.({ conversationId: id, submissionId: String(submissionId), latencyMs: Date.now() - started,
					...ended, ...(owner.interrupted ? { status: 'interrupted' } : {}) }));
				await cancellation?.catch(() => {});
				await owner.stop().catch(reportFailed);
				if (active.get(id) === owner) active.delete(id);
			}
		})();
		bestEffort(() => options.keepAlive?.(done));
	}
	async function recover(id: string) {
		if (closed || active.has(id) || opening.has(id) || retryAfter.has(id)) return;
		const owner = await claim(id);
		if (!owner) {
			retryAfter.set(id, setTimeout(() => retryAfter.delete(id), 1_000));
			return;
		}
		try {
			const pending = (await readSnapshot(owner.storage)).submissions.find((entry) => !entry.outcome);
			if (!pending) { await owner.stop(); active.delete(id); return; }
			report('submission_recovery');
			run(id, owner, Number(pending.id) as SubmissionId);
		} catch (error) { await owner.stop(); active.delete(id); throw error; }
	}
	return {
		async submit(id, text, selection) {
			const owner = await claim(id);
			if (!owner) throw new DurableBusyError();
			try {
				const pending = (await readSnapshot(owner.storage)).submissions.find((entry) => !entry.outcome);
				if (pending) {
					report('submission_recovery'); run(id, owner, Number(pending.id) as SubmissionId);
					throw new DurableBusyError();
				}
				const requestId = randomUUID();
				const submission = await owner.root.submit({ type: 'input', content: text, whenBusy: 'reject', requestId,
					entry: { kind: inputKind, data: { requestId, revealConsent: true, ...(selection ? { selection } : {}) } } }, context);
				run(id, owner, submission.id);
				return String(submission.id);
			} catch (error) {
				if (!owner.done) { await owner.stop(); active.delete(id); }
				throw error;
			}
		},
		async snapshot(id) {
			const follower = follow(id);
			try { return await follower.snapshot(); } finally { await follower.close(); }
		},
		follow,
		async abort(id, submissionId) {
			// Cancel through this submission only: a later one, such as a reply another
			// tab started after this one settled, keeps running.
			const pending = (await snapshot(id)).submissions.some((entry) => entry.id === submissionId && !entry.outcome);
			if (!pending) return false;
			await manager.cancel(id, Number(submissionId));
			await recover(id);
			return true;
		},
		async close() {
			if (closed) return;
			closed = true;
			for (const timer of retryAfter.values()) clearTimeout(timer);
			retryAfter.clear();
			await Promise.allSettled(opening.values());
			await Promise.all([...active.values()].map(async (owner) => {
				owner.interrupted = true;
				await owner.stop(); await owner.done;
			}));
			await manager.close();
		},
	};
}

async function openOwner(id: string, storage: OwnedStorage, options: EngineOptions, reportRetry: () => void): Promise<Owner> {
	let root: Conversation;
	let modelId: string | undefined;
	const models = conversationModels(options, id, async (): Promise<ModelSelection | undefined> => {
		let cursor: Cursor | undefined;
		do {
			const page = await root.entries({ order: 'descending' }, 100, cursor, context);
			const input = page.items.find((entry) => entry.kind === inputKind);
			if (input) return (input.data as InputData).selection;
			cursor = page.next;
		} while (cursor);
		return undefined;
	}, (config) => { modelId = config.modelId; });
	const registry = productRegistry();
	const feedback = await feedbackExtension(id);
	if (feedback) registry.install(feedback);
	const harness = await Harness.open(storage, { models, registry,
		settings: { compaction: { enabled: false }, stream: { maxRetries: 0 },
			retry: { maxRetries: 2, baseDelayMs: 2_000 }, progress: { persistWithinMs: 50 } },
	}, context);
	try {
		root = await harness.root(context, { agent: { model: modelRef, maxTurns: 8 } });
		let lastRetry: string | undefined;
		const observation = await harness.observeDoc(LiveDoc, root.id, {
			advance(call) {
				if (call.kind !== 'value') return;
				const live = call.value;
				if (!live.generation?.retry) return;
				const key = `${live.run?.taskId}:${live.generation.attempt}`;
				if (key !== lastRetry) { lastRetry = key; queueMicrotask(reportRetry); }
			},
			end() {},
		}, context);
		const initial = observation?.value;
		if (initial?.generation?.retry) lastRetry = `${initial.run?.taskId}:${initial.generation.attempt}`;
		else if (initial?.run) {
			const task = await harness.getTask(initial.run.taskId, context);
			const checkpoint = task?.state.checkpoint;
			// Pi charges this interrupted request as a retry when scheduling resumes.
			if (task?.restarts !== undefined && checkpoint && typeof checkpoint === 'object' && !Array.isArray(checkpoint)
				&& (checkpoint.phase === 'request' || checkpoint.phase === 'poll') && typeof checkpoint.attempt === 'number') {
				lastRetry = `${task.id}:${checkpoint.attempt}`;
			}
		}
	}
	catch (error) { await harness.close(context); throw error; }
	let closing: Promise<void> | undefined;
	return { storage, harness, root, interrupted: false, modelId: () => modelId,
		stop: () => closing ??= harness.close(context) };
}

function bestEffort(hook: () => void) {
	try { hook(); } catch {}
}
