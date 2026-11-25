import { useEffect, useId, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AnimatedShinyText } from '@/components/magicui/animated-shiny-text';
import type { QuestionnaireAnswer } from '../questionnaire.ts';
import { compactMarkdownText } from './chat-markdown-parse.ts';
import { Markdown } from './chat-markdown.tsx';
import { displayLabel, type DisplayedTurn } from './chat-turns.ts';
import type { LiveReplyView } from './live-reply.ts';
import { Questionnaire } from './questionnaire.tsx';
import { RevealMark } from './reveal-mark.tsx';
import type { SteeringKind } from './steering.ts';
import { SteeringBar } from './steering-view.tsx';
import { ToolList } from './tool-card.tsx';
import type { DisplayedToolCall } from './tool-state.ts';

export function HistoryStep({ step, index }: { step: readonly DisplayedTurn[]; index: number }) {
	return <li className="history-step">
		<span className="history-step-mark" aria-hidden="true">{index + 1}</span>
		<div className="history-step-body">
			{step.map((item, turnIndex) => {
				const reveal = item.role === 'Assistant' && item.text.trim() ? item.reveal : undefined;
				return <div key={turnIndex} className={`history-turn ${item.role.toLowerCase()}`}>
					<span className="sr-only">{displayLabel(item.role)}</span>
					<p className={reveal ? 'reveal-copy' : undefined}>
						{reveal && <RevealMark reveal={reveal} />}{historyBodyText(item)}
					</p>
				</div>;
			})}
		</div>
	</li>;
}

function historyBodyText(item: DisplayedTurn): string {
	if (item.role === 'You') return item.shownText ?? item.text;
	const compact = compactMarkdownText(item.shownText ?? item.text);
	if (compact) return compact;
	if (item.questionnaire) return item.questionnaire.items.map(question => question.prompt).join(' ');
	return item.tools?.map(call => call.name).join(', ') ?? '';
}

type ActiveTurnProps = {
	item: DisplayedTurn;
	announce?: boolean;
	stagger?: boolean;
	interactive?: boolean;
	steering?: boolean;
	onQuestionnaireSubmit: (answers: QuestionnaireAnswer[]) => void;
	onSteer: (kind: SteeringKind) => void;
};

export function ActiveTurn({ item, announce, stagger, interactive, steering, onQuestionnaireSubmit, onSteer }: ActiveTurnProps) {
	const selectionRoot = useRef<HTMLDivElement>(null);
	const { role, text, questionnaire, modelRoute } = item;
	const asked = !interactive && questionnaire ? questionnaire.items.map(question => question.prompt).join('\n\n') : '';
	const shown = item.shownText ?? text;
	return <div className={`turn ${role.toLowerCase()}${stagger ? ' stagger-item' : ''}`}
		ref={selectionRoot} aria-live={announce ? 'polite' : undefined}>
		<div className="turn-head">
			<span className="turn-label">{displayLabel(role)}</span>
			{role === 'Assistant' && modelRoute && <span className="turn-model" title={modelRoute}>{modelRoute}</span>}
		</div>
		{role === 'Assistant'
			? <Markdown text={text.trim() || !asked ? text : asked} reveal={text.trim() ? item.reveal : undefined} />
			: <p hidden={!shown}>{shown}</p>}
		{item.tools && <ToolList calls={item.tools} />}
		{interactive && questionnaire && <Questionnaire definition={questionnaire} onSubmit={onQuestionnaireSubmit} />}
		{steering && role === 'Assistant' && text.trim() && <SteeringBar sourceText={text} selectionRoot={selectionRoot} onSteer={onSteer} />}
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
