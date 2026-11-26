// `pnpm eval:tutor:ci [--ref <ref>] [--compare <ref>] [--only a,b|all] [--runs 3] [--no-wait]`
//
// Starts the `Tutor eval` GitHub workflow, which runs the paid eval on the production
// model route with a budgeted key that never leaves GitHub. The run waits for approval
// in the `tutor-eval` environment; this prints the link. It then waits, downloads the
// transcripts, and prints the comparison table. --ref defaults to the current branch.
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { parseArgs } from 'node:util';
import { parseRuns } from './ci.ts';

export const workflowFile = 'tutor-eval.yml';
export type RemoteOptions = { ref: string; compare: string; only: string; runs: string };

/** The `gh workflow run` arguments. Every input is passed as its own argument, never as shell text. */
export function dispatchArgs(options: RemoteOptions): string[] {
	const runs = parseRuns(options.runs);
	const only = options.only.trim() || 'all';
	if (!options.ref.trim()) throw new Error('Name the ref to evaluate with --ref.');
	if (options.compare.trim() === options.ref.trim()) throw new Error('--compare must differ from --ref.');
	return ['workflow', 'run', workflowFile, '--ref', 'main',
		'-f', `ref=${options.ref.trim()}`, '-f', `compare=${options.compare.trim()}`, '-f', `only=${only}`, '-f', `runs=${runs}`];
}

/** Why a ref cannot be evaluated in GitHub as it is here, or undefined. */
export function refProblem(ref: string, git: (args: string[]) => string | undefined): string | undefined {
	if (/^[0-9a-f]{7,40}$/iu.test(ref)) {
		return git(['branch', '-r', '--contains', ref])?.trim() ? undefined : `Commit ${ref} is not on GitHub yet. Push it first.`;
	}
	const remote = git(['ls-remote', 'origin', `refs/heads/${ref}`, `refs/tags/${ref}`])?.split(/\s+/u)[0];
	if (!remote) return `${ref} is not on GitHub yet. Push it first: git push -u origin ${ref}`;
	const local = git(['rev-parse', '--verify', '--quiet', `refs/heads/${ref}`])?.trim();
	// A local copy that is only behind GitHub's is fine: GitHub's is what runs.
	const behind = local && git(['merge-base', '--is-ancestor', local, remote]) !== undefined;
	if (local && local !== remote && !behind) return `Your local ${ref} has commits GitHub does not have. Push it first, so the eval tests what you have: git push origin ${ref}`;
	return undefined;
}

function git(args: string[]): string | undefined {
	try { return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }); } catch { return undefined; }
}

function gh(args: string[]): string {
	return execFileSync('gh', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });
}

async function main() {
	const { values } = parseArgs({ options: {
		ref: { type: 'string' }, compare: { type: 'string', default: '' }, only: { type: 'string', default: 'all' },
		runs: { type: 'string', default: '3' }, 'no-wait': { type: 'boolean', default: false },
	} });
	const ref = values.ref ?? git(['rev-parse', '--abbrev-ref', 'HEAD'])?.trim() ?? '';
	const options = { ref, compare: values.compare ?? '', only: values.only ?? 'all', runs: values.runs ?? '3' };
	const args = dispatchArgs(options);
	for (const name of [options.ref, options.compare].filter(Boolean)) {
		const problem = refProblem(name, git);
		if (problem) throw new Error(problem);
	}
	try { gh(['workflow', 'view', workflowFile, '--ref', 'main', '--yaml']); } catch {
		throw new Error('The Tutor eval workflow is not on main yet. Merge .github/workflows/tutor-eval.yml first.');
	}
	const started = Date.now();
	gh(args);
	let run: { databaseId: number; url: string } | undefined;
	for (let attempt = 0; attempt < 20 && !run; attempt += 1) {
		await delay(3_000);
		const runs = JSON.parse(gh(['run', 'list', '--workflow', workflowFile, '--event', 'workflow_dispatch', '--limit', '10',
			'--json', 'databaseId,url,createdAt'])) as { databaseId: number; url: string; createdAt: string }[];
		run = runs.find((candidate) => Date.parse(candidate.createdAt) >= started - 10_000);
	}
	if (!run) throw new Error('The run did not appear. Open the Actions tab and look for "Tutor eval".');
	console.log(`Started: ${run.url}`);
	console.log(`Evaluating ${options.ref}${options.compare ? ` against ${options.compare}` : ''}, scenarios: ${options.only}, runs: ${options.runs}.`);
	console.log('It waits for approval in the tutor-eval environment: open the link and choose "Review deployments", then "Approve and deploy".');
	if (values['no-wait']) return;
	const watched = spawnSync('gh', ['run', 'watch', String(run.databaseId), '--interval', '30', '--exit-status'], { stdio: 'inherit' });
	const directory = join('.cache', 'tutor-eval', `ci-${run.databaseId}`);
	spawnSync('gh', ['run', 'download', String(run.databaseId), '--name', 'tutor-eval-results', '--dir', directory], { stdio: 'inherit' });
	const summary = join(directory, 'summary.md');
	if (existsSync(summary)) console.log(`\n${readFileSync(summary, 'utf8')}\nTranscripts: ${directory}`);
	else console.log(`\nNo summary was produced. See ${run.url}`);
	process.exit(watched.status ?? 1);
}

if (process.argv[1]?.endsWith('evals/tutor/remote.ts')) {
	try { await main(); } catch (error) {
		console.error(error instanceof Error ? error.message : String(error));
		process.exit(2);
	}
}
