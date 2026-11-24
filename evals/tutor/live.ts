// One-step paid tutor eval: `pnpm eval:tutor:live --only a,b [--runs 3] [--dry-run]`.
// It prints the cost scope, keeps a Mac awake with caffeinate, and runs
// `pnpm eval:tutor --live` with the same --only and --runs.
//
// This calls a paid model. It does not replace Jon's go-ahead: ask first, as AGENTS.md says.
// --dry-run prints the scope and the command without calling a model.
import { execFileSync, spawn } from 'node:child_process';
import { parseArgs } from 'node:util';
import type { Scenario } from './scenarios.ts';

export type LivePlan = { scope: string[]; command: string; args: string[] };
type Options = { only?: string; runs?: string };

/** What a paid run will cost and the command that runs it. Throws when the request is not one
 * narrow paid run: no --only, an unknown name, or a bad --runs. */
export function livePlan(options: Options, scenarios: readonly Pick<Scenario, 'name' | 'maxTurns'>[], platform: NodeJS.Platform,
	power?: string): LivePlan {
	const names = options.only?.split(',').map((name) => name.trim()).filter(Boolean) ?? [];
	if (!names.length) throw new Error('Name the touched scenarios with --only a,b. Paid runs cover only those. See them with `pnpm eval:tutor --list`.');
	const picked = names.map((name) => scenarios.find((s) => s.name === name));
	const unknown = names.filter((_, i) => !picked[i]);
	if (unknown.length) throw new Error(`Unknown scenario: ${unknown.join(', ')}. Known: ${scenarios.map((s) => s.name).join(', ')}`);
	const runs = Number(options.runs ?? '1');
	if (!Number.isInteger(runs) || runs < 1 || runs > 20) throw new Error('--runs must be a whole number from 1 to 20.');

	const turns = picked.reduce((sum, s) => sum + (s?.maxTurns ?? 6), 0) * runs;
	const scope = [`Paid run: ${names.length} scenario(s) x ${runs} run(s) = ${names.length * runs} conversation(s), at most ${turns} learner turns.`,
		`Scenarios: ${names.join(', ')}`];
	const evalArgs = ['evals/tutor/cli.ts', '--live', '--only', names.join(','), '--runs', String(runs)];
	if (platform !== 'darwin') {
		scope.push('No caffeinate here: keep this machine awake until the run ends.');
		return { scope, command: 'node', args: evalArgs };
	}
	if (power?.includes('Battery Power')) scope.push('On battery: plug in. A sleeping or empty laptop stops the run.');
	// -i stops idle sleep; -s also stops system sleep while on AC power.
	return { scope, command: 'caffeinate', args: ['-is', 'node', ...evalArgs] };
}

async function main() {
	const { values } = parseArgs({ options: { only: { type: 'string' }, runs: { type: 'string' }, 'dry-run': { type: 'boolean', default: false } } });
	const { scenarios } = await import('./scenarios.ts');
	const power = process.platform === 'darwin' ? execFileSync('pmset', ['-g', 'batt'], { encoding: 'utf8' }) : undefined;
	let plan: LivePlan;
	try {
		plan = livePlan(values, scenarios, process.platform, power);
	} catch (error) {
		console.error((error as Error).message);
		process.exit(2);
	}
	for (const line of plan.scope) console.log(line);
	console.log(`Command: ${[plan.command, ...plan.args].join(' ')}\n`);
	if (values['dry-run']) return;
	const child = spawn(plan.command, plan.args, { stdio: 'inherit' });
	child.on('exit', (code, signal) => process.exit(code ?? (signal ? 1 : 0)));
}

if (process.argv[1]?.endsWith('evals/tutor/live.ts')) await main();
