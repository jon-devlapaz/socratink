import * as v from 'valibot';

const signInReturnKey = 'socratink-sign-in-return';

/** Leaving for sign-in keeps this tab's unsent work for the return to the chat (#270). */
export function keepDraftsForSignIn() {
	try {
		sessionStorage.setItem(signInReturnKey, '1');
	} catch {
	}
}

let returnedToDrafts: boolean | undefined;
// A reload, or the return from sign-in, is the same tab coming back. Read once per page.
function returnsToDrafts() {
	if (returnedToDrafts !== undefined) return returnedToDrafts;
	const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
	let signInReturn = false;
	try {
		signInReturn = sessionStorage.getItem(signInReturnKey) === '1';
		sessionStorage.removeItem(signInReturnKey);
	} catch {
	}
	returnedToDrafts = navigation?.type === 'reload' || signInReturn;
	return returnedToDrafts;
}

function openTabDraft(key: string, copiedKeyPrefix?: string) {
	function save(text: string) {
		try {
			if (text) sessionStorage.setItem(key, text);
			else sessionStorage.removeItem(key);
		} catch {
		}
	}

	let restored: string | undefined;
	if (returnsToDrafts()) {
		try {
			restored = sessionStorage.getItem(key) ?? '';
		} catch {
		}
	} else {
		// A new tab can inherit its opener's drafts for inactive lessons, too.
		save('');
		if (copiedKeyPrefix) {
			try {
				for (const other of Object.keys(sessionStorage)) {
					if (other.startsWith(copiedKeyPrefix)) sessionStorage.removeItem(other);
				}
			} catch {
			}
		}
	}
	return { restored, save };
}

export function mountChatDraft(input: HTMLTextAreaElement, conversationId: string) {
	const draft = openTabDraft(`socratink-chat-draft:${conversationId}`);
	if (draft.restored !== undefined) input.value = draft.restored;
	input.addEventListener('input', () => draft.save(input.value));
	return { clear: () => draft.save('') };
}

const savedQuestion = v.object({ questionId: v.string(), answer: v.object({ values: v.array(v.string()), freeform: v.string() }) });
type SavedQuestion = v.InferOutput<typeof savedQuestion>;
export type AnswerFields = SavedQuestion['answer'];
export type QuestionDraft = { initial?: AnswerFields; save: (answer: AnswerFields) => void };

export function openQuestionDraft(conversationId: string) {
	const prefix = 'socratink-question-draft:';
	const storage = openTabDraft(prefix + conversationId, prefix);
	const drafts = new Map<string, AnswerFields>();
	if (storage.restored) {
		try {
			const records = v.parse(v.union([savedQuestion, v.array(savedQuestion)]), JSON.parse(storage.restored));
			for (const entry of Array.isArray(records) ? records : [records]) drafts.set(entry.questionId, entry.answer);
		} catch {
			storage.save('');
		}
	}
	function persist() {
		const records = Array.from(drafts, ([questionId, answer]) => ({ questionId, answer }));
		storage.save(records.length ? JSON.stringify(records.length === 1 ? records[0] : records) : '');
	}
	function discard(questionId: string | undefined) {
		if (questionId && drafts.delete(questionId)) persist();
	}
	return {
		forQuestion(questionId: string | undefined): QuestionDraft | undefined {
			if (!questionId) return;
			return {
				initial: drafts.get(questionId),
				save(answer) {
					if (!answer.values.length && !answer.freeform) return discard(questionId);
					drafts.set(questionId, answer);
					persist();
				},
			};
		},
		retain({ current, earlier }: { current?: string; earlier: ReadonlySet<string> }) {
			const before = drafts.size;
			for (const id of drafts.keys()) {
				if (id !== current && !earlier.has(id)) drafts.delete(id);
			}
			if (drafts.size !== before) persist();
		},
		earlierDrafts: (ids: ReadonlySet<string>) => new Map([...drafts].filter(([id]) => ids.has(id))),
		discard,
		hasWork: () => [...drafts.values()].some(answer => answer.values.length || answer.freeform.trim()),
		clear() {
			drafts.clear();
			storage.save('');
		},
	};
}
