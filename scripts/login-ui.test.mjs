import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('session helpers mint a server cookie instead of localStorage', async () => {
	const source = await readFile(new URL('../src/ui/session.ts', import.meta.url), 'utf8');
	assert.match(source, /sessionPath/);
	assert.match(source, /export async function readSession/);
	assert.match(source, /export async function createSession/);
	assert.match(source, /method: 'POST'/);
	assert.match(source, /isSessionUserId/);
	assert.doesNotMatch(source, /clearSession/);
	assert.doesNotMatch(source, /method: 'DELETE'/);
	assert.doesNotMatch(source, /isPlausibleEmail/);
	assert.doesNotMatch(source, /socratink-demo-auth/);
	assert.doesNotMatch(source, /localStorage\.setItem/);
});

test('login page is a built entry that posts a session cookie', async () => {
	const html = await readFile(new URL('../src/ui/login.html', import.meta.url), 'utf8');
	const script = await readFile(new URL('../src/ui/login.ts', import.meta.url), 'utf8');
	const vite = await readFile(new URL('../vite.config.ui.ts', import.meta.url), 'utf8');
	const main = await readFile(new URL('../src/ui/main.ts', import.meta.url), 'utf8');
	const app = await readFile(new URL('../src/app.ts', import.meta.url), 'utf8');
	const menu = await readFile(new URL('../src/ui/index.html', import.meta.url), 'utf8');

	assert.match(html, /id="login-form"/);
	assert.match(html, /Continue with email/);
	assert.match(html, /data-provider="google"/);
	assert.match(html, /data-provider="github"/);
	assert.match(script, /createSession/);
	assert.match(script, /function isPlausibleEmail/);
	assert.match(script, /location\.assign\('\/'\)/);
	assert.doesNotMatch(script, /signout/);
	assert.doesNotMatch(script, /async \(\) => \{/);
	assert.match(vite, /login\.html/);
	assert.match(main, /readSession/);
	assert.match(main, /location\.replace\('\/login\.html'\)/);
	assert.match(app, /context\.redirect\('\/login\.html'\)/);
	assert.match(app, /unauthorizedSessionError/);
	assert.match(app, /requireChatSession/);
	assert.match(app, /createAgentRouter\(Chat\)/);
	assert.doesNotMatch(app, /app\.delete\('\/api\/session'/);
	assert.match(menu, /href="\/api\/session\/logout"/);
	assert.doesNotMatch(script, /socratink-demo-auth/);
	assert.doesNotMatch(main, /socratink-demo-auth/);
});
