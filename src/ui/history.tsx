import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import type { ConversationSummary } from '../config/conversations.ts';
import { fetchConversations } from './client/conversation-list.ts';

const legacyHistoryKeyPrefix = 'socratink-chat-history';
type HistoryState = { kind: 'loading' | 'error' } | { kind: 'loaded'; entries: ConversationSummary[] };

type HistoryProps = {
	open: boolean;
	currentId: string;
	hasConversation: boolean;
	registered: boolean;
	onStart: () => void;
	onClose: () => void;
	onCloseFocus: () => void;
	onSelect: (id: string) => void;
};

export function HistoryDialog({
	open, currentId, hasConversation, registered, onStart, onClose, onCloseFocus, onSelect,
}: HistoryProps) {
	return (
		<Dialog
			open={open}
			onOpenChange={(value) => {
				if (!value) onClose();
			}}
		>
			<DialogContent
				id="history-dialog"
				onCloseAutoFocus={(event) => {
					event.preventDefault();
					onCloseFocus();
				}}
			>
				<HistoryList
					currentId={currentId}
					hasConversation={hasConversation}
					registered={registered}
					onStart={onStart}
					onSelect={(id) => (id === currentId ? onClose() : onSelect(id))}
					onClose={onClose}
				/>
			</DialogContent>
		</Dialog>
	);
}

function HistoryList({
	hasConversation,
	registered,
	onStart,
	currentId,
	onSelect,
	onClose,
}: Pick<HistoryProps, 'currentId' | 'hasConversation' | 'registered' | 'onStart' | 'onSelect' | 'onClose'>) {
	const [state, setState] = useState<HistoryState>({ kind: 'loading' });
	const [attempt, setAttempt] = useState(0);
	const retry = useRef<HTMLButtonElement>(null);
	useEffect(() => {
		let current = true;
		void fetchConversations().then(
			(entries) => {
				if (current) setState({ kind: 'loaded', entries });
			},
			() => {
				if (current) setState({ kind: 'error' });
			},
		);
		return () => {
			current = false;
		};
	}, [attempt]);
	useEffect(() => {
		if (state.kind === 'error') retry.current?.focus();
	}, [state]);
	const empty = state.kind === 'loaded' && state.entries.length === 0;
	return (
		<div className="history-page">
			<div className="history-head">
				<DialogTitle>{empty ? 'No conversations yet' : 'History'}</DialogTitle>
				<Button id="history-close" type="button" variant="secondary" onClick={onClose}>
					{hasConversation ? 'Back to conversation' : 'Close'}
				</Button>
			</div>
			<DialogDescription id={empty ? 'history-empty' : undefined} className="history-note">
				{empty
					? 'Your conversations appear here after you send a message.'
					: 'Your conversations. Choose one to open it.'}
			</DialogDescription>
			{state.kind === 'loading' && (
				<p id="history-status" role="status">
					Loading…
				</p>
			)}
			{state.kind === 'error' && (
				<>
					<p id="history-status" role="status">
						History could not load. Check your connection and try again.
					</p>
					<Button
						ref={retry}
						id="history-retry"
						type="button"
						variant="secondary"
						onClick={() => {
							setState({ kind: 'loading' });
							setAttempt((value) => value + 1);
						}}
					>
						Try again
					</Button>
				</>
			)}
			{state.kind === 'loaded' &&
				(state.entries.length > 0 ? (
					<ol id="history-list" aria-label="History">
						{state.entries.map((entry) => (
							<li key={entry.id}>
								<Button
									variant="ghost"
									aria-current={entry.id === currentId || undefined}
									onClick={() => onSelect(entry.id)}
								>
									<span className="history-title">{entry.title}</span>
									{entry.id === currentId ? (
										<span className="history-when">Open now</span>
									) : (
										<time className="history-when" dateTime={entry.updatedAt}>
											{usedLabel(entry.updatedAt)}
										</time>
									)}
								</Button>
							</li>
						))}
					</ol>
				) : (
					<>
						<Button id="history-start" type="button" onClick={onStart}>
							Start a conversation
						</Button>
						{!registered && (
							<p id="history-guest" className="history-note">
								<Button asChild variant="link"><a href="/login.html">Sign in</a></Button> to keep your History across devices.
							</p>
						)}
					</>
				))}
		</div>
	);
}

export function forgetLegacyHistory() {
	try {
		for (const key of Object.keys(localStorage))
			if (key.startsWith(legacyHistoryKeyPrefix)) localStorage.removeItem(key);
	} catch {}
}

function usedLabel(usedAt: string, now = new Date()): string {
	const used = new Date(usedAt);
	if (used.toDateString() === now.toDateString()) {
		return used.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
	}
	return used.toLocaleDateString(undefined, {
		month: 'short',
		day: 'numeric',
		...(used.getFullYear() === now.getFullYear() ? {} : { year: 'numeric' }),
	});
}
