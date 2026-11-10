import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, test } from 'node:test';
import { BACKGROUND_CONTEXT as context } from '@earendil-works/chord/context';
import { ROOT_CONVERSATION_ID } from '@earendil-works/pi-durable';
import { commitWrites, createStorageConformance } from '@earendil-works/pi-durable/testing';
import { createDurableStorage } from '../src/server/durable/storage.ts';
import { postgresOwnerConnectionString } from '../src/server/durable/storage-postgres.ts';
import pg from 'pg';
import { startDisposablePostgres } from './durable-postgres-fixture.mjs';

let directory;
let postgres;
before(async () => {
	directory = await mkdtemp(join(tmpdir(), 'socratink-durable-storage-'));
	if (process.env.DURABLE_TEST_POSTGRES === '1') postgres = await startDisposablePostgres();
});
after(async () => { await postgres?.stop(); await rm(directory, { recursive: true, force: true }); });

test('a Neon pooled URL uses only its matching direct endpoint for execution ownership', () => {
	const pooled = 'postgresql://user:synthetic%21@ep-damp-unit-a123-pooler.us-east-2.aws.neon.tech/db?sslmode=require';
	const direct = new URL(postgresOwnerConnectionString(pooled));
	assert.equal(direct.hostname, 'ep-damp-unit-a123.us-east-2.aws.neon.tech');
	const original = new URL(pooled);
	for (const key of ['username', 'password', 'pathname', 'search', 'port']) assert.equal(direct[key], original[key]);
	assert.equal(postgresOwnerConnectionString('postgresql://localhost:5432/test'), 'postgresql://localhost:5432/test');
	assert.throws(() => postgresOwnerConnectionString('postgresql://user:synthetic@aws.pooler.supabase.com/test'), /direct|session/i);
});

for (const dialect of ['sqlite', ...(process.env.DURABLE_TEST_POSTGRES === '1' ? ['postgres'] : [])]) {
	const target = () => dialect === 'postgres'
		? { kind: 'postgres', connectionString: postgres.connectionString }
		: { kind: 'sqlite', filename: join(directory, `${randomUUID()}.sqlite`) };
	const cases = createStorageConformance({
		assertions: {
			ok: (value, message) => assert.ok(value, message ?? 'Expected truthy value.'),
			strictEqual: assert.strictEqual, deepEqual: assert.deepStrictEqual,
			partialDeepEqual: assert.partialDeepStrictEqual,
			greaterThan: (actual, expected) => assert.ok(actual > expected),
			rejects: async (operation, includes) => assert.rejects(operation, (error) => String(error).includes(includes)),
		},
		withStorage: async (use) => {
			const manager = createDurableStorage(target());
			const storage = await manager.acquire(`conformance:${randomUUID()}`);
			assert.ok(storage);
			try { await use(storage); }
			finally { await storage.close(context); await manager.close(); }
		},
	});
	for (const entry of cases) test(`${dialect}: ${entry.name}`, entry.run);

	test(`${dialect}: another manager reads committed progress without taking execution ownership`, async () => {
		const selected = target();
		const first = createDurableStorage(selected);
		const second = createDurableStorage(selected);
		const id = `learner:${randomUUID()}`;
		let owner;
		let reader;
		try {
			owner = await first.acquire(id);
			assert.ok(owner);
			await commitWrites(owner, [{ type: 'conversation', value: { id: ROOT_CONVERSATION_ID } }], context);
			assert.equal(await second.acquire(id), undefined);
			const entryId = await owner.mintId();
			await commitWrites(owner, [{ type: 'entry', value: { id: entryId, conversationId: ROOT_CONVERSATION_ID, kind: 'visible' } }], context);
			reader = await second.read(id);
			assert.equal((await reader.entry(entryId, context)).entry.kind, 'visible');
			await assert.rejects(reader.mintId(), /read.only/i);
			await second.cancel(id, entryId);
			assert.equal(await owner.cancelThrough(), entryId);
			await owner.close(context);
			owner = await second.acquire(id);
			assert.ok(owner);
			assert.equal((await owner.entry(entryId, context)).entry.kind, 'visible');
			assert.ok(await owner.mintId() > entryId);
		} finally {
			await reader?.close(context); await owner?.close(context);
			await first.close(); await second.close();
		}
	});

	test(`${dialect}: ownership is released on close and unused IDs remain reserved`, async () => {
		const selected = target();
		const manager = createDurableStorage(selected);
		const id = `learner:${randomUUID()}`;
		let storage = await manager.acquire(id);
		try {
			const unused = await storage.mintId();
			await storage.close(context);
			storage = await manager.acquire(id);
			assert.ok(storage);
			assert.ok(await storage.mintId() > unused);
		} finally { await storage?.close(context); await manager.close(); }
	});
}

