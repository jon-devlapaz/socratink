// Chat uses the landing hero path (`Hero ink:` scenes). Lab kinematic
// drivers stay in socratink-landing; the renderer still imports this contract.

export const NO_KINEMATICS = 'none' as const;
export const RESPIRATION_KINEMATICS = 'respiration' as const;
export const INK_KINEMATIC_KINDS = [
	NO_KINEMATICS,
	RESPIRATION_KINEMATICS,
] as const;
export type InkKinematicKind = (typeof INK_KINEMATIC_KINDS)[number];

export type KinematicSceneLike = Readonly<{ kinematics?: unknown }>;

export function resolveKinematicKind(
	scene: KinematicSceneLike | null | undefined,
): InkKinematicKind {
	return scene?.kinematics === RESPIRATION_KINEMATICS
		? RESPIRATION_KINEMATICS
		: NO_KINEMATICS;
}

export const COALESCENCE_IMPULSE = {
	amplitude: 0.085,
	speed: 1.05,
} as const;

export function isCoalescenceTransition(
	_prevKind: InkKinematicKind,
	_nextKind: InkKinematicKind,
): boolean {
	return false;
}

export type KinematicsSample = {
	x: number;
	y: number;
	z: number;
	scaleMult: number;
	scaleOverride: readonly [number, number, number] | null;
	rotationDeg?: readonly [number, number, number];
};

export function sampleKinematics(
	_kind: InkKinematicKind,
	_input: unknown,
): KinematicsSample | null {
	return null;
}
