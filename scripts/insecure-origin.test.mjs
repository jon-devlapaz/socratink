import assert from 'node:assert/strict';
import test from 'node:test';
import { appConfig } from '../src/config/app.config.ts';
import { openChatConversation } from '../src/ui/client/conversation.ts';

test('openChatConversation works on an insecure page without crypto.randomUUID', () => {
	// Browsers expose randomUUID only on https and localhost; a phone on
	// http://<lan-ip> gets crypto without it, which crashed the app on load.
	const store = new Map();
	const originalStorage = globalThis.localStorage;
	const originalLocation = globalThis.location;
	const randomUUID = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(globalThis.crypto), 'randomUUID');
	globalThis.localStorage = {
		getItem(key) {
			return store.has(key) ? store.get(key) : null;
		},
		setItem(key, value) {
			store.set(key, String(value));
		},
		removeItem(key) {
			store.delete(key);
		},
	};
	globalThis.location = { origin: 'http://192.168.0.2:5173' };
	delete Object.getPrototypeOf(globalThis.crypto).randomUUID;
	try {
		assert.equal(globalThis.crypto.randomUUID, undefined);
		openChatConversation('user-a');
		const first = store.get(appConfig.chatConversationStorageKey);
		assert.match(first, /^user-a:[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
		store.delete(appConfig.chatConversationStorageKey);
		openChatConversation('user-a');
		assert.notEqual(store.get(appConfig.chatConversationStorageKey), first);
	} finally {
		Object.defineProperty(Object.getPrototypeOf(globalThis.crypto), 'randomUUID', randomUUID);
		if (originalStorage === undefined) delete globalThis.localStorage;
		else globalThis.localStorage = originalStorage;
		if (originalLocation === undefined) delete globalThis.location;
		else globalThis.location = originalLocation;
	}
});
