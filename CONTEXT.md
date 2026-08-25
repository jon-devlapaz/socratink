# Socratink product

The live app is a Flue-backed conversation surface with optional Braintrust logs.

## Language

**Chat**:
The mounted conversation-instruction Flue agent.
_Avoid_: Learner Agent, tutor

**Observability**:
Optional Braintrust instrumentation of Chat/Flue runs. A Braintrust span is a development log. Chat traces and the live smoke share one Observability project.
_Avoid_: learning proof; a second synthetic project
