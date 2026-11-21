import { formatQuestionnaireAnswers, questionnaireFromPresentQuestion, type QuestionnaireDefinition } from '../../questionnaire.ts';
import { parseRevealDefinition, revealToolName, type RevealDefinition } from '../../reveal.ts';
import type { ProductMessage, Snapshot } from './contract.ts';

function protectedReveal(message: ProductMessage, permission: RevealDefinition | undefined): RevealDefinition | undefined {
	const reveals = [
		...(message.data?.reveal ?? []),
		...(message.tools ?? []).filter((tool) => tool.name === revealToolName && !tool.isError).map((tool) => tool.input),
	].map(parseRevealDefinition);
	return reveals.find((reveal) => reveal && (reveal.kind === 'full_answer' || reveal.kind === 'worked_example')
		&& (permission?.kind !== reveal.kind || permission?.target !== reveal.target));
}

function consentCard(reveal: RevealDefinition): QuestionnaireDefinition {
	return questionnaireFromPresentQuestion({
		prompt: reveal.kind === 'full_answer' ? 'I can show a full answer.' : 'I can show a worked example.',
		choices: [{ value: 'see-it', label: 'See it' }, { value: 'try-once-more', label: 'Try once more' }],
	});
}

export function withRevealConsent(snapshot: Snapshot, consentRequired: ReadonlySet<string>): Snapshot {
	let pending: RevealDefinition | undefined;
	let permission: RevealDefinition | undefined;
	const completed = new Set(snapshot.submissions.filter((s) => s.outcome === 'completed').map((s) => s.id));
	const messages = snapshot.messages.map((message): ProductMessage => {
		if (message.role === 'user') {
			const card = pending ? consentCard(pending) : undefined;
			permission = card && message.text === formatQuestionnaireAnswers(card, [{ name: 'item', values: ['see-it'] }])
				? pending : undefined;
			pending = undefined;
			return message;
		}
		if (!consentRequired.has(message.submissionId)) return message;
		const reveal = protectedReveal(message, permission);
		if (reveal) {
			if (completed.has(message.submissionId)) {
				pending = reveal;
				return { role: 'assistant', submissionId: message.submissionId, text: '',
					data: { questionnaire: [consentCard(reveal)] }, metadata: message.metadata };
			}
			return { role: 'assistant', submissionId: message.submissionId, text: '' };
		}
		const marked = (message.data?.reveal ?? []).some((value) => parseRevealDefinition(value));
		if (!completed.has(message.submissionId) && !marked) return { ...message, text: '' };
		return message;
	});
	return { ...snapshot, messages };
}
