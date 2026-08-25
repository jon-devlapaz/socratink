/**
 * Local JSONL persistence for immutable evidence events.
 *
 * Purpose: store R1-scale traces as ordinary files, not an event platform.
 * Inputs: a file path and an `EvidenceEvent`.
 * Outputs: append-only loadable event lists.
 * Constraints: duplicate event IDs are rejected; existing events are never rewritten.
 */
import { appendFile, mkdir, readFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { EvidenceEvent } from '../types/evidence.ts';

export async function loadEvents(filePath: string): Promise<readonly EvidenceEvent[]> {
	let contents: string;
	try {
		contents = await readFile(filePath, 'utf8');
	} catch (error) {
		if (isMissingFile(error)) return [];
		throw error;
	}

	if (contents.trim().length === 0) return [];

	return contents
		.split('\n')
		.filter((line) => line.length > 0)
		.map((line) => JSON.parse(line) as EvidenceEvent);
}

export async function appendEvent(filePath: string, event: EvidenceEvent): Promise<void> {
	const existing = await loadEvents(filePath);
	if (existing.some((candidate) => candidate.eventId === event.eventId)) {
		throw new Error(`Evidence event ${event.eventId} already exists and cannot be mutated.`);
	}

	await mkdir(dirname(filePath), { recursive: true });
	await appendFile(filePath, `${JSON.stringify(event)}\n`, 'utf8');
}

function isMissingFile(error: unknown): boolean {
	return (
		typeof error === 'object' &&
		error !== null &&
		'code' in error &&
		error.code === 'ENOENT'
	);
}
