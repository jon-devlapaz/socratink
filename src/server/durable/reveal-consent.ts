import type { Context } from '@earendil-works/chord/context';
import type { ContextEdit, Conversation, Cursor } from '@earendil-works/pi-durable';
import { formatQuestionnaireAnswers, parseQuestionnaireDefinition, questionnaireFromPresentQuestion, type QuestionnaireDefinition } from '../../questionnaire.ts';
import { parseRevealDefinition, revealToolName, type RevealDefinition } from '../../reveal.ts';
import { asksForAnswer, revealCue } from '../../learning/mark-reveal.ts';
import { inputKind, type ProductMessage, type Snapshot } from './contract.ts';

export const tryOnceMoreCorrection = 'The learner chose Try once more. Ask one short, open-ended question about the exact situation in their last substantive message. Ask them what their own idea predicts in that situation. Do not switch topics or examples. Use only the question, ending with a question mark. Give no new facts, hints, options, preface, or comment about the choice. Do not use tools.';

export function choseTryOnceMore(snapshot: Snapshot, text: string): boolean {
	const last = snapshot.submissions.at(-1);
	if (last?.tryOnceMore && last.outcome === 'failed' && last.text === text) return true;
	const message = snapshot.messages.at(-1);
	if (message?.role !== 'assistant') return false;
	const card = parseQuestionnaireDefinition(message.data?.questionnaire?.at(-1));
	return card?.kind === 'reveal-consent'
		&& text === formatQuestionnaireAnswers(card, [{ name: card.items[0]!.name, values: ['try-once-more'] }]);
}

export function isTryOnceMoreQuestion(text: string): boolean {
	const question = text.trim().replace(/^\*\*(.+)\*\*$/u, '$1');
	const body = question.slice(0, -1);
	return /[?？]$/u.test(question) && /\p{L}/u.test(body) && !/[\n:!?：！？]|[.。](?:\s|$)/u.test(body)
		&& !revealCue.test(body);
}

export async function rejectedTryOnceMoreEdits(root: Conversation, previous: Snapshot['submissions'][number] | undefined,
	context: Context): Promise<ContextEdit[]> {
	if (!previous?.tryOnceMore) return [];
	// The browser projection accepts only the last candidate of a completed guarded turn.
	let keepQuestion = previous.outcome === 'completed';
	const edits: ContextEdit[] = [];
	let cursor: Cursor | undefined;
	do {
		const page = await root.entries({ order: 'descending' }, 100, cursor, context);
		for (const entry of page.items) {
			if (entry.kind === inputKind) return edits;
			if (entry.kind === 'pi.assistant' && keepQuestion) {
				keepQuestion = false;
			} else if (entry.model?.some((message) => message.role !== 'system')) {
				edits.push({ action: 'omit', target: entry.id });
			}
		}
		cursor = page.next;
	} while (cursor);
	return edits;
}

function protectedReveal(message: ProductMessage, permission: RevealDefinition | 'asked' | undefined): RevealDefinition | undefined {
	// The learner asked for the answer in words, so no card stands between them and it.
	if (permission === 'asked') return undefined;
	const reveals = [
		...(message.data?.reveal ?? []),
		...(message.tools ?? []).filter((tool) => tool.name === revealToolName && !tool.isError).map((tool) => tool.input),
	].map(parseRevealDefinition);
	return reveals.find((reveal) => reveal && !reveal.requested && (reveal.kind === 'full_answer' || reveal.kind === 'worked_example')
		&& (permission?.kind !== reveal.kind || permission?.target !== reveal.target));
}

function consentCard(reveal: RevealDefinition): QuestionnaireDefinition {
	return {
		...questionnaireFromPresentQuestion({
			prompt: reveal.kind === 'full_answer' ? 'I can show a full answer.' : 'I can show a worked example.',
			choices: [{ value: 'see-it', label: 'See it' }, { value: 'try-once-more', label: 'Try once more' }],
		}),
		kind: 'reveal-consent',
	};
}

export function withRevealConsent(snapshot: Snapshot, consentRequired: ReadonlySet<string>): Snapshot {
	let pending: RevealDefinition | undefined;
	let permission: RevealDefinition | 'asked' | undefined;
	const completed = new Set(snapshot.submissions.filter((s) => s.outcome === 'completed').map((s) => s.id));
	const attempts = new Set(snapshot.submissions.filter((s) => s.tryOnceMore).map((s) => s.id));
	const failed = new Set<string>();
	const messages = snapshot.messages.flatMap((message): ProductMessage[] => {
		if (message.role === 'user') {
			const card = pending ? consentCard(pending) : undefined;
			permission = card && message.text === formatQuestionnaireAnswers(card, [{ name: 'item', values: ['see-it'] }])
				? pending : asksForAnswer(message.text) ? 'asked' : undefined;
			pending = undefined;
			return [message];
		}
		if (attempts.has(message.submissionId)) {
			if (!completed.has(message.submissionId)) return [];
			if (!message.tools?.length && !message.data?.reveal?.length && isTryOnceMoreQuestion(message.text)) return [message];
			failed.add(message.submissionId);
			return [];
		}
		if (!consentRequired.has(message.submissionId)) return [message];
		const reveal = protectedReveal(message, permission);
		if (reveal) {
			if (completed.has(message.submissionId)) {
				pending = reveal;
				return [{ role: 'assistant', submissionId: message.submissionId, text: '',
					data: { questionnaire: [consentCard(reveal)] }, metadata: message.metadata }];
			}
			return [{ role: 'assistant', submissionId: message.submissionId, text: '' }];
		}
		return [message];
	});
	return { ...snapshot, messages, submissions: snapshot.submissions.map((s) => failed.has(s.id)
		? { ...s, outcome: 'failed', error: 'The tutor could not prepare a question. Try again.' } : s) };
}
