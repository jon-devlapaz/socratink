import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { dispatchArgs, gitIn, refProblem } from './remote.ts';

// Failure cases: an unpushed branch is evaluated as its older GitHub copy, a
// typo'd ref runs nothing after approval, an input becomes shell text, and a
// run compares a ref with itself.
test('the workflow inputs are separate arguments, bounded and checked before anything starts', () => {
	assert.deepEqual(dispatchArgs({ ref: 'fix', compare: 'main', only: 'a,b', runs: '3' }),
		['workflow', 'run', 'tutor-eval.yml', '--ref', 'main', '-f', 'ref=fix', '-f', 'compare=main', '-f', 'only=a,b', '-f', 'runs=3']);
	assert.equal(dispatchArgs({ ref: 'fix', compare: '', only: ' ', runs: '1' }).at(-3), 'only=all');
	assert.throws(() => dispatchArgs({ ref: 'fix', compare: '', only: 'all', runs: '9' }), /1 to 5/);
	assert.throws(() => dispatchArgs({ ref: 'main', compare: 'main', only: 'all', runs: '3' }), /must differ/);
	assert.throws(() => dispatchArgs({ ref: ' ', compare: '', only: 'all', runs: '3' }), /--ref/);
});

test('a ref must be on GitHub, and the check says what to do when it cannot tell', () => {
	const repo = (answers: Record<string, string | undefined>) => (args: string[]) => answers[args.join(' ')];
	const listed = { 'ls-remote origin refs/heads/fix refs/tags/fix': 'aaa\trefs/heads/fix\n' };
	assert.match(refProblem('fix', repo({ 'ls-remote origin refs/heads/fix refs/tags/fix': '' })) ?? '',
		/not on GitHub yet\. Push it first: git push -u origin fix/);
	assert.match(refProblem('fix', repo({})) ?? '', /Could not reach GitHub to check fix/, 'an unreachable GitHub is not "push it"');
	assert.equal(refProblem('fix', repo({ ...listed, 'rev-parse --verify --quiet refs/heads/fix': 'aaa\n' })), undefined);
	assert.equal(refProblem('fix', repo(listed)), undefined, 'no local branch: GitHub\'s copy runs');
	assert.match(refProblem('fix', repo({ ...listed, 'rev-parse --verify --quiet refs/heads/fix': 'bbb\n' })) ?? '',
		/Could not get GitHub's copy of fix to compare with yours\. Run git fetch origin/, 'a failed fetch is not "push it"');
	assert.match(refProblem('abc1234', repo({ 'branch -r --contains abc1234': '' })) ?? '', /Commit abc1234 is not on GitHub/);
	assert.equal(refProblem('abc1234', repo({ 'branch -r --contains abc1234': '  origin/main\n' })), undefined);
});

test('a branch only behind a GitHub commit it never fetched runs; unpublished local commits are refused', () => {
	const root = mkdtempSync(join(tmpdir(), 'tutor-eval-ref-'));
	try {
		const run = (cwd: string, ...args: string[]) => execFileSync('git',
			['-c', 'user.name=Eval Test', '-c', 'user.email=eval@example.invalid', '-c', 'commit.gpgsign=false', ...args],
			{ cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
		const commit = (cwd: string, text: string) => {
			writeFileSync(join(cwd, 'file.txt'), text);
			run(cwd, 'add', 'file.txt');
			run(cwd, 'commit', '-q', '-m', text);
		};
		const remote = join(root, 'remote.git');
		const ahead = join(root, 'ahead');
		const behind = join(root, 'behind');
		run(root, 'init', '-q', '--bare', '--initial-branch=main', remote);
		run(root, 'clone', '-q', remote, ahead);
		commit(ahead, 'one');
		run(ahead, 'push', '-q', 'origin', 'HEAD:main');
		run(root, 'clone', '-q', remote, behind);
		commit(ahead, 'two');
		run(ahead, 'push', '-q', 'origin', 'HEAD:main');
		const newest = run(ahead, 'rev-parse', 'HEAD').trim();

		const git = gitIn(behind);
		assert.equal(git(['cat-file', '-e', `${newest}^{commit}`]), undefined, 'the second clone has never fetched the new commit');
		assert.equal(refProblem('main', git), undefined);

		commit(behind, 'local only');
		assert.match(refProblem('main', git) ?? '', /local main has commits GitHub does not have\. Push it first/);
	} finally {
		rmSync(root, { recursive: true, force: true });
	}
});
