// Chat orb renderer: rest is a parked wet sphere; cues are glyphs that
// wobble with sin/cos + voice. Dual-SDF morphs the two anatomies. Landing
// folio APIs stay in the landing lab.
import * as THREE from 'three';
import Raymarcher, { type Entity } from 'three-raymarcher';
import { type InkBody, type InkScene } from './scene.ts';
import { applyInkFinish } from './finish.ts';

const operation = { union: 0, subtract: 1, intersect: 2 };
const INK_MORPH = 1.7;
const INK_MENISCUS_BLEND = 1;
const ORB_CAMERA_Z = 5.35;
const rotation = (v: number[]) =>
	new THREE.Quaternion().setFromEuler(
		new THREE.Euler(
			...(v.map(THREE.MathUtils.degToRad) as [number, number, number]),
		),
	);

// A dim room, one small window, a wide faint sky, a rim catch from behind:
// a wet pool, not a product under softboxes.
function createEnvironment(renderer: THREE.WebGLRenderer) {
	const room = new THREE.Scene();
	room.background = new THREE.Color(0.045, 0.043, 0.038);
	const panels: THREE.Mesh<THREE.CircleGeometry, THREE.MeshBasicMaterial>[] =
		[];
	for (const [position, scale, strength] of [
		[[-2.6, 4, 2.2], [0.8, 0.8], 16],
		[[0, 4.5, 3.5], [7, 3], 0.7],
		[[3, -2, -4], [2.5, 1.2], 2.2],
	] as const) {
		const panel = new THREE.Mesh(
			new THREE.CircleGeometry(1, 64),
			new THREE.MeshBasicMaterial({
				color: new THREE.Color(strength, strength * 0.97, strength * 0.9),
				side: THREE.DoubleSide,
			}),
		);
		panel.scale.set(scale[0], scale[1], 1);
		panel.position.set(position[0], position[1], position[2]);
		panel.lookAt(0, 0, 0);
		room.add(panel);
		panels.push(panel);
	}
	const pmrem = new THREE.PMREMGenerator(renderer);
	const environment = pmrem.fromScene(room, 0.04);
	panels.forEach((panel) => {
		panel.geometry.dispose();
		panel.material.dispose();
	});
	pmrem.dispose();
	return environment;
}

function toEntities(recipe: InkScene): Entity[] {
	return recipe.parts.map((part) => ({
		shape: Raymarcher.shapes[part.shape],
		operation: operation[part.operation],
		position: new THREE.Vector3(...part.position),
		scale: new THREE.Vector3(...part.scale),
		rotation: rotation(part.rotation),
		color: new THREE.Color(recipe.material.color),
	}));
}

function extentOf(entities: Entity[]) {
	return entities.reduce(
		(extent, entity) =>
			Math.max(extent, entity.position.length() + entity.scale.length() * 0.5),
		0,
	);
}

