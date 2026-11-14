# Product

Socratink's direction is defined in the [North Star](NORTH-STAR.md).
This file describes the current application, not the full ambition.

## Implemented boundary

The app provides a single-learner conversation with an AI learning partner:

- Streamed explanations, questions, and feedback in a persistent conversation.
- Socratic tutoring by Jane Street's MIT-licensed socratic-tutor skill: a
  diagnostic, a skill map with levels 0-5, one question at a time, in-session
  spaced review, and a final assessment.
- Structured `present_question` cards with choices, optional reasoning, and
  Hint and "I don't know" buttons, so a card never forces a guess.
- Records of hints, worked examples, partial explanations, and full answers
  through `mark_reveal`, keeping assistance distinguishable from learner work.
  A card help request always counts as assistance. A reply that answers a
  request for help, or looks like it supplies content, without `mark_reveal`
  gets one correction where the tutor decides whether to mark it.
- Learner controls for pacing, an unaided attempt, cancellation, and recovery.
- Voice dictation as an input option, plus theme and text-size controls.
- Signed guest sessions, configured Google/GitHub sign-in, conversation
  ownership checks, and rate limits. Every learner uses the operator model route.

Conversations run through `src/server/durable/` with the teaching policy
(the vendored skill plus Socratink bindings) in `src/learning/` and model routing in `src/inference/`.

The owning implementation is `src/learning/`, `src/app.ts`, and their
linked UI, configuration, and server modules. Setup and software checks are
in [README.md](README.md).

## Direction and limits

The app serves individual learners. Speaking to an audience and arguing a
case with other people are later directions, not built capabilities.
A later-day retention re-check is also not built.

The tutor rates subskill levels and mastery inside a conversation by the
skill's strict evaluation rules. That rating is the tutor's judgment, not an
external measurement, and the app does not establish learning effectiveness
or readiness for a particular learner population. It must describe observed
work and assistance accurately. Provider data-use and privacy claims require evidence
for the configured service; the app uses essential session cookies.

Use the North Star to choose future work. Keep implementation and validation
claims tied to the code and evidence that support them.
