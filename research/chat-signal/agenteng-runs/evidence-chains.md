# FM-AGENTENG-01 — Evidence-chain reconstructability (depth ≥10)

- **As-of:** 2026-09-15 ~20:45 CT  
- **Job:** FM-AGENTENG-01 · Researchy · research-only · no PR  
- **Spine:** `jon-devlapaz/socratink` PRs #1–#15 + postmortems + factory Scout closes + learnings  
- **Labels:** **verified** = primary source this run · **inference** = joined/derived · **unknown** = not in corpus  
- **Privacy:** no secrets, tokens, learner wording, or raw `.env`  
- **Correction:** PR **#11–#14** are **merged:true** happy follow-ups. Gold chain `#8→#9→#10→#11→#12→#13→#14` (+`#6`). Anti = `#7` + EVT-0001 (not #11–#14).  
- **Schema:** each unit = title · Verified facts · Assumptions · Inferences · Unknowns · lesson for agentic engineering.

## Method

1. Inventory all 15 PRs via GitHub MCP `pull_request_read` (**verified** merged flags).  
2. Factory.db Scout tasks (**verified**).  
3. Brain EVT/SRC/PROC, praxist learning, FM-PRREV, CTXSMELL, packs (**verified**).  
4. Soft session∩PR joins; cloud `bc-*` for Sep 15–16 (**verified** gap on IDE).  
5. Score chain: intent → authority → tools → outcome → remediation. Band **strong / partial / weak**.

**Jondev note:** Mac `machineId 3ac411d5-…` Shell not available this executor. PR facts from GitHub MCP.

---

## Unit pick (≥10)

| # | Unit | Kind | Why |
| --- | --- | --- | --- |
| 1 | EVT-0001 / SRC-0010 / PROC-0002 | postmortem | Anti-happy scope substitution |
| 2 | Praxist 2026-08-30 learning | postmortem | Negative search + stop rules |
| 3 | PR #6 OIDC boot (after #5) | PR | Happy incident hotfix |
| 4 | PR #8→#10 + FM-PRREV | PR+review | Phase plate gold start |
| 5 | PR #13→#14 instanceId fail-closed | PR | Live miss → harden |
| 6 | PR #11→#12 BYOK wire + nano | PR | Merged happy follow-ups after #10 |
| 7 | PR #7 UI motion (anti) + thrash join | PR+session | Anti-happy verify-weak UI |
| 8 | Thrash cluster `b23609bb` / F1 | session | Tool/path thrash exemplar |
| 9 | WM stuffed vs load-on-demand | session | Context-discipline contrast |
| 10 | Codex plate-gap (strata n=80) | strata | Mean plate ~1.13 / verify weak |
| 11 | Nole W0 archive-before-clone | process | Smell→habit disk hygiene |
| 12 | Gold chain #8–#14 as one outer loop | PR meta | Plate→phase→review→fail-closed |

---

## 1. EVT-0001 — validation-driven scope substitution

### Verified facts
- Intent was to trace Socratink in Braintrust / dogfood-vet, not ship a new product surface. **Source:** Brain EVT-0001 / SRC-0010 / PROC-0002 · **as-of:** corpus read 2026-09-15 CT.  
- ~3.5k-line learner-evidence product was built then **reverted**; tracing path kept. **verified.**  
- Remediation encoded as PROC-0002 tripwires + AGENTS §3 “dogfood→proof not scope.” **verified.**

### Assumptions
- Founder “validation” language was misread as license for R1-adjacent product (authority misread).

### Inferences
- Validation / scientific framing is a high-risk opener for scope substitution (CTXSMELL T1 / Loops F4).

### Unknowns
- Exact IDE session join for the build/revert window (pre-pack) — **unknown.**

### Lesson for agentic engineering
Treat dogfood/vet/scientific language as **proof-only authority**. Tripwire: if the plate does not name a contract under test, rewrite before writing product code.

**Reconstructability:** **strong**

---

## 2. Praxist protocol-reliability (2026-08-30)

