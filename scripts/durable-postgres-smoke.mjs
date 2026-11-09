import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import pg from 'pg';
import { mintSessionFixture } from './session-fixture.mjs';
import { startDisposablePostgres } from './durable-postgres-fixture.mjs';
import { appFactory, clientFor, delay, gate, oauth, sendText, startFixture, storeKey, until, userMessages } from './durable-smoke-support.mjs';
import { verifyDurableHistoryBrowser } from './durable-browser-smoke.mjs';

// Failure cases: replacing auth/history instead of preserving it; guest aliases
// lose their owner's key; two processes execute the same accepted turn; reads
// contend with execution; an owner crash or remote cancel never settles; Pi
// silently rewrites Flue history or persists provider credentials in its journal.
const out = resolve(process.env.DURABLE_POSTGRES_SMOKE_OUT || '.cache/durable-postgres-smoke');
const report = { ok: false, syntheticOnly: true, checks: [], node: process.version,
	limits: ['Disposable local PostgreSQL 17 and local processes; no hosted failover or deployment was tested.',
		'All OAuth and model responses are synthetic; no live account, provider, or learner data is used.',
		'An uncheckpointed provider request can run again after process death; the learner admission must remain unique.'] };
let stage = 'setup';
let database;
let pool;
let fixture;
let apps;

async function flueDigest() {
	const tables = (await pool.query("SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename LIKE 'flue_%' ORDER BY tablename")).rows;
	assert.ok(tables.length > 0, 'legacy Flue tables must actually exist');
	const result = {};
	for (const { tablename } of tables) {
		const name = `"${tablename.replaceAll('"', '""')}"`;
		const rows = (await pool.query(`SELECT row_to_json(t)::text AS row FROM ${name} t ORDER BY row_to_json(t)::text`)).rows;
		result[tablename] = { rows: rows.length, sha256: createHash('sha256').update(JSON.stringify(rows)).digest('hex') };
	}
	return result;
}
function textOf(message) {
	return message.parts.filter((part) => part.type === 'text').map((part) => part.text).join('');
}
async function assertSession(app, session) {
	const response = await fetch(`${app.origin}/api/session`, { headers: { cookie: session.cookie } });
	assert.equal(response.status, 200);
	assert.equal((await response.json()).userId, session.userId);
}
async function expectCall(marker, key, path) {
	await until(() => fixture.calls.some((call) => call.marker === marker), `${marker} reaches provider`);
	assert.deepEqual(fixture.calls.filter((call) => call.marker === marker).map(({ key, path }) => ({ key, path })), [{ key, path }]);
}
async function completed(client, marker, text) {
	fixture.plan(marker, { text });
	const result = await sendText(client, marker);
	assert.equal(result.reply.text, text);
	return result;
}

