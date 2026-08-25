import { Hono, type Context } from 'hono';
import { RUBRIC, SCENARIOS } from './fixture.ts';
import {
	EncounterContractError,
	projectLearnerReceipt,
	validPersistedPrompt,
	validPersistedReveal,
	type EncounterRecord,
	type LearnerCommand,
	type StoreReviewerCommand,
} from './record.ts';
import { R1Store, R1StoreError } from './store.ts';

const MAX_JSON_BYTES = 128 * 1024;

class HttpInputError extends Error {
	readonly status: 400 | 413 | 415;
	readonly code: 'invalid_json' | 'payload_too_large' | 'unsupported_media_type';

	constructor(
		message: string,
		status: 400 | 413 | 415,
		code: 'invalid_json' | 'payload_too_large' | 'unsupported_media_type',
	) {
		super(message);
		this.status = status;
		this.code = code;
	}
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
	return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function assertExactKeys(value: Record<string, unknown>, allowed: readonly string[]): void {
	const allowedKeys = new Set(allowed);
	if (Object.keys(value).some((key) => !allowedKeys.has(key))) {
		throw new HttpInputError('The JSON object contains an unsupported field.', 400, 'invalid_json');
	}
}

function assertCommandBase(body: Record<string, unknown>): asserts body is Record<string, unknown> & { requestId: string; expectedRevision: number } {
	if (typeof body.requestId !== 'string' || !body.requestId.trim()) {
		throw new HttpInputError('requestId must be a nonempty string.', 400, 'invalid_json');
	}
	if (!Number.isSafeInteger(body.expectedRevision) || (body.expectedRevision as number) < 0) {
		throw new HttpInputError('expectedRevision must be a nonnegative safe integer.', 400, 'invalid_json');
	}
}

function assertAttemptConditions(value: unknown): void {
	if (!isPlainObject(value)) throw new HttpInputError('conditions must be a JSON object.', 400, 'invalid_json');
	assertExactKeys(value, [
		'sourceClosed',
		'assistance',
		'assistanceDeclaration',
		'sourceAccessDeclaration',
		'observationScope',
		'elapsedMs',
		'pasteEventCount',
		'pastedCharacterCount',
	]);
}

function assertReviewCriteria(value: unknown): void {
	if (!Array.isArray(value)) throw new HttpInputError('criteria must be an array.', 400, 'invalid_json');
	for (const criterion of value) {
		if (!isPlainObject(criterion)) throw new HttpInputError('Each criterion must be a JSON object.', 400, 'invalid_json');
		assertExactKeys(criterion, ['criterionId', 'status', 'excerpt', 'abstentionReason']);
		if (criterion.status === 'unclear' && 'excerpt' in criterion) {
			throw new HttpInputError('An unclear criterion cannot include an excerpt.', 400, 'invalid_json');
		}
		if (criterion.status !== 'unclear' && 'abstentionReason' in criterion) {
			throw new HttpInputError('A decided criterion cannot include an abstention reason.', 400, 'invalid_json');
		}
	}
}

async function readJsonObject(c: Context): Promise<Record<string, unknown>> {
	const contentType = c.req.header('content-type')?.split(';', 1)[0]?.trim().toLowerCase();
	if (contentType !== 'application/json') {
		throw new HttpInputError('Content-Type must be application/json.', 415, 'unsupported_media_type');
	}
	const declaredLength = Number(c.req.header('content-length'));
	if (Number.isFinite(declaredLength) && declaredLength > MAX_JSON_BYTES) {
		throw new HttpInputError('JSON body exceeds the 128 KiB limit.', 413, 'payload_too_large');
	}

	const reader = c.req.raw.body?.getReader();
	if (!reader) throw new HttpInputError('A JSON object body is required.', 400, 'invalid_json');
	const chunks: Uint8Array[] = [];
	let byteLength = 0;
	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		byteLength += value.byteLength;
		if (byteLength > MAX_JSON_BYTES) {
			await reader.cancel();
			throw new HttpInputError('JSON body exceeds the 128 KiB limit.', 413, 'payload_too_large');
		}
		chunks.push(value);
	}
	const bytes = new Uint8Array(byteLength);
	let offset = 0;
	for (const chunk of chunks) {
		bytes.set(chunk, offset);
		offset += chunk.byteLength;
	}
	let parsed: unknown;
	try {
		parsed = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
	} catch {
		throw new HttpInputError('Body must be valid UTF-8 JSON.', 400, 'invalid_json');
	}
	if (!isPlainObject(parsed)) throw new HttpInputError('Body must be a JSON object.', 400, 'invalid_json');
	return parsed;
}

function isLoopbackHost(c: Context): boolean {
	const incomingHeaders = (c.env as { incoming?: { headers?: Record<string, string | readonly string[] | undefined> } } | undefined)?.incoming?.headers;
	const header = (name: string): string | undefined => {
		const raw = incomingHeaders?.[name];
		return typeof raw === 'string' ? raw : raw?.[0] ?? c.req.header(name);
	};
	if (header('forwarded') || header('x-forwarded-host') || header('x-forwarded-for') || header('x-forwarded-proto')) return false;
	const authority = header('host') ?? new URL(c.req.url).host;
	try {
		const hostname = new URL(`http://${authority}`).hostname.toLowerCase();
		return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
	} catch {
		return false;
	}
}

