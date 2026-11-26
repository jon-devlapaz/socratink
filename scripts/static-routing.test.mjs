import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { appConfig } from '../src/config/app.config.ts';

const config = JSON.parse(await readFile('vercel.json', 'utf8'));

test('the client ships the notices for its components, fonts, and bundled dependencies', async () => {
	const notices = await readFile('dist/client/licenses/ui.txt', 'utf8');
	for (const source of ['components/ui/LICENSE', 'components/magicui/LICENSE', 'fonts/OFL-inter.txt', 'fonts/OFL-newsreader.txt']) {
		assert.ok(notices.includes(await readFile(`src/ui/${source}`, 'utf8')), `Missing complete notice from ${source}`);
	}
	const dependencies = await readFile('dist/client/licenses/dependencies.txt', 'utf8');
	assert.ok(dependencies.includes('react-dom') && dependencies.includes('MIT License'));
});

for (const source of ['/login', '/login/']) {
	test(`the hosted ${source} alias reaches the login document`, () => {
		const alias = config.redirects?.find((redirect) => redirect.source === source);
		assert.deepEqual(alias, {
			source,
			destination: '/login.html',
			permanent: false,
		});
	});
}

test('the login document is the final destination', () => {
	assert.ok(!config.redirects.some(({ source }) => source === '/login.html'));
});

test('Vercel keeps API ownership and native filesystem/404 handling', () => {
	assert.equal(config.outputDirectory, 'dist/client');
	assert.equal(config.cleanUrls, undefined, 'keep explicit .html entries reachable');
	assert.deepEqual(config.rewrites, [
		{ source: '/healthz', destination: '/api/[...path]' },
		{ source: '/api/(.*)', destination: '/api/[...path]' },
	]);
	assert.equal(config.routes, undefined, 'do not override native static 404 status handling');
});

test('production build ships branded recovery and existing static entries', async () => {
	const notFound = await readFile('dist/client/404.html', 'utf8');
	assert.match(notFound, /<title>Page not found · Socratink<\/title>/);
	assert.match(notFound, /<h1[^>]*>Page not found<\/h1>/);
	assert.match(notFound, /href="\/"[^>]*>Home<\/a>/);
	assert.match(notFound, /href="\/login"[^>]*>Log in<\/a>/);
	assert.doesNotMatch(notFound, /<script[^>]*\b(?:src|type)=/, 'recovery does not require JavaScript');
	const index = await readFile('dist/client/index.html', 'utf8');
	const boot = /<script>\s*\(function \(\) \{[\s\S]*?<\/script>/;
	assert.ok(notFound.match(boot), 'stored theme and type size apply before paint');
	assert.equal(
		notFound.match(boot)[0].replace(/\s+/g, ' '),
		index.match(boot)?.[0].replace(/\s+/g, ' '),
		'404 boot script matches the app boot script',
	);
	const login = await readFile('dist/client/login.html', 'utf8');
	for (const page of [index, notFound, login]) {
		assert.ok(page.includes(`'${appConfig.themeStorageKey}'`), 'boot scripts read the theme key the app writes');
		assert.doesNotMatch(page, /%SOCRATINK_/);
	}
	for (const page of [index, notFound]) assert.ok(page.includes(`'${appConfig.typeSizeStorageKey}'`));
	const assets = [...notFound.matchAll(/(?:src|href)="(\/assets\/[^"?#]+)"/g)];
	assert.ok(assets.length >= 2, 'built styles and wordmark use root-relative URLs');
	for (const [, path] of assets) {
		assert.ok((await readFile(`dist/client${path}`)).byteLength > 0);
	}
	assert.match(await readFile('dist/client/login.html', 'utf8'), /<h1[^>]*>Sign in<\/h1>/);
	assert.match(await readFile('dist/client/index.html', 'utf8'), /id="chat"/);
});
