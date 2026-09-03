import * as THREE from 'three';
import { fragmentShader, vertexShader } from './organic-sphere-shaders.ts';
import { finePointerQuery, reducedMotionQuery } from './pointer-media.ts';

export const sphereCamera = { fov: 55, z: 3.25, radius: 1 } as const;

export type OrganicSphereController = Readonly<{
	setVoiceLevel(level: number): void;
	destroy(): void;
}>;

export function sphereVisualRadiusFraction() {
	return (
		sphereCamera.radius /
		(2 * sphereCamera.z * Math.tan((sphereCamera.fov / 2) * Math.PI / 180))
	);
}

function applySphereProjection(mount: HTMLElement) {
	const host = mount.closest<HTMLElement>('.alive-anchor') ?? mount;
	const frac = sphereVisualRadiusFraction();
	host.style.setProperty('--orb-visual-radius', `${(frac * 100).toFixed(2)}%`);
	host.style.setProperty('--orb-below', (0.5 - frac).toFixed(4));
}

const D2 = {
	displacementStrength: 0.08,
	fresnel: { offset: -1.15, multiplier: 3.6, power: 2.1 },
} as const;

type SpherePalette = Readonly<{
	base: string;
	blackCore: number;
	hotRim: number;
	lightA: { color: string; intensity: number };
	lightB: { color: string; intensity: number };
}>;

// Light: an ink sphere with a warm rim on cream. Dark inverts that: a cream
// body on dark paper, shaded with warm light instead of a grey fill.
export const spherePalettes: Readonly<Record<'light' | 'dark', SpherePalette>> = {
	light: {
		base: '#000000',
		blackCore: 0.7,
		hotRim: 0.12,
		lightA: { color: '#0c0c0e', intensity: 2.2 },
		lightB: { color: '#d2c6b2', intensity: 0.4 },
	},
	dark: {
		base: '#f4eee3',
		blackCore: 0.12,
		hotRim: 0.2,
		lightA: { color: '#c9bba6', intensity: 1.35 },
		lightB: { color: '#fffcf0', intensity: 0.9 },
	},
};

export function sphereMotionForVoiceLevel(level: number) {
	const normalized = Math.min(1, Math.max(0, level));
	return {
		displacement: D2.displacementStrength + normalized * 0.16,
		distortion: 0.65 + normalized * 0.35,
		timeScale: 0.3 + normalized * 0.9,
	};
}

export type SphereState = Readonly<{
	voice: number;
	attention: number;
	open: boolean;
}>;

// Voice is the loudest signal. A pointer resting on the orb wakes it a little; an
// open dock calms it so the tools read. A pending reply is shown by CSS on the
// button, not here. Only voice moves distortion: above its voice range the
// finite-difference normals in the vertex shader break up into speckle.
export function sphereMotionForState({ voice, attention, open }: SphereState) {
	const base = sphereMotionForVoiceLevel(voice);
	const wake = Math.min(1, Math.max(0, attention));
	const motion = {
		displacement: base.displacement + wake * 0.03,
		distortion: base.distortion,
		timeScale: base.timeScale + wake * 0.35,
	};
	if (!open) return motion;
	return {
		displacement: motion.displacement * 0.45,
		distortion: motion.distortion * 0.7,
		timeScale: motion.timeScale * 0.6,
	};
}

