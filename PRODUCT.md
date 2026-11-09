# Product

Socratink's direction is defined in the Brain's
[North Star](socratink-brain/NORTH-STAR.md), with a
[source-repository fallback](https://github.com/jon-devlapaz/socratink-brain/blob/master/NORTH-STAR.md).
This file describes the current application, not the full ambition.

## Implemented boundary

The app provides a single-learner conversation with an AI learning partner:

- Streamed explanations, questions, and feedback in a persistent conversation.
- Structured `present_question` cards with choices and optional reasoning.
- Records of hints, worked examples, partial explanations, and full answers
  through `mark_reveal`, keeping assistance distinguishable from learner work.
- Learner controls for pacing, an unaided attempt, cancellation, and recovery.
- Voice dictation as an input option, plus theme and text-size controls.
- Signed guest sessions, configured Google/GitHub sign-in, conversation
  ownership checks, rate limits, and encrypted learner API-key storage.

The owning implementation is `src/agents/chat.ts`, `src/app.ts`, and their
linked UI, configuration, and server modules. Setup and software checks are
in [README.md](README.md).

## Direction and limits

Personal practice is one part of the North Star. Dialogue rooms, simulated
audiences, one-on-one and group debates, shared projects, teacher workflows,
and delayed independent demonstrations remain proposed capabilities.

The current app does not establish learning effectiveness, durable mastery,
or readiness for a particular learner population. It must describe observed
work and assistance accurately, without turning model interpretations into
facts about a learner. Provider data-use and privacy claims require evidence
for the configured service; the app uses essential session cookies.

Use the North Star to choose future work. Keep implementation and validation
claims tied to the code and evidence that support them.
