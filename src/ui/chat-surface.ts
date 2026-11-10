import { ChatApiError, type WireReply } from '../config/chat-wire.ts';
import { createAuthGateCard, hasAuthProvider } from './chat-gate.ts';
import './chat-gate.css';
import { loadAuthProviders, type AuthProviders } from './session.ts';
import {
	ChatRequestCoordinator,
	chatRequestControls,
	type ChatRequestState,
	openChatConversation,
	startNewChatConversation,
	unsettledSubmissionFromHistory,
	watchChatConversationReset,
} from './client/conversation.ts';
import { initAppearance, toggleAppearance } from './theme.ts';
import { cycleTypeSize, initTypeSize } from './type-size.ts';
import { attachTranscriptScroll } from './transcript-scroll.ts';
import {
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
} from '../questionnaire.ts';
import { revealToolName, revealFromReply } from '../reveal.ts';
import { formatSteeringMessage } from './steering.ts';
import {
	applyToolStreamEvent,
	type DisplayedToolCall,
} from './tool-state.ts';
import {
	applyReasoningStreamEvent,
	createLiveReasoning,
	resetLiveReasoning,
} from './thinking.ts';
import { mountDictation } from './dictation.ts';
import type { MarkdownRenderer } from './chat-markdown.ts';
import {
	createActiveTurn,
	createHistoryStep,
	createPendingTurn,
	type PendingTurnSession,
	type TurnStreamSinks,
} from './turn-view.ts';
import { mountMenuSheet } from './menu-sheet.ts';
import { mountProviders } from './providers.ts';
import { requireElement } from './dom.ts';
import {
	applyRequestControlState,
	buildRequestStateTurn,
	focusAfterRequestStatePaint,
} from './chat-request-view.ts';

type PaintKind = 'restore' | 'new-turn' | 'hold';

