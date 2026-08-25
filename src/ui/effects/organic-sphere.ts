import * as THREE from 'three';
import { fragmentShader, vertexShader } from './organic-sphere-shaders.ts';

const D2 = {
	blackCore: 0.7,
	hotRim: 0.12,
	displacementStrength: 0.08,
	fresnel: { offset: -1.15, multiplier: 3.6, power: 2.1 },
	lightA: { color: '#0c0c0e', intensity: 2.2 },
	lightB: { color: '#d2c6b2', intensity: 0.4 },
} as const;

export function mountOrganicSphere(mount: HTMLElement) {
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 80);
	camera.position.z = 3.25;

	const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
	renderer.setClearColor(0x000000, 0);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	renderer.domElement.setAttribute('aria-label', 'Animated Organic Sphere');
	renderer.domElement.setAttribute('role', 'img');
	mount.replaceChildren(renderer.domElement);

	const geometry = new THREE.SphereGeometry(1, 192, 192);
	geometry.computeTangents();
	const lightAPosition = new THREE.Vector3().setFromSpherical(
		new THREE.Spherical(1, 0.615, 2.049),
	);
	const lightBPosition = new THREE.Vector3().setFromSpherical(
		new THREE.Spherical(1, 2.561, -1.844),
	);
	const material = new THREE.ShaderMaterial({
		defines: { USE_TANGENT: '' },
		vertexShader,
		fragmentShader,
		uniforms: {
			uLightAColor: { value: new THREE.Color(D2.lightA.color) },
			uLightAPosition: { value: lightAPosition },
			uLightAIntensity: { value: D2.lightA.intensity },
			uLightBColor: { value: new THREE.Color(D2.lightB.color) },
			uLightBPosition: { value: lightBPosition },
			uLightBIntensity: { value: D2.lightB.intensity },
			uSubdivision: { value: new THREE.Vector2(192, 192) },
			uOffset: { value: new THREE.Vector3() },
			uDistortionFrequency: { value: 1.5 },
			uDistortionStrength: { value: 0.65 },
			uDisplacementFrequency: { value: 2.12 },
			uDisplacementStrength: { value: D2.displacementStrength },
			uFresnelOffset: { value: D2.fresnel.offset },
			uFresnelMultiplier: { value: D2.fresnel.multiplier },
			uFresnelPower: { value: D2.fresnel.power },
			uBlackCore: { value: D2.blackCore },
			uHotRim: { value: D2.hotRim },
			uTime: { value: Math.random() * 10 },
		},
	});
	scene.add(new THREE.Mesh(geometry, material));
	const timeUniform = material.uniforms.uTime!;
	const offsetUniform = material.uniforms.uOffset!;

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
	const render = (now: number) => {
		const elapsed = Math.min(now - previous, 60) * 0.0003;
		previous = now;
		timeUniform.value += elapsed;
		offsetUniform.value.add(
			new THREE.Vector3(
				Math.sin(timeUniform.value * 0.13),
				Math.cos(timeUniform.value * 0.09),
				Math.sin(timeUniform.value * 0.07),
			).multiplyScalar(elapsed * 0.6),
		);
		renderer.render(scene, camera);
		frame = requestAnimationFrame(render);
	};
	frame = requestAnimationFrame(render);

	return () => {
		cancelAnimationFrame(frame);
		resizeObserver.disconnect();
		geometry.dispose();
		material.dispose();
		renderer.dispose();
		renderer.domElement.remove();
	};
}
