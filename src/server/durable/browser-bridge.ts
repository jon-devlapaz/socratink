import type { Hono } from 'hono';
import { learnerMessageLengthError } from '../../config/chat-message.ts';
import { sessionFromContext } from '../session.ts';
import type { Engine, ModelSelection } from './contract.ts';
import { DurableBusyError } from './engine.ts';
import { conversationEvents } from './browser-sse.ts';
import { project } from './browser-projection.ts';
import { chatModelHeader } from '../../config/chat-model.ts';
import { chatAutoModelHeader } from '../../config/chat-auto.ts';
import { InferenceUnavailableError } from '../../inference/index.ts';

export function mountBrowserBridge(app: Hono, engine: Engine, select: (userId: string, requested?: string, requestedAuto?: string) => Promise<ModelSelection>) {
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
		return c.json({ submissionId }, 202);
	});
	app.post(`${path}/abort`, async (c) => {
		const id = c.req.param('id');
		const aborted = (await engine.snapshot(id)).submissions.some((s) => !s.outcome);
		await engine.abort(id);
		return c.json({ aborted });
	});
	app.get(`${path}/events`, (c) => new Response(conversationEvents(engine, c.req.param('id'), c.req.raw.signal), {
		headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store', 'X-Accel-Buffering': 'no' },
	}));
	app.get(path, async (c) => {
		const { sourceRevision: _, ...snapshot } = project(c.req.param('id'), await engine.snapshot(c.req.param('id')));
		c.header('Cache-Control', 'no-store');
		return c.json(snapshot);
	});
}
