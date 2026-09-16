# FM-PARETO-02 — Residual dirt scout (post `#21` / origin/main)

**As of:** 2026-09-16 ~01:00 CDT  
**Mode:** Scout only. No deletes executed.  
**Baseline:** `origin/main` @ `76f9e0bd` — `chore: FM-PARETO-CUT — cold-archive NOISE paths to PARETO-01`  
**Method:** Detached worktree on `origin/main` (local `main` working tree was **dirty + behind 13**; `git pull --ff-only` aborted). Do not treat uncommitted local `research/` as merged truth.

**Done bar (Captain):** hot path = Chat knee + `PRODUCT`/`ZEN`/`AGENTS` + `socratink-brain` + thin `AGENTS` maps only; warehouses / skills junk / tooling artifacts **not default-loadable**.

**Protected (do not cut):** Chat knee `src/` (incl. living-ink), Brain Canon/Constitution (sibling repo), `wiki-source/agenteng-distilled/`.

---

## Clean-enough?

### **No**

Default-load gates improved a lot (root `AGENTS.md` bans cold-archive preload; mega skills moved under `PARETO-01/skills/`). The clone is still **not product-pure**: **~12.3M tracked** under `research/_cold-archive/**` ships with every checkout, and several **hot** chat-signal annexes + optional skill packs remain in the agent-visible tree.

---

## What `#21` / PARETO-CUT already fixed

| Item | Status on `origin/main` |
| --- | --- |
| Mega skills (`personas-skillset`, `common-skills-skillset`, `variate`) | Cold under `research/_cold-archive/PARETO-01/skills/` (~7.7M) |
| `agenteng-runs/` markdown warehouse | Cold under `…/PARETO-01/agenteng-runs/` (~792K) |
| Root `AGENTS.md` never-preload + FREEZE pointer | Present |
| Distilled wiki source | Still hot at `wiki-source/agenteng-distilled/` (12 pages) — **KEEP** |
| Chat knee / living-ink | Untouched — **KEEP** |

DOCPRUNE cold (`…/DOCPRUNE-01/`, ~4.5M) remains from earlier land.

---

## Top still-dirty list (ranked)

