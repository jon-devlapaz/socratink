import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveDatabaseTarget } from '../src/config/database.ts';

test('uses Postgres when DATABASE_URL is configured', () => {
	assert.deepEqual(resolveDatabaseTarget({ DATABASE_URL: 'postgresql://database.internal/socratink' }), {
		kind: 'postgres',
		connectionString: 'postgresql://database.internal/socratink',
	});
});

test('uses file-backed SQLite for local development', () => {
	assert.deepEqual(resolveDatabaseTarget({}), {
		kind: 'sqlite',
		filename: '.cache/flue/local.db',
	});
});

test('fails closed in production, Northflank, or Vercel when DATABASE_URL is missing', () => {
	for (const environment of [
		{ NODE_ENV: 'production' },
		{ NF_PROJECT_ID: 'socratink' },
		{ VERCEL: '1' },
	]) {
		assert.throws(
			() => resolveDatabaseTarget(environment),
			/DATABASE_URL is required for durable hosted conversations/,
		);
	}
});