try {
	database = await startDisposablePostgres();
	report.postgresVersion = database.version;
	pool = new pg.Pool({ connectionString: database.connectionString, max: 2 });
	fixture = await startFixture();
	apps = appFactory(fixture, { databaseUrl: database.connectionString });
	stage = 'legacy-seed';
	const legacy = await apps.start({ entry: 'legacy/server.mjs' });
	const alpha = await oauth(legacy, await mintSessionFixture(legacy.origin), 'synthetic-alpha');
	const aliasGuest = await mintSessionFixture(legacy.origin);
	const aliasId = aliasGuest.userId;
	const oldCookie = aliasGuest.cookie;
	const legacyId = `${aliasId}:legacy-attributed`;
	const legacyText = 'This synthetic hint was supplied by Socratink.';
	const reveal = { kind: 'hint', target: 'Synthetic ownership recovery' };
	const question = { prompt: 'Which synthetic action preserves the accepted request?', choices: ['Recheck', 'Resend'], reasoning: true };
	fixture.plan('DURABLE_LEGACY', { text: legacyText, tools: [{ name: 'mark_reveal', arguments: reveal }] },
		{ tools: [{ name: 'present_question', arguments: question }] });
	const legacyClient = clientFor(legacy, aliasGuest, legacyId);
	const old = await sendText(legacyClient, 'DURABLE_LEGACY');
	const oldAssistant = old.history.messages.findLast((message) => message.role === 'assistant');
	assert.deepEqual(oldAssistant.parts.filter((part) => part.type === 'data-reveal').map((part) => part.data), [reveal]);
	assert.equal(oldAssistant.parts.filter((part) => part.type === 'data-questionnaire').length, 1);
	assert.ok(textOf(oldAssistant).includes(legacyText));
	const alphaKey = 'sk-synthetic-durable-postgres-alpha';
	const betaKey = 'sk-synthetic-durable-postgres-beta';
	const rotatedKey = 'sk-synthetic-durable-postgres-alpha-rotated';
	fixture.secrets.set(alphaKey, 'alpha');
	fixture.secrets.set(betaKey, 'beta');
	fixture.secrets.set(rotatedKey, 'alpha-rotated');
	await storeKey(legacy, aliasGuest, alphaKey);
	const owner = await oauth(legacy, aliasGuest, 'synthetic-alpha');
	assert.equal(owner.userId, alpha.userId, 'real OAuth callback must attach to the existing account');
	assert.ok(owner.aliases.includes(aliasId));
	assert.equal((await fetch(`${legacy.origin}/api/session`, { headers: { cookie: oldCookie } })).status, 401);
	assert.deepEqual(await clientFor(legacy, owner, legacyId).history(), old.history);
	await legacy.stop();
	report.legacyBefore = await flueDigest();
	report.checks.push('Explicit legacy server creates real Flue question/reveal history; actual HTTP OAuth preserves the account, rekeys guest credentials, and revokes its old cookie.');
	stage = 'normal-app-legacy-read';
	let first = await apps.start();
	assert.deepEqual(await (await fetch(`${first.origin}/healthz`)).json(), { status: 'ok', harness: 'pi-durable' });
	await assertSession(first, owner);
	const legacyThroughPi = clientFor(first, owner, legacyId);
	assert.deepEqual(await legacyThroughPi.history(), old.history, 'every existing Flue message and structured part must survive the default server');
	assert.deepEqual(await flueDigest(), report.legacyBefore, 'reading legacy history must not rewrite it');
	const beta = await oauth(first, await mintSessionFixture(first.origin), 'synthetic-beta');
	await storeKey(first, beta, betaKey);
	for (const method of ['GET', 'POST']) {
		const denied = await fetch(legacyThroughPi.url, { method, headers: { cookie: beta.cookie, 'content-type': 'application/json' },
			...(method === 'POST' ? { body: JSON.stringify({ kind: 'user', body: 'Foreign attempt' }) } : {}) });
		assert.equal(denied.status, 403);
	}
	assert.equal((await fetch(legacyThroughPi.url)).status, 401);
	assert.equal((await fetch(legacyThroughPi.url, { headers: { cookie: oldCookie } })).status, 401);
	report.legacyBrowser = await verifyDurableHistoryBrowser({ app: first, session: owner, conversationId: legacyId,
		expectedText: legacyText, question: question.prompt, reveal: true, out: join(out, 'legacy-browser') });
	report.checks.push('Normal Pi app reads exact attributed Flue history through its alias; unchanged browser loads/reloads the question and hint; foreign and revoked cookies are denied.');
	stage = 'legacy-continuation';
	const continued = await completed(legacyThroughPi, 'DURABLE_LEGACY_CONTINUE', 'Existing Flue conversation still accepts its next turn.');
	assert.equal(userMessages(continued.history).length, 2);
	await expectCall('DURABLE_LEGACY_CONTINUE', 'alpha', '/v1/responses');
	assert.notDeepEqual(await flueDigest(), report.legacyBefore, 'legacy continuation must persist through Flue');
	report.legacyAfterContinuation = await flueDigest();
	report.checks.push('Existing conversation continues through Flue on the normal API using its alias owner’s rekeyed credential.');
	stage = 'new-pi-alias-and-metadata';
	const piId = `${aliasId}:new-pi`;
	let piClient = clientFor(first, owner, piId);
	const fresh = await completed(piClient, 'DURABLE_PI_ALIAS', 'A new Pi conversation belongs to the same account alias.');
	await expectCall('DURABLE_PI_ALIAS', 'alpha', '/v1/responses');
	assert.deepEqual(fresh.history.messages.findLast((message) => message.role === 'assistant').metadata.socratink,
		{ routedModel: 'synthetic/routed-model', fallbackAttempts: 1 });
	assert.deepEqual(await flueDigest(), report.legacyAfterContinuation, 'new Pi history must not create or mutate Flue rows');
	assert.equal((await pool.query('SELECT count(*)::int AS count FROM socratink_pi.commits')).rows[0].count > 0, true);
	report.piBrowser = await verifyDurableHistoryBrowser({ app: first, session: owner, conversationId: piId,
		expectedText: fresh.reply.text, out: join(out, 'pi-browser') });
	report.checks.push('New alias conversation uses Pi PostgreSQL storage and fresh owner credentials; route metadata and browser history survive reload without touching Flue tables.');
	stage = 'overlapping-learners';
	const alphaGate = gate();
	const betaGate = gate();
	fixture.plan('DURABLE_ALPHA_OVERLAP', { before: alphaGate, text: 'Alpha isolated reply.' });
	fixture.plan('DURABLE_BETA_OVERLAP', { before: betaGate, text: 'Beta isolated reply.' });
	const alphaClient = clientFor(first, owner, 'alpha-overlap');
	const betaClient = clientFor(first, beta, 'beta-overlap');
	const [alphaAdmission, betaAdmission] = await Promise.all([
		alphaClient.send({ message: { kind: 'user', body: 'DURABLE_ALPHA_OVERLAP' } }),
		betaClient.send({ message: { kind: 'user', body: 'DURABLE_BETA_OVERLAP' } }),
	]);
	await expectCall('DURABLE_ALPHA_OVERLAP', 'alpha', '/v1/responses');
	await expectCall('DURABLE_BETA_OVERLAP', 'beta', '/v1/responses');
	alphaGate.release();
	betaGate.release();
	const [alphaReply, betaReply] = await Promise.all([
		alphaClient.read(alphaAdmission, { signal: AbortSignal.timeout(20_000) }),
		betaClient.read(betaAdmission, { signal: AbortSignal.timeout(20_000) }),
	]);
	assert.equal(alphaReply.text, 'Alpha isolated reply.');
	assert.equal(betaReply.text, 'Beta isolated reply.');
	assert.equal(JSON.stringify(await alphaClient.history()).includes('Beta isolated reply'), false);
	assert.equal(JSON.stringify(await betaClient.history()).includes('Alpha isolated reply'), false);
	report.checks.push('Overlapping learners use separate stored keys and receive only their own history.');
	stage = 'two-process-read-and-crash';
	const second = await apps.start();
	const deathGate = gate();
	fixture.plan('DURABLE_OWNER_DEATH', { before: deathGate, text: 'Lost first execution.' }, { text: 'Recovered by the second process.' });
	const activeFirst = clientFor(first, owner, 'owner-death');
	const activeSecond = clientFor(second, owner, 'owner-death');
	const activeAdmission = await activeFirst.send({ message: { kind: 'user', body: 'DURABLE_OWNER_DEATH' } });
	await until(() => fixture.count('DURABLE_OWNER_DEATH') === 1, 'first process owns provider work');
	const observed = await activeSecond.history({ signal: AbortSignal.timeout(3_000) });
	assert.equal(userMessages(observed).length, 1, 'another process must read committed history while work is owned');
	const competing = await fetch(activeSecond.url, { method: 'POST', headers: { cookie: owner.cookie, 'content-type': 'application/json' },
		body: JSON.stringify({ kind: 'user', body: 'Must not admit a competing turn' }), signal: AbortSignal.timeout(3_000) });
	assert.equal(competing.status, 409);
	await delay(300);
	assert.equal(fixture.count('DURABLE_OWNER_DEATH'), 1, 'second process reads and rejected writes must not duplicate execution');
	const recovery = activeSecond.read(activeAdmission.submissionId, { signal: AbortSignal.timeout(25_000) });
	await first.stop('SIGKILL');
	assert.equal((await recovery).text, 'Recovered by the second process.');
	const recoveredHistory = await activeSecond.history();
	assert.equal(userMessages(recoveredHistory).length, 1);
	assert.equal(recoveredHistory.settlements.filter((value) => value.submissionId === activeAdmission.submissionId).length, 1);
	assert.equal(fixture.count('DURABLE_OWNER_DEATH'), 2);
	deathGate.release();
	report.checks.push('Two live processes share read access; competing admission returns409; killing the owner recovers the same submission once, with one learner row and two reported provider calls.');
	stage = 'cross-process-cancellation';
	first = await apps.start();
	const cancelGate = gate();
	fixture.plan('DURABLE_REMOTE_CANCEL', { before: cancelGate, text: 'Must not appear.' });
	const ownerClient = clientFor(second, owner, 'remote-cancel');
	const observerClient = clientFor(first, owner, 'remote-cancel');
	const cancelling = await ownerClient.send({ message: { kind: 'user', body: 'DURABLE_REMOTE_CANCEL' } });
	await until(() => fixture.count('DURABLE_REMOTE_CANCEL') === 1, 'remote cancel provider call');
	assert.equal((await observerClient.abort({ signal: AbortSignal.timeout(3_000) })).aborted, true);
	await assert.rejects(ownerClient.read(cancelling, { signal: AbortSignal.timeout(15_000) }), (error) => error.failure === 'aborted');
	const cancelledHistory = await observerClient.history();
	assert.equal(cancelledHistory.settlements.at(-1).outcome, 'aborted');
	assert.equal(JSON.stringify(cancelledHistory).includes('Must not appear.'), false);
	cancelGate.release();
	report.checks.push('Cancellation from a second process reaches the active owner and durably settles aborted.');
	stage = 'rotation-revocation-restart';
	await storeKey(first, owner, rotatedKey);
	piClient = clientFor(first, owner, piId);
	await completed(piClient, 'DURABLE_ROTATED', 'The next alias turn uses the rotated key.');
	await expectCall('DURABLE_ROTATED', 'alpha-rotated', '/v1/responses');
	assert.equal((await fetch(`${first.origin}/api/openai-key`, { method: 'DELETE', headers: { cookie: owner.cookie } })).status, 200);
	await completed(piClient, 'DURABLE_REVOKED', 'The next alias turn uses the operator fallback.');
	await expectCall('DURABLE_REVOKED', 'operator', '/v1/chat/completions');
	const beforeRestart = await piClient.history();
	await first.stop();
	await second.stop();
	first = await apps.start();
	await assertSession(first, owner);
	assert.deepEqual(await clientFor(first, owner, piId).history(), beforeRestart);
	assert.deepEqual(await clientFor(first, owner, legacyId).history(), continued.history);
	const signedInAgain = await oauth(first, await mintSessionFixture(first.origin), 'synthetic-alpha');
	assert.equal(signedInAgain.userId, owner.userId);
	assert.ok(signedInAgain.aliases.includes(aliasId));
	assert.deepEqual(await clientFor(first, signedInAgain, piId).history(), beforeRestart);
	report.checks.push('Key rotation/revocation affect subsequent alias turns; all histories and signed identity survive full restart and fresh OAuth login to the same account.');
	stage = 'persistence-safety';
	report.legacyAfterPi = await flueDigest();
	assert.deepEqual(report.legacyAfterPi, report.legacyAfterContinuation, 'all later Pi work must leave exact legacy Flue records unchanged');
	const credentials = (await pool.query('SELECT ciphertext FROM socratink_credentials')).rows;
	assert.equal(credentials.length, 1, 'only beta key remains after alpha revocation');
	assert.match(credentials[0].ciphertext, /^v1\./);
	const tables = (await pool.query("SELECT tablename FROM pg_tables WHERE schemaname='socratink_pi' ORDER BY tablename")).rows;
	assert.ok(tables.length > 0);
	for (const { tablename } of tables) {
		const rows = (await pool.query(`SELECT row_to_json(t) AS row FROM socratink_pi."${tablename.replaceAll('"', '""')}" t`)).rows;
		for (const secret of fixture.secrets.keys()) assert.equal(JSON.stringify(rows).includes(secret), false, 'Pi storage must not contain raw provider keys');
	}
	for (const secret of fixture.secrets.keys()) assert.equal(apps.hasRawLog(secret), false, 'application logs must not contain raw provider keys');
	assert.deepEqual(fixture.errors, []);
	report.checks.push('Exact legacy table digests remain unchanged by Pi; remaining credential is encrypted; Pi journal and application log contain no synthetic raw keys.');
	report.ok = true;
} catch (error) {
	report.failure = { stage, message: apps?.redact(error.stack ?? error) ?? String(error) };
	process.exitCode = 1;
} finally {
	await apps?.stop();
	await fixture?.stop();
	await pool?.end();
	await database?.stop();
	report.containerRemoved = Boolean(database);
	report.providerCalls = fixture?.calls ?? [];
	report.fixtureErrors = fixture?.errors ?? [];
	await mkdir(out, { recursive: true });
	await writeFile(join(out, 'proof.json'), `${JSON.stringify(report, null, 2)}\n`);
	await writeFile(join(out, 'app.log'), apps?.logs.join('') ?? '');
	console.log(JSON.stringify({ ok: report.ok, checks: report.checks.length, stage, evidence: out }));
	if (report.failure) console.error(report.failure.message);
}
