import type { WireEventBody } from '../config/chat-wire.ts';
import { markRevealRetryReason } from '../learning/mark-reveal.ts';
import { parseRevealDefinition, revealToolName, type RevealDefinition } from '../reveal.ts';
import { learnerVisibleAssistantText } from './assistant-text.ts';

/** What the pending turn shows of a reply that is still arriving. Empty
 * markdown shows nothing. */
export type LiveReplyView = { markdown: string; reveal?: RevealDefinition };

// A leading marker whose closing « » run has not arrived yet.
const partialLeadingMarker = /^«(?:[A-Z][A-Z0-9_]*)?$/u;

/** Folds one turn's live events into the reply text the learner may see now.
 * The text equals the settled reply's text, because the server streams each
 * message's text parts already joined, and a reply is its last message.
 * Supplied content shows only with its reveal mark: the mark comes from the
 * mark_reveal call as soon as it arrives, and text the server would still
 * check for an unmarked reveal waits for that call or for settlement. A hold
 * never takes away text already shown: it keeps the last shown text, frozen. */
export function createLiveReply(learnerText: string) {
	const texts = new Map<string, string>();
	let reveal: RevealDefinition | undefined;
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
			if (event.type === 'tool-input' && event.toolName === revealToolName) {
				// An invalid input fails the tool and records nothing, like at settlement.
				const parsed = parseRevealDefinition(event.input);
				if (!parsed) return false;
				reveal = parsed;
				return true;
			}
			return false;
		},
		view(): LiveReplyView {
			const text = learnerVisibleAssistantText([...texts.values()].at(-1) ?? '');
			const unmarked = markRevealRetryReason({
				revealed: Boolean(reveal), learnerText, assistantText: text, alreadyRetried: false,
			});
			if (partialLeadingMarker.test(text) || unmarked) return { markdown: shown };
			shown = text;
			return reveal ? { markdown: text, reveal } : { markdown: text };
		},
	};
}
