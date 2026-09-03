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
const emergeSpring: Spring = { stiffness: 170, damping: 20, mass: 0.12, restDelta: 0.012 };
const spinSpring: Spring = { stiffness: 140, damping: 18, mass: 0.2, restDelta: 0.002 };
const maxDt = 1 / 32;
// Positive Y is toward the camera on the tilted ring, so the first tool sits in front.
const frontAngle = Math.PI / 2;

function clamp(value: number, min: number, max: number) {
	return Math.min(max, Math.max(min, value));
}

function ringPoints(count: number) {
	const points: { x: number; y: number }[] = [];
	for (let i = 0; i < count; i++) {
		const angle = (i / count) * Math.PI * 2 + frontAngle;
		points.push({ x: Math.cos(angle), y: Math.sin(angle) });
	}
	return points;
}

export function spinToFront(index: number, count: number) {
	if (!(count > 0) || index === 0) return 0;
	return -index * ((Math.PI * 2) / count);
}

function tipSide(x: number, y: number) {
	if (Math.abs(x) > Math.abs(y)) return x > 0 ? 'right' : 'left';
	return y > 0 ? 'bottom' : 'top';
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
	const spin = { value: 0, velocity: 0, target: 0 };
	const emerge = { value: 0, velocity: 0, target: 0 };
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
		emerge.target = dock.classList.contains('is-emerged') ? 1 : 0;
		let resting = true;
		if (reduced()) {
			emerge.value = emerge.target;
			emerge.velocity = 0;
			if (!dragging) {
				spin.value = spin.target;
				spin.velocity = 0;
			}
		} else {
			if (!stepSpring(emerge, emergeSpring, dt, { min: 0, max: 1 })) resting = false;
			if (!dragging && !stepSpring(spin, spinSpring, dt)) resting = false;
		}
		const shown = emerge.value;
		const reach = radius * shown;
		const origin = host.getBoundingClientRect();
		const ox = origin.left + origin.width / 2;
		const oy = origin.top + origin.height / 2;
		for (const node of nodes) {
			const placed = projectRingPoint(node.x, node.y, spin.value, ringTilt, reach);
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
			const depth = reach > 0 ? (placed.z + reach * 2) / (reach * 3) : 0;
			const opacity = shown * (reach > 0
				? clamp((placed.z + reach * 1.5) / (reach * 2), 0.22, 1)
				: 0);
			// Keep scale in this transform so grow happens around the icon, not the orb.
			node.el.style.transform = `translate(-50%, -50%) translate(${placed.x}px, ${placed.y}px) scale(${depth * node.mag.value})`;
			node.el.style.setProperty('--icon-opacity', String(opacity));
			node.el.style.setProperty(
				'--dock-z',
				String(Math.round(coreStack + placed.z + (node.mag.value - 1) * 80)),
			);
			node.el.dataset.tip = tipSide(placed.x, placed.y);
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
		spin.value += (dx + dy) * dragGain;
		spin.target = spin.value;
		spin.velocity = 0;
		startTick();
	}

	function turnTo(index: number) {
		spin.target = spinToFront(index, nodes.length);
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
		turnTo,
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
