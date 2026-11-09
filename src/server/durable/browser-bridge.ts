import { setTimeout as delay } from 'node:timers/promises';
import type { Hono } from 'hono';
import { learnerMessageLengthError } from '../../config/chat-message.ts';
import { sessionFromContext } from '../session.ts';
import type { Engine, ModelSelection } from './contract.ts';
import type { BrowserStream } from './browser-events.ts';
import { DurableBusyError } from './engine.ts';

import { project } from './browser-projection.ts';
import { chatModelHeader } from '../../config/chat-model.ts';
import { chatAutoModelHeader } from '../../config/chat-auto.ts';
import { InferenceUnavailableError } from '../../inference/index.ts';

export function mountBrowserBridge(app: Hono, engine: Engine, select: (userId: string, requested?: string, requestedAuto?: string) => Promise<ModelSelection>, stream: BrowserStream) {
	const path = '/:id';
	app.post(path, async (c) => {
		const message = await c.req.json().catch(() => null);
		if (message?.kind !== 'user' || typeof message.body !== 'string' || !message.body.trim()) {
			return c.json({ error: { type: 'invalid_message', message: 'A learner message is required.' } }, 400);
		}
		const lengthError = learnerMessageLengthError(message.body);
		if (lengthError) return c.json({ error: { type: 'invalid_message', message: lengthError } }, 400);
		const id = c.req.param('id');
		const before = await engine.snapshot(id);
		const { offset } = await stream.sync(project(id, before));
		if (before.submissions.some((s) => !s.outcome)) return c.json({ error: { type: 'busy', message: 'This conversation has pending work.' } }, 409);
		let submissionId: string;
		try {
			const selected = await select(sessionFromContext(c)!.userId, c.req.header(chatModelHeader), c.req.header(chatAutoModelHeader));
			submissionId = await engine.submit(id, message.body, selected);
		} catch (error) {
			if (error instanceof InferenceUnavailableError) {
				return c.json({ error: { type: 'inference_unconfigured', message: 'No model provider is set up yet. Add your own key to start.' } }, 503);
			}
			// A second tab may admit work while model selection is being resolved.
			if (error instanceof DurableBusyError) {
				return c.json({ error: { type: 'busy', message: 'This conversation has pending work.' } }, 409);
			}
			throw error;
		}
		return c.json({ submissionId, streamUrl: new URL(c.req.path, c.req.url).href,
			offset, uid: id }, 202);
	});
	app.post(`${path}/abort`, async (c) => {
		const id = c.req.param('id');
		const aborted = (await engine.snapshot(id)).submissions.some((s) => !s.outcome);
		await engine.abort(id);
		return c.json({ aborted });
	});
	app.on(['GET', 'HEAD'], path, async (c) => {
		const id = c.req.param('id');
		let observed = await stream.sync(project(id, await engine.snapshot(id)));
		c.header('Cache-Control', 'no-store');
		c.header('Stream-Next-Offset', observed.offset);
		c.header('Stream-Up-To-Date', 'true');
		if (c.req.method === 'HEAD') return c.body(null, 200);
		if ((c.req.query('view') ?? 'history') === 'history') return c.json({ ...observed.snapshot, offset: observed.offset });
		const requested = c.req.query('offset') ?? '-1';
		const deadline = Date.now() + 20_000;
		while (observed.offset === requested && Date.now() < deadline && !c.req.raw.signal.aborted) {
			await delay(200);
			observed = await stream.sync(project(id, await engine.snapshot(id)));
		}
		c.header('Stream-Next-Offset', observed.offset);
		// A conversation remains open for later submissions.
		return c.json(await stream.read(id, requested, observed.offset));
	});
}
