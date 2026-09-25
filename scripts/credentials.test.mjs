import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import {
	localCredentialsFilename,
	localCredentialsSecret,
	resolveCredentialStoreTarget,
	resolveCredentialsSecret,
} from '../src/config/credentials.ts';
import {
	createPostgresCredentialDb,
	createSqliteCredentialDb,
} from '../src/server/credential-db.ts';
import {
	createCredentialStore,
	foreignUserKeyError,
	missingUserKeyError,
	UserKeyError,
} from '../src/server/credentials.ts';

const testSecret = 'test-credentials-secret-for-aes-256-gcm';
const ownerId = 'user-a';
const foreignId = 'user-b';
const keyName = 'openai';
const plaintext = 'sk-secret-should-never-appear-in-logs';

async function withStore(run) {
	const directory = await mkdtemp(join(tmpdir(), 'socratink-credentials-'));
	const filename = join(directory, 'credentials.db');
	const store = createCredentialStore({
		secret: testSecret,
		db: createSqliteCredentialDb(filename),
	});
	try {
		return await run(store, filename);
	} finally {
		await store.close();
		await rm(directory, { recursive: true, force: true });
	}
}

function assertUserKeyError(error, expected) {
	assert.equal(error instanceof UserKeyError, true);
	assert.equal(error.type, expected.type);
	assert.equal(error.message, expected.message);
	assert.doesNotMatch(error.message, new RegExp(plaintext));
}

test('fails closed in production, Northflank, or Vercel when CREDENTIALS_SECRET is missing', () => {
	for (const environment of [
		{ NODE_ENV: 'production' },
		{ NF_PROJECT_ID: 'socratink' },
		{ VERCEL: '1' },
	]) {
		assert.throws(
			() => resolveCredentialsSecret(environment),
			/CREDENTIALS_SECRET is required for hosted credential encryption/,
		);
	}
});

test('uses CREDENTIALS_SECRET when configured and a local secret otherwise', () => {
	assert.equal(resolveCredentialsSecret({ CREDENTIALS_SECRET: ' hosted-secret ' }), 'hosted-secret');
	assert.equal(resolveCredentialsSecret({}), localCredentialsSecret);
});

test('hosted without DATABASE_URL still fails closed before a local credentials file', () => {
	assert.throws(
		() => resolveCredentialStoreTarget({ NODE_ENV: 'production' }),
		/DATABASE_URL is required for durable hosted conversations/,
	);
});

test('uses Postgres when DATABASE_URL is set and a product SQLite file locally', () => {
	assert.deepEqual(resolveCredentialStoreTarget({ DATABASE_URL: 'postgresql://database.internal/socratink' }), {
		kind: 'postgres',
		connectionString: 'postgresql://database.internal/socratink',
	});
	assert.deepEqual(resolveCredentialStoreTarget({}), {
		kind: 'sqlite',
		filename: localCredentialsFilename,
	});
	assert.notEqual(localCredentialsFilename, '.cache/flue/local.db');
});

test('owner can get a stored key by name and by credentialRef', async () => {
	await withStore(async (store) => {
		const { credentialRef } = await store.updateUserKey({
			userId: ownerId,
			name: keyName,
			value: plaintext,
		});
		assert.equal(typeof credentialRef, 'string');
		assert.notEqual(credentialRef, plaintext);
		assert.equal(await store.getUserKey({ userId: ownerId, name: keyName }), plaintext);
		assert.equal(await store.getUserKeyByRef({ userId: ownerId, credentialRef }), plaintext);
		assert.equal(await store.hasUserKey({ userId: ownerId, name: keyName }), true);
		assert.equal(await store.hasUserKey({ userId: foreignId, name: keyName }), false);
	});
});

test('rekeyUser moves guest keys to the durable user without re-encryption', async () => {
	await withStore(async (store) => {
		await store.updateUserKey({ userId: 'guest-a', name: 'openai', value: plaintext });
		await store.updateUserKey({ userId: 'guest-a', name: 'openrouter', value: 'guest-router-key' });
		await store.rekeyUser({ fromUserId: 'guest-a', toUserId: 'durable-b' });
		assert.equal(await store.getUserKey({ userId: 'durable-b', name: 'openai' }), plaintext);
		assert.equal(await store.getUserKey({ userId: 'durable-b', name: 'openrouter' }), 'guest-router-key');
		assert.equal(await store.hasUserKey({ userId: 'guest-a', name: 'openai' }), false);
		assert.equal(await store.hasUserKey({ userId: 'guest-a', name: 'openrouter' }), false);
	});
});

