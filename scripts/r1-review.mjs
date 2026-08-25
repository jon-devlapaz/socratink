#!/usr/bin/env node
import { readFile } from 'node:fs/promises';

const HELP = `Usage:
  node scripts/r1-review.mjs show <encounter-id>
  node scripts/r1-review.mjs adjudicate-baseline <encounter-id> <json-file>
  node scripts/r1-review.mjs adjudicate-post <encounter-id> <json-file>
  node scripts/r1-review.mjs correct-post <encounter-id> <json-file>

Required environment:
	SOCRATINK_R1_REVIEW_TOKEN=<primary token; never pass it as an argument>
	SOCRATINK_R1_CORRECTION_TOKEN=<separate token; correct-post only>
	SOCRATINK_R1_BASE_URL=<optional loopback URL; defaults from PORT>

Adjudication files are JSON objects. The CLI binds the command type and reviewer
credential; the server binds reviewer identity. The CLI never evaluates learner
text, authors claim language, or writes encounter files.`;

function fail(message) {
	process.stderr.write(`${message}\n`);
	process.exitCode = 1;
}

function assertObject(value) {
	if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Adjudication file must contain one JSON object.');
	return value;
}

function assertExactKeys(value, allowed) {
	const allowedKeys = new Set(allowed);
	if (Object.keys(value).some((key) => !allowedKeys.has(key))) throw new Error('Adjudication file contains an unsupported field.');
}

function assertCriteria(value) {
	if (!Array.isArray(value)) throw new Error('criteria must be an array.');
	for (const criterion of value) {
		assertObject(criterion);
		assertExactKeys(criterion, ['criterionId', 'status', 'excerpt', 'abstentionReason']);
		if (criterion.status === 'unclear' && 'excerpt' in criterion) throw new Error('An unclear criterion cannot include an excerpt.');
		if (criterion.status !== 'unclear' && 'abstentionReason' in criterion) throw new Error('A decided criterion cannot include an abstention reason.');
	}
}

async function readCommandFile(path, allowed) {
	const text = await readFile(path, 'utf8');
	if (Buffer.byteLength(text, 'utf8') > 128 * 1024) throw new Error('Adjudication file exceeds the 128 KiB limit.');
	const value = assertObject(JSON.parse(text));
	assertExactKeys(value, allowed);
	assertCriteria(value.criteria);
	return value;
}

function baseUrl() {
	const port = process.env.PORT ?? '3000';
	if (!/^\d+$/.test(port) || Number(port) < 1 || Number(port) > 65_535) throw new Error('PORT must be an integer from 1 to 65535.');
	const url = new URL(process.env.SOCRATINK_R1_BASE_URL ?? `http://127.0.0.1:${port}/api/r1`);
	if (url.protocol !== 'http:' || url.username || url.password || url.search || url.hash) throw new Error('SOCRATINK_R1_BASE_URL must be a plain loopback HTTP URL.');
	const hostname = url.hostname.toLowerCase();
	if (hostname !== 'localhost' && hostname !== '127.0.0.1' && hostname !== '[::1]') throw new Error('SOCRATINK_R1_BASE_URL must use a loopback hostname.');
	url.pathname = `${url.pathname.replace(/\/+$/, '')}/`;
	return url;
}

async function callServer(path, token, init = {}) {
	const url = new URL(path.replace(/^\//, ''), baseUrl());
	const response = await fetch(url, {
		...init,
		redirect: 'error',
		headers: {
			'x-r1-review-token': token,
			...(init.body ? { 'content-type': 'application/json' } : {}),
		},
	});
	const text = await response.text();
	let body;
	try {
		body = JSON.parse(text);
	} catch {
		throw new Error(`R1 server returned HTTP ${response.status} without a JSON response.`);
	}
	if (!response.ok) throw new Error(body?.error?.message ?? `R1 server returned HTTP ${response.status}.`);
	return body;
}

const [action, encounterId, jsonPath, ...extra] = process.argv.slice(2);
if (action === '--help' || action === '-h' || !action) {
	process.stdout.write(`${HELP}\n`);
} else if (extra.length > 0 || !encounterId) {
	fail(HELP);
} else {
	try {
		if (action === 'show') {
			if (jsonPath) throw new Error('show accepts only an encounter id.');
			const token = process.env.SOCRATINK_R1_REVIEW_TOKEN;
			if (!token) throw new Error('SOCRATINK_R1_REVIEW_TOKEN is required in the environment.');
			const result = await callServer(`review/encounters/${encodeURIComponent(encounterId)}`, token);
			process.stdout.write(`${JSON.stringify(result.encounter, null, 2)}\n`);
		} else {
			if (!jsonPath) throw new Error(`${action} requires a JSON file path.`);
			const common = ['requestId', 'expectedRevision', 'criteria'];
			let type;
			let allowed;
			if (action === 'adjudicate-baseline') {
				type = 'adjudicate_baseline';
				allowed = [...common, 'evidenceValid', 'invalidReason'];
			} else if (action === 'adjudicate-post') {
				type = 'adjudicate_post';
				allowed = [...common, 'evidenceValid', 'invalidReason', 'scenarioReasoningExcerpt'];
			} else if (action === 'correct-post') {
				type = 'correct_post_adjudication';
				allowed = [...common, 'supersedesAdjudicationId', 'scenarioReasoningExcerpt'];
			} else {
				throw new Error(`Unknown action: ${action}`);
			}
			const input = await readCommandFile(jsonPath, allowed);
			const tokenName = action === 'correct-post' ? 'SOCRATINK_R1_CORRECTION_TOKEN' : 'SOCRATINK_R1_REVIEW_TOKEN';
			const token = process.env[tokenName];
			if (!token) throw new Error(`${tokenName} is required in the environment.`);
			const result = await callServer(`review/encounters/${encodeURIComponent(encounterId)}/commands`, token, {
				method: 'POST',
				body: JSON.stringify({ type, ...input }),
			});
			process.stdout.write(`${JSON.stringify(result)}\n`);
		}
	} catch (error) {
		fail(error instanceof Error ? error.message : 'Reviewer command failed.');
	}
}
