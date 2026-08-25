import { createHash, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { chmod, mkdir, open, readFile, readdir, rename, unlink } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import {
	applyEncounterCommand,
	createEncounterRecord,
	EncounterContractError,
	type EncounterRecord,
	type LearnerCommand,
	type StoreReviewerCommand,
} from './record.ts';

const locks = new Map<string, Promise<void>>();

export class R1StoreError extends Error {
	readonly code: 'disabled' | 'invalid_configuration' | 'not_found' | 'denied' | 'expired';
	readonly purge?: { readonly encounterId: string; readonly revision: number; readonly retentionExpiresAt: string };

	constructor(
		message: string,
		code: 'disabled' | 'invalid_configuration' | 'not_found' | 'denied' | 'expired',
		purge?: { readonly encounterId: string; readonly revision: number; readonly retentionExpiresAt: string },
	) {
		super(message);
		this.code = code;
		this.purge = purge;
	}
}

function digest(value: string): string {
	return createHash('sha256').update(value).digest('hex');
}

function sameDigest(expectedHex: string, value: string): boolean {
	const expected = Buffer.from(expectedHex, 'hex');
	const actual = Buffer.from(digest(value), 'hex');
	return expected.length === actual.length && timingSafeEqual(expected, actual);
}

async function syncDirectory(path: string): Promise<void> {
	const directory = await open(path, 'r');
	try {
		await directory.sync();
	} finally {
		await directory.close();
	}
}

async function atomicWrite(path: string, record: EncounterRecord): Promise<void> {
	const serializedRecord = `${JSON.stringify(record, null, 2)}\n`;
	if (Buffer.byteLength(serializedRecord, 'utf8') > 1_048_576) throw new EncounterContractError('Encounter record exceeds the 1 MiB local-store limit.');
	const temporaryPath = join(dirname(path), `.${record.encounterId}.${randomUUID()}.tmp`);
	let file: Awaited<ReturnType<typeof open>> | undefined;
	try {
		file = await open(temporaryPath, 'wx', 0o600);
		await file.writeFile(serializedRecord, 'utf8');
		await file.sync();
		await file.close();
		file = undefined;
		await rename(temporaryPath, path);
		await syncDirectory(dirname(path));
	} catch (error) {
		if (file) {
			try {
				await file.close();
			} catch {
				// Preserve the original write/sync/close failure.
			}
		}
		try {
			await unlink(temporaryPath);
		} catch (cleanupError) {
			if ((cleanupError as NodeJS.ErrnoException).code !== 'ENOENT') {
				// Preserve the original failure; the exact temp path is best-effort cleanup only.
			}
		}
		throw error;
	}
}

async function serialized<T>(key: string, operation: () => Promise<T>): Promise<T> {
	const previous = locks.get(key) ?? Promise.resolve();
	let release!: () => void;
	const current = new Promise<void>((resolvePromise) => {
		release = resolvePromise;
	});
	const tail = previous.then(() => current);
	locks.set(key, tail);
	await previous;
	try {
		return await operation();
	} finally {
		release();
		if (locks.get(key) === tail) locks.delete(key);
	}
}

export class R1Store {
	readonly dataDirectory: string;
	private readonly reviewTokenHash: string;
	private readonly reviewerId: string;
	private readonly correctionTokenHash?: string;
	private readonly correctionReviewerId?: string;
	private readonly clock: () => Date;

	private constructor(
		dataDirectory: string,
		reviewTokenHash: string,
		reviewerId: string,
		correctionTokenHash: string | undefined,
		correctionReviewerId: string | undefined,
		clock: () => Date,
	) {
		this.dataDirectory = dataDirectory;
		this.reviewTokenHash = reviewTokenHash;
		this.reviewerId = reviewerId;
		this.correctionTokenHash = correctionTokenHash;
		this.correctionReviewerId = correctionReviewerId;
		this.clock = clock;
	}

	static async fromEnvironment(
		environment: NodeJS.ProcessEnv = process.env,
		options: { readonly clock?: () => Date } = {},
	): Promise<R1Store | undefined> {
		if (environment.SOCRATINK_R1_LOCAL !== '1') return undefined;
		const reviewToken = environment.SOCRATINK_R1_REVIEW_TOKEN;
		if (!reviewToken || Buffer.byteLength(reviewToken, 'utf8') < 32) {
			throw new R1StoreError('SOCRATINK_R1_REVIEW_TOKEN must contain at least 32 bytes.', 'invalid_configuration');
		}
		const reviewerId = environment.SOCRATINK_R1_REVIEWER_ID?.trim();
		if (!reviewerId || reviewerId.length > 128 || reviewerId === 'local-learner') {
			throw new R1StoreError('SOCRATINK_R1_REVIEWER_ID must be nonempty and at most 128 characters.', 'invalid_configuration');
		}
		const correctionToken = environment.SOCRATINK_R1_CORRECTION_TOKEN;
		const correctionReviewerId = environment.SOCRATINK_R1_CORRECTION_REVIEWER_ID?.trim();
		if (Boolean(correctionToken) !== Boolean(correctionReviewerId)) {
			throw new R1StoreError('Correction token and reviewer ID must be configured together.', 'invalid_configuration');
		}
		if (correctionToken && Buffer.byteLength(correctionToken, 'utf8') < 32) {
			throw new R1StoreError('SOCRATINK_R1_CORRECTION_TOKEN must contain at least 32 bytes.', 'invalid_configuration');
		}
		if (correctionToken && correctionToken === reviewToken) {
			throw new R1StoreError('Review and correction tokens must be distinct.', 'invalid_configuration');
		}
		if (correctionReviewerId && (correctionReviewerId.length > 128 || correctionReviewerId === 'local-learner' || correctionReviewerId === reviewerId)) {
			throw new R1StoreError('Correction reviewer ID must be nonempty, distinct, and at most 128 characters.', 'invalid_configuration');
		}
		const dataDirectory = resolve(environment.SOCRATINK_R1_DATA_DIR ?? '.socratink/r1');
		await mkdir(dataDirectory, { recursive: true, mode: 0o700 });
		await chmod(dataDirectory, 0o700);
		return new R1Store(
			dataDirectory,
			digest(reviewToken),
			reviewerId,
			correctionToken ? digest(correctionToken) : undefined,
			correctionReviewerId,
			options.clock ?? (() => new Date()),
		);
	}

	private pathFor(encounterId: string): string {
		if (!/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(encounterId)) throw new R1StoreError('Encounter not found.', 'not_found');
		return join(this.dataDirectory, `${encounterId}.json`);
	}

	private async readUnchecked(encounterId: string): Promise<EncounterRecord> {
		try {
			const text = await readFile(this.pathFor(encounterId), 'utf8');
			return JSON.parse(text) as EncounterRecord;
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code === 'ENOENT') throw new R1StoreError('Encounter not found.', 'not_found');
			throw error;
		}
	}

	private assertCurrent(record: EncounterRecord, exposePurgeMetadata = false): void {
		if (this.clock().getTime() >= Date.parse(record.retentionExpiresAt)) {
			throw new R1StoreError(
				'Encounter retention expired; explicit purge is required.',
				'expired',
				exposePurgeMetadata ? { encounterId: record.encounterId, revision: record.revision, retentionExpiresAt: record.retentionExpiresAt } : undefined,
			);
		}
	}

	private assertCapability(record: EncounterRecord, capabilityToken: string): void {
		if (!sameDigest(record.capabilityHash, capabilityToken)) throw new R1StoreError('Capability denied.', 'denied');
	}

	private assertReviewer(reviewToken: string): void {
		if (!sameDigest(this.reviewTokenHash, reviewToken)) throw new R1StoreError('Reviewer token denied.', 'denied');
	}

	async create(options: { readonly synthetic?: boolean } = {}): Promise<{ readonly record: EncounterRecord; readonly capabilityToken: string }> {
		const capabilityToken = randomBytes(32).toString('base64url');
		const record = createEncounterRecord({ encounterId: randomUUID(), learnerParticipantId: 'local-learner', capabilityHash: digest(capabilityToken), synthetic: options.synthetic ?? false, now: this.clock() });
		await atomicWrite(this.pathFor(record.encounterId), record);
		return { record, capabilityToken };
	}

	async read(encounterId: string, capabilityToken: string): Promise<EncounterRecord> {
		const record = await this.readUnchecked(encounterId);
		this.assertCapability(record, capabilityToken);
		this.assertCurrent(record, true);
		return structuredClone(record);
	}

	async readForReview(encounterId: string, reviewToken: string): Promise<EncounterRecord> {
		this.assertReviewer(reviewToken);
		const record = await this.readUnchecked(encounterId);
		this.assertCurrent(record);
		return structuredClone(record);
	}

	async mutate(encounterId: string, capabilityToken: string, command: LearnerCommand): Promise<EncounterRecord> {
		if (command.type !== 'submit_baseline' && command.type !== 'persist_intervention' && command.type !== 'submit_post') {
			throw new EncounterContractError('Learner credentials cannot adjudicate.');
		}
		return serialized(encounterId, async () => {
			const record = await this.readUnchecked(encounterId);
			this.assertCapability(record, capabilityToken);
			this.assertCurrent(record);
			const isRetry = record.processedRequests.some((request) => request.requestId === command.requestId);
			const next = applyEncounterCommand(record, command, this.clock());
			if (!isRetry) await atomicWrite(this.pathFor(encounterId), next);
			return structuredClone(next);
		});
	}

	async mutateAsReviewer(encounterId: string, reviewToken: string, command: StoreReviewerCommand): Promise<EncounterRecord> {
		if ('reviewerId' in command) throw new EncounterContractError('Reviewer identity is bound by server configuration.');
		if (command.type !== 'adjudicate_baseline' && command.type !== 'adjudicate_post' && command.type !== 'correct_post_adjudication') {
			throw new EncounterContractError('Reviewer credentials may only adjudicate.');
		}
		const correcting = command.type === 'correct_post_adjudication';
		if (correcting) {
			if (!this.correctionTokenHash || !this.correctionReviewerId || !sameDigest(this.correctionTokenHash, reviewToken)) {
				throw new R1StoreError('Correction reviewer token denied.', 'denied');
			}
		} else {
			this.assertReviewer(reviewToken);
		}
		return serialized(encounterId, async () => {
			const record = await this.readUnchecked(encounterId);
			this.assertCurrent(record);
			const boundCommand = { ...command, reviewerId: correcting ? this.correctionReviewerId! : this.reviewerId } as const;
			const isRetry = record.processedRequests.some((request) => request.requestId === boundCommand.requestId);
			const next = applyEncounterCommand(record, boundCommand, this.clock());
			if (!isRetry) await atomicWrite(this.pathFor(encounterId), next);
			return structuredClone(next);
		});
	}

	/** Purge is revision-bound, but successful deletion removes its own retry ledger; an exact retry therefore returns not_found. */
	async purge(
		encounterId: string,
		credential: { readonly capabilityToken: string } | { readonly reviewToken: string },
		command: { readonly requestId: string; readonly expectedRevision: number },
	): Promise<void> {
		await serialized(encounterId, async () => {
			const record = await this.readUnchecked(encounterId);
			if ('capabilityToken' in credential) this.assertCapability(record, credential.capabilityToken);
			else this.assertReviewer(credential.reviewToken);
			if (!command.requestId.trim()) throw new EncounterContractError('Purge requires a unique request ID.');
			if (command.expectedRevision !== record.revision) throw new EncounterContractError('Revision conflict.');
			await unlink(this.pathFor(encounterId));
			const temporaryPrefix = `.${encounterId}.`;
			for (const entry of await readdir(this.dataDirectory)) {
				if (!entry.startsWith(temporaryPrefix) || !entry.endsWith('.tmp')) continue;
				try {
					await unlink(join(this.dataDirectory, entry));
				} catch (error) {
					if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
				}
			}
			await syncDirectory(this.dataDirectory);
		});
	}
}
