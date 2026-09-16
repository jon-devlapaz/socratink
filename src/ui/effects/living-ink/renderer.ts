// Ported from socratink-landing/src/lib/ink/renderer.ts (2026-09-16).
// Chat keeps microphone energy and dock pause; landing folio occlusion is off.
import * as THREE from 'three';
import Raymarcher, { type Entity } from 'three-raymarcher';
import { type InkScene } from './scene.ts';
import { applyInkFinish } from './finish.ts';
import {
	COALESCENCE_IMPULSE,
	isCoalescenceTransition,
	NO_KINEMATICS,
	RESPIRATION_KINEMATICS,
	resolveKinematicKind,
	sampleKinematics,
} from './kinematics.ts';

const operation = { union: 0, subtract: 1, intersect: 2 };
const INK_MORPH = 1.7;
const INK_MENISCUS_BLEND = 1;
// Shader-side gesture selectors; see surfaceMotion in finish.ts.
const SURFACE_MOTION = { voice: 1, thought: 2, sap: 3 } as const;
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

export function mountInk(
	mount: HTMLElement,
	initial: InkScene,
	onFrame?: (dt: number) => void,
	onReady?: (ready: boolean) => void,
	options: {
		continuous?: boolean;
		morphDuration?: number;
		respectReducedMotion?: boolean;
		surfaceMotion?: keyof typeof SURFACE_MOTION;
		checkOcclusion?: boolean;
	} = {},
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
	camera.position.z = options.continuous || initial.name.startsWith('Hero ink:') ? 5.35 : 4.5;
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
	finish.surfaceMotion.value = options.surfaceMotion ? SURFACE_MOTION[options.surfaceMotion] : 0;
	scene.add(ink);
	mount.dataset.inkReady = 'false';
	onReady?.(false);
	mount.replaceChildren(renderer.domElement);
	let recipe = structuredClone(initial);
	let entities: Entity[] = [];
	let targets: Entity[] = [];
	// Previous anatomy, kept in the layer so the shader can blend two SDFs.
	let was: Entity[] = [];
	let wasTargets: Entity[] = [];
	let flowFrom: Entity[] = [];
	let flowBlendFrom = initial.blend;
	let wasExtent = 0;
	let pending: InkScene | null = null;
	let time = 0;
	let motionTime = 0;
	let frame = 0;
	let previous = 0;
	let visible = true;
	let intersecting = true;
	let lost = false;
	let destroyed = false;
	let frozen = false;
	let reduced = options.respectReducedMotion !== false && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	let theme = 'light';
	let renderCount = 0;
	let transition = 0;
	let morph = 0;
	let morphDuration = 0;
	let bleed = 0.4;
	const origin = new THREE.Vector2();
	const nextPosition = new THREE.Vector3();
	const nextScale = new THREE.Vector3();
	const nextRotation = new THREE.Quaternion();
	const pointer = new THREE.Vector2();
	const pointerTarget = new THREE.Vector2();
	const pointerVelocity = new THREE.Vector2();
	const lastPointerPos = new THREE.Vector2();
	let lastPointerTime = 0;
	let splashImpulse = 0;
	let scrollVelocity = 0;
	let scrollStretch = 0;
	let voiceLevel = 0;
	let voiceTarget = 0;
	const frameTimes: number[] = [];
	const motion = { ...recipe.motion };

	// Shared hero volumes retarget from their current positions. Unrelated lab
	// anatomies finish their distance-field blend before accepting the next.
	function setScene(next: InkScene) {
		const flowing = (options.continuous || (recipe.name.startsWith('Hero ink:') &&
			next.name.startsWith('Hero ink:'))) && entities.length === next.parts.length;
		if (morph > 0 && !flowing) {
			pending = next;
			return;
		}
		const prevKind = resolveKinematicKind(recipe);
		const prior = entities;
		const priorTargets = targets;
		flowBlendFrom = ink.userData.blending;
		recipe = structuredClone(next);
		frameTimes.length = 0;
		targets = next.parts.map((p) => ({
			shape: Raymarcher.shapes[p.shape],
			operation: operation[p.operation],
			position: new THREE.Vector3(...p.position),
			scale: new THREE.Vector3(...p.scale),
			rotation: rotation(p.rotation),
			color: new THREE.Color(next.material.color),
		}));
		if (
			isCoalescenceTransition(prevKind, resolveKinematicKind(next)) &&
			!reduced
		) {
			motion.amplitude = COALESCENCE_IMPULSE.amplitude;
			motion.speed = COALESCENCE_IMPULSE.speed;
		}
		flowFrom = flowing && !reduced && !frozen ? prior.map((entity) => ({
			...entity, position: entity.position.clone(), scale: entity.scale.clone(), rotation: entity.rotation.clone(),
		})) : [];
		was = reduced || flowing ? [] : prior;
		wasTargets = reduced || flowing ? [] : priorTargets;
		wasExtent = was.reduce(
			(extent, entity) =>
				Math.max(extent, entity.position.length() + entity.scale.length() * 0.5),
			0,
		);
		entities = targets.map((target, i) => ({
			...target,
			position: (flowFrom[i]?.position ?? target.position).clone(),
			scale: (flowFrom[i]?.scale ?? target.scale).clone(),
			rotation: (flowFrom[i]?.rotation ?? target.rotation).clone(),
			color: target.color.clone(),
		}));
		morphDuration = flowFrom.length ? (options.morphDuration ?? 1.6) : was.length ? INK_MORPH : 0;
		morph = morphDuration;
		finish.morph.value = 0;
		finish.morphSplit.value = was.length;
		ink.userData.layers = [was.concat(entities)];
		if (!flowing) ink.userData.blending = next.blend;
		ink.userData.roughness = next.material.roughness;
		ink.userData.metalness = next.material.metalness;
		transition = morphDuration || (prior.length ? 0.85 : 0);
		schedule();
	}
	function settle() {
		was = [];
		wasTargets = [];
		flowFrom = [];
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
		// Mobile scales the hero in CSS. Render at its displayed size, rather
		// than paying for a desktop canvas behind the smaller illustration.
		const displayedScale = Math.min(1, mount.getBoundingClientRect().width / width);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2) * displayedScale);
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
		renderer.setSize(width, height, false);
		updateExposure();
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
		if (moving) {
			time += dt * (motion.speed + voiceLevel * 0.5);
			motionTime += dt;
		}
		if (!frozen) pointer.lerp(reduced ? origin : pointerTarget,
			options.surfaceMotion && !reduced ? 1 - Math.exp(-dt * 2.2) : ease);

		if (reduced || frozen) {
			pointerVelocity.set(0, 0);
			splashImpulse = 0;
			scrollStretch = 0;
			scrollVelocity = 0;
		} else {
			pointerVelocity.multiplyScalar(Math.exp(-dt * 4.5));
			if (splashImpulse > 0) {
				splashImpulse *= Math.exp(-dt * 3);
			}
			scrollStretch = THREE.MathUtils.lerp(
				scrollStretch,
				scrollVelocity * 0.0008,
				1 - Math.exp(-dt * 5),
			);
			scrollVelocity = THREE.MathUtils.lerp(
				scrollVelocity,
				0,
				1 - Math.exp(-dt * 3.5),
			);
		}

		const kinematicKind = resolveKinematicKind(recipe);
		const hero = options.continuous || recipe.name.startsWith('Hero ink:');
		const breathing = kinematicKind === RESPIRATION_KINEMATICS;
		const morphing = morph > 0;
		const morphU = morphing ? 1 - morph / morphDuration : 1;
		// Blending the two anatomies cuts through creases in each one's distance
		// field; a wide smooth union through the morph keeps the skin taut.
		const meniscus = morphing ? Math.sqrt(Math.sin(Math.PI * morphU)) : 0;
		const locked =
			entities.some((entity) => entity.operation !== 0) ||
			(recipe.name.startsWith('Hero ink') && entities.length > 1);
		const a = reduced ? 0 : motion.amplitude + voiceLevel * 0.035;
		if (morphing && was.length) {
			const ox = Math.sin(time * 0.8) * a;
			const oy = Math.sin(time * 0.63) * a;
			const oz = Math.cos(time * 0.7) * a * 0.6;
			const breath = 1 + Math.sin(time * 0.9) * a * 0.12;
			const px = pointer.x * motion.pointer * 0.3;
			const py = pointer.y * motion.pointer * 0.3;
			was.forEach((entity, i) => {
				const rest = wasTargets[i];
				if (!rest) return;
				entity.position.set(
					rest.position.x + ox + px,
					rest.position.y + oy + py,
					rest.position.z + oz,
				);
				entity.scale.copy(rest.scale).multiplyScalar(breath);
				entity.rotation.copy(rest.rotation);
			});
		}
		let extent = 0;
		entities.forEach((entity, i) => {
			const target = targets[i];
			if (!target) return;
			if (hero) {
				// A small delay down the strand lets a gesture travel through the ink.
				const u = THREE.MathUtils.clamp((morphU - i / targets.length * 0.12) / 0.88, 0, 1);
				const progress = u * u * u * (u * (u * 6 - 15) + 10);
				const from = flowFrom[i];
				entity.position.copy(from ? nextPosition.lerpVectors(from.position, target.position, progress) : target.position);
				entity.scale.copy(from ? nextScale.lerpVectors(from.scale, target.scale, progress) : target.scale);
				entity.rotation.copy(from ? nextRotation.slerpQuaternions(from.rotation, target.rotation, progress) : target.rotation);
				entity.color.copy(target.color);
				extent = Math.max(extent, target.position.length() + target.scale.length() * 0.5);
				return;
			}
			const phase = locked ? 0 : i * 2.39996;

			let x = target.position.x + Math.sin(time * 0.8 + phase) * a;
			let y = target.position.y + Math.sin(time * 0.63 + phase * 1.3) * a;
			let z = target.position.z + Math.cos(time * 0.7 + phase) * a * 0.6;
			let scaleMult = 1 + Math.sin(time * 0.9 + phase) * a * 0.12;
			let scaleOverride: THREE.Vector3 | null = null;

			let sample: ReturnType<typeof sampleKinematics> = null;
			if (!locked && kinematicKind !== NO_KINEMATICS) {
				sample = sampleKinematics(kinematicKind, {
					time,
					amplitude: a,
					index: i,
					partCount: targets.length,
					targetX: target.position.x,
					targetY: target.position.y,
					targetZ: target.position.z,
					targetScaleX: target.scale.x,
					targetScaleY: target.scale.y,
					targetScaleZ: target.scale.z,
					baseX: x,
					baseY: y,
					baseZ: z,
					baseScaleMult: scaleMult,
					pointerX: pointer.x,
					pointerY: pointer.y,
				});
				if (sample) {
					x = sample.x;
					y = sample.y;
					z = sample.z;
					scaleMult = sample.scaleMult;
					if (sample.scaleOverride) {
						scaleOverride = nextScale.set(...sample.scaleOverride);
					}
				}
			}

			const dynamic = !frozen && !reduced;
			// Multi-harmonic microscopic fluid turbulence
			const harmonicA = dynamic && !breathing ? Math.sin(time * 1.7 + phase * 1.5) * a * 0.25 : 0;
			const harmonicB = dynamic && !breathing ? Math.cos(time * 2.5 + phase * 0.8) * a * 0.15 : 0;

			// Viscous drag / velocity shear
			const shearX = dynamic && !breathing && !locked ? pointerVelocity.x * 0.024 * (1 + (i % 3) * 0.15) : 0;
			const shearY = dynamic && !breathing && !locked ? pointerVelocity.y * 0.024 * (1 + (i % 3) * 0.15) : 0;

			const splashWave =
				dynamic && splashImpulse > 0
					? breathing || locked
						? splashImpulse * 0.045
						: Math.sin(time * 22 + i * 1.4) * splashImpulse * 0.12
					: 0;

			// Scroll inertial g-force stretch (volume conserving: stretch Y, compress XZ)
			const gStretchY = dynamic
				? THREE.MathUtils.clamp(scrollStretch, -0.22, 0.32) * (breathing ? 0.15 : 1)
				: 0;
			const gStretchXZ = -gStretchY * 0.45;

			const pointerSpread = locked ? 0.3 : 0.3 + i * 0.15;
			entity.position.lerp(
				nextPosition.set(
					x + pointer.x * motion.pointer * pointerSpread + shearX,
					y + pointer.y * motion.pointer * pointerSpread + shearY,
					z + harmonicA,
				),
				ease,
			);
			const dynamicScaleMult = scaleMult + splashWave + harmonicB;
			if (scaleOverride) {
				entity.scale.lerp(
					nextScale
						.copy(scaleOverride)
						.multiply(
							new THREE.Vector3(1 + gStretchXZ, 1 + gStretchY, 1 + gStretchXZ),
						),
					ease,
				);
			} else {
				entity.scale.lerp(
					nextScale
						.copy(target.scale)
						.multiplyScalar(dynamicScaleMult)
						.multiply(
							new THREE.Vector3(1 + gStretchXZ, 1 + gStretchY, 1 + gStretchXZ),
						),
					ease,
				);
			}
			let rotTarget = target.rotation;
			if (sample?.rotationDeg) {
				rotTarget = nextRotation.setFromEuler(
					new THREE.Euler(
						THREE.MathUtils.degToRad(sample.rotationDeg[0]),
						THREE.MathUtils.degToRad(sample.rotationDeg[1]),
						THREE.MathUtils.degToRad(sample.rotationDeg[2]),
						'XYZ',
					),
				);
			}
			entity.rotation.slerp(rotTarget, ease);
			entity.color.lerp(target.color, ease);
			extent = Math.max(
				extent,
				target.position.length() + target.scale.length() * 0.5,
			);
		});
		extent = Math.max(1, THREE.MathUtils.lerp(wasExtent, extent, morphU));
		camera.position.z = THREE.MathUtils.lerp(
			camera.position.z,
			hero ? 5.35 : ((extent + 0.2) / Math.sin(THREE.MathUtils.degToRad(19))) * 1.02,
			ease,
		);
		ink.userData.blending = flowFrom.length
			? THREE.MathUtils.lerp(flowBlendFrom, recipe.blend, THREE.MathUtils.smoothstep(morphU, 0, 1))
			: THREE.MathUtils.lerp(
			ink.userData.blending,
			recipe.blend + (hero ? 0 : meniscus * (INK_MENISCUS_BLEND - recipe.blend)),
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
		finish.motionTime.value = motionTime;
		finish.surfaceStrength.value = THREE.MathUtils.lerp(
			finish.surfaceStrength.value, recipe.name === initial.name ? 1 : 0, 1 - Math.exp(-dt * 1.4),
		);
		finish.living.value = options.surfaceMotion ? 0 : hero ? 1 : 0;
		finish.pointer.value.copy(pointer).multiplyScalar(motion.pointer);
		finish.impulse.value = Math.max(splashImpulse, voiceLevel);
		finish.bleed.value = bleed + meniscus * 0.22;
		finish.morph.value = morphU;
		renderer.render(scene, camera);
		renderCount++;
		if (mount.dataset.inkReady !== 'true') {
			mount.dataset.inkReady = 'true';
			onReady?.(true);
		}
		onFrame?.(dt);
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
		if (morph === 0 && (was.length || flowFrom.length || pending)) settle();
		draw(dt);
		if (
			(!frozen &&
				!reduced &&
				(motion.speed > 0 ||
					pointer.distanceTo(pointerTarget) > 0.001 ||
					pointerVelocity.lengthSq() > 0.0001 ||
					splashImpulse > 0.01 ||
					voiceLevel > 0.001 ||
					Math.abs(voiceLevel - voiceTarget) > 0.001 ||
					Math.abs(scrollStretch) > 0.001)) ||
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
		updateExposure();
		schedule();
	}
	function updateExposure() {
		// Landing uses elementFromPoint to pause folio-covered hero ink.
		// Chat's composer can overlap the orb; IntersectionObserver is enough.
		if (options.checkOcclusion !== true) return;
		const rect = mount.getBoundingClientRect();
		const probes = [
			[0.5, 0.5],
			[0.5, 0.25],
			[0.5, 0.75],
			[0.25, 0.5],
			[0.75, 0.5],
		] as const;
		const exposed =
			intersecting &&
			probes.some(
				([x, y]) =>
					mount.parentElement?.contains(
						document.elementFromPoint(
							rect.left + rect.width * x,
							rect.top + rect.height * y,
						),
					) === true,
			);
		if (visible === exposed) return;
		visible = exposed;
		previous = 0;
		schedule();
	}
	const observer = new ResizeObserver(resize);
	const intersection = new IntersectionObserver((entries) => {
		intersecting = entries[0]?.isIntersecting ?? false;
		if (options.checkOcclusion === true) updateExposure();
		else visible = intersecting;
		previous = 0;
		schedule();
	});
	const pointerMove = (event: PointerEvent) => {
		const rect = mount.getBoundingClientRect();
		const nextX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
		const nextY = 1 - ((event.clientY - rect.top) / rect.height) * 2;
		const now = performance.now();
		if (lastPointerTime > 0) {
			const dtSec = Math.max(0.005, (now - lastPointerTime) / 1000);
			const vx = (nextX - lastPointerPos.x) / dtSec;
			const vy = (nextY - lastPointerPos.y) / dtSec;
			pointerVelocity.x = THREE.MathUtils.lerp(
				pointerVelocity.x,
				THREE.MathUtils.clamp(vx, -5, 5),
				1 - Math.exp(-dtSec * 26),
			);
			pointerVelocity.y = THREE.MathUtils.lerp(
				pointerVelocity.y,
				THREE.MathUtils.clamp(vy, -5, 5),
				1 - Math.exp(-dtSec * 26),
			);
		}
		lastPointerTime = now;
		lastPointerPos.set(nextX, nextY);
		pointerTarget.set(nextX, nextY);
		transition = 0.8;
		schedule();
	};
	const pointerDown = () => {
		if (reduced) return;
		splashImpulse = 1.0;
		transition = 1.2;
		schedule();
	};
	const pointerLeave = () => {
		pointerTarget.set(0, 0);
		pointerVelocity.set(0, 0);
		lastPointerTime = 0;
		transition = 1;
		schedule();
	};
	const contextLost = (event: Event) => {
		event.preventDefault();
		lost = true;
		cancelAnimationFrame(frame);
		frame = 0;
		mount.dataset.inkReady = 'false';
		onReady?.(false);
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
	window.addEventListener('resize', resize);
	if (options.checkOcclusion === true)
		window.addEventListener('scroll', updateExposure, { passive: true });
	intersection.observe(mount);
	mount.addEventListener('pointermove', pointerMove);
	mount.addEventListener('pointerdown', pointerDown);
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
		triggerImpulse(magnitude = 1.0) {
			if (reduced) return;
			splashImpulse = magnitude;
			transition = 1.2;
			schedule();
		},
		setScrollVelocity(v: number) {
			if (reduced) return;
			scrollVelocity = THREE.MathUtils.clamp(v, -1500, 1500);
			transition = 0.8;
			schedule();
		},
		setTheme(value: string) {
			theme = value;
			finish.paper.value.setStyle(
				getComputedStyle(document.documentElement).getPropertyValue('--paper').trim(),
			);
			finish.bleed.value = value === 'dark' ? 0.12 : 0.4;
			bleed = finish.bleed.value;
			transition = 1;
			schedule();
		},
		setReduced(value: boolean) {
			reduced = options.respectReducedMotion !== false && value;
			transition = 1;
			schedule();
		},
		setPaused(value: boolean) {
			frozen = value;
			if (value) {
				pointerVelocity.set(0, 0);
				splashImpulse = 0;
				scrollStretch = 0;
				scrollVelocity = 0;
			}
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
			window.removeEventListener('resize', resize);
			if (options.checkOcclusion === true)
				window.removeEventListener('scroll', updateExposure);
			intersection.disconnect();
			mount.removeEventListener('pointermove', pointerMove);
			mount.removeEventListener('pointerdown', pointerDown);
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
