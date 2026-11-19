import type { Hono } from 'hono';
import { feedback, validFeedbackMessage } from '../config/feedback.ts';
import { readFeedbackToken } from '../config/feedback-server.ts';
import type { AuthDb } from './auth-db.ts';
import { readSession } from './session.ts';

export function mountFeedbackRoute(app: Hono, options: { secret: string; authDb: AuthDb }) {
	app.post(feedback.route, async (context) => {
		const token = readFeedbackToken();
		if (!token) return context.body(null, 404);
		if (context.req.header('content-type')?.split(';')[0] !== 'application/json') return context.body(null, 415);
		const session = await readSession(context, options.secret, options.authDb);
		if (session?.kind !== 'registered') return context.body(null, 401);
		const user = await options.authDb.findUserById(session.userId);
		if (!user) return context.body(null, 401);

		const body = await context.req.json().catch(() => null);
		const submissionId = body?.submission_id;
		const message = typeof body?.message === 'string' ? body.message.trim() : '';
		const name = typeof body?.name === 'string' ? body.name.trim() : '';
		if (typeof submissionId !== 'string' || !/^[a-f0-9]{8}-[a-f0-9]{4}-7[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(submissionId)
			|| !validFeedbackMessage(message) || name.length > 256) return context.body(null, 400);

		const form = new FormData();
		const url = new URL(context.req.url).origin;
		form.set('payload', JSON.stringify({ submission_id: submissionId, message, url }));
		form.set('author', JSON.stringify({ user_id: user.id, ...(name ? { name } : {}), email: user.email }));
		try {
			const response = await fetch(feedback.ingest, {
				method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form,
				redirect: 'error', signal: AbortSignal.timeout(feedback.timeoutMs - 1_000),
			});
			if (response.status === 202) {
				const result = await response.json();
				return typeof result?.id === 'string' && result.id ? context.json({ id: result.id }, 202) : context.body(null, 502);
			}
			const retryAfter = response.headers.get('Retry-After');
			if (retryAfter) context.header('Retry-After', retryAfter);
			await response.body?.cancel();
			if (response.status === 409 || response.status === 429) return context.body(null, response.status);
			return context.body(null, response.status >= 500 ? 502 : 400);
		} catch {
			return context.body(null, 502);
		}
	});
}
