# Socratink product

The live app is a Flue-backed conversation surface with optional Braintrust logs.

## Language

**Chat**:
The mounted conversation-instruction Flue agent.
_Avoid_: Learner Agent, tutor

**Chat model**:
The endpoint Chat talks to. Operator, unsigned, and smoke stays remain
`jon-local` (local process, or Vercel AI Gateway when `VERCEL=1`). An
authenticated learner's Chat uses one exclusive route: OpenRouter if that
row exists (`openrouter/openai/gpt-5-nano`), else OpenAI paste
(`openai/gpt-5-nano`), else operator. Keys resolve per request from the
secret store.
_Avoid_: wrapping Flue; ChatGPT or Claude consumer OAuth; learner keys on
`process.env`; `Models.login`; per-request `setProvider` with a captured key

**Observability**:
Optional Braintrust instrumentation of Chat/Flue runs. A Braintrust span is a development log. Chat traces and the live smoke share one Observability project.
_Avoid_: learning proof; a second synthetic project
