import { Pool } from 'pg';
import { attachDatabasePool } from '@vercel/functions/db-connections';
import type { ConversationStreamChunk } from '@flue/sdk';
import { progressEvents, type BrowserStream, type Progress, initialProgress, alreadyObserved, canonicalObservation, stampEvent, boundedCursor } from './browser-events.ts';

/** The same browser contract as SQLite, with observations committed in Postgres. */
export async function openPostgresBrowserStream(connectionString: string): Promise<BrowserStream> {
	const pool = new Pool({ connectionString, max: 3 });
	attachDatabasePool(pool);
	try {
		const client = await pool.connect();
		try {
			await client.query('BEGIN');
			await client.query("SELECT pg_advisory_xact_lock(hashtextextended('socratink_pi:schema-init', 0))");
			await client.query(`CREATE SCHEMA IF NOT EXISTS socratink_pi;
			CREATE TABLE IF NOT EXISTS socratink_pi.browser_progress (
				conversation TEXT PRIMARY KEY, offset_value BIGINT NOT NULL, state TEXT NOT NULL);
			CREATE TABLE IF NOT EXISTS socratink_pi.browser_events (
				sequence BIGSERIAL PRIMARY KEY, conversation TEXT NOT NULL, event TEXT NOT NULL);
			CREATE INDEX IF NOT EXISTS browser_events_conversation ON socratink_pi.browser_events(conversation, sequence)`);
			await client.query('COMMIT');
		} catch (error) { await client.query('ROLLBACK').catch(() => {}); throw error; }
		finally { client.release(); }
	} catch (error) { await pool.end(); throw error; }
	return {
		async sync(snapshot) {
			const client = await pool.connect();
			try {
				await client.query('BEGIN');
				const initial: Progress = initialProgress();
				await client.query(`INSERT INTO socratink_pi.browser_progress VALUES ($1,0,$2)
					ON CONFLICT (conversation) DO NOTHING`, [snapshot.conversationId, JSON.stringify(initial)]);
				const { rows: [stored] } = await client.query<{ offset_value: string; state: string }>(
					'SELECT offset_value, state FROM socratink_pi.browser_progress WHERE conversation=$1 FOR UPDATE', [snapshot.conversationId]);
				const state: Progress = JSON.parse(stored!.state);
				let offset = stored!.offset_value;
				if (alreadyObserved(snapshot, state)) {
					await client.query('COMMIT');
					return { offset, snapshot: state.snapshot! };
				}
				for (const event of progressEvents(snapshot, state)) {
					const result = await client.query<{ sequence: string }>(
						'INSERT INTO socratink_pi.browser_events(conversation,event) VALUES ($1,$2) RETURNING sequence',
						[snapshot.conversationId, JSON.stringify(event)]);
					offset = result.rows[0]!.sequence;
					if (event.type === 'conversation-reset') await client.query('UPDATE socratink_pi.browser_events SET event=$1 WHERE sequence=$2',
						[JSON.stringify(stampEvent(event, offset)), offset]);
				}
				const observation = canonicalObservation(snapshot, state, offset);
				await client.query('UPDATE socratink_pi.browser_progress SET offset_value=$2,state=$3 WHERE conversation=$1',
					[snapshot.conversationId, offset, JSON.stringify(state)]);
				await client.query('COMMIT');
				return observation;
			} catch (error) { await client.query('ROLLBACK'); throw error; }
			finally { client.release(); }
		},
		async read(conversationId, offset, through) {
			const after = /^\d+$/.test(offset) && Number.isSafeInteger(Number(offset)) ? offset : '0';
			const result = await pool.query<{ sequence: string; event: string }>(
				'SELECT sequence,event FROM socratink_pi.browser_events WHERE conversation=$1 AND sequence>$2 AND sequence<=$3 ORDER BY sequence',
				[conversationId, after, boundedCursor(through)]);
			return result.rows.map((row): ConversationStreamChunk => {
				const batch = Number(row.sequence);
				if (!Number.isSafeInteger(batch)) throw new Error('Browser cursor exceeds SDK integer range.');
				return { ...JSON.parse(row.event), conversationId, position: { batch, index: 0 } };
			});
		},
		close: () => pool.end(),
	};
}