type ChatSurfaceElements = {
	form: HTMLFormElement;
	input: HTMLTextAreaElement;
	messages: HTMLOListElement;
	button: HTMLButtonElement;
	lockup: HTMLButtonElement;
	canvas: HTMLElement;
	startOver: HTMLButtonElement;
	card: HTMLElement;
	activeTurn: HTMLElement;
	peekHandle: HTMLButtonElement;
	menuLayer: HTMLElement;
	menuPanel: HTMLElement;
	menuHandle: HTMLElement;
	menuBackdrop: HTMLButtonElement;
	menuFirst: HTMLElement;
	trailToggle: HTMLButtonElement;
	trailLabel: HTMLElement;
	appearance: HTMLButtonElement;
	typeSize: HTMLButtonElement;
	dictationToggle: HTMLButtonElement;
	dictationStatus: HTMLElement;
};

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function mountChatSurface(options: Readonly<{
	userId: string;
	aliases: readonly string[];
}>): void {
	const elements = queryChatSurface();
	const {
		form,
		input,
		messages,
		startOver,
		card,
		activeTurn,
		trailToggle,
		trailLabel,
		appearance,
		typeSize,
		dictationToggle,
		dictationStatus,
	} = elements;
	mountProviders();
	const dictation = mountDictation({
		input,
		toggle: dictationToggle,
		status: dictationStatus,
		onSendRequested: () => form.requestSubmit(),
	});
	const conversation = openChatConversation(options.userId, options.aliases);
	const liveTools: DisplayedToolCall[] = [];
	const quietToolIds = new Set<string>();
	const liveReasoning = createLiveReasoning();
	const requests = new ChatRequestCoordinator(conversation, {
		onEvent: (event) => {
			if (applyReasoningStreamEvent(liveReasoning, event)) {
				pendingSession?.setReasoning(liveReasoning.text);
				return;
			}
			if (isQuietToolStreamEvent(event, quietToolIds)) return;
			if (!applyToolStreamEvent(liveTools, event)) return;
			pendingSession?.setTools(liveTools);
		},
	});
	let trailOpen = false;
	let hasEntered = false;
	let turns: DisplayedTurn[] = [];
	let requestState: ChatRequestState = requests.state;
	const transcript = attachTranscriptScroll(card);
	const markdownRenderers: MarkdownRenderer[] = [];
	let pendingSession: PendingTurnSession | undefined;
	const turnSinks: TurnStreamSinks = {
		trackRenderer: (renderer) => {
			markdownRenderers.push(renderer);
		},
	};
	function wait(ms: number) {
		return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
	}

	function clearStream() {
		for (const renderer of markdownRenderers) renderer.destroy();
		markdownRenderers.length = 0;
	}

	function releasePending() {
		pendingSession?.dispose();
		pendingSession = undefined;
	}

	let cachedProviders: AuthProviders | undefined;
	async function gateProviders(): Promise<AuthProviders> {
		cachedProviders ??= await loadAuthProviders();
		return cachedProviders;
	}

	async function requestStateElement(
		state: Extract<ChatRequestState, { kind: 'recovery' | 'terminal' }>,
	): Promise<HTMLElement> {
		if (isGuestTurnLimitError(state)) {
			const providers = await gateProviders();
			if (hasAuthProvider(providers)) return createAuthGateCard(providers);
		}
		return createRequestStateTurn(state);
	}

	function createRequestStateTurn(
		state: Extract<ChatRequestState, { kind: 'recovery' | 'terminal' }>,
	) {
		return buildRequestStateTurn(state, () => {
			if (state.kind === 'recovery') {
				void runRequestCommand(requests.recheck());
				return;
			}
			const text = state.outcome === 'not-admitted' ? input.value.trim() || state.text : state.text;
			void startRequest(text, state);
		});
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

	async function paint(kind: PaintKind) {
		const render = async () => {
			clearStream();
			const { earlier, current } = splitCurrentTurns(turns);
			messages.replaceChildren(
				...groupEarlierSteps(earlier).map((step, index) => createHistoryStep(step, index)),
			);
			syncTrail();

			if (kind === 'new-turn' && hasEntered && !reduceMotion && activeTurn.childElementCount > 0) {
				activeTurn.classList.add('is-exiting');
				await wait(150);
				activeTurn.classList.remove('is-exiting');
			}

			activeTurn.replaceChildren(
				...current.map((item, index) => {
					const isLast = index === current.length - 1;
					const stream = kind === 'hold' && isLast && item.role === 'Assistant' && !reduceMotion;
					return createActiveTurn(item, {
						announce: kind === 'hold' && isLast,
						stagger: kind === 'hold' && hasEntered && !reduceMotion && isLast && !stream,
						interactive: isLast && Boolean(item.questionnaire),
						steering: isLast && item.role === 'Assistant' && requestState.kind === 'idle',
						stream,
					}, turnSinks, {
						onQuestionnaireSubmit: (answers) => {
							const questionnaire = item.questionnaire;
							if (questionnaire) {
								void sendMessage(formatQuestionnaireAnswers(questionnaire, answers));
							}
						},
						onSteer: (steering) => {
							void sendMessage(formatSteeringMessage(steering));
						},
					});
				}),
			);
			if (requestState.kind === 'waiting' || requestState.kind === 'canceling') {
				if (!pendingSession) {
					pendingSession = createPendingTurn({
						cancelDisabled: requestState.kind === 'canceling',
						tools: liveTools,
						reasoning: liveReasoning.text,
						onCancel: () => {
							void runRequestCommand(requests.cancel());
						},
					});
				} else {
					pendingSession.setCancelDisabled(requestState.kind === 'canceling');
					pendingSession.setReasoning(liveReasoning.text);
					pendingSession.setTools(liveTools);
				}
				activeTurn.append(pendingSession.element);
			} else {
				releasePending();
			}
			if (requestState.kind === 'recovery' || requestState.kind === 'terminal') {
				activeTurn.append(await requestStateElement(requestState));
			}
			if (kind === 'new-turn' || kind === 'hold') hasEntered = true;
			document.body.classList.toggle('encounter-active', turns.length > 1);
			const nothingSaidYet = current.length === 0 && requestState.kind === 'idle';
			document.body.classList.toggle('conversation-empty', nothingSaidYet);
			input.placeholder = nothingSaidYet ? 'What are you working on?' : '';
			document.body.classList.toggle(
				'questionnaire-active',
				Boolean(current.at(-1)?.questionnaire && requestState.kind === 'idle'),
			);
		};

		switch (kind) {
			case 'hold':
				await transcript.hold(render);
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
		dictation.setEnabled(!chatRequestControls(state).composerLocked);
	}

	initAppearance(appearance);
	initTypeSize(typeSize);
	startOver.addEventListener('click', () => {
		dictation.cancel();
		startNewChatConversation(options.userId);
	});
	watchChatConversationReset(() => {
		location.reload();
	});
	appearance.addEventListener('click', () => toggleAppearance(appearance));
	typeSize.addEventListener('click', () => cycleTypeSize(typeSize));
	mountMenuSheet(elements, {
		reduceMotion,
	});
	trailToggle.addEventListener('click', () => setTrailOpen(!trailOpen));

	input.addEventListener('keydown', (event) => {
		if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
			event.preventDefault();
			form.requestSubmit();
		}
	});

	async function sendMessage(text: string) {
		if (chatRequestControls(requests.state).composerLocked) return;
		await startRequest(text);
	}

	async function startRequest(
		text: string,
		retryOf?: Extract<ChatRequestState, { kind: 'terminal' }>,
	) {
		liveTools.length = 0;
		quietToolIds.clear();
		resetLiveReasoning(liveReasoning);
		releasePending();
		const result = requests.start(text);
		requestState = requests.state;
		applyRequestControls(requestState);
		if (requestState.kind === 'terminal') {
			await paint('hold');
			focusAfterRequestStatePaint(requestState, elements);
			await result;
			return;
		}
		if (!retryOf || retryOf.outcome === 'not-admitted') input.value = '';
		const previous = turns.at(-1);
		const replacesAttempt = retryOf && previous?.role === 'You' && previous.text === retryOf.text;
		turns = [...(replacesAttempt ? turns.slice(0, -1) : turns), displayedLearnerTurn(text)];
		await paint('new-turn');
		await applyRequestState(await result);
	}

	async function appendAssistantReply(reply: WireReply) {
		const turn = displayedAssistantTurn({
			text: reply.text,
			questionnaire: questionnaireFromReplyData(reply.data),
			reveal: revealFromReply(reply.data),
			modelRoute: modelRouteLabel(reply.metadata),
			tools: liveTools,
		});
		liveTools.length = 0;
		quietToolIds.clear();
		resetLiveReasoning(liveReasoning);
		if (turn) turns = [...turns, turn];
		await paint('hold');
	}

	async function runRequestCommand(result: Promise<ChatRequestState>) {
		requestState = requests.state;
		applyRequestControls(requestState);
		if (requestState.kind === 'waiting' || requestState.kind === 'canceling') {
			await paint(requestState.kind === 'waiting' ? 'new-turn' : 'hold');
		}
		await applyRequestState(await result);
	}

	async function applyRequestState(state: ChatRequestState) {
		if (requests.state !== state) return;
		requestState = state;
		if (state.kind === 'completed') {
			requests.acknowledgeCompleted();
			requestState = requests.state;
			applyRequestControls(requestState);
			await appendAssistantReply(state.reply);
			input.focus();
			return;
		}
		applyRequestControls(state);
		await paint('hold');
		focusAfterRequestStatePaint(state, elements);
	}

	form.addEventListener('submit', async (event) => {
		event.preventDefault();
		if (dictation.stopForReview()) return;
		const text = input.value.trim();
		if (!text || chatRequestControls(requests.state).composerLocked) return;
		await sendMessage(text);
	});

	async function restoreConversation() {
		if (requests.state.kind !== 'idle') return;
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
			focusAfterRequestStatePaint(requestState, elements);
		}
		if (unsettled) await runRequestCommand(requests.recheck());
	}

	void restoreConversation();
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

function queryChatSurface(): ChatSurfaceElements {
	const form = requireElement<HTMLFormElement>('#chat');
	const lockup = requireElement<HTMLButtonElement>('#menu-trigger');
	const canvas = lockup.closest<HTMLElement>('.app-canvas');
	if (!canvas) throw new Error('Socratink chat markup is missing required nodes.');
	return {
		form,
		input: requireElement<HTMLTextAreaElement>('#message'),
		messages: requireElement<HTMLOListElement>('#messages'),
		button: requireElement<HTMLButtonElement>('.composer-send button[type="submit"]', form),
		lockup,
		canvas,
		startOver: requireElement<HTMLButtonElement>('#start-over'),
		card: requireElement<HTMLElement>('.active-node'),
		activeTurn: requireElement<HTMLElement>('#active-turn'),
		peekHandle: requireElement<HTMLButtonElement>('#peek-handle'),
		menuLayer: requireElement<HTMLElement>('#menu-layer'),
		menuPanel: requireElement<HTMLElement>('#menu-dialog'),
		menuHandle: requireElement<HTMLElement>('#menu-handle'),
		menuBackdrop: requireElement<HTMLButtonElement>('#menu-backdrop'),
		menuFirst: requireElement<HTMLElement>('.menu-orbs a, .menu-orbs button'),
		trailToggle: requireElement<HTMLButtonElement>('#trail-toggle'),
		trailLabel: requireElement<HTMLElement>('#trail-toggle-label'),
		appearance: requireElement<HTMLButtonElement>('#appearance-toggle'),
		typeSize: requireElement<HTMLButtonElement>('#type-size-toggle'),
		dictationToggle: requireElement<HTMLButtonElement>('#dictation-toggle'),
		dictationStatus: requireElement<HTMLElement>('#dictation-status'),
	};
}

function isGuestTurnLimitError(state: ChatRequestState): boolean {
	return (
		state.kind === 'terminal'
		&& state.outcome === 'not-admitted'
		&& state.code === 'guest_turn_limit'
	);
}