function currentAppearance(): 'light' | 'dark' {
	const set = document.documentElement.dataset.theme;
	if (set === 'light' || set === 'dark') return set;
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function mountOrganicSphere(mount: HTMLElement): OrganicSphereController {
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(sphereCamera.fov, 1, 0.1, 80);
	camera.position.z = sphereCamera.z;

	const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
	renderer.setClearColor(0x000000, 0);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	renderer.domElement.setAttribute('aria-hidden', 'true');
	mount.replaceChildren(renderer.domElement);
	applySphereProjection(mount);

	const geometry = new THREE.SphereGeometry(1, 192, 192);
	geometry.computeTangents();
	const lightAPosition = new THREE.Vector3().setFromSpherical(
		new THREE.Spherical(1, 0.615, 2.049),
	);
	const lightBPosition = new THREE.Vector3().setFromSpherical(
		new THREE.Spherical(1, 2.561, -1.844),
	);
	const initialPalette = spherePalettes[currentAppearance()];
	const material = new THREE.ShaderMaterial({
		defines: { USE_TANGENT: '' },
		vertexShader,
		fragmentShader,
		uniforms: {
			uLightAColor: { value: new THREE.Color(initialPalette.lightA.color) },
			uLightAPosition: { value: lightAPosition },
			uLightAIntensity: { value: initialPalette.lightA.intensity },
			uLightBColor: { value: new THREE.Color(initialPalette.lightB.color) },
			uLightBPosition: { value: lightBPosition },
			uLightBIntensity: { value: initialPalette.lightB.intensity },
			uSubdivision: { value: new THREE.Vector2(192, 192) },
			uOffset: { value: new THREE.Vector3() },
			uDistortionFrequency: { value: 1.5 },
			uDistortionStrength: { value: 0.65 },
			uDisplacementFrequency: { value: 2.12 },
			uDisplacementStrength: { value: D2.displacementStrength },
			uFresnelOffset: { value: D2.fresnel.offset },
			uFresnelMultiplier: { value: D2.fresnel.multiplier },
			uFresnelPower: { value: D2.fresnel.power },
			uBlackCore: { value: initialPalette.blackCore },
			uHotRim: { value: initialPalette.hotRim },
			uBaseColor: { value: new THREE.Color(initialPalette.base) },
			uTime: { value: Math.random() * 10 },
		},
	});
	const mesh = new THREE.Mesh(geometry, material);
	scene.add(mesh);
	const timeUniform = material.uniforms.uTime!;
	const offsetUniform = material.uniforms.uOffset!;

	const palette = {
		target: initialPalette,
		base: new THREE.Color(initialPalette.base),
		lightA: new THREE.Color(initialPalette.lightA.color),
		lightB: new THREE.Color(initialPalette.lightB.color),
	};
	const retarget = () => {
		palette.target = spherePalettes[currentAppearance()];
		palette.base.set(palette.target.base);
		palette.lightA.set(palette.target.lightA.color);
		palette.lightB.set(palette.target.lightB.color);
	};
	const themeObserver = new MutationObserver(retarget);
	themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
	const scheme = window.matchMedia('(prefers-color-scheme: dark)');
	scheme.addEventListener('change', retarget);

	const reduceMotion = window.matchMedia(reducedMotionQuery).matches;
	const finePointer = window.matchMedia(finePointerQuery).matches;
	const pointer = { x: 0, y: 0, attention: 0 };
	const onPointerMove = (event: PointerEvent) => {
		const box = mount.getBoundingClientRect();
		pointer.x = ((event.clientX - box.left) / box.width) * 2 - 1;
		pointer.y = ((event.clientY - box.top) / box.height) * 2 - 1;
	};
	const onPointerEnter = () => {
		pointer.attention = 1;
	};
	const onPointerLeave = () => {
		pointer.attention = 0;
		pointer.x = 0;
		pointer.y = 0;
	};
	if (finePointer && !reduceMotion) {
		mount.addEventListener('pointermove', onPointerMove);
		mount.addEventListener('pointerenter', onPointerEnter);
		mount.addEventListener('pointerleave', onPointerLeave);
	}

	const resize = () => {
		const { width, height } = mount.getBoundingClientRect();
		if (width === 0 || height === 0) return;
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
		renderer.setSize(width, height, false);
	};
	const resizeObserver = new ResizeObserver(resize);
	resizeObserver.observe(mount);
	resize();

	let frame = 0;
	let previous = performance.now();
	const displacement = material.uniforms.uDisplacementStrength!;
	const distortion = material.uniforms.uDistortionStrength!;
	const lightAColor = material.uniforms.uLightAColor!;
	const lightBColor = material.uniforms.uLightBColor!;
	const lightAIntensity = material.uniforms.uLightAIntensity!;
	const lightBIntensity = material.uniforms.uLightBIntensity!;
	const blackCore = material.uniforms.uBlackCore!;
	const hotRim = material.uniforms.uHotRim!;
	const baseColor = material.uniforms.uBaseColor!;
	let voiceLevel = 0;
	let targetVoiceLevel = 0;
	let attention = 0;
	const offsetDrift = new THREE.Vector3();
	const render = (now: number) => {
		const dt = Math.min(now - previous, 60) / 1000;
		previous = now;
		const still = mount.classList.contains('is-still');
		const voiceEase = 1 - Math.exp(-dt * (targetVoiceLevel > voiceLevel ? 18 : 5));
		voiceLevel += (targetVoiceLevel - voiceLevel) * voiceEase;
		attention += (pointer.attention - attention) * (1 - Math.exp(-dt * 6));
		const motion = sphereMotionForState({
			voice: voiceLevel,
			attention,
			open: mount.getAttribute('aria-expanded') === 'true',
		});
		const ease = 1 - Math.exp(-dt * 10);
		const targetDisp = still ? 0 : motion.displacement;
		const targetDist = still ? 0 : motion.distortion;
		displacement.value += (targetDisp - displacement.value) * ease;
		distortion.value += (targetDist - distortion.value) * ease;

		const paletteEase = 1 - Math.exp(-dt * 4);
		(baseColor.value as THREE.Color).lerp(palette.base, paletteEase);
		(lightAColor.value as THREE.Color).lerp(palette.lightA, paletteEase);
		(lightBColor.value as THREE.Color).lerp(palette.lightB, paletteEase);
		lightAIntensity.value += (palette.target.lightA.intensity - lightAIntensity.value) * paletteEase;
		lightBIntensity.value += (palette.target.lightB.intensity - lightBIntensity.value) * paletteEase;
		blackCore.value += (palette.target.blackCore - blackCore.value) * paletteEase;
		hotRim.value += (palette.target.hotRim - hotRim.value) * paletteEase;

		// The orb leans a little toward a resting pointer, and drifts back when it leaves.
		const tiltEase = 1 - Math.exp(-dt * 5);
		mesh.rotation.y += (pointer.x * 0.22 * attention - mesh.rotation.y) * tiltEase;
		mesh.rotation.x += (pointer.y * 0.16 * attention - mesh.rotation.x) * tiltEase;

		if (!still) {
			timeUniform.value += dt * motion.timeScale;
			offsetUniform.value.add(
				offsetDrift.set(
					Math.sin(timeUniform.value * 0.13),
					Math.cos(timeUniform.value * 0.09),
					Math.sin(timeUniform.value * 0.07),
				).multiplyScalar(dt * 0.18),
			);
		}
		renderer.render(scene, camera);
		frame = requestAnimationFrame(render);
	};
	frame = requestAnimationFrame(render);

	return {
		setVoiceLevel(level) {
			targetVoiceLevel = Math.min(1, Math.max(0, level));
		},
		destroy() {
			cancelAnimationFrame(frame);
			resizeObserver.disconnect();
			themeObserver.disconnect();
			scheme.removeEventListener('change', retarget);
			mount.removeEventListener('pointermove', onPointerMove);
			mount.removeEventListener('pointerenter', onPointerEnter);
			mount.removeEventListener('pointerleave', onPointerLeave);
			geometry.dispose();
			material.dispose();
			renderer.dispose();
			renderer.domElement.remove();
		},
	};
}
