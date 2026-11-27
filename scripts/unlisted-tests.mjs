// Runs every test file that no script reached from `check` names, so a new test runs in `pnpm check` without
// an edit to the shared check line. Named groups keep their own flags; this never runs them twice.
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

// Only scripts that `check` reaches count, so a test named in a script outside the gate still runs.
const scripts = JSON.parse(readFileSync('package.json', 'utf8')).scripts;
const reached = new Set();
for (const queue = ['check']; queue.length;) {
	const name = queue.pop();
	if (reached.has(name) || !scripts[name]) continue;
	reached.add(name);
	queue.push(...[...scripts[name].matchAll(/\bpnpm (?:run )?([\w:-]+)/g)].map((match) => match[1]));
}
const named = [...reached].flatMap((name) => scripts[name].split(/\s+/)).map((word) => word.replace(/^['"]|['"]$/g, ''))
	.filter((word) => /\.test\.tsx?$|\.test\.mjs$/.test(word))
	.map((word) => new RegExp(`^${word.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^/]*')}$`));
const unlisted = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '*.test.mjs', '*.test.ts', '*.test.tsx'],
	{ encoding: 'utf8' }).split('\n').filter((file) => file && existsSync(file) && !named.some((pattern) => pattern.test(file)));
if (!unlisted.length) {
	console.log('Unlisted tests: none.');
	process.exit(0);
}
console.log(`Unlisted tests: ${unlisted.join(' ')}`);
const { NODE_TEST_CONTEXT, ...env } = process.env; // A parent test runner would otherwise swallow the result.
const run = spawnSync(process.execPath, ['--import', 'tsx', '--test', '--test-concurrency=1', ...unlisted], { stdio: 'inherit', env });
process.exit(run.status ?? 1);
