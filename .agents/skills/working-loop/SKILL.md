---
name: working-loop
description: >
  Audit Socratink idea-to-PR work that moved the learner-facing product needle.
  Mines Socratink chat snapshots and product git/PRs for real wins and
  failures, then names skills, tools, and harnesses to reuse. Use when the
  user is tired of back-and-forth, asks what actually shipped in Socratink,
  or wants a repeatable product loop—not tooling, Praxist, or chat archaeology.
---

# Socratink working loop

Audit **Socratink the product** (`product/socratink`, remote
`jon-devlapaz/socratink`). Ignore work that did not change what a learner
can do in Chat or on the learner surface.

Follow [PROMPT.md](PROMPT.md). Read [sources.md](sources.md). First:

```bash
python3 .agents/skills/working-loop/scripts/inventory.py
```

From another cwd:

```bash
python3 /Users/jondev/dev/active/socratink/product/socratink/.agents/skills/working-loop/scripts/inventory.py
```

Do not dump raw chat, learner wording, secrets, tokens, or private endpoints.

## Needle (include)

A change moved the needle if a learner would notice it, or if it unblocked
that path: Chat boots, replies, questionnaires, instruction/tutor behavior,
learner UI, or a live synthetic Chat run in Braintrust when that was the ask.

## Not the needle (exclude)

Praxist runs, task init, baselines, DIG, operator skills, chat-history
exports, prototypes, archive, Flue framework rewrites, new eval products,
and the reverted parallel learner-evidence expansion. Those may explain a failure;
they are not success.

## Done when

One playbook: default Socratink loop, 3–7 needle wins, 3–7 failures, what
to reuse, what to stop. No menu of follow-ups.
