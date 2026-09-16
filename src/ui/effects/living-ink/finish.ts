import * as THREE from 'three';

// three-raymarcher splices its lighting into a RawShaderMaterial as GLSL
// text, so the ink finish is a source patch on that string.
const INK_UNIFORMS = `
uniform float roughness;
uniform float time;
uniform vec3 paper;
uniform float bleed;
uniform float morph;
uniform int morphSplit;
uniform float living;
uniform vec2 pointer;
uniform float impulse;

// Slow, shallow undulation of the ink skin so light moves across the body
// while the silhouette holds still.
float skin(const in vec3 p) {
	return 0.01 * (
		sin(p.x * 4.1 + time * 0.7) * sin(p.y * 3.7 - time * 0.5)
		+ 0.5 * sin((p.x + p.y) * 5.3 + p.z * 2.0 + time * 0.9)
	);
}

// An underdamped step: hesitates, overshoots by ~5%, settles exactly by 1.
float spring(const in float c) {
	float s = 1.0 - exp(-4.5 * c) * (cos(4.7 * c) + 0.96 * sin(4.7 * c));
	return mix(s, 1.0, smoothstep(0.75, 1.0, c));
}
`;

// The library's map() becomes mapParts() over an index range so one body can
// hold two anatomies: the parts it had (before morphSplit) and the parts it is
// becoming. Distances mix, so a C's hole fills as this drop, not a dissolve,
// and no extra ink gathers. The core leads, the rim lags, a spring overshoots,
// and the skin swells along the moving front.
const PARTS_SIGNATURE = `SDF map(const in vec3 p) {
  SDF scene = sdEntity(p, entities[0]);
  for (int i = 1, l = min(numEntities, MAX_ENTITIES); i < l; i++) {`;
const PARTS_RANGE = `SDF mapParts(const in vec3 p, const in int first, const in int end) {
  SDF scene = sdEntity(p, entities[first]);
  for (int i = first + 1, l = min(end, MAX_ENTITIES); i < l; i++) {`;

const INK_MAP = `
SDF map(const in vec3 position) {
	vec3 p = position;
	// One continuous deformation field: an inhale lifts the shoulder while
	// the belly yields. The pointer draws the upper surface with a soft lag.
	float breath = sin(time * 1.15) + 0.22 * sin(time * 2.3 - 0.6);
	float stretch = 1.0 + living * (0.038 * breath + 0.025 * impulse);
	p.y /= stretch;
	p.xz *= sqrt(stretch);
	float turn = living * (0.09 * sin(time * 0.47) + p.y * 0.07 * sin(time * 0.61));
	p.xy = mat2(cos(turn), -sin(turn), sin(turn), cos(turn)) * p.xy;
	p.x -= living * (0.055 * sin(p.y * 2.1 + time * 0.82) + pointer.x * (0.3 + 0.22 * p.y));
	p.y -= living * (0.035 * sin(p.x * 2.5 - time * 0.67) + pointer.y * 0.35);
	SDF scene;
	if (morphSplit > 0) {
		SDF was = mapParts(p, 0, morphSplit);
		SDF will = mapParts(p, morphSplit, numEntities);
		float r = length(p);
		float lag = saturate(r * 0.55 + 0.1 * sin(p.x * 2.2 + p.y * 1.7 + p.z * 2.0));
		float c = saturate(morph * 1.45 - 0.42 * lag);
		float s = spring(c);
		float swell = 0.07 * sin(PI * s) * (0.7 + 0.3 * saturate(1.0 - r * 0.45));
		scene = SDF(
			(mix(was.distance, will.distance, s) - swell) * 0.65,
			mix(was.color, will.color, s)
		);
	} else {
		scene = mapParts(p, 0, numEntities);
	}
	scene.distance += skin(p) * (1.0 + living * 0.6);
	scene.distance *= 1.0 - living * 0.18;
	return scene;
}

vec3 getNormal(`;

const PBR_SIGNATURE =
	'vec3 getLight(const in vec3 position, const in vec3 normal, const in vec3 diffuse) {\n  PhysicalMaterial';
const PBR_RETURN =
	'  return reflectedLight.indirectDiffuse + reflectedLight.indirectSpecular;\n}\n';

// Pooled pigment: dense in the core, thinning toward the meniscus where the
// paper starts to show through.
const INK_LIGHT = `${PBR_RETURN}
vec3 getLight(const in vec3 position, const in vec3 normal, const in vec3 diffuse) {
	vec3 viewDir = normalize(cameraPosition - position);
	float grazing = 1.0 - saturate(dot(normal, viewDir));
	vec3 pigment = mix(diffuse, paper, pow(grazing, 3.0) * bleed);
	return getLightPbr(position, normal, pigment);
}
`;

export function applyInkFinish(material: THREE.RawShaderMaterial) {
	const finish = {
		time: { value: 0 },
		paper: { value: new THREE.Color() },
		bleed: { value: 0 },
		morph: { value: 1 },
		morphSplit: { value: 0 },
		living: { value: 0 },
		pointer: { value: new THREE.Vector2() },
		impulse: { value: 0 },
	};
	Object.assign(material.uniforms, finish);
	material.fragmentShader = material.fragmentShader
		.replace('uniform float roughness;', INK_UNIFORMS)
		.replace(PARTS_SIGNATURE, PARTS_RANGE)
		.replace('vec3 getNormal(', INK_MAP)
		.replace(PBR_SIGNATURE, PBR_SIGNATURE.replace('getLight', 'getLightPbr'))
		.replace(PBR_RETURN, INK_LIGHT);
	material.needsUpdate = true;
	return finish;
}
