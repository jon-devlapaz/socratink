import { useEffect, useId, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AnimatedShinyText } from '@/components/magicui/animated-shiny-text';
import type { QuestionnaireAnswer } from '../questionnaire.ts';
import { compactMarkdownText } from './chat-markdown-parse.ts';
import { Markdown } from './chat-markdown.tsx';
import { displayLabel, type DisplayedTurn } from './chat-turns.ts';
import type { LiveReplyView } from './live-reply.ts';
import type { AnswerFields, QuestionDraft } from './client/chat-draft.ts';
import { Questionnaire } from './questionnaire.tsx';
import { RevealMark } from './reveal-mark.tsx';
import type { SteeringKind } from './steering.ts';
import { SteeringBar } from './steering-view.tsx';
import { ToolList } from './tool-card.tsx';
import type { DisplayedToolCall } from './tool-state.ts';

type HistoryStepProps = {
	step: readonly DisplayedTurn[];
	index: number;
	previousReply?: DisplayedTurn;
	drafts?: ReadonlyMap<string, AnswerFields>;
};

export function HistoryStep({ step, index, previousReply, drafts }: HistoryStepProps) {
	const help = step[0]?.cardHelp;
	const hintedQuestion = help?.kind === 'hint' && help.sourceId === previousReply?.submissionId
		? previousReply.questionnaire?.items[0]?.prompt : undefined;
	return <li className="history-step">
		<span className="history-step-mark" aria-hidden="true">{index + 1}</span>
		<div className="history-step-body">
			{step.map((item, turnIndex) => {
				const body = historyBodyText(item);
				const reveal = item.role === 'Assistant' && item.text.trim() ? item.reveal : undefined;
				const question = item.questionnaire?.items[0]?.prompt;
				const showQuestion = question && !(turnIndex === 1 && question === hintedQuestion);
				const showBody = body && (reveal || body !== question);
				const draft = item.submissionId ? drafts?.get(item.submissionId) : undefined;
				if (!showBody && !showQuestion && !draft) return null;
				return <div key={turnIndex} className={`history-turn ${item.role.toLowerCase()}${item.cardHelp ? ' turn-action' : ''}`}>
					{!reveal && <span className="sr-only">{displayLabel(item.role)}</span>}
					{showBody && <p className={reveal ? 'reveal-copy' : undefined}>
						{reveal && <RevealMark reveal={reveal} />}{body}
					</p>}
					{showQuestion && <p className="history-question">{question}</p>}
					{draft && <aside className="history-draft" aria-label="Unsent draft in this tab">
						<p><strong>Unsent draft in this tab</strong></p>
						{item.questionnaire?.items[0]?.choices.filter(choice => draft.values.includes(choice.value)).map(choice =>
							<p key={choice.value}>{choice.label}</p>)}
						{draft.freeform && <p>{draft.freeform}</p>}
					</aside>}
				</div>;
			})}
		</div>
	</li>;
}

function historyBodyText(item: DisplayedTurn): string {
	if (item.role === 'You') return item.shownText ?? item.text;
	const compact = compactMarkdownText(item.shownText ?? item.text);
	if (compact || item.questionnaire) return compact;
	return item.tools?.map(call => call.name).join(', ') ?? '';
}

type ActiveTurnProps = {
	questionDraft?: QuestionDraft;
	item: DisplayedTurn;
	announce?: boolean;
	stagger?: boolean;
	interactive?: boolean;
	steering?: boolean;
	onQuestionnaireSubmit: (answers: QuestionnaireAnswer[]) => void;
	onSteer: (kind: SteeringKind) => void;
};

export function ActiveTurn({ item, announce, stagger, interactive, steering, questionDraft, onQuestionnaireSubmit, onSteer }: ActiveTurnProps) {
	const selectionRoot = useRef<HTMLDivElement>(null);
	const { role, text, questionnaire, modelRoute } = item;
	const reveal = role === 'Assistant' && text.trim() ? item.reveal : undefined;
	const asked = !interactive && questionnaire ? questionnaire.items.map(question => question.prompt).join('\n\n') : '';
	const shown = item.shownText ?? text;
	const activeCard = interactive && questionnaire;
	const actions = steering && role === 'Assistant' && text.trim()
		? <SteeringBar sourceText={text} selectionRoot={selectionRoot} onSteer={onSteer} inMenu={Boolean(activeCard)} />
		: null;
	return <div className={`turn ${role.toLowerCase()}${stagger ? ' stagger-item' : ''}`}
		ref={selectionRoot} aria-live={announce ? 'polite' : undefined}
		data-model-route={role === 'Assistant' ? modelRoute : undefined}>
		{!reveal && <div className="turn-head">
			<span className="turn-label">{displayLabel(role)}</span>
		</div>}
		{role === 'Assistant'
			? <Markdown text={text.trim() || !asked ? text : asked} reveal={reveal} />
			: <p hidden={!shown} className={item.cardHelp ? 'turn-action' : undefined}>{shown}</p>}
		{item.tools && <ToolList calls={item.tools} />}
		{activeCard ? <Questionnaire key={item.submissionId} definition={activeCard} draft={questionDraft}
			canAskForHelp={Boolean(item.submissionId)} onSubmit={onQuestionnaireSubmit} moreOptions={actions} /> : actions}
	</div>;
}

type PendingTurnProps = {
	cancelDisabled: boolean;
	onCancel: () => void;
	tools: readonly DisplayedToolCall[];
	view: LiveReplyView;
};

export function PendingTurn({ cancelDisabled, onCancel, tools, view }: PendingTurnProps) {
	const stepsId = useId();
	const [expanded, setExpanded] = useState(true);
	const [delayed, setDelayed] = useState(false);
	const waitingForText = !view.markdown && !cancelDisabled;
	useEffect(() => {
		if (!waitingForText) return;
		const timeout = window.setTimeout(() => setDelayed(true), 10_000);
		return () => window.clearTimeout(timeout);
	}, [waitingForText]);
	return <div className="turn pending" role="status" aria-live="polite" aria-label="Waiting for Socratink">
		<div className="thinking-bar">
			<Button variant="ghost" className="thinking-toggle" type="button" aria-expanded={expanded}
				aria-controls={stepsId} aria-label={expanded ? 'Hide what Socratink is doing' : 'Show what Socratink is doing'}
				onClick={() => setExpanded(!expanded)}>
				<AnimatedShinyText className="thinking-shimmer" aria-hidden="true"><span className="thinking-dots">•••</span>Thinking</AnimatedShinyText>
				<svg className="thinking-chevron" viewBox="0 0 16 16" aria-hidden="true">
					<path d="M6 3.5 11 8 6 12.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
				</svg>
			</Button>
			<Button variant="ghost" size="icon" className="thinking-cancel" type="button" disabled={cancelDisabled}
				aria-label={cancelDisabled ? 'Canceling' : 'Cancel'} onClick={onCancel}>
				<svg className="thinking-cancel-icon" viewBox="0 0 16 16" aria-hidden="true">
					<rect x="5" y="5" width="6" height="6" rx="1" fill="currentColor" />
				</svg>
			</Button>
		</div>
		<div className="thinking-steps" id={stepsId} hidden={!expanded}>
			<span className="thinking-steps-bar" aria-hidden="true" />
			<ul className="thinking-steps-list">
				<li className="thinking-step-copy">Working from what you wrote</li>
				<li className="pending-latency" hidden={!delayed || !waitingForText}>Taking longer than usual.</li>
			</ul>
		</div>
		<Markdown text={view.markdown} reveal={view.reveal} streaming />
		<ToolList calls={tools} />
	</div>;
}
