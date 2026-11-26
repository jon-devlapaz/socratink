import { cardHintText, learnerVisibleText } from '../../learning/learner-text.ts';
import { displayedChoices } from '../../learning/tools.ts';
import { formatQuestionnaireAnswers, questionnaireFromReplyData, type CardHelpAction, type QuestionnaireDefinition, type QuestionnaireItem } from '../../questionnaire.ts';
import { hintCardSource, type CardHelp, type ProductMessage, type Snapshot } from './contract.ts';

export class InvalidCardActionError extends Error {
	constructor() { super('This question has changed. Reload the conversation to see the current question.'); }
}

/** Resolve a reported button press against the card visible at admission. */
export function resolveCardHelp(snapshot: Snapshot, text: string, { kind, sourceId }: CardHelpAction): CardHelp {
	const last = snapshot.submissions.at(-1);
	if (last?.cardHelp?.kind === kind && last.cardHelp.sourceId === sourceId && last.text === text
		&& (last.outcome === 'failed' || last.outcome === 'aborted')) {
		return last.cardHelp;
	}
	const reply = snapshot.messages.at(-1);
	if (last?.id === sourceId && last.outcome === 'completed' && reply?.role === 'assistant' && reply.submissionId === sourceId) {
		const card = questionnaireFromReplyData(reply.data);
		const item = card?.items[0];
		if (card && card.kind !== 'reveal-consent' && item
			&& text === formatQuestionnaireAnswers(card, [{ name: item.name, values: [], help: kind }])) {
			return { kind, sourceId: last.id, target: item.prompt };
		}
	}
	throw new InvalidCardActionError();
}

/** Keep the card without its temporary empty-clue notice for a later click. */
export function projectCardHints(snapshot: Snapshot): ReadonlyMap<string, QuestionnaireDefinition> {
	const hintCards = new Map<string, QuestionnaireDefinition>();
	if (!snapshot.submissions.some((submission) => hintCardSource(submission))) return hintCards;
	const replies = new Map(snapshot.messages.filter((message) => message.role === 'assistant')
		.map((message) => [message.submissionId, message]));
	for (const click of snapshot.submissions) {
		const sourceId = hintCardSource(click);
		if (!sourceId) continue;
		const source = hintCards.get(sourceId) ?? questionnaireFromReplyData(replies.get(sourceId)?.data);
		const reply = replies.get(click.id);
		if (!source || !reply) continue;
		const card = applyCardHint(reply, source, click.outcome === 'completed');
		if (card) hintCards.set(click.id, card);
	}
	return hintCards;
}

function applyCardHint(reply: ProductMessage, source: QuestionnaireDefinition, completed: boolean): QuestionnaireDefinition | undefined {
	if (!completed) {
		// A streamed question cannot be taken back. Show the clue and its card together.
		reply.text = '';
		if (reply.data) delete reply.data.questionnaire;
		return;
	}
	const card = recordedHintCard(source, questionnaireFromReplyData(reply.data));
	const item = card.items[0]!;
	reply.text = cardHintText(learnerVisibleText(reply.text), item.prompt);
	(reply.data ??= {}).questionnaire = [reply.text || item.description ? card : { ...card, items: [
		{ ...item, description: 'You can try Hint again for a clue or answer the question.' },
	] }];
	return card;
}

export function hintCardToolResult(snapshot: Snapshot, sourceId: string) {
	const reply = snapshot.messages.find((message) => message.role === 'assistant' && message.submissionId === sourceId);
	const card = questionnaireFromReplyData(reply?.data);
	if (!card) return;
	const item = card.items[0]!;
	return { card, text: `Question shown to the learner: ${item.prompt}\n${displayedChoices(item)}` };
}

// Older Hints reshuffled the choices. A saved letter still refers to the row shown on that turn.
function recordedHintCard(source: QuestionnaireDefinition, recorded: QuestionnaireDefinition | undefined): QuestionnaireDefinition {
	const item = source.items[0]!;
	const renewed = recorded?.items[0];
	if (!renewed || recorded?.kind !== source.kind || renewed.prompt !== item.prompt || renewed.choices.length !== item.choices.length) return source;
	const choices: QuestionnaireItem['choices'] = [];
	for (const freshChoice of renewed.choices) {
		const original = item.choices.find((choice) => choice.value === freshChoice.value && choice.label === freshChoice.label);
		if (!original) return source;
		choices.push({ ...original, shortcut: freshChoice.shortcut });
	}
	return { ...source, items: [{ ...item, choices }] };
}
