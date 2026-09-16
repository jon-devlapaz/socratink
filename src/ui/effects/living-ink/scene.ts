// Internal geometry contract, ported from the landing renderer.
// Rest uses the twelve-volume landing hero sphere; cues stay within 14 parts.
export type InkPart = {
	shape: 'sphere' | 'capsule' | 'box';
	operation: 'union' | 'subtract' | 'intersect';
	position: [number, number, number];
	scale: [number, number, number];
	rotation: [number, number, number];
};
export type InkScene = {
	version: 1;
	name: string;
	blend: number;
	material: { color: string; roughness: number; metalness: number };
	motion: { speed: number; amplitude: number; pointer: number };
	kinematics?: 'none' | 'respiration';
	parts: InkPart[];
};
export const INK_BASE: Omit<InkScene, 'name' | 'parts'> = {
	version: 1,
	blend: 0.42,
	material: { color: '#08090b', roughness: 0.18, metalness: 0.15 },
	motion: { speed: 0.45, amplitude: 0.12, pointer: 0.3 },
};
