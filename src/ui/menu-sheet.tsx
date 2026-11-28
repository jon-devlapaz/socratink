import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import type { mountSoundCues } from './sound-cues.ts';
import { cycleTypeSize, initTypeSize } from './type-size.ts';
import { initAppearance, toggleAppearance } from './theme.ts';
import { keepDraftsForSignIn } from './client/chat-draft.ts';

type Gesture = {
	startY: number;
	lastY: number;
	lastTime: number;
	velocity: number;
	moved: boolean;
};

export function useSheetGesture(
	direction: 'open' | 'close',
	activate: () => void,
	onPull?: (distance: number) => void,
) {
	const gesture = useRef<Gesture | null>(null);
	const suppressClick = useRef(false);

	const stop = (event: PointerEvent<HTMLElement>, canceled = false) => {
		const drag = gesture.current;
		gesture.current = null;
		if (!drag) return;
		const panel = event.currentTarget.closest<HTMLElement>('.menu-panel');
		panel?.style.removeProperty('transform');
		onPull?.(0);
		if (canceled || !drag.moved) return;
		suppressClick.current = true;
		const sign = direction === 'open' ? 1 : -1;
		const threshold = panel ? panel.offsetHeight / 4 : 48;
		if ((drag.lastY - drag.startY) * sign > threshold || drag.velocity * sign > 0.4) {
			activate();
		}
	};
	return {
		onPointerDown(event: PointerEvent<HTMLElement>) {
			suppressClick.current = false;
			if (event.button !== 0 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
			if (onPull) event.preventDefault();
			gesture.current = {
				startY: event.clientY,
				lastY: event.clientY,
				lastTime: performance.now(),
				velocity: 0,
				moved: false,
			};
			event.currentTarget.setPointerCapture(event.pointerId);
		},
		onPointerMove(event: PointerEvent<HTMLElement>) {
			const drag = gesture.current;
			if (!drag) return;
			const now = performance.now();
			drag.velocity = (event.clientY - drag.lastY) / Math.max(now - drag.lastTime, 1);
			drag.lastY = event.clientY;
			drag.lastTime = now;
			const distance = event.clientY - drag.startY;
			if (!drag.moved && Math.abs(distance) < 8) return;
			drag.moved = true;
			onPull?.(Math.max(0, distance));
			const panel = event.currentTarget.closest<HTMLElement>('.menu-panel');
			if (panel) panel.style.transform = `translateY(${Math.min(distance, distance * 0.15)}px)`;
		},
		onPointerUp: (event: PointerEvent<HTMLElement>) => stop(event),
		onPointerCancel: (event: PointerEvent<HTMLElement>) => stop(event, true),
		onClick(event: React.MouseEvent<HTMLElement>) {
			if (!suppressClick.current || event.detail === 0) activate();
			suppressClick.current = false;
		},
	};
}

type MenuProps = {
	open: boolean;
	pullDistance: number;
	onClose: () => void;
	onCloseFocus: () => void;
	registered: boolean;
	startOverDisabled: boolean;
	onStartOver: () => void;
	onHistory: () => void;
	sound?: ReturnType<typeof mountSoundCues>;
	onFeedback?: () => void;
};

export function MenuSheet(props: MenuProps) {
	const preview = !props.open && props.pullDistance > 0;
	return (
		<Sheet
			key={preview ? 'preview' : 'menu'}
			open={props.open}
			modal={!preview}
			onOpenChange={(open) => {
				if (!open) props.onClose();
			}}
		>
			<SheetContent
				id="menu-dialog"
				className="menu-panel"
				forceMount={preview || undefined}
				inert={preview}
				aria-hidden={preview || undefined}
				data-preview={preview || undefined}
				style={
					preview ? { transform: `translateY(min(0px, calc(-100% + ${props.pullDistance}px)))` } : undefined
				}
				onOpenAutoFocus={(event) => {
					if (preview) event.preventDefault();
				}}
				aria-describedby={undefined}
				onCloseAutoFocus={(event) => {
					event.preventDefault();
					if (!preview) props.onCloseFocus();
				}}
			>
				<SheetTitle className="sr-only">Menu</SheetTitle>
				<MenuActions {...props} />
			</SheetContent>
		</Sheet>
	);
}

function MenuActions({
	registered,
	startOverDisabled,
	onStartOver,
	onHistory,
	sound,
	onFeedback,
	onClose,
}: MenuProps) {
	const type = useRef<HTMLButtonElement>(null);
	const appearance = useRef<HTMLButtonElement>(null);
	const [soundOn, setSoundOn] = useState(sound?.enabled ?? false);
	const closeGesture = useSheetGesture('close', onClose);
	useEffect(() => {
		if (type.current) initTypeSize(type.current);
		if (appearance.current) initAppearance(appearance.current);
	}, []);
	return (
		<>
			<nav className="menu-orbs" aria-label="Menu actions">
				<Button
					variant="ghost"
					id="type-size-toggle"
					ref={type}
					type="button"
					data-size="medium"
					aria-label="Text size medium. Switch to small."
					onClick={(event) => cycleTypeSize(event.currentTarget)}
				>
					<span className="orb-glyph" aria-hidden="true">
						<span className="type-icon is-small" />
						<span className="type-icon is-medium" />
						<span className="type-icon is-big" />
					</span>
					<span id="type-size-label">Medium</span>
				</Button>
				<Button
					variant="ghost"
					id="appearance-toggle"
					ref={appearance}
					type="button"
					aria-label="Switch to dark appearance"
					aria-pressed={false}
					onClick={(event) => void toggleAppearance(event.currentTarget)}
				>
					<span className="orb-glyph" aria-hidden="true">
						<span className="theme-icon is-sun">
							<svg viewBox="0 0 24 24">
								<circle cx="12" cy="12" r="4" />
								<path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" />
							</svg>
						</span>
						<span className="theme-icon is-moon">
							<svg viewBox="0 0 24 24">
								<path d="M15.4 13.6A6.4 6.4 0 0 1 10.2 5.4 6.9 6.9 0 1 0 18.6 14a6.4 6.4 0 0 1-3.2-.4z" />
							</svg>
						</span>
					</span>
					Appearance
				</Button>
				<Button
					id="sound-toggle"
					variant="ghost"
					type="button"
					aria-pressed={soundOn}
					onClick={(event) => {
						if (sound) setSoundOn(sound.toggle(event.nativeEvent));
					}}
				>
					<span className="orb-glyph" aria-hidden="true">
						<svg viewBox="0 0 24 24">
							<path d="M4 9.5h3l4.5-4v13L7 14.5H4z" />
							<path className="sound-waves" d="M15 9.5a3.5 3.5 0 0 1 0 5M17.5 7a7 7 0 0 1 0 10" />
							<path className="sound-mute" d="M15.5 9.5l5 5M20.5 9.5l-5 5" />
						</svg>
					</span>
					<span id="sound-label">{soundOn ? 'Sound: on' : 'Sound: off'}</span>
				</Button>

				<Button
					variant="ghost"
					id="start-over"
					type="button"
					disabled={startOverDisabled}
					onClick={onStartOver}
				>
					<svg viewBox="0 0 24 24" aria-hidden="true">
						<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3M4.5 5.5v4h4" />
					</svg>
					Start over
				</Button>
				<Button
					id="history-trigger"
					type="button"
					variant="ghost"
					disabled={startOverDisabled}
					aria-haspopup="dialog"
					onClick={onHistory}
				>
					<svg viewBox="0 0 24 24" aria-hidden="true">
						<path d="M5 6.5h14M5 12h14M5 17.5h9" />
					</svg>
					History
				</Button>
				<Button asChild variant="ghost">
					<a id="auth-link" href={registered ? '/api/session/logout' : '/login.html'}
						onClick={registered ? undefined : keepDraftsForSignIn}>
						<svg viewBox="0 0 24 24" aria-hidden="true">
							<path d="M10 7V5.5A1.5 1.5 0 0 1 11.5 4h7A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 10 18.5V17M4 12h10M7.5 8.5 4 12l3.5 3.5" />
						</svg>
						<span id="auth-link-label">{registered ? 'Sign out' : 'Sign in'}</span>
					</a>
				</Button>
				{onFeedback && (
					<Button
						variant="ghost"
						id="feedback-trigger"
						type="button"
						aria-haspopup="dialog"
						onClick={onFeedback}
					>
						<svg viewBox="0 0 24 24" aria-hidden="true">
							<path d="M20 5H4v12h4v3l4-3h8zM8 9h8m-8 4h5" />
						</svg>
						Feedback
					</Button>
				)}
			</nav>
			<Button
				variant="ghost"
				className="menu-handle"
				id="menu-handle"
				type="button"
				aria-label="Close menu"
				{...closeGesture}
			/>
		</>
	);
}