test('rekeyUser keeps the durable user key on name conflict and migrates the rest', async () => {
	await withStore(async (store) => {
		await store.updateUserKey({ userId: 'durable-b', name: keyName, value: 'durable-key' });
		await store.updateUserKey({ userId: 'guest-a', name: keyName, value: 'guest-key' });
		await store.updateUserKey({ userId: 'guest-a', name: 'openrouter', value: 'guest-router-key' });
		await store.rekeyUser({ fromUserId: 'guest-a', toUserId: 'durable-b' });
		assert.equal(await store.getUserKey({ userId: 'durable-b', name: keyName }), 'durable-key');
		assert.equal(await store.getUserKey({ userId: 'durable-b', name: 'openrouter' }), 'guest-router-key');
		assert.equal(await store.getUserKey({ userId: 'guest-a', name: keyName }), 'guest-key');
	});
});

test('rekeyUser is a no-op for identical ids and rejects malformed ids', async () => {
	await withStore(async (store) => {
		await store.updateUserKey({ userId: ownerId, name: keyName, value: plaintext });
		await store.rekeyUser({ fromUserId: ownerId, toUserId: ownerId });
		assert.equal(await store.getUserKey({ userId: ownerId, name: keyName }), plaintext);
		await assert.rejects(store.rekeyUser({ fromUserId: 'user:a', toUserId: foreignId }));
		await assert.rejects(store.rekeyUser({ fromUserId: ownerId, toUserId: '' }));
	});
});

test('postgres rekeyUser writes $1 SQL with durable id first', async () => {
	/** @type {{ text: string, values: unknown[] }[]} */
	const calls = [];
	const db = createPostgresCredentialDb({
		async query(text, values = []) {
			calls.push({ text, values });
			return { rows: [] };
		},
		async end() {},
	});
	await db.rekeyUser({ fromUserId: 'guest-a', toUserId: 'durable-b' });
	const update = calls.find((call) => call.text.startsWith('UPDATE'));
	assert.ok(update);
	assert.match(update.text, /\$1/);
	assert.doesNotMatch(update.text, /\?/);
	assert.deepEqual(update.values, ['durable-b', 'guest-a']);
	await db.close();
});

test('foreign user cannot read by name or credentialRef', async () => {
	await withStore(async (store) => {
		const { credentialRef } = await store.updateUserKey({
			userId: ownerId,
			name: keyName,
			value: plaintext,
		});

		await assert.rejects(
			store.getUserKey({ userId: foreignId, name: keyName }),
			(error) => {
				assertUserKeyError(error, missingUserKeyError);
				return true;
			},
		);
		await assert.rejects(
			store.getUserKeyByRef({ userId: foreignId, credentialRef }),
			(error) => {
				assertUserKeyError(error, foreignUserKeyError);
				return true;
			},
		);
		assert.equal(await store.getUserKey({ userId: ownerId, name: keyName }), plaintext);
	});
});

test('missing and deleted keys fail closed with no jon-local fallback', async () => {
	await withStore(async (store) => {
		await assert.rejects(
			store.getUserKey({ userId: ownerId, name: keyName }),
			(error) => {
				assertUserKeyError(error, missingUserKeyError);
				assert.doesNotMatch(error.message, /jon-local/);
				return true;
			},
		);

		const { credentialRef } = await store.updateUserKey({
			userId: ownerId,
			name: keyName,
			value: plaintext,
		});
		await store.deleteUserKey({ userId: ownerId, name: keyName });
		await assert.rejects(
			store.getUserKey({ userId: ownerId, name: keyName }),
			(error) => {
				assertUserKeyError(error, missingUserKeyError);
				return true;
			},
		);
		await assert.rejects(
			store.getUserKeyByRef({ userId: ownerId, credentialRef }),
			(error) => {
				assertUserKeyError(error, missingUserKeyError);
				return true;
			},
		);
	});
});

