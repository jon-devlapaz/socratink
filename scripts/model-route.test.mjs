import assert from 'node:assert/strict';
import test from 'node:test';
import {
	modelRouteFromMetadata,
	modelRouteLabel,
	modelRouteMetadata,
	parseFallbackAttempts,
	routingFromHeaders,
} from '../src/config/model-route.ts';

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
