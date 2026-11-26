import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test, { after, before, beforeEach, describe, it } from 'node:test';
import pg from 'pg';
import {
	localAuthFilename,
	resolveAuthConfig,
	resolveAuthStoreTarget,
} from '../src/config/auth.ts';
import { createPostgresAuthDb, createSqliteAuthDb } from '../src/server/auth-db.ts';
import { startDisposablePostgres } from './durable-postgres-fixture.mjs';

describe('resolveAuthConfig', () => {
	const google = { clientId: 'google-id', clientSecret: 'google-secret' };
	const github = { clientId: 'github-id', clientSecret: 'github-secret' };
	const googleEnv = { GOOGLE_CLIENT_ID: google.clientId, GOOGLE_CLIENT_SECRET: google.clientSecret };
	const githubEnv = { GITHUB_CLIENT_ID: github.clientId, GITHUB_CLIENT_SECRET: github.clientSecret };
	const localUrl = 'http://localhost:5173';
	const externalUrl = 'https://socratink.example.com';

	for (const [name, environment, expected] of [
		['no providers', {}, undefined],
		['a Google ID without a secret', { GOOGLE_CLIENT_ID: 'google-id' }, undefined],
		['a GitHub secret without an ID', { GITHUB_CLIENT_SECRET: 'github-secret' }, undefined],
		['a blank provider ID', { ...googleEnv, GOOGLE_CLIENT_ID: '  ' }, undefined],
		['Google only', googleEnv, { google, github: undefined, redirectBaseUrl: localUrl }],
		['GitHub with a custom redirect', { ...githubEnv, AUTH_REDIRECT_BASE_URL: externalUrl }, { google: undefined, github, redirectBaseUrl: externalUrl }],
		['both providers', { ...googleEnv, ...githubEnv }, { google, github, redirectBaseUrl: localUrl }],
		['spaces around the credentials', { GOOGLE_CLIENT_ID: ' google-id ', GOOGLE_CLIENT_SECRET: ' google-secret ' }, { google, github: undefined, redirectBaseUrl: localUrl }],
		['a redirect with a trailing slash', { ...googleEnv, AUTH_REDIRECT_BASE_URL: externalUrl + '/' }, { google, github: undefined, redirectBaseUrl: externalUrl }],
		['the hosted redirect on Vercel', { ...googleEnv, VERCEL: '1', AUTH_REDIRECT_BASE_URL: 'https://app.socratink.ai' }, { google, github: undefined, redirectBaseUrl: 'https://app.socratink.ai' }],
	]) {
		it(name, () => assert.deepEqual(resolveAuthConfig(environment), expected));
	}

	for (const hostname of ['app.socratink.ai', 'www.socratink.ai', 'socratink.ai']) {
		it('a local redirect to ' + hostname, () => {
			assert.throws(() => resolveAuthConfig({ ...googleEnv, AUTH_REDIRECT_BASE_URL: 'https://' + hostname }), {
				name: 'Error', message: 'AUTH_REDIRECT_BASE_URL cannot point to the production app in local development.',
			});
		});
	}
});

describe('resolveAuthStoreTarget', () => {
	it('a configured Postgres store', () => {
		const connectionString = 'postgres://localhost:5432/auth';
		assert.deepEqual(resolveAuthStoreTarget({ DATABASE_URL: connectionString }), { kind: 'postgres', connectionString });
	});

	it('the local auth database', () => {
		assert.deepEqual(resolveAuthStoreTarget({}), { kind: 'sqlite', filename: localAuthFilename });
	});

	it('a missing hosted database', () => {
		assert.throws(() => resolveAuthStoreTarget({ NODE_ENV: 'production' }), {
			name: 'Error', message: 'DATABASE_URL is required for durable hosted conversations.',
		});
	});
});

describe('SQLite AuthDb', () => {
	let directory;
	before(async () => { directory = await mkdtemp(join(tmpdir(), 'socratink-auth-')); });
	after(() => rm(directory, { recursive: true, force: true }));

	authDbRoundTrips((t) => {
		const db = createSqliteAuthDb(join(directory, t.name + '.db'));
		t.after(() => db.close());
		return db;
	});
});

if (process.env.DURABLE_TEST_POSTGRES === '1') describe('Postgres AuthDb', () => {
	let postgres;
	before(async () => { postgres = await startDisposablePostgres(); });
	after(() => postgres?.stop());

	authDbRoundTrips(async (t) => {
		const client = new pg.Client({ connectionString: postgres.connectionString });
		await client.connect();
		t.after(async () => {
			try { await client.query('ROLLBACK'); }
			finally { await client.end(); }
		});
		await client.query('BEGIN');
		return createPostgresAuthDb(client);
	});
});

