import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

delete process.env.BRAINTRUST_API_KEY;
delete process.env.BRAINTRUST_PROJECT_NAME;

const originalWorkingDirectory = process.cwd();
process.chdir(tmpdir());
const { configureBraintrust, resolveBraintrustApiKey } = await import('../src/braintrust.ts');
process.chdir(originalWorkingDirectory);

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
	configureBraintrust({}, fakes.dependencies, tmpdir());

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

{
	const fixtureRoot = await mkdtemp(join(tmpdir(), 'socratink-braintrust-'));
	const nestedDirectory = join(fixtureRoot, 'nested', 'app');

	try {
		await mkdir(nestedDirectory, { recursive: true });
		await writeFile(
			join(fixtureRoot, '.env.braintrust'),
			'BRAINTRUST_API_KEY="synthetic-file-key"\n',
		);

		assert.equal(resolveBraintrustApiKey({}, nestedDirectory), 'synthetic-file-key');

		const fakes = createFakes();
		configureBraintrust({}, fakes.dependencies, nestedDirectory);

		assert.deepEqual(fakes.loggerCalls, [
			{ apiKey: 'synthetic-file-key', projectName: 'socratink' },
		]);
		assert.equal(fakes.createdInstrumentations.length, 1);
		assert.equal(fakes.instrumentCalls.length, 1);
	} finally {
		await rm(fixtureRoot, { recursive: true, force: true });
	}
}

console.log('Braintrust configuration contract passed.');
