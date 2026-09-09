import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('demo auth session helpers and email check are exported', async () => {
	const source = await readFile(new URL('../src/ui/demo-auth.ts', import.meta.url), 'utf8');
	assert.match(source, /demoAuthStorageKey/);
	assert.match(source, /export function hasDemoAuthSession/);
	assert.match(source, /export function setDemoAuthSession/);
	assert.match(source, /export function clearDemoAuthSession/);
	assert.match(source, /export function isPlausibleEmail/);
});

test('login page is a built entry with dummy continue paths', async () => {
	const html = await readFile(new URL('../src/ui/login.html', import.meta.url), 'utf8');
	const script = await readFile(new URL('../src/ui/login.ts', import.meta.url), 'utf8');
	const vite = await readFile(new URL('../vite.config.ui.ts', import.meta.url), 'utf8');
	const main = await readFile(new URL('../src/ui/main.ts', import.meta.url), 'utf8');
	const app = await readFile(new URL('../src/app.ts', import.meta.url), 'utf8');

	assert.match(html, /id="login-form"/);
	assert.match(html, /Continue with email/);
	assert.match(html, /data-provider="google"/);
	assert.match(html, /data-provider="github"/);
	assert.match(script, /setDemoAuthSession/);
	assert.match(script, /location\.assign\('\/'\)/);
	assert.match(vite, /login\.html/);
	assert.match(main, /hasDemoAuthSession/);
	assert.match(main, /location\.replace\('\/login\.html'\)/);
	assert.match(app, /context\.redirect\('\/login\.html'\)/);
});
