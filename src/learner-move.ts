// Reads one learner message with TypeSafe's Jev so the tutor can tell a request for the
// answer, or an "I don't know", from an attempt. Promises: never throws, never holds a turn
// past the connection's timeout, and names a move only when Jev is sure of it. The reading
// is private context for the tutor; it is never shown to the learner or used as a score.
import * as v from 'valibot';
import type { JevConnection } from './config/jev.ts';

export const learnerMoveSignalType = 'learner_move';

// The question scripts/jev-pilot.mjs measured: 97% agreement on two runs (socratink#61).
export const learnerMoveQuestion = {
	type: 'choice',
	instructions:
		'What is `learner_reply` doing in response to `tutor_question` from a tutor who wants the learner to work it out?',
	criteria: {
		attempt: 'Offers their own answer, guess, or reasoning about the question, even if tentative or wrong',
		asks_for_answer: 'Asks the tutor to give the answer, definition, or explanation instead of trying',
		dont_know: 'Says they do not know or cannot start, without asking for the answer and without a guess',
		other: 'Off topic, logistics, a request about the app, small talk, or changing the subject',
	},
} as const;

export type LearnerMove = keyof typeof learnerMoveQuestion.criteria;

// In the pilot, every reading at or above this probability was right but one.
const sureProbability = 0.8;

const moves = Object.keys(learnerMoveQuestion.criteria) as [LearnerMove, ...LearnerMove[]];

const ResponseSchema = v.object({
	answers: v.object({
		learner_move: v.object({
			choice: v.picklist(moves),
			probabilities: v.record(v.string(), v.number()),
		}),
	}),
});

// Only the moves that change what the tutor should do next get a signal; an attempt is the default.
const signalBodies: Partial<Record<LearnerMove, string>> = {
	asks_for_answer:
		'Private reading of the learner message above, not shown to them: they are asking for the answer rather than attempting. If their words agree, follow the rule for an outright request.',
	dont_know:
		'Private reading of the learner message above, not shown to them: they say they do not know or cannot start. If their words agree, scaffold before asking for an attempt.',
};

export async function readLearnerMove(
	turn: { readonly tutorQuestion: string; readonly learnerReply: string },
	connection: JevConnection,
	fetchImpl: typeof fetch = fetch,
): Promise<LearnerMove | undefined> {
	try {
		const response = await fetchImpl(`${connection.baseUrl}/v1/systemone`, {
			method: 'POST',
			headers: { authorization: `Bearer ${connection.apiKey}`, 'content-type': 'application/json' },
			body: JSON.stringify({
				model: 'jev-latest',
				state: { tutor_question: turn.tutorQuestion, learner_reply: turn.learnerReply },
				questions: { learner_move: learnerMoveQuestion },
			}),
			signal: AbortSignal.timeout(connection.timeoutMs),
		});
		if (!response.ok) return undefined;
		const parsed = v.safeParse(ResponseSchema, await response.json());
		if (!parsed.success) return undefined;
		const { choice, probabilities } = parsed.output.answers.learner_move;
		return (probabilities[choice] ?? 0) >= sureProbability ? choice : undefined;
	} catch {
		return undefined;
	}
}

export function learnerMoveSignalBody(move: LearnerMove | undefined): string | undefined {
	return move ? signalBodies[move] : undefined;
}
