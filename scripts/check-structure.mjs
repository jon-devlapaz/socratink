import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const DDL = /\bCREATE\s+(?:UNIQUE\s+)?(?:TABLE|SCHEMA|INDEX)\b/;
const POSTGRES = /from 'pg'|\bAuthPgClient\b|\$1\b/;
const HIDDEN_TEXT = /«(?:\[A-Z|\(\?:\[A-Z|[A-Z]{2})|think>|\(no text\\?\)|\bno reveal\b|\bmark_reveal\|present_question\b/;
const TEXT_RULE = /\/(?:\\.|[^/\n])+\/[dgimsuy]*|\.(?:indexOf|lastIndexOf|startsWith|endsWith|includes|replaceAll|replace|split)\(\s*['"`][^'"`\n]*['"`]/g;

export const rules = [
	{
		name: 'postgres-setup-retries',
		applies: (file) => /^(src|api)\/.*\.tsx?$/.test(file) && !/\.test\.tsx?$/.test(file) && file !== 'src/server/setup-once.ts',
		check: (text) => DDL.test(text) && POSTGRES.test(text) && !/\bsetupOnce\(/.test(text),
		fix: 'sends schema setup to Postgres without setupOnce(). Wrap the setup in setupOnce() from src/server/setup-once.ts. '
			+ 'It runs on first use and forgets a failure, so the next request retries instead of the instance staying broken (#78, #80).',
	},
	{
		name: 'learner-text-owner',
		applies: (file) => /^(src|api)\/.*\.tsx?$/.test(file) && !/\.test\.tsx?$/.test(file) && file !== 'src/learning/learner-text.ts',
		check: (text) => (text.match(TEXT_RULE) ?? []).some((rule) => HIDDEN_TEXT.test(rule)),
		fix: 'filters tutor text the learner must not see outside src/learning/learner-text.ts. Add the rule to '
			+ 'learnerVisibleText() or splitReasoning() there instead, so live and settled replies both drop it '
			+ '(#25, #117, #116, #131, #136 each fixed one path and missed the other).',
	},
];

export function findProblems(files) {
	return files.flatMap(({ file, text }) => rules
		.filter((rule) => rule.applies(file) && rule.check(text))
		.map((rule) => `${file}: [${rule.name}] ${rule.fix}`));
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
	const files = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { encoding: 'utf8' })
		.split('\0').filter((file) => rules.some((rule) => rule.applies(file)) && existsSync(file))
		.map((file) => ({ file, text: readFileSync(file, 'utf8') }));
	const problems = findProblems(files);
	if (problems.length) {
		console.error(`Structure check failed:\n${problems.map((problem) => `  ${problem}`).join('\n')}`);
		process.exit(1);
	}
	console.log(`Structure check: ${rules.length} rule(s) hold across ${files.length} files.`);
}
