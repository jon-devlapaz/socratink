import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

// Guards the paid eval workflow's safety rules, so an edit cannot quietly undo them:
// an input pasted into shell text (script injection), the key handed to a
// dependency install, an unpinned action, or a run without the approval gate.
const workflow = readFileSync(new URL('../../.github/workflows/tutor-eval.yml', import.meta.url), 'utf8');
const steps = workflow.split(/^ {6}- name: /mu).slice(1).map((step) => ({ name: step.split('\n')[0] ?? '', body: step }));

function runScripts(body: string): string[] {
	const lines = body.split('\n');
	const scripts: string[] = [];
	for (const [index, line] of lines.entries()) {
		const match = /^(\s*)run: ?(.*)$/u.exec(line);
		if (!match) continue;
		const indent = match[1]?.length ?? 0;
		if (match[2] && match[2] !== '|') { scripts.push(match[2]); continue; }
		const block: string[] = [];
		for (const next of lines.slice(index + 1)) {
			if (next.trim() && next.search(/\S/u) <= indent) break;
			block.push(next);
		}
		scripts.push(block.join('\n'));
	}
	return scripts;
}

test('no workflow expression is pasted into shell text; inputs arrive as environment variables', () => {
	for (const step of steps) {
		for (const script of runScripts(step.body)) assert.doesNotMatch(script, /\$\{\{/u, `step "${step.name}" pastes an expression into its script`);
	}
});

test('the model key reaches only the doctor and the eval steps, never an install', () => {
	const holders = steps.filter((step) => step.body.includes('secrets.AI_GATEWAY_API_KEY')).map((step) => step.name);
	assert.deepEqual(holders, ['Check the model route (doctor)', 'Run the eval on the ref under test', 'Run the eval on the comparison ref']);
});

test('every action is pinned to a commit, the job waits for the tutor-eval environment, and runs are one at a time', () => {
	const uses = [...workflow.matchAll(/^\s*uses: (\S+)/gmu)].map((match) => match[1] ?? '');
	assert.ok(uses.length > 0);
	for (const action of uses) assert.match(action, /@[0-9a-f]{40}$/u, `${action} is not pinned to a commit`);
	assert.match(workflow, /^ {4}environment: tutor-eval$/mu);
	assert.match(workflow, /^on:\n {2}workflow_dispatch:/mu, 'the paid run starts only by hand');
	assert.match(workflow, /^ {2}group: tutor-eval$/mu);
	assert.match(workflow, /^permissions:\n {2}contents: read$/mu);
});
