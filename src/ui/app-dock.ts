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
	const cloud = mountIconCloud(dock);
	// With no tools in the dock, the orb stays as living ink but offers no control.
	if (dock.children.length === 0) {
		core.disabled = true;
		core.removeAttribute('aria-controls');
		core.removeAttribute('aria-expanded');
		core.removeAttribute('aria-label');
		core.setAttribute('aria-hidden', 'true');
		return { close() {} };
	}
	let open = false;
	let hideTimer = 0;
	let pulseTimer = 0;

	function pulse() {
		if (reduceMotion) return;
		window.clearTimeout(pulseTimer);
		core.classList.add('is-dock-pulse');
		pulseTimer = window.setTimeout(() => {
			core.classList.remove('is-dock-pulse');
		}, dockPulseMs);
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
			cloud.sync();
			return;
		}
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

	core.addEventListener('click', () => setOpen(!open));
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

	return {
		close() {
			setOpen(false);
		},
	};
}
