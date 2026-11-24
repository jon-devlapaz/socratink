import type { WireEventBody } from '../config/chat-wire.ts';
import { markRevealRetryReason } from '../learning/mark-reveal.ts';
import { parseRevealDefinition, revealToolName, type RevealDefinition } from '../reveal.ts';
import { learnerVisibleText, withoutQuestionBesideCard } from '../learning/learner-text.ts';
import { presentQuestionToolName } from '../learning/present-question.ts';

/** What the pending turn shows of a reply that is still arriving. Empty
 * markdown shows nothing. */
export type LiveReplyView = { markdown: string; reveal?: RevealDefinition };

/** Folds one turn's live events into the reply text the learner may see now.
 * The text equals the settled reply's text, because the server streams each
 * message's text parts already joined, and a reply is its last message.
 * Supplied content shows only with its reveal mark: the mark comes from the
 * mark_reveal call as soon as it arrives, and text the server would still
 * check for an unmarked reveal waits for that call or for settlement. A hold
 * never takes away text already shown: it keeps the last shown text, frozen.
 * A question card, once it arrives, takes the text's own question away, as
 * the settled reply does (#163). */
export function createLiveReply(learnerText: string) {
	const texts = new Map<string, string>();
	let reveal: RevealDefinition | undefined;
	let card = false;
	let shown = '';

	return {
		/** Returns whether the view may have changed. */
		apply(event: WireEventBody): boolean {
			if (event.type === 'message-started') {
				if (texts.has(event.messageId)) return false;
				texts.set(event.messageId, '');
				return true;
			}
			if (event.type === 'message-delta' && event.kind === 'text') {
				texts.set(event.messageId, (texts.get(event.messageId) ?? '') + event.delta);
				return true;
			}
			if (event.type === 'tool-input' && event.toolName === presentQuestionToolName) {
				const changed = !card && Boolean(texts.get(event.messageId));
				card = true;
				return changed;
			}
			if (event.type === 'tool-input' && event.toolName === revealToolName) {
				const parsed = parseRevealDefinition(event.input);
				if (!parsed) return false;
				reveal = parsed;
				return true;
			}
			return false;
		},
		view(): LiveReplyView {
			const latest = learnerVisibleText([...texts.values()].at(-1) ?? '');
			const text = card ? withoutQuestionBesideCard(latest) : latest;
			const unmarked = markRevealRetryReason({
				revealed: Boolean(reveal), learnerText, assistantText: text, alreadyRetried: false,
			});
			if (unmarked) return { markdown: shown };
			shown = text;
			return reveal ? { markdown: text, reveal } : { markdown: text };
		},
	};
}
