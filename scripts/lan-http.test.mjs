import assert from 'node:assert/strict';
import test from 'node:test';
import { appConfig } from '../src/config/app.config.ts';
import { openChatConversation } from '../src/ui/client/conversation.ts';

test('openChatConversation works over plain http on a LAN address', () => {
	// Browsers omit crypto.randomUUID outside secure contexts such as http://192.168.x.x.
	const store = new Map();
	const originalStorage = globalThis.localStorage;
	const originalLocation = globalThis.location;
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
	globalThis.location = { origin: 'http://192.168.1.20:5173' };
	Object.defineProperty(globalThis.crypto, 'randomUUID', { value: undefined, configurable: true });
	try {
		openChatConversation('user-a');
		const first = store.get(appConfig.chatConversationStorageKey);
		assert.match(first, /^user-a:[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
		store.clear();
		openChatConversation('user-a');
		assert.notEqual(store.get(appConfig.chatConversationStorageKey), first);
	} finally {
		delete globalThis.crypto.randomUUID;
		if (originalStorage === undefined) delete globalThis.localStorage;
		else globalThis.localStorage = originalStorage;
		if (originalLocation === undefined) delete globalThis.location;
		else globalThis.location = originalLocation;
	}
});
