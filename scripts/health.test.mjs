import assert from 'node:assert/strict';
import test from 'node:test';
import { Hono } from 'hono';
import { createApp } from '../src/app-factory.ts';

test('/healthz fails while the operator model is unconfigured, so the monitor alerts before a learner does', async () => {
	const health = (status) => createApp(new Hono(), { operatorStatus: () => status }).request('/healthz');
	const unconfigured = await health({ state: 'unconfigured' });
	assert.equal(unconfigured.status, 503);
	assert.deepEqual(await unconfigured.json(), { status: 'unconfigured', inference: 'unconfigured' });
	const ready = await health({ state: 'ready', route: 'gateway' });
	assert.equal(ready.status, 200);
	assert.deepEqual(await ready.json(), { status: 'ok', inference: 'gateway' });
});
