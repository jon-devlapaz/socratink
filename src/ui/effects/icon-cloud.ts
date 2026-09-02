import { finePointerQuery, reducedMotionQuery } from './pointer-media.ts';
import { stepSpring, type Spring, type SpringBody } from './spring.ts';

type CloudNode = {
	el: HTMLElement;
	x: number;
	y: number;
	mag: SpringBody;
};

const iconLift = 36;
const coreStack = 50;
const dragGain = 0.002;
const ringTilt = 0.32;
const magPeak = 0.5;
const magFalloff = 80;
const magInner = 18;
const magSpring: Spring = { stiffness: 180, damping: 16, mass: 0.1, restDelta: 0.012 };
const magLimit = { min: 1, max: 1 + magPeak };
const maxDt = 1 / 32;

function clamp(value: number, min: number, max: number) {
	return Math.min(max, Math.max(min, value));
}

function ringPoints(count: number) {
	const points: { x: number; y: number }[] = [];
	for (let i = 0; i < count; i++) {
		const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
		points.push({ x: Math.cos(angle), y: Math.sin(angle) });
	}
	return points;
}

export function projectRingPoint(
	x: number,
	y: number,
	spin: number,
	tilt: number,
	radius: number,
) {
	const cosS = Math.cos(spin);
	const sinS = Math.sin(spin);
	const rx = x * cosS - y * sinS;
	const ry = x * sinS + y * cosS;
	const cosT = Math.cos(tilt);
	const sinT = Math.sin(tilt);
	return {
		x: rx * radius,
		y: ry * cosT * radius,
		z: ry * sinT * radius,
	};
}

export function magnifyAmount(distance: number, falloff: number, peak: number, inner = 0) {
	if (!(falloff > 0) || !(peak > 0) || distance >= falloff) return 0;
	if (distance <= inner) return peak;
	const span = falloff - inner;
	if (!(span > 0)) return peak;
	const t = 1 - (distance - inner) / span;
	return peak * t * t;
}

function wheelPixels(event: WheelEvent, pageSize: number) {
	if (event.deltaMode === 1) return 16;
	if (event.deltaMode === 2) return pageSize;
	return 1;
}