function isLoopbackPeer(address: string | undefined): boolean {
	if (!address) return false;
	if (address === '::1') return true;
	const ipv4 = address.startsWith('::ffff:') ? address.slice('::ffff:'.length) : address;
	const octets = ipv4.split('.').map(Number);
	return octets.length === 4 && octets[0] === 127 && octets.every((octet) => Number.isInteger(octet) && octet >= 0 && octet <= 255);
}

function capability(c: Context): string {
	const authorization = c.req.header('authorization');
	const bearer = authorization?.match(/^Bearer ([A-Za-z0-9_-]+)$/)?.[1];
	const header = c.req.header('x-r1-capability');
	if (bearer && header && bearer !== header) throw new R1StoreError('Capability denied.', 'denied');
	const token = bearer ?? header;
	if (!token) throw new R1StoreError('Capability denied.', 'denied');
	return token;
}

function reviewToken(c: Context): string {
	const token = c.req.header('x-r1-review-token');
	if (!token) throw new R1StoreError('Reviewer token denied.', 'denied');
	return token;
}

function currentPrompt(record: EncounterRecord) {
	if (record.state === 'baseline_open') {
		const persisted = validPersistedPrompt(record, SCENARIOS.baseline.id, SCENARIOS.baseline.prompt);
		if (!persisted) return null;
		return {
			scenarioId: SCENARIOS.baseline.id,
			prompt: persisted.text,
			policy: SCENARIOS.baseline.policy,
			facts: SCENARIOS.baseline.facts,
			openedAt: persisted.openedAt,
		};
	}
	if (record.state === 'post_open') {
		const persisted = validPersistedPrompt(record, SCENARIOS.post.id, SCENARIOS.post.prompt);
		if (!persisted || !validPersistedReveal(record)) return null;
		return {
			scenarioId: SCENARIOS.post.id,
			prompt: persisted.text,
			policy: SCENARIOS.post.policy,
			facts: SCENARIOS.post.facts,
			openedAt: persisted.openedAt,
		};
	}
	return null;
}

export function projectLearnerView(record: EncounterRecord) {
	return {
		encounterId: record.encounterId,
		synthetic: record.synthetic,
		fixtureId: record.fixtureId,
		targetId: record.targetId,
		state: record.state,
		revision: record.revision,
		createdAt: record.createdAt,
		retentionExpiresAt: record.retentionExpiresAt,
		currentPrompt: currentPrompt(record),
		feedback: validPersistedReveal(record)?.text ?? null,
		receipt: projectLearnerReceipt(record),
	};
}

export function projectReviewerView(record: EncounterRecord) {
	return {
		encounterId: record.encounterId,
		synthetic: record.synthetic,
		fixtureId: record.fixtureId,
		targetId: record.targetId,
		rubricId: record.rubricId,
		evidenceContractId: record.evidenceContractId,
		state: record.state,
		revision: record.revision,
		createdAt: record.createdAt,
		retentionExpiresAt: record.retentionExpiresAt,
		terminalReason: record.terminalReason ?? null,
		rubric: RUBRIC,
		prompts: record.prompts,
		evidenceEvents: record.evidenceEvents,
		reveals: record.reveals,
		policyDecisions: record.policyDecisions,
		adjudications: record.adjudications.map((adjudication) => ({
			...adjudication,
			invalidReason: adjudication.invalidReason ?? null,
			overlapObservation: adjudication.overlapObservation ?? null,
			feedbackOverlapSpans: adjudication.feedbackOverlapSpans ?? [],
			scenarioReasoningExcerpt: adjudication.scenarioReasoningExcerpt ?? null,
			supersedesAdjudicationId: adjudication.supersedesAdjudicationId ?? null,
		})),
		claims: record.claims.map((claim) => ({ ...claim, supersedesClaimId: claim.supersedesClaimId ?? null })),
		obligations: record.obligations,
	};
}

function errorResponse(c: Context, error: unknown) {
	if (error instanceof HttpInputError) {
		return c.json({ error: { code: error.code, message: error.message } }, error.status);
	}
	if (error instanceof R1StoreError) {
		if (error.code === 'not_found') return c.json({ error: { code: 'not_found', message: 'Encounter not found.' } }, 404);
		if (error.code === 'denied') return c.json({ error: { code: 'denied', message: 'Capability denied.' } }, 403);
		if (error.code === 'expired') return c.json({ error: { code: 'expired', message: 'Encounter retention expired; explicit purge is required.' }, ...(error.purge ? { purge: error.purge } : {}) }, 410);
		return c.json({ error: { code: 'unavailable', message: 'The local R1 surface is unavailable.' } }, 503);
	}
	if (error instanceof EncounterContractError) {
		const conflict = error.message.includes('Revision conflict') || error.message.includes('already used');
		return c.json({ error: { code: conflict ? 'conflict' : 'invalid_command', message: error.message } }, conflict ? 409 : 400);
	}
	return c.json({ error: { code: 'internal_error', message: 'The local R1 request could not be completed.' } }, 500);
}