export function mountInk(
	mount: HTMLElement,
	initial: InkScene,
	onFrame?: () => void,
) {
	const renderer = new THREE.WebGLRenderer({
		alpha: true,
		antialias: true,
		preserveDrawingBuffer: true,
	});
	renderer.setClearColor(0, 0);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
	renderer.domElement.setAttribute('aria-hidden', 'true');
	renderer.domElement.style.cssText = 'display:block;width:100%;height:100%';
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 40);
	camera.position.z = initial.body === 'orb' ? ORB_CAMERA_Z : 4.5;
	let environment = createEnvironment(renderer);
	const ink = new Raymarcher({
		envMap: environment.texture,
		envMapIntensity: 1.2,
		resolution: 1,
	});
	// The library defaults to a 0.05-unit march floor. Our ~2-unit ink forms
	// need finer sampling to avoid stepped highlights on their curved surface.
	ink.userData.raymarcher.material.defines.MIN_DISTANCE = '0.005';
	const finish = applyInkFinish(ink.userData.raymarcher.material);
	scene.add(ink);
	mount.replaceChildren(renderer.domElement);
	let recipe = structuredClone(initial);
	let entities: Entity[] = [];
	let targets: Entity[] = [];
	let was: Entity[] = [];
	let wasTargets: Entity[] = [];
	let wasBody: InkBody | null = null;
	let wasExtent = 0;
	let pending: InkScene | null = null;
	let time = 0;
	let voiceLevel = 0;
	let voiceTarget = 0;
	let frame = 0;
	let previous = 0;
	let visible = true;
	let lost = false;
	let destroyed = false;
	let frozen = false;
	let reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	let theme = 'light';
	let renderCount = 0;
	let transition = 0;
	let morph = 0;
	let morphDuration = 0;
	let bleed = 0.4;
	const origin = new THREE.Vector2();
	const nextPosition = new THREE.Vector3();
	const nextScale = new THREE.Vector3();
	const pointer = new THREE.Vector2();
	const pointerTarget = new THREE.Vector2();
	const frameTimes: number[] = [];
	const motion = { ...recipe.motion };

	function parkVolumes(posed: Entity[], rests: Entity[]) {
		posed.forEach((entity, i) => {
			const rest = rests[i];
			if (!rest) return;
			entity.position.copy(rest.position);
			entity.scale.copy(rest.scale);
			entity.rotation.copy(rest.rotation);
			entity.color.copy(rest.color);
		});
	}

	function poseGlyph(posed: Entity[], rests: Entity[], ease: number) {
		const a = reduced ? 0 : motion.amplitude + voiceLevel * 0.035;
		posed.forEach((entity, i) => {
			const rest = rests[i];
			if (!rest) return;
			const phase = i * 2.39996;
			const x = rest.position.x + Math.sin(time * 0.8 + phase) * a;
			const y = rest.position.y + Math.sin(time * 0.63 + phase * 1.3) * a;
			const z = rest.position.z + Math.cos(time * 0.7 + phase) * a * 0.6;
			entity.position.lerp(
				nextPosition.set(
					x + pointer.x * motion.pointer * (0.3 + i * 0.15),
					y + pointer.y * motion.pointer * (0.3 + i * 0.15),
					z,
				),
				ease,
			);
			entity.scale.lerp(
				nextScale
					.copy(rest.scale)
					.multiplyScalar(1 + Math.sin(time * 0.9 + phase) * a * 0.12),
				ease,
			);
			entity.rotation.slerp(rest.rotation, ease);
			entity.color.lerp(rest.color, ease);
		});
	}

	function poseBody(
		body: InkBody,
		posed: Entity[],
		rests: Entity[],
		ease: number,
	) {
		switch (body) {
			case 'orb':
				parkVolumes(posed, rests);
				return;
			case 'glyph':
				poseGlyph(posed, rests, ease);
				return;
			default: {
				const _exhaustive: never = body;
				throw new Error(`Unhandled ink body: ${_exhaustive}`);
			}
		}
	}

	function setScene(next: InkScene) {
		if (!next.parts.length || next.parts.length > 14)
			throw new Error('Ink requires 1 to 14 parts.');
		if (morph > 0) {
			pending = next;
			return;
		}
		const prior = entities;
		const priorTargets = targets;
		const priorBody = recipe.body;
		recipe = structuredClone(next);
		frameTimes.length = 0;
		targets = toEntities(next);
		was = reduced ? [] : prior;
		wasTargets = reduced ? [] : priorTargets;
		wasBody = was.length ? priorBody : null;
		wasExtent = extentOf(was);
		entities = targets.map((target) => ({
			...target,
			position: target.position.clone(),
			scale: target.scale.clone(),
			rotation: target.rotation.clone(),
			color: target.color.clone(),
		}));
		morphDuration = was.length ? INK_MORPH : 0;
		morph = morphDuration;
		finish.morph.value = 0;
		finish.morphSplit.value = was.length;
		ink.userData.layers = [was.concat(entities)];
		ink.userData.blending = next.blend;
		ink.userData.roughness = next.material.roughness;
		ink.userData.metalness = next.material.metalness;
		transition = morphDuration || (prior.length ? 0.85 : 0);
		schedule();
	}
	function settle() {
		was = [];
		wasTargets = [];
		wasBody = null;
		finish.morph.value = 1;
		finish.morphSplit.value = 0;
		ink.userData.layers = [entities];
		if (pending) {
			const next = pending;
			pending = null;
			setScene(next);
		}
	}
	function resize() {
		const width = mount.clientWidth,
			height = mount.clientHeight;
		if (!width || !height) return;
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
		renderer.setSize(width, height, false);
		schedule();
	}
	function draw(dt: number) {
		const moving = !frozen && !reduced;
		const ease = reduced ? 1 : 1 - Math.exp(-dt * 7);
		motion.speed = THREE.MathUtils.lerp(
			motion.speed,
			recipe.motion.speed,
			ease,
		);
		motion.amplitude = THREE.MathUtils.lerp(
			motion.amplitude,
			recipe.motion.amplitude,
			ease,
		);
		motion.pointer = THREE.MathUtils.lerp(
			motion.pointer,
			recipe.motion.pointer,
			ease,
		);
		voiceLevel = THREE.MathUtils.lerp(voiceLevel, voiceTarget, ease);
		if (moving) time += dt * (motion.speed + voiceLevel * 0.5);
		if (!frozen) pointer.lerp(reduced ? origin : pointerTarget, ease);
		const morphing = morph > 0;
		const morphU = morphing ? 1 - morph / morphDuration : 1;
		const meniscus = morphing ? Math.sqrt(Math.sin(Math.PI * morphU)) : 0;
		if (morphing && was.length && wasBody) poseBody(wasBody, was, wasTargets, ease);
		poseBody(recipe.body, entities, targets, ease);
		const extent = Math.max(
			1,
			THREE.MathUtils.lerp(wasExtent, extentOf(targets), morphU),
		);
		let living = 0;
		let cameraZ = camera.position.z;
		switch (recipe.body) {
			case 'orb':
				living = 1;
				cameraZ = ORB_CAMERA_Z;
				break;
			case 'glyph':
				living = 0;
				cameraZ =
					((extent + 0.2) / Math.sin(THREE.MathUtils.degToRad(19))) * 1.02;
				break;
			default: {
				const _exhaustive: never = recipe.body;
				throw new Error(`Unhandled ink body: ${_exhaustive}`);
			}
		}
		camera.position.z = THREE.MathUtils.lerp(camera.position.z, cameraZ, ease);
		ink.userData.blending = THREE.MathUtils.lerp(
			ink.userData.blending,
			recipe.blend + meniscus * (INK_MENISCUS_BLEND - recipe.blend),
			morphing ? 1 : ease,
		);
		ink.userData.roughness = THREE.MathUtils.lerp(
			ink.userData.roughness,
			recipe.material.roughness,
			ease,
		);
		ink.userData.metalness = THREE.MathUtils.lerp(
			ink.userData.metalness,
			recipe.material.metalness,
			ease,
		);
		ink.userData.envMapIntensity = theme === 'dark' ? 1.35 : 1.2;
		finish.time.value = time;
		finish.living.value = living;
		finish.pointer.value.copy(pointer).multiplyScalar(motion.pointer);
		finish.impulse.value = voiceLevel;
		finish.bleed.value = bleed + meniscus * 0.22;
		finish.morph.value = morphU;
		renderer.render(scene, camera);
		renderCount++;
		onFrame?.();
	}
	function animate(now: number) {
		frame = 0;
		if (destroyed || lost || !visible || document.hidden) return;
		const elapsed = previous ? now - previous : 16.67;
		previous = now;
		if (elapsed < 250 && elapsed > 0) {
			frameTimes.push(elapsed);
			if (frameTimes.length > 240) frameTimes.shift();
		}
		const dt = Math.min(elapsed / 1000, 0.06);
		transition = reduced ? 0 : Math.max(0, transition - dt);
		if (!frozen) morph = reduced ? 0 : Math.max(0, morph - dt);
		if (morph === 0 && (was.length || pending)) settle();
		draw(dt);
		if (
			(!frozen &&
				!reduced &&
				(motion.speed > 0 ||
					pointer.distanceTo(pointerTarget) > 0.001 ||
					voiceLevel > 0.001 ||
					Math.abs(voiceLevel - voiceTarget) > 0.001)) ||
			transition > 0 ||
			(!frozen && morph > 0)
		)
			schedule();
	}
	function schedule() {
		if (!frame && !destroyed && !lost && visible && !document.hidden)
			frame = requestAnimationFrame(animate);
	}
	function visibility() {
		previous = 0;
		schedule();
	}
	const observer = new ResizeObserver(resize);
	const intersection = new IntersectionObserver((entries) => {
		visible = entries[0]?.isIntersecting ?? false;
		previous = 0;
		schedule();
	});
	const pointerMove = (event: PointerEvent) => {
		const rect = mount.getBoundingClientRect();
		pointerTarget.set(
			((event.clientX - rect.left) / rect.width) * 2 - 1,
			1 - ((event.clientY - rect.top) / rect.height) * 2,
		);
		transition = 0.8;
		schedule();
	};
	const pointerLeave = () => {
		pointerTarget.set(0, 0);
		transition = 1;
		schedule();
	};
	const contextLost = (event: Event) => {
		event.preventDefault();
		lost = true;
		cancelAnimationFrame(frame);
		frame = 0;
		mount.dataset.inkReady = 'false';
	};
	const contextRestored = () => {
		environment.dispose();
		environment = createEnvironment(renderer);
		ink.userData.envMap = environment.texture;
		lost = false;
		previous = 0;
		transition = 1;
		schedule();
	};
	observer.observe(mount);
	intersection.observe(mount);
	mount.addEventListener('pointermove', pointerMove);
	mount.addEventListener('pointerleave', pointerLeave);
	renderer.domElement.addEventListener('webglcontextlost', contextLost);
	renderer.domElement.addEventListener('webglcontextrestored', contextRestored);
	document.addEventListener('visibilitychange', visibility);
	setScene(initial);
	resize();
	return {
		setScene,
		setVoiceLevel(value: number) {
			voiceTarget = Number.isFinite(value)
				? THREE.MathUtils.clamp(value, 0, 1)
				: 0;
			schedule();
		},
		setTheme(value: string) {
			theme = value;
			finish.paper.value.setStyle(
				getComputedStyle(document.documentElement)
					.getPropertyValue('--paper')
					.trim(),
			);
			finish.bleed.value = value === 'dark' ? 0.12 : 0.4;
			bleed = finish.bleed.value;
			transition = 1;
			schedule();
		},
		setReduced(value: boolean) {
			reduced = value;
			transition = 1;
			schedule();
		},
		setPaused(value: boolean) {
			frozen = value;
			transition = 1;
			previous = 0;
			schedule();
		},
		capture() {
			if (lost || destroyed)
				throw new Error(
					'Renderer unavailable; retry when ink_get_scene reports ready.',
				);
			draw(0);
			return renderer.domElement.toDataURL('image/png');
		},
		inspect() {
			const sorted = frameTimes.slice().sort((a, b) => a - b);
			return {
				renderer: 'three-raymarcher',
				transitioning: transition > 0 || morph > 0 || pending !== null,
				ready: renderCount > 0 && !lost,
				paused: frozen,
				reducedMotion: reduced,
				visible,
				time,
				frames: renderCount,
				canvas: [renderer.domElement.width, renderer.domElement.height],
				resolution: ink.userData.resolution,
				frameP50: sorted[Math.floor(sorted.length * 0.5)] ?? null,
				frameP95: sorted[Math.floor(sorted.length * 0.95)] ?? null,
			};
		},
		setResolution(value: number) {
			ink.userData.resolution = value;
			transition = 1;
			frameTimes.length = 0;
			schedule();
		},
		destroy() {
			destroyed = true;
			cancelAnimationFrame(frame);
			observer.disconnect();
			intersection.disconnect();
			mount.removeEventListener('pointermove', pointerMove);
			mount.removeEventListener('pointerleave', pointerLeave);
			document.removeEventListener('visibilitychange', visibility);
			renderer.domElement.removeEventListener('webglcontextlost', contextLost);
			renderer.domElement.removeEventListener(
				'webglcontextrestored',
				contextRestored,
			);
			ink.dispose();
			environment.dispose();
			renderer.dispose();
			renderer.domElement.remove();
		},
	};
}
export type InkRenderer = ReturnType<typeof mountInk>;
