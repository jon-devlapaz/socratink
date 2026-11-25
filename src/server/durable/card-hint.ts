import { cardHintText, learnerVisibleText } from '../../learning/learner-text.ts';
import { displayedChoices } from '../../learning/tools.ts';
import { cardHelpReveal } from '../../learning/mark-reveal.ts';
import { formatQuestionnaireAnswers, questionnaireFromReplyData, type QuestionnaireDefinition, type QuestionnaireItem } from '../../questionnaire.ts';
import type { ProductMessage, Snapshot } from './contract.ts';

/** Bind the click to the card the learner could answer when the input was accepted. */
export function sourceOfCardHint(snapshot: Snapshot, text: string): string | undefined {
	const help = cardHelpReveal(text);
	if (help?.kind !== 'hint') return;
	const last = snapshot.submissions.at(-1);
	if (last?.hintCardFrom && (last.outcome === 'failed' || last.outcome === 'aborted') && last.text === text) return last.hintCardFrom;
	const reply = snapshot.messages.at(-1);
	if (last?.outcome !== 'completed' || reply?.role !== 'assistant' || reply.submissionId !== last.id) return;
	const card = questionnaireFromReplyData(reply.data);
	const item = card?.items[0];
	if (!card || card.kind === 'reveal-consent' || !item?.choices.length) return;
	if (text === formatQuestionnaireAnswers(card, [{ name: item.name, values: [], help: 'hint' }])) return last.id;
}

/** Keep the card without its temporary empty-clue notice for a later click. */
export function projectCardHints(snapshot: Snapshot): ReadonlyMap<string, QuestionnaireDefinition> {
	const hintCards = new Map<string, QuestionnaireDefinition>();
	const clicks = snapshot.submissions.filter((submission) => submission.hintCardFrom);
	if (!clicks.length) return hintCards;
	const replies = new Map(snapshot.messages.filter((message) => message.role === 'assistant')
		.map((message) => [message.submissionId, message]));
	for (const click of clicks) {
		const sourceId = click.hintCardFrom!;
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
	const card = retryCard(source, questionnaireFromReplyData(reply.data));
	const item = card.items[0]!;
	reply.text = cardHintText(learnerVisibleText(reply.text), item.prompt);
	(reply.data ??= {}).questionnaire = [reply.text || item.description ? card : { ...card, items: [
		{ ...item, description: 'You can try Hint again for a clue or answer the question.' },
	] }];
	return card;
}

export function hintCardToolOutput(snapshot: Snapshot, sourceId: string, freshData: ProductMessage['data']): string | undefined {
	const reply = snapshot.messages.find((message) => message.role === 'assistant' && message.submissionId === sourceId);
	const source = questionnaireFromReplyData(reply?.data);
	if (!source) return;
	const item = retryCard(source, questionnaireFromReplyData(freshData)).items[0]!;
	return `Question shown to the learner: ${item.prompt}\n${displayedChoices(item)}`;
}

// A fresh call can reorder the same choices. It cannot replace the learner's question or reasoning field.
function retryCard(source: QuestionnaireDefinition, fresh: QuestionnaireDefinition | undefined): QuestionnaireDefinition {
	const item = source.items[0]!;
	const renewed = fresh?.items[0];
	if (!renewed || fresh?.kind !== source.kind || renewed.prompt !== item.prompt || renewed.choices.length !== item.choices.length) return source;
	const choices: QuestionnaireItem['choices'] = [];
	for (const freshChoice of renewed.choices) {
		const original = item.choices.find((choice) => choice.value === freshChoice.value && choice.label === freshChoice.label);
		if (!original) return source;
		choices.push({ ...original, shortcut: freshChoice.shortcut });
	}
	return { ...source, items: [{ ...item, choices }] };
}