export function mountIconCloud(dock: HTMLElement) {
	const parent = dock.parentElement;
	if (!(parent instanceof HTMLElement)) {
		throw new Error('Socratink icon cloud is missing the alive-anchor.');
	}
	const host: HTMLElement = parent;
	const items = [...dock.querySelectorAll<HTMLElement>('.app-dock-item')];
	const points = ringPoints(items.length);
	const nodes: CloudNode[] = items.map((el, index) => {
		const point = points[index];
		if (!point) throw new Error('Socratink icon cloud is missing a ring node.');
		return { el, x: point.x, y: point.y, mag: { value: 1, velocity: 0, target: 1 } };
	});
	const pointerMedia = window.matchMedia(finePointerQuery);
	const motionMedia = window.matchMedia(reducedMotionQuery);
	const lastDrag = { x: 0, y: 0 };
	let spin = 0.35;
	let radius = 80;
	let dragging = false;
	let pointerX = Number.POSITIVE_INFINITY;
	let pointerY = Number.POSITIVE_INFINITY;
	let rafId = 0;
	let lastTime = 0;

	function active() {
		return dock.classList.contains('is-open');
	}

	function reduced() {
		return motionMedia.matches;
	}

	function measureRadius() {
		const size = host.getBoundingClientRect().width;
		const frac = parseFloat(getComputedStyle(host).getPropertyValue('--orb-visual-radius')) / 100;
		radius = size * (Number.isFinite(frac) ? frac : 0.3) + iconLift;
	}

	function magnifyEnabled() {
		return pointerMedia.matches && !reduced();
	}

	function paint(dt: number) {
		measureRadius();
		const origin = host.getBoundingClientRect();
		const ox = origin.left + origin.width / 2;
		const oy = origin.top + origin.height / 2;
		let resting = true;
		for (const node of nodes) {
			const placed = projectRingPoint(node.x, node.y, spin, ringTilt, radius);
			const dist = Math.hypot(pointerX - (ox + placed.x), pointerY - (oy + placed.y));
			const focused = node.el.matches(':focus-visible');
			node.mag.target = 1;
			if (focused) node.mag.target = 1 + magPeak;
			else if (magnifyEnabled()) {
				node.mag.target = 1 + magnifyAmount(dist, magFalloff, magPeak, magInner);
			}
			if (magnifyEnabled()) {
				if (!stepSpring(node.mag, magSpring, dt, magLimit)) resting = false;
			} else {
				node.mag.value = node.mag.target;
				node.mag.velocity = 0;
			}
			const depth = (placed.z + radius * 2) / (radius * 3);
			const opacity = clamp((placed.z + radius * 1.5) / (radius * 2), 0.22, 1);
			// Keep scale in this transform so grow happens around the icon, not the orb.
			node.el.style.transform = `translate(-50%, -50%) translate(${placed.x}px, ${placed.y}px) scale(${depth * node.mag.value})`;
			node.el.style.setProperty('--icon-opacity', String(opacity));
			node.el.style.setProperty(
				'--dock-z',
				String(Math.round(coreStack + placed.z + (node.mag.value - 1) * 80)),
			);
		}
		return resting;
	}

	function stopTick() {
		if (!rafId) return;
		cancelAnimationFrame(rafId);
		rafId = 0;
		lastTime = 0;
	}

	function tick(now: number) {
		rafId = 0;
		if (!active()) return;
		const dt = lastTime ? Math.min((now - lastTime) / 1000, maxDt) : 1 / 60;
		lastTime = now;
		const resting = paint(dt);
		if (!resting) rafId = requestAnimationFrame(tick);
		else lastTime = 0;
	}

	function startTick() {
		if (rafId || !active()) return;
		rafId = requestAnimationFrame(tick);
	}

	function turn(dx: number, dy: number) {
		spin += (dx + dy) * dragGain;
		startTick();
	}

	function onPointerMove(event: PointerEvent) {
		if (!active()) return;
		if (event.pointerType !== 'touch') {
			pointerX = event.clientX;
			pointerY = event.clientY;
		}
		if (dragging) {
			turn(event.clientX - lastDrag.x, event.clientY - lastDrag.y);
			lastDrag.x = event.clientX;
			lastDrag.y = event.clientY;
			return;
		}
		startTick();
	}

	function onPointerLeave() {
		pointerX = Number.POSITIVE_INFINITY;
		pointerY = Number.POSITIVE_INFINITY;
		startTick();
	}

	function onPointerDown(event: PointerEvent) {
		if (!active() || event.button !== 0) return;
		if (event.target instanceof Element && event.target.closest('.app-dock-item')) return;
		dragging = true;
		lastDrag.x = event.clientX;
		lastDrag.y = event.clientY;
		dock.setPointerCapture(event.pointerId);
	}

	function onPointerUp() {
		dragging = false;
	}

	function onWheel(event: WheelEvent) {
		if (!active()) return;
		event.preventDefault();
		const scale = wheelPixels(event, host.clientHeight);
		turn(event.deltaX * scale, event.deltaY * scale);
	}

	function onFocusChange() {
		startTick();
	}

	function sync() {
		if (!active()) {
			dragging = false;
			pointerX = Number.POSITIVE_INFINITY;
			pointerY = Number.POSITIVE_INFINITY;
			stopTick();
			return;
		}
		paint(1 / 60);
		startTick();
	}

	host.addEventListener('wheel', onWheel, { passive: false });
	dock.addEventListener('pointerdown', onPointerDown);
	dock.addEventListener('pointermove', onPointerMove);
	dock.addEventListener('pointerup', onPointerUp);
	dock.addEventListener('pointercancel', onPointerUp);
	dock.addEventListener('pointerleave', onPointerLeave);
	dock.addEventListener('focusin', onFocusChange);
	dock.addEventListener('focusout', onFocusChange);
	pointerMedia.addEventListener('change', sync);
	motionMedia.addEventListener('change', sync);

	return {
		sync,
		stop() {
			pointerMedia.removeEventListener('change', sync);
			motionMedia.removeEventListener('change', sync);
			host.removeEventListener('wheel', onWheel);
			dock.removeEventListener('pointerdown', onPointerDown);
			dock.removeEventListener('pointermove', onPointerMove);
			dock.removeEventListener('pointerup', onPointerUp);
			dock.removeEventListener('pointercancel', onPointerUp);
			dock.removeEventListener('pointerleave', onPointerLeave);
			dock.removeEventListener('focusin', onFocusChange);
			dock.removeEventListener('focusout', onFocusChange);
			stopTick();
		},
	};
}
