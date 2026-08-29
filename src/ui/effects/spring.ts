export type SpringBody = {
	value: number;
	velocity: number;
	target: number;
};

export type Spring = {
	stiffness: number;
	damping: number;
	mass: number;
	restDelta: number;
};

export function stepSpring(
	body: SpringBody,
	spring: Spring,
	dt: number,
	limits?: { min: number; max: number },
) {
	const force = -spring.stiffness * (body.value - body.target);
	const accel = (force - spring.damping * body.velocity) / spring.mass;
	body.velocity += accel * dt;
	body.value += body.velocity * dt;
	if (limits) {
		if (body.value < limits.min) {
			body.value = limits.min;
			if (body.velocity < 0) body.velocity = 0;
		} else if (body.value > limits.max) {
			body.value = limits.max;
			if (body.velocity > 0) body.velocity = 0;
		}
	}
	if (
		Math.abs(body.value - body.target) < spring.restDelta &&
		Math.abs(body.velocity) < spring.restDelta
	) {
		body.value = body.target;
		body.velocity = 0;
		return true;
	}
	return false;
}