test('overwrite rotates the secret and revokes the previous credentialRef', async () => {
	await withStore(async (store) => {
		const first = await store.updateUserKey({
			userId: ownerId,
			name: keyName,
			value: plaintext,
		});
		const rotated = 'sk-rotated-secret-value';
		const second = await store.updateUserKey({
			userId: ownerId,
			name: keyName,
			value: rotated,
		});
		assert.notEqual(second.credentialRef, first.credentialRef);
		assert.equal(await store.getUserKey({ userId: ownerId, name: keyName }), rotated);
		await assert.rejects(
			store.getUserKeyByRef({ userId: ownerId, credentialRef: first.credentialRef }),
			(error) => {
				assertUserKeyError(error, missingUserKeyError);
				return true;
			},
		);
		assert.equal(
			await store.getUserKeyByRef({ userId: ownerId, credentialRef: second.credentialRef }),
			rotated,
		);
	});
});

test('on-disk credential rows never store the secret', async () => {
	await withStore(async (store, filename) => {
		await store.updateUserKey({
			userId: ownerId,
			name: keyName,
			value: plaintext,
		});

		const onDisk = await readFile(filename);
		assert.doesNotMatch(onDisk.toString('utf8'), /sk-secret-should-never-appear-in-logs/);
		assert.match(onDisk.toString('utf8'), /socratink_credentials/);
		assert.doesNotMatch(onDisk.toString('utf8'), /flue_/);
	});
});

test('postgres adapter writes $1 SQL and serves typed rows without a live database', async () => {
	/** @type {{ text: string, values: unknown[] }[]} */
	const calls = [];
	/** @type {{ user_id: string, name: string, credential_ref: string, ciphertext: string } | undefined} */
	let stored;
	const db = createPostgresCredentialDb({
		async query(text, values = []) {
			calls.push({ text, values });
			if (text.includes('CREATE TABLE')) return { rows: [] };
			if (text.startsWith('DELETE')) {
				assert.match(text, /\$1/);
				assert.doesNotMatch(text, /\?/);
				if (stored && stored.user_id === values[0] && stored.name === values[1]) stored = undefined;
				return { rows: [] };
			}
			if (text.includes('INSERT INTO')) {
				assert.match(text, /\$1/);
				assert.doesNotMatch(text, /\?/);
				stored = {
					user_id: String(values[0]),
					name: String(values[1]),
					credential_ref: String(values[2]),
					ciphertext: String(values[3]),
				};
				return { rows: [{ credential_ref: stored.credential_ref }] };
			}
			if (text.includes('SELECT') && text.includes('WHERE user_id = $1 AND name = $2')) {
				assert.doesNotMatch(text, /\?/);
				if (stored && stored.user_id === values[0] && stored.name === values[1]) {
					return { rows: [stored] };
				}
				return { rows: [] };
			}
			if (text.includes('SELECT') && text.includes('WHERE credential_ref = $1')) {
				assert.doesNotMatch(text, /\?/);
				if (stored && stored.credential_ref === values[0]) return { rows: [stored] };
				return { rows: [] };
			}
			throw new Error(`unexpected postgres sql: ${text}`);
		},
		async end() {},
	});
	const store = createCredentialStore({ secret: testSecret, db });
	try {
		const { credentialRef } = await store.updateUserKey({
			userId: ownerId,
			name: keyName,
			value: plaintext,
		});
		assert.equal(await store.getUserKey({ userId: ownerId, name: keyName }), plaintext);
		assert.equal(await store.getUserKeyByRef({ userId: ownerId, credentialRef }), plaintext);
		await assert.rejects(
			store.getUserKeyByRef({ userId: foreignId, credentialRef }),
			(error) => {
				assertUserKeyError(error, foreignUserKeyError);
				return true;
			},
		);
		await store.deleteUserKey({ userId: ownerId, name: keyName });
		await assert.rejects(
			store.getUserKey({ userId: ownerId, name: keyName }),
			(error) => {
				assertUserKeyError(error, missingUserKeyError);
				return true;
			},
		);
		assert.ok(calls.some((call) => call.text.includes('$3') && call.text.includes('INSERT')));
		assert.equal(
			calls.some((call) => call.text.includes('?') && !call.text.includes('$')),
			false,
		);
	} finally {
		await store.close();
	}
});
