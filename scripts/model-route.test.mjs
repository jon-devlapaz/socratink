import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { modelRouteFromMetadata, modelRouteLabel, modelRouteMetadata, parseFallbackAttempts, routingFromHeaders } from '../src/config/model-route.ts';

describe('routingFromHeaders', () => {
	const examples = [
		['provider Headers with a fallback trail', new Headers({
			'x-routed-via': 'Qwen/Qwen3',
			'x-fallback-attempts': '1',
			'x-fallback-trail': 'first,second',
		}), { present: true, routedModel: 'Qwen/Qwen3', fallbackAttempts: 1 }],
		['a mixed-case header in a plain object', { 'X-Routed-Via': 'nvidia/minimax-m3' },
			{ present: true, routedModel: 'nvidia/minimax-m3', fallbackAttempts: 0 }],
		['empty Headers', new Headers(), { present: false, fallbackAttempts: 0 }],
		['a blank model name', { 'x-routed-via': '  ' }, { present: false, fallbackAttempts: 0 }],
		['a model name with surrounding whitespace', { 'x-routed-via': '  tutor  ' },
			{ present: true, routedModel: 'tutor', fallbackAttempts: 0 }],
		['a percent-encoded model name', { 'x-routed-via': 'm%C3%A9thode%2Ftutor' },
			{ present: true, routedModel: 'méthode/tutor', fallbackAttempts: 0 }],
		['a model name with a malformed escape', { 'x-routed-via': 'tutor%2' },
			{ present: true, routedModel: 'tutor%2', fallbackAttempts: 0 }],
	];
	for (const [name, headers, expected] of examples) {
		it(name, () => assert.deepEqual(routingFromHeaders(headers), expected));
	}

	it('a fallback-count header without a routed model', () => {
		assert.deepEqual(routingFromHeaders({ 'x-fallback-attempts': '2' }), { present: true, fallbackAttempts: 2 });
	});
});

describe('parseFallbackAttempts', () => {
	const counts = [
		['an absent count', undefined, 0],
		['zero', '0', 0],
		['one with surrounding whitespace', ' 1 ', 1],
		['a blank count', ' ', 0],
		['a word', 'nope', 0],
		['a fractional count', '1.5', 0],
		['a negative count', '-2', 0],
		['scientific notation', '3e2', 0],
		['a count with units', '7 calls', 0],
		['one below the largest safe count', '9007199254740990', 9_007_199_254_740_990],
		['the largest safe count', '9007199254740991', 9_007_199_254_740_991],
		['the first unsafe count', '9007199254740992', 0],
		['a twenty-digit count', '99999999999999999999', 0],
	];
	for (const [name, count, expected] of counts) {
		it(name, () => assert.equal(parseFallbackAttempts(count), expected));
	}
});

describe('modelRouteFromMetadata', () => {
	const examples = [
		['absent metadata', undefined, undefined],
		['an array', [], undefined],
		['an empty record', {}, undefined],
		['a requested model without a routed model', { socratink: { requestedModel: 'auto' } }, undefined],
		['a blank routed model', { routedModel: '  ' }, undefined],
		['a numeric model name', { routedModel: 7 }, undefined],
		['a flat route with surrounding whitespace', { routedModel: '  méthode  ' }, { routedModel: 'méthode' }],
		['a nested route with a fallback', { socratink: { routedModel: 'Qwen/Qwen3', fallbackAttempts: 1 } },
			{ routedModel: 'Qwen/Qwen3', fallbackAttempts: 1 }],
		['conflicting nested and flat routes', { socratink: { routedModel: 'nested' }, routedModel: 'flat' },
			{ routedModel: 'nested' }],
		['a non-record nested value', { socratink: 'old', routedModel: 'flat' }, { routedModel: 'flat' }],
		['a positive fractional count', { routedModel: 'tutor', fallbackAttempts: 2.9 },
			{ routedModel: 'tutor', fallbackAttempts: 2 }],
	];
	for (const [name, metadata, expected] of examples) {
		it(name, () => assert.deepEqual(modelRouteFromMetadata(metadata), expected));
	}
	for (const [name, count] of [
		['a zero fallback count', 0],
		['a negative fallback count', -1],
		['a fallback count below one', 0.9],
		['a NaN fallback count', NaN],
		['an infinite fallback count', Infinity],
		['a fallback count saved as text', '2'],
	]) {
		it(name, () => {
			assert.deepEqual(modelRouteFromMetadata({ routedModel: 'tutor', fallbackAttempts: count }), { routedModel: 'tutor' });
		});
	}
});

describe('modelRouteLabel', () => {
	it('an absent route', () => assert.equal(modelRouteLabel({}), undefined));
	it('a model with no fallbacks', () => assert.equal(modelRouteLabel({ routedModel: 'tutor' }), 'tutor'));
	it('a model with one fallback', () => {
		assert.equal(modelRouteLabel({ socratink: { routedModel: 'Qwen/Qwen3', fallbackAttempts: 1 } }), 'Qwen/Qwen3 · ↻1');
	});
});

describe('modelRouteMetadata', () => {
	it('stores the route and its positive fallback count', () => {
		const route = { routedModel: 'Qwen/Qwen3', fallbackAttempts: 1 };
		const metadata = modelRouteMetadata(route);
		assert.deepEqual(metadata, { socratink: route });
		assert.deepEqual(modelRouteFromMetadata(metadata), route);
	});
	it('omits a zero count', () => {
		assert.deepEqual(modelRouteMetadata({ routedModel: 'tutor', fallbackAttempts: 0 }), { socratink: { routedModel: 'tutor' } });
	});
});
