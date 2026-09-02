import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createVoiceLevelMeter,
	voiceLevelFromSamples,
} from '../src/ui/voice-level-meter.ts';
import { sphereMotionForVoiceLevel } from '../src/ui/effects/organic-sphere.ts';

test('normalizes silence, speech energy, and clipping to a bounded level', () => {
	assert.equal(voiceLevelFromSamples(new Float32Array(8)), 0);
	const speech = voiceLevelFromSamples(new Float32Array(8).fill(0.05));
	assert.ok(speech > 0 && speech < 1);
	assert.equal(voiceLevelFromSamples(new Float32Array(8).fill(0.5)), 1);
	assert.equal(voiceLevelFromSamples(new Float32Array()), 0);
});

test('increasing voice energy increases every sphere motion channel', () => {
	const resting = sphereMotionForVoiceLevel(0);
	const speaking = sphereMotionForVoiceLevel(0.5);
	const loud = sphereMotionForVoiceLevel(1);
	assert.ok(speaking.displacement > resting.displacement);
	assert.ok(speaking.distortion > resting.distortion);
	assert.ok(speaking.timeScale > resting.timeScale);
	assert.ok(loud.displacement > speaking.displacement);
	assert.deepEqual(sphereMotionForVoiceLevel(2), loud);
	assert.deepEqual(sphereMotionForVoiceLevel(-1), resting);
});

test('starts local analysis and releases every audio resource on stop', async () => {
	const originalWindow = globalThis.window;
	const originalNavigator = globalThis.navigator;
	const levels = [];
	const stoppedTracks = [];
	const cancelledFrames = [];
	const stream = {
		getTracks: () => [{ stop: () => stoppedTracks.push(true) }],
	};
	let analyser;
	let source;
	let context;
	let requestedConstraints;
	let scheduledMeasure;

	class FakeAudioContext {
		constructor() {
			context = this;
		}
		resumeCalls = 0;
		closeCalls = 0;
		resume() {
			this.resumeCalls += 1;
			return Promise.resolve();
		}
		close() {
			this.closeCalls += 1;
			return Promise.resolve();
		}
		createMediaStreamSource(receivedStream) {
			assert.equal(receivedStream, stream);
			source = {
				connectCalls: 0,
				disconnectCalls: 0,
				connect() { this.connectCalls += 1; },
				disconnect() { this.disconnectCalls += 1; },
			};
			return source;
		}
		createAnalyser() {
			analyser = {
				fftSize: 0,
				smoothingTimeConstant: 0,
				disconnectCalls: 0,
				disconnect() { this.disconnectCalls += 1; },
				getFloatTimeDomainData(samples) { samples.fill(0.05); },
			};
			return analyser;
		}
	}

	globalThis.window = {
		AudioContext: FakeAudioContext,
		requestAnimationFrame: (callback) => {
			scheduledMeasure = callback;
			return 41;
		},
		cancelAnimationFrame: (frame) => cancelledFrames.push(frame),
	};
	Object.defineProperty(globalThis, 'navigator', {
		configurable: true,
		value: {
			mediaDevices: {
				getUserMedia: async (constraints) => {
					requestedConstraints = constraints;
					return stream;
				},
			},
		},
	});

	try {
		const meter = createVoiceLevelMeter((level) => levels.push(level));
		meter.start();
		await Promise.resolve();
		assert.deepEqual(requestedConstraints, { audio: true, video: false });
		assert.equal(context.resumeCalls, 1);
		assert.equal(analyser.fftSize, 256);
		assert.equal(analyser.smoothingTimeConstant, 0.72);
		assert.equal(source.connectCalls, 1);
		scheduledMeasure();
		assert.ok(levels.at(-1) > 0);

		meter.stop();
		assert.equal(stoppedTracks.length, 1);
		assert.equal(source.disconnectCalls, 1);
		assert.equal(analyser.disconnectCalls, 1);
		assert.equal(context.closeCalls, 1);
		assert.deepEqual(cancelledFrames, [41]);
		assert.equal(levels.at(-1), 0);
	} finally {
		if (originalWindow === undefined) delete globalThis.window;
		else globalThis.window = originalWindow;
		if (originalNavigator === undefined) delete globalThis.navigator;
		else Object.defineProperty(globalThis, 'navigator', {
			configurable: true,
			value: originalNavigator,
		});
	}
});

test('stops a stream that arrives after the session was cancelled', async () => {
	const originalWindow = globalThis.window;
	const originalNavigator = globalThis.navigator;
	let resolveStream;
	let stopped = false;
	const streamPromise = new Promise((resolve) => { resolveStream = resolve; });
	class FakeAudioContext {
		resume() { return Promise.resolve(); }
		close() { return Promise.resolve(); }
	}
	globalThis.window = {
		AudioContext: FakeAudioContext,
		requestAnimationFrame: () => 1,
		cancelAnimationFrame() {},
	};
	Object.defineProperty(globalThis, 'navigator', {
		configurable: true,
		value: { mediaDevices: { getUserMedia: () => streamPromise } },
	});

	try {
		const meter = createVoiceLevelMeter(() => {});
		meter.start();
		meter.stop();
		resolveStream({ getTracks: () => [{ stop: () => { stopped = true; } }] });
		await streamPromise;
		await Promise.resolve();
		assert.equal(stopped, true);
	} finally {
		if (originalWindow === undefined) delete globalThis.window;
		else globalThis.window = originalWindow;
		if (originalNavigator === undefined) delete globalThis.navigator;
		else Object.defineProperty(globalThis, 'navigator', {
			configurable: true,
			value: originalNavigator,
		});
	}
});
