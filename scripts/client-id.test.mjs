import assert from 'node:assert/strict';
import test from 'node:test';
import { appConfig } from '../src/config/app.config.ts';
import { openChatConversation } from '../src/ui/client/conversation.ts';

// Browsers expose crypto.randomUUID only on https or localhost; a phone on http://<lan-ip> lacks it.
test('openChatConversation makes a conversation id without crypto.randomUUID', () => {
	const store = new Map();
	const originalStorage = globalThis.localStorage;
	const originalLocation = globalThis.location;
	const originalRandomUUID = crypto.randomUUID;
	globalThis.localStorage = {
		getItem: (key) => (store.has(key) ? store.get(key) : null),
		setItem: (key, value) => store.set(key, String(value)),
		removeItem: (key) => store.delete(key),
	};
	globalThis.location = { origin: 'http://192.168.0.2:5173' };
	delete Object.getPrototypeOf(crypto).randomUUID;
	try {
		assert.equal(typeof crypto.randomUUID, 'undefined');
		openChatConversation('user-a');
		const stored = store.get(appConfig.chatConversationStorageKey);
		assert.match(stored, /^user-a:[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
	} finally {
		Object.getPrototypeOf(crypto).randomUUID = originalRandomUUID;
		if (originalStorage === undefined) delete globalThis.localStorage;
		else globalThis.localStorage = originalStorage;
		if (originalLocation === undefined) delete globalThis.location;
		else globalThis.location = originalLocation;
	}
});
