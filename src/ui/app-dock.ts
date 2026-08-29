import { mountDockMagnify } from './effects/dock-magnify.ts';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const dockExitMs = 240;
const dockPulseMs = 280;

export function mountAppDock(core: HTMLButtonElement) {
	const found = core.parentElement?.querySelector('#app-dock');
	if (!(found instanceof HTMLElement)) {
		throw new Error('Socratink chat markup is missing the learning dock.');
	}
	const dock = found;
	const cluster = core.closest('.alive-cluster');
	const magnify = mountDockMagnify(dock);
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
			dock.classList.add('is-open');
			if (reduceMotion) {
				dock.classList.add('is-emerged');
				magnify.sync();
				return;
			}
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					if (!open) return;
					dock.classList.add('is-emerged');
					magnify.sync();
				});
			});
			return;
		}
		dock.classList.remove('is-emerged');
		magnify.sync();
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
	dock.addEventListener('click', (event) => {
		const item = event.target instanceof Element ? event.target.closest('.app-dock-item') : null;
		if (item) setOpen(false);
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

	return {
		close() {
			setOpen(false);
		},
	};
}
