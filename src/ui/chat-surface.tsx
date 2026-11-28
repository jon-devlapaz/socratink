import { ChatApiError, type WireReply } from '../config/chat-wire.ts';
import type { ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { AuthGateCard } from './chat-gate.tsx';
import './chat-gate.css';
import { loadAuthProviders, type AuthProviders } from './session.ts';
import {
	ChatRequestCoordinator,
	conversationSwitchGuidance,
	chatRequestControls,
	isGuestTurnLimitError,
	type ChatRequestState,
	openChatConversation,
	startNewChatConversation,
	unsettledSubmissionFromHistory,
	watchChatConversationReset,
	switchChatConversation,
	announceChatTurnSettled,
	watchChatTurnSettled,
} from './client/conversation.ts';
import { mountChatDraft, openQuestionDraft } from './client/chat-draft.ts';
import { mountUnsentWork } from './client/unsent-work.ts';
import { mountSoundCues } from './sound-cues.ts';
import { attachTranscriptScroll } from './transcript-scroll.ts';
import {
	keepsQuestionDraft,
	questionsWithDrafts,
	displayedAssistantTurn,
	displayedLearnerTurn,
	groupEarlierSteps,
	splitCurrentTurns,
	visibleTurnsFromHistory,
	type DisplayedTurn,
} from './chat-turns.ts';
import { modelRouteLabel } from '../config/model-route.ts';
import {
	formatQuestionnaireAnswers,
	questionnaireFromReplyData,
	type CardHelpAction,
} from '../questionnaire.ts';
import { revealToolName, revealFromReply } from '../reveal.ts';
import { formatSteeringMessage } from './steering.ts';
import {
	applyToolStreamEvent,
	type DisplayedToolCall,
} from './tool-state.ts';
import { mountDictation } from './dictation.ts';
import { createLiveReply } from './live-reply.ts';
import { ActiveTurn, HistoryStep, PendingTurn } from './turn-view.tsx';
import { requireElement } from './dom.ts';
import {
	applyRequestControlState,
	RequestStateTurn,
	focusAfterRequestStatePaint,
} from './chat-request-view.tsx';

type PaintKind = 'restore' | 'new-turn' | 'hold';
type SendSource =
	| { kind: 'composer' | 'steering' }
	| { kind: 'card'; cardHelp?: CardHelpAction }
	| { kind: 'retry'; attempt: Extract<ChatRequestState, { kind: 'terminal' }> };

export type TranscriptContent = { history: ReactNode; active: ReactNode; questionActive: boolean };

export function mountChatSurface(options: Readonly<{
	userId: string;
	aliases: readonly string[];
	onStartOverDisabledChange: (disabled: boolean) => void;
	onTranscriptChange: (content: TranscriptContent) => void;
}>) {
	const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const elements = queryChatSurface();
	const {
		form,
		input,
		messages,
		card,
		activeTurn,
		trailToggle,
		trailLabel,
		dictationToggle,
		dictationStatus,
	} = elements;
	const dictation = mountDictation({
		input,
		toggle: dictationToggle,
		status: dictationStatus,
		onSendRequested: () => form.requestSubmit(),
	});
	const conversation = openChatConversation(options.userId, options.aliases);
	const storageNotice = requireElement<HTMLElement>('#storage-notice');
	if (!conversation.placeSaved) {
		storageNotice.textContent = 'Reloading this page could lose your place in this chat. You can keep chatting in this tab.';
	}
	const draft = mountChatDraft(input, conversation.id);
	const cardDraft = openQuestionDraft(conversation.id);
	function hasCardWork() {
		if (cardDraft.hasWork()) return true;
		const question = activeTurn.querySelector('.questionnaire');
		if (!question) return false;
		if (question.querySelector('[data-state="checked"], [aria-checked="true"]')) return true;
		return [...question.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input[type="text"], textarea')]
			.some((field) => field.value.trim() !== '');
	}
	const unsentWork = mountUnsentWork(options.userId, () => Boolean(input.value.trim()) || hasCardWork());
	const liveTools: DisplayedToolCall[] = [];
	const quietToolIds = new Set<string>();
	let liveReply = createLiveReply('');
	let liveTextShown = false;
	let liveFrame = 0;
	const requests = new ChatRequestCoordinator(conversation, {
		onEvent: (event) => {
			const replyChanged = liveReply.apply(event);
			const toolsChanged = !isQuietToolStreamEvent(event, quietToolIds) && applyToolStreamEvent(liveTools, event);
			if ((replyChanged || toolsChanged) && !liveFrame) liveFrame = requestAnimationFrame(paintLiveText);
		},
	});
	let trailOpen = false;
	let hasEntered = false;
	let turns: DisplayedTurn[] = [];
	let requestState: ChatRequestState = requests.state;
	const transcript = attachTranscriptScroll(card);
	let history: ReactNode = null;
	let visibleTurns: ReactNode = null;
	let status: ReactNode = null;
	let questionActive = false;
	let paintVersion = 0;

	function renderTranscript() {
		const pending = requestState.kind === 'waiting' || requestState.kind === 'canceling';
		const view = requestState.kind === 'waiting' ? liveReply.view() : { markdown: '' };
		if (view.markdown) liveTextShown = true;
		const active = <>
			{visibleTurns}
			{pending ? <PendingTurn
				view={view}
				tools={liveTools}
				cancelDisabled={requestState.kind === 'canceling'}
				onCancel={() => void runRequestCommand(requests.cancel())}
			/> : status}
		</>;
		flushSync(() => options.onTranscriptChange({ history, active, questionActive }));
	}

	function paintLiveText() {
		liveFrame = 0;
		if (requestState.kind === 'waiting') transcript.grow(renderTranscript);
	}

	let cachedProviders: AuthProviders | undefined;
	async function gateProviders(): Promise<AuthProviders> {
		cachedProviders ??= await loadAuthProviders();
		return cachedProviders;
	}

	async function requestStateElement(
		state: Extract<ChatRequestState, { kind: 'recovery' | 'terminal' }>,
	) {
		if (isGuestTurnLimitError(state)) {
			const providers = await gateProviders();
			if (providers.google || providers.github) return <AuthGateCard providers={providers} />;
		}
		return <RequestStateTurn state={state} onAction={() => {
			if (state.kind === 'recovery') {
				void runRequestCommand(requests.recheck());
			} else {
				const text = state.outcome === 'not-admitted' ? input.value.trim() || state.text : state.text;
				void sendMessage(text, { kind: 'retry', attempt: state });
			}
		}} />;
	}

	function setTrailOpen(open: boolean) {
		trailOpen = open && messages.childElementCount > 0;
		trailToggle.setAttribute('aria-expanded', String(trailOpen));
		messages.hidden = !trailOpen;
		if (trailOpen) {
			transcript.stopFollowing();
			transcript.scrollToStart();
			return;
		}
		transcript.pinCurrentStart();
	}

	function syncTrail() {
		const count = messages.childElementCount;
		card.classList.toggle('has-trail', count > 0);
		trailToggle.hidden = count === 0;
		trailLabel.textContent = count === 1 ? '1 earlier step' : `${count} earlier steps`;
		if (count === 0) {
			trailOpen = false;
			trailToggle.setAttribute('aria-expanded', 'false');
			messages.hidden = true;
			return;
		}
		messages.hidden = !trailOpen;
	}

	async function paint(kind: PaintKind, landing: 'start' | 'live-edge' = 'start') {
		const version = ++paintVersion;
		const render = async () => {
			const { earlier, current } = splitCurrentTurns(turns);
			if (kind === 'new-turn' && hasEntered && !reduceMotion && activeTurn.childElementCount > 0) {
				activeTurn.classList.add('is-exiting');
				await new Promise<void>((resolve) => window.setTimeout(resolve, 150));
				activeTurn.classList.remove('is-exiting');
			}
			const nextStatus = requestState.kind === 'recovery' || requestState.kind === 'terminal'
				? await requestStateElement(requestState) : null;
			if (version !== paintVersion) return;
			status = nextStatus;
			questionActive = Boolean(current.at(-1)?.questionnaire) && !chatRequestControls(requestState).composerLocked;
			const draftIds = questionsWithDrafts(turns);
			const questionDraft = questionActive ? cardDraft.forQuestion(draftIds.current) : undefined;
			if (turns.at(-1)?.role === 'Assistant') cardDraft.retain(draftIds);
			const earlierDrafts = cardDraft.earlierDrafts(draftIds.earlier);
			history = groupEarlierSteps(earlier).map((step, index, steps) =>
				<HistoryStep key={index} step={step} index={index} previousReply={steps[index - 1]?.at(-1)}
					drafts={earlierDrafts} />);
			visibleTurns = current.map((item, index) => {
				const last = index === current.length - 1;
				return <ActiveTurn key={`${earlier.length + index}-${item.role}`}
					item={item}
					questionDraft={last ? questionDraft : undefined}
					announce={kind === 'hold' && last}
					stagger={kind === 'hold' && hasEntered && !reduceMotion && last && item.role !== 'Assistant'}
					interactive={last && Boolean(item.questionnaire) && !chatRequestControls(requestState).composerLocked}
					steering={last && item.role === 'Assistant' && requestState.kind === 'idle'}
					onQuestionnaireSubmit={(answers) => {
						if (!item.questionnaire) return;
						const kind = answers[0]?.help;
						const cardHelp = kind && item.submissionId ? { kind, sourceId: item.submissionId } : undefined;
						void sendMessage(formatQuestionnaireAnswers(item.questionnaire, answers), { kind: 'card', cardHelp });
					}}
					onSteer={(kind) => void sendMessage(formatSteeringMessage(kind), { kind: 'steering' })}
				/>;
			});
			renderTranscript();
			syncTrail();
			if (kind === 'new-turn' || kind === 'hold') hasEntered = true;
			document.body.classList.toggle('encounter-active', turns.length > 1);
			const nothingSaidYet = current.length === 0 && requestState.kind === 'idle';
			document.body.classList.toggle('conversation-empty', nothingSaidYet);
			input.placeholder = nothingSaidYet ? 'What are you working on?' : 'Your reply';
			document.body.classList.toggle('questionnaire-active', questionActive);
			unsentWork.sync();
		};

		switch (kind) {
			case 'hold':
				await transcript.hold(render, landing);
				return;
			case 'new-turn':
				await render();
				transcript.followLiveEdge();
				return;
			case 'restore':
				await render();
				transcript.pinCurrentStart();
				return;
			default: {
				const exhaustive: never = kind;
				return exhaustive;
			}
		}
	}

	function applyRequestControls(state: ChatRequestState) {
		applyRequestControlState(state, elements);
		options.onStartOverDisabledChange(chatRequestControls(state).startOverDisabled);
		dictation.setEnabled(!chatRequestControls(state).composerLocked);
	}

	const sound = mountSoundCues();
	watchChatConversationReset(() => {
		cardDraft.clear();
		draft.clear();
		location.reload();
	}, () => { storageNotice.textContent = conversationSwitchGuidance; });
	// Another tab's turn settled: an idle tab shows it. A busy tab keeps its own state.
	let settledElsewhere = false;
	watchChatTurnSettled(conversation.id, async () => {
		settledElsewhere = true;
		const typing = document.activeElement === input;
		await restoreConversation();
		if (typing && !input.disabled) input.focus();
	});
	trailToggle.addEventListener('click', () => setTrailOpen(!trailOpen));

	const composerShell = requireElement<HTMLElement>('.composer-shell');
	new ResizeObserver(() => {
		const noticeHeight = storageNotice.offsetHeight;
		const grow = noticeHeight
			+ input.offsetHeight - parseFloat(getComputedStyle(input).minHeight);
		document.documentElement.style.setProperty('--composer-grow', `${Math.max(0, grow)}px`);
		document.documentElement.style.setProperty('--storage-notice-height', `${noticeHeight}px`);
	}).observe(composerShell);

	// The field's last lines fade under the send controls. While the caret is at
	// the end, keep the line being typed above the fade (#194).
	function keepEndInView() {
		const end = input.value.length;
		if (input.selectionStart === end && input.selectionEnd === end) input.scrollTop = input.scrollHeight;
	}
	input.addEventListener('input', keepEndInView);
	input.addEventListener('keyup', keepEndInView);

	input.addEventListener('keydown', (event) => {
		if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
			event.preventDefault();
			form.requestSubmit();
		}
	});

	async function sendMessage(text: string, source: SendSource) {
		const retryOf = source.kind === 'retry' ? source.attempt : undefined;
		if (!retryOf && chatRequestControls(requests.state).composerLocked) return;
		liveTools.length = 0;
		quietToolIds.clear();
		liveTextShown = false;
		sound.beginReply();
		const submittedDraft = (source.kind === 'composer' || retryOf?.outcome === 'not-admitted') && input.value.trim() === text
			? input.value : undefined;
		const previous = turns.at(-1);
		const replacesAttempt = retryOf && previous?.role === 'You' && previous.text === retryOf.text;
		const before = replacesAttempt ? turns.slice(0, -1) : turns;
		const cardHelp = source.kind === 'card' ? source.cardHelp
			: replacesAttempt && previous.text === text ? previous.cardHelp : undefined;
		const learnerTurn = displayedLearnerTurn(text, before.at(-1)?.questionnaire, cardHelp);
		liveReply = createLiveReply(text, cardHelp?.kind);
		const result = requests.start(text, {
			cardHelp,
			onAdmitted() {
				if (!keepsQuestionDraft(learnerTurn)) cardDraft.discard(questionsWithDrafts(before).current);
				if (submittedDraft === undefined || input.value !== submittedDraft) return;
				input.value = '';
				draft.clear();
			},
		});
		requestState = requests.state;
		applyRequestControls(requestState);
		if (requestState.kind === 'terminal') {
			await paint('hold');
			focusAfterRequestStatePaint(requestState, elements);
			await result;
			return;
		}
		turns = [...before, learnerTurn];
		await paint('new-turn');
		await applyRequestState(await result);
	}

	async function appendAssistantReply(reply: WireReply) {
		const turn = displayedAssistantTurn({
			text: reply.text,
			questionnaire: questionnaireFromReplyData(reply.data),
			submissionId: reply.submissionId,
			reveal: revealFromReply(reply.data),
			modelRoute: modelRouteLabel(reply.metadata),
			tools: liveTools,
		});
		liveTools.length = 0;
		quietToolIds.clear();
		if (turn) turns = [...turns, turn];
		await paint('hold', liveTextShown ? 'live-edge' : 'start');
	}

	async function runRequestCommand(result: Promise<ChatRequestState>) {
		requestState = requests.state;
		applyRequestControls(requestState);
		if (requestState.kind === 'waiting' || requestState.kind === 'canceling') {
			await paint(requestState.kind === 'waiting' ? 'new-turn' : 'hold');
		}
		await applyRequestState(await result);
	}

	async function applyRequestState(state: ChatRequestState, moveFocus = true) {
		if (requests.state !== state) return;
		requestState = state;
		if (state.kind === 'completed' || (state.kind === 'terminal' && state.outcome !== 'not-admitted')) {
			announceChatTurnSettled(conversation.id);
		}
		if (state.kind === 'completed') {
			requests.acknowledgeCompleted();
			requestState = requests.state;
			applyRequestControls(requestState);
			sound.complete(state.reply);
			await appendAssistantReply(state.reply);
			if (moveFocus) focusAfterRequestStatePaint(requestState, elements);
			return;
		}
		if (state.kind === 'terminal' && isGuestTurnLimitError(state)) {
			if (!input.value) input.value = state.text;
			const last = turns.at(-1);
			if (last?.role === 'You' && last.text === state.text) turns = turns.slice(0, -1);
		}
		applyRequestControls(state);
		await paint('hold');
		if (moveFocus) focusAfterRequestStatePaint(state, elements);
	}

	form.addEventListener('submit', async (event) => {
		event.preventDefault();
		if (dictation.stopForReview()) return;
		const text = input.value.trim();
		if (!text || chatRequestControls(requests.state).composerLocked) return;
		await sendMessage(text, { kind: 'composer' });
	});

	async function restoreConversation() {
		if (requests.state.kind !== 'idle') return;
		settledElsewhere = false;
		let unsettled: ReturnType<typeof unsettledSubmissionFromHistory> | undefined;
		requests.beginRestore();
		requestState = requests.state;
		applyRequestControls(requestState);
		try {
			let visible: DisplayedTurn[] = [];
			try {
				const history = await conversation.history();
				unsettled = unsettledSubmissionFromHistory(history);
				const unsettledSubmissionId = unsettled?.submissionId;
				const restoredHistory = unsettled
					? {
						...history,
						messages: history.messages.filter(
							(message) => message.submissionId !== unsettledSubmissionId || message.role === 'user',
						),
					}
					: history;
				visible = visibleTurnsFromHistory(restoredHistory);
				if (unsettled) {
					liveReply = createLiveReply(unsettled.text, unsettled.cardHelp?.kind);
					requestState = requests.hydrate(unsettled.text, unsettled.submissionId);
				} else {
					requests.finishRestore();
					requestState = requests.state;
				}
			} catch (error) {
				requests.finishRestore();
				requestState = requests.state;
				if (!(error instanceof ChatApiError && error.status === 404)) {
					turns = [
						{
							role: 'Error',
							text: error instanceof Error ? error.message : 'Unable to restore this conversation.',
						},
					];
					await paint('restore');
					return;
				}
			}
			turns = visible;
			await paint('restore');
		} finally {
			applyRequestControls(requestState);
			if (settledElsewhere) void restoreConversation();
		}
		if (unsettled) await applyRequestState(await requests.recheck(), false);
	}

	void restoreConversation();
	return {
		conversationId: conversation.id,
		hasConversation() {
			return turns.length > 0 || requestState.kind !== 'idle';
		},
		focusComposer() {
			input.focus();
		},
		dispose: unsentWork.dispose,
		startOverDescription() {
			const affected: string[] = [];
			if (input.value.trim()) affected.push('Your unsent text in this tab will be deleted.');
			if (hasCardWork()) affected.push('Your question-card work in this tab will be deleted.');
			const elsewhere = unsentWork.elsewhere();
			if (elsewhere === 'present') affected.push('Unsent work in your other open tabs will be deleted.');
			if (elsewhere === 'unknown') affected.push('Unsent work in other open tabs could be deleted.');
			if (turns.length) affected.push('This conversation will close in your open tabs.');
			return affected.length ? affected.join(' ') : undefined;
		},
		startOver() {
			return startNewChatConversation(options.userId, () => {
				unsentWork.clearStale();
				dictation.cancel();
				cardDraft.clear();
				draft.clear();
			});
		},
		switchConversation(id: string) {
			return switchChatConversation(id, () => dictation.cancel());
		},
		sound,
	};
}

function isQuietToolStreamEvent(
	event: { type: string; toolName?: string; toolCallId?: string },
	quietToolIds: Set<string>,
): boolean {
	if (event.type === 'tool-input' && event.toolName === revealToolName) {
		if (event.toolCallId) quietToolIds.add(event.toolCallId);
		return true;
	}
	return Boolean(event.toolCallId && quietToolIds.has(event.toolCallId));
}

function queryChatSurface() {
	const form = requireElement<HTMLFormElement>('#chat');
	const lockup = requireElement<HTMLButtonElement>('#menu-trigger');
	return {
		form,
		input: requireElement<HTMLTextAreaElement>('#message'),
		messages: requireElement<HTMLOListElement>('#messages'),
		button: requireElement<HTMLButtonElement>('.composer-send button[type="submit"]', form),
		lockup,
		card: requireElement<HTMLElement>('.active-node'),
		activeTurn: requireElement<HTMLElement>('#active-turn'),
		trailToggle: requireElement<HTMLButtonElement>('#trail-toggle'),
		trailLabel: requireElement<HTMLElement>('#trail-toggle-label'),
		dictationToggle: requireElement<HTMLButtonElement>('#dictation-toggle'),
		dictationStatus: requireElement<HTMLElement>('#dictation-status'),
	};
}
