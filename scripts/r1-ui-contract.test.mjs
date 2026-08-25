import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const main = await readFile(new URL('../src/ui/main.ts', import.meta.url), 'utf8');
const html = await readFile(new URL('../src/ui/index.html', import.meta.url), 'utf8');

assert.match(main, /get\('r1'\) === '1'/, 'R1 must be explicitly query gated.');
assert.match(main, /if \(isR1Mode\) startR1\(\);\s*else void startChat\(\);/, 'R1 and chat startup must be mutually exclusive.');
assert.match(main, /await import\('@flue\/sdk'\)/, 'Flue must be loaded only inside the chat controller.');
assert.doesNotMatch(main.slice(main.indexOf('function startR1')), /createFlueClient|\/api\/agents\//, 'The R1 controller must not call Flue.');
for (const heading of ['What you demonstrated', 'Help you used', 'What remains uncertain', 'What to check later']) {
	assert.ok(main.includes(heading), `Missing receipt heading: ${heading}`);
}
for (const endpoint of ["'/encounters'", "'/commands'", "method: 'DELETE'"]) {
	assert.ok(main.includes(endpoint) || (endpoint === "'/commands'" && main.includes('/commands`')), `Missing learner endpoint use: ${endpoint}`);
}
assert.match(html, /id="r1-surface"[^>]*hidden/, 'R1 surface must be hidden before query-gated startup.');
assert.match(html, /<h1 id="r1-title">Tool request review<\/h1>/, 'The baseline title must remain neutral.');
const baselineVisibleCopy = [
	html.match(/<header class="r1-header">[\s\S]*?<\/header>/)?.[0] ?? '',
	main.slice(main.indexOf('function conditionsFieldset'), main.indexOf('function receiptSection')),
	main.slice(main.indexOf('function scenarioSection'), main.indexOf('function waiting')),
	main.slice(main.indexOf('function renderStart'), main.indexOf('function render(): void')),
].join('\n');
assert.doesNotMatch(baselineVisibleCopy, /\b(?:validity|authorization|distinction)\b/i, 'Baseline-visible framing must not reveal the target distinction.');
assert.doesNotMatch(`${html}\n${main}`, /you (?:have )?(?:learned|mastered|transferred)|your mastery|score|badge/i, 'UI copy must not make an inflated learner claim.');
assert.doesNotMatch(main, /innerHTML/, 'Server-projected data must not use innerHTML.');
assert.match(main, /`Encounter ID: \$\{view\.encounterId\}`/, 'The learner view must expose the non-secret reviewer handoff ID.');
assert.doesNotMatch(main.slice(main.indexOf("const meta = element('div', 'encounter-meta')"), main.indexOf('root.append(meta)')), /capabilityToken/, 'The visible reviewer handoff must not expose the learner capability token.');
assert.doesNotMatch(main, /sourceClosed\.checked\s*=\s*true/, 'Source-closed must require a deliberate declaration.');
assert.match(main, /blankOption\.value = '';[\s\S]*blankOption\.disabled = true;[\s\S]*blankOption\.selected = true;/, 'Assistance must begin with a neutral blank option.');
assert.match(main, /assistanceText\.required = true;[\s\S]*sourceText\.required = true;/, 'Declaration text must be explicit and required.');
assert.match(main, /\['fixed_feedback_only', 'Only the fixed feedback above'\]/, 'The post condition must distinguish fixed feedback from other help.');
assert.match(main, /observationScope: 'current_page_session'/, 'Browser observations must declare their scope.');
assert.match(main, /Date\.now\(\) - Date\.parse\(current\.openedAt\)/, 'Elapsed time must anchor to the server prompt opening.');
assert.match(main, /view\.state === 'post_open' && view\.currentPrompt && view\.feedback\?\.trim\(\)/, 'The post form must require persisted feedback.');
assert.match(main, /Feedback record unavailable/, 'Missing post feedback must produce a blocking integrity state.');
assert.match(main, /view\.state === 'baseline_open' && !view\.currentPrompt/, 'A missing baseline prompt must block submission.');
assert.match(main, /Prompt record unavailable/, 'Missing baseline prompt must produce a blocking integrity state.');
assert.match(main, /class R1HttpError extends Error/, 'HTTP failures must preserve typed status information.');
assert.doesNotMatch(main.slice(main.indexOf('async function request'), main.indexOf('function button')), /clearCapability\(/, 'The shared request helper must not destroy drafts on 404.');
const refreshSource = main.slice(main.indexOf('async function refresh'), main.indexOf('async function createEncounter'));
assert.match(refreshSource, /error\.status === 403[\s\S]*clearCapability\(\);[\s\S]*renderReady\(\);/, 'Initial refresh must clear a denied stored capability.');
const submissionSource = main.slice(main.indexOf('function submissionForm'), main.indexOf('async function refresh'));
assert.doesNotMatch(submissionSource, /error\.status === 403[\s\S]*clearCapability\(/, 'Submission denial must preserve the draft and stored capability for explicit recovery.');
assert.match(main, /Local record expired/, 'Authenticated expiry must render a purge-only state.');
assert.match(main, /function renderReady\(\): void \{\s*busy = false;\s*render\(\);\s*\}/, 'Transition renders must leave the busy state first.');
assert.ok((main.match(/renderReady\(\)/g) ?? []).length >= 9, 'Success and missing-record transitions must render enabled controls.');

console.log('R1 UI contract passed.');