export async function createR1Router(options: {
	readonly environment?: NodeJS.ProcessEnv;
	readonly clock?: () => Date;
	readonly store?: R1Store;
	readonly testPeerAddress?: string | (() => string | undefined);
} = {}): Promise<Hono | undefined> {
	const environment = options.environment ?? process.env;
	if (options.testPeerAddress !== undefined && environment.NODE_ENV !== 'test') {
		throw new R1StoreError('Test peer injection requires NODE_ENV=test.', 'invalid_configuration');
	}
	const store = options.store ?? await R1Store.fromEnvironment(environment, { clock: options.clock });
	if (!store) return undefined;

	const router = new Hono();
	router.use('*', async (c, next) => {
		c.header('cache-control', 'no-store');
		const injectedPeer = typeof options.testPeerAddress === 'function' ? options.testPeerAddress() : options.testPeerAddress;
		const socketPeer = (c.env as { incoming?: { socket?: { remoteAddress?: string } } } | undefined)?.incoming?.socket?.remoteAddress;
		if (!isLoopbackHost(c) || !isLoopbackPeer(injectedPeer ?? socketPeer)) {
			return c.json({ error: { code: 'local_only', message: 'The R1 surface accepts direct loopback requests only.' } }, 403);
		}
		await next();
	});

	router.post('/encounters', async (c) => {
		try {
			const body = await readJsonObject(c);
			assertExactKeys(body, ['synthetic']);
			if (body.synthetic !== undefined && typeof body.synthetic !== 'boolean') {
				throw new HttpInputError('synthetic must be boolean when provided.', 400, 'invalid_json');
			}
			const created = await store.create({ synthetic: body.synthetic ?? false });
			return c.json({ capabilityToken: created.capabilityToken, encounter: projectLearnerView(created.record) }, 201);
		} catch (error) {
			return errorResponse(c, error);
		}
	});

	router.get('/encounters/:id', async (c) => {
		try {
			const record = await store.read(c.req.param('id'), capability(c));
			return c.json({ encounter: projectLearnerView(record) });
		} catch (error) {
			return errorResponse(c, error);
		}
	});

	router.post('/encounters/:id/commands', async (c) => {
		try {
			const token = capability(c);
			const body = await readJsonObject(c);
			if (body.type === 'submit_baseline' || body.type === 'submit_post') {
				assertExactKeys(body, ['type', 'requestId', 'expectedRevision', 'response', 'conditions']);
				assertAttemptConditions(body.conditions);
			} else if (body.type === 'persist_intervention') {
				assertExactKeys(body, ['type', 'requestId', 'expectedRevision']);
			} else {
				throw new HttpInputError('Unsupported learner command type.', 400, 'invalid_json');
			}
			assertCommandBase(body);
			const record = await store.mutate(c.req.param('id'), token, body as unknown as LearnerCommand);
			return c.json({ encounter: projectLearnerView(record) });
		} catch (error) {
			return errorResponse(c, error);
		}
	});

	router.delete('/encounters/:id', async (c) => {
		try {
			const token = capability(c);
			const body = await readJsonObject(c);
			assertExactKeys(body, ['requestId', 'expectedRevision']);
			assertCommandBase(body);
			await store.purge(c.req.param('id'), { capabilityToken: token }, {
				requestId: body.requestId,
				expectedRevision: body.expectedRevision,
			});
			return c.json({ purged: true });
		} catch (error) {
			return errorResponse(c, error);
		}
	});

	router.get('/review/encounters/:id', async (c) => {
		try {
			const record = await store.readForReview(c.req.param('id'), reviewToken(c));
			return c.json({ encounter: projectReviewerView(record) });
		} catch (error) {
			return errorResponse(c, error);
		}
	});

	router.post('/review/encounters/:id/commands', async (c) => {
		try {
			const token = reviewToken(c);
			const body = await readJsonObject(c);
			if (body.type === 'adjudicate_baseline') {
				assertExactKeys(body, ['type', 'requestId', 'expectedRevision', 'criteria', 'evidenceValid', 'invalidReason']);
			} else if (body.type === 'adjudicate_post') {
				assertExactKeys(body, ['type', 'requestId', 'expectedRevision', 'criteria', 'evidenceValid', 'invalidReason', 'scenarioReasoningExcerpt']);
			} else if (body.type === 'correct_post_adjudication') {
				assertExactKeys(body, ['type', 'requestId', 'expectedRevision', 'criteria', 'supersedesAdjudicationId', 'scenarioReasoningExcerpt']);
			} else {
				throw new HttpInputError('Unsupported reviewer command type.', 400, 'invalid_json');
			}
			assertCommandBase(body);
			assertReviewCriteria(body.criteria);
			const record = await store.mutateAsReviewer(c.req.param('id'), token, body as unknown as StoreReviewerCommand);
			const adjudication = record.adjudications.at(-1);
			return c.json({ state: record.state, revision: record.revision, adjudicationOutcome: adjudication?.outcome ?? null });
		} catch (error) {
			return errorResponse(c, error);
		}
	});

	return router;
}
