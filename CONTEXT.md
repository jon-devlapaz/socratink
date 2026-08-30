# Socratink product

The live app is a Flue-backed conversation surface with optional Braintrust logs.

## Language

**Chat**:
The mounted conversation-instruction Flue agent.
_Avoid_: Learner Agent, tutor

**Chat model**:
The OpenAI-compatible endpoint Chat talks to. One resolver: local process, or Vercel AI Gateway when `VERCEL=1`. Identity is snapshotted once; only the API key is request-copied onto `process.env` for Vercel OIDC.
_Avoid_: treating the gateway as a local model; a second provider

**Observability**:
Optional Braintrust instrumentation of Chat/Flue runs. A Braintrust span is a development log. Chat traces and the live smoke share one Observability project.
_Avoid_: learning proof; a second synthetic project
