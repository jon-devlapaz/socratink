#!/usr/bin/env node
// Launch, check and stop a disposable Socratink instance for learner-path verification.
//
//   node .claude/skills/verify-socratink/control.mjs launch [--provider scripted|local|gateway] [--paid]
//   node .claude/skills/verify-socratink/control.mjs doctor [--run <id>]
//   node .claude/skills/verify-socratink/control.mjs stop   [--run <id>]
//
// Run from the repository root. State lives in .cache/verify-socratink/runs/<id>/,
// proof in .cache/verify-socratink/evidence/<id>/. stop removes the first, never the second.
import { execFileSync, spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, openSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
const base = join(root, '.cache/verify-socratink');
const here = fileURLToPath(new URL('.', import.meta.url));
const [command, ...rest] = process.argv.slice(2);
const flag = (name) => { const i = rest.indexOf(`--${name}`); return i === -1 ? undefined : rest[i + 1] ?? ''; };
const sleep = (ms) => new Promise((done) => setTimeout(done, ms));

function latestRun() {
	const dir = join(base, 'runs');
	const runs = existsSync(dir) ? readdirSync(dir).sort() : [];
	if (!runs.length) throw new Error('No verification run found. Run `control.mjs launch` first.');
	return runs.at(-1);
}
export function readState(run = latestRun()) {
	return JSON.parse(readFileSync(join(base, 'runs', run, 'state.json'), 'utf8'));
}
function alive(pid) { try { process.kill(pid, 0); return true; } catch { return false; } }
function freePort() {
	return new Promise((done, fail) => {
		const server = createServer().once('error', fail).listen(0, '127.0.0.1', () => {
			const { port } = server.address();
			server.close(() => done(port));
		});
	});
}
async function waitFor(check, label, ms) {
	const end = Date.now() + ms;
	while (Date.now() < end) { if (await check().catch(() => false)) return; await sleep(100); }
	throw new Error(`Timed out waiting for ${label}`);
}
function detached(cmd, args, options, log) {
	const out = openSync(log, 'a');
	const child = spawn(cmd, args, { ...options, detached: true, stdio: ['ignore', out, out] });
	child.unref();
	return child.pid;
}

async function launch() {
	const provider = flag('provider') || 'scripted';
	if (!['scripted', 'local', 'gateway'].includes(provider)) throw new Error(`Unknown provider ${provider}`);
	if (provider === 'gateway' && flag('paid') === undefined) {
		throw new Error('The gateway provider calls a paid model. Ask the user, then pass --paid.');
	}
	const runId = new Date().toISOString().replace(/[-:]/g, '').replace(/\..*/, '') + '-' + randomBytes(2).toString('hex');
	const runDir = join(base, 'runs', runId);
	const evidenceDir = join(base, 'evidence', runId);
	mkdirSync(runDir, { recursive: true });
	mkdirSync(evidenceDir, { recursive: true });
	const log = join(runDir, 'launch.log');

	const appDir = join(runDir, 'app');
	const state = { runId, provider, runDir, evidenceDir, appDir,
		commit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
		dirty: execFileSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' }).trim() !== '' };
	const save = () => writeFileSync(join(runDir, 'state.json'), JSON.stringify(state, null, '\t'));
	save();

	console.log('Building (pnpm build)...');
	try {
		execFileSync('pnpm', ['build'], { cwd: root, stdio: ['ignore', openSync(log, 'a'), openSync(log, 'a')] });
	} catch {
		throw new Error(`pnpm build failed. See ${log}`);
	}
	// A private copy of the build gives this run its own .cache/socratink/local.db.
	cpSync(join(root, 'dist'), join(appDir, 'dist'), { recursive: true });
	symlinkSync(join(root, 'node_modules'), join(appDir, 'node_modules'), 'dir');

	const port = await freePort();
	const env = { PATH: process.env.PATH, HOME: process.env.HOME, PORT: String(port), HOST: '127.0.0.1',
		NODE_ENV: 'development', SESSION_SECRET: randomBytes(32).toString('hex') };
	const nodeArgs = [];
	if (provider === 'scripted') {
		const portFile = join(runDir, 'model.port');
		state.modelPid = detached(process.execPath, [join(here, 'fake-model.mjs'), portFile], { env: process.env }, join(runDir, 'model.log'));
		save();
		await waitFor(async () => existsSync(portFile), 'the scripted model', 5_000);
		state.modelOrigin = `http://127.0.0.1:${readFileSync(portFile, 'utf8')}`;
		Object.assign(env, { JON_LOCAL_BASE_URL: `${state.modelOrigin}/v1`, JON_LOCAL_MODEL_ID: 'auto', JON_LOCAL_API_KEY: 'verify-scripted' });
	} else if (provider === 'local') {
		nodeArgs.push(`--env-file-if-exists=${join(root, 'src/ui/.env.local')}`);
		for (const name of ['JON_LOCAL_BASE_URL', 'JON_LOCAL_API_KEY', 'JON_LOCAL_MODEL_ID']) {
			if (process.env[name]) env[name] = process.env[name];
		}
	} else {
		const credential = process.env.AI_GATEWAY_API_KEY ? { AI_GATEWAY_API_KEY: process.env.AI_GATEWAY_API_KEY }
			: process.env.VERCEL_OIDC_TOKEN ? { VERCEL_OIDC_TOKEN: process.env.VERCEL_OIDC_TOKEN } : undefined;
		if (!credential) throw new Error('Set AI_GATEWAY_API_KEY or VERCEL_OIDC_TOKEN for the gateway provider.');
		let databaseUrl = process.env.DATABASE_URL;
		if (!databaseUrl) {
			// Hosted mode refuses SQLite, so start a throwaway Postgres (the image the repo's smokes use).
			const pgPort = await freePort();
			state.postgresContainer = `verify-socratink-${runId}`;
			save();
			const password = randomBytes(12).toString('hex');
			execFileSync('docker', ['run', '-d', '--rm', '--name', state.postgresContainer, '-e', `POSTGRES_PASSWORD=${password}`,
				'-p', `127.0.0.1:${pgPort}:5432`, 'postgres:17-alpine'], { stdio: 'ignore' });
			await waitFor(async () => {
				execFileSync('docker', ['exec', state.postgresContainer, 'pg_isready', '-h', '127.0.0.1', '-U', 'postgres'], { stdio: 'ignore' });
				return true;
			}, 'Postgres', 30_000);
			databaseUrl = `postgres://postgres:${password}@127.0.0.1:${pgPort}/postgres`;
		}
		Object.assign(env, { VERCEL: '1', DATABASE_URL: databaseUrl, ...credential });
	}

	state.origin = `http://127.0.0.1:${port}`;
	state.appPid = detached(process.execPath, [...nodeArgs, 'dist/server.mjs'], { cwd: appDir, env }, join(runDir, 'app.log'));
	save();
	await waitFor(async () => {
		if (!alive(state.appPid)) throw new Error(`The app exited. See ${join(runDir, 'app.log')}`);
		return (await fetch(`${state.origin}/healthz`)).ok;
	}, 'the app /healthz', 20_000);
	const result = await doctor(runId);
	console.log(JSON.stringify({ ...result, evidenceDir }, null, 2));
	if (!result.ok) process.exitCode = 1;
}

async function doctor(run = flag('run') || latestRun()) {
	const state = readState(run);
	const checks = {};
	checks.appProcess = alive(state.appPid);
	if (state.modelPid) checks.modelProcess = alive(state.modelPid);
	const health = await fetch(`${state.origin}/healthz`).then((r) => r.json()).catch(() => ({}));
	checks.health = health.status === 'ok';
	checks.inferenceRoute = health.inference === (state.provider === 'gateway' ? 'gateway' : 'local');
	const page = await fetch(state.origin).then((r) => r.text()).catch(() => '');
	checks.pageServed = page.includes('id="message"');
	if (state.modelOrigin) checks.modelControl = await fetch(`${state.modelOrigin}/control/calls`).then((r) => r.ok).catch(() => false);
	const head = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
	const ok = Object.values(checks).every(Boolean);
	return { ok, run: state.runId, provider: state.provider, origin: state.origin, modelOrigin: state.modelOrigin,
		checks, builtFrom: state.commit + (state.dirty ? ' (with uncommitted changes)' : ''),
		stale: head !== state.commit ? `HEAD is now ${head}; relaunch to verify it` : false };
}

async function stop(run = flag('run') || latestRun()) {
	const state = readState(run);
	for (const pid of [state.appPid, state.modelPid].filter(Boolean)) {
		if (!alive(pid)) continue;
		try { process.kill(-pid, 'SIGTERM'); } catch { process.kill(pid, 'SIGTERM'); }
		for (let i = 0; i < 50 && alive(pid); i += 1) await sleep(100);
		if (alive(pid)) process.kill(pid, 'SIGKILL');
	}
	if (state.postgresContainer) {
		try { execFileSync('docker', ['rm', '-f', state.postgresContainer], { stdio: 'ignore' }); } catch {}
	}
	rmSync(state.runDir, { recursive: true, force: true });
	const evidence = existsSync(state.evidenceDir) ? readdirSync(state.evidenceDir) : [];
	console.log(JSON.stringify({ stopped: state.runId, evidenceDir: state.evidenceDir, evidenceFiles: evidence.length }, null, 2));
}

if (resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	const commands = { launch, doctor: async () => {
		const result = await doctor();
		console.log(JSON.stringify(result, null, 2));
		if (!result.ok) process.exitCode = 1;
	}, stop };
	if (!commands[command]) {
		console.error('Usage: control.mjs launch [--provider scripted|local|gateway] [--paid] | doctor [--run id] | stop [--run id]');
		process.exit(2);
	}
	await commands[command]().catch((error) => { console.error(error.message); process.exitCode = 1; });
}
