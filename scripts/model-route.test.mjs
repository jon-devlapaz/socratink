import assert from 'node:assert/strict';
import test from 'node:test';
import {
	formatModelRoute,
	modelRouteFromMetadata,
	modelRouteLabel,
	modelRouteMetadata,
	parseFallbackAttempts,
	routingFromHeaders,
} from '../src/config/model-route.ts';
import {
	capturedRoute,
	rememberResponseModel,
	rememberRoutingHeaders,
	runWithRouteCapture,
	wrapStreamsForRouteCapture,
} from '../src/server/model-route.ts';

test('formats the upstream FreeLLMAPI route without the requested auto alias', () => {
	assert.equal(
		formatModelRoute({
			routedModel: 'Qwen/Qwen3-VL-235B-A22B-Instruct',
		}),
		'Qwen/Qwen3-VL-235B-A22B-Instruct',
	);
	assert.equal(formatModelRoute({ requestedModel: 'auto' }), undefined);
	assert.equal(
		formatModelRoute({
			routedModel: 'Qwen/Qwen3-VL-235B-A22B-Instruct',
			fallbackAttempts: 2,
		}),
		'Qwen/Qwen3-VL-235B-A22B-Instruct · ↻2',
	);
	assert.equal(formatModelRoute(undefined), undefined);
});

test('reads routing headers the same way the Pi harness does', () => {
	const headers = new Headers({
		'x-routed-via': 'Qwen/Qwen3-VL-235B-A22B-Instruct',
		'x-fallback-attempts': '1',
		'x-fallback-trail': 'first,second',
	});
	assert.deepEqual(routingFromHeaders(headers), {
		present: true,
		routedModel: 'Qwen/Qwen3-VL-235B-A22B-Instruct',
		fallbackAttempts: 1,
	});
	assert.deepEqual(
		routingFromHeaders({
			'X-Routed-Via': 'nvidia/minimaxai/minimax-m3',
		}),
		{
			present: true,
			routedModel: 'nvidia/minimaxai/minimax-m3',
			fallbackAttempts: 0,
		},
	);
	assert.equal(routingFromHeaders(new Headers()).present, false);
	assert.equal(parseFallbackAttempts(undefined), 0);
	assert.equal(parseFallbackAttempts('nope'), 0);
});

test('stamps and recovers nested socratink route metadata', () => {
	const metadata = modelRouteMetadata({
		routedModel: 'Qwen/Qwen3-VL-235B-A22B-Instruct',
		fallbackAttempts: 1,
	});
	assert.deepEqual(modelRouteFromMetadata(metadata), {
		routedModel: 'Qwen/Qwen3-VL-235B-A22B-Instruct',
		fallbackAttempts: 1,
	});
	assert.equal(modelRouteLabel(metadata), 'Qwen/Qwen3-VL-235B-A22B-Instruct · ↻1');
	assert.equal(
		modelRouteFromMetadata({
			socratink: { requestedModel: 'auto' },
		}),
		undefined,
	);
	assert.equal(modelRouteFromMetadata({}), undefined);
	assert.equal(modelRouteFromMetadata(undefined), undefined);
});

test('captures routing headers only inside the current async route store', () => {
	assert.equal(capturedRoute(), undefined);
	const routed = runWithRouteCapture(() => {
		rememberRoutingHeaders(
			new Headers({
				'x-routed-via': encodeURIComponent('Qwen/Qwen3-VL-235B-A22B-Instruct'),
			}),
		);
		rememberResponseModel('should-not-replace-header');
		return capturedRoute();
	});
	assert.deepEqual(routed, {
		routedModel: 'Qwen/Qwen3-VL-235B-A22B-Instruct',
		fallbackAttempts: 0,
	});
	assert.equal(capturedRoute(), undefined);
});

test('falls back to the provider-reported model when routing headers are absent', () => {
	const routed = runWithRouteCapture(() => {
		rememberResponseModel('minimax/minimax-m2.7');
		return capturedRoute();
	});
	assert.deepEqual(routed, {
		routedModel: 'minimax/minimax-m2.7',
		fallbackAttempts: 0,
	});
});

test('provider stream wrapper captures routing headers from onResponse', async () => {
	let previousCalled = false;
	const api = {
		stream(_model, _context, options) {
			return options?.onResponse?.(
				{ status: 200, headers: { 'x-routed-via': 'nvidia/foo' } },
				{},
			);
		},
		streamSimple() {
			return undefined;
		},
	};
	const wrapped = wrapStreamsForRouteCapture(api);
	const routed = await runWithRouteCapture(() =>
		wrapped.stream(
			{},
			{},
			{
				onResponse: () => {
					previousCalled = true;
				},
			},
		).then(() => capturedRoute()),
	);
	assert.equal(previousCalled, true);
	assert.deepEqual(routed, {
		routedModel: 'nvidia/foo',
		fallbackAttempts: 0,
	});
});
