import { createHash } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { emptyLog, logFormat, maximumId, type LogBackend, type LogState } from './storage-types.ts';

type Metadata = { format: number; next_id: number; abort_through: number };

export function sqliteLog(filename: string): LogBackend {
	mkdirSync(dirname(filename), { recursive: true });
	const lockDirectory = `${filename}.locks`;
	mkdirSync(lockDirectory, { recursive: true });
	const db = new DatabaseSync(filename);
	db.exec(`PRAGMA busy_timeout=5000; PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL;
		CREATE TABLE IF NOT EXISTS pi_namespaces (namespace TEXT PRIMARY KEY, format INTEGER NOT NULL,
			next_id INTEGER NOT NULL, abort_through INTEGER NOT NULL DEFAULT 0);
		CREATE TABLE IF NOT EXISTS pi_commits (namespace TEXT NOT NULL, seq INTEGER NOT NULL, writes TEXT NOT NULL,
			PRIMARY KEY(namespace,seq));`);
	function state(namespace: string, after = 0): LogState {
		const metadata = db.prepare('SELECT * FROM pi_namespaces WHERE namespace=?').get(namespace) as Metadata | undefined;
		return metadata ? { format: metadata.format, nextId: metadata.next_id,
			commits: db.prepare('SELECT seq,writes FROM pi_commits WHERE namespace=? AND seq>? ORDER BY seq').all(namespace, after) as LogState['commits'] } : emptyLog();
	}
	function transaction<T>(run: () => T): T {
		db.exec('BEGIN');
		try { const result = run(); db.exec('COMMIT'); return result; }
		catch (error) { db.exec('ROLLBACK'); throw error; }
	}
	return {
		async exists(namespace) { return !!db.prepare('SELECT 1 FROM pi_namespaces WHERE namespace=?').get(namespace); },
		async read(namespace, after) { return transaction(() => state(namespace, after)); },
		async claim(namespace) {
			// Separate per-conversation lock files allow other conversations to run.
			// The OS releases this transaction if its owning process dies.
			const lock = new DatabaseSync(join(lockDirectory, `${createHash('sha256').update(namespace).digest('hex')}.sqlite`));
			try { lock.exec('BEGIN EXCLUSIVE'); }
			catch (error) {
				lock.close();
				if (typeof error === 'object' && error && 'errcode' in error && (error.errcode === 5 || error.errcode === 6)) return undefined;
				throw error;
			}
			let closed = false;
			const assertOwned = () => { if (closed) throw new Error('SQLite execution ownership was lost.'); };
			try {
				db.prepare('INSERT OR IGNORE INTO pi_namespaces(namespace,format,next_id) VALUES (?,?,2)').run(namespace, logFormat);
				return {
					state: transaction(() => state(namespace)), assertOwned,
					async append(seq, writes, nextId) {
						assertOwned();
						transaction(() => {
							db.prepare('UPDATE pi_namespaces SET next_id=MAX(next_id,?) WHERE namespace=?').run(nextId, namespace);
							db.prepare('INSERT INTO pi_commits(namespace,seq,writes) VALUES (?,?,?)').run(namespace, seq, writes);
						});
					},
					async mintId() {
						assertOwned();
						const result = db.prepare('UPDATE pi_namespaces SET next_id=next_id+1 WHERE namespace=? AND next_id<=? RETURNING next_id-1 AS id')
							.get(namespace, maximumId) as { id: number } | undefined;
						return result?.id ?? NaN;
					},
					async cancelThrough() {
						assertOwned();
						return (db.prepare('SELECT * FROM pi_namespaces WHERE namespace=?').get(namespace) as Metadata).abort_through;
					},
					async close() { if (!closed) { closed = true; lock.close(); } },
				};
			} catch (error) { lock.close(); throw error; }
		},
		async cancel(namespace, through) { db.prepare('UPDATE pi_namespaces SET abort_through=MAX(abort_through,?) WHERE namespace=?').run(through, namespace); },
		async close() { db.close(); },
	};
}
