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
		['a database URL that already names verify-full', { DATABASE_URL: `${connectionString}?sslmode=verify-full` },
			{ kind: 'postgres', connectionString: `${connectionString}?sslmode=verify-full` }],
		['a database URL that opts into libpq semantics', { DATABASE_URL: `${connectionString}?uselibpqcompat=true&sslmode=require` },
			{ kind: 'postgres', connectionString: `${connectionString}?uselibpqcompat=true&sslmode=require` }],
	]) {
		it(name, () => assert.deepEqual(resolveDatabaseTarget(environment), expected));
	}

	for (const mode of ['prefer', 'require', 'verify-ca']) {
		it(`names verify-full for sslmode=${mode}, which pg already treats as verify-full`, () => {
			const url = `postgresql://user:synthetic%21@ep-unit-a1-pooler.us-east-2.aws.neon.tech/db?sslmode=${mode}&channel_binding=require`;
			const target = resolveDatabaseTarget({ VERCEL: '1', DATABASE_URL: url });
			const resolved = new URL(target.connectionString), original = new URL(url);
			assert.equal(resolved.searchParams.get('sslmode'), 'verify-full');
			assert.equal(resolved.searchParams.get('channel_binding'), 'require');
			for (const key of ['protocol', 'username', 'password', 'host', 'pathname']) assert.equal(resolved[key], original[key]);
		});
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
