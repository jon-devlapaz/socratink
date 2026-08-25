#!/usr/bin/env node
import { randomBytes } from 'node:crypto';
import {
	chmod,
	link,
	lstat,
	mkdir,
	open,
	readFile,
	rename,
	unlink,
} from 'node:fs/promises';
import {
	closeSync,
	fsyncSync,
	openSync,
	readFileSync,
	unlinkSync,
} from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';

if (process.env.SOCRATINK_R1_LOCAL !== '1') {
	throw new Error('SOCRATINK_R1_LOCAL=1 is required for the R1 local runner.');
}

const portText = process.env.PORT ?? '3000';
if (!/^\d+$/.test(portText) || Number(portText) < 1 || Number(portText) > 65_535) {
	throw new Error('PORT must be an integer from 1 to 65535.');
}

const dataDirectory = resolve(process.env.SOCRATINK_R1_DATA_DIR ?? '.socratink/r1');
const lockPath = join(dataDirectory, '.writer.lock');
const ownershipNonce = randomBytes(32).toString('hex');
let lockHandle;
let released = false;

function parseLockMetadata(text, path) {
	let value;
	try {
		value = JSON.parse(text);
	} catch {
		throw new Error(`Malformed R1 writer lock at ${path}. Verify no R1 runner is active, then remove that exact lock file manually.`);
	}
	const exactKeys = ['schemaVersion', 'pid', 'nonce', 'createdAt'];
	if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).sort().join('\0') !== exactKeys.sort().join('\0') || value.schemaVersion !== 1 || !Number.isSafeInteger(value.pid) || value.pid < 1 || typeof value.nonce !== 'string' || !/^[0-9a-f]{64}$/.test(value.nonce) || typeof value.createdAt !== 'string' || !Number.isFinite(Date.parse(value.createdAt))) {
		throw new Error(`Malformed R1 writer lock at ${path}. Verify no R1 runner is active, then remove that exact lock file manually.`);
	}
	return value;
}

function processIsLive(pid) {
	try {
		process.kill(pid, 0);
		return true;
	} catch (error) {
		if (error?.code === 'EPERM') return true;
		if (error?.code === 'ESRCH') return false;
		throw error;
	}
}

async function syncDirectory(path) {
	const directory = await open(path, 'r');
	try {
		await directory.sync();
	} finally {
		await directory.close();
	}
}

async function readLock(path) {
	const details = await lstat(path);
	if (!details.isFile() || details.size > 4_096) {
		throw new Error(`Malformed R1 writer lock at ${path}. Verify no R1 runner is active, then remove that exact lock file manually.`);
	}
	return parseLockMetadata(await readFile(path, 'utf8'), path);
}

async function acquireWriterLock() {
	await mkdir(dataDirectory, { recursive: true, mode: 0o700 });
	await chmod(dataDirectory, 0o700);
	while (true) {
		try {
			const handle = await open(lockPath, 'wx', 0o600);
			const metadata = { schemaVersion: 1, pid: process.pid, nonce: ownershipNonce, createdAt: new Date().toISOString() };
			try {
				await handle.writeFile(`${JSON.stringify(metadata)}\n`, 'utf8');
				await handle.sync();
				await syncDirectory(dataDirectory);
				return handle;
			} catch (error) {
				await handle.close();
				try { await unlink(lockPath); } catch {}
				throw error;
			}
		} catch (error) {
			if (error?.code !== 'EEXIST') throw error;
			const existing = await readLock(lockPath);
			if (processIsLive(existing.pid)) {
				throw new Error(`R1 data directory already has a live writer (pid ${existing.pid}): ${dataDirectory}`);
			}
			let current;
			try {
				current = await readLock(lockPath);
			} catch (readError) {
				if (readError?.code === 'ENOENT') continue;
				throw readError;
			}
			if (current.nonce !== existing.nonce || current.pid !== existing.pid) continue;
			if (processIsLive(current.pid)) {
				throw new Error(`R1 data directory already has a live writer (pid ${current.pid}): ${dataDirectory}`);
			}

			const recoveryPath = join(dirname(lockPath), `.${basename(lockPath)}.stale-${randomBytes(16).toString('hex')}`);
			try {
				await rename(lockPath, recoveryPath);
			} catch (renameError) {
				if (renameError?.code === 'ENOENT') continue;
				throw renameError;
			}
			const recovered = await readLock(recoveryPath);
			if (recovered.nonce !== existing.nonce || recovered.pid !== existing.pid) {
				try {
					await link(recoveryPath, lockPath);
					await unlink(recoveryPath);
					await syncDirectory(dataDirectory);
				} catch (restoreError) {
					if (restoreError?.code !== 'EEXIST') throw restoreError;
				}
				throw new Error(`R1 writer-lock recovery raced at ${dataDirectory}. Verify no runner is active and inspect the exact lock artifacts manually.`);
			}
			await unlink(recoveryPath);
			await syncDirectory(dataDirectory);
		}
	}
}

async function releaseWriterLock() {
	if (released) return;
	try {
		const current = await readLock(lockPath);
		if (current.nonce === ownershipNonce && current.pid === process.pid) {
			await unlink(lockPath);
			await syncDirectory(dataDirectory);
		}
	} catch (error) {
		if (error?.code !== 'ENOENT') throw error;
	} finally {
		await lockHandle?.close();
		lockHandle = undefined;
		released = true;
	}
}

function releaseWriterLockSync() {
	if (released) return;
	try {
		const current = parseLockMetadata(readFileSync(lockPath, 'utf8'), lockPath);
		if (current.nonce === ownershipNonce && current.pid === process.pid) {
			unlinkSync(lockPath);
			const directoryDescriptor = openSync(dataDirectory, 'r');
			try { fsyncSync(directoryDescriptor); } finally { closeSync(directoryDescriptor); }
		}
	} catch (error) {
		if (error?.code !== 'ENOENT') process.stderr.write(`[socratink-r1] Could not release writer lock: ${error instanceof Error ? error.message : String(error)}\n`);
	} finally {
		released = true;
	}
}

lockHandle = await acquireWriterLock();
process.on('exit', releaseWriterLockSync);

let lifecycle;
try {
	const { startFlueNodeServer } = await import('../dist/app.mjs');
	lifecycle = await startFlueNodeServer({
		hostname: '127.0.0.1',
		port: Number(portText),
	});
} catch (error) {
	await releaseWriterLock();
	throw error;
}

let stopping;
async function stop(exitCode) {
	if (stopping) return stopping;
	stopping = (async () => {
		const timeout = setTimeout(() => {
			process.stderr.write('[socratink-r1] Shutdown timed out.\n');
			process.exit(exitCode);
		}, 60_000);
		timeout.unref();
		try {
			await lifecycle.stop();
		} finally {
			try {
				await releaseWriterLock();
			} finally {
				clearTimeout(timeout);
			}
		}
		process.exit(exitCode);
	})();
	return stopping;
}

process.on('SIGINT', () => void stop(130));
process.on('SIGTERM', () => void stop(143));
process.on('disconnect', () => void stop(0));
