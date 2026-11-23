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

const pastLeakFixes = {
	'#25 marker in the UI': `const internalAssistantMarkersPattern = /^(?:«[A-Z][A-Z0-9_]*»\\s*)+/u;`,
	'#117 think tags in the projection': `const closed = raw.lastIndexOf('</think>');`,
	'#117 think tags as a regex': `inline = inline.replaceAll(/<\\/?think>/g, '').trim();`,
	'#116 tool names in the UI': `const internalToolNamePattern = /\\b(?:mark_reveal|present_question)\\b/u;`,
	'#131 "(no text)" in the projection': `if (/^\\(no text\\)$/i.test(text.trim())) text = '';`,
	'#136 reveal notes in the UI': `const revealNotePattern = /\\b(?:no reveal|no answer shown)\\b/iu;`,
};

test('learner-text-owner fails on each past leak fix written outside the owner and names the fix', () => {
	for (const [name, text] of Object.entries(pastLeakFixes)) {
		const problems = findProblems([{ file: 'src/ui/live-reply.ts', text }]);
		assert.equal(problems.length, 1, name);
		assert.match(problems[0], /\[learner-text-owner\].*src\/learning\/learner-text\.ts/, name);
	}
});

test('learner-text-owner passes the owner, prompts that say "no text", and tests', () => {
	assert.deepEqual(findProblems([
		{ file: 'src/learning/learner-text.ts', text: Object.values(pastLeakFixes).join('\n') },
		{ file: 'src/learning/mark-reveal.ts', text: 'const prompt = `Call ${revealToolName} now and write no text.`;' },
		{ file: 'src/ui/live-reply.test.ts', text: pastLeakFixes['#25 marker in the UI'] },
		{ file: 'src/ui/markdown.ts', text: "const quote = text.replace(/[«»]/g, '\"');" },
	]), []);
});