if (process.env.DURABLE_TEST_POSTGRES === '1') test('Postgres SQL failure rolls back its whole commit and reopens from the last acknowledged record', async () => {
	const manager = createDurableStorage({ kind: 'postgres', connectionString: postgres.connectionString });
	const id = `rollback:${randomUUID()}`;
	const client = new pg.Client({ connectionString: postgres.connectionString });
	let storage = await manager.acquire(id);
	await client.connect();
	try {
		await commitWrites(storage, [{ type: 'conversation', value: { id: ROOT_CONVERSATION_ID } }], context);
		// Force failure after the allocator update, inside the real SQL transaction.
		await client.query(`ALTER TABLE socratink_pi.commits ADD CONSTRAINT synthetic_commit_failure CHECK (namespace <> '${id}' OR seq < 3)`);
		const receipts = [];
		const entry = (number) => [{ type: 'entry', value: { id: number, conversationId: ROOT_CONVERSATION_ID, kind: 'synthetic' } }];
		await assert.rejects(storage.commit([entry(2), entry(100)], (index, seq) => receipts.push([index, seq]), context), /synthetic_commit_failure/);
		assert.deepEqual(receipts, [[0, 2]]);
		assert.equal(Number((await client.query('SELECT next_id FROM socratink_pi.namespaces WHERE namespace=$1', [id])).rows[0].next_id), 3);
		await assert.rejects(storage.entry(2, context), /reopened/);
		await storage.close(context);
		storage = await manager.acquire(id);
		assert.equal(storage.revision, 2);
		assert.equal((await storage.entry(2, context)).entry.kind, 'synthetic');
		assert.equal(await storage.entry(100, context), undefined);
		assert.equal(await storage.mintId(), 3);
	} finally { await storage.close(context); await client.end(); await manager.close(); }
});

test('opening storage drops the retired browser journal tables', async () => {
	const { DatabaseSync } = await import('node:sqlite');
	const filename = join(directory, `${randomUUID()}.sqlite`);
	const seed = new DatabaseSync(filename);
	seed.exec('CREATE TABLE pi_browser_progress (conversation TEXT); CREATE TABLE pi_browser_events (sequence INTEGER)');
	seed.close();
	const manager = createDurableStorage({ kind: 'sqlite', filename });
	await manager.exists('anything');
	const check = new DatabaseSync(filename);
	try {
		assert.deepEqual(check.prepare("SELECT name FROM sqlite_master WHERE name LIKE 'pi_browser%'").all(), []);
	} finally { check.close(); await manager.close(); }
});

if (process.env.DURABLE_TEST_POSTGRES === '1') test('Postgres storage drops the retired browser journal tables', async () => {
	const client = new pg.Client({ connectionString: postgres.connectionString });
	await client.connect();
	try {
		await client.query(`CREATE SCHEMA IF NOT EXISTS socratink_pi;
			CREATE TABLE IF NOT EXISTS socratink_pi.browser_progress (conversation TEXT PRIMARY KEY);
			CREATE TABLE IF NOT EXISTS socratink_pi.browser_events (sequence BIGSERIAL PRIMARY KEY)`);
		const manager = createDurableStorage({ kind: 'postgres', connectionString: postgres.connectionString });
		try { await manager.exists('anything'); } finally { await manager.close(); }
		const left = await client.query(`SELECT table_name FROM information_schema.tables
			WHERE table_schema='socratink_pi' AND table_name LIKE 'browser_%'`);
		assert.deepEqual(left.rows, []);
	} finally { await client.end(); }
});
