# Candidate A — initial run

## Harness result

Candidate A concluded that no implementation was warranted. It identified the
current mechanism as a durable Flue conversation rather than a learner-memory
system, and found no supplied failure showing that context was the bottleneck
or defining learner-state semantics for a new system.

## Observable trajectory

- Traced the browser-stored conversation ID through
  `src/ui/client/conversation.ts`, the single `Chat` mount in `src/app.ts`,
  Flue persistence through `src/db.ts`, and the absence of learner-model,
  evidence-contract, assistance-provenance, policy, or multi-agent mechanics in
  `src/agents/chat.ts`.
- Retrieved Brain constraints from the Constitution, North Star, Learner Agent
  Contract, Evaluation Architecture, `LST-0001`, `DEC-0005`, `EVD-0001`,
  `EVD-0002`, `EVD-0004`, `DEC-0004`, and open questions.
- Considered retaining the durable conversation, adding same-agent persistent
  learner state, and adding a memory coordinator plus multiple agents.
- Rejected implementation because no failure reproduction, authorized evidence
  contract, state semantics, update rule, correction/deletion behavior, or
  concrete policy decision had earned persistent learner state or coordination.
- Asked no questions and required no human intervention.

## Commands and verification

The candidate reported full reads of the project instructions, fixture, role,
relevant product modules and tests, selected Brain and Flue skill material, and
the relevant Brain and Flue documents. It used scoped file inventory and text
search, Brain and Flue orientation/context helpers, revision checks, the full
quality gate, smoke test, and final Git inspection.

The first quality-gate attempt stopped before checks because pnpm would not
replace the generated `node_modules` directory without a TTY
(`ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY`). The candidate ran
`CI=true pnpm install --frozen-lockfile`, then:

- `pnpm check` — passed typecheck, all contract suites, and server/UI builds;
- `pnpm smoke` — passed health, root, three assets, agent route, completed
  response, and restart persistence;
- `git status --short` — empty;
- `git diff --stat` — empty; and
- `git diff --check` — clean.

The build produced the existing client-chunk size warning only.

## Result and non-claims

No files changed. The candidate distinguished durable conversation persistence
from a learner model and distinguished engineering correctness from improved AI
behavior, learner benefit, durable learning, mastery, and production readiness.

The candidate also reported a harness-metadata discrepancy: the prepared
workspace HEAD is the evaluation preparation commit over product
`b0192e681133cf5ab4b32c51ee1798494376160d`, while the live dirty Brain checkout
was newer than the fixture's recorded Brain commit. It stated that the product
source/package diff from the product base was empty and that the discrepancy did
not change its conclusion, but requested strict Brain alignment for a fully
pinned comparison.