function authDbRoundTrips(openDb) {
	const createdAt = '2026-01-15T12:00:00.000Z';
	beforeEach((t) => t.mock.timers.enable({ apis: ['Date'], now: Date.parse(createdAt) }));

	describe('users', () => {
		it('reads a user by ID', async (t) => {
			const db = await openDb(t);
			const user = await db.createUser('by-id', 'id@example.invalid');
			assert.deepEqual(user, { id: 'by-id', email: 'id@example.invalid', createdAt });
			assert.deepEqual(await db.findUserById('by-id'), user);
		});

		it('reads a user by email', async (t) => {
			const db = await openDb(t);
			const user = await db.createUser('by-email', 'email@example.invalid');
			assert.deepEqual(await db.findUserByEmail('email@example.invalid'), user);
		});

		it('returns no user for an unknown ID', async (t) => {
			const db = await openDb(t);
			await db.createUser('known-id', 'known@example.invalid');
			assert.equal(await db.findUserById('unknown-id'), undefined);
		});

		it('returns no user for an unknown email', async (t) => {
			const db = await openDb(t);
			await db.createUser('known-email', 'known@example.invalid');
			assert.equal(await db.findUserByEmail('unknown@example.invalid'), undefined);
		});
	});

	describe('OAuth accounts', () => {
		for (const email of ['oauth@example.invalid', null]) {
			it(email ? 'stores an account with an email' : 'stores an account without an email', async (t) => {
				const db = await openDb(t);
				await db.createUser('account-owner', 'owner@example.invalid');
				await db.upsertOAuthAccount('google', 'subject', 'account-owner', email);
				assert.deepEqual(await db.findOAuthAccount('google', 'subject'), {
					provider: 'google', providerUserId: 'subject', userId: 'account-owner', email, createdAt,
				});
			});
		}

		it('uses both provider and subject to find an account', async (t) => {
			const db = await openDb(t);
			await db.createUser('scoped-account', 'scoped@example.invalid');
			await db.upsertOAuthAccount('google', 'only-on-google', 'scoped-account', null);
			assert.equal(await db.findOAuthAccount('github', 'only-on-google'), undefined);
			assert.equal(await db.findOAuthAccount('google', 'other-subject'), undefined);
		});

		it('updates an existing account with its new user and email', async (t) => {
			const db = await openDb(t);
			await db.createUser('old-owner', 'old@example.invalid');
			await db.createUser('new-owner', 'new@example.invalid');
			await db.upsertOAuthAccount('google', 'updated-account', 'old-owner', null);
			await db.upsertOAuthAccount('google', 'updated-account', 'new-owner', 'new@example.invalid');
			assert.deepEqual(await db.findOAuthAccount('google', 'updated-account'), {
				provider: 'google', providerUserId: 'updated-account', userId: 'new-owner', email: 'new@example.invalid', createdAt,
			});
		});
	});

	describe('aliases', () => {
		it('lists only the aliases for the requested user', async (t) => {
			const db = await openDb(t);
			await db.createUser('alias-owner', 'aliases@example.invalid');
			await db.createUser('other-owner', 'other@example.invalid');
			await db.createAlias('guest-1', 'alias-owner');
			await db.createAlias('guest-2', 'alias-owner');
			await db.createAlias('guest-3', 'other-owner');
			assert.deepEqual((await db.findAliases('alias-owner')).sort(), ['guest-1', 'guest-2']);
		});

		it('looks up the owner of each guest alias', async (t) => {
			const db = await openDb(t);
			await db.createUser('alias-owner', 'owner@example.invalid');
			await db.createAlias('guest-1', 'alias-owner');
			await db.createAlias('guest-2', 'alias-owner');
			assert.equal(await db.findAliasOwner('guest-1'), 'alias-owner');
			assert.equal(await db.findAliasOwner('guest-2'), 'alias-owner');
			assert.equal(await db.findAliasOwner('alias-owner'), undefined);
		});

		it('alias lookups ignore a stored link whose source is a registered user', async (t) => {
			const db = await openDb(t);
			await db.createUser('owner', 'owner@example.invalid');
			await db.createAlias('valid-guest', 'owner');
			await db.createAlias('registered-source', 'owner');
			await db.createUser('registered-source', 'source@example.invalid');

			assert.deepEqual(await db.findAliases('owner'), ['valid-guest']);
			assert.equal(await db.findAliasOwner('registered-source'), undefined);
			assert.equal(await db.findAliasOwner('valid-guest'), 'owner');
		});

		it('lists no aliases for an unknown user', async (t) => {
			const db = await openDb(t);
			assert.deepEqual(await db.findAliases('no-aliases'), []);
		});

		it('returns no owner for an unknown guest', async (t) => {
			const db = await openDb(t);
			assert.equal(await db.findAliasOwner('unknown-guest'), undefined);
		});

		it('moves an existing alias to its new owner', async (t) => {
			const db = await openDb(t);
			await db.createUser('previous-owner', 'previous@example.invalid');
			await db.createUser('next-owner', 'next@example.invalid');
			await db.createAlias('returning-guest', 'previous-owner');
			await db.createAlias('returning-guest', 'next-owner');
			assert.deepEqual(await db.findAliases('previous-owner'), []);
			assert.deepEqual(await db.findAliases('next-owner'), ['returning-guest']);
			assert.equal(await db.findAliasOwner('returning-guest'), 'next-owner');
		});
	});
}

test('postgres auth store retries its table setup after a failed first attempt', async () => {
	let setups = 0;
	const db = createPostgresAuthDb({
		async query(text) {
			if (text.startsWith('CREATE TABLE') && ++setups === 1) throw new Error('Authentication timed out');
			return { rows: [] };
		},
		async end() {},
	});
	await assert.rejects(db.findUserById('user-a'), /timed out/);
	assert.equal(await db.findUserById('user-a'), undefined);
	assert.equal(await db.findUserById('user-a'), undefined);
	assert.equal(setups, 2);
	await db.close();
});
