export function mountChatDraft(input: HTMLTextAreaElement, conversationId: string) {
	const key = `socratink-chat-draft:${conversationId}`;

	function save(text: string) {
		try {
			if (text) sessionStorage.setItem(key, text);
			else sessionStorage.removeItem(key);
		} catch {
		}
	}

	const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
	if (navigation?.type === 'reload') {
		try {
			input.value = sessionStorage.getItem(key) ?? '';
		} catch {
		}
	} else {
		// A newly opened tab can receive a copy of its opener's session storage.
		save('');
	}

	input.addEventListener('input', () => save(input.value));
	return { clear: () => save('') };
}
