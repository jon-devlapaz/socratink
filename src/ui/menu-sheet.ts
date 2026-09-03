const drawerCloseRatio = 0.25;
const drawerFlickVelocity = 0.4;
const peekOpenDistance = 48;
const handleClickSlop = 8;

export type MenuSheetElements = {
	lockup: HTMLButtonElement;
	canvas: HTMLElement;
	peekHandle: HTMLButtonElement;
	menuLayer: HTMLElement;
	menuPanel: HTMLElement;
	menuHandle: HTMLElement;
	menuBackdrop: HTMLButtonElement;
	menuFirst: HTMLElement;
};

export type MenuSheetOptions = {
	reduceMotion: boolean;
	onOpen: () => void;
};

export function mountMenuSheet(elements: MenuSheetElements, options: MenuSheetOptions): void {
	const {
		lockup,
		canvas,
		peekHandle,
		menuLayer,
		menuPanel,
		menuHandle,
		menuBackdrop,
		menuFirst,
	} = elements;
	let menuOpen = false;

	function setMenuOpen(open: boolean) {
		if (menuOpen === open) return;
		if (open) options.onOpen();
		menuOpen = open;
		menuPanel.classList.remove('is-dragging');
		menuLayer.classList.toggle('is-open', open);
		menuLayer.setAttribute('aria-hidden', String(!open));
		lockup.setAttribute('aria-expanded', String(open));
		peekHandle.setAttribute('aria-expanded', String(open));
		canvas.inert = open;
		peekHandle.inert = open;
		menuLayer.inert = !open;
		if (open) {
			menuPanel.style.transform = '';
			menuFirst.focus();
			return;
		}
		requestAnimationFrame(() => {
			menuPanel.style.transform = '';
		});
		peekHandle.focus();
	}

	function bindSheetHandle(handle: HTMLElement, { openOnDown = false } = {}) {
		if (options.reduceMotion) return;
		let dragging = false;
		let moved = false;
		let startY = 0;
		let lastY = 0;
		let lastT = 0;
		let velocity = 0;
		let panelHeight = 0;

		handle.addEventListener('pointerdown', (event) => {
			if (event.button !== 0) return;
			if (!openOnDown && !menuOpen) return;
			if (openOnDown && menuOpen) return;
			dragging = true;
			moved = false;
			startY = event.clientY;
			lastY = event.clientY;
			lastT = performance.now();
			velocity = 0;
			panelHeight = menuPanel.offsetHeight;
			handle.setPointerCapture(event.pointerId);
		});

		handle.addEventListener('pointermove', (event) => {
			if (!dragging) return;
			const now = performance.now();
			const dy = event.clientY - startY;
			velocity = (event.clientY - lastY) / Math.max(now - lastT, 1);
			lastY = event.clientY;
			lastT = now;
			if (!moved && Math.abs(dy) < handleClickSlop) return;
			if (!moved) {
				moved = true;
				menuPanel.classList.add('is-dragging');
				if (openOnDown) menuLayer.classList.add('is-pulling');
			}
			if (menuOpen) {
				const offset = dy < 0 ? dy : dy * 0.15;
				menuPanel.style.transform = `translate3d(0, ${offset}px, 0)`;
				return;
			}
			const closedY = -panelHeight * 1.1;
			let nextY = closedY + Math.max(0, dy);
			if (nextY > 0) nextY *= 0.15;
			menuPanel.style.transform = `translate3d(0, ${nextY}px, 0)`;
		});

		function finishDrag() {
			if (!dragging) return;
			dragging = false;
			menuPanel.classList.remove('is-dragging');
			menuLayer.classList.remove('is-pulling');
			if (!moved) return;
			suppressNextClick(handle);
			const dy = lastY - startY;
			if (openOnDown) {
				if (dy > peekOpenDistance || velocity > drawerFlickVelocity) {
					setMenuOpen(true);
					return;
				}
				menuPanel.style.transform = '';
				return;
			}
			const shouldClose = dy < -panelHeight * drawerCloseRatio || velocity < -drawerFlickVelocity;
			if (shouldClose) {
				setMenuOpen(false);
				return;
			}
			menuPanel.style.transform = '';
		}

		handle.addEventListener('pointerup', finishDrag);
		handle.addEventListener('pointercancel', finishDrag);
	}

	lockup.addEventListener('click', () => setMenuOpen(!menuOpen));
	peekHandle.addEventListener('click', () => {
		if (!menuOpen) setMenuOpen(true);
	});
	menuHandle.addEventListener('click', () => {
		if (menuOpen) setMenuOpen(false);
	});
	menuBackdrop.addEventListener('click', () => setMenuOpen(false));
	document.addEventListener('keydown', (event) => {
		if (!menuOpen) return;
		if (event.key === 'Escape') {
			event.preventDefault();
			setMenuOpen(false);
			return;
		}
		if (event.key !== 'Tab') return;
		const items = [...menuLayer.querySelectorAll<HTMLElement>('.menu-orbs a, .menu-orbs button')].filter(
			(item) => item instanceof HTMLButtonElement ? !item.disabled : true,
		);
		const first = items[0];
		const last = items.at(-1);
		if (!first || !last) return;
		if (event.shiftKey && document.activeElement === first) {
			event.preventDefault();
			last.focus();
			return;
		}
		if (!event.shiftKey && document.activeElement === last) {
			event.preventDefault();
			first.focus();
		}
	});
	menuLayer.inert = true;
	bindSheetHandle(menuHandle);
	bindSheetHandle(peekHandle, { openOnDown: true });
}

function suppressNextClick(handle: HTMLElement) {
	let done = false;
	const suppress = (event: Event) => {
		event.preventDefault();
		event.stopImmediatePropagation();
		finish();
	};
	const finish = () => {
		if (done) return;
		done = true;
		handle.removeEventListener('click', suppress, true);
	};
	handle.addEventListener('click', suppress, true);
	window.setTimeout(finish, 500);
}
