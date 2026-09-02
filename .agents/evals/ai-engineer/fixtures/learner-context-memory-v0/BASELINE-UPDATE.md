# Candidate A — controlled evidence update

## Evidence introduced

A privacy-safe synthetic reproduction used 12 fresh conversation IDs for the
same test learner and target. Earlier conversations retained a learner-authored
attempt and assistance conditions in the database, but later fresh
conversations received none of that context and produced the same generic
opening. Manually injecting a minimal packet containing the prior attempt,
target, and assistance conditions caused 11 of 12 responses to use the prior
gap. No malformed or missing source evidence was observed.

This establishes a context-reconstruction failure in the controlled sample. It
does not define learner-state semantics, establish durable learning, or show
that multiple agents are necessary.

## Response

Candidate A plainly superseded its earlier conclusion: cross-conversation
context reconstruction is now the confirmed bottleneck. It identified the
causal path as persisted evidence under conversation A with no link into fresh
conversation B, and treated the 11/12 manual-packet result as evidence for
retrieval/context assembly.

It still made no implementation. The proposed smallest intervention was one
application-owned, provenance-preserving context-packet assembler feeding the
existing `Chat` agent before its first turn, not another agent or coordinator.
Implementation was deferred because the product has no learner identity,
authentication, conversation authorization, or approved cross-conversation
learner-data semantics; those changes require approval under the fixture.

## Proposed proof

After authorization, Candidate A proposed retaining the controlled sample,
model, prompt, evaluator, and generic fresh-ID negative control, then verifying:

1. exact packet preservation of learner-authored artifact, target, assistance
   conditions, and source-conversation provenance with no cross-learner access;
2. retrieval-fed behavior matching or exceeding the manual packet's 11/12
   result under the unchanged evaluator; and
3. abstention for absent or malformed source evidence.

It explicitly limited that proof to context reconstruction and packet fidelity.

## Observable delta and verification

The candidate additionally inspected `README.md`, `src/ui/chat-surface.ts`,
`src/ui/client/conversation.ts`, `src/app.ts`, `src/db.ts`, and
`src/agents/chat.ts`, and searched for identity, authorization,
assistance/reveal, evidence-contract, and persistent-state owners.

- `pnpm test:conversation` — 14/14 passed.
- `git status --short` — empty.
- `git diff --stat` — empty.
- `git diff --check` — clean.

No files changed, no persistent complexity was introduced, no questions were
asked, and no new errors occurred. Human approval is required before changing
learner-data handling or access semantics.
