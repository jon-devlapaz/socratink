import { MemoryStorage } from '@earendil-works/pi-durable/storage/memory';
import { BACKGROUND_CONTEXT, type Context } from '@earendil-works/chord/context';
import type { ConversationId, EntryId, Id, Seq, Storage, StorageWrite } from '@earendil-works/pi-durable';
import type { DatabaseTarget } from '../../config/database.ts';
import { postgresLog } from './storage-postgres.ts';
import { sqliteLog } from './storage-sqlite.ts';
import { logFormat, maximumId, type LogLease, type LogState } from './storage-types.ts';

export type CommittedStorage = Storage & { readonly revision: number };
export type OwnedStorage = CommittedStorage & { cancelThrough: () => Promise<number> };

/** Pi 1.5 validates native records; dialect-specific logs commit them before
 * publication. Preview reads replay the full history into memory. No connection
 * or execution ownership is retained for an idle conversation.
 */
export function createDurableStorage(target: DatabaseTarget) {
	const backend = target.kind === 'postgres' ? postgresLog(target.connectionString) : sqliteLog(target.filename);
	return {
		exists: backend.exists,
		async acquire(id: string): Promise<OwnedStorage | undefined> {
			const lease = await backend.claim(id);
			if (!lease) return undefined;
			try { return own(replay(lease.state), lease); }
			catch (error) { await lease.close(); throw error; }
		},
		async read(id: string): Promise<CommittedStorage> {
			const state = await backend.read(id);
			const memory = replay(state);
			const refuse = async (): Promise<never> => { throw new Error('Storage is read-only.'); };
			return { revision: state.commits.length, ...readMethods(memory, (read) => read()), commit: refuse, mintId: refuse,
				close: (context) => memory.close(context) };
		},
		cancel: backend.cancel,
		close: backend.close,
	};
}

function replay(state: LogState): MemoryStorage {
	if (state.format !== logFormat) throw new Error('Unsupported Pi storage format.');
	if (state.nextId < 2 || (!Number.isSafeInteger(state.nextId) && state.nextId !== maximumId + 1)) throw new Error('Invalid Pi ID counter.');
	const memory = new MemoryStorage();
	let expectedSeq = 1;
	let minimumId = 2;
	for (const record of state.commits) {
		if (record.seq !== expectedSeq++ || !Number.isSafeInteger(record.seq)) throw new Error('Pi storage history has a gap.');
		const writes: StorageWrite[] = JSON.parse(record.writes);
		memory.prepareCommit(writes, record.seq as Seq).apply();
		minimumId = Math.max(minimumId, nextIdAfter(writes));
	}
	if (state.nextId < minimumId) throw new Error('Pi ID counter is behind committed records.');
	return memory;
}

function own(memory: MemoryStorage, lease: LogLease): OwnedStorage {
	let revision = lease.state.commits.length;
	let failure: unknown;
	let closing: Promise<void> | undefined;
	let tail: Promise<unknown> = Promise.resolve();
	function serialized<T>(operation: () => Promise<T>): Promise<T> {
		if (closing) return Promise.reject(new Error('Pi storage is closed.'));
		const result = tail.then(() => {
			if (failure) throw new Error('Pi storage failed and must be reopened.', { cause: failure });
			lease.assertOwned();
			return operation();
		});
		tail = result.catch(() => {});
		return result;
	}
	return {
		get revision() { return revision; },
		...readMethods(memory, serialized),
		commit: (batches, receive) => serialized(async () => {
			const receipts: Seq[] = [];
			let refused: unknown;
			try {
				for (const writes of batches) {
					let prepared;
					try { prepared = memory.prepareCommit(writes); }
					catch (error) { refused = error; break; }
					try {
						await lease.append(prepared.seq, JSON.stringify(prepared.writes), nextIdAfter(prepared.writes));
						receipts.push(prepared.seq);
						prepared.apply();
						revision = prepared.seq;
					} catch (error) { failure = error; throw error; }
				}
			} finally { for (const [index, seq] of receipts.entries()) receive(index, seq); }
			return refused === undefined ? { stored: receipts.length } : { stored: receipts.length, refused };
		}),
		mintId: <I extends Id<string>>() => serialized(async () => {
			let id: number;
			try { id = await lease.mintId(); } catch (error) { failure = error; throw error; }
			if (!Number.isSafeInteger(id)) throw new Error('ID space is exhausted');
			return id as I;
		}),
		cancelThrough: () => serialized(() => lease.cancelThrough()),
		close: () => {
			closing ??= tail.then(async () => {
				try { await memory.close(BACKGROUND_CONTEXT); } finally { await lease.close(); }
			});
			return closing;
		},
	};
}

function readMethods(memory: MemoryStorage, run: <T>(read: () => Promise<T>) => Promise<T>): Omit<Storage, 'commit' | 'mintId' | 'close'> {
	const entry: Storage['entry'] = (first: ConversationId | EntryId, second: EntryId | Context, third?: Context) =>
		run(() => third ? memory.entry(first as ConversationId, second as EntryId, third) : memory.entry(first as EntryId, second as Context));
	return {
		conversation: (...args) => run(() => memory.conversation(...args)),
		scanConversations: (...args) => run(() => memory.scanConversations(...args)),
		entry,
		findLatestHeadMarker: (...args) => run(() => memory.findLatestHeadMarker(...args)),
		scanEntries: (...args) => run(() => memory.scanEntries(...args)),
		task: (...args) => run(() => memory.task(...args)),
		scanTasks: (...args) => run(() => memory.scanTasks(...args)),
		submission: (...args) => run(() => memory.submission(...args)),
		scanSubmissions: (...args) => run(() => memory.scanSubmissions(...args)),
		submissionByRequest: (...args) => run(() => memory.submissionByRequest(...args)),
		findDocument: (...args) => run(() => memory.findDocument(...args)),
		document: (...args) => run(() => memory.document(...args)),
		scanDocuments: (...args) => run(() => memory.scanDocuments(...args)),
	};
}

function nextIdAfter(writes: readonly StorageWrite[]): number {
	let next = 2;
	for (const write of writes) {
		if ('value' in write) next = Math.max(next, write.value.id + 1);
		else if ('record' in write) next = Math.max(next, write.record.id + 1);
	}
	if (!Number.isSafeInteger(next) && next !== maximumId + 1) throw new Error('Invalid stored record ID.');
	return next;
}
