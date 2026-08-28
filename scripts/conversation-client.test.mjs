import assert from 'node:assert/strict';
import test from 'node:test';
import {
	chatTurnErrorMessage,
	isLostConversationStream,
	sendChatTurn,
} from '../src/ui/client/conversation.ts';

function streamNotFound(source) {
	const error = new Error('HTTP Error 404 at http://localhost:5173/api/agents/chat/x?view=updates');
	error.status = 404;
	if (source === 'json') {
		error.json = {
			error: {
				type: 'stream_not_found',
				message: 'Event stream was not found.',
			},
		};
	} else {
		error.body = {
			error: {
				type: 'stream_not_found',
				message: 'Event stream was not found.',
			},
		};
	}
	return error;
}

test('detects a durable-stream 404 whose envelope is stream_not_found', () => {
	assert.equal(isLostConversationStream(streamNotFound('json')), true);
	assert.equal(isLostConversationStream(streamNotFound('body')), true);
});

test('does not treat other 404s or non-errors as a lost stream', () => {
	const other = new Error('missing');
	other.status = 404;
	other.json = { error: { type: 'agent_instance_not_found' } };
	assert.equal(isLostConversationStream(other), false);
	assert.equal(isLostConversationStream(new Error('network')), false);
	assert.equal(isLostConversationStream(null), false);
});

test('reattaches to the original submission after a lost conversation stream', async () => {
	let sends = 0;
	const reads = [];
	const conversation = {
		async send() {
			sends += 1;
			return { submissionId: 'sub-1' };
		},
		async read(target) {
			reads.push(target);
			if (reads.length === 1) throw streamNotFound('json');
			return { text: 'recovered', data: {}, submissionId: 'sub-1' };
		},
	};

	const reply = await sendChatTurn(conversation, 'hello');
	assert.equal(reply.text, 'recovered');
	assert.equal(sends, 1);
	assert.equal(reads.length, 2);
	assert.deepEqual(reads[0], { submissionId: 'sub-1' });
	assert.equal(reads[1], 'sub-1');
});

test('does not retry unrelated send failures', async () => {
	let sends = 0;
	const conversation = {
		async send() {
			sends += 1;
			throw new Error('provider rejected');
		},
		async read() {
			throw new Error('should not read');
		},
	};

	await assert.rejects(() => sendChatTurn(conversation, 'hello'), /provider rejected/);
	assert.equal(sends, 1);
});

test('maps a lost stream to a short send-again message', () => {
	assert.equal(
		chatTurnErrorMessage(streamNotFound('json')),
		'This conversation was interrupted before a reply arrived. Send again or start over.',
	);
	assert.equal(chatTurnErrorMessage(new Error('provider rejected')), 'provider rejected');
});
