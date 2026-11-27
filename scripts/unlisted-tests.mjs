// Runs every test file that no package.json script names, so a new test runs in `pnpm check` without
// an edit to the shared check line. Named groups keep their own flags; this never runs them twice.
import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const scripts = Object.values(JSON.parse(readFileSync('package.json', 'utf8')).scripts).join(' ');
const named = scripts.split(/\s+/).filter((word) => /\.test\.tsx?$|\.test\.mjs$/.test(word))
	.map((word) => new RegExp(`^${word.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^/]*')}$`));
const unlisted = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '*.test.mjs', '*.test.ts', '*.test.tsx'],
	{ encoding: 'utf8' }).split('\n').filter((file) => file && !named.some((pattern) => pattern.test(file)));
if (!unlisted.length) {
	console.log('Unlisted tests: none.');
	process.exit(0);
}
console.log(`Unlisted tests: ${unlisted.join(' ')}`);
const { NODE_TEST_CONTEXT, ...env } = process.env; // A parent test runner would otherwise swallow the result.
const run = spawnSync(process.execPath, ['--import', 'tsx', '--test', '--test-concurrency=1', ...unlisted], { stdio: 'inherit', env });
process.exit(run.status ?? 1);
