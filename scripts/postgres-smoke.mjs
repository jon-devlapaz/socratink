import assert from 'node:assert/strict';
import { execFile, spawn } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import { cp, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { createStreamClient } from '../src/ui/client/conversation-stream.ts';
import pg from 'pg';
import { mergeCookies, mintSessionFixture } from './session-fixture.mjs';
import { writeModelResponse } from './request-path-smoke-transport.mjs';

const args = new Map();
for (let i = 2; i < process.argv.length; i += 2) args.set(process.argv[i], process.argv[i + 1]);
assert.ok(args.get('--candidate') && args.get('--baseline') && args.get('--out'),
	'Usage: node scripts/postgres-smoke.mjs --candidate <built root> --baseline <built root> --out <evidence dir>');
const candidateRoot = resolve(args.get('--candidate'));
const baselineRoot = resolve(args.get('--baseline'));
const out = resolve(args.get('--out'));
const run = promisify(execFile);
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const container = `socratink-postgres-proof-${process.pid}-${Date.now()}`;
const password = randomBytes(24).toString('hex');
const sessionSecret = randomBytes(32).toString('hex');
const credentialSecret = randomBytes(32).toString('hex');
const learnerKey = `sk-synthetic-postgres-${randomBytes(16).toString('hex')}`;
const operatorKey = 'synthetic-postgres-operator-key';
const preload = fileURLToPath(new URL('./postgres-smoke-preload.mjs', import.meta.url));
const report = {
	ok: false, node: process.version, image: 'postgres:17-alpine', checks: [], providerRequests: [],
	candidateRoot, baselineRoot,
	limits: [
		'Local PostgreSQL 17 and an application-process restart; not hosted failover or multi-instance operation.',
		'OAuth and model HTTP responses are synthetic; no live identity or model account was contacted.',
		'Rollback uses the supplied previous build on a disposable synthetic-data clone, not a deployed production version.',
	],
};
const appLogs = [];
const pools = new Set();
const tempdirs = new Set();
let app;
let fixture;
let ownedContainer = false;
let stage = 'setup';
let connection;

function redact(value) {
	let text = String(value);
	for (const secret of [password, sessionSecret, credentialSecret, learnerKey, operatorKey]) {
		text = text.replaceAll(secret, '[redacted]');
	}
	return text.replace(/postgres(?:ql)?:\/\/[^\s'"<>]+/g, '[owned database URL]');
}

async function listen(server) {
	await new Promise((resolve, reject) => {
		server.once('error', reject);
		server.listen(0, '127.0.0.1', resolve);
	});
	return server.address().port;
}

async function closeServer(server) {
	if (!server?.listening) return;
	server.closeAllConnections();
	await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
}

async function stopApp() {
	if (!app) return;
	const child = app;
	app = undefined;
	if (child.exitCode !== null || child.signalCode !== null) return;
	const exited = new Promise((resolve) => child.once('exit', resolve));
	child.kill('SIGTERM');
	const timer = setTimeout(() => child.kill('SIGKILL'), 5_000);
	await exited;
	clearTimeout(timer);
}

function poolFor(database) {
	const pool = new pg.Pool({ ...connection, database, max: 1, connectionTimeoutMillis: 5_000 });
	pools.add(pool);
	return pool;
}

async function closePool(pool) {
	await pool.end();
	pools.delete(pool);
}

async function startApp(root, database) {
	const directory = await mkdtemp(join(tmpdir(), 'socratink-postgres-proof-'));
	tempdirs.add(directory);
	await cp(join(root, 'dist'), join(directory, 'dist'), { recursive: true });
	await symlink(join(root, 'node_modules'), join(directory, 'node_modules'), 'dir');
	const reservation = createServer();
	const port = await listen(reservation);
	await closeServer(reservation);
	const origin = `http://127.0.0.1:${port}`;
	const databaseUrl = `postgresql://${connection.user}:${password}@127.0.0.1:${connection.port}/${database}`;
	app = spawn(process.execPath, ['--import', preload, 'dist/server.mjs'], {
		cwd: directory,
		env: {
			PATH: process.env.PATH,
			NODE_ENV: 'production',
			PORT: String(port),
			DATABASE_URL: databaseUrl,
			SESSION_SECRET: sessionSecret,
			CREDENTIALS_SECRET: credentialSecret,
			JON_LOCAL_BASE_URL: `${report.fixtureOrigin}/v1`,
			JON_LOCAL_MODEL_ID: 'auto',
			JON_LOCAL_API_KEY: operatorKey,
			GOOGLE_CLIENT_ID: 'synthetic-google-client',
			GOOGLE_CLIENT_SECRET: 'synthetic-google-secret',
			AUTH_REDIRECT_BASE_URL: origin,
			POSTGRES_SMOKE_FIXTURE_ORIGIN: report.fixtureOrigin,
		},
		stdio: ['ignore', 'pipe', 'pipe'],
	});
	app.stdout.on('data', (data) => appLogs.push(`[${stage}] ${redact(data)}`));
	app.stderr.on('data', (data) => appLogs.push(`[${stage}] ${redact(data)}`));
	const deadline = Date.now() + 15_000;
	while (Date.now() < deadline) {
		assert.equal(app.exitCode, null, 'built app should stay running');
		try {
			if ((await fetch(`${origin}/healthz`, { signal: AbortSignal.timeout(1_000) })).ok) return origin;
		} catch {}
		await delay(50);
	}
	throw new Error('Built app did not become ready within 15 seconds.');
}

function clientFor(origin, session) {
	return createStreamClient({
		url: `${origin}/api/agents/chat/${encodeURIComponent(`${session.userId}:postgres-proof`)}`,
		headers: { cookie: session.cookie },
	});
}

async function sendTurn(client, text) {
	const before = report.providerRequests.length;
	const signal = AbortSignal.timeout(15_000);
	const reply = await client.read(await client.send({ message: { kind: 'user', body: text }, signal }), { signal });
	assert.equal(reply.text, 'Synthetic PostgreSQL verification response.');
	assert.equal(report.providerRequests.length, before + 1);
	return client.history({ signal });
}

async function assertRestored(origin, session, guestCookie, expectedHistory) {
	const response = await fetch(`${origin}/api/session`, { headers: { cookie: session.cookie } });
	assert.equal(response.status, 200);
	assert.deepEqual(await response.json(), { userId: session.userId, aliases: [], kind: 'registered' });
	assert.equal((await fetch(`${origin}/api/session`, { headers: { cookie: guestCookie } })).status, 401);
	const status = await fetch(`${origin}/api/chat-route`, { headers: { cookie: session.cookie } });
	assert.equal(status.status, 200);
	assert.equal((await status.json()).kind, 'openai');
	assert.deepEqual(await clientFor(origin, session).history({ signal: AbortSignal.timeout(5_000) }), expectedHistory);
}

async function databaseDigest(database) {
	const pool = poolFor(database);
	try {
		const tables = (await pool.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename")).rows;
		const digest = {};
		for (const { tablename } of tables) {
			const identifier = `"${tablename.replaceAll('"', '""')}"`;
			const rows = (await pool.query(`SELECT row_to_json(t)::text AS row FROM ${identifier} t ORDER BY row_to_json(t)::text`)).rows;
			digest[tablename] = { rows: rows.length, sha256: createHash('sha256').update(JSON.stringify(rows)).digest('hex') };
		}
		return digest;
	} finally {
		await closePool(pool);
	}
}

try {
	await mkdir(out, { recursive: true });
	for (const [label, root] of [['candidate', candidateRoot], ['baseline', baselineRoot]]) {
		report[`${label}BundleSha256`] = createHash('sha256').update(await readFile(join(root, 'dist/server.mjs'))).digest('hex');
	}
	await run('docker', ['run', '--detach', '--rm', '--pull=never', '--name', container,
		'--publish', '127.0.0.1::5432', '--tmpfs', '/var/lib/postgresql/data',
		'--env', 'POSTGRES_USER=socratink', '--env', 'POSTGRES_DB=candidate', '--env', `POSTGRES_PASSWORD=${password}`,
		report.image], { timeout: 30_000 });
	ownedContainer = true;
	const port = Number((await run('docker', ['port', container, '5432/tcp'])).stdout.trim().split(':').at(-1));
	assert.ok(Number.isSafeInteger(port) && port > 0);
	connection = { host: '127.0.0.1', port, user: 'socratink', password };
	for (let attempt = 0; ; attempt += 1) {
		try {
			await run('docker', ['exec', container, 'pg_isready', '-h', '127.0.0.1', '-U', 'socratink', '-d', 'candidate'], { timeout: 5_000 });
			break;
		} catch (error) {
			if (attempt === 100) throw error;
			await delay(100);
		}
	}
	const admin = poolFor('postgres');
	report.postgresVersion = (await admin.query('SHOW server_version')).rows[0].server_version;
	fixture = createServer(async (request, response) => {
		try {
			let raw = '';
			for await (const chunk of request) raw += chunk;
			if (request.url === '/oauth/token') {
				response.writeHead(200, { 'content-type': 'application/json' });
				response.end(JSON.stringify({ access_token: 'synthetic-google-token' }));
				return;
			}
			if (request.url === '/oauth/userinfo') {
				assert.equal(request.headers.authorization, 'Bearer synthetic-google-token');
				response.writeHead(200, { 'content-type': 'application/json' });
				response.end(JSON.stringify({ sub: 'synthetic-postgres-subject', email: 'postgres-proof@example.invalid', email_verified: true }));
				return;
			}
			const body = JSON.parse(raw);
			const learner = request.url === '/v1/responses';
			assert.equal(request.headers.authorization, `Bearer ${learner ? learnerKey : operatorKey}`);
			report.providerRequests.push({ stage, provider: learner ? 'openai' : 'operator', storedKeyMatched: learner });
			writeModelResponse(response, { path: request.url, model: body.model,
				text: 'Synthetic PostgreSQL verification response.', id: `pg_${report.providerRequests.length}` });
		} catch (error) {
			report.fixtureError = redact(error.stack);
			response.writeHead(500).end('Synthetic fixture failed.');
		}
	});
	report.fixtureOrigin = `http://127.0.0.1:${await listen(fixture)}`;
	stage = 'candidate-before-restart';
	let origin = await startApp(candidateRoot, 'candidate');
	const session = await mintSessionFixture(origin);
	const guestCookie = session.cookie;
	const login = await fetch(`${origin}/api/auth/google/login`, { redirect: 'manual', headers: { cookie: session.cookie } });
	assert.equal(login.status, 302);
	const state = new URL(login.headers.get('location')).searchParams.get('state');
	const callback = await fetch(`${origin}/api/auth/google/callback?code=synthetic&state=${encodeURIComponent(state)}`, {
		redirect: 'manual', headers: { cookie: mergeCookies(login, session.cookie) },
	});
	assert.equal(callback.status, 302);
	assert.equal(callback.headers.get('location'), '/');
	session.cookie = mergeCookies(callback, session.cookie);
	let client = clientFor(origin, session);
	await sendTurn(client, 'Synthetic operator turn before key storage.');
	const keyResponse = await fetch(`${origin}/api/openai-key`, {
		method: 'PUT', headers: { cookie: session.cookie, 'content-type': 'application/json' },
		body: JSON.stringify({ apiKey: learnerKey }),
	});
	assert.equal(keyResponse.status, 200);
	assert.equal((await keyResponse.json()).kind, 'openai');
	let history = await sendTurn(client, 'Synthetic stored-key turn before restart.');
	const candidate = poolFor('candidate');
	const credentials = (await candidate.query('SELECT ciphertext FROM socratink_credentials')).rows;
	assert.equal(credentials.length, 1);
	assert.match(credentials[0].ciphertext, /^v1\./);
	assert.equal(credentials[0].ciphertext.includes(learnerKey), false);
	assert.equal((await candidate.query('SELECT count(*)::int AS count FROM socratink_users')).rows[0].count, 1);
	assert.equal((await candidate.query('SELECT count(*)::int AS count FROM socratink_oauth_accounts')).rows[0].count, 1);
	await closePool(candidate);
	await assertRestored(origin, session, guestCookie, history);
	report.checks.push('Actual HTTP OAuth creates durable identity; guest cookie revoked; stored key encrypted; operator and learner turns persisted.');
	await stopApp();
	stage = 'candidate-after-restart';
	origin = await startApp(candidateRoot, 'candidate');
	await assertRestored(origin, session, guestCookie, history);
	client = clientFor(origin, session);
	history = await sendTurn(client, 'Synthetic stored-key turn after process restart.');
	report.checks.push('Restart preserves signed session, guest revocation, history, key status, and actual stored-key decryption.');
	await stopApp();
	report.candidateBeforeRollback = await databaseDigest('candidate');
	await admin.query('CREATE DATABASE rollback TEMPLATE candidate');
	stage = 'baseline-rollback-clone';
	origin = await startApp(baselineRoot, 'rollback');
	await assertRestored(origin, session, guestCookie, history);
	await sendTurn(clientFor(origin, session), 'Synthetic rollback-clone-only turn.');
	await stopApp();
	report.candidateAfterRollback = await databaseDigest('candidate');
	assert.deepEqual(report.candidateAfterRollback, report.candidateBeforeRollback);
	report.rollbackClone = await databaseDigest('rollback');
	assert.notDeepEqual(report.rollbackClone, report.candidateBeforeRollback);
	report.checks.push('Previous build reads candidate identity/key/history on a disposable clone and decrypts its key for a new turn; original database unchanged.');
	assert.equal(report.fixtureError, undefined);
	report.ok = true;
} catch (error) {
	report.error = redact(error.stack ?? error);
	process.exitCode = 1;
} finally {
	await stopApp();
	for (const pool of pools) await pool.end();
	await closeServer(fixture);
	for (const directory of tempdirs) await rm(directory, { recursive: true, force: true });
	if (ownedContainer) {
		await run('docker', ['rm', '--force', container], { timeout: 15_000 });
		report.containerRemoved = true;
	}
	delete report.fixtureOrigin;
	await mkdir(out, { recursive: true });
	await writeFile(join(out, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
	await writeFile(join(out, 'app.log'), appLogs.join(''));
	console.log(JSON.stringify({ ok: report.ok, checks: report.checks.length, containerRemoved: report.containerRemoved, evidence: out }));
	if (report.error) console.error(report.error);
}
