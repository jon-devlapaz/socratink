# FM-DOCPRUNE-01 — Keep / Thin / Merge / Delete scout

**As of:** 2026-09-15 ~23:52 CDT (Jondev.local)  
**Mode:** READ + PROPOSE only. No deletes executed. No Brain Canon/Constitution mutations.  
**Goal:** Cut agent-context noise; maximize signal for coding + research agents.  
**Scope:** Socratink Brain (`product/socratink-brain`) + app `research/` (+ related AGENTS pointers / agenteng wiki). No product code.

---

## Question

What should agents **keep loading**, **thin**, **merge**, or **delete** so context stays high-signal—without destroying epistemic authority or recoverable research warehouses?

---

## Inventory (verified)

| Area | Count / size | Notes |
| --- | --- | --- |
| Brain root | **186** `.md`, ~3.4M | Separate git repo; dirty=false at orient |
| Brain authority files | CONSTITUTION, NORTH-STAR, GOVERNANCE, README, 00 HOME, OPEN QUESTIONS | Always-on for consequential product work via `brain.py orient` |
| Brain `20 Canon` | **51** md | Epistemic truth — do not delete without captain ack |
| Brain `40 Views` | **7** md | Derived maps — keep; load by task |
| Brain `10 Sources` | **47** md (~280K) | Provenance; load only when provenance needed |
| Brain `90 Archive` | **68** md (~396K) | Historical — never preload |
| Brain Templates + Ledger | 6 + 1 md | Keep for mutation workflow |
| App `research/` | **97** md, **~5.3M** | Dominated by `chat-signal` (~5.2M) |
| `research/chat-signal/agenteng-runs` | **45** md (~705K) + **8** json (~1.3M) = **~2.1M** | Warehouse / strata packs |
| `smell-runs` + `pilot-runs` | ~1.5M + ~1.1M | Mostly JSON packs; **0** md |
| `wiki-source/agenteng` (noisy V1) | **19** md (~280K) | Full annex dumps — superseded |
| `wiki-source/agenteng-distilled` (V2) | **12** md (~48K) | Intended playbook source |
| Product `doc-vault/agenteng-obsidian-wiki` | **25** md (~372K) | Noisy V1 generated vault still in app tree |
| Absolute V2 vault `/Users/jondev/dev/doc-vault/agenteng-obsidian-wiki` | **MISSING** | Pointer in `research/chat-signal/AGENTS.md` is currently dead |
| App root `AGENTS.md` | **277** lines / ~12K | Product contract — keep; optional thin |
| Nested research `AGENTS.md` | 3 small files (chat-signal 18 lines) | Load-on-demand pointers |
| `.agents/learnings/` | 2 files (~12K) | Keep; already on-demand |
| Agenteng Docs-only note | Prefer `…/Docs/` when vault exists; ignore `_meta/`, `scripts/`, sync scaffolding | Per Captain preference |

`brain.py orient` root: `/Users/jondev/dev/active/socratink/product/socratink-brain` (head `e50d62a`).

---

## KEEP (do not delete; load rules apply)

| Path | Reason | Risk if removed |
| --- | --- | --- |
| `socratink-brain/CONSTITUTION.md` | Epistemic invariants | **Critical** — authority collapse |
| `socratink-brain/NORTH-STAR.md` | Strategic direction | Critical |
| `socratink-brain/GOVERNANCE.md` | Mutation/reconciliation rules | Critical |
| `socratink-brain/README.md`, `00 HOME.md` | Orientation | High |
| `socratink-brain/OPEN QUESTIONS.md` | Live uncertainty | High |
| `socratink-brain/20 Canon/**` | Canon = epistemic truth | Critical — captain ack required for any delete |
| `socratink-brain/40 Views/**` | Task-scoped derived maps | High |
| `socratink-brain/80 Templates/**`, `60 Ledger/**` | Mutation workflow | Medium |
| App `AGENTS.md`, `ZEN.md` | Coding-agent contract | Critical for product agents |
| `.agents/skills/socratink-brain/**` | Live Brain interface | Critical |
| `.agents/skills/agenteng-wiki/**` | Vault orient/locate | Medium (until vault restored) |
| `research/chat-signal/FM-AGENTENG-01.md` (+ captain-brief) | FINAL master + operator brief | High for agenteng ops |
| `research/chat-signal/FM-CHATSIG-*.md`, `FM-CTXSMELL-01.md` | Scout reports | Medium |
| `research/chat-signal/wiki-source/agenteng-distilled/**` | Distilled ≤12-page source of truth for wiki regen | High until vault restored |
| `research/chat-signal/AGENTS.md` (after rewrite) | Load-on-demand gate | Medium |
| Other Obsidian vaults under `/Users/jondev/dev/doc-vault/` (flue, typesafe, …) | Out of scope but leave alone | — |