### Verified facts
- Goal: beat `protocol_reliability_lcb` with zero critical violations. **Source:** praxist dated learning · **as-of:** 2026-08-30 / re-read 2026-09-15 CT.  
- Tools: Codex/Cursor/PATH; 4× gemma generations. Outcome **negative** — `parent_eligible` false; Chat not updated. **verified.**  
- Remediation: dated postmortem + 6 stop rules; AGENTS §7. **verified.**

### Assumptions
- Run ids in frontmatter are enough to re-find the attempt; pack-id join remains weak.

### Inferences
- Negative search with an honest stop is higher-value than a forced “green” narrative (happy-path HP5).

### Unknowns
- Full pack-id ↔ session join for the Praxist window — **partial / weak.**

### Lesson for agentic engineering
Encode **negative results** as dated learnings with stop rules the same day. Stopping is a success mode when the plate’s proof fails.

**Reconstructability:** **strong**

---

## 3. PR #6 — Vercel Chat OIDC boot fix

### Verified facts
- Production 500s after #5: `resolveChatModel` threw at module load before OIDC copy. **Source:** GitHub PR #6 body + `pr-jev-summary.md` · **as-of:** 2026-09-15 ~20:45 CT.  
- Diff +19/−8 (3 files); `pnpm check`; live turn unchecked. **Merged** 2026-08-28 01:11 CT. **verified.**  
- Soft session join `b06e3da7` (Axis-A shipper). **inference.**

### Assumptions
- Northflank vs Vercel boot contracts differ enough that a staging-proved branch can still break Vercel prod.

### Inferences
- Same-day narrow hotfix after a warned landmine is the gold incident shape (HP3) — prefer over thrash-overlapping merges.

### Unknowns
- Whether live Chat turn was ever re-proven post-merge in an IDE pack — **unknown** (body left it unchecked).

### Lesson for agentic engineering
When a merge gate warns a host-specific landmine, either **block merge** or schedule the hotfix plate before merge. Small causal diffs beat volume.

**Reconstructability:** **partial**

---

## 4. PR #8→#9→#10 — phase chain + FM-PRREV

