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

test('login page is OAuth-only with no demo email-send lie', async () => {
	const html = await readFile(new URL('../src/ui/login.html', import.meta.url), 'utf8');
	const script = await readFile(new URL('../src/ui/login.ts', import.meta.url), 'utf8');
	const vite = await readFile(new URL('../vite.config.ui.ts', import.meta.url), 'utf8');
	const main = await readFile(new URL('../src/ui/main.ts', import.meta.url), 'utf8');
	const app = await readFile(new URL('../src/app.ts', import.meta.url), 'utf8');
	const sessionServer = await readFile(new URL('../src/server/session.ts', import.meta.url), 'utf8');
	const menu = await readFile(new URL('../src/ui/index.html', import.meta.url), 'utf8');

	assert.doesNotMatch(html, /coming soon/i);
	assert.doesNotMatch(html, /id="email-coming-soon"/);
	assert.match(html, /data-provider="google"/);
	assert.match(html, /data-provider="github"/);
	for (const lie of ['Sending link', 'Sign-in link sent', 'Demo only', 'nothing was emailed']) {
		assert.doesNotMatch(html, new RegExp(lie.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
		assert.doesNotMatch(script, new RegExp(lie.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
	}
	assert.doesNotMatch(html, /id="login-form"/);
	assert.doesNotMatch(html, /Continue with email/);
	assert.doesNotMatch(html, /id="login-sent"/);
	assert.doesNotMatch(html, /id="enter-demo"/);
	const css = await readFile(new URL('../src/ui/login.css', import.meta.url), 'utf8');
	assert.doesNotMatch(css, /\.login-form\b/);
	assert.doesNotMatch(css, /\.login-sent\b/);
	assert.doesNotMatch(script, /createSession/);
	assert.doesNotMatch(script, /isPlausibleEmail/);
	assert.doesNotMatch(script, /location\.assign\('\/'\)/);
	assert.match(script, /loadAuthProviders/);
	assert.match(script, /button\.remove\(\)/);
	assert.match(script, /\/api\/auth\/\$\{provider\}\/login/);
	assert.doesNotMatch(script, /signout/);
	assert.doesNotMatch(script, /async \(\) => \{/);
	assert.match(vite, /login\.html/);
	assert.match(main, /readOrCreateSession/);
	assert.match(main, /location\.replace\('\/login\.html'\)/);
	assert.match(app, /mountSessionRoutes/);
	assert.match(sessionServer, /context\.redirect\('\/login\.html'\)/);
	assert.match(sessionServer, /unauthorizedSessionError/);
	assert.match(sessionServer, /findAliases/);
	assert.match(app, /requireChatSession/);
	assert.match(app, /createAgentRouter\(Chat\)/);
	assert.doesNotMatch(app, /app\.delete\('\/api\/session'/);
	assert.match(menu, /id="auth-link" class="menu-orb-link" href="\/login\.html"/);
	assert.match(menu, /id="auth-link-label">Sign in</);
	assert.match(main, /session\.kind === 'registered'/);
	assert.match(main, /authLink\.href = '\/api\/session\/logout'/);
	assert.doesNotMatch(script, /socratink-demo-auth/);
	assert.doesNotMatch(main, /socratink-demo-auth/);
});
