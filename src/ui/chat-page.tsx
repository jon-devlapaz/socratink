import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { feedbackToken } from '../config/feedback-client.ts';
import { ConversationLayout } from './conversation-layout.tsx';
import { FeedbackDialog } from './feedback.tsx';
import { HistoryDialog } from './history.tsx';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { MenuSheet, useSheetGesture } from './menu-sheet.tsx';
import type { mountChatSurface, TranscriptContent } from './chat-surface.tsx';
import type { SessionUser } from './session.ts';
import wordmark from './brand-wordmark.png';

type ChatSession = { user: SessionUser } & ReturnType<typeof mountChatSurface>;
type DialogPage = 'history' | 'start-over' | 'feedback';

type ChatPageProps = {
	startChat?: (
		onStartOverDisabledChange: (disabled: boolean) => void,
		onTranscriptChange: (content: TranscriptContent) => void,
	) => Promise<ChatSession | undefined>;
};

export function ChatPage({ startChat }: ChatPageProps = {}) {
	const [content, setContent] = useState<TranscriptContent>({
		history: null,
		active: null,
		questionActive: false,
	});
	const [session, setSession] = useState<ChatSession>();
	const [pullDistance, setPullDistance] = useState(0);
	const [layer, setLayer] = useState<'menu' | DialogPage>();
	const [startOverDisabled, setStartOverDisabled] = useState(true);
	const [startOverDescription, setStartOverDescription] = useState('');
	const brand = useRef<HTMLButtonElement>(null);
	const skipMenuFocus = useRef(false);
	useEffect(() => {
		let active = true;
		let mounted: ChatSession | undefined;
		if (startChat) void startChat(setStartOverDisabled, setContent).then((next) => {
			if (!active) return next?.dispose();
			mounted = next;
			setSession(next);
		});
		return () => {
			active = false;
			mounted?.dispose();
		};
	}, [startChat]);
	const openMenu = () => {
		if (!session) return;
		skipMenuFocus.current = false;
		setLayer('menu');
	};
	const openDialog = (page: DialogPage) => {
		skipMenuFocus.current = true;
		setLayer(page);
	};
	const closeDialog = () => setLayer(undefined);
	const restoreFocus = () => brand.current?.focus();
	const peekGesture = useSheetGesture('open', openMenu, setPullDistance);
	const menuButton = {
		type: 'button',
		'aria-expanded': layer === 'menu',
		'aria-haspopup': 'dialog',
		'aria-controls': 'menu-dialog',
		disabled: !session,
	} as const;

	return (
		<>
			<Button asChild variant="link">
				<a className="skip-link" href="#main-content">
					Skip to main content
				</a>
			</Button>
			<div
				{...(session ? peekGesture : {})}
				className="peek-handle"
				id="peek-handle"
				aria-hidden="true"
			/>
			<div className="app-canvas">
				<header className="app-header">
					<div className="app-header-row">
						<Button
							{...menuButton}
							ref={brand}
							variant="ghost"
							className="brand-lockup"
							id="menu-trigger"
							onClick={openMenu}
						>
							<span className="brand-mark" aria-hidden="true" />
							<img className="brand-name" src={wordmark} alt="" />
							<span className="sr-only">Open menu</span>
						</Button>
					</div>
				</header>
				<ConversationLayout {...content} />
			</div>
			<MenuSheet
				open={layer === 'menu'}
				pullDistance={pullDistance}
				onClose={() => setLayer(undefined)}
				onCloseFocus={() => {
					if (!skipMenuFocus.current) restoreFocus();
				}}
				registered={session?.user.kind === 'registered'}
				startOverDisabled={startOverDisabled}
				onStartOver={() => {
					const description = session?.startOverDescription();
					if (!description) return;
					setStartOverDescription(description);
					openDialog('start-over');
				}}
				sound={session?.sound}
				onHistory={() => openDialog('history')}
				onFeedback={feedbackToken ? () => openDialog('feedback') : undefined}
			/>
			{session && (
				<HistoryDialog
					open={layer === 'history'}
					currentId={session.conversationId}
					onSelect={session.switchConversation}
					onClose={closeDialog}
					onCloseFocus={restoreFocus}
				/>
			)}
			<Dialog
				open={layer === 'start-over'}
				onOpenChange={(value) => {
					if (!value) closeDialog();
				}}
			>
				<DialogContent
					id="start-over-dialog"
					onCloseAutoFocus={(event) => {
						event.preventDefault();
						restoreFocus();
					}}
				>
					<div className="start-over-content">
						<DialogTitle>Start a new conversation?</DialogTitle>
						<DialogDescription>
							{startOverDescription}{' '}
							Saved conversations are in History.
						</DialogDescription>
						<div className="start-over-actions">
							<Button variant="secondary" onClick={closeDialog}>
								Keep this conversation
							</Button>
							<Button variant="secondary" id="start-over-confirm" onClick={() => session?.startOver()}>
								Start new conversation
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
			{feedbackToken && session && (
				<FeedbackDialog
					open={layer === 'feedback'}
					token={feedbackToken}
					registered={session.user.kind === 'registered'}
					onClose={closeDialog}
					onCloseFocus={restoreFocus}
				/>
			)}
		</>
	);
}
