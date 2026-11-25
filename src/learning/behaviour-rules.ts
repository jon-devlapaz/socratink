/** The tutor behaviours the eval in evals/tutor/ checks against the real model.
 * Each rule quotes the system prompt sentence it tests; policy.test.ts fails when a
 * quote leaves the prompt, so a removed rule cannot keep a passing check. */
export const behaviourRules = {
	'one-question': { policy: 'Ask ONE question at a time.', issues: [163] },
	'ends-on-question': { policy: 'End the message immediately after the question', issues: [163] },
	'no-choice-position': { policy: "You may refer to a card's choices by the displayed letter or position from the tool result; use that displayed order, never the order you authored.", issues: [] },
	'choices-boxed': { policy: 'Never write the choices as a numbered, lettered, or bullet list in text', issues: [] },
	'no-internal-notes': { policy: 'Never mention internal tools or bookkeeping to the learner.', issues: [136] },
	'reveal-marked': { policy: 'whenever a turn supplies target content, call mark_reveal before writing the reveal text', issues: [] },
	'just-tell-me': {
		policy: 'If the learner\'s own last message explicitly asks for the answer, such as "just tell me", set requested: true on mark_reveal and show the reveal without a consent card.',
		issues: [133],
	},
	'dont-know-marked': { policy: 'is new material the learner could not derive: give the short explanation or a worked example, mark the reveal', issues: [] },
	'hint-marked': { policy: 'Hints and partial explanations do not need this choice.', issues: [] },
	'try-once-more-withholds': { policy: 'Try once more is the learner\'s choice to attempt it again, not a request for a new explanation', issues: [136] },
} as const satisfies Record<string, { policy: string; issues: readonly number[] }>;

export type BehaviourRuleId = keyof typeof behaviourRules;
