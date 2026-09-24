import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import {
	localAuthFilename,
	resolveAuthConfig,
	resolveAuthStoreTarget,
} from '../src/config/auth.ts';
import { createSqliteAuthDb } from '../src/server/auth-db.ts';

async function withAuthDb(run) {
	const directory = await mkdtemp(join(tmpdir(), 'socratink-auth-'));
	const filename = join(directory, 'auth.db');
	const db = createSqliteAuthDb(filename);
	try {
		return await run(db, filename);
	} finally {
		await db.close();
		await rm(directory, { recursive: true, force: true });
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

test('AuthDb operations: users, oauth_accounts, and aliases', async () => {
	await withAuthDb(async (db) => {
		// 1. User operations
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

		// 2. OAuth accounts
		await db.upsertOAuthAccount('google', 'google-sub-123', 'user-1', 'alice@example.com');
		const oauthAccount = await db.findOAuthAccount('google', 'google-sub-123');
		assert.ok(oauthAccount);
		assert.equal(oauthAccount.provider, 'google');
		assert.equal(oauthAccount.providerUserId, 'google-sub-123');
		assert.equal(oauthAccount.userId, 'user-1');
		assert.equal(oauthAccount.email, 'alice@example.com');

		// 3. User aliases
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
});
