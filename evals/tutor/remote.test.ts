import assert from 'node:assert/strict';
import test from 'node:test';
import { dispatchArgs, refProblem } from './remote.ts';

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

test('a ref must be on GitHub and hold every local commit', () => {
	const repo = (answers: Record<string, string | undefined>) => (args: string[]) => answers[args.join(' ')];
	assert.match(refProblem('fix', repo({})) ?? '', /not on GitHub yet\. Push it first: git push -u origin fix/);
	assert.match(refProblem('fix', repo({
		'ls-remote origin refs/heads/fix refs/tags/fix': 'aaa\trefs/heads/fix\n',
		'rev-parse --verify --quiet refs/heads/fix': 'bbb\n',
	})) ?? '', /has commits GitHub does not have/);
	assert.equal(refProblem('main', repo({
		'ls-remote origin refs/heads/main refs/tags/main': 'aaa\trefs/heads/main\n',
		'rev-parse --verify --quiet refs/heads/main': 'bbb\n',
		'merge-base --is-ancestor bbb aaa': '',
	})), undefined, 'a local copy that is only behind GitHub runs GitHub\'s');
	assert.equal(refProblem('fix', repo({
		'ls-remote origin refs/heads/fix refs/tags/fix': 'aaa\trefs/heads/fix\n',
		'rev-parse --verify --quiet refs/heads/fix': 'aaa\n',
	})), undefined);
	assert.match(refProblem('abc1234', repo({ 'branch -r --contains abc1234': '' })) ?? '', /Commit abc1234 is not on GitHub/);
	assert.equal(refProblem('abc1234', repo({ 'branch -r --contains abc1234': '  origin/main\n' })), undefined);
});
