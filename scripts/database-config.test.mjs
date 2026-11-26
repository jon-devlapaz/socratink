import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { resolveDatabaseTarget } from '../src/config/database.ts';

describe('resolveDatabaseTarget', () => {
	const connectionString = 'postgresql://database.internal/socratink';
	const local = { kind: 'sqlite', filename: '.cache/socratink/local.db' };
	const postgres = { kind: 'postgres', connectionString };

	for (const [name, environment, expected] of [
		['a local process without a database URL', {}, local],
		['a blank local database URL', { DATABASE_URL: '  ' }, local],
		['a configured Postgres database', { DATABASE_URL: connectionString }, postgres],
		['a database URL with surrounding whitespace', { DATABASE_URL: ' ' + connectionString + ' ' }, postgres],
		['a configured production database', { NODE_ENV: 'production', DATABASE_URL: connectionString }, postgres],
		['a configured Vercel database', { VERCEL: '1', DATABASE_URL: connectionString }, postgres],
	]) {
		it(name, () => assert.deepEqual(resolveDatabaseTarget(environment), expected));
	}

	for (const [name, environment] of [
		['production without a database URL', { NODE_ENV: 'production' }],
		['Vercel without a database URL', { VERCEL: '1' }],
		['a blank hosted database URL', { NODE_ENV: 'production', DATABASE_URL: ' ' }],
	]) {
		it(name, () => assert.throws(() => resolveDatabaseTarget(environment), {
			name: 'Error', message: 'DATABASE_URL is required for durable hosted conversations.',
		}));
	}
});
