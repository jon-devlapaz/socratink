import { INK_BASE, type InkPart, type InkScene } from './scene.ts';

// Capsules become spheres when diameter === length. Keeping the same primitive
// across expressions lets the existing renderer interpolate their dimensions.
type Point = [number, number];
function stroke(from: Point, to: Point, diameter = 0.25): InkPart {
	const dx = to[0] - from[0],
		dy = to[1] - from[1];
	return {
		shape: 'capsule',
		operation: 'union',
		position: [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, 0],
		scale: [diameter, Math.hypot(dx, dy) + diameter, diameter],
		rotation: [0, 0, (-Math.atan2(dx, dy) * 180) / Math.PI],
	};
}
const path = (points: Point[], diameter: number) =>
	points
		.slice(1)
		.map((point, index) => stroke(points[index]!, point, diameter));
const scene = (name: string, parts: InkPart[], blend = 0.13): InkScene => ({
	...structuredClone(INK_BASE),
	name,
	blend,
	motion: { speed: 0.32, amplitude: 0.018, pointer: 0.035 },
	parts,
});

export const INK_EXPRESSIONS = {
	rest: {
		label: 'At rest',
		symbol: 'Ink droplet',
		meaning: 'An idea has room to take shape.',
		scene: {
			...scene(
				'Ink droplet',
				[
					stroke([0, -0.3], [0, -0.1], 1.3),
					stroke([0.06, 0.05], [0.14, 0.55], 0.75),
					stroke([0.18, 0.55], [0.22, 0.87], 0.3),
				],
				0.35,
			),
			motion: { speed: 0.4, amplitude: 0.055, pointer: 0.14 },
		},
	},
	question: {
		label: 'A question opens',
		symbol: 'Question mark',
		meaning: 'Stay with the question. There is something to explore.',
		scene: scene(
			'Question mark',
			[
				...path(
					[
						[-0.47, 0.45],
						[-0.38, 0.72],
						[-0.02, 0.84],
						[0.34, 0.7],
						[0.45, 0.4],
						[0.3, 0.16],
						[0, -0.05],
						[0, -0.3],
					],
					0.26,
				),
				stroke([0, -0.77], [0, -0.77], 0.3),
			],
			0.22,
		),
	},
	connect: {
		label: 'Ideas connect',
		symbol: 'Bridge',
		meaning: 'Two ideas become a connection you can explain.',
		scene: scene(
			'Bridge',
			[
				stroke([-0.8, -0.35], [-0.8, 0.08], 0.4),
				stroke([0.8, -0.35], [0.8, 0.08], 0.4),
				...path(
					[
						[-0.8, -0.18],
						[-0.5, 0.12],
						[0, 0.17],
						[0.5, 0.12],
						[0.8, -0.18],
					],
					0.24,
				),
				stroke([-1, 0.24], [0, 0.27], 0.23),
				stroke([0, 0.27], [1, 0.24], 0.23),
			],
			0.16,
		),
	},
	explain: {
		label: 'In your own words',
		symbol: 'Open notebook',
		meaning: 'Make the explanation yours. The thinking stays with you.',
		scene: scene(
			'Open notebook',
			[
				...path(
					[
						[0, 0.38],
						[-0.85, 0.65],
						[-0.85, -0.4],
						[0, -0.65],
						[0.85, -0.4],
						[0.85, 0.65],
						[0, 0.38],
					],
					0.2,
				),
				stroke([0, 0.38], [0, -0.65], 0.2),
			],
			0.09,
		),
	},
} satisfies Record<
	string,
	{ label: string; symbol: string; meaning: string; scene: InkScene }
>;
export type InkExpression = keyof typeof INK_EXPRESSIONS;
