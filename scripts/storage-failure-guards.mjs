import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const cases = [
	['conversation read', 'src/ui/client/conversation.ts',
		'readBrowserStorage(appConfig.chatConversationStorageKey)',
		'{ value: localStorage.getItem(appConfig.chatConversationStorageKey), available: true }', 'failed saved-ID read'],
	['conversation write', 'src/ui/client/conversation.ts',
		'writeBrowserStorage(appConfig.chatConversationStorageKey, conversationId)',
		'localStorage.setItem(appConfig.chatConversationStorageKey, conversationId)', 'saved-ID quota failure'],
	['inline theme read', 'src/ui/index.html',
		'try { stored = localStorage.getItem(key); } catch {}',
		'stored = localStorage.getItem(key);', 'page-wide'],
	['inline size read', 'src/ui/index.html',
		"try { typeSize = localStorage.getItem('%SOCRATINK_TYPE_SIZE_STORAGE_KEY%'); } catch {}",
		"typeSize = localStorage.getItem('%SOCRATINK_TYPE_SIZE_STORAGE_KEY%');", 'page-wide'],
	['theme read', 'src/ui/theme.ts',
		'readBrowserStorage(appConfig.themeStorageKey).value',
		'localStorage.getItem(appConfig.themeStorageKey)', 'page-wide'],
	['type-size read', 'src/ui/type-size.ts',
		'readBrowserStorage(appConfig.typeSizeStorageKey).value',
		'localStorage.getItem(appConfig.typeSizeStorageKey)', 'page-wide'],
	['sound read', 'src/ui/sound-cues.ts',
		'readBrowserStorage(appConfig.soundStorageKey).value',
		'localStorage.getItem(appConfig.soundStorageKey)', 'page-wide'],
	['theme write', 'src/ui/theme.ts',
		'writeBrowserStorage(appConfig.themeStorageKey, appearance)',
		'localStorage.setItem(appConfig.themeStorageKey, appearance)', 'page-wide'],
	['type-size write', 'src/ui/type-size.ts',
		'writeBrowserStorage(appConfig.typeSizeStorageKey, size)',
		'localStorage.setItem(appConfig.typeSizeStorageKey, size)', 'page-wide'],
	['sound write', 'src/ui/sound-cues.ts',
		"writeBrowserStorage(appConfig.soundStorageKey, enabled ? 'on' : 'off')",
		"localStorage.setItem(appConfig.soundStorageKey, enabled ? 'on' : 'off')", 'page-wide'],
	['notice', 'src/ui/chat-surface.tsx',
		'if (!conversation.placeSaved) {',
		'if (!conversation.placeSaved && false) {', 'saved-ID quota failure'],
	['notice during a question', 'src/ui/styles.css',
		'.dock:has(#storage-notice:empty) {',
		'.dock {', 'saved-ID quota failure'],
];
mkdirSync('.cache/storage-guards', { recursive: true });
for (const [name, path, from, to, pattern] of cases) {
	const original = readFileSync(path, 'utf8');
	assert.equal(original.split(from).length, 2, `${name} must match once`);
	try {
		writeFileSync(path, original.replace(from, to));
		const run = spawnSync(process.execPath, ['--test', `--test-name-pattern=${pattern}`, 'scripts/storage-failure.test.mjs'], {
			env: process.env, encoding: 'utf8', timeout: 30_000,
		});
		writeFileSync(`.cache/storage-guards/${name.replaceAll(' ', '-')}.log`, `${run.stdout}\n${run.stderr}`);
		assert.equal(run.error, undefined, `${name} must finish, not time out`);
		assert.equal(run.status, 1, `${name} must fail an assertion`);
		assert.match(run.stdout, /tests 1/);
		console.log(`Guard reverted: ${name}; regression failed as expected.`);
	} finally {
		writeFileSync(path, original);
	}
}
const restored = spawnSync(process.execPath, ['--test', 'scripts/storage-failure.test.mjs'], { env: process.env, stdio: 'inherit', timeout: 30_000 });
assert.equal(restored.status, 0, 'restored guards must pass');
