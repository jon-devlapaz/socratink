import { finePointerQuery, reducedMotionQuery } from './pointer-media.ts';
import { stepSpring, type Spring } from './spring.ts';

const iconSize = 40;
const iconMagnification = 60;
const iconDistance = 140;
const spring: Spring = { stiffness: 150, damping: 12, mass: 0.1, restDelta: 0.01 };
const maxDt = 1 / 32;
const sizeLimit = { min: iconSize, max: iconMagnification };

type IconSpring = {
	el: HTMLElement;
	value: number;
	velocity: number;
	target: number;
	restCenter: number;
};

function targetSize(mouseX: number, centerX: number) {
	if (!Number.isFinite(mouseX)) return iconSize;
	const dist = Math.abs(mouseX - centerX);
	if (dist >= iconDistance) return iconSize;
	return iconSize + (iconMagnification - iconSize) * (1 - dist / iconDistance);
}

function applySize(icon: IconSpring) {
	icon.el.style.setProperty('--dock-icon-size', `${icon.value}px`);
	icon.el.style.zIndex = String(Math.round(icon.value));
}

export function mountDockMagnify(dock: HTMLElement) {
	const pointerMedia = window.matchMedia(finePointerQuery);
	const motionMedia = window.matchMedia(reducedMotionQuery);
	const icons: IconSpring[] = [...dock.querySelectorAll<HTMLElement>('.app-dock-item')].map((el) => ({
		el,
		value: iconSize,
		velocity: 0,
		target: iconSize,
		restCenter: 0,
	}));

	let mouseX = Number.POSITIVE_INFINITY;
	let rafId = 0;
	let lastTime = 0;
	let centersFromRest = false;

	function enabled() {
		return pointerMedia.matches && !motionMedia.matches && dock.classList.contains('is-emerged');
	}

	function stop() {
		if (rafId) cancelAnimationFrame(rafId);
		rafId = 0;
		lastTime = 0;
	}

	function captureRestCenters() {
		for (const icon of icons) {
			const bounds = icon.el.getBoundingClientRect();
			icon.restCenter = bounds.left + bounds.width / 2;
		}
		centersFromRest = true;
	}

	function rest() {
		mouseX = Number.POSITIVE_INFINITY;
		centersFromRest = false;
		for (const icon of icons) {
			icon.target = iconSize;
			icon.value = iconSize;
			icon.velocity = 0;
			applySize(icon);
		}
		stop();
	}

	function tick(now: number) {
		rafId = 0;
		const dt = lastTime ? Math.min((now - lastTime) / 1000, maxDt) : 1 / 60;
		lastTime = now;
		let resting = true;
		for (const icon of icons) {
			icon.target = targetSize(mouseX, icon.restCenter);
			if (!stepSpring(icon, spring, dt, sizeLimit)) resting = false;
			applySize(icon);
		}
		if (!resting && enabled()) {
			rafId = requestAnimationFrame(tick);
			return;
		}
		lastTime = 0;
	}

	function start() {
		if (rafId || !enabled()) return;
		rafId = requestAnimationFrame(tick);
	}

	function onMove(event: PointerEvent) {
		if (!enabled() || event.pointerType === 'touch') return;
		if (!centersFromRest) captureRestCenters();
		mouseX = event.clientX;
		start();
	}

	function onLeave() {
		mouseX = Number.POSITIVE_INFINITY;
		centersFromRest = false;
		start();
	}

	dock.addEventListener('pointermove', onMove);
	dock.addEventListener('pointerleave', onLeave);

	return {
		sync() {
			if (!enabled()) {
				rest();
				return;
			}
			start();
		},
		stop() {
			dock.removeEventListener('pointermove', onMove);
			dock.removeEventListener('pointerleave', onLeave);
			rest();
		},
	};
}
