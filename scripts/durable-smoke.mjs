import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { mintSessionFixture } from './session-fixture.mjs';
import { appFactory, clientFor, gate, sendText, startFixture, storeKey, until, userMessages } from './durable-smoke-support.mjs';
import { verifyDurableBrowser } from './durable-browser-smoke.mjs';

// Failure cases: default still Flue; reasoning/tool events missing or replayed;
// observation loss duplicates a learner; cancellation fails to settle; process
// death loses an accepted turn; metadata/assistance is lost after reload.
const out = resolve(process.env.DURABLE_SMOKE_OUT || '.cache/durable-smoke');
const report = { ok: false, syntheticOnly: true, checks: [], node: process.version,
	limits: ['Fake model/OAuth transport only; this does not measure model quality or learning.',
		'SQLite process restart here; the PostgreSQL suite separately checks two live processes.'] };
let stage = 'setup';
let fixture;
let apps;
try {
	fixture = await startFixture();
	apps = appFactory(fixture);
	let app = await apps.start();
	stage = 'default-harness';
	assert.deepEqual(await (await fetch(`${app.origin}/healthz`)).json(), { status: 'ok', inference: 'local' });
	report.checks.push('Normal built server reports its inference route.');
	const session = await mintSessionFixture(app.origin);
	const key = 'sk-synthetic-durable-http-learner';
	fixture.secrets.set(key, 'learner');
	await storeKey(app, session, key);
	const client = clientFor(app, session, 'events');
	stage = 'live-events-and-reattach';
	const reasoning = 'I am inspecting the evidence before giving this synthetic hint.';
	const text = 'An explicit synthetic hint.';
	const reveal = { kind: 'hint', target: 'Synthetic recovery action' };
	const held = gate();
	fixture.plan('DURABLE_EVENTS', { reasoning, afterReasoning: held,
		tools: [{ name: 'mark_reveal', arguments: reveal }] }, { text });
	const admission = await client.send({ message: { kind: 'user', body: 'DURABLE_EVENTS' } });
	const events = [];
	const dropped = new AbortController();
	const firstRead = client.read(admission, { signal: dropped.signal, onEvent: (event) => events.push(event) })
		.then(() => ({ unexpectedlyCompleted: true }), (error) => ({ error }));
	await until(() => events.some((event) => event.type === 'message-delta' && event.kind === 'reasoning' && event.delta === reasoning),
		'live reasoning before provider completion');
	assert.equal(fixture.count('DURABLE_EVENTS'), 1);
	assert.equal(userMessages(await client.history()).length, 1);
	dropped.abort();
	assert.ok((await firstRead).error, 'dropping observation should interrupt only that read');
	const reattachedEvents = [];
	const secondRead = client.read(admission.submissionId, { signal: AbortSignal.timeout(20_000),
		onEvent: (event) => reattachedEvents.push(event) });
	held.release();
	const reply = await secondRead;
	assert.equal(reply.text, text);
	assert.deepEqual(reply.data.reveal, [reveal]);
	assert.equal(fixture.count('DURABLE_EVENTS'), 2, 'one tool step and one final step, with no resubmission');
	const allEvents = [...events, ...reattachedEvents];
	assert.ok(allEvents.some((event) => event.type === 'tool-input' && event.toolName === 'mark_reveal'));
	assert.ok(allEvents.some((event) => event.type === 'tool-output'));
	for (const collection of [events, reattachedEvents]) {
		const positions = collection.filter((event) => event.position).map((event) => JSON.stringify(event.position));
		assert.equal(new Set(positions).size, positions.length, 'one SDK reader must never deliver a position twice');
	}
	const history = await client.history();
	assert.equal(userMessages(history).length, 1);
	const assistant = history.messages.findLast((message) => message.role === 'assistant');
	assert.equal(assistant.parts.filter((part) => part.type === 'text').map((part) => part.text).join(''), text);
	assert.deepEqual(assistant.metadata.socratink, { routedModel: 'synthetic/routed-model', fallbackAttempts: 1 });
	assert.equal(fixture.calls[0].path, '/v1/responses');
	report.checks.push('Native Responses reasoning and tool events reach the existing SDK live; lost read reattaches without duplicate learner input.');
	report.checks.push('Reply preserves reveal provenance and routed-model/fallback metadata, with reasoning kept out of answer text.');
	stage = 'restart-history';
	await app.stop();
	app = await apps.start({ directory: app.directory });
	assert.deepEqual(await clientFor(app, session, 'events').history(), history);
	assert.equal(apps.logs.join('').includes('socratink_failure'), false, 'success, read loss, and completed restart must not log a failure');
	report.checks.push('Process restart preserves exact SDK history, structured parts, metadata, and signed session.');
	stage = 'crash-recovery';
	const crashGate = gate();
	fixture.plan('DURABLE_CRASH', { before: crashGate, text: 'Uncheckpointed reply.' }, { text: 'Recovered accepted reply.' });
	const crashClient = clientFor(app, session, 'crash');
	const crashAdmission = await crashClient.send({ message: { kind: 'user', body: 'DURABLE_CRASH' } });
	await until(() => fixture.count('DURABLE_CRASH') === 1, 'first provider call before process death');
	await app.stop('SIGKILL');
	app = await apps.start({ directory: app.directory });
	const recovered = clientFor(app, session, 'crash');
	assert.equal((await recovered.read(crashAdmission.submissionId, { signal: AbortSignal.timeout(25_000) })).text,
		'Recovered accepted reply.');
	assert.equal(userMessages(await recovered.history()).length, 1);
	assert.equal(fixture.count('DURABLE_CRASH'), 2, 'uncheckpointed provider call may repeat; learner admission must not');
	crashGate.release();
	report.checks.push('SIGKILL during provider work recovers the same accepted submission with one learner record; two provider calls are reported.');
	stage = 'cancellation';
	const cancelGate = gate();
	fixture.plan('DURABLE_CANCEL', { before: cancelGate, text: 'Must not become an answer.' });
	const cancel = clientFor(app, session, 'cancel');
	const cancelled = await cancel.send({ message: { kind: 'user', body: 'DURABLE_CANCEL' } });
	await until(() => fixture.count('DURABLE_CANCEL') === 1, 'cancelled provider call');
	assert.equal((await cancel.abort()).aborted, true);
	await assert.rejects(cancel.read(cancelled, { signal: AbortSignal.timeout(15_000) }),
		(error) => error.failure === 'aborted');
	const cancelledHistory = await cancel.history();
	assert.equal(cancelledHistory.settlements.at(-1).outcome, 'aborted');
	assert.equal(JSON.stringify(cancelledHistory).includes('Must not become an answer.'), false);
	cancelGate.release();
	report.checks.push('Cancellation durably settles aborted and does not become an assistant answer.');
	stage = 'browser';
	report.browser = await verifyDurableBrowser({ app, session, fixture, out: join(out, 'browser') });
	report.checks.push('Unchanged browser displays pending reasoning, reloads an accepted turn without resending, and restores its completed answer.');
	assert.deepEqual(fixture.errors, []);
	const failureRecords = apps.logs.join('').split('\n').filter((line) => line.includes('socratink_failure'))
		.map((line) => JSON.parse(line.slice(line.indexOf('{'))));
	assert.deepEqual(failureRecords, [{ event: 'socratink_failure', category: 'submission_recovery' }],
		'the induced process death produces one payload-free recovery signal; ordinary success and cancellation produce none');
	report.failureRecords = failureRecords;
	report.ok = true;
} catch (error) {
	report.failure = { stage, message: apps?.redact(error.stack ?? error) ?? String(error) };
	process.exitCode = 1;
} finally {
	await apps?.stop();
	await fixture?.stop();
	report.providerCalls = fixture?.calls ?? [];
	report.fixtureErrors = fixture?.errors ?? [];
	await mkdir(out, { recursive: true });
	await writeFile(join(out, 'proof.json'), `${JSON.stringify(report, null, 2)}\n`);
	await writeFile(join(out, 'app.log'), apps?.logs.join('') ?? '');
	console.log(JSON.stringify({ ok: report.ok, checks: report.checks.length, stage, evidence: out }));
	if (report.failure) console.error(report.failure.message);
}
