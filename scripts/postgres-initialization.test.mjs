import assert from 'node:assert/strict';
import test from 'node:test';
import { createPostgresAuthDb } from '../src/server/auth-db.ts';
import { createPostgresCredentialDb } from '../src/server/credential-db.ts';

for (const [name, create, read] of [
	['auth', createPostgresAuthDb, (db) => db.findUserById('synthetic-user')],
	['credentials', createPostgresCredentialDb, (db) => db.getByName({ userId: 'synthetic-user', name: 'openai' })],
]) {
	test(`${name} retries failed initialization once per later read, without a retry loop`, async () => {
		let attempts = 0;
		const failure = new Error('Synthetic connection failure');
		const db = create({
			async query() { attempts++; throw failure; },
			async end() {},
		});
		try {
			for (let attempt = 1; attempt <= 3; attempt++) {
				await assert.rejects(read(db), (error) => error === failure);
				assert.equal(attempts, attempt);
			}
		} finally {
			await db.close();
		}
	});

	test(`${name} shares initialization failure and recovery among concurrent first reads`, async () => {
		let initialization = Promise.withResolvers();
		let attempts = 0;
		let reads = 0;
		const db = create({
			async query(sql) {
				if (sql.startsWith('CREATE TABLE')) {
					attempts++;
					await initialization.promise;
				} else {
					reads++;
				}
				return { rows: [] };
			},
			async end() {},
		});
		try {
			const failed = Promise.allSettled([read(db), read(db)]);
			assert.equal(attempts, 1);
			assert.equal(reads, 0, 'queries must wait for schema initialization');
			const failure = new Error('Synthetic transient initialization failure');
			initialization.reject(failure);
			assert.deepEqual(await failed, [
				{ status: 'rejected', reason: failure }, { status: 'rejected', reason: failure },
			]);

			initialization = Promise.withResolvers();
			const recovered = Promise.allSettled([read(db), read(db)]);
			assert.equal(attempts, 2, 'later callers share one fresh initialization');
			assert.equal(reads, 0);
			initialization.resolve();
			assert.deepEqual(await recovered, [
				{ status: 'fulfilled', value: undefined }, { status: 'fulfilled', value: undefined },
			]);
			await read(db);
			assert.equal(attempts, 2, 'successful initialization stays cached');
			assert.equal(reads, 3);
		} finally {
			await db.close();
		}
	});

	test(`${name} does not reinitialize a ready schema after an ordinary query failure`, async () => {
		let attempts = 0;
		let reads = 0;
		const db = create({
			async query(sql) {
				if (sql.startsWith('CREATE TABLE')) attempts++;
				else if (++reads === 1) throw new Error('Synthetic read failure');
				return { rows: [] };
			},
			async end() {},
		});
		try {
			await assert.rejects(read(db), /Synthetic read failure/);
			assert.equal(await read(db), undefined);
			assert.equal(attempts, 1);
			assert.equal(reads, 2);
		} finally {
			await db.close();
		}
	});
}
