---
name: catch-brain-to-product
description: >
  Catch Socratink Brain live-implementation (CURRENT STATE, Active notes,
  live-repo SRC) up to the sibling product repository HEAD. Use when tandem
  is mismatch, after a product land, or when the user asks to update Brain
  to socratink, pin CURRENT STATE, or sync doctrine to the live app. Does
  not change Canon, NORTH-STAR, CONSTITUTION, or the product.
---

# Catch Brain to product

Direction is one way: **Brain follows `product/socratink`**. Do not edit the
app to satisfy stale doctrine.

This is socratink-brain **mode E** (current execution state) only. Pattern:
`B013 Catch CURRENT STATE to 3a838eac` / `SRC-0013`.

First:

```bash
python3 .agents/skills/catch-brain-to-product/scripts/inventory.py
```

From another cwd:

```bash
python3 /Users/jondev/dev/active/socratink/product/socratink/.agents/skills/catch-brain-to-product/scripts/inventory.py
```

If `tandem` is `match`, stop. If `unknown`, locate Brain and the app; do not guess.

## Pin

Pin `live_repo_commit` to **product HEAD**, a full hash. Uncommitted product
files are not live implementation: list them, do not describe them as shipped.

Prefer a clean product tree. A dirty tree does not block the catch; it only
narrows the pin to HEAD.

## Write (Brain repo only)

Inspect the product at that commit (`src/ui`, `src/agents`, `src/app.ts`,
`src/server`, `src/braintrust.ts`). Do not trust commit subjects alone.

1. New `10 Sources/Engineering/SRC-00xx Live repo …` — snapshot of HEAD.
   Next id comes from inventory. `source_kind: live-repository-snapshot`.
   `derived_from` includes the previous live-repo SRC.
2. `CURRENT STATE.md` — `live_repo_commit`, `as_of`, `updated`, `sources`,
   **Live implementation**, and the live-repo sentence under Current milestone.
   Keep Strategic direction, Validated Brain substrate, Active proof question,
   and Explicit non-claims unless a listed non-claim is now false (then say so
   and keep the rest).
3. `50 Active/Current Milestone.md` — live-app pin only. Do not mark a retired experiment as run.
4. Views that still name the old pin as live (today: Evidence Engine
   Architecture **Implementation** paragraph). Point them at the new SRC.
5. `60 Ledger/Ingestion Batches/B0xx Catch CURRENT STATE to <short hash>.md`
   — same shape as B013.

Do not commit unless the user asks.

## Do not write

- `CONSTITUTION.md`, `NORTH-STAR.md`, `20 Canon/`
- EXP/DEC/EVD status changes
- Product repository files
- Praxist, prototypes, chat-histories, operator skills as live product

Questionnaires, a Chat target, Braintrust spans, or a sitting are **not**
an evidence-loop experiment mounted and are **not** a passed product proof.

## SRC snapshot

Copy SRC-0013's sections: Provenance, What is present, What is not present, URLs.

Provenance lists material needle commits since the previous pin (inventory
`since_pin`). What is not present must still say: no parallel learner-mode API
family, no reviewer CLI, no evidence-contract library, and no evidence-loop
experiment run — unless the inspected tree actually has them.

## Validate

From the Brain root:

```bash
python .agents/skills/socratink-brain/scripts/brain.py validate
python .agents/skills/socratink-brain/scripts/brain.py orient
```

`tandem` must be `match` after the write (Brain file on disk vs product HEAD;
orient reads CURRENT STATE, so the working tree is enough).

Show the Brain diff. Report:

```text
Pinned:
Previous pin:
SRC:
Batch:
Canon changed: no
Evidence-loop experiment run: no
Validation:
```

## Done when

CURRENT STATE names product HEAD, a new live-repo SRC exists, ledger receipt
exists, validate passes, tandem is match. No product diff.
