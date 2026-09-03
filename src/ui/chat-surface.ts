import {
	FlueApiError,
	type AgentReadResult,
} from '@flue/sdk';
import {
	ChatRequestCoordinator,
	chatRequestControls,
	type ChatRequestState,
	openChatConversation,
	startNewChatConversation,
	unsettledSubmissionFromHistory,
} from './client/conversation.ts';
import { initAppearance, toggleAppearance } from './theme.ts';
import { cycleTypeSize, initTypeSize } from './type-size.ts';
import { mountAppDock } from './app-dock.ts';
import { attachTranscriptScroll } from './transcript-scroll.ts';
import {
	groupEarlierSteps,
	splitCurrentTurns,
	visibleTurnsFromHistory,
	type DisplayedTurn,
} from './chat-turns.ts';
import { modelRouteLabel } from '../config/model-route.ts';
import { initChatAutoModel } from './chat-auto.ts';
import {
	formatQuestionnaireAnswers,
	questionnaireFromReplyData,
} from './questionnaire.ts';
import { mountDictation, type DictationVoiceActivity } from './dictation.ts';
import type { MarkdownRenderer } from './chat-markdown.ts';
import {
	createActiveTurn,
	createHistoryStep,
	createPendingTurn,
	createStarterTurn,
	type TurnStreamSinks,
} from './turn-view.ts';
import { mountMenuSheet } from './menu-sheet.ts';
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
	core: HTMLButtonElement;
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
	autoModel: HTMLButtonElement;
	dictationToggle: HTMLButtonElement;
	dictationStatus: HTMLElement;
};

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function mountChatSurface(options: Readonly<{
	elements?: ChatSurfaceElements;
	voiceActivity?: DictationVoiceActivity;
}> = {}): void {
	const elements = options.elements ?? queryChatSurface();
	const {
		form,
		input,
		messages,
		button,
		core,
		lockup,
		startOver,
		card,
		activeTurn,
		trailToggle,
		trailLabel,
		appearance,
		typeSize,
		autoModel,
		dictationToggle,
		dictationStatus,
	} = elements;
	initChatAutoModel(autoModel);
	const dictation = mountDictation({
		input,
		toggle: dictationToggle,
		status: dictationStatus,
		voiceActivity: options.voiceActivity,
		onSendRequested: () => form.requestSubmit(),
	});
	const conversation = openChatConversation();
	const requests = new ChatRequestCoordinator(conversation);
	const learningDock = mountAppDock(core);
	let working = false;
	let trailOpen = false;
	let hasEntered = false;
	let turns: DisplayedTurn[] = [];
	let requestState: ChatRequestState = requests.state;
	const transcript = attachTranscriptScroll(card);
	const streamTimers: number[] = [];
	const markdownRenderers: MarkdownRenderer[] = [];
	const turnSinks: TurnStreamSinks = {
		trackRenderer: (renderer) => {
			markdownRenderers.push(renderer);
		},
		trackTimer: (id) => {
			streamTimers.push(id);
		},
	};

	function wait(ms: number) {
		return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
	}

	function clearStream() {
		for (const id of streamTimers) window.clearTimeout(id);
		streamTimers.length = 0;
		for (const renderer of markdownRenderers) renderer.destroy();
		markdownRenderers.length = 0;
	}

	function createRequestStateTurn(
		state: Extract<ChatRequestState, { kind: 'recovery' | 'terminal' }>,
	) {
		if (state.kind === 'terminal') {
			return buildRequestStateTurn(state, () => requests.retry(), (result) => {
				void runRequestCommand(result);
			});
		}
		return buildRequestStateTurn(state, () => requests.recheck(), (result) => {
			void runRequestCommand(result);
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

			if (current.length === 0 && requestState.kind === 'idle') {
				const starter = createStarterTurn((prompt) => {
					input.value = prompt;
					input.focus();
				});
				if (starter) {
					activeTurn.replaceChildren(starter);
				} else {
					activeTurn.replaceChildren();
				}
			} else {
				activeTurn.replaceChildren(
					...current.map((item, index) => {
						const isLast = index === current.length - 1;
						const stream = kind === 'hold' && isLast && item.role === 'Assistant' && !reduceMotion;
						return createActiveTurn(item, {
							announce: kind === 'hold' && isLast,
							stagger: kind === 'hold' && hasEntered && !reduceMotion && isLast && !stream,
							interactive: isLast && Boolean(item.questionnaire),
							stream,
						}, turnSinks, (answers) => {
							const questionnaire = item.questionnaire;
							if (questionnaire) void sendMessage(formatQuestionnaireAnswers(questionnaire, answers));
						});
					}),
				);
			}
			if (requestState.kind === 'waiting' || requestState.kind === 'canceling') {
				activeTurn.append(createPendingTurn({
					cancelDisabled: requestState.kind === 'canceling',
					observeRoot: activeTurn,
					onCancel: () => {
						void runRequestCommand(requests.cancel());
					},
				}));
			}
			if (requestState.kind === 'recovery' || requestState.kind === 'terminal') {
				activeTurn.append(createRequestStateTurn(requestState));
			}
			if (kind === 'new-turn' || kind === 'hold') hasEntered = true;
			document.body.classList.toggle('encounter-active', turns.length > 1);
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

	function setWorking(next: boolean) {
		working = next;
		dictation.setEnabled(!next);
		input.disabled = next;
		button.disabled = next;
		startOver.disabled = next;
		core.classList.toggle('is-working', next);
		lockup.classList.toggle('is-working', next);
	}

	function applyRequestControls(state: ChatRequestState) {
		working = applyRequestControlState(state, elements);
		dictation.setEnabled(!chatRequestControls(state).composerLocked);
	}

	function focusAfterRequestPaint(state: ChatRequestState) {
		focusAfterRequestStatePaint(state, elements);
	}

	initAppearance(appearance);
	initTypeSize(typeSize);
	startOver.addEventListener('click', () => {
		dictation.cancel();
		startNewChatConversation();
	});
	appearance.addEventListener('click', () => toggleAppearance(appearance));
	typeSize.addEventListener('click', () => cycleTypeSize(typeSize));
	mountMenuSheet(elements, {
		reduceMotion,
		onOpen: () => learningDock.close(),
	});
	trailToggle.addEventListener('click', () => setTrailOpen(!trailOpen));

	input.addEventListener('keydown', (event) => {
		if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
			event.preventDefault();
			form.requestSubmit();
		}
	});

	async function sendMessage(text: string) {
		if (working || requests.state.kind !== 'idle') return;
		turns = [...turns, { role: 'You', text }];
		input.value = '';
		await startRequest(text);
	}

	async function startRequest(text: string) {
		const result = requests.start(text);
		requestState = requests.state;
		applyRequestControls(requestState);
		await paint('new-turn');
		await applyRequestState(await result);
	}

	async function appendAssistantReply(reply: AgentReadResult) {
		const questionnaire = questionnaireFromReplyData(reply.data);
		const route = modelRouteLabel(reply.metadata);
		turns = [
			...turns,
			{
				role: 'Assistant',
				text: reply.text,
				...(questionnaire ? { questionnaire } : {}),
				...(route ? { modelRoute: route } : {}),
			},
		];
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
		focusAfterRequestPaint(state);
	}

	form.addEventListener('submit', async (event) => {
		event.preventDefault();
		if (dictation.stopForReview()) return;
		const text = input.value.trim();
		if (!text || working) return;
		await sendMessage(text);
	});

	async function restoreConversation() {
		if (working) return;
		let unsettled: ReturnType<typeof unsettledSubmissionFromHistory>;
		setWorking(true);
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
				}
			} catch (error) {
				if (!(error instanceof FlueApiError && error.status === 404)) {
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
			focusAfterRequestPaint(requestState);
		}
		if (unsettled) await runRequestCommand(requests.recheck());
	}

	void restoreConversation();
}

function requireElement<T extends Element>(selector: string, root: ParentNode = document): T {
	const node = root.querySelector<T>(selector);
	if (!node) throw new Error('Socratink chat markup is missing required nodes.');
	return node;
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
		core: requireElement<HTMLButtonElement>('.alive-core'),
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
		autoModel: requireElement<HTMLButtonElement>('#auto-model'),
		dictationToggle: requireElement<HTMLButtonElement>('#dictation-toggle'),
		dictationStatus: requireElement<HTMLElement>('#dictation-status'),
	};
}
