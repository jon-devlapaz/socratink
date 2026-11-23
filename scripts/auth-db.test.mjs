import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test, { after, before } from 'node:test';
import pg from 'pg';
import {
	localAuthFilename,
	resolveAuthConfig,
	resolveAuthStoreTarget,
} from '../src/config/auth.ts';
import { createPostgresAuthDb, createSqliteAuthDb } from '../src/server/auth-db.ts';
import { startDisposablePostgres } from './durable-postgres-fixture.mjs';

let postgres;
before(async () => { if (process.env.DURABLE_TEST_POSTGRES === '1') postgres = await startDisposablePostgres(); });
after(async () => { await postgres?.stop(); });

const backends = {
	async sqlite(run) {
		const directory = await mkdtemp(join(tmpdir(), 'socratink-auth-'));
		const db = createSqliteAuthDb(join(directory, 'auth.db'));
		try {
			return await run(db);
		} finally {
			await db.close();
			await rm(directory, { recursive: true, force: true });
		}
	},
	async postgres(run) {
		const pool = new pg.Pool({ connectionString: postgres.connectionString, max: 2 });
		await pool.query('DROP TABLE IF EXISTS socratink_user_aliases, socratink_oauth_accounts, socratink_users');
		const db = createPostgresAuthDb({ query: (text, values) => pool.query(text, values), end: () => pool.end() });
		try {
			return await run(db);
		} finally {
			await db.close();
		}
	},
};

function storeTest(name, run) {
	for (const [backend, withAuthDb] of Object.entries(backends)) {
		const skip = backend === 'postgres' && process.env.DURABLE_TEST_POSTGRES !== '1' ? 'set DURABLE_TEST_POSTGRES=1' : false;
		test(`${backend}: ${name}`, { skip }, () => withAuthDb(run));
	}
}

test('resolveAuthConfig resolves google and github providers and redirectBaseUrl', () => {
	const unconfigured = resolveAuthConfig({});
	assert.equal(unconfigured, undefined);

	const googleOnly = resolveAuthConfig({
		GOOGLE_CLIENT_ID: 'google-client-id',
		GOOGLE_CLIENT_SECRET: 'google-client-secret',
	});
	assert.ok(googleOnly);
	assert.equal(googleOnly.google?.clientId, 'google-client-id');
	assert.equal(googleOnly.google?.clientSecret, 'google-client-secret');
	assert.equal(googleOnly.github, undefined);
	assert.equal(googleOnly.redirectBaseUrl, 'http://localhost:5173');

	const customBaseUrl = resolveAuthConfig({
		GITHUB_CLIENT_ID: 'github-id',
		GITHUB_CLIENT_SECRET: 'github-secret',
		AUTH_REDIRECT_BASE_URL: 'https://socratink.example.com',
	});
	assert.ok(customBaseUrl);
	assert.equal(customBaseUrl.redirectBaseUrl, 'https://socratink.example.com');

	const trailingSlash = resolveAuthConfig({
		GOOGLE_CLIENT_ID: 'google-client-id',
		GOOGLE_CLIENT_SECRET: 'google-client-secret',
		AUTH_REDIRECT_BASE_URL: 'https://socratink.example.com/',
	});
	assert.ok(trailingSlash);
	assert.equal(trailingSlash.redirectBaseUrl, 'https://socratink.example.com');
});

test('resolveAuthConfig rejects production redirectBaseUrl in local development', () => {
	assert.throws(
		() =>
			resolveAuthConfig({
				GOOGLE_CLIENT_ID: 'google-client-id',
				GOOGLE_CLIENT_SECRET: 'google-client-secret',
				AUTH_REDIRECT_BASE_URL: 'https://app.socratink.ai',
			}),
		/AUTH_REDIRECT_BASE_URL cannot point to the production app in local development/i,
	);

	assert.doesNotThrow(() =>
		resolveAuthConfig({
			GOOGLE_CLIENT_ID: 'google-client-id',
			GOOGLE_CLIENT_SECRET: 'google-client-secret',
			AUTH_REDIRECT_BASE_URL: 'https://app.socratink.ai',
			VERCEL: '1',
		}),
	);
});

test('resolveAuthStoreTarget uses postgres when DATABASE_URL is set, sqlite otherwise', () => {
	const postgresTarget = resolveAuthStoreTarget({
		DATABASE_URL: 'postgres://user:pass@localhost:5432/db',
	});
	assert.deepEqual(postgresTarget, {
		kind: 'postgres',
		connectionString: 'postgres://user:pass@localhost:5432/db',
	});

	const sqliteTarget = resolveAuthStoreTarget({});
	assert.deepEqual(sqliteTarget, {
		kind: 'sqlite',
		filename: localAuthFilename,
	});
});

storeTest('AuthDb operations: users, oauth_accounts, and aliases', async (db) => {
	const userA = await db.createUser('user-1', 'alice@example.com');
	assert.equal(userA.id, 'user-1');
	assert.equal(userA.email, 'alice@example.com');
	assert.ok(userA.createdAt);

	const foundById = await db.findUserById('user-1');
	assert.deepEqual(foundById, userA);

	const foundByEmail = await db.findUserByEmail('alice@example.com');
	assert.deepEqual(foundByEmail, userA);

	const missingUser = await db.findUserById('nonexistent');
	assert.equal(missingUser, undefined);

	await db.upsertOAuthAccount('google', 'google-sub-123', 'user-1', 'alice@example.com');
	const oauthAccount = await db.findOAuthAccount('google', 'google-sub-123');
	assert.ok(oauthAccount);
	assert.equal(oauthAccount.provider, 'google');
	assert.equal(oauthAccount.providerUserId, 'google-sub-123');
	assert.equal(oauthAccount.userId, 'user-1');
	assert.equal(oauthAccount.email, 'alice@example.com');

	await db.createAlias('guest-uuid-1', 'user-1');
	await db.createAlias('guest-uuid-2', 'user-1');

	const aliases = await db.findAliases('user-1');
	assert.equal(aliases.length, 2);
	assert.ok(aliases.includes('guest-uuid-1'));
	assert.ok(aliases.includes('guest-uuid-2'));

	const noAliases = await db.findAliases('user-unknown');
	assert.deepEqual(noAliases, []);

	assert.equal(await db.findAliasOwner('guest-uuid-1'), 'user-1');
	assert.equal(await db.findAliasOwner('guest-uuid-2'), 'user-1');
	assert.equal(await db.findAliasOwner('guest-unknown'), undefined);
	assert.equal(await db.findAliasOwner('user-1'), undefined);
});

storeTest('alias lookups ignore a stored link whose source is a registered user', async (db) => {
	await db.createUser('owner', 'owner@example.com');
	await db.createAlias('valid-guest', 'owner');
	await db.createAlias('registered-source', 'owner');
	await db.createUser('registered-source', 'source@example.com');

	assert.deepEqual(await db.findAliases('owner'), ['valid-guest']);
	assert.equal(await db.findAliasOwner('registered-source'), undefined);
	assert.equal(await db.findAliasOwner('valid-guest'), 'owner');
});

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
