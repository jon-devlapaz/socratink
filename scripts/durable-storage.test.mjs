import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { createServer } from 'node:net';
import { join } from 'node:path';
import { after, before, test } from 'node:test';
import { BACKGROUND_CONTEXT as context } from '@earendil-works/chord/context';
import { ROOT_CONVERSATION_ID } from '@earendil-works/pi-durable';
import { commitWrites, createStorageConformance } from '@earendil-works/pi-durable/testing';
import { createDurableStorage } from '../src/server/durable/storage.ts';
import { postgresOwnerConnectionString } from '../src/server/durable/storage-postgres.ts';
import { DatabaseSync } from 'node:sqlite';
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

test('Postgres storage connects on first use and retries after a failed start', async () => {
	let connections = 0;
	const server = createServer((socket) => { connections += 1; socket.destroy(); });
	await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
	const manager = createDurableStorage({ kind: 'postgres', connectionString: `postgresql://synthetic@127.0.0.1:${server.address().port}/synthetic` });
	try {
		await new Promise((resolve) => setTimeout(resolve, 20));
		assert.equal(connections, 0, 'creating storage opens no connection');
		await assert.rejects(manager.exists('anything'));
		const first = connections;
		assert.ok(first >= 1);
		await assert.rejects(manager.exists('anything'));
		assert.ok(connections > first, 'a failed start is retried, not cached');
	} finally { await manager.close(); await new Promise((resolve) => server.close(resolve)); }
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

	test(`${dialect}: a refreshed reader applies only later commits and refuses a gap`, async () => {
		const selected = target();
		const manager = createDurableStorage(selected);
		const id = `learner:${randomUUID()}`;
		// Writes straight to the log, bypassing the manager, to tamper with history.
		const raw = selected.kind === 'sqlite' ? (() => { const db = new DatabaseSync(selected.filename);
			return { run: async (sql, ...values) => { db.prepare(sql.replaceAll('socratink_pi.commits', 'pi_commits').replace(/\$\d/g, '?')).run(...values); },
				end: async () => db.close() }; })()
			: await (async () => { const client = new pg.Client({ connectionString: postgres.connectionString }); await client.connect();
				return { run: async (sql, ...values) => { await client.query(sql, values); }, end: () => client.end() }; })();
		const view = async (reader) => ({ revision: reader.revision, conversation: await reader.conversation(ROOT_CONVERSATION_ID, context),
			entries: await reader.conversation(ROOT_CONVERSATION_ID, context)
				? (await reader.scanEntries({ conversationId: ROOT_CONVERSATION_ID, order: 'ascending' }, 100, undefined, context)).items : [] });
		const fresh = async () => {
			const reader = await manager.read(id);
			try { return await view(reader); } finally { await reader.close(context); }
		};
		let owner;
		const follower = await manager.read(id);
		try {
			assert.equal(follower.revision, 0, 'opened before the conversation exists');
			await follower.refresh();
			assert.deepEqual(await view(follower), await fresh());
			owner = await manager.acquire(id);
			await commitWrites(owner, [{ type: 'conversation', value: { id: ROOT_CONVERSATION_ID } }], context);
			for (let step = 0; step < 3; step++) {
				const entryId = await owner.mintId();
				await commitWrites(owner, [{ type: 'entry', value: { id: entryId, conversationId: ROOT_CONVERSATION_ID, kind: `step-${step}` } }], context);
				await follower.refresh();
				assert.deepEqual(await view(follower), await fresh());
			}
			assert.equal(follower.revision, 4, 'revision counts every applied commit');
			// Rows already applied are never fetched again: corrupting them changes nothing for the follower.
			await raw.run(`UPDATE socratink_pi.commits SET writes='not json' WHERE namespace=$1`, id);
			const before = await view(follower);
			await follower.refresh();
			assert.deepEqual(await view(follower), before, 'a poll with no new commits fetches nothing');
			await assert.rejects(manager.read(id), 'a full read would have parsed the corrupted rows');
			const entryId = await owner.mintId();
			await commitWrites(owner, [{ type: 'entry', value: { id: entryId, conversationId: ROOT_CONVERSATION_ID, kind: 'later' } }], context);
			await follower.refresh();
			assert.equal(follower.revision, 5);
			assert.equal((await follower.entry(entryId, context)).entry.kind, 'later');
			await raw.run(`INSERT INTO socratink_pi.commits(namespace,seq,writes) VALUES ($1,$2,'[]')`, id, 7);
			await assert.rejects(follower.refresh(), /gap/);
		} finally { await follower.close(context); await owner?.close(context); await raw.end(); await manager.close(); }
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
