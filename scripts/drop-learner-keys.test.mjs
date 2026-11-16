import assert from 'node:assert/strict';
import test from 'node:test';
import { cleanLearnerKeys } from './drop-learner-keys.mjs';

function fakeClient({ present, rows = 0 }) {
	const queries = [];
	return {
		queries,
		async query(text) {
			queries.push(text);
			if (text.includes('to_regclass')) return { rows: [{ present }] };
			if (text.startsWith('SELECT count(*)')) return { rows: [{ rows: String(rows) }] };
			if (text.startsWith('DROP TABLE')) return { rows: [] };
			throw new Error(`Unexpected query: ${text}`);
		},
	};
}

test('a dry run reports the row count and changes nothing', async () => {
	const client = fakeClient({ present: true, rows: 3 });
	assert.deepEqual(await cleanLearnerKeys(client, { drop: false }), { present: true, rows: 3, dropped: false });
	assert.equal(client.queries.some((text) => !text.startsWith('SELECT')), false, 'a dry run only reads');
});

test('--drop deletes the table after counting it', async () => {
	const client = fakeClient({ present: true, rows: 2 });
	assert.deepEqual(await cleanLearnerKeys(client, { drop: true }), { present: true, rows: 2, dropped: true });
	assert.equal(client.queries.at(-1), 'DROP TABLE socratink_credentials');
});

test('a database without the table needs nothing', async () => {
	const client = fakeClient({ present: false });
	assert.deepEqual(await cleanLearnerKeys(client, { drop: true }), { present: false, rows: 0, dropped: false });
	assert.equal(client.queries.length, 1);
});

test('no query reads key material', async () => {
	const client = fakeClient({ present: true, rows: 1 });
	await cleanLearnerKeys(client, { drop: true });
	assert.equal(client.queries.some((text) => /ciphertext|credential_ref/.test(text)), false);
});
