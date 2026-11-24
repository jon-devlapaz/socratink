import assert from 'node:assert/strict';
import test from 'node:test';
import { livePlan } from './live.ts';

const scenarios = [{ name: 'a' }, { name: 'b', maxTurns: 8 }];

test('a paid run needs --only, so it covers only the touched scenarios', () => {
	assert.throws(() => livePlan({}, scenarios, 'darwin'), /--only/);
	assert.throws(() => livePlan({ only: ' , ' }, scenarios, 'darwin'), /--only/);
	assert.throws(() => livePlan({ only: 'a,nope' }, scenarios, 'darwin'), /Unknown scenario: nope/);
	assert.throws(() => livePlan({ only: 'a', runs: '0' }, scenarios, 'darwin'), /--runs/);
	assert.throws(() => livePlan({ only: 'a', runs: '1.5' }, scenarios, 'darwin'), /--runs/);
});

test('the scope counts conversations and the most learner turns', () => {
	const plan = livePlan({ only: 'a, b', runs: '3' }, scenarios, 'linux');
	assert.equal(plan.scope[0], 'Paid run: 2 scenario(s) x 3 run(s) = 6 conversation(s), at most 42 learner turns.');
	assert.equal(plan.scope[1], 'Scenarios: a, b');
});

test('on a Mac the eval runs under caffeinate with the same --only and --runs', () => {
	const plan = livePlan({ only: 'b' }, scenarios, 'darwin', "Now drawing from 'AC Power'");
	assert.equal(plan.command, 'caffeinate');
	assert.deepEqual(plan.args, ['-is', 'node', 'evals/tutor/cli.ts', '--live', '--only', 'b', '--runs', '1']);
	assert.ok(!plan.scope.some((line) => line.includes('battery')));
});

test('on battery the scope says to plug in', () => {
	const plan = livePlan({ only: 'a' }, scenarios, 'darwin', "Now drawing from 'Battery Power'");
	assert.ok(plan.scope.some((line) => line.startsWith('On battery: plug in.')));
});

test('without caffeinate it runs node directly and says to keep the machine awake', () => {
	const plan = livePlan({ only: 'a' }, scenarios, 'linux');
	assert.equal(plan.command, 'node');
	assert.deepEqual(plan.args, ['evals/tutor/cli.ts', '--live', '--only', 'a', '--runs', '1']);
	assert.ok(plan.scope.some((line) => line.includes('keep this machine awake')));
});
