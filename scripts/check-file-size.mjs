// Fails when a tracked source file passes the 1,000-line limit.
// Files already over the limit are listed in ALLOWED with their current size: they may shrink, not grow.
// Usage: node scripts/check-file-size.mjs
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const LIMIT = 1000;
const SOURCE = /\.(ts|tsx|mjs|js|css|html)$/;
const ALLOWED = {
	'scripts/conversation-client.test.mjs': 1118,
};

const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter((f) => SOURCE.test(f));
const problems = [];
for (const file of files) {
	const text = readFileSync(file, 'utf8');
	const lines = text.length === 0 ? 0 : text.split('\n').length - (text.endsWith('\n') ? 1 : 0);
	const cap = ALLOWED[file] ?? LIMIT;
	if (lines > cap) {
		problems.push(ALLOWED[file] ? `${file}: ${lines} lines; allowed ${cap} until split, and it may not grow` : `${file}: ${lines} lines; limit ${LIMIT}`);
	}
}
for (const file of Object.keys(ALLOWED)) {
	if (!files.includes(file)) problems.push(`${file}: listed in ALLOWED but not tracked; remove the entry`);
}

if (problems.length) {
	console.error(`File size check failed (split the file or move code to its owner):\n${problems.map((p) => `  ${p}`).join('\n')}`);
	process.exit(1);
}
console.log(`File size check: ${files.length} files within ${LIMIT} lines (${Object.keys(ALLOWED).length} allowed to shrink).`);
