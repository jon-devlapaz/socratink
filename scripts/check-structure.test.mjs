import assert from 'node:assert/strict';
import test from 'node:test';
import { findProblems } from './check-structure.mjs';

const before78 = `import pg from 'pg';
export function postgresLog(connectionString) {
	const pool = new pg.Pool({ connectionString });
	const ready = initialize();
	void ready.catch(() => {});
	async function initialize() {
		const client = await pool.connect();
		await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1, 0))', ['socratink_pi:schema-init']);
		await client.query(\`CREATE SCHEMA IF NOT EXISTS socratink_pi;\`);
	}
}`;

const before80 = `import { DatabaseSync } from 'node:sqlite';
export type AuthPgClient = { query(text: string, values?: unknown[]): Promise<{ rows: unknown[] }> };
const CREATE_TABLES_SQL = \`CREATE TABLE IF NOT EXISTS socratink_users (id TEXT PRIMARY KEY)\`;
export function createPostgresAuthDb(client: AuthPgClient) {
	let ready: Promise<void> | undefined;
	const ensure = () => (ready ??= client.query(CREATE_TABLES_SQL).then(() => undefined));
}`;

const fixed = `import type { AuthPgClient } from './auth-db.ts';
import { setupOnce } from './setup-once.ts';
const CREATE_SQL = \`CREATE TABLE IF NOT EXISTS socratink_conversations (id TEXT PRIMARY KEY)\`;
export function createPostgresConversationIndex(client: AuthPgClient) {
	const ensure = setupOnce(() => client.query(CREATE_SQL));
}`;

const sqliteOnly = `import { DatabaseSync } from 'node:sqlite';
new DatabaseSync(':memory:').exec('CREATE TABLE IF NOT EXISTS t (id TEXT)');`;

test('postgres-setup-retries fails on the code behind #78 and #80 and names the fix', () => {
	const problems = findProblems([
		{ file: 'src/server/durable/storage-postgres.ts', text: before78 },
		{ file: 'src/server/auth-db.ts', text: before80 },
	]);
	assert.equal(problems.length, 2);
	for (const problem of problems) assert.match(problem, /\[postgres-setup-retries\].*setupOnce\(\) from src\/server\/setup-once\.ts/);
});

test('postgres-setup-retries passes setup through setupOnce, SQLite-only stores and tests', () => {
	assert.deepEqual(findProblems([
		{ file: 'src/server/conversation-index.ts', text: fixed },
		{ file: 'src/server/local-store.ts', text: sqliteOnly },
		{ file: 'src/server/durable/provider.test.ts', text: before80 },
	]), []);
});