| # | Path | Size | Class | READY-FOR-CUT? | Notes |
| --- | ---: | --- | --- | --- | --- |
| 1 | `research/_cold-archive/` (whole tree) | **~13M** disk / **~12.3M** tracked | NOISE in-repo | **YES** — evacuate | Biggest purity miss: cold ≠ out-of-repo. Prefer move to sibling archive / git history only + `gitignore`, or sparse-checkout exclude |
| 2 | `research/_cold-archive/PARETO-01/skills/` | ~7.7M | Archive | **YES** (with #1) | Includes huge Karpathy transcripts / variate assets |
| 3 | `research/_cold-archive/DOCPRUNE-01/` | ~4.5M | Archive | **YES** (with #1) | JSON strata + smell/pilot packs |
| 4 | Hot annexes: `FM-AGENTENG-01-loops.md`, `-nole.md`, `-happy-paths.md`, `-extract.md` | ~90K | Warehouse still hot | **YES** | Master + captain-brief enough; annexes duplicate cold warehouse |
| 5 | `2026-09-15-context-management-smells-primary-sources.md` | ~22K | Research dump | **YES** | Point from `FM-CTXSMELL-01` only if needed |
| 6 | Draft AGENTS leftovers (`AGENTS.md.DRAFT-*`, `AGENTS-root-snippet.DRAFT-*`) | ~8K | Process residue | **YES** | Live `AGENTS.md` already applied |
| 7 | `.agents/skills/better-ui-skillset` | ~253–384K | Optional tooling | **YES** (cold or home Tink) | Largest remaining skill; not Chat knee |
| 8 | Coding-meta skill cluster (`clean-code`, `triangulate-me`, `skill-scout`, `make-wiki-from-docs`, `manage-tink`, `explain-interface`, `interface-review`, `break`, `thermo-nuclear-*`, `code-review`, `writing-for-agents`, `improve-codebase-architecture`, `variant`, `typesafe-ai`) | ~0.5M combined | SUPPORTING / optional | **PARTIAL** | Keep thin set: `socratink-brain`, `flue-wiki`, `agenteng-wiki`, `catch-brain-to-product`, (+ `working-loop` if Captain wants). Rest → cold or Tink library |
| 9 | `praxist_task/` (tracked remnant) | ~32K / 4 tracked files | FREEZE residue | **YES** | Most paths gitignored individually (smell); delete tracked remnant + simplify gitignore |
| 10 | Secondary research folders still without pareto map (`architect/`, `dogfood/`, missing `research/pareto/` on main) | ~36K+ | Process | **THIN** | Add `research/pareto/AGENTS.md` + land PARETO-01/02 scouts on main; keep tiny AGENTS maps |

Honorable mentions (not top-10): wiki `COPYFROMBOX-MANIFEST-*.txt`; Braintrust/docent wiki skills (keep if observability work continues); empty `doc-vault/` if present.

---

## Hot-path scorecard vs Done bar

| Required hot path | On `origin/main`? |
| --- | --- |
| Chat knee (`src/agents/chat`, tools, transcript UI, model stack) | Yes |
| Living-ink (protected) | Yes (do not cut) |
| `PRODUCT.md` / `ZEN.md` / root `AGENTS.md` | Yes |
| `socratink-brain` skill | Yes |
| Thin research `AGENTS.md` maps | Partial (`chat-signal`, `typesafe`, `pr-reviews`) — **no `research/pareto/` on main yet** |
| Warehouses not default-loadable | **Policy yes** / **tree no** (cold still cloned) |
| Skills junk not default-loadable | **Mostly** (megas archived) / residual better-ui + meta skills remain listable |

---

## Recommended next EXECUTE (not done here)

**A — Evacuate cold (highest ROI)**  
1. Move `research/_cold-archive/` out of product git (sibling dir or release artifact).  
2. Add `research/_cold-archive/` to `.gitignore`.  
3. Leave recovery note in `research/README.md` pointing at git history tag/`76f9e0bd`.

**B — Finish hot chat-signal**  
Cold-move annex dumps + drafts; keep `FM-AGENTENG-01.md`, captain-brief, CHATSIG/CTXSMELL scouts, `wiki-source/agenteng-distilled/`, thin `AGENTS.md`.

**C — Skill diet**  
Cold or Tink-home: better-ui + meta coding skills not required for Chat knee. Keep Brain/Flue/agenteng/catch (+ optional working-loop).

**D — Praxist remnant**  
Delete tracked `praxist_task` leftovers; collapse sprawling gitignore entries to `praxist_task/` if Captain still wants ignore, or remove entirely.

**E — Land scouts**  
Commit `research/pareto/FM-PARETO-01.md` + `FM-PARETO-02.md` + folder `AGENTS.md` onto main (this file may exist only on dirty local until then).

---

## Local blocker (operator)

Captain/`main` worktree at `/Users/jondev/dev/active/socratink/product/socratink` is **dirty** (modified Chat/UI/package + untracked research/skills) and **behind** `origin/main` by 13 commits. FF pull aborted. Scout used worktree:

`/Users/jondev/dev/active/socratink/product/socratink-pareto02-wt` @ `76f9e0bd`.

Reconcile before next EXECUTE cut on the live tree.

---

## What NOT to touch

- `src/agents/chat.ts`, questionnaire/reveal/ink, chat UI knee, living-ink  
- Sibling `socratink-brain` Canon / CONSTITUTION / NORTH-STAR  
- `research/chat-signal/wiki-source/agenteng-distilled/`  
- Absolute vault `/Users/jondev/dev/doc-vault/agenteng-obsidian-wiki` (outside this repo)

---

## Assumptions

- “Clean/product-pure” means a **fresh clone** should not carry 12M+ of cold research/skills.  
- AGENTS never-preload is necessary but not sufficient for Done.  
- `#21` refers to the merged PARETO-CUT on main (`76f9e0bd`).

## Open questions

- Cold archive destination: sibling under `~/dev/doc-vault/` vs git tag-only?  
- Keep `better-ui-skillset` for DESIGN work or Tink-home?  
- Is `working-loop` CORE process skill or optional?

## What could not be checked

- Whether GitHub sparse-checkout / LFS already planned for cold.  
- Full merge of local dirty Chat/UI changes vs main (out of scope).  
- Brain repo dirt (sibling; not product tree).

---

## Headline for Firstmate

- **Path:** `research/pareto/FM-PARETO-02.md`  
- **Top dirty:** in-repo `_cold-archive` (~13M), PARETO skills cold, DOCPRUNE cold, hot AGENTENG annexes, smells primary dump, AGENTS drafts, better-ui skillset, meta skill cluster, praxist remnant, missing pareto map on main  
- **Clean-enough:** **No**

---

*Researchy · FM-PARETO-02 · scout only*
