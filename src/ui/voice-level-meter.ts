export type VoiceLevelMeter = Readonly<{
	start(): void;
	stop(): void;
}>;

type AudioWindow = Window & typeof globalThis & {
	webkitAudioContext?: typeof AudioContext;
};

const noiseFloor = 0.015;
const speechCeiling = 0.1;

export function voiceLevelFromSamples(samples: Float32Array): number {
	if (samples.length === 0) return 0;
	let energy = 0;
	for (const sample of samples) energy += sample * sample;
	const rms = Math.sqrt(energy / samples.length);
	const normalized = (rms - noiseFloor) / (speechCeiling - noiseFloor);
	return Math.sqrt(Math.min(1, Math.max(0, normalized)));
}

export function createVoiceLevelMeter(onLevel: (level: number) => void): VoiceLevelMeter {
	let generation = 0;
	let frame: number | undefined;
	let context: AudioContext | undefined;
	let stream: MediaStream | undefined;
	let source: MediaStreamAudioSourceNode | undefined;
	let analyser: AnalyserNode | undefined;

	function release() {
		if (frame !== undefined) window.cancelAnimationFrame(frame);
		frame = undefined;
		source?.disconnect();
		analyser?.disconnect();
		for (const track of stream?.getTracks() ?? []) track.stop();
		const closingContext = context;
		context = undefined;
		stream = undefined;
		source = undefined;
		analyser = undefined;
		if (closingContext) void closingContext.close().catch(() => {});
		onLevel(0);
	}

	function stop() {
		generation += 1;
		release();
	}

	function start() {
		stop();
		const mediaDevices = navigator.mediaDevices;
		const audioWindow = window as AudioWindow;
		const AudioContextConstructor = audioWindow.AudioContext ?? audioWindow.webkitAudioContext;
		if (!mediaDevices?.getUserMedia || !AudioContextConstructor) return;
		const token = generation;

		try {
			context = new AudioContextConstructor();
			void context.resume().catch(() => {});
		} catch {
			release();
			return;
		}

		void mediaDevices.getUserMedia({ audio: true, video: false }).then((nextStream) => {
			if (token !== generation || !context) {
				for (const track of nextStream.getTracks()) track.stop();
				return;
			}
			stream = nextStream;
			source = context.createMediaStreamSource(stream);
			analyser = context.createAnalyser();
			analyser.fftSize = 256;
			analyser.smoothingTimeConstant = 0.72;
			source.connect(analyser);
			const samples = new Float32Array(analyser.fftSize);

			const measure = () => {
				if (token !== generation || !analyser) return;
				analyser.getFloatTimeDomainData(samples);
				onLevel(voiceLevelFromSamples(samples));
				frame = window.requestAnimationFrame(measure);
			};
			frame = window.requestAnimationFrame(measure);
		}).catch(() => {
			if (token === generation) release();
		});
	}

	return { start, stop };
}
