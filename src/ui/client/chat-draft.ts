import * as v from 'valibot';

function openTabDraft(key: string) {
	function save(text: string) {
		try {
			if (text) sessionStorage.setItem(key, text);
			else sessionStorage.removeItem(key);
		} catch {
		}
	}

	let restored: string | undefined;
	const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
	if (navigation?.type === 'reload') {
		try {
			restored = sessionStorage.getItem(key) ?? '';
		} catch {
		}
	} else {
		// A newly opened tab can receive a copy of its opener's session storage.
		save('');
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
	const storage = openTabDraft(`socratink-question-draft:${conversationId}`);
	let saved: SavedQuestion | undefined;
	if (storage.restored) {
		try {
			saved = v.parse(savedQuestion, JSON.parse(storage.restored));
		} catch {
			storage.save('');
		}
	}
	function clear() {
		saved = undefined;
		storage.save('');
	}
	return {
		forQuestion(questionId: string | undefined): QuestionDraft | undefined {
			if (!questionId) return;
			if (saved && saved.questionId !== questionId) clear();
			return {
				initial: saved?.answer,
				save(answer) {
					if (!answer.values.length && !answer.freeform) return clear();
					saved = { questionId, answer };
					storage.save(JSON.stringify(saved));
				},
			};
		},
		hasWork: () => Boolean(saved && (saved.answer.values.length || saved.answer.freeform.trim())),
		clear,
	};
}
