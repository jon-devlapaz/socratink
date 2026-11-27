import assert from 'node:assert/strict';
import test from 'node:test';
import { markdownSummary, maxRuns, parseRuns, planScenarios, scenarioNames } from './ci.ts';

// Failure cases: a ref under test lacks a named scenario and the run fails late,
// "all" runs scenarios one ref cannot run, an unbounded --runs, and a summary
// that hides that a route measured nothing.
const list = [
	'no-choice-position: After a card answer, match choice letters.',
	'first-turn-diagnostic (#163): A first message starts with one question.',
	'',
	'This eval calls the real tutor model. Add --live to run it.',
].join('\n');

test('scenario names are read from the eval list output', () => {
	assert.deepEqual(scenarioNames(list), ['no-choice-position', 'first-turn-diagnostic']);
});

test('"all" runs the scenarios every ref shares; named ones must exist on every ref', () => {
	const candidate = ['a', 'b', 'new-one'];
	const base = ['a', 'b'];
	assert.deepEqual(planScenarios('all', [candidate, base]), ['a', 'b']);
	assert.deepEqual(planScenarios(' ALL ', [candidate]), ['a', 'b', 'new-one']);
	assert.deepEqual(planScenarios('b, a, b', [candidate, base]), ['b', 'a']);
	assert.throws(() => planScenarios('new-one', [candidate, base]), /Not a scenario on every ref under test: new-one/);
	assert.throws(() => planScenarios(' , ', [candidate]), /at least one scenario/);
});

test('runs are bounded so one approval cannot buy an unbounded paid run', () => {
	assert.equal(parseRuns('3'), 3);
	for (const bad of ['0', String(maxRuns + 1), '1.5', 'three', '']) assert.throws(() => parseRuns(bad), /whole number/);
});

test('the summary compares refs check by check and says when a route measured nothing', () => {
	const candidate = { model: 'm', summary: { 'turn-completed': { pass: 9, fail: 0, skip: 0 }, 'one-question': { pass: 9, fail: 0, skip: 0 } } };
	const base = { model: 'm', summary: { 'turn-completed': { pass: 9, fail: 0, skip: 0 }, 'one-question': { pass: 7, fail: 2, skip: 0 } } };
	const text = markdownSummary([{ label: 'candidate', file: candidate }, { label: 'base', file: base }]);
	assert.match(text, /\| one-question \| 9 \/ 0 \| 7 \/ 2 \|/);
	assert.doesNotMatch(text, /measured nothing|did not complete/);
	const thin = markdownSummary([{ label: 'fix', file: { summary: { 'turn-completed': { pass: 7, fail: 21, skip: 0 } } } }]);
	assert.match(thin, /21 of 28 turns did not complete on fix/);
	const empty = markdownSummary([{ label: 'candidate', file: { summary: { 'turn-completed': { pass: 0, fail: 24, skip: 0 } } } }]);
	assert.match(empty, /measured nothing/);
});
