# Socratink working-loop prompt

Paste this into any coding agent. Return a playbook for shipping **Socratink
product** work that a learner would notice. Do not audit my whole career.

---

You are auditing **Socratink** (`/Users/jondev/dev/active/socratink/product/socratink`,
GitHub `jon-devlapaz/socratink`). I want structure for **idea → PR** that
moved the **product needle**, not more back-and-forth.

## Goal (one sentence)

Find which Socratink changes actually moved Chat / the learner surface, how
those landed (quality included), where I and agents failed, and which
**skills, tools, and harnesses** make that pattern repeatable.

## Privacy

- Do not quote raw chat, learner text, secrets, keys, tokens, or private URLs.
- Cite conversations as `short title` + id only.
- Chat-history snapshots are private evidence, not reprint fodder.

## What counts as the needle

**Include** only if a learner using Socratink would notice, or if the change
unblocked that path:

- Chat actually running (boot, routing, provider, interruptible replies)
- Tutor instruction / protocol behavior the learner hears
- Learner UI (turns, questionnaires, dock, motion) on the existing surface
- One live synthetic Chat trace in Braintrust when *that* was the stated
  outcome

**Exclude** even if the git history is large:

- Praxist, DIG, baselines, operator launch, `praxist_task/`
- New evaluation products, reviewer workflows, extra route families
- The reverted R1 learner-evidence product (that is a **failure**, not a win)
- Prototypes, archive, chat-history tooling, skill authoring, Flue rewrites
- Words like dogfood / scientific / production quality that grew scope

Read `AGENTS.md` and `ZEN.md` before judging quality. Before consequential
product or learning claims, use `.agents/skills/socratink-brain` (`brain.py
orient`). `CURRENT STATE.md` is doctrine pinned to a named commit; confirm
the hash.

## Evidence order (do not invert)

1. **Canonical success:** merged PRs / landed commits under `src/ui`,
   `src/agents`, `src/app.ts`, `src/server`, `src/braintrust.ts` that match a
   one-sentence learner-visible outcome; `pnpm check` and `pnpm smoke`;
   `pnpm smoke:braintrust-live` only when that was the asked proof.
2. **Canonical failure:** reverts, the R1 expansion, abandoned product
   branches, huge diffs for a narrow Chat ask, verify-never-ran, usage
   burned on operator/Praxist instead of the product.
3. **Chat as explanation only.** “Done” in chat without a product land is
   **unverified**.

Start:

```bash
python3 .agents/skills/working-loop/scripts/inventory.py
```

Grep and sample transcripts. Do not ingest dumps. Prefer product-path
commits from the inventory over the full log.

### Where to look

- Product git: this repo only. Not prototypes. Not `socratink-brain` unless
  a landed product change depended on a Brain contract.
- Snapshots: `/Users/jondev/dev/active/socratink/chat-histories/<harness>/`
  (Socratink-related copies). Use live Cursor/Codex/Claude stores only if
  the snapshot is stale.
- Skills: `.agents/skills/` in this repo (`socratink-brain`, `karpathy-guidelines`,
  `flue-wiki`, `code-review`, `better-ui`). Praxist skills explain operator
  failure, not product wins.

## Quality bar for a “win”

- One sentence outcome, then stop when proven (`AGENTS.md`)
- Smallest complete change; attach to existing Chat/UI flow
- Surgical diff; no extra product surface
- Proof that matches the ask (`pnpm check` / `pnpm smoke` / live trace)
- Flue stays published `@flue/*` — not a framework rewrite

Map Fryxell: **commodity on explore / worker / critic; frontier on plan and
promote.** If a needle win used one model for everything, say so.

## Failures to look for

- Scope tripwire: new mode, routes, persistence, eval system, experiment
  framework when Chat instrumentation would have done
- I had to keep asking what the agent was doing
- Operator frontier quota spent on Praxist/setup instead of a Chat PR
- Commodity planner looping; missing `claude` on PATH; baseline 0.0
- `socratink-brain` / `flue-wiki` skipped on product or harness work

## Wins to record

For each needle win: harness, model split, skills actually used, tools
(`gh`, `pnpm`, browser), diff size, proof, human turns to land.

Prefer repeated patterns (e.g. small `feat(ui)` / `fix(chat)` PRs) over
one-off epics.

## Output (this format only)

### 1. Playbook (Socratink default)

Numbered. No choices. Include harness split, commodity vs frontier, max 5
skills to load first, one-sentence outcome rule, verify commands, stop
rules (including: do not start Praxist to “move the product”).

### 2. Needle wins

3–7 bullets. Each cites a PR or commit on product paths, plus a conversation
id only if chat explains it.

### 3. Failures

3–7 bullets. Split **my** mode vs **agent** mode. Include the R1 expansion
if evidence supports it.

### 4. Replicate with

| Lever | Use for needle work | Do not use for |
| skills | | |
| tools | | |
| harnesses | | |
| models | | |

### 5. Stop doing

Short. No pep talk.

If needle evidence is thin, say **unknown** and still give the best default
from `AGENTS.md`. Do not pad with Praxist or tooling “wins.”
