// Rest is one orb body; ink_express cues are glyph bodies. Both share one
// WebGL skin. Recipes stay within 14 parts so a dual-SDF morph can hold the
// twelve-volume rest orb beside a cue.
export type InkPart = {
	shape: 'sphere' | 'capsule' | 'box';
	operation: 'union' | 'subtract' | 'intersect';
	position: [number, number, number];
	scale: [number, number, number];
	rotation: [number, number, number];
};
export type InkBody = 'orb' | 'glyph';
export type InkScene = {
	version: 1;
	name: string;
	body: InkBody;
	blend: number;
	material: { color: string; roughness: number; metalness: number };
	motion: { speed: number; amplitude: number; pointer: number };
	parts: InkPart[];
};
export const INK_BASE: Omit<InkScene, 'name' | 'parts' | 'body'> = {
	version: 1,
	blend: 0.42,
	material: { color: '#08090b', roughness: 0.18, metalness: 0.15 },
	motion: { speed: 0.45, amplitude: 0.12, pointer: 0.3 },
};
