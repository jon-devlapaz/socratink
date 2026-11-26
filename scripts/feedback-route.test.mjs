import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { feedbackSubmissionId } from '../src/ui/client/random-id.ts';
import { appFactory, oauth, startFixture } from './durable-smoke-support.mjs';
import { mintSessionFixture } from './session-fixture.mjs';

const token = 'synthetic-feedback-token';
const reports = new Map();
let fixture;
let apps;
let app;
let session;

async function receiveFeedback(request, response) {
	const form = await new Response(request, { headers: request.headers }).formData();
	const payload = JSON.parse(form.get('payload'));
	const plan = reports.get(payload.submission_id);
	assert.ok(plan, 'The app forwarded a report that the test did not submit');
	plan.received.push({
		method: request.method, authorization: request.headers.authorization,
		payload, author: JSON.parse(form.get('author')),
	});
	if (plan.reply === 'disconnect') {
		request.socket.destroy();
		return;
	}
	response.writeHead(plan.reply.status, Object.fromEntries(plan.reply.headers));
	response.end(await plan.reply.text());
}

async function signIn(subject) {
	const code = 'synthetic-' + subject;
	const guest = await mintSessionFixture(app.origin);
	const session = await oauth(app, guest, code);
	return { ...session, email: code + '@example.invalid' };
}

function planReply(reply) {
	const id = feedbackSubmissionId();
	const received = [];
	reports.set(id, { received, reply });
	return { id, received };
}

describe('POST /api/feedback', () => {
	before(async () => {
		fixture = await startFixture({ onFeedback: receiveFeedback });
		apps = appFactory(fixture, { secrets: { SESSION_SECRET: 'synthetic-feedback-session', VITE_MODEM_FEEDBACK_TOKEN: token } });
		app = await apps.start();
		session = await signIn('registered');
	});
	after(async () => {
		try {
			await apps?.stop();
		} finally {
			await fixture?.stop();
		}
		assert.deepEqual(fixture?.errors ?? [], []);
	});

	it('202: a signed-in learner submits a named report', async () => {
		const { id, received } = planReply(Response.json({ id: 'named-receipt' }, { status: 202 }));
		const response = await fetch(app.origin + '/api/feedback', {
			method: 'POST', headers: { cookie: session.cookie, 'content-type': 'application/json; charset=utf-8' },
			body: JSON.stringify({ submission_id: id, message: '  Add a diagram.  ', name: '  Learner  ', email: 'form@example.invalid' }),
		});
		assert.equal(response.status, 202);
		assert.deepEqual(await response.json(), { id: 'named-receipt' });
		assert.deepEqual(received, [{
			method: 'POST', authorization: 'Bearer ' + token,
			payload: { submission_id: id, message: 'Add a diagram.', url: app.origin },
			author: { user_id: session.userId, name: 'Learner', email: session.email },
		}]);
	});

	it('202: a signed-in learner leaves the optional name blank', async () => {
		const session = await signIn('unnamed');
		const { id, received } = planReply(Response.json({ id: 'unnamed-receipt' }, { status: 202 }));
		const response = await fetch(app.origin + '/api/feedback', {
			method: 'POST', headers: { cookie: session.cookie, 'content-type': 'application/json' },
			body: JSON.stringify({ submission_id: id, message: 'Keep the card open.' }),
		});
		assert.equal(response.status, 202);
		assert.deepEqual(await response.json(), { id: 'unnamed-receipt' });
		assert.deepEqual(received[0].author, { user_id: session.userId, email: session.email });
	});

	it('401: a guest sends feedback through the signed-in route', async () => {
		const guest = await mintSessionFixture(app.origin);
		const response = await fetch(app.origin + '/api/feedback', {
			method: 'POST', headers: { cookie: guest.cookie, 'content-type': 'application/json' },
			body: JSON.stringify({ submission_id: feedbackSubmissionId(), message: 'Guest report.' }),
		});
		assert.equal(response.status, 401);
		assert.equal(await response.text(), '');
	});

	it('415: the request uses the wrong content type', async () => {
		const response = await fetch(app.origin + '/api/feedback', {
			method: 'POST', headers: { cookie: session.cookie, 'content-type': 'text/plain' },
			body: JSON.stringify({ submission_id: feedbackSubmissionId(), message: 'Plain text.' }),
		});
		assert.equal(response.status, 415);
		assert.equal(await response.text(), '');
	});

	for (const [name, body] of [
		['invalid JSON', '{'],
		['a missing submission ID', JSON.stringify({ message: 'No ID.' })],
		['a submission ID in the wrong format', JSON.stringify({ submission_id: 'not-a-uuid', message: 'Bad ID.' })],
		['a blank message', JSON.stringify({ submission_id: feedbackSubmissionId(), message: '   ' })],
		['a name longer than 256 characters', JSON.stringify({ submission_id: feedbackSubmissionId(), message: 'Long name.', name: 'a'.repeat(257) })],
	]) {
		it('400: ' + name, async () => {
			const response = await fetch(app.origin + '/api/feedback', {
				method: 'POST', headers: { cookie: session.cookie, 'content-type': 'application/json' }, body,
			});
			assert.equal(response.status, 400);
			assert.equal(await response.text(), '');
		});
	}

	for (const [name, reply, status, retryAfter = null] of [
		['Modem rejects the report', new Response(null, { status: 422 }), 400],
		['Modem reports a duplicate', new Response(null, { status: 409 }), 409],
		['Modem sets a retry interval', new Response(null, { status: 429, headers: { 'retry-after': '17' } }), 429, '17'],
		['Modem is unavailable', new Response(null, { status: 503 }), 502],
		['Modem accepts the report without a receipt ID', Response.json({}, { status: 202 }), 502],
		['the connection to Modem closes without a response', 'disconnect', 502],
	]) {
		it(status + ': ' + name, async () => {
			const { id, received } = planReply(reply);
			const response = await fetch(app.origin + '/api/feedback', {
				method: 'POST', headers: { cookie: session.cookie, 'content-type': 'application/json' },
				body: JSON.stringify({ submission_id: id, message: 'Synthetic report.' }),
			});
			assert.equal(response.status, status);
			assert.equal(await response.text(), '');
			assert.equal(response.headers.get('retry-after'), retryAfter);
			assert.equal(received.length, 1);
		});
	}

	describe('without a feedback token', () => {
		let unconfigured;
		let server;

		before(async () => {
			unconfigured = appFactory(fixture);
			server = await unconfigured.start();
		});
		after(() => unconfigured?.stop());

		it('404: the feedback token is unset', async () => {
			const response = await fetch(server.origin + '/api/feedback', {
				method: 'POST', headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ submission_id: feedbackSubmissionId(), message: 'No feedback channel.' }),
			});
			assert.equal(response.status, 404);
			assert.equal(await response.text(), '');
		});
	});
});
