import assert from 'node:assert/strict';
import test from 'node:test';
import { magnifyAmount, projectRingPoint, spinToFront } from '../src/ui/effects/icon-cloud.ts';

test('a tilted ring never projects through the origin', () => {
	const radius = 74;
	const tilt = 0.32;
	const min = radius * Math.cos(tilt) - 0.01;
	for (let i = 0; i < 16; i++) {
		const angle = (i / 16) * Math.PI * 2;
		const placed = projectRingPoint(Math.cos(angle), Math.sin(angle), 0.4, tilt, radius);
		assert.ok(Math.hypot(placed.x, placed.y) >= min);
	}
});

test('spinToFront rotates each index onto the camera-facing seat', () => {
	assert.equal(spinToFront(0, 4), 0);
	assert.equal(spinToFront(1, 4), -Math.PI / 2);
	assert.equal(spinToFront(2, 4), -Math.PI);
	assert.equal(spinToFront(0, 0), 0);
});

test('the first tool sits toward the camera at rest', () => {
	const radius = 74;
	const tilt = 0.32;
	const front = projectRingPoint(0, 1, 0, tilt, radius);
	const back = projectRingPoint(0, -1, 0, tilt, radius);
	assert.ok(front.y > 0);
	assert.ok(front.z > back.z);
});

test('magnify holds a plateau over the icon then falls off', () => {
	assert.equal(magnifyAmount(0, 80, 0.5, 18), 0.5);
	assert.equal(magnifyAmount(18, 80, 0.5, 18), 0.5);
	assert.equal(magnifyAmount(80, 80, 0.5, 18), 0);
	assert.equal(magnifyAmount(120, 80, 0.5, 18), 0);
	const mid = magnifyAmount(40, 80, 0.5, 18);
	assert.ok(mid > 0 && mid < 0.5);
});
