import { DatabaseSync } from 'node:sqlite';
import type { ConversationStreamChunk } from '@flue/sdk';
import type { BrowserSnapshot } from './browser-projection.ts';

import { progressEvents, initialProgress, alreadyObserved, canonicalObservation, stampEvent, boundedCursor, type Progress, type BrowserObservation } from './browser-events.ts';
export type { BrowserStream } from './browser-events.ts';
type StoredProgress = { offset: number; state: string };

export function openBrowserStream(filename: string) {
	const db = new DatabaseSync(filename);
	db.exec(`PRAGMA journal_mode = WAL; PRAGMA synchronous = FULL;
		CREATE TABLE IF NOT EXISTS pi_browser_progress (conversation TEXT PRIMARY KEY, offset INTEGER NOT NULL, state TEXT NOT NULL);
		CREATE TABLE IF NOT EXISTS pi_browser_events (sequence INTEGER PRIMARY KEY AUTOINCREMENT, conversation TEXT NOT NULL, event TEXT NOT NULL);
		CREATE INDEX IF NOT EXISTS pi_browser_events_conversation ON pi_browser_events(conversation, sequence);`);
	return {
		sync(snapshot: BrowserSnapshot): BrowserObservation {
			const id = snapshot.conversationId;
			db.exec('BEGIN IMMEDIATE');
			try {
				const stored = db.prepare('SELECT offset, state FROM pi_browser_progress WHERE conversation = ?').get(id) as StoredProgress | undefined;
				const state: Progress = stored ? JSON.parse(stored.state) : initialProgress();
				let offset = stored?.offset ?? 0;
				if (alreadyObserved(snapshot, state)) {
					db.exec('COMMIT');
					return { offset: String(offset), snapshot: state.snapshot! };
				}
				const events = progressEvents(snapshot, state);
				for (const event of events) {
					offset = Number(db.prepare('INSERT INTO pi_browser_events(conversation, event) VALUES (?, ?)').run(id, JSON.stringify(event)).lastInsertRowid);
					if (event.type === 'conversation-reset') db.prepare('UPDATE pi_browser_events SET event=? WHERE sequence=?')
						.run(JSON.stringify(stampEvent(event, String(offset))), offset);
				}
				const observation = canonicalObservation(snapshot, state, String(offset));
				db.prepare('INSERT OR REPLACE INTO pi_browser_progress(conversation, offset, state) VALUES (?, ?, ?)').run(id, offset, JSON.stringify(state));
				db.exec('COMMIT');
				return observation;
			} catch (error) { db.exec('ROLLBACK'); throw error; }
		},
		read(conversationId: string, offset: string, through: string): ConversationStreamChunk[] {
			const after = /^\d+$/.test(offset) && Number.isSafeInteger(Number(offset)) ? Number(offset) : 0;
			const rows = db.prepare('SELECT sequence, event FROM pi_browser_events WHERE conversation = ? AND sequence > ? AND sequence <= ? ORDER BY sequence')
				.all(conversationId, after, Number(boundedCursor(through))) as { sequence: number; event: string }[];
			return rows.map((row) => ({ ...JSON.parse(row.event), conversationId, position: { batch: row.sequence, index: 0 } }));
		},
		close() { db.close(); },
	};
}
