import { steeringMessages } from '../../config/chat-message.ts';
import { cardHintText, learnerVisibleText } from '../../learning/learner-text.ts';
import { displayedChoices } from '../../learning/tools.ts';
import { formatQuestionnaireAnswers, questionnaireFromReplyData, sameQuestion, type CardHelpAction, type QuestionnaireDefinition, type QuestionnaireItem } from '../../questionnaire.ts';
import { revealFromReply } from '../../reveal.ts';
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
export function projectCardHints(snapshot: Snapshot, showEmptyHintNotice: boolean): ReadonlyMap<string, QuestionnaireDefinition> {
	const hintCards = new Map<string, QuestionnaireDefinition>();
	if (!snapshot.submissions.some((submission) => hintCardSource(submission) || submission.cardHelp?.kind === 'unknown')) return hintCards;
	const replies = new Map(snapshot.messages.filter((message) => message.role === 'assistant')
		.map((message) => [message.submissionId, message]));
	for (const click of snapshot.submissions) {
		const reply = replies.get(click.id);
		if (!reply) continue;
		const originalId = click.cardHelp?.kind === 'unknown' && click.outcome === 'completed'
			&& reply.text && revealFromReply(reply.data)?.kind === 'hint' && !questionnaireFromReplyData(reply.data)
			? click.cardHelp.sourceId : undefined;
		const sourceId = hintCardSource(click) ?? originalId;
		if (!sourceId) continue;
		const source = hintCards.get(sourceId) ?? questionnaireFromReplyData(replies.get(sourceId)?.data);
		if (!source) continue;
		const card = applyCardHint(reply, source, click.outcome === 'completed', showEmptyHintNotice);
		if (card) hintCards.set(click.id, card);
	}
	return hintCards;
}

function applyCardHint(reply: ProductMessage, source: QuestionnaireDefinition, completed: boolean, showEmptyHintNotice: boolean): QuestionnaireDefinition | undefined {
	if (!completed) {
		// A streamed question cannot be taken back. Show the clue and its card together.
		reply.text = '';
		if (reply.data) delete reply.data.questionnaire;
		return;
	}
	const card = recordedHintCard(source, questionnaireFromReplyData(reply.data));
	const item = card.items[0]!;
	reply.text = cardHintText(learnerVisibleText(reply.text), item.prompt);
	const showNotice = showEmptyHintNotice && !reply.text && !item.description;
	(reply.data ??= {}).questionnaire = [showNotice ? { ...card, items: [
		{ ...item, description: 'You can try Hint again for a clue or answer the question.' },
	] } : card];
	return card;
}

function cardBeforeUnaided(snapshot: Snapshot): string | undefined {
	for (let index = snapshot.submissions.length - 2; index >= 0; index--) {
		const prior = snapshot.submissions[index]!;
		if (prior.outcome === 'completed') return prior.id;
		if (!prior.outcome || prior.text !== steeringMessages['try-unaided']) return;
	}
}

export function repeatedCardToolResult(snapshot: Snapshot, hintSourceId: string | undefined, presented: ProductMessage['data']) {
	const sourceId = hintSourceId ?? cardBeforeUnaided(snapshot);
	const reply = snapshot.messages.find((message) => message.role === 'assistant' && message.submissionId === sourceId);
	const card = questionnaireFromReplyData(reply?.data);
	if (!card || (!hintSourceId && !sameQuestion(card, questionnaireFromReplyData(presented)))) return;
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
