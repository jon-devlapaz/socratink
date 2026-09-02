# Candidate B (Andrej) — controlled evidence update

## Evidence introduced

Andrej received the exact controlled evidence supplied to Candidate A: 12
fresh-ID cases with persisted earlier evidence but generic later openings, and
an 11/12 prior-gap-use result after manual injection of the earlier attempt,
target, and assistance conditions.

## Response

Andrej explicitly falsified his initial conclusion for fresh conversations. He
retained the confirmed same-ID result, added the newly confirmed fresh-ID
failure, and localized the boundary to the browser-local conversation ID being
the only current continuity key. A fresh or “start over” conversation has no
learner identity, initial context, or retrieval hook.

He treated the 11/12 packet result as evidence that context assembly is
sufficient to alter behavior in this controlled sample, while leaving the
remaining case, identity/ownership model, evidence envelope,
consent/correction/deletion behavior, and retrieval scope unresolved.

## Revised intervention

No implementation was made. Pending authority, Andrej proposed one
server-owned deterministic context resolver at new-conversation admission:

- bind retrieval to an authenticated, authorized learner identity;
- retrieve only the relevant raw learner artifact, target, assistance
  conditions, and source-conversation provenance;
- pass the packet through a trusted server boundary rather than accepting
  history from the browser;
- fail closed for absent, malformed, unauthorized, or ambiguous evidence; and
- keep raw evidence separate from derived learner state without inventing
  mastery or misconception semantics.

He rejected extra agents because the manual packet already isolated the causal
mechanism, not merely because coordination would be complex.

## Proof, checks, and non-claims

After authorization, Andrej proposed rerunning the unchanged 12-case evaluator
against the automatic resolver, retaining the no-context baseline and manual
packet condition, and adding provenance/ownership, fail-closed, and
cross-learner isolation assertions. He limited the proof to retrieval and
response-context behavior.

He re-inspected the product's conversation, Chat, app, database, configuration,
README/context, and database-test seams and searched initialization,
persistent-state, routing, storage, and conversation-ID paths.

- `git status --short` — empty.
- `git diff --stat` — empty.
- `git diff --check` — clean.

No new tests were run because no code changed; the initial full check, smoke,
and context-delivery probe remained the baseline. There were no new errors,
questions, files, or persistent complexity. Human authorization remains
required for identity, authorization, schema, or learner-data changes. No
claim was made about learning, mastery, learner benefit, live-agent improvement,
market value, or the necessity of multiple agents.