**Load rule (KEEP but never preload):** Brain `10 Sources/**`, Brain `90 Archive/**`, `agenteng-runs/**` markdown annexes, smell/pilot JSON — open only via explicit path or `brain.py` / skill `show`.

---

## THIN (safe drafts; no file delete)

| Path | Proposal | Reason | Risk |
| --- | --- | --- | --- |
| `product/socratink/AGENTS.md` | Keep doctrine/boundaries; optionally collapse long `pnpm test:*` laundry list to “prefer narrowest script from package.json / `pnpm check`” | Cuts always-on tokens without losing tripwires | Low |
| `research/chat-signal/AGENTS.md` | **Rewrite now (draft below)** — remove dead absolute vault path; point to distilled source + regen; Docs-only when present; explicitly ban preloading `agenteng-runs` / noisy wiki-source | Fixes broken pointer; enforces load-on-demand | Low |
| `research/pr-reviews/AGENTS.md`, `research/typesafe/AGENTS.md` | Keep short; add one line “do not preload sibling chat-signal warehouses” | Consistency | Low |
| Brain agent load path | Enforce via skills: `orient` → smallest View → Canon IDs; **never** dump Archive/Sources into default context | Matches Captain “context-only-loaded-when-needed” | Low (process) |
| `.agents/skills/agenteng-wiki` | After V2 regen: orient must resolve vault; until then skill should fail closed / point at distilled source | Prevents loading sync scaffolding as doctrine | Low |

---

## MERGE (logical; do not duplicate in context)

| Keep as summary | Do not also load | Reason |
| --- | --- | --- |
| `FM-AGENTENG-01.md` FINAL | Full `agenteng-runs/*.md` + annex copies under `wiki-source/agenteng/annexes/` | Master already folds burns; annexes are warehouse |
| Distilled wiki pages (12) | Noisy V1 wiki-source (19) + product `doc-vault/agenteng-obsidian-wiki` Docs | Same story, less noise |
| `FM-AGENTENG-01-captain-brief.md` | Full loops/nole/happy-paths annexes for Captain briefing | Brief is the operator surface |
| Brain Views | Raw Sources + Archive historical Views | Views are the derived layer |

---

## DELETE / archive-off-tree (propose only — needs captain ack)

| Path | Action | Reason | Risk |
| --- | --- | --- | --- |
| `research/chat-signal/wiki-source/agenteng/**` (19 noisy notes) | DELETE or move to cold archive outside app | Superseded by `agenteng-distilled/`; agents still discover and preload | Medium — recoverable from git if needed |
| `product/socratink/doc-vault/agenteng-obsidian-wiki/**` | DELETE from product tree after V2 vault restored under `/Users/jondev/dev/doc-vault/` | Noisy V1; duplicates research; pollutes product tree | Medium |
| `research/chat-signal/agenteng-runs/*.json` (~1.3M) | DELETE or `git-annex`/cold store | Strata packs not for agent context; keep md warehouse or one index | Low–medium if re-scoring needed |
| `research/chat-signal/smell-runs/**`, `pilot-runs/**` (~2.6M) | Cold archive outside default tree | JSON scoring packs; 0 md; accidental preload waste | Low–medium |
| Duplicate root `research/2026-09-15-agenteng-socratink-30-60-90-primary.md` | DELETE if identical to `agenteng-runs/socratink-30-60-90-primary.md` | Duplicate | Low |
| Absolute V2 vault (missing) | **RESTORE/REGEN** (not delete) from `agenteng-distilled` via make-wiki | Pointer broken tonight | — |

**Not proposed for delete:** Brain Archive (keep in Brain repo; mark never-load). Prefer governance: Archive stays; agents must not open it unless archaeology.

---

## What NOT to touch (without explicit captain ack)

- Brain **CONSTITUTION / NORTH-STAR / GOVERNANCE / Canon** content or IDs  
- Product `src/**`, lockfiles, CI, Flue packages  
- Other doc-vault wikis (flue, typesafe, braintrust, docent)  
- `.agents/skills/socratink-brain` contract semantics  
- Live learner data / secrets  
- Deleting Brain `90 Archive` wholesale (historical rationale)

