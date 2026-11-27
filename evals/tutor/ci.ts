// The trusted half of the `Tutor eval` GitHub workflow (.github/workflows/tutor-eval.yml).
// It always runs from the workflow's own checkout, never from the ref under test:
//
//   node evals/tutor/ci.ts plan <dir> [<dir>]      picks the scenarios every ref knows, checks --runs
//   node evals/tutor/ci.ts summary <label>=<json>…  writes a markdown comparison of result files
//
// Inputs arrive as environment variables (EVAL_ONLY, EVAL_RUNS), never inside shell text.
import { execFileSync } from 'node:child_process';
import { appendFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/** At most this many runs per scenario, so one approval cannot buy an unbounded run. */
export const maxRuns = 5;

/** Scenario names from `node evals/tutor/cli.ts --list`. */
export function scenarioNames(listOutput: string): string[] {
	return listOutput.split('\n').flatMap((line) => /^([a-z0-9][a-z0-9-]*)(?: \(#\d+\))?: /u.exec(line)?.[1] ?? []);
}

/** The scenarios to run on every ref: all the refs share for "all", or the named ones, which every ref must know. */
export function planScenarios(only: string, lists: readonly string[][]): string[] {
	const [first = [], ...rest] = lists;
	const shared = first.filter((name) => rest.every((list) => list.includes(name)));
	const wanted = only.trim().toLowerCase() === 'all' ? shared
		: only.split(',').map((name) => name.trim()).filter(Boolean);
	if (!wanted.length) throw new Error('Name at least one scenario, or use all.');
	const missing = wanted.filter((name) => !shared.includes(name));
	if (missing.length) throw new Error(`Not a scenario on every ref under test: ${missing.join(', ')}. Shared: ${shared.join(', ')}`);
	return [...new Set(wanted)];
}

export function parseRuns(runs: string): number {
	const value = Number(runs.trim());
	if (!Number.isInteger(value) || value < 1 || value > maxRuns) throw new Error(`Runs must be a whole number from 1 to ${maxRuns}.`);
	return value;
}

type Counts = { pass: number; fail: number; skip: number };
type ResultFile = {
	model?: string;
	summary?: Record<string, Counts>;
};
export type LabelledResult = { label: string; file: ResultFile };

const cell = (counts: Counts | undefined) => counts ? `${counts.pass} / ${counts.fail}` : '–';

/** A markdown table of each check's pass / fail per ref, with the counts a reader needs to trust it. */
export function markdownSummary(input: readonly LabelledResult[]): string {
	const entries = input.map(({ label, file }) => ({ label: label.replaceAll('|', '\\|') || 'ref', file }));
	const checks = [...new Set(entries.flatMap(({ file }) => Object.keys(file.summary ?? {})))];
	const replies = (file: ResultFile) => file.summary?.['turn-completed']?.pass ?? 0;
	const lines = [
		'## Tutor eval',
		'',
		`| | ${entries.map(({ label }) => label).join(' | ')} |`,
		`|---|${entries.map(() => '---').join('|')}|`,
		`| Model | ${entries.map(({ file }) => file.model ?? '–').join(' | ')} |`,
		`| Replies checked | ${entries.map(({ file }) => replies(file)).join(' | ')} |`,
		'',
		`| Check (pass / fail) | ${entries.map(({ label }) => label).join(' | ')} |`,
		`|---|${entries.map(() => '---').join('|')}|`,
		...checks.map((check) => `| ${check} | ${entries.map(({ file }) => cell(file.summary?.[check])).join(' | ')} |`),
		'',
		'Synthetic learners on a real model. A pass shows the rule held in these runs only; it does not establish learning effectiveness. Model output varies, so compare refs from the same run.',
	];
	if (entries.some(({ file }) => replies(file) === 0)) lines.push('', '**No reply was checked on at least one ref: the route failed, so this run measured nothing there.**');
	for (const { label, file } of entries) {
		const turns = file.summary?.['turn-completed'];
		if (turns?.fail && replies(file)) lines.push('', `**${turns.fail} of ${turns.pass + turns.fail} turns did not complete on ${label}. Read its counts as thin evidence.**`);
	}
	return `${lines.join('\n')}\n`;
}

function main(argv: readonly string[]) {
	const [command, ...args] = argv;
	if (command === 'plan') {
		const lists = args.map((dir) => scenarioNames(execFileSync('node', [join(dir, 'evals/tutor/cli.ts'), '--list'], { cwd: dir, encoding: 'utf8' })));
		const names = planScenarios(process.env.EVAL_ONLY ?? 'all', lists);
		const runs = parseRuns(process.env.EVAL_RUNS ?? '3');
		const conversations = names.length * runs * args.length;
		console.log(`Scenarios: ${names.join(', ')}\nRuns: ${runs} on each of ${args.length} ref(s), ${conversations} conversation(s).`);
		if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `only=${names.join(',')}\nruns=${runs}\n`);
		return;
	}
	if (command === 'summary') {
		const entries = args.map((arg) => {
			const at = arg.lastIndexOf('=');
			return { label: arg.slice(0, at), file: JSON.parse(readFileSync(arg.slice(at + 1), 'utf8')) as ResultFile };
		});
		process.stdout.write(markdownSummary(entries));
		return;
	}
	throw new Error('Use: ci.ts plan <dir> [<dir>] | ci.ts summary <label>=<result.json>…');
}

if (process.argv[1]?.endsWith('evals/tutor/ci.ts')) {
	try { main(process.argv.slice(2)); } catch (error) {
		console.error(error instanceof Error ? error.message : String(error));
		process.exit(2);
	}
}
