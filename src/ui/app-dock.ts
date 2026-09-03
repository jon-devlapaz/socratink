import { mountIconCloud } from './effects/icon-cloud.ts';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const dockExitMs = 320;
const dockPulseMs = 280;

export function mountAppDock(core: HTMLButtonElement) {
	const found = core.parentElement?.querySelector('#app-dock');
	if (!(found instanceof HTMLElement)) {
		throw new Error('Socratink chat markup is missing the learning dock.');
	}
	const dock = found;
	const cluster = core.closest('.alive-cluster');
	const items = [...dock.querySelectorAll<HTMLButtonElement>('.app-dock-item')];
	const cloud = mountIconCloud(dock);
	let open = false;
	let hideTimer = 0;
	let pulseTimer = 0;
	let current = 0;

	function pulse() {
		if (reduceMotion) return;
		window.clearTimeout(pulseTimer);
		core.classList.add('is-dock-pulse');
		pulseTimer = window.setTimeout(() => {
			core.classList.remove('is-dock-pulse');
		}, dockPulseMs);
	}

	function tabStops() {
		const available = availableIndexes();
		const focusable = available.includes(current) ? current : available[0];
		for (const [index, item] of items.entries()) {
			item.tabIndex = open && index === focusable ? 0 : -1;
		}
	}

	function availableIndexes() {
		return items.flatMap((item, index) => (itemAvailable(item) ? [index] : []));
	}

	function select(index: number, focus: boolean) {
		const available = availableIndexes();
		if (available.length === 0) return;
		const wrapped = ((index % items.length) + items.length) % items.length;
		const exact = available.indexOf(wrapped);
		current = exact >= 0
			? wrapped
			: available.find((itemIndex) => itemIndex >= wrapped) ?? available[0]!;
		tabStops();
		cloud.turnTo(current);
		if (focus) items[current]?.focus();
	}

	function setOpen(next: boolean) {
		if (open === next) return;
		window.clearTimeout(hideTimer);
		open = next;
		dock.inert = !next;
		dock.setAttribute('aria-hidden', String(!next));
		core.setAttribute('aria-expanded', String(next));
		core.setAttribute('aria-label', next ? 'Close learning tools' : 'Open learning tools');
		cluster?.classList.toggle('is-dock-open', next);
		pulse();
		if (next) {
			dock.classList.add('is-open', 'is-emerged');
			select(current, false);
			cloud.sync();
			return;
		}
		tabStops();
		dock.classList.remove('is-emerged');
		cloud.sync();
		if (reduceMotion) {
			dock.classList.remove('is-open');
			return;
		}
		hideTimer = window.setTimeout(() => {
			if (open) return;
			dock.classList.remove('is-open');
		}, dockExitMs);
	}

	function menuIsOpen() {
		return document.querySelector('.menu-layer')?.classList.contains('is-open') === true;
	}

	function itemAvailable(item: Element) {
		return item.getAttribute('aria-disabled') !== 'true';
	}

	core.addEventListener('click', () => setOpen(!open));
	core.addEventListener('keydown', (event) => {
		if (!open) return;
		if (event.key !== 'ArrowDown' && event.key !== 'ArrowRight') return;
		event.preventDefault();
		select(current, true);
	});
	dock.addEventListener('click', (event) => {
		const item = event.target instanceof Element ? event.target.closest('.app-dock-item') : null;
		if (!item) return;
		if (!itemAvailable(item)) {
			event.preventDefault();
			return;
		}
		setOpen(false);
	});
	dock.addEventListener('keydown', (event) => {
		if (!open) return;
		if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
			event.preventDefault();
			select(current + 1, true);
			return;
		}
		if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
			event.preventDefault();
			select(current - 1, true);
			return;
		}
		if (event.key === 'Home') {
			event.preventDefault();
			select(0, true);
			return;
		}
		if (event.key === 'End') {
			event.preventDefault();
			select(items.length - 1, true);
		}
	});
	document.addEventListener('pointerdown', (event) => {
		if (!open || menuIsOpen()) return;
		if (!(event.target instanceof Node)) return;
		if (core.contains(event.target) || dock.contains(event.target)) return;
		setOpen(false);
	});
	document.addEventListener('keydown', (event) => {
		if (event.key !== 'Escape' || !open || menuIsOpen()) return;
		event.preventDefault();
		setOpen(false);
		core.focus();
	});
	tabStops();

	return {
		close() {
			setOpen(false);
		},
	};
}
