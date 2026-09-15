import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import {
	credentialTraceFields,
	localCredentialsFilename,
	localCredentialsSecret,
	resolveCredentialStoreTarget,
	resolveCredentialsSecret,
} from '../src/config/credentials.ts';
import { decryptSecret, deriveCredentialsKey, encryptSecret } from '../src/server/credential-crypto.ts';
import {
	createCredentialStore,
	disabledUserKeyError,
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
		target: { kind: 'sqlite', filename },
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

test('encrypt/decrypt round-trip restores the secret', () => {
	const key = deriveCredentialsKey(testSecret);
	const packed = encryptSecret(plaintext, key);
	assert.notEqual(packed, plaintext);
	assert.doesNotMatch(packed, new RegExp(plaintext));
	assert.equal(decryptSecret(packed, key), plaintext);
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
	});
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

test('missing, disabled, and deleted keys fail closed with no jon-local fallback', async () => {
	await withStore(async (store) => {
		await assert.rejects(
			store.getUserKey({ userId: ownerId, name: keyName }),
			(error) => {
				assertUserKeyError(error, missingUserKeyError);
				assert.doesNotMatch(error.message, /jon-local/);
				return true;
			},
		);

		const first = await store.updateUserKey({
			userId: ownerId,
			name: keyName,
			value: plaintext,
		});
		await store.disableUserKey({ userId: ownerId, name: keyName });
		await assert.rejects(
			store.getUserKey({ userId: ownerId, name: keyName }),
			(error) => {
				assertUserKeyError(error, disabledUserKeyError);
				return true;
			},
		);
		await assert.rejects(
			store.getUserKeyByRef({ userId: ownerId, credentialRef: first.credentialRef }),
			(error) => {
				assertUserKeyError(error, disabledUserKeyError);
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
		await assert.rejects(
			store.getUserKeyByRef({ userId: ownerId, credentialRef: first.credentialRef }),
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

test('traces and logs fixtures contain credentialRef and never the secret', async () => {
	await withStore(async (store, filename) => {
		const { credentialRef } = await store.updateUserKey({
			userId: ownerId,
			name: keyName,
			value: plaintext,
		});
		const trace = {
			project: 'socratink',
			event: 'credential.resolve',
			...credentialTraceFields(credentialRef),
		};
		const serialized = JSON.stringify(trace);
		assert.match(serialized, /credentialRef/);
		assert.match(serialized, new RegExp(credentialRef));
		assert.doesNotMatch(serialized, /sk-secret-should-never-appear-in-logs/);
		assert.equal('value' in trace, false);
		assert.equal('apiKey' in trace, false);
		assert.equal('ciphertext' in trace, false);

		const onDisk = await readFile(filename);
		assert.doesNotMatch(onDisk.toString('utf8'), /sk-secret-should-never-appear-in-logs/);
		assert.match(onDisk.toString('utf8'), /socratink_credentials/);
		assert.doesNotMatch(onDisk.toString('utf8'), /flue_/);
	});
});
