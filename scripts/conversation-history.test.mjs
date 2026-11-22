import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import { appConfig } from '../src/config/app.config.ts';
import {
	conversationTitle,
	forgetPastConversations,
	historyLimit,
	pastConversations,
	rememberConversation,
} from '../src/ui/client/conversation-history.ts';

const store = new Map();
globalThis.localStorage = {
	getItem: (key) => (store.has(key) ? store.get(key) : null),
	setItem: (key, value) => store.set(key, String(value)),
	removeItem: (key) => store.delete(key),
};
beforeEach(() => store.clear());

const admitted = (firstLearnerText) => ({ kind: 'admitted', firstLearnerText });
const restored = (firstLearnerText) => ({ kind: 'restored', firstLearnerText });

test('lists only conversations of the learner and their aliases, newest first', () => {
	rememberConversation('user-a:one', admitted('Why is the sky blue?'), 1_000);
	rememberConversation('user-b:two', admitted('Another learner'), 2_000);
	rememberConversation('guest-a:three', admitted('Before I signed in'), 3_000);
	rememberConversation('user-a:four', admitted('How do vaccines work?'), 4_000);

	assert.deepEqual(pastConversations('user-a', ['guest-a']).map((entry) => entry.id),
		['user-a:four', 'guest-a:three', 'user-a:one']);
	assert.deepEqual(pastConversations('user-b').map((entry) => entry.id), ['user-b:two']);
});

test('each learner has a separate list and limit', () => {
	for (let index = 0; index < historyLimit; index += 1) rememberConversation(`user-b:${index}`, admitted(`B ${index}`), index);
	rememberConversation('user-a:one', admitted('Kept'), 0);
	assert.deepEqual(pastConversations('user-a').map((entry) => entry.id), ['user-a:one']);
	assert.equal(store.has(`${appConfig.chatHistoryStorageKey}:user-a`), true);
	assert.doesNotMatch(store.get(`${appConfig.chatHistoryStorageKey}:user-b`), /Kept/);
});

test('sign-out forgets the learner and their aliases, and no one else', () => {
	rememberConversation('user-a:one', admitted('Private question'), 1);
	rememberConversation('guest-a:two', admitted('Guest question'), 2);
	rememberConversation('user-b:three', admitted('Someone else'), 3);
	forgetPastConversations('user-a', ['guest-a']);
	assert.deepEqual(pastConversations('user-a', ['guest-a']), []);
	assert.equal([...store.values()].some((value) => /Private|Guest/.test(value)), false);
	assert.equal(pastConversations('user-b').length, 1);
});

test('an admitted message keeps the first title and marks the conversation used', () => {
	rememberConversation('user-a:one', admitted('Why is the sky blue?'), 1_000);
	rememberConversation('user-a:two', admitted('Second topic'), 2_000);
	rememberConversation('user-a:one', admitted('A later message'), 3_000);

	assert.deepEqual(pastConversations('user-a'), [
		{ id: 'user-a:one', title: 'Why is the sky blue?', usedAt: 3_000 },
		{ id: 'user-a:two', title: 'Second topic', usedAt: 2_000 },
	]);
});

test('the server history owns the title and opening does not reorder the list', () => {
	rememberConversation('user-a:one', admitted('Wrong local title'), 1_000);
	rememberConversation('user-a:two', admitted('Second topic'), 2_000);
	rememberConversation('user-a:one', restored('What the server admitted'), 9_000);
	assert.deepEqual(pastConversations('user-a'), [
		{ id: 'user-a:two', title: 'Second topic', usedAt: 2_000 },
		{ id: 'user-a:one', title: 'What the server admitted', usedAt: 1_000 },
	]);
	rememberConversation('user-a:new', restored('Opened from an older version'), 5_000);
	assert.equal(pastConversations('user-a')[0].id, 'user-a:new');
});

test('titles are one line and shortened', () => {
	assert.equal(conversationTitle('  Line one\n\nline   two  '), 'Line one line two');
	const title = conversationTitle('x'.repeat(200));
	assert.equal(title.length, 60);
	assert.ok(title.endsWith('…'));
});

test('ignores empty text and malformed ids, keeps a bounded list, and survives corrupt storage', () => {
	rememberConversation('user-a:blank', admitted('   '), 1);
	rememberConversation('no-owner', admitted('Lost'), 1);
	assert.deepEqual(pastConversations('user-a'), []);
	assert.equal(store.size, 0);

	for (let index = 0; index < historyLimit + 5; index += 1) rememberConversation(`user-a:${index}`, admitted(`Topic ${index}`), index);
	const entries = pastConversations('user-a');
	assert.equal(entries.length, historyLimit);
	assert.equal(entries[0].id, `user-a:${historyLimit + 4}`);

	const key = `${appConfig.chatHistoryStorageKey}:user-a`;
	store.set(key, '{not json');
	assert.deepEqual(pastConversations('user-a'), []);
	store.set(key, JSON.stringify([{ id: 'user-a:x' }, null, { id: 'user-b:y', title: 'Planted', usedAt: 9 }, { id: 'user-a:y', title: 'Ok', usedAt: 5 }]));
	assert.deepEqual(pastConversations('user-a').map((entry) => entry.id), ['user-a:y']);
});

test('a full storage does not break sending', () => {
	const setItem = globalThis.localStorage.setItem;
	globalThis.localStorage.setItem = () => { throw new Error('QuotaExceededError'); };
	try {
		assert.doesNotThrow(() => rememberConversation('user-a:one', admitted('Topic'), 1));
	} finally {
		globalThis.localStorage.setItem = setItem;
	}
});
