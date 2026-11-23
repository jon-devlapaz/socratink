import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import type { DatabaseTarget } from '../config/database.ts';
import { conversationTitle, type ConversationSummary } from '../config/conversations.ts';
import { userIdFromConversationId } from '../config/session.ts';
import { sharedPostgresPool } from './postgres-pool.ts';
import type { AuthPgClient } from './auth-db.ts';
import { setupOnce } from './setup-once.ts';

export interface ConversationIndex {
	recordAdmitted(conversationId: string, text: string, at?: Date): Promise<void>;
	/** Newest first, for a learner and their guest aliases. */
	list(ownerIds: readonly string[]): Promise<ConversationSummary[]>;
	close(): Promise<void>;
}

export const conversationListLimit = 50;

const CREATE_SQL = `CREATE TABLE IF NOT EXISTS socratink_conversations (
	id TEXT PRIMARY KEY,
	owner_user_id TEXT NOT NULL,
	title TEXT NOT NULL,
	created_at TEXT NOT NULL,
	updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS socratink_conversations_owner
	ON socratink_conversations (owner_user_id, updated_at DESC);`;

const POSTGRES_RECORD_SQL = `INSERT INTO socratink_conversations (id, owner_user_id, title, created_at, updated_at)
VALUES ($1, $2, $3, $4, $4)
ON CONFLICT (id) DO UPDATE SET updated_at = EXCLUDED.updated_at`;
const POSTGRES_LIST_SQL = `SELECT id, title, updated_at FROM socratink_conversations
WHERE owner_user_id = ANY($1::text[]) ORDER BY updated_at DESC LIMIT $2`;

const SQLITE_RECORD_SQL = `INSERT INTO socratink_conversations (id, owner_user_id, title, created_at, updated_at)
VALUES (?1, ?2, ?3, ?4, ?4)
ON CONFLICT (id) DO UPDATE SET updated_at = excluded.updated_at`;

export function createConversationIndex(target: DatabaseTarget): ConversationIndex {
	switch (target.kind) {
		case 'postgres': {
			const pool = sharedPostgresPool(target.connectionString);
			return createPostgresConversationIndex({ query: (text, values) => pool.query(text, values), end: async () => {} });
		}
		case 'sqlite':
			return createSqliteConversationIndex(target.filename);
		default: {
			const exhaustive: never = target;
			throw new Error(`Unexpected store target: ${JSON.stringify(exhaustive)}`);
		}
	}
}

export function createPostgresConversationIndex(client: AuthPgClient): ConversationIndex {
	const ensure = setupOnce(() => client.query(CREATE_SQL));
	return {
		async recordAdmitted(conversationId, text, at = new Date()) {
			const row = admittedRow(conversationId, text, at);
			if (!row) return;
			await ensure();
			await client.query(POSTGRES_RECORD_SQL, row);
		},
		async list(ownerIds) {
			if (ownerIds.length === 0) return [];
			await ensure();
			const result = await client.query(POSTGRES_LIST_SQL, [ownerIds, conversationListLimit]);
			return result.rows.map(summary);
		},
		async close() { await client.end(); },
	};
}

export function createSqliteConversationIndex(filename: string): ConversationIndex {
	if (filename !== ':memory:') mkdirSync(dirname(filename), { recursive: true });
	const database = new DatabaseSync(filename);
	database.exec(CREATE_SQL);
	return {
		async recordAdmitted(conversationId, text, at = new Date()) {
			const row = admittedRow(conversationId, text, at);
			if (row) database.prepare(SQLITE_RECORD_SQL).run(...row);
		},
		async list(ownerIds) {
			if (ownerIds.length === 0) return [];
			const owners = ownerIds.map(() => '?').join(', ');
			return database.prepare(`SELECT id, title, updated_at FROM socratink_conversations
				WHERE owner_user_id IN (${owners}) ORDER BY updated_at DESC LIMIT ?`)
				.all(...ownerIds, conversationListLimit).map(summary);
		},
		async close() { database.close(); },
	};
}

function admittedRow(conversationId: string, text: string, at: Date): [string, string, string, string] | undefined {
	const owner = userIdFromConversationId(conversationId);
	const title = conversationTitle(text);
	return owner && title ? [conversationId, owner, title, at.toISOString()] : undefined;
}

function summary(row: object): ConversationSummary {
	const { id, title, updated_at: updatedAt } = row as { id: string; title: string; updated_at: string };
	return { id, title, updatedAt };
}