---

## Proposed `research/chat-signal/AGENTS.md` rewrite (draft)

```markdown
# research/chat-signal — load on demand

Do **not** preload this tree. Open one named report or the distilled wiki.

## Agentic Engineering playbook

- **Distilled source (always):** `wiki-source/agenteng-distilled/` (≤12 short pages)
- **Vault (when present):** `/Users/jondev/dev/doc-vault/agenteng-obsidian-wiki/Docs/` only  
  Ignore vault `_meta/`, `scripts/`, `src/`, `tests/`, sync scaffolding.
- **Skill:** `.agents/skills/agenteng-wiki` → `orient` then `show`
- If the absolute vault is missing: use distilled source; do not fall back to
  `wiki-source/agenteng/` or `doc-vault/agenteng-obsidian-wiki` (noisy V1).

## Reports (open by name)

- Master: `FM-AGENTENG-01.md`
- Captain brief: `FM-AGENTENG-01-captain-brief.md`
- Chat signal / smells: `FM-CHATSIG-01.md`, `FM-CHATSIG-PILOT.md`, `FM-CTXSMELL-01.md`

## Never preload

- `agenteng-runs/` (warehouse + JSON strata)
- `smell-runs/`, `pilot-runs/`
- `wiki-source/agenteng/` (noisy superseded source)
```

---

## Proposed optional root `AGENTS.md` patch (thin; draft snippet)

Add under **Working method** or **Boundaries / Always** (one short bullet):

> Research under `research/` is load-on-demand. Prefer `research/*/AGENTS.md` pointers. Never preload `research/chat-signal/agenteng-runs`, smell/pilot JSON packs, or Brain `90 Archive` / `10 Sources` unless the task names provenance or archaeology.

Optional Commands thin: replace the long `pnpm test:*` list with:

> Prefer the narrowest script for the change (`pnpm check:types`, package-local tests, then `pnpm check` / `pnpm smoke` at handoff).

Do **not** remove Brain orient, Flue wiki, scope tripwires, or Boundaries.

---

## Findings that change tonight’s plan

1. **V2 absolute vault is missing** from `/Users/jondev/dev/doc-vault/` (sibling wikis remain). Chat-signal AGENTS still points at Docs there → agents will fail or fall into noisy product `doc-vault/` V1.  
2. **~4.7M** of chat-signal is warehouse JSON/md (`agenteng-runs` + smell + pilot) — highest ROI for cold-archive, not Brain Canon cuts.  
3. Brain is already well-layered; the win is **load discipline**, not deleting Canon.

---

## Captain decision ask

Please choose one:

**A — Thins-only (safe tonight)**  
- Apply chat-signal `AGENTS.md` rewrite (+ optional root one-liner).  
- Regenerate V2 vault to `/Users/jondev/dev/doc-vault/agenteng-obsidian-wiki` from `agenteng-distilled`.  
- Leave all Brain + research files on disk.

**B — Approve deletes / cold-archive** (in addition to A)  
- Remove or cold-move: noisy `wiki-source/agenteng/`, product `doc-vault/agenteng-obsidian-wiki`, `agenteng-runs/*.json`, `smell-runs/`, `pilot-runs/`, duplicate 30-60-90 primary at research root.  
- Keep Brain Canon/Constitution untouched; Archive stays in Brain but never-load.

**C — Hold** — proposal only; no AGENTS edits until further review.

Reply with **A / B / C** (and any paths to carve out).

---

## Assumptions

- Captain “yes tonight” authorized this **scout + propose**, not silent deletes.  
- Distilled V2 source on disk remains authoritative for regen even though absolute vault is gone.  
- Product dirty git tree may already include unrelated work — any apply step must be explicit and path-scoped.

## Open questions

- Was absolute V2 vault deliberately removed during tonight’s prune, or accidental?  
- Preferred cold-archive location (outside `product/socratink`) if B?  
- Should Brain Archive ever be git-submoduled / separate clone for agents?

## What could not be checked

- Full byte-identity of duplicate 30-60-90 files (propose verify before delete).  
- Whether Firstmate/Captain already started deletes under `doc-vault/` mid-scout.  
- Obsidian user notes under product V1 `My Notes/` contents (flag: check before deleting product vault).

---

*Researchy · FM-DOCPRUNE-01 · READ+PROPOSE*