### Verified facts
- Phase 1 session cookie (#8 +613/−98) → Phase 2 credential library (#9 +688/−7) → Phase 3 hotel-safety proof (#10 +302/−2). **Source:** GitHub MCP + FM-PRREV-01 · **as-of:** 2026-09-15 CT.  
- Explicit Not-in-this-PR fences; named tests/check/smoke; cloud `bc-*`. #8/#9 **PASS**; #10 **CONCERN** (instrument path ≠ unit path) recorded then merged. **verified.**  
- 0 IDE pack hits for this window — cloud only. **verified gap.**

### Assumptions
- Cloud agent form is closer to Grok Ship outer-loop than home-live IDE thrash for these PRs.

### Inferences
- CONCERN residual is compatible with happy merge when the phase slice stays honest and follow-ups (#11–#14) close the gap.

### Unknowns
- Full `bcId` ↔ home-live transcript join — **unavailable** from current packs.

### Lesson for agentic engineering
Ship **one phase per PR** with Outcome / Not-in-this-PR / named proof / stop. Independent review on security-adjacent work; record CONCERN without overclaiming.

**Reconstructability:** **partial→strong** (review slice strong)

---

## 5. PR #13→#14 — instanceId + fail-closed

### Verified facts
- #13: live miss — stored OpenAI but latched Gemini because code read `conversationId` not `instanceId` (+67/−4). **Source:** PR #13/#14 + `pr-jev-summary.md` · **as-of:** 2026-09-15 CT.  
- #14: delete sniff fail-open; missing/unparseable instance id errors (+51/−68). Both **merged:true** (happy remediation/governance). **verified.**  
- Proofs: learner-key + check (+ smoke on #13). **verified.**

### Assumptions
- Author’s claim that live BYOK was already verified before #14 harden is honest (not re-checked in packs).

### Inferences
- Live observation → identity fix → fail-closed is the governance end of the gold chain.

### Unknowns
- Cloud/session pack join for #13/#14 — **unknown.**

### Lesson for agentic engineering
Identity and auth paths **fail closed**. Prefer deleting ambiguous sniffs over “helpful” fallbacks that latch the wrong vendor.

**Reconstructability:** **partial**

---

## 6. PR #11→#12 — wire store + gpt-5-nano (**happy follow-ups**)

### Verified facts
- #11 wires Phase 2 store into Chat after #10 isolation proof (+661/−22); #12 switches connected specifier to gpt-5-nano (+21/−8). **Source:** GitHub MCP · `pr-jev-scores.json` · **as-of:** 2026-09-15 ~20:45 CT.  
- Both **merged:true** same day (CT); `primary_failure_cause=none`; happy_path_fit p≈0.77 / 0.75. **verified.**  
- Proofs: learner-key / openai-key / chat-model / check / smoke; live vendor turn left unverified (honest). **verified.**

### Assumptions
- Shared cloud `bc-*` lineage with #10/#11 is the primary session join (IDE packs empty).

### Inferences
- These are **not** phase-skip / anti-happy — isolation already merged; wire and cost tweak are correct follow-ups. Loops v1 §10.3 calling them closed-unmerged is **superseded**.

### Unknowns
- Exact live OpenAI turn after #11 — **unknown** (unchecked by design).

### Lesson for agentic engineering
After a proof-only phase, open a **new plate** for wire/cost — do not widen the proof PR. Honest “live unverified” beats fake checklists.

**Do not score as anti-happy / phase_order failure.**  
**Reconstructability:** **partial**

---

## 7. PR #7 — UI motion (anti-happy) + thrash overlap

### Verified facts
- feat(ui): learner motion, dummy dock, type size — +1506/−88 (17). **Merged.** **Source:** PR #7 + `pr-jev-summary.md` · **as-of:** 2026-09-15 CT.  
- Jev: happy_path_fit p=0.20 · verify_ok p=0.23 · `missing_verify` · would_retry p=0.36. **verified.**  
- Test plan: long unchecked browser checklist; `pnpm check` hoped. Soft join thrash sessions `357a2e9e` (915 tools) / `b23609bb`. **inference** (time/owner overlap).

### Assumptions
- Unchecked UI checklist was treated as sufficient verify culture at merge time.

### Inferences
- Ship volume ≠ loop health (Loops §7). Anti exemplar with #7 + EVT-0001 (not #11–#14).

### Unknowns
- Whether any browser checklist item was actually run outside the PR body — **unknown.**

### Lesson for agentic engineering
Unchecked UI checklists ≠ verify. Require a named contract (or honest “unverified”) before merge language. Ban thrash-overlapping large UI merges without a green gate.

**Reconstructability:** **partial** · Band **weak**

---

## 8. Thrash cluster — `b23609bb` / F1 (T2)

### Verified facts
- Session `b23609bb`: **1770 tools**, 283 paths; 93× Read `chat-surface.ts`, 85× Read `styles.css`. **Source:** FM-AGENTENG-01-loops F1 · smell-catalog-dense · strata-scores · **as-of:** 2026-09-15 CT.  
- Peer cluster: `357a2e9e` (126× Read / 124× StrReplace `styles.css`), `a09316e9`, `3f9a6631`. Strata v1: thrash **41** / slow_thrash **37** (n=59). Strata v2 gaps: thrash **37** (n=58). **verified.**  
- Soft time overlap with ship window `#5`/`#6` and UI `#7`. **inference.**

### Assumptions
- Repeat tool signatures + first-user plate quality are better thrash signals than string “error” counts (jsonl stores inputs not outputs).

### Inferences
- Dominant partnership failure on home-live IDE is **T2 tool/path thrash** on UI owners — commits can still land while loop health is poor.

### Unknowns
- Tool exit codes/stderr; net product value of thrash commits — **could not check.**

### Lesson for agentic engineering
Tripwire: **≥3 identical tool sigs OR ≥5 edit cycles on one file without a green gate → stop and rewrite plate.** Route merge-bound work through Ship/cloud + review, not multi-hour UI thrash.

**Reconstructability:** **strong** (session metrics) · Band **weak** (loop health)

---

## 9. Working memory — stuffed vs load-on-demand

### Verified facts
- 20 exemplars scored: stuffed **8** · mixed **7** · load-on-demand **5**. **Source:** `working-memory-exemplars.md` + `wm-jev-scores.json` · **as-of:** 2026-09-15 ~20:45 CT.  
- Stuffed extremes: `e8a25b04` (stuffed_score 7, context_discipline 0.11, 58 paths / 153 tools); `2fb70153` / `357a2e9e` / `c585e8d6` / `df80810e` (scores 8). **verified.**  
- Load-on-demand contrast: `bfe16717` (0 / disc 2.42 / 10 paths / 17 tools); `809dba66`, `aa4a33cf`, `16a29d67`, `0d22cb46`. **verified.**  
- Smell T6 / Loops F9: skill stuffing at intake (`c585e8d6`, `df80810e`, `2fb70153`). **verified.**

### Assumptions
- Lower stuffed_score + higher context_discipline tracks healthier intake (Jev prior aligned).

### Inferences
- Detaching skills until the plate is set is the corrective habit; corpus dumps (also PR #1 +90k) bury behavior change.

### Unknowns
- Causal link stuffed→thrash vs common cause (weak plate) — **open.**

### Lesson for agentic engineering
**Load-on-demand:** set Outcome / Not-in-this-PR / proof first; attach skills only when the plate names the owner. Ban skill/parent dumps at intake (T6).

**Reconstructability:** **strong** (exemplar table)

---

## 10. Codex plate-gap finding (strata n=80)

### Verified facts
- Pack `codex-strata-pack-v2.json` n=80 scored; n_ok=80. **Mean plate_quality 1.125** on 0–3 scale. **Source:** `codex-strata.md` + `codex-strata-scores.json` · **as-of:** 2026-09-15 ~20:45 CT.  
- Binary (p≥0.5): happy_path_fit yes **37** / no **43**; verify_ok yes **12** / no **68**; thrash yes **1** / no **79**; would_retry yes **69** / no **11**. **verified.**  
- Partnership gaps: none 44 · governance 17 · context_bloat 8 · missing_verify 5 · thrash 4. Velocity band skew careful_good **71**. **verified.**  
- Cursor strata-scores-v2 mean plate **~1.28** (n=58) — same “vague plate” pressure. **verified.**

### Assumptions
- Size-biased top-80-by-bytes selection and ~400-line excerpt truncation under-represent late thrash / late-ship evidence.

### Inferences
- Codex sample is not thrash-dominated like home-live UI sessions; the gap is **missing/vague plates + weak verify**, not tool loops. Resume/Codex handoff without `/goal` rewrite (`b06e3da7`, `316e90d5`) is the briefing smell.

### Unknowns
- Full Codex parity vs Cursor-slug pilot allowlist — **partial** (Loops caveats).

### Lesson for agentic engineering
Every Codex/Cursor resume must **rewrite `/goal` + proof + stop from current repo truth** before tools. Plate mean ~1.1 is a system smell: ban “continue where left off” alone.

**Reconstructability:** **strong** (aggregate) · Band **partial** (per-session join)

---

## 11. Nole W0 — archive-before-clone habit

### Verified facts
- Nole annex (MERGE-FINAL): Week 0 = cold-archive QC/landing clones `socratink-pr{2,3,4}-qc` + `socratink-landing-page` (~**3176 MB**) and transcript `1643d9f1…` (**53.04 MB**) before further bot deletes. **Source:** `FM-AGENTENG-01-nole.md` · **as-of:** 2026-09-15 20:40 CT.  
- Smell→Habit: **G4 → archive-before-clone**; **G3 → TTL / archive dead capture**; orphan skills → load-on-demand / archive (T6). **verified.**  
- Sidebar: socratink **5** · archived **18** (16 lack `/agents/<id>/` ghosts) · pinned **3** (2 dead). Mutation: none this run. **verified.**

### Assumptions
- Unique REPORT lines can be copied into `grok-ship/reports/` before cold archive without losing forensics.

### Inferences
- Disk sprawl without outcomes is an ops failure mode parallel to session thrash — same “stop widening / archive residue” discipline.

### Unknowns
- Whether W0 cold-archive has been executed on box/Mac since the annex — **unknown** (research-only; no deletes this job).

### Lesson for agentic engineering
Habit **archive-before-clone**: never grow another fat QC/landing tree until the prior dump is cold-archived. Pair with named-agents-only (G1) and single-source skills (G2).

**Reconstructability:** **strong** (inventory sizes) · Band **partial** (habit adoption)

---

## 12. Gold chain #8–#14 as one outer-loop unit

### Verified facts
- Merged chain: `#8→#9→#10→#11→#12→#13→#14` (+ hotfix `#6`). All `primary_failure_cause=none` in `pr-jev-scores.json` this run. **Source:** happy-nuggets · pr-jev-summary · GitHub MCP · **as-of:** 2026-09-15 ~20:45 CT.  
- Pattern: plate+fences → library before wire → proof phase → wire → cost → live miss fix → fail-closed. FM-PRREV PASS/PASS/CONCERN on #8–#10. **verified.**  
- Anti contrast: `#7` + EVT-0001 only. `#15` open in-flight (missing_verify live OpenRouter) — not anti. **verified.**

### Assumptions
- Cloud `cursor/*` + `bc-*` footers are the authoritative join for Sep 15–16 phase work (home-live IDE gap).

### Inferences
- Outer-loop one-liner holds: `research→/goal+fences→named contract→cloud slice→test+check+smoke→PRREV→merge→new /goal`.

### Unknowns
- Pilot `pr_urls` empty → soft time joins only for older PRs — **verified process gap.**

### Lesson for agentic engineering
Copy the **gold chain shape**, not any single large diff. Prefer `#6/#13/#14` small causal closes and `#8–#10` phased fences over `#1` corpus swamp / `#5` known-landmine merge / `#7` unchecked UI.

**Reconstructability:** **partial→strong** (PR bodies strong; IDE join weak)

---

## Cross-cut scores

| Unit | Intent | Authority | Tools | Outcome | Remediation | Band |
| --- | --- | --- | --- | --- | --- | --- |
| 1 EVT-0001 | strong | strong | strong | strong | strong | **strong** |
| 2 Praxist | strong | strong | strong | strong | strong | **strong** |
| 3 PR #6 | strong | partial | partial | strong | partial | **partial** |
| 4 #8–#10+PRREV | strong | strong | strong/weak sess | strong+CONCERN | strong | **partial** |
| 5 #13–#14 | strong | partial | partial | strong | strong | **partial** |
| 6 #11–#12 | strong | strong | strong | strong | partial | **partial** |
| 7 PR #7 anti | strong | weak proof | weak | merged | weak | **weak** |
| 8 Thrash b23609bb | strong | weak plate | weak | thrash | tripwire open | **weak** |
| 9 WM stuffed vs LOD | strong | mixed | mixed | contrast clear | habit open | **partial** |
| 10 Codex plate-gap | strong | weak mean plate | partial | verify thin | rewrite habit | **partial** |
| 11 Nole W0 archive | strong | strong inventory | n/a | plan only | habit pending | **partial** |
| 12 Gold #8–#14 | strong | strong | strong cloud | strong | strong | **partial→strong** |

### Systemic gaps

1. Cloud Cursor PRs (#8–#15) ≈ no IDE pack join → need `bcId`/`pr_urls` ingestion.  
2. Pilot `pr_urls` empty → soft time joins only.  
3. Learnings folder thin vs EVT importance (1 praxist postmortem on disk).  
4. Loops v1 §10.3 wrongly called #11–#14 closed-unmerged — **superseded** by GitHub `merged:true` + this correction.  
5. Codex/Cursor mean plate ~1.1–1.3 → plate rewrite habit not yet universal.

## Sources

| Source | Label |
| --- | --- |
| GitHub MCP get PR #1–#15 | verified |
| factory.db grok-ship scout tasks | verified |
| Brain EVT/SRC/PROC; praxist learning | verified |
| FM-PRREV-01, CTXSMELL, packs, cloud-agent-transcripts (18 bc) | verified |
| pr-jev-scores.json (15/15) · pr-jev-summary.md | verified this run |
| working-memory-exemplars.md · wm-jev-scores.json | verified |
| strata-scores.json / strata-scores-v2.json | verified |
| codex-strata.md · codex-strata-scores.json (n=80) | verified |
| FM-AGENTENG-01-nole.md (W0–W3) · loops · happy-paths · happy-nuggets · smell-catalog-dense | verified |
