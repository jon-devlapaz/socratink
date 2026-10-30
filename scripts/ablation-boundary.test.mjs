import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const removedPaths = [
	'src/braintrust.ts',
	'src/config/openrouter.ts',
	'src/server/openrouter.ts',
	'src/ui/openrouter.ts',
	'scripts/braintrust-config.test.mjs',
	'scripts/braintrust-live-smoke.mjs',
	'scripts/openrouter.test.mjs',
];

for (const path of removedPaths) {
	await assert.rejects(access(resolve(root, path)), { code: 'ENOENT' }, `${path} should be removed`);
}

const packageJson = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'));
assert.equal('braintrust' in packageJson.dependencies, false);
assert.equal('test:braintrust' in packageJson.scripts, false);
assert.equal('smoke:braintrust-live' in packageJson.scripts, false);
assert.equal('test:openrouter' in packageJson.scripts, false);

const app = await readFile(resolve(root, 'src/app.ts'), 'utf8');
assert.match(app, /app\.route\('\/api\/agents\/chat', createAgentRouter\(Chat\)\)/);
assert.match(app, /mountSessionRoutes\(app/);
assert.match(app, /mountChatRoute\(app/);
assert.doesNotMatch(app, /configureBraintrust|mountOpenrouterRoutes/);

const dock = await readFile(resolve(root, 'src/ui/index.html'), 'utf8');
assert.doesNotMatch(dock, /Goal\. Not available yet|Practice\. Not available yet|Explain\. Not available yet|Check\. Not available yet/);
assert.match(dock, /id="dock-trigger"/);
assert.match(dock, /id="app-dock"/);
assert.match(dock, /id="messages"/);
assert.doesNotMatch(dock, /app-dock-item/);

// With no dock items left, the orb must not offer a learning-tools control that opens nothing.
const dockSource = await readFile(resolve(root, 'src/ui/app-dock.ts'), 'utf8');
assert.match(dockSource, /mountIconCloud\(dock\)/, 'icon-cloud stays mounted');
assert.match(
	dockSource,
	/if \(dock\.children\.length === 0\) \{[\s\S]*?core\.disabled = true;[\s\S]*?core\.removeAttribute\('aria-controls'\);[\s\S]*?return \{ close\(\) \{\} \};/,
	'an empty dock leaves the orb as no control: disabled, unlinked, no open handler',
);
