# Build-5 handoff (written by the agent operator)

The build-5 worker reached its 20-response cap (21 recorded, one in flight) before it committed or wrote this report. Its edits were complete in the working tree. The agent operator ran `pnpm check` on them (passed), then committed them unchanged.

- `src/learning/tools.ts`: the choice order is seeded by the tool call id (SHA-256 of call id and index), so a replay or reload of the same call keeps its order and every new call, including an identical retry, gets a new order. "…of the above" choices stay last. Each choice gets a displayed letter, and the tool result the tutor reads lists the choices in displayed order with letters.
- `src/server/durable/extension.ts`: `execute` passes `api.callId`; the after-tool check passes `round.id`, so both paths use the same seed.
- Prompt and rule `no-choice-position` now say the tutor may name a choice by the displayed letter or position from the tool result, never by the order it authored. The eval check fails only when a named position or letter does not match the displayed card.

Not run: the live eval (paid). Browser preview of the letters on the card.
