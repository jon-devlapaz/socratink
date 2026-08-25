/**
 * Authorship derivation for evidence artifacts.
 *
 * Purpose: keep learner work distinguishable from model work (EVD-0001).
 * Inputs: ordered artifact parts tagged learner or model.
 * Outputs: `learner`, `model`, or `mixed`, plus the original concatenated text.
 * Constraints: mixed parts stay separately tagged; never paraphrase the learner.
 */
import type { ArtifactPart, AuthorshipKind } from '../types/evidence.ts';

export function deriveAuthorship(parts: readonly ArtifactPart[]): AuthorshipKind {
	if (parts.length === 0) {
		throw new Error('An evidence artifact must include at least one authored part.');
	}

	const kinds = new Set(parts.map((part) => part.authorship));
	if (kinds.size === 1) {
		const [kind] = kinds;
		if (kind === undefined) {
			throw new Error('An evidence artifact must include at least one authored part.');
		}
		return kind;
	}

	return 'mixed';
}

export function originalArtifactText(parts: readonly ArtifactPart[]): string {
	return parts.map((part) => part.text).join('');
}
