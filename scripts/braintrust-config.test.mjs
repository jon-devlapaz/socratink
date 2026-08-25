import assert from 'node:assert/strict';

delete process.env.BRAINTRUST_API_KEY;
delete process.env.BRAINTRUST_PROJECT_NAME;

const { configureBraintrust } = await import('../src/braintrust.ts');

function createFakes() {
	const loggerCalls = [];
	const createdInstrumentations = [];
	const instrumentCalls = [];

	return {
		loggerCalls,
		createdInstrumentations,
		instrumentCalls,
		dependencies: {
			initLogger(options) {
				loggerCalls.push(options);
			},
			createFlueInstrumentation() {
				const instrumentation = { source: 'synthetic-braintrust-flue-instrumentation' };
				createdInstrumentations.push(instrumentation);
				return instrumentation;
			},
			instrument(instrumentation) {
				instrumentCalls.push(instrumentation);
			},
		},
	};
}

{
	const fakes = createFakes();
	configureBraintrust({}, fakes.dependencies);

	assert.equal(fakes.loggerCalls.length, 0);
	assert.equal(fakes.createdInstrumentations.length, 0);
	assert.equal(fakes.instrumentCalls.length, 0);
}

{
	const fakes = createFakes();
	configureBraintrust(
		{ BRAINTRUST_API_KEY: 'synthetic-test-key', BRAINTRUST_PROJECT_NAME: 'socratink-synthetic' },
		fakes.dependencies,
	);

	assert.deepEqual(fakes.loggerCalls, [
		{ apiKey: 'synthetic-test-key', projectName: 'socratink-synthetic' },
	]);
	assert.equal(fakes.createdInstrumentations.length, 1);
	assert.equal(fakes.instrumentCalls.length, 1);
	assert.strictEqual(fakes.instrumentCalls[0], fakes.createdInstrumentations[0]);
}

{
	const fakes = createFakes();
	configureBraintrust({ BRAINTRUST_API_KEY: 'synthetic-test-key' }, fakes.dependencies);

	assert.deepEqual(fakes.loggerCalls, [{ apiKey: 'synthetic-test-key', projectName: 'socratink' }]);
	assert.equal(fakes.createdInstrumentations.length, 1);
	assert.equal(fakes.instrumentCalls.length, 1);
	assert.strictEqual(fakes.instrumentCalls[0], fakes.createdInstrumentations[0]);
}

console.log('Braintrust configuration contract passed.');
