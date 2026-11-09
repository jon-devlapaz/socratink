import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';
import { startDisposablePostgres } from '../../../scripts/durable-postgres-fixture.mjs';
import { openBrowserStream } from './browser-stream.ts';
import { openPostgresBrowserStream } from './browser-postgres.ts';
import { project } from './browser-projection.ts';
import { modelRouteFromMetadata } from '../../config/model-route.ts';
import type { BrowserStream } from './browser-events.ts';

for (const dialect of ['sqlite', ...(process.env.DURABLE_TEST_POSTGRES === '1' ? ['postgres'] : [])]) {
	test(`${dialect}: stale reads cannot pair old history with a newer cursor; update reads stop at their announced cursor`, async () => {
		const directory = await mkdtemp(join(tmpdir(), 'socratink-browser-journal-'));
		const postgres = dialect === 'postgres' ? await startDisposablePostgres() : undefined;
		const open = () => postgres ? openPostgresBrowserStream(postgres.connectionString) : openBrowserStream(join(directory, 'browser.sqlite'));
		let first: BrowserStream | undefined;
		let second: BrowserStream | undefined;
		try {
			const opened = await Promise.allSettled([open(), open()]);
			if (opened[0]!.status === 'fulfilled') first = opened[0]!.value;
			if (opened[1]!.status === 'fulfilled') second = opened[1]!.value;
			for (const result of opened) if (result.status === 'rejected') throw result.reason;
			assert(first && second);
			const partial = project('learner:conversation', { revision: 1, submissions: [{ id: 'admitted', text: 'Question' }], messages: [
				{ role: 'user', submissionId: 'admitted', text: 'Question' },
				{ role: 'assistant', submissionId: 'admitted', text: 'Par', reasoning: 'Think' },
			] });
			const completed = project('learner:conversation', { revision: 2, submissions: [{ id: 'admitted', text: 'Question', outcome: 'completed' }], messages: [
				{ role: 'user', submissionId: 'admitted', text: 'Question' },
				{ role: 'assistant', submissionId: 'admitted', text: 'Partial answer.', reasoning: 'Thinking done.',
					data: { reveal: [{ kind: 'hint' }] }, metadata: { socratink: { routedModel: 'actual/model' } } },
			] });
			const beginning = await first.sync(partial);
			const settled = await second.sync(completed);
			const late = await first.sync(partial);
			assert.equal(late.offset, settled.offset);
			assert.deepEqual(late.snapshot, settled.snapshot, 'late history uses the canonical snapshot matching its cursor');
			assert.equal(late.snapshot.settlements[0]?.outcome, 'completed');
			assert.equal(late.snapshot.offset, late.offset);
			const earlyEvents = await first.read(partial.conversationId, '-1', beginning.offset);
			assert(earlyEvents.every((event) => 'position' in event && event.position.batch <= Number(beginning.offset)));
			assert(!earlyEvents.some((event) => event.type === 'submission-settled'));
			const finalEvents = await second.read(partial.conversationId, beginning.offset, settled.offset);
			assert.equal(finalEvents.filter((event) => event.type === 'submission-settled').length, 1);
			const reset = finalEvents.find((event) => event.type === 'conversation-reset');
			assert(reset?.type === 'conversation-reset');
			assert.deepEqual(reset.snapshot, settled.snapshot, 'SDK observe receives user, data, metadata and completed parts');
			assert.equal(modelRouteFromMetadata(reset.snapshot.messages[1]?.metadata)?.routedModel, 'actual/model');
			await first.close();
			first = await open();
			assert.deepEqual(await first.sync(partial), settled, 'another process after restart cannot rewind the snapshot');
			assert.deepEqual(await first.read(partial.conversationId, settled.offset, settled.offset), []);
		} finally {
			await first?.close();
			await second?.close();
			await postgres?.stop();
			await rm(directory, { recursive: true, force: true });
		}
	});
}
