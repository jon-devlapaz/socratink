import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { cp, mkdtemp, rm, symlink } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createFlueClient } from '@flue/sdk';

const expectedReply = 'Socratink smoke response.';
const sockets = new Set();

function listen(server) {
	return new Promise((resolve, reject) => {
		server.once('error', reject);
		server.listen(0, '127.0.0.1', () => {
			server.off('error', reject);
			resolve(server.address().port);
		});
	});
}

function close(server) {
	return new Promise((resolve, reject) => {
		server.close((error) => (error ? reject(error) : resolve()));
		for (const socket of sockets) socket.destroy();
	});
}

async function waitForServer(url, process, timeoutMs = 10_000) {
	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		if (process.exitCode !== null) throw new Error(`Socratink server exited with code ${process.exitCode}`);
		try {
			const response = await fetch(url);
			if (response.ok) return response;
		} catch {}
		await new Promise((resolve) => setTimeout(resolve, 50));
	}
	throw new Error(`Socratink server did not become ready within ${timeoutMs}ms`);
}

const fakeProvider = createServer(async (request, response) => {
	assert.equal(request.method, 'POST');
	assert.equal(request.url, '/v1/chat/completions');
	assert.equal(request.headers.authorization, 'Bearer smoke-test-key');

	let body = '';
	for await (const chunk of request) body += chunk;
	const payload = JSON.parse(body);
	assert.equal(payload.model, 'auto');
	assert.equal(payload.stream, true);

	response.writeHead(200, {
		'content-type': 'text/event-stream',
		'cache-control': 'no-cache',
		connection: 'keep-alive',
	});
	const chunks = [
		{ id: 'chatcmpl-smoke', object: 'chat.completion.chunk', created: 0, model: 'auto', choices: [{ index: 0, delta: { role: 'assistant' }, finish_reason: null }] },
		{ id: 'chatcmpl-smoke', object: 'chat.completion.chunk', created: 0, model: 'auto', choices: [{ index: 0, delta: { content: expectedReply }, finish_reason: null }] },
		{ id: 'chatcmpl-smoke', object: 'chat.completion.chunk', created: 0, model: 'auto', choices: [{ index: 0, delta: {}, finish_reason: 'stop' }] },
		{ id: 'chatcmpl-smoke', object: 'chat.completion.chunk', created: 0, model: 'auto', choices: [], usage: { prompt_tokens: 4, completion_tokens: 4, total_tokens: 8 } },
	];
	for (const chunk of chunks) response.write(`data: ${JSON.stringify(chunk)}\n\n`);
	response.end('data: [DONE]\n\n');
});
fakeProvider.on('connection', (socket) => {
	sockets.add(socket);
	socket.once('close', () => sockets.delete(socket));
});

let appProcess;
let stderr = '';
let appDirectory;

function startApp(appPort, providerPort) {
	const child = spawn(process.execPath, ['dist/server.mjs'], {
		cwd: appDirectory,
		env: {
			...process.env,
			NODE_ENV: 'development',
			PORT: String(appPort),
			JON_LOCAL_BASE_URL: `http://127.0.0.1:${providerPort}/v1`,
			JON_LOCAL_API_KEY: 'smoke-test-key',
		},
		stdio: ['ignore', 'pipe', 'pipe'],
	});
	child.stderr.on('data', (chunk) => {
		stderr += chunk;
	});
	return child;
}

async function stopApp(child) {
	if (child?.exitCode !== null) return;
	child.kill('SIGTERM');
	await new Promise((resolve) => child.once('exit', resolve));
}

try {
	const providerPort = await listen(fakeProvider);
	const portProbe = createServer();
	const appPort = await listen(portProbe);
	await close(portProbe);

	appDirectory = await mkdtemp(join(tmpdir(), 'socratink-smoke-'));
	await cp('dist', join(appDirectory, 'dist'), { recursive: true });
	await symlink(resolve('node_modules'), join(appDirectory, 'node_modules'), 'dir');
	appProcess = startApp(appPort, providerPort);

	const origin = `http://127.0.0.1:${appPort}`;
	const health = await waitForServer(`${origin}/healthz`, appProcess);
	assert.deepEqual(await health.json(), { status: 'ok' });

	const root = await fetch(`${origin}/`);
	assert.equal(root.status, 200);
	const html = await root.text();
	assert.match(html, /<title>Socratink<\/title>/);

	const assetPaths = [...html.matchAll(/(?:src|href)="([^"?#]*assets\/[^"?#]+)"/g)].map((match) => match[1]);
	assert.ok(assetPaths.length >= 2, 'expected built JavaScript and CSS assets');
	for (const path of assetPaths) {
		const asset = await fetch(new URL(path, origin));
		assert.equal(asset.status, 200, `asset ${path} should load`);
		assert.ok((await asset.arrayBuffer()).byteLength > 0, `asset ${path} should not be empty`);
	}

	const client = createFlueClient({ url: `${origin}/api/agents/chat/smoke-conversation` });
	const admission = await client.send({ message: { kind: 'user', body: 'Return the smoke response.' } });
	const reply = await client.read(admission);
	assert.equal(reply.text, expectedReply);

	await stopApp(appProcess);
	appProcess = startApp(appPort, providerPort);
	await waitForServer(`${origin}/healthz`, appProcess);
	const restored = await client.history();
	assert.ok(
		restored.messages.some((message) =>
			message.parts.some((part) => part.type === 'text' && part.text === expectedReply),
		),
		'completed response should survive a process restart',
	);

	console.log(
		`smoke passed: health, root, ${assetPaths.length} assets, agent route, completed response, restart persistence`,
	);
} catch (error) {
	if (stderr) process.stderr.write(`\nSocratink server stderr:\n${stderr}`);
	throw error;
} finally {
	await stopApp(appProcess);
	if (fakeProvider.listening) await close(fakeProvider);
	if (appDirectory) await rm(appDirectory, { recursive: true, force: true });
}
