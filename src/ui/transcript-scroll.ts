const liveEdgePx = 48;
const fadePx = 40;
const fadeRevealPx = 96;

type TranscriptScroll = {
	followLiveEdge(): void;
	pinCurrentStart(): void;
	scrollToStart(): void;
	refresh(): void;
	hold(mutate: () => void | Promise<void>): Promise<void>;
	preserveAround(mutate: () => void | Promise<void>): Promise<void>;
	stopFollowing(): void;
};

export function attachTranscriptScroll(card: HTMLElement): TranscriptScroll {
	const scroller = requireChild<HTMLElement>(card, '.active-scroll');
	const jumpButton = requireChild<HTMLButtonElement>(card, '#jump-latest');
	const trailToggle = requireChild<HTMLButtonElement>(card, '#trail-toggle');
	const activeTurn = requireChild<HTMLElement>(card, '#active-turn');
	const spacer = requireChild<HTMLElement>(card, '#turn-spacer');
	const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	let following = true;
	let ignoreScroll = 0;

	function atLiveEdge(): boolean {
		return scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight <= liveEdgePx;
	}

	function canScroll(): boolean {
		return scroller.scrollHeight > scroller.clientHeight + 1;
	}

	function syncJump() {
		jumpButton.hidden = !(canScroll() && !following && !atLiveEdge());
	}

	function syncFade() {
		const max = scroller.scrollHeight - scroller.clientHeight;
		if (max <= 1) {
			scroller.style.setProperty('--scroll-fade-t', '0px');
			scroller.style.setProperty('--scroll-fade-b', '0px');
			return;
		}
		const top = Math.min(fadePx, (scroller.scrollTop / fadeRevealPx) * fadePx);
		const bottom = Math.min(fadePx, ((max - scroller.scrollTop) / fadeRevealPx) * fadePx);
		scroller.style.setProperty('--scroll-fade-t', `${Math.round(top)}px`);
		scroller.style.setProperty('--scroll-fade-b', `${Math.round(bottom)}px`);
	}

	function syncChrome() {
		syncJump();
		syncFade();
	}

	function withProgrammaticScroll(run: () => void) {
		ignoreScroll += 1;
		run();
		syncFade();
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				ignoreScroll = Math.max(0, ignoreScroll - 1);
				syncChrome();
			});
		});
	}

	function stickyOffset(): number {
		if (trailToggle.hidden) return 0;
		return Math.max(0, trailToggle.getBoundingClientRect().bottom - scroller.getBoundingClientRect().top);
	}

	function isLiveContent(turn: HTMLElement): boolean {
		return turn.classList.contains('you') || turn.classList.contains('pending');
	}

	function syncSpacer() {
		const lastTurn = activeTurn.querySelector<HTMLElement>(':scope > .turn:last-of-type');
		const withoutSpacer = scroller.scrollHeight - spacer.offsetHeight;
		if (withoutSpacer > scroller.clientHeight + 1 || !lastTurn || !isLiveContent(lastTurn)) {
			spacer.style.height = '0px';
			return;
		}
		const used = stickyOffset() + activeTurn.getBoundingClientRect().height;
		spacer.style.height = `${Math.max(0, scroller.clientHeight - used)}px`;
	}

	function pinCurrentStart() {
		following = true;
		syncSpacer();
		const anchor = activeTurn.querySelector<HTMLElement>(':scope > .turn');
		if (!anchor) {
			syncChrome();
			return;
		}
		withProgrammaticScroll(() => {
			const scrollerBox = scroller.getBoundingClientRect();
			const anchorBox = anchor.getBoundingClientRect();
			scroller.scrollTop += anchorBox.top - scrollerBox.top - stickyOffset();
		});
	}

	function followLiveEdge() {
		following = true;
		syncSpacer();
		withProgrammaticScroll(() => {
			scroller.scrollTop = scroller.scrollHeight;
		});
	}

	function scrollToStart() {
		following = false;
		syncSpacer();
		withProgrammaticScroll(() => {
			scroller.scrollTop = 0;
		});
	}

	function refresh() {
		following = true;
		syncSpacer();
		syncChrome();
	}

	function stopFollowing() {
		if (!following) {
			syncChrome();
			return;
		}
		following = false;
		syncChrome();
	}

	async function preserveAround(mutate: () => void | Promise<void>) {
		if (scroller.scrollTop <= 1) {
			await mutate();
			syncSpacer();
			syncChrome();
			return;
		}
		const before = activeTurn.getBoundingClientRect().top;
		await mutate();
		syncSpacer();
		withProgrammaticScroll(() => {
			scroller.scrollTop += activeTurn.getBoundingClientRect().top - before;
		});
	}

	scroller.addEventListener(
		'scroll',
		() => {
			syncFade();
			if (ignoreScroll > 0) return;
			if (atLiveEdge()) {
				following = true;
				syncJump();
				return;
			}
			stopFollowing();
		},
		{ passive: true },
	);

	scroller.addEventListener(
		'wheel',
		(event) => {
			if (ignoreScroll > 0 || event.deltaY >= 0) return;
			stopFollowing();
		},
		{ passive: true },
	);

	document.addEventListener('selectionchange', () => {
		const selection = document.getSelection();
		if (!selection || selection.isCollapsed || selection.rangeCount === 0) return;
		const node = selection.anchorNode;
		if (!node || !scroller.contains(node)) return;
		stopFollowing();
	});

	jumpButton.addEventListener('click', () => {
		followLiveEdge();
		if (!reduceMotion) jumpButton.blur();
	});

	new ResizeObserver(syncChrome).observe(scroller);

	return {
		followLiveEdge,
		pinCurrentStart,
		scrollToStart,
		refresh,
		async hold(mutate) {
			if (following) {
				await mutate();
				pinCurrentStart();
				return;
			}
			await preserveAround(mutate);
		},
		preserveAround,
		stopFollowing,
	};
}

function requireChild<T extends Element>(root: ParentNode, selector: string): T {
	const node = root.querySelector<T>(selector);
	if (!node) throw new Error(`Transcript scroll markup is missing ${selector}.`);
	return node;
}
