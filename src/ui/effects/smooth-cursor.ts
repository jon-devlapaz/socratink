import { finePointerQuery, reducedMotionQuery } from './pointer-media.ts';
import { stepSpring, type Spring } from './spring.ts';

// ~30ms behind the pointer: a hair of lag without the old trailing spring.
const spring: Spring = { stiffness: 4000, damping: 130, mass: 1, restDelta: 0.05 };
const springSteps = 4;
const movingMs = 150;

type Axis = {
	value: number;
	velocity: number;
	target: number;
};

type FuseKind = 'bar' | 'mark' | 'core';

type FuseTarget = {
	x: number;
	y: number;
	kind: FuseKind;
	w: number;
	h: number;
};

function isTrackablePointer(pointerType: string) {
	return pointerType !== 'touch';
}

export function mountSmoothCursor() {
	const pointerMedia = window.matchMedia(finePointerQuery);
	const motionMedia = window.matchMedia(reducedMotionQuery);
	const core = document.querySelector<HTMLElement>('.alive-core');
	const x: Axis = { value: 0, velocity: 0, target: 0 };
	const y: Axis = { value: 0, velocity: 0, target: 0 };

	let overlay: HTMLDivElement | null = null;
	let visible = false;
	let overText = false;
	let overGrab = false;
	let fuseKind: FuseKind | null = null;
	let grabbing = false;
	let rafId = 0;
	let throttleId = 0;
	let movingTimeout = 0;
	let lastTime = 0;
	let lastX = 0;
	let lastY = 0;
	let pending: { x: number; y: number; text: boolean } | null = null;

	function enabled() {
		return pointerMedia.matches && !motionMedia.matches;
	}

	function applyPosition() {
		if (!overlay) return;
		overlay.style.setProperty('--cursor-x', `${x.value}px`);
		overlay.style.setProperty('--cursor-y', `${y.value}px`);
	}

	function tick(now: number) {
		rafId = 0;
		if (!overlay) return;
		if (fuseKind) {
			const live = fuseTarget(lastX, lastY);
			if (live) {
				x.target = live.x;
				y.target = live.y;
				applyFuseMetrics(live);
			} else {
				setFused(null);
				x.target = lastX;
				y.target = lastY;
			}
		}
		const dt = Math.min((now - lastTime) / 1000, 1 / 30);
		lastTime = now;
		const step = dt / springSteps;
		let xRest = false;
		let yRest = false;
		for (let i = 0; i < springSteps; i++) {
			xRest = stepSpring(x, spring, step);
			yRest = stepSpring(y, spring, step);
		}
		applyPosition();
		if (!xRest || !yRest || fuseKind) rafId = requestAnimationFrame(tick);
	}

	function ensureTick() {
		if (rafId) return;
		lastTime = performance.now();
		rafId = requestAnimationFrame(tick);
	}

	function show() {
		if (!overlay || visible) return;
		visible = true;
		x.value = x.target;
		y.value = y.target;
		x.velocity = 0;
		y.velocity = 0;
		applyPosition();
		document.documentElement.classList.add('has-smooth-cursor');
		overlay.classList.add('is-visible');
	}

	function markMoving() {
		if (!overlay) return;
		overlay.classList.add('is-moving');
		window.clearTimeout(movingTimeout);
		movingTimeout = window.setTimeout(() => {
			overlay?.classList.remove('is-moving');
		}, movingMs);
	}

	function hitClosest(clientX: number, clientY: number, selector: string) {
		const hit = document.elementFromPoint(clientX, clientY);
		return hit instanceof Element && hit.closest(selector) !== null;
	}

	function visibleHandle(clientX: number, clientY: number, selector: string) {
		const hit = document.elementFromPoint(clientX, clientY);
		if (!(hit instanceof Element)) return null;
		const handle = hit.closest(selector);
		if (!(handle instanceof HTMLElement)) return null;
		if (handle.inert) return null;
		const style = getComputedStyle(handle);
		if (style.visibility === 'hidden' || style.pointerEvents === 'none') return null;
		return handle;
	}

	function handleBarCenter(handle: HTMLElement): FuseTarget {
		const rect = handle.getBoundingClientRect();
		const bar = getComputedStyle(handle, '::after');
		const w = parseFloat(bar.width);
		const h = parseFloat(bar.height);
		const y = handle.classList.contains('peek-handle')
			? rect.top + parseFloat(bar.top) + h / 2
			: rect.top + rect.height / 2;
		return { x: rect.left + rect.width / 2, y, kind: 'bar', w, h };
	}

	function markCenter(lockup: HTMLElement): FuseTarget | null {
		const mark = lockup.querySelector('.brand-mark');
		if (!(mark instanceof HTMLElement)) return null;
		const rect = mark.getBoundingClientRect();
		if (rect.width < 1 || rect.height < 1) return null;
		return {
			x: rect.left + rect.width / 2,
			y: rect.top + rect.height / 2,
			kind: 'mark',
			w: rect.width,
			h: rect.height,
		};
	}

	function coreTarget(core: HTMLElement): FuseTarget | null {
		const rect = core.getBoundingClientRect();
		if (rect.width < 1 || rect.height < 1) return null;
		return {
			x: rect.left + rect.width / 2,
			y: rect.top + rect.height / 2,
			kind: 'core',
			w: rect.width,
			h: rect.height,
		};
	}

	function visualCoreRadius(core: HTMLElement, target: FuseTarget) {
		const host = core.closest('.alive-anchor') ?? core;
		const frac = parseFloat(getComputedStyle(host).getPropertyValue('--orb-visual-radius')) / 100;
		const box = Math.min(target.w, target.h);
		return box * (Number.isFinite(frac) && frac > 0 ? frac : 0.5);
	}

	function overCoreDisc(clientX: number, clientY: number, target: FuseTarget, core: HTMLElement) {
		const dx = clientX - target.x;
		const dy = clientY - target.y;
		const radius = visualCoreRadius(core, target);
		return dx * dx + dy * dy <= radius * radius;
	}

	function fuseTarget(clientX: number, clientY: number) {
		const peek = visibleHandle(clientX, clientY, '.peek-handle');
		if (peek) return handleBarCenter(peek);
		const menu = visibleHandle(clientX, clientY, '.menu-handle');
		if (menu) return handleBarCenter(menu);
		const core = visibleHandle(clientX, clientY, '.alive-core');
		if (core) {
			const target = coreTarget(core);
			if (target && overCoreDisc(clientX, clientY, target, core)) return target;
		}
		const lockup = visibleHandle(clientX, clientY, '#menu-trigger');
		return lockup ? markCenter(lockup) : null;
	}

	function applyFuseMetrics(target: FuseTarget) {
		if (!overlay) return;
		overlay.style.setProperty('--fuse-w', `${target.w}px`);
		overlay.style.setProperty('--fuse-h', `${target.h}px`);
	}

	function isComposerText(clientX: number, clientY: number) {
		return hitClosest(clientX, clientY, '#message');
	}

	function setOverText(next: boolean) {
		if (!overlay || overText === next) return;
		overText = next;
		overlay.classList.toggle('is-text', next);
		if (next) overlay.classList.remove('is-moving');
	}

	function setOverGrab(next: boolean) {
		if (!overlay || overGrab === next) return;
		overGrab = next;
		overlay.classList.toggle('is-grab', next);
		if (next) overlay.classList.remove('is-moving');
	}

	function setCoreStill(on: boolean) {
		core?.classList.toggle('is-still', on);
	}

	function onCoreHoverStill(event: PointerEvent) {
		if (event.pointerType === 'touch') return;
		setCoreStill(event.type === 'pointerenter');
	}

	function bindHoverStill() {
		core?.addEventListener('pointerenter', onCoreHoverStill);
		core?.addEventListener('pointerleave', onCoreHoverStill);
	}

	function unbindHoverStill() {
		core?.removeEventListener('pointerenter', onCoreHoverStill);
		core?.removeEventListener('pointerleave', onCoreHoverStill);
		setCoreStill(false);
	}

	function setFused(next: FuseKind | null) {
		if (!overlay || fuseKind === next) return;
		fuseKind = next;
		overlay.classList.toggle('is-fused-bar', next === 'bar');
		overlay.classList.toggle('is-fused-mark', next === 'mark');
		overlay.classList.toggle('is-fused-core', next === 'core');
		setCoreStill(next === 'core');
		if (next) overlay.classList.remove('is-moving', 'is-grab', 'is-text');
	}

	function onPointerMove(clientX: number, clientY: number, text: boolean) {
		lastX = clientX;
		lastY = clientY;
		const target = fuseTarget(clientX, clientY);
		if (target) {
			x.target = target.x;
			y.target = target.y;
			applyFuseMetrics(target);
			setFused(target.kind);
		} else {
			x.target = clientX;
			y.target = clientY;
			setFused(null);
		}
		setOverGrab(grabbing && !target);
		setOverText(text && !target && !grabbing);
		if (!visible) show();
		else if (!text && !target && !grabbing) markMoving();
		ensureTick();
	}

	function throttledPointerMove(event: PointerEvent) {
		if (!isTrackablePointer(event.pointerType)) return;
		lastX = event.clientX;
		lastY = event.clientY;
		if (visible && !fuseKind) {
			x.target = event.clientX;
			y.target = event.clientY;
			ensureTick();
		}
		pending = {
			x: event.clientX,
			y: event.clientY,
			text: isComposerText(event.clientX, event.clientY),
		};
		if (throttleId) return;
		throttleId = requestAnimationFrame(() => {
			throttleId = 0;
			if (!pending) return;
			const next = pending;
			pending = null;
			onPointerMove(next.x, next.y, next.text);
		});
	}

	function onPointerDown(event: PointerEvent) {
		if (!isTrackablePointer(event.pointerType) || event.button !== 0) return;
		const target = fuseTarget(event.clientX, event.clientY);
		if (!target) return;
		grabbing = true;
		lastX = event.clientX;
		lastY = event.clientY;
		overlay?.classList.add('is-grabbing');
		overlay?.classList.remove('is-moving', 'is-text', 'is-grab');
		overText = false;
		overGrab = false;
		setFused(target.kind);
		applyFuseMetrics(target);
		x.target = target.x;
		y.target = target.y;
		ensureTick();
	}

	function onPointerUp(event: PointerEvent) {
		if (!grabbing) return;
		grabbing = false;
		overlay?.classList.remove('is-grabbing');
		const { clientX, clientY } = event;
		requestAnimationFrame(() => {
			onPointerMove(clientX, clientY, isComposerText(clientX, clientY));
		});
	}

	function stop(keepHoverStill = true) {
		window.removeEventListener('pointermove', throttledPointerMove);
		window.removeEventListener('pointerdown', onPointerDown);
		window.removeEventListener('pointerup', onPointerUp);
		window.removeEventListener('pointercancel', onPointerUp);
		if (rafId) cancelAnimationFrame(rafId);
		if (throttleId) cancelAnimationFrame(throttleId);
		window.clearTimeout(movingTimeout);
		rafId = 0;
		throttleId = 0;
		movingTimeout = 0;
		pending = null;
		visible = false;
		overText = false;
		overGrab = false;
		fuseKind = null;
		grabbing = false;
		unbindHoverStill();
		document.documentElement.classList.remove('has-smooth-cursor');
		overlay?.remove();
		overlay = null;
		if (keepHoverStill) bindHoverStill();
	}

	function start() {
		if (overlay) return;
		unbindHoverStill();
		overlay = document.createElement('div');
		overlay.className = 'smooth-cursor';
		overlay.setAttribute('aria-hidden', 'true');
		const orb = document.createElement('span');
		orb.className = 'smooth-cursor-orb';
		const caret = document.createElement('span');
		caret.className = 'smooth-cursor-caret';
		const pill = document.createElement('span');
		pill.className = 'smooth-cursor-pill';
		overlay.append(orb, caret, pill);
		document.body.append(overlay);
		window.addEventListener('pointermove', throttledPointerMove, { passive: true });
		window.addEventListener('pointerdown', onPointerDown);
		window.addEventListener('pointerup', onPointerUp);
		window.addEventListener('pointercancel', onPointerUp);
	}

	function sync() {
		if (enabled()) start();
		else stop();
	}

	pointerMedia.addEventListener('change', sync);
	motionMedia.addEventListener('change', sync);
	sync();

	return () => {
		pointerMedia.removeEventListener('change', sync);
		motionMedia.removeEventListener('change', sync);
		stop(false);
	};
}
