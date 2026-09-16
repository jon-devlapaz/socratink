# Happy nuggets — densest catalog (FM-AGENTENG-01)

- **As-of:** 2026-09-15 ~21:35 CT
- **Canonical IDs:** Loops **v2.1 EXTRACT** **N*** (36 rows, IDs through N071) from `FM-AGENTENG-01-extract.md` / loops §13
- **Densest merge policy:** Loops N* is primary. Researchy H* densify kept in full as appendix (not thinned). Net-new H* vs N* also listed.
- **Gold:** `#8→#9→#10→#11→#12→#13→#14` (+`#6`). **Anti:** `#7`, EVT-0001. `#11–#14` merged happy.
- **Backups:** `happy-nuggets.md.bak-researchy-20260915-2132`
- **Companions:** `FM-AGENTENG-01-extract.md` · `smell-catalog-dense.md` · `happy-smell-pairs.md`

## Plate fields (≤5 lines) — copy
```
Outcome: <one observable sentence>
Not in this PR: <fences>
Proof: <named pnpm test:… && check && smoke>
Stop: green proof → merge; else restate plate
Owner: <one area / one phase name>
```

## 13. Atomic happy-path nuggets (EXTRACT)

Format: **N###** · stage · claim · evidence · pairs-with smell. Labels: **V**=verified · **I**=inference.

### Research

| ID | Nugget | Evidence | ↔ Smell |
| --- | --- | --- | --- |
| N001 | Scout is report-only; no PR in the same breath | Factory Scout / loops W2–W3 · **V** | S001 |
| N002 | Skill Scout: contract → ≤3 finalists → dual checkpoint → VERIFY does not widen | `scouting-workflow.md` · **V** | S002 |
| N003 | Negative research ships as dated learning, not code | Praxist postmortem · happy-paths · **V** | S003 |
| N004 | Research word ≠ build authority (“trace/vet/dogfood”) | Product AGENTS / EVT-0001 encoding · **V** | S001 |

### Plan

| ID | Nugget | Evidence | ↔ Smell |
| --- | --- | --- | --- |
| N010 | One observable Outcome sentence before tools | `#8–#11` PR bodies · **V** | S010 |
| N011 | Named `Not in this PR` / Out of scope list | `#8–#11`, `#15` · **V** | S011 |
| N012 | Phase title encodes the slice (“Phase 1… not BYOK”) | `#8–#15` titles · **V** | S012 |
| N013 | Resume/handoff **rewrites** plate from current repo truth | Outer-loop / loops F8 remedy · **V** doctrine | S013 |
| N014 | Explicit Plate mid-UI (cwd/stack/goal/stop) | `f5892573` · **V** | S010 |
| N015 | Goal Prompt named at intake | `1def40b7` · **V** | S010 |

### Spec

| ID | Nugget | Evidence | ↔ Smell |
| --- | --- | --- | --- |
| N020 | Name the contract file before/with impl (`test:learner-key`, `test:credentials`, `test:openrouter`) | `#9–#11`, `#14–#15` · **V** | S020 |
| N021 | Spec proves an invariant, not a UI wish | `#10` hotel-safety Outcome · **V** | S021 |
| N022 | Unverified live paths listed explicitly | `#6`, `#10`, `#14`, `#15` Unverified sections · **V** | S022 |
| N023 | Library-first before Chat wire (`#9` store before `#11` resolve) | Phase chain · **V** | S012 |

### Impl

| ID | Nugget | Evidence | ↔ Smell |
| --- | --- | --- | --- |
| N030 | Smallest owner / tiny causal fix | `#6` 3 files; `#13` 2 files; `#14` 2 files · **V** | S030 |
| N031 | Cloud agent on `cursor/<phase>-…` with Outcome/Proof body | `#8–#15` fingerprints · **V** | S031 |
| N032 | Follow-up PR for residual, not widen proof PR | `#11` after `#10`; `#13→#14` · **V** | S011 |
| N033 | Fail-closed identity (no `instanceId ?? conversationId` sniff) | `#14` · **V** | S033 |
| N034 | Co-author captain; merge authority stays human | Commit trailers + merge_by jon · **V** | S034 |
| N035 | Incident → same-day narrow hotfix | `#5` risk → `#6` OIDC · **V** | S035 |

### Verify

| ID | Nugget | Evidence | ↔ Smell |
| --- | --- | --- | --- |
| N040 | Proof lists commands that were run | `#8–#11`, `#14–#15` Proof sections · **V** | S040 |
| N041 | Intentional verify probe PR | `#3` auto-deploy probe · **V** | S040 |
| N042 | Add slice test into `pnpm check` when proving a contract | `#10` learner-key in check · **V** | S042 |
| N043 | `tsc` / targeted gate in-loop beats hope | `430c4785` · **I**/pilot | S030 |
| N044 | Record CONCERN instead of claiming closed security | FM-PRREV `#10` · **V** | S044 |

### Review

| ID | Nugget | Evidence | ↔ Smell |
| --- | --- | --- | --- |
| N050 | Fresh adversarial-review / FM-PRREV before treating auth PR as closed | FM-PRREV-01 · Grok Ship · **V** | S050 |
| N051 | Severity gate: error blocks PR; ask-user → Firstmate | `adversarial-review` skill · **V** | S050 |
| N052 | CONCERN is a feature of the happy path when residual is tracked | `#10` merged with CONCERN noted · **V** | S044 |
| N053 | Review-only: no “fix while reviewing” | FM-PRREV mode · **V** | S053 |

### Ship

| ID | Nugget | Evidence | ↔ Smell |
| --- | --- | --- | --- |
| N060 | PR body = Outcome / What changed / Proof / Not-in-this-PR | `#8–#11`, `#15` · **V** | S040 |
| N061 | Captain merges; task.result = PR URL | CREWMATE / outer-loop · **V** | S061 |
| N062 | Next phase = new `/goal`, never silent widen | Phase chain `#8→#15` · **V** | S011 |
| N063 | Prefer Ship/cloud for merge-bound; IDE for plate-bound hotfix | `#8–#14` vs thrash IDE · **I** | S031 |
| N064 | Park/cancel beats “one more polish” | Stop-on-proof doctrine · **V** | S064 |

### Observability / join

| ID | Nugget | Evidence | ↔ Smell |
| --- | --- | --- | --- |
| N070 | Join cloud work via `bcId` / PR body, not forced IDE session IDs | Happy-paths verified gap `#8–#15` · **V** | S070 |
| N071 | Soft session↔PR only when commit lines name merge | `b06e3da7`↔`#5/#6` · **V** | S070 |

---

## Net-new H* vs Loops N* (overlap-filtered)

**76** patterns from Researchy H n=78 not near-duplicate of an N* claim.

| ID | Category | Pattern | Evidence |
| --- | --- | --- | --- |
| H01 | research | Factory Scout: research-only report under reports/<id>.md; no PR, no push, no Brain mutation. | factory scout FM-CTXSMELL-01, FM-CHATSIG-01, FM-PRREV-01, FM-TYPESAFE-01 (status=done) |
| H03 | research | Negative-result Scout: stop when plate proof fails; write dated .agents/learnings/ same day with stop rules. | Praxist 2026-08-30 learning; evidence-chains unit 2; HP5 |
| H04 | research | Dogfood/vet/trace/scientific language → strengthen proof only; never authorize adjacent product build. | EVT-0001 / SRC-0010 / PROC-0002; product AGENTS §3; socratink-30-60-90 V local |
| H05 | research | Primary-source web verify (HTTP 200) for framework URLs; label Verified/Assumption/Unknown; ban fabricated citations. | external-frameworks.md; socratink-30-60-90-primary.md method |
| H06 | research | Parallelize only breadth-first Scout; coding Ships stay single-agent + reviewer subagent. | socratink-30-60-90 days 76–90; Anthropic multi-agent (external V3) |
| H07 | research | Keep chat-signal / eval / postmortem research behind load-on-demand pointers; do not paste into every session. | workspace AGENTS; working-memory exemplars load-on-demand; Nole T6 habit |
| H08 | planning | One-sentence observable Outcome + explicit Out-of-scope / Not-in-this-PR fences before any tools. | PR #8/#9/#10/#11 bodies; happy-paths HP1–HP2; loops §4 briefing |
| H09 | planning | Phased authority slices: session cookie → credential library → isolation proof → wire → cost → identity → fail-closed. | Gold chain #8→#9→#10→#11→#12→#13→#14; loops-v2 gold_chain |
| H10 | planning | Ship brief must carry /goal + repo + cwd + proof + stop + fences; Firstmate refuses boot if missing. | loops §4/#6 template; FM-AGENTENG-01.md P0; 30-60-90 Week 1 |
| H11 | planning | Resume Codex/Cursor: rewrite /goal + proof + stop from current repo truth; ban “continue where left off” alone. | loops F8; evidence-chains unit 10; sessions b06e3da7, 316e90d5 |
| H12 | planning | Paste the same plate at the top of every continuation message in long threads. | CTXSMELL captain playbook; loops §4; 30-60-90 Week 1 |
| H13 | planning | Two-track factory: (A) partnership harness improvements vs (B) pedagogical product code — never one plate. | socratink-30-60-90 days 46–60; anti-EVT-0001 structure |
| H14 | planning | Name phase + owner area in the plate (e.g. Phase 2 credential library; Chat stays jon-local). | PR #9 body; pr-jev-summary #9; happy-paths RIGHT impl |
| H15 | spec/plate | Plate ≤5 lines: Outcome / Not-in-this-PR / Proof / Stop / Owner. | happy-nuggets.md plate fields; loops §4 |
| H16 | spec/plate | Explicit mid-UI Plate even for visual work: “Plate: only implement a local aperture…” | session f5892573; loops W4; CTXSMELL notes plate helped vs peers |
| H17 | spec/plate | Destructive restart with fence: clear “do not salvage” + single surface named. | session fae4006d; loops W5 |
| H18 | spec/plate | Handoff plate with Outcome + leave-untouched list (Flue/Brain/wiki) before deletes. | session f500f5ea gold_intake_candidate; loops-v2 |
| H19 | spec/plate | Goal Prompt with Context and Authority + Stop when proven (closest /goal in corpus). | session 1def40b7; loops-v2 gold_intake; strata-v3 happy_path_fit p≈0.81 careful_good |
| H20 | spec/plate | Name the contract file in the plate (e.g. scripts/learner-key.test.mjs) before impl. | loops §10.5; PR #10 test:learner-key; happy-paths RIGHT verify |
| H21 | spec/plate | Jurisdiction fence in plate: Brain ≠ code ≠ harness; no Brain mutation without contract ticket. | 30-60-90 Week 2; external-frameworks local anchors; FM-AGENTENG inventory |
| H22 | spec/plate | Subagent packet schema: outcome, cwd, proof, stop, boundaries, output format — refuse sprawl boot if missing. | loops P1; sessions e8a25b04/64cfb0da anti; 30-60-90 V3 |
| H23 | impl | Library-first before Chat wire: ship encrypted store with Chat still jon-local. | PR #9; FM-PRREV PASS; pr-jev happy_path_fit p=0.81 |
| H24 | impl | After isolation proof, open a NEW plate for wire — do not widen the proof PR. | PR #11 after #10; evidence-chains unit 6; loops correction |
| H25 | impl | Smallest-owner identity fix: prefer instanceId over conversationId sniff (+67/−4). | PR #13; pr-jev-summary; happy-paths RIGHT impl |
| H26 | impl | Tiny cost/specifier tweak as its own PR after wire (+21/−8 gpt-5-nano). | PR #12 merged; pr-jev happy_path_fit p=0.75 |
| H27 | impl | Narrow hosting fallback: skip loopback on Vercel; forward OIDC; leave local jon-local unchanged. | PR #2; loops-v2 pr_lifecycle happy; pr-jev |
| H28 | impl | Observability slice: stamp questionnaire metadata on spans; extend live smoke to two-turn questionnaire. | PR #4; pr-jev stage_success p=0.88 verify_ok p=0.84; session soft-join 45147840 |
| H29 | impl | Cloud agent on cursor/<phase>-… branch; one owner area; push branch only — outer loop opens PR after review. | PR #8–#15 fingerprints; loops §6 Ship skeleton; CREWMATE |
| H30 | impl | Prefer small causal diffs (#6/#13/#14 shape) over giant catch-up corpora (#1 anti). | happy-paths recommendations; evidence-chains unit 12 |
| H31 | impl | Load-on-demand skills: attach only when plate names the owner; ban skill dumps at intake. | WM exemplars bfe16717/809dba66/aa4a33cf/16a29d67/0d22cb46 vs stuffed c585e8d6; T6 |
| H32 | impl | Install worktree before first commit: pnpm install --frozen-lockfile; do not re-commit-fail. | loops §5 stop patterns; TUI postmortem; loops P1 |
| H33 | verify | Named proofs in PR body: pnpm test:<slice> && pnpm check && pnpm smoke (or narrowed contract). | PR #8–#11,#13–#14; loops §10.1; happy-nuggets stop rules |
| H34 | verify | Intentional verify/ship probe as its own tiny PR (1-line HTML auto-deploy probe). | PR #3; pr-jev happy_path_fit p=0.70; loops-v2 happy |
| H35 | verify | Hotel-safety / isolation proof phase: outcome = overlapping streams cannot mix keys; not paste UI. | PR #10; test:learner-key; FM-PRREV CONCERN recorded |
| H36 | verify | Honest “live unverified” checkbox beats fake green UI checklist. | PR #11/#12/#13 bodies; evidence-chains unit 6 lesson; #7 anti contrast |
| H37 | verify | Thrash tripwire: ≥3 identical tool sigs OR ≥5 edit cycles on one file without green gate → stop, rewrite plate. | loops §5; CTXSMELL; happy-nuggets stop rules; b23609bb anti exemplar |
| H38 | verify | Repeated targeted gate in-loop (e.g. tsc) rather than end-only hope. | session 430c4785 loops W1 contrast vs F2; Axis A shipper |
| H39 | verify | Fail closed when identity/proof thin: delete sniff fallback; error on missing/unparseable instance id. | PR #14; HP6; AGENTS hosted secrets posture |
| H40 | verify | Jev/TypeSafe as judgment lane for smell/plate/ship-worthiness — code owns control flow; confidence-gate uncertain. | FM-TYPESAFE-01 scout; strata-scores-v3; pr-jev; 30-60-90 days 31–45 |
| H41 | review | Independent FM-PRREV / adversarial-review Scout on security-adjacent PRs before treating proof as closed. | FM-PRREV-01 on #8–#10; loops W2; happy-paths HP4 |
| H42 | review | Record residual risk note when merging with CONCERN; do not market unit wrap as live Chat closed proof. | PR #10 FM-PRREV CONCERN; FM-AGENTENG-01.md P0 residual; happy-paths review RIGHT |
| H43 | review | Fresh adversarial-review subagent: branch vs base; no tests during review; error blocks PR; ask-user → Firstmate. | GROK_SHIP / adversarial-review skill; loops §6.C; CREWMATE |
| H44 | review | Evidence-chain reconstructability: intent → authority → tools → outcome → remediation (label verified/inference/unknown). | evidence-chains.md method; external-frameworks F1 Audit Evidence Chain |
| H45 | review | Anti-LOC partnership score: measure stories accepted / escaped defects / cost-per-feature — not tool counts or LOC. | external-frameworks F4/F6; Microsoft Agentic-Agile; METR SWE-bench merge note |
| H46 | review | Correct #11–#14 status: merged:true happy follow-ups — never frame as closed-fail / phase-skip. | happy-paths Correction; loops §10.3 correction; GitHub MCP merged flags; pr-jev |
| H48 | ship | Same-day narrow hotfix after warned host landmine (#5→#6 OIDC boot +19/−8). | PR #6; session soft-join b06e3da7; HP3; loops-v2 happy |
| H49 | ship | Route merge-bound Socratink work through Grok Ship scout→ship→adversarial→captain merge; IDE thrash is non-merge path. | FM-AGENTENG-01.md P0 #3; loops §7/#8; CREWMATE |
| H50 | ship | Outer-loop one-liner: research→/goal+fences→named contract→cloud slice→test+check+smoke→PRREV→merge→new /goal. | happy-nuggets.md; evidence-chains unit 12; loops §10.5 |
| H51 | ship | Cloud-agent fingerprint join: cursor/* branch + CURSOR_AGENT_PR_BODY + bc-* footer — do not invent IDE session IDs. | happy-paths verified gap; cloud-bc-pr-scan.json; evidence-chains unit 4 |
| H52 | ship | Populate pr_urls / bcId into session packs so chat-signal can join cloud work. | happy-paths recommendations #3; evidence-chains systemic gap 1 |
| H53 | ship | Split skill-corpus PRs from product behavior PRs (#1 lesson). | PR #1 +90k skill corpus; happy-paths AH5; recommendations #4 |
| H54 | ship | Open Phase 4 (#15) only with plate+proof; do not widen mid-flight; accept #10 residual risks explicitly. | PR #15 open; happy-paths OPEN; pr-jev missing_verify; FM-AGENTENG P0 |
| H55 | ship | factory.db task.result = PR URL / report path; status→done only after captain/Firstmate ack. | inventory factory.db scouts done; FM-AGENTENG-01 underway leave-done note |
| H56 | handoff | Handoffs = artifact path + short refs (session_id, PR #) — never dump parent transcript. | 30-60-90 Week 3; Anthropic multi-agent V3; loops T9 |
| H57 | handoff | Researchy EXTRACT → mirror reports to /home/box/agent-data/grok-ship/reports/ without SendToUser. | FM-AGENTENG-01 job contract; loops artifacts section; this job FM-AGENTENG-01 |
| H58 | handoff | Packet-only brief for side-chat workers; refuse sprawl boot.py without outcome/cwd/proof/stop. | loops P1; sessions e8a25b04, 64cfb0da; Nole G1 named-agents-only |
| H59 | handoff | Single-source skills: pack canonical; workflows = checkout of pack (fix G2 dual-source drift). | Nole MERGE-FINAL twin diffs adversarial-review/ahoy/lavish/project-management |
| H60 | handoff | Archive-before-clone (Nole W0): cold-archive QC/landing dumps before growing another fat tree. | Nole MERGE-FINAL W0; evidence-chains unit 11; ~3176 MB QC/landing |
| H61 | handoff | Named-agents-only roster: cut unnamed New Bot/New Agent stubs; pin only live profile dirs. | Nole MERGE-FINAL G1; sidebar socratink 5 / archived 18 |
| H62 | recovery | After costly fail: dated .agents/learnings/ note — Requested / Substituted / Evidence / Stop rule / Regression — before retry. | AGENTS §7; EVT→PROC; Praxist; 30-60-90 Week 4 |
| H63 | recovery | Stall→replan: same fail ≥2× ⇒ rewrite plate (Progress Ledger / Magentic-One pattern); never identical tool retry. | external Magentic-One V5; 30-60-90 stop rules; loops §5 identical sig ≥3 |
| H64 | recovery | Live observation → identity fix → fail-closed harden as sequential recovery PRs (#13→#14). | evidence-chains unit 5; PR #13/#14 merged; HP6 |
| H65 | recovery | When merge gate warns host-specific landmine: block merge OR schedule hotfix plate before merge. | PR #5 DATABASE_URL landmine → #6; evidence-chains unit 3 lesson |
| H66 | recovery | Session decision table: continue / rewind / compact / clear / subagent / stall→replan based on plate load-bearing status. | 30-60-90 Week 4; Claude Code V4; external frameworks companion |
| H67 | recovery | Codify EVT tripwires already in AGENTS; add learnings when campaigns fail — folder still thin, grow it. | happy-paths recommendation #5; evidence-chains systemic gap 3 |
| H68 | recovery | Velocity∩quality bands careful_good/fast_good with gap=none are preferred recovery targets for replay — not slow_thrash Axis-A heroes. | strata-scores-v3 velocity_quality_band_counts; sessions 1def40b7/f43dd58a; strata-v3.md |
| H69 | research | Factory Scout kinds only (scout=8 done/underway); research tickets write under research/ before any Ship auth. | inventory.json 5_factory_db; FM-EVALS/PRREV/BOTFIND/TYPESAFE/CHATSIG/CTXSMELL/AGENTENG |
| H70 | spec/plate | Done-when a stranger could check: falsifiable commands + observable check in /goal. | loops §3 pstack-quality; outer-loop skill; Ship prompt skeleton |
| H71 | impl | Fail-closed missing key when wiring stored OpenAI into Chat; smallest paste UI only. | PR #11 body; pr-jev-summary #11 |
| H72 | verify | Unchecked UI checklist ≠ verify; require named contract or honest “unverified” before merge language. | happy-nuggets stop rules; #7 anti; CTXSMELL missing_verification 14/50 |
| H73 | review | Grok Ship doctrine: never merge without captain; ask-user severity escalates to Firstmate. | GROK_BOT_CREWMATE; loops W2; adversarial-review skill |
| H74 | ship | Copy gold chain shape not any single large diff: #8–#10 phased fences + #6/#13/#14 small closes. | evidence-chains unit 12 lesson; happy-nuggets PR gold chain |
| H75 | handoff | Lay off lifestyle skill packs (site-playbooks-*) on Socratink crew; keep role-owned skills wired. | Nole orphan/unused; site-playbooks ×12 ~236 KB; T6 habit |
| H76 | recovery | After ≥2 failed corrections: /clear + rewrite plate (do not keep correcting polluted approach). | 30-60-90 anti-patterns; Claude Code V2; Magentic-One |
| H77 | planning | Ban multi-issue openers (“validate these two…”) — force one outcome sentence. | session c2a77998; loops F5; happy-paths WRONG planning |
| H78 | impl | stratum careful_good + happy_path_fit≥0.7 sessions (e.g. 1def40b7, f43dd58a, 16a29d67) as impl replay exemplars. | strata-scores-v3.json results; prefer careful_good/fast_good |

## Net-new from Jev packs (Codex n=80 · Cursor v3 · PR Jev)

- Codex strata n=80/80, mean plate_quality≈1.12; gaps {'thrash': 4, 'none': 44, 'missing_verify': 5, 'context_bloat': 8, 'governance': 17, 'over_trust': 1, 'handoff_rot': 1}.
- Cursor parents v3 n=132/132, mean plate≈1.1175757575757579; gaps {'thrash': 42, 'over_trust': 6, 'handoff_rot': 8, 'governance': 8, 'missing_verify': 9, 'scope_sub': 8, 'none': 45, 'context_bloat': 1, 'weak_plate': 5}.
- PR Jev n=15/15; gold #8–#14 primary_failure=none; #11–#14 merged happy; prefer over Loops v1 §10.3 mislabel.


---

## Appendix — Researchy dense H* catalog (full, not thinned)

Preserved densest Researchy EXTRACT prose (n=78). Canonical stop/pair IDs for master freeze remain **N***/**S***.

# Happy nuggets — exhaustive atomic catalog (FM-AGENTENG-01)

- **As-of:** 2026-09-15 ~21:00 CT
- **Job:** Researchy EXTRACT · research-only · no PR · no SendToUser
- **Gold chain:** `#8→#9→#10→#11→#12→#13→#14` (+`#6`). **Anti (NOT happy):** `#7`, EVT-0001.
- **Correction:** `#11–#14` = merged happy follow-ups.
- **Nugget count:** 78
- **By category:** {'research': 8, 'planning': 8, 'spec/plate': 9, 'impl': 12, 'verify': 9, 'review': 7, 'ship': 10, 'handoff': 7, 'recovery': 8}
- **Companion JSON:** `happy-nuggets.json`
- **Sources mined:** FM-AGENTENG-01-happy-paths.md, FM-AGENTENG-01-loops.md, loops-v2-session-mine.json, pr-jev-summary.md, evidence-chains.md, working-memory-exemplars.md, strata-scores-v3.json, codex-strata-scores.json, Nole MERGE-FINAL, socratink-30-60-90-primary.md, external-frameworks.md, prior happy-nuggets.md

## Plate fields (≤5 lines) — copy
```
Outcome: <one observable sentence>
Not in this PR: <fences>
Proof: <named pnpm test:… && check && smoke>
Stop: green proof → merge; else restate plate
Owner: <one area / one phase name>
```

## Outer-loop one-liner
`research→/goal+fences→named contract→cloud slice→test+check+smoke→PRREV→merge→new /goal`

## research (8)

### H01 — Factory Scout: research-only report under reports/<id>.md; no PR, no push, no Brain mutation.
- **category:** `research`
- **lifecycle_stage:** `research`
- **pattern:** Factory Scout: research-only report under reports/<id>.md; no PR, no push, no Brain mutation.
- **evidence:** factory scout FM-CTXSMELL-01, FM-CHATSIG-01, FM-PRREV-01, FM-TYPESAFE-01 (status=done)
- **plate fragment / quote:** “Scout: cloud agent, report only, no PR”
- **why happy:** Keeps discovery isolated from ship authority and prevents validation→product substitution.

### H02 — Skill Scout gated DISCOVER: contract → inventory → ≤3 finalists → checkpoint questions → opt-in web; VERIFY does not widen.
- **category:** `research`
- **lifecycle_stage:** `research`
- **pattern:** Skill Scout gated DISCOVER: contract → inventory → ≤3 finalists → checkpoint questions → opt-in web; VERIFY does not widen.
- **evidence:** FM-AGENTENG-01-loops.md W6; scouting-workflow.md
- **plate fragment / quote:** “VERIFY does not widen”
- **why happy:** Research loop refuses thrash expansion while still producing a bounded shortlist.

### H03 — Negative-result Scout: stop when plate proof fails; write dated .agents/learnings/ same day with stop rules.
- **category:** `research`
- **lifecycle_stage:** `research`
- **pattern:** Negative-result Scout: stop when plate proof fails; write dated .agents/learnings/ same day with stop rules.
- **evidence:** Praxist 2026-08-30 learning; evidence-chains unit 2; HP5
- **plate fragment / quote:** “parent_eligible false; Chat not updated”
- **why happy:** Honest stop on failed search is higher value than forced green narrative.

### H04 — Dogfood/vet/trace/scientific language → strengthen proof only; never authorize adjacent product build.
- **category:** `research`
- **lifecycle_stage:** `research`
- **pattern:** Dogfood/vet/trace/scientific language → strengthen proof only; never authorize adjacent product build.
- **evidence:** EVT-0001 / SRC-0010 / PROC-0002; product AGENTS §3; socratink-30-60-90 V local
- **plate fragment / quote:** “dogfood→proof not scope”
- **why happy:** Turns the highest-cost anti-pattern into a reusable intake tripwire.

### H05 — Primary-source web verify (HTTP 200) for framework URLs; label Verified/Assumption/Unknown; ban fabricated citations.
- **category:** `research`
- **lifecycle_stage:** `research`
- **pattern:** Primary-source web verify (HTTP 200) for framework URLs; label Verified/Assumption/Unknown; ban fabricated citations.
- **evidence:** external-frameworks.md; socratink-30-60-90-primary.md method
- **plate fragment / quote:** “Every URL HTTP-200 verified via WebFetch/curl”
- **why happy:** Steelman research stays reconstructable and citation-safe.

### H06 — Parallelize only breadth-first Scout; coding Ships stay single-agent + reviewer subagent.
- **category:** `research`
- **lifecycle_stage:** `research`
- **pattern:** Parallelize only breadth-first Scout; coding Ships stay single-agent + reviewer subagent.
- **evidence:** socratink-30-60-90 days 76–90; Anthropic multi-agent (external V3)
- **plate fragment / quote:** “coding is less parallelizable than research”
- **why happy:** Matches observed partnership efficiency: research fans out; impl stays serial+review.

### H07 — Keep chat-signal / eval / postmortem research behind load-on-demand pointers; do not paste into every session.
- **category:** `research`
- **lifecycle_stage:** `research`
- **pattern:** Keep chat-signal / eval / postmortem research behind load-on-demand pointers; do not paste into every session.
- **evidence:** workspace AGENTS; working-memory exemplars load-on-demand; Nole T6 habit
- **plate fragment / quote:** “Load-on-demand AGENTS policy”
- **why happy:** Preserves attention budget so research packs do not become intake bloat.

### H69 — Factory Scout kinds only (scout=8 done/underway); research tickets write under research/ before any Ship auth.
- **category:** `research`
- **lifecycle_stage:** `research`
- **pattern:** Factory Scout kinds only (scout=8 done/underway); research tickets write under research/ before any Ship auth.
- **evidence:** inventory.json 5_factory_db; FM-EVALS/PRREV/BOTFIND/TYPESAFE/CHATSIG/CTXSMELL/AGENTENG
- **plate fragment / quote:** “kinds: scout 8; statuses done 7 underway 1”
- **why happy:** Factory posture already separates Scout completion from Ship authority.

## planning (8)

### H08 — One-sentence observable Outcome + explicit Out-of-scope / Not-in-this-PR fences before any tools.
- **category:** `planning`
- **lifecycle_stage:** `planning`
- **pattern:** One-sentence observable Outcome + explicit Out-of-scope / Not-in-this-PR fences before any tools.
- **evidence:** PR #8/#9/#10/#11 bodies; happy-paths HP1–HP2; loops §4 briefing
- **plate fragment / quote:** “Phase 1 session only — not BYOK/store/OAuth”
- **why happy:** Phase chain stayed honest because each PR restated what it would not do.

### H09 — Phased authority slices: session cookie → credential library → isolation proof → wire → cost → identity → fail-closed.
- **category:** `planning`
- **lifecycle_stage:** `planning`
- **pattern:** Phased authority slices: session cookie → credential library → isolation proof → wire → cost → identity → fail-closed.
- **evidence:** Gold chain #8→#9→#10→#11→#12→#13→#14; loops-v2 gold_chain
- **plate fragment / quote:** “one security/invariant slice per PR”
- **why happy:** Thin phases shipped mergeable increments without mid-flight widening.

### H10 — Ship brief must carry /goal + repo + cwd + proof + stop + fences; Firstmate refuses boot if missing.
- **category:** `planning`
- **lifecycle_stage:** `planning`
- **pattern:** Ship brief must carry /goal + repo + cwd + proof + stop + fences; Firstmate refuses boot if missing.
- **evidence:** loops §4/#6 template; FM-AGENTENG-01.md P0; 30-60-90 Week 1
- **plate fragment / quote:** “/goal <one observable…> proof: <pnpm test:…> stop: when proof green”
- **why happy:** Written loop already closer to pstack than practiced IDE openers; enforcing closes the gap.

### H11 — Resume Codex/Cursor: rewrite /goal + proof + stop from current repo truth; ban “continue where left off” alone.
- **category:** `planning`
- **lifecycle_stage:** `planning`
- **pattern:** Resume Codex/Cursor: rewrite /goal + proof + stop from current repo truth; ban “continue where left off” alone.
- **evidence:** loops F8; evidence-chains unit 10; sessions b06e3da7, 316e90d5
- **plate fragment / quote:** “rewrite plate from current truth”
- **why happy:** Prevents dead-plate continuation while still allowing useful ship outcomes.

### H12 — Paste the same plate at the top of every continuation message in long threads.
- **category:** `planning`
- **lifecycle_stage:** `planning`
- **pattern:** Paste the same plate at the top of every continuation message in long threads.
- **evidence:** CTXSMELL captain playbook; loops §4; 30-60-90 Week 1
- **plate fragment / quote:** “anti plate-drift / lost_goal”
- **why happy:** Counters T3 lost-goal drift observed when trust/away prompts replace restated outcomes.

### H13 — Two-track factory: (A) partnership harness improvements vs (B) pedagogical product code — never one plate.
- **category:** `planning`
- **lifecycle_stage:** `planning`
- **pattern:** Two-track factory: (A) partnership harness improvements vs (B) pedagogical product code — never one plate.
- **evidence:** socratink-30-60-90 days 46–60; anti-EVT-0001 structure
- **plate fragment / quote:** “never mix in one plate”
- **why happy:** Structurally blocks validation language from licensing adjacent product scope.

### H14 — Name phase + owner area in the plate (e.g. Phase 2 credential library; Chat stays jon-local).
- **category:** `planning`
- **lifecycle_stage:** `planning`
- **pattern:** Name phase + owner area in the plate (e.g. Phase 2 credential library; Chat stays jon-local).
- **evidence:** PR #9 body; pr-jev-summary #9; happy-paths RIGHT impl
- **plate fragment / quote:** “Library-first encrypted credential store; Chat stays jon-local”
- **why happy:** Owner naming kept Chat surface out of the library PR and deferred wire honestly.

### H77 — Ban multi-issue openers (“validate these two…”) — force one outcome sentence.
- **category:** `planning`
- **lifecycle_stage:** `planning`
- **pattern:** Ban multi-issue openers (“validate these two…”) — force one outcome sentence.
- **evidence:** session c2a77998; loops F5; happy-paths WRONG planning
- **plate fragment / quote:** “validate these two issues and fix — no one-sentence outcome”
- **why happy:** Single-outcome plates prevent T3 lost_goal / wrong_scope at intake.

## spec/plate (9)

### H15 — Plate ≤5 lines: Outcome / Not-in-this-PR / Proof / Stop / Owner.
- **category:** `spec/plate`
- **lifecycle_stage:** `spec/plate`
- **pattern:** Plate ≤5 lines: Outcome / Not-in-this-PR / Proof / Stop / Owner.
- **evidence:** happy-nuggets.md plate fields; loops §4
- **plate fragment / quote:** “Stop: green proof → merge; else restate plate”
- **why happy:** Copy-pasteable contract a stranger can falsify without reading the thread.

### H16 — Explicit mid-UI Plate even for visual work: “Plate: only implement a local aperture…”
- **category:** `spec/plate`
- **lifecycle_stage:** `spec/plate`
- **pattern:** Explicit mid-UI Plate even for visual work: “Plate: only implement a local aperture…”
- **evidence:** session f5892573; loops W4; CTXSMELL notes plate helped vs peers
- **plate fragment / quote:** “Plate: only implement a local aperture…”
- **why happy:** Plate language measurably helped vs peer UI sessions that lacked fences.

### H17 — Destructive restart with fence: clear “do not salvage” + single surface named.
- **category:** `spec/plate`
- **lifecycle_stage:** `spec/plate`
- **pattern:** Destructive restart with fence: clear “do not salvage” + single surface named.
- **evidence:** session fae4006d; loops W5
- **plate fragment / quote:** “Do not salvage it. Throw away #starter-template…”
- **why happy:** Clear destructive fence prevents salvage thrash when restarting a failed UI surface.

### H18 — Handoff plate with Outcome + leave-untouched list (Flue/Brain/wiki) before deletes.
- **category:** `spec/plate`
- **lifecycle_stage:** `spec/plate`
- **pattern:** Handoff plate with Outcome + leave-untouched list (Flue/Brain/wiki) before deletes.
- **evidence:** session f500f5ea gold_intake_candidate; loops-v2
- **plate fragment / quote:** “Outcome: Remove dual-harness Mastra… Leave Flue/Brain/wiki untouched”
- **why happy:** Delete/handoff work stayed scoped because untouched surfaces were named up front.

### H19 — Goal Prompt with Context and Authority + Stop when proven (closest /goal in corpus).
- **category:** `spec/plate`
- **lifecycle_stage:** `spec/plate`
- **pattern:** Goal Prompt with Context and Authority + Stop when proven (closest /goal in corpus).
- **evidence:** session 1def40b7; loops-v2 gold_intake; strata-v3 happy_path_fit p≈0.81 careful_good
- **plate fragment / quote:** “Goal Prompt: … Stop when proven”
- **why happy:** Highest strata-v3 happy_path_fit careful_good ship session opened with explicit Goal Prompt.

### H20 — Name the contract file in the plate (e.g. scripts/learner-key.test.mjs) before impl.
- **category:** `spec/plate`
- **lifecycle_stage:** `spec/plate`
- **pattern:** Name the contract file in the plate (e.g. scripts/learner-key.test.mjs) before impl.
- **evidence:** loops §10.5; PR #10 test:learner-key; happy-paths RIGHT verify
- **plate fragment / quote:** “name contract file (e.g. scripts/learner-key.test.mjs)”
- **why happy:** Spec names a falsifiable artifact instead of hoping CI or UI checklists suffice.

### H21 — Jurisdiction fence in plate: Brain ≠ code ≠ harness; no Brain mutation without contract ticket.
- **category:** `spec/plate`
- **lifecycle_stage:** `spec/plate`
- **pattern:** Jurisdiction fence in plate: Brain ≠ code ≠ harness; no Brain mutation without contract ticket.
- **evidence:** 30-60-90 Week 2; external-frameworks local anchors; FM-AGENTENG inventory
- **plate fragment / quote:** “Brain ≠ code ≠ harness”
- **why happy:** Prevents coding agents from treating epistemic Brain as an impl surface.

### H22 — Subagent packet schema: outcome, cwd, proof, stop, boundaries, output format — refuse sprawl boot if missing.
- **category:** `spec/plate`
- **lifecycle_stage:** `spec/plate`
- **pattern:** Subagent packet schema: outcome, cwd, proof, stop, boundaries, output format — refuse sprawl boot if missing.
- **evidence:** loops P1; sessions e8a25b04/64cfb0da anti; 30-60-90 V3
- **plate fragment / quote:** “artifact + short refs, never dump parent transcript”
- **why happy:** Fixes T9 handoff rot by requiring packet fields instead of inherited history.

### H70 — Done-when a stranger could check: falsifiable commands + observable check in /goal.
- **category:** `spec/plate`
- **lifecycle_stage:** `spec/plate`
- **pattern:** Done-when a stranger could check: falsifiable commands + observable check in /goal.
- **evidence:** loops §3 pstack-quality; outer-loop skill; Ship prompt skeleton
- **plate fragment / quote:** “Done-when: <commands + observable check>”
- **why happy:** Removes ambiguity that lets agents claim done without proof.

## impl (12)

### H23 — Library-first before Chat wire: ship encrypted store with Chat still jon-local.
- **category:** `impl`
- **lifecycle_stage:** `impl`
- **pattern:** Library-first before Chat wire: ship encrypted store with Chat still jon-local.
- **evidence:** PR #9; FM-PRREV PASS; pr-jev happy_path_fit p=0.81
- **plate fragment / quote:** “Not-in-PR: wire resolve, PKCE, live Postgres”
- **why happy:** Deferred temptations kept the library PR reviewable and mergeable.

### H24 — After isolation proof, open a NEW plate for wire — do not widen the proof PR.
- **category:** `impl`
- **lifecycle_stage:** `impl`
- **pattern:** After isolation proof, open a NEW plate for wire — do not widen the proof PR.
- **evidence:** PR #11 after #10; evidence-chains unit 6; loops correction
- **plate fragment / quote:** “Happy follow-up to #10: wire Phase 2 store into Chat”
- **why happy:** Correct follow-up sequencing (#11 merged after #10) completes wire without phase-skip.

### H25 — Smallest-owner identity fix: prefer instanceId over conversationId sniff (+67/−4).
- **category:** `impl`
- **lifecycle_stage:** `impl`
- **pattern:** Smallest-owner identity fix: prefer instanceId over conversationId sniff (+67/−4).
- **evidence:** PR #13; pr-jev-summary; happy-paths RIGHT impl
- **plate fragment / quote:** “Fix: instanceId first”
- **why happy:** Live miss remediation stayed causal and tiny instead of rewriting Flue.

### H26 — Tiny cost/specifier tweak as its own PR after wire (+21/−8 gpt-5-nano).
- **category:** `impl`
- **lifecycle_stage:** `impl`
- **pattern:** Tiny cost/specifier tweak as its own PR after wire (+21/−8 gpt-5-nano).
- **evidence:** PR #12 merged; pr-jev happy_path_fit p=0.75
- **plate fragment / quote:** “Switch connected specifier gpt-4o→gpt-5-nano”
- **why happy:** Keeps cost policy changes separable from identity and store wiring.

### H27 — Narrow hosting fallback: skip loopback on Vercel; forward OIDC; leave local jon-local unchanged.
- **category:** `impl`
- **lifecycle_stage:** `impl`
- **pattern:** Narrow hosting fallback: skip loopback on Vercel; forward OIDC; leave local jon-local unchanged.
- **evidence:** PR #2; loops-v2 pr_lifecycle happy; pr-jev
- **plate fragment / quote:** “On Vercel skip loopback; Local jon-local unchanged”
- **why happy:** Narrow hosting slice merged fast without product-surface sprawl.

### H28 — Observability slice: stamp questionnaire metadata on spans; extend live smoke to two-turn questionnaire.
- **category:** `impl`
- **lifecycle_stage:** `impl`
- **pattern:** Observability slice: stamp questionnaire metadata on spans; extend live smoke to two-turn questionnaire.
- **evidence:** PR #4; pr-jev stage_success p=0.88 verify_ok p=0.84; session soft-join 45147840
- **plate fragment / quote:** “Proof: braintrust/questionnaire/types/build/smoke all checked”
- **why happy:** Strong named proofs with high Jev success — exemplar non-auth impl slice.

### H29 — Cloud agent on cursor/<phase>-… branch; one owner area; push branch only — outer loop opens PR after review.
- **category:** `impl`
- **lifecycle_stage:** `impl`
- **pattern:** Cloud agent on cursor/<phase>-… branch; one owner area; push branch only — outer loop opens PR after review.
- **evidence:** PR #8–#15 fingerprints; loops §6 Ship skeleton; CREWMATE
- **plate fragment / quote:** “On done: push branch only; do not open PR”
- **why happy:** Outer-loop separation kept implementers from merging their own work.

### H30 — Prefer small causal diffs (#6/#13/#14 shape) over giant catch-up corpora (#1 anti).
- **category:** `impl`
- **lifecycle_stage:** `impl`
- **pattern:** Prefer small causal diffs (#6/#13/#14 shape) over giant catch-up corpora (#1 anti).
- **evidence:** happy-paths recommendations; evidence-chains unit 12
- **plate fragment / quote:** “#6 +19/−8; #13 +67/−4; #14 +51/−68”
- **why happy:** Small causal closes reconstruct and review better than +90k skill dumps.

### H31 — Load-on-demand skills: attach only when plate names the owner; ban skill dumps at intake.
- **category:** `impl`
- **lifecycle_stage:** `impl`
- **pattern:** Load-on-demand skills: attach only when plate names the owner; ban skill dumps at intake.
- **evidence:** WM exemplars bfe16717/809dba66/aa4a33cf/16a29d67/0d22cb46 vs stuffed c585e8d6; T6
- **plate fragment / quote:** “stuffed_score 0 / context_discipline ≥2.4”
- **why happy:** Low-stuff sessions keep context discipline high and avoid T6 intake bloat.

### H32 — Install worktree before first commit: pnpm install --frozen-lockfile; do not re-commit-fail.
- **category:** `impl`
- **lifecycle_stage:** `impl`
- **pattern:** Install worktree before first commit: pnpm install --frozen-lockfile; do not re-commit-fail.
- **evidence:** loops §5 stop patterns; TUI postmortem; loops P1
- **plate fragment / quote:** “Install; do not re-commit-fail”
- **why happy:** Converts missing-node_modules thrash into a one-time setup gate.

### H71 — Fail-closed missing key when wiring stored OpenAI into Chat; smallest paste UI only.
- **category:** `impl`
- **lifecycle_stage:** `impl`
- **pattern:** Fail-closed missing key when wiring stored OpenAI into Chat; smallest paste UI only.
- **evidence:** PR #11 body; pr-jev-summary #11
- **plate fragment / quote:** “fail-closed missing key; smallest paste UI”
- **why happy:** Wire follow-up kept security posture while completing store integration.

### H78 — stratum careful_good + happy_path_fit≥0.7 sessions (e.g. 1def40b7, f43dd58a, 16a29d67) as impl replay exemplars.
- **category:** `impl`
- **lifecycle_stage:** `impl`
- **pattern:** stratum careful_good + happy_path_fit≥0.7 sessions (e.g. 1def40b7, f43dd58a, 16a29d67) as impl replay exemplars.
- **evidence:** strata-scores-v3.json results; prefer careful_good/fast_good
- **plate fragment / quote:** “1def40b7 h=0.81 careful_good ship; f43dd58a h=0.75 verify”
- **why happy:** Population strata (n=132) supplies positive exemplars beyond smell-biased thrash packs.

## verify (9)

### H33 — Named proofs in PR body: pnpm test:<slice> && pnpm check && pnpm smoke (or narrowed contract).
- **category:** `verify`
- **lifecycle_stage:** `verify`
- **pattern:** Named proofs in PR body: pnpm test:<slice> && pnpm check && pnpm smoke (or narrowed contract).
- **evidence:** PR #8–#11,#13–#14; loops §10.1; happy-nuggets stop rules
- **plate fragment / quote:** “pnpm check + smoke with fixture cookie”
- **why happy:** Named contracts beat unchecked UI checklists as merge evidence.

### H34 — Intentional verify/ship probe as its own tiny PR (1-line HTML auto-deploy probe).
- **category:** `verify`
- **lifecycle_stage:** `verify`
- **pattern:** Intentional verify/ship probe as its own tiny PR (1-line HTML auto-deploy probe).
- **evidence:** PR #3; pr-jev happy_path_fit p=0.70; loops-v2 happy
- **plate fragment / quote:** “Tiny HTML comment probe for Vercel Git production auto-deploy”
- **why happy:** Proves deploy path without bundling product behavior changes.

### H35 — Hotel-safety / isolation proof phase: outcome = overlapping streams cannot mix keys; not paste UI.
- **category:** `verify`
- **lifecycle_stage:** `verify`
- **pattern:** Hotel-safety / isolation proof phase: outcome = overlapping streams cannot mix keys; not paste UI.
- **evidence:** PR #10; test:learner-key; FM-PRREV CONCERN recorded
- **plate fragment / quote:** “Hotel-safety overlap contract via test:learner-key”
- **why happy:** Proof-only phase stayed honest about deferred store wiring.

### H36 — Honest “live unverified” checkbox beats fake green UI checklist.
- **category:** `verify`
- **lifecycle_stage:** `verify`
- **pattern:** Honest “live unverified” checkbox beats fake green UI checklist.
- **evidence:** PR #11/#12/#13 bodies; evidence-chains unit 6 lesson; #7 anti contrast
- **plate fragment / quote:** “Live vendor turn unverified”
- **why happy:** Honesty about live gaps preserves trust and schedules real follow-up proofs.

### H37 — Thrash tripwire: ≥3 identical tool sigs OR ≥5 edit cycles on one file without green gate → stop, rewrite plate.
- **category:** `verify`
- **lifecycle_stage:** `verify`
- **pattern:** Thrash tripwire: ≥3 identical tool sigs OR ≥5 edit cycles on one file without green gate → stop, rewrite plate.
- **evidence:** loops §5; CTXSMELL; happy-nuggets stop rules; b23609bb anti exemplar
- **plate fragment / quote:** “≥3 identical tool sigs OR ≥5 edit cycles… → stop”
- **why happy:** Converts dominant T2 failure into an actionable mid-loop stop.

### H38 — Repeated targeted gate in-loop (e.g. tsc) rather than end-only hope.
- **category:** `verify`
- **lifecycle_stage:** `verify`
- **pattern:** Repeated targeted gate in-loop (e.g. tsc) rather than end-only hope.
- **evidence:** session 430c4785 loops W1 contrast vs F2; Axis A shipper
- **plate fragment / quote:** “landing favicon/hero with repeated tsc proof”
- **why happy:** In-loop gates keep velocity without silent thrash.

### H39 — Fail closed when identity/proof thin: delete sniff fallback; error on missing/unparseable instance id.
- **category:** `verify`
- **lifecycle_stage:** `verify`
- **pattern:** Fail closed when identity/proof thin: delete sniff fallback; error on missing/unparseable instance id.
- **evidence:** PR #14; HP6; AGENTS hosted secrets posture
- **plate fragment / quote:** “Delete instanceId??conversationId sniff”
- **why happy:** Governance end of gold chain prefers hard errors over wrong-vendor latch.

### H40 — Jev/TypeSafe as judgment lane for smell/plate/ship-worthiness — code owns control flow; confidence-gate uncertain.
- **category:** `verify`
- **lifecycle_stage:** `verify`
- **pattern:** Jev/TypeSafe as judgment lane for smell/plate/ship-worthiness — code owns control flow; confidence-gate uncertain.
- **evidence:** FM-TYPESAFE-01 scout; strata-scores-v3; pr-jev; 30-60-90 days 31–45
- **plate fragment / quote:** “never substitute Brain mutation or tutoring generation”
- **why happy:** Typed judgments score partnership without becoming an agent loop.

### H72 — Unchecked UI checklist ≠ verify; require named contract or honest “unverified” before merge language.
- **category:** `verify`
- **lifecycle_stage:** `verify`
- **pattern:** Unchecked UI checklist ≠ verify; require named contract or honest “unverified” before merge language.
- **evidence:** happy-nuggets stop rules; #7 anti; CTXSMELL missing_verification 14/50
- **plate fragment / quote:** “Unchecked UI checklist ≠ verify”
- **why happy:** Direct antidote to the #7 anti-happy verify-weak UI merge.

## review (7)

### H41 — Independent FM-PRREV / adversarial-review Scout on security-adjacent PRs before treating proof as closed.
- **category:** `review`
- **lifecycle_stage:** `review`
- **pattern:** Independent FM-PRREV / adversarial-review Scout on security-adjacent PRs before treating proof as closed.
- **evidence:** FM-PRREV-01 on #8–#10; loops W2; happy-paths HP4
- **plate fragment / quote:** “#8/#9 PASS; #10 CONCERN”
- **why happy:** CONCERN catching overclaim is a feature of the happy path, not a failure.

### H42 — Record residual risk note when merging with CONCERN; do not market unit wrap as live Chat closed proof.
- **category:** `review`
- **lifecycle_stage:** `review`
- **pattern:** Record residual risk note when merging with CONCERN; do not market unit wrap as live Chat closed proof.
- **evidence:** PR #10 FM-PRREV CONCERN; FM-AGENTENG-01.md P0 residual; happy-paths review RIGHT
- **plate fragment / quote:** “unit path ≠ instrument path”
- **why happy:** Allows merge while preserving honest residual tracking for follow-ups.

### H43 — Fresh adversarial-review subagent: branch vs base; no tests during review; error blocks PR; ask-user → Firstmate.
- **category:** `review`
- **lifecycle_stage:** `review`
- **pattern:** Fresh adversarial-review subagent: branch vs base; no tests during review; error blocks PR; ask-user → Firstmate.
- **evidence:** GROK_SHIP / adversarial-review skill; loops §6.C; CREWMATE
- **plate fragment / quote:** “Severity error blocks PR; auto-fix → same cloud agent”
- **why happy:** Fresh context review prevents self-review theater before merge-bound PRs.

### H44 — Evidence-chain reconstructability: intent → authority → tools → outcome → remediation (label verified/inference/unknown).
- **category:** `review`
- **lifecycle_stage:** `review`
- **pattern:** Evidence-chain reconstructability: intent → authority → tools → outcome → remediation (label verified/inference/unknown).
- **evidence:** evidence-chains.md method; external-frameworks F1 Audit Evidence Chain
- **plate fragment / quote:** “who initiated / what authority / which tool / who accepted / remediation”
- **why happy:** Makes agentic work units auditable beyond pass/fail green CI.

### H45 — Anti-LOC partnership score: measure stories accepted / escaped defects / cost-per-feature — not tool counts or LOC.
- **category:** `review`
- **lifecycle_stage:** `review`
- **pattern:** Anti-LOC partnership score: measure stories accepted / escaped defects / cost-per-feature — not tool counts or LOC.
- **evidence:** external-frameworks F4/F6; Microsoft Agentic-Agile; METR SWE-bench merge note
- **plate fragment / quote:** “LOC/PR volume inflate under agent parallelism”
- **why happy:** Prevents mistaking thrash-adjacent high tool_call_count for productivity.

### H46 — Correct #11–#14 status: merged:true happy follow-ups — never frame as closed-fail / phase-skip.
- **category:** `review`
- **lifecycle_stage:** `review`
- **pattern:** Correct #11–#14 status: merged:true happy follow-ups — never frame as closed-fail / phase-skip.
- **evidence:** happy-paths Correction; loops §10.3 correction; GitHub MCP merged flags; pr-jev
- **plate fragment / quote:** “#11–#14 all merged: true”
- **why happy:** Accurate merge attribution keeps the gold chain teachable and prevents false anti-labels.

### H73 — Grok Ship doctrine: never merge without captain; ask-user severity escalates to Firstmate.
- **category:** `review`
- **lifecycle_stage:** `review`
- **pattern:** Grok Ship doctrine: never merge without captain; ask-user severity escalates to Firstmate.
- **evidence:** GROK_BOT_CREWMATE; loops W2; adversarial-review skill
- **plate fragment / quote:** “never merge without captain”
- **why happy:** Preserves human merge authority across cloud agent ships.

## ship (10)

### H47 — PR body = Outcome / What changed / Proof / Not-in-this-PR; captain merges (never cloud agent).
- **category:** `ship`
- **lifecycle_stage:** `ship`
- **pattern:** PR body = Outcome / What changed / Proof / Not-in-this-PR; captain merges (never cloud agent).
- **evidence:** PR #8–#14 bodies; loops §10.1 Ship; CREWMATE
- **plate fragment / quote:** “Outcome / Proof / Not-in-this-PR”
- **why happy:** Standard PR shape made phase chain reviewable and mergeable same day.

### H48 — Same-day narrow hotfix after warned host landmine (#5→#6 OIDC boot +19/−8).
- **category:** `ship`
- **lifecycle_stage:** `ship`
- **pattern:** Same-day narrow hotfix after warned host landmine (#5→#6 OIDC boot +19/−8).
- **evidence:** PR #6; session soft-join b06e3da7; HP3; loops-v2 happy
- **plate fragment / quote:** “Production 500 after #5: resolveChatModel threw at module load”
- **why happy:** Gold incident shape: causal tiny fix same day beats thrash-overlapping merges.

### H49 — Route merge-bound Socratink work through Grok Ship scout→ship→adversarial→captain merge; IDE thrash is non-merge path.
- **category:** `ship`
- **lifecycle_stage:** `ship`
- **pattern:** Route merge-bound Socratink work through Grok Ship scout→ship→adversarial→captain merge; IDE thrash is non-merge path.
- **evidence:** FM-AGENTENG-01.md P0 #3; loops §7/#8; CREWMATE
- **plate fragment / quote:** “Treat long Cursor thrash threads as non-merge path”
- **why happy:** Separates Axis-A volume from loop-healthy merge authority.

### H50 — Outer-loop one-liner: research→/goal+fences→named contract→cloud slice→test+check+smoke→PRREV→merge→new /goal.
- **category:** `ship`
- **lifecycle_stage:** `ship`
- **pattern:** Outer-loop one-liner: research→/goal+fences→named contract→cloud slice→test+check+smoke→PRREV→merge→new /goal.
- **evidence:** happy-nuggets.md; evidence-chains unit 12; loops §10.5
- **plate fragment / quote:** “never widen Not-in-this-PR into the same PR”
- **why happy:** Single reusable lifecycle recipe matching the gold PR chain.

### H51 — Cloud-agent fingerprint join: cursor/* branch + CURSOR_AGENT_PR_BODY + bc-* footer — do not invent IDE session IDs.
- **category:** `ship`
- **lifecycle_stage:** `ship`
- **pattern:** Cloud-agent fingerprint join: cursor/* branch + CURSOR_AGENT_PR_BODY + bc-* footer — do not invent IDE session IDs.
- **evidence:** happy-paths verified gap; cloud-bc-pr-scan.json; evidence-chains unit 4
- **plate fragment / quote:** “zero local Cursor parents for PRs #8–#15”
- **why happy:** Honest reconstructability for cloud ships without false session joins.

### H52 — Populate pr_urls / bcId into session packs so chat-signal can join cloud work.
- **category:** `ship`
- **lifecycle_stage:** `ship`
- **pattern:** Populate pr_urls / bcId into session packs so chat-signal can join cloud work.
- **evidence:** happy-paths recommendations #3; evidence-chains systemic gap 1
- **plate fragment / quote:** “packs have empty pr_urls”
- **why happy:** Closes observability gap that made Sept cloud phase work invisible to packs.

### H53 — Split skill-corpus PRs from product behavior PRs (#1 lesson).
- **category:** `ship`
- **lifecycle_stage:** `ship`
- **pattern:** Split skill-corpus PRs from product behavior PRs (#1 lesson).
- **evidence:** PR #1 +90k skill corpus; happy-paths AH5; recommendations #4
- **plate fragment / quote:** “skill corpus dominates line count”
- **why happy:** Keeps behavior diffs reviewable and avoids burying UI change under corpus dumps.

### H54 — Open Phase 4 (#15) only with plate+proof; do not widen mid-flight; accept #10 residual risks explicitly.
- **category:** `ship`
- **lifecycle_stage:** `ship`
- **pattern:** Open Phase 4 (#15) only with plate+proof; do not widen mid-flight; accept #10 residual risks explicitly.
- **evidence:** PR #15 open; happy-paths OPEN; pr-jev missing_verify; FM-AGENTENG P0
- **plate fragment / quote:** “Continue only with plate+proof; don’t widen mid-flight”
- **why happy:** In-flight PKCE stays happy if plate discipline continues — not anti until it widens.

### H55 — factory.db task.result = PR URL / report path; status→done only after captain/Firstmate ack.
- **category:** `ship`
- **lifecycle_stage:** `ship`
- **pattern:** factory.db task.result = PR URL / report path; status→done only after captain/Firstmate ack.
- **evidence:** inventory factory.db scouts done; FM-AGENTENG-01 underway leave-done note
- **plate fragment / quote:** “task.result pointer”
- **why happy:** Durable task truth replaces chat-memory-only ship tracking.

### H74 — Copy gold chain shape not any single large diff: #8–#10 phased fences + #6/#13/#14 small closes.
- **category:** `ship`
- **lifecycle_stage:** `ship`
- **pattern:** Copy gold chain shape not any single large diff: #8–#10 phased fences + #6/#13/#14 small closes.
- **evidence:** evidence-chains unit 12 lesson; happy-nuggets PR gold chain
- **plate fragment / quote:** “#8→#9→#10→#11→#12→#13→#14 (+#6)”
- **why happy:** Teaches the pattern family, avoiding cargo-cult of one PR’s size.

## handoff (7)

### H56 — Handoffs = artifact path + short refs (session_id, PR #) — never dump parent transcript.
- **category:** `handoff`
- **lifecycle_stage:** `handoff`
- **pattern:** Handoffs = artifact path + short refs (session_id, PR #) — never dump parent transcript.
- **evidence:** 30-60-90 Week 3; Anthropic multi-agent V3; loops T9
- **plate fragment / quote:** “filesystem artifacts / refs”
- **why happy:** Prevents game-of-telephone sprawl while preserving reconstructability.

### H57 — Researchy EXTRACT → mirror reports to /home/box/agent-data/grok-ship/reports/ without SendToUser.
- **category:** `handoff`
- **lifecycle_stage:** `handoff`
- **pattern:** Researchy EXTRACT → mirror reports to /home/box/agent-data/grok-ship/reports/ without SendToUser.
- **evidence:** FM-AGENTENG-01 job contract; loops artifacts section; this job FM-AGENTENG-01
- **plate fragment / quote:** “research-only · no PR · no SendToUser”
- **why happy:** Keeps research artifacts durable for Firstmate without premature user sends.

### H58 — Packet-only brief for side-chat workers; refuse sprawl boot.py without outcome/cwd/proof/stop.
- **category:** `handoff`
- **lifecycle_stage:** `handoff`
- **pattern:** Packet-only brief for side-chat workers; refuse sprawl boot.py without outcome/cwd/proof/stop.
- **evidence:** loops P1; sessions e8a25b04, 64cfb0da; Nole G1 named-agents-only
- **plate fragment / quote:** “refuse sprawl boot if missing”
- **why happy:** Stops T9 multi-agent rot at the boot gate.

### H59 — Single-source skills: pack canonical; workflows = checkout of pack (fix G2 dual-source drift).
- **category:** `handoff`
- **lifecycle_stage:** `handoff`
- **pattern:** Single-source skills: pack canonical; workflows = checkout of pack (fix G2 dual-source drift).
- **evidence:** Nole MERGE-FINAL twin diffs adversarial-review/ahoy/lavish/project-management
- **plate fragment / quote:** “G2 → single-source skills”
- **why happy:** Eliminates silent skill fork between workflows and grok-ship pack.

### H60 — Archive-before-clone (Nole W0): cold-archive QC/landing dumps before growing another fat tree.
- **category:** `handoff`
- **lifecycle_stage:** `handoff`
- **pattern:** Archive-before-clone (Nole W0): cold-archive QC/landing dumps before growing another fat tree.
- **evidence:** Nole MERGE-FINAL W0; evidence-chains unit 11; ~3176 MB QC/landing
- **plate fragment / quote:** “G4 → archive-before-clone”
- **why happy:** Disk sprawl hygiene parallel to session thrash stop — same stop-widening discipline.

### H61 — Named-agents-only roster: cut unnamed New Bot/New Agent stubs; pin only live profile dirs.
- **category:** `handoff`
- **lifecycle_stage:** `handoff`
- **pattern:** Named-agents-only roster: cut unnamed New Bot/New Agent stubs; pin only live profile dirs.
- **evidence:** Nole MERGE-FINAL G1; sidebar socratink 5 / archived 18
- **plate fragment / quote:** “named-agents-only”
- **why happy:** Roster governance prevents ghost crew and dead pins from becoming handoff targets.

### H75 — Lay off lifestyle skill packs (site-playbooks-*) on Socratink crew; keep role-owned skills wired.
- **category:** `handoff`
- **lifecycle_stage:** `handoff`
- **pattern:** Lay off lifestyle skill packs (site-playbooks-*) on Socratink crew; keep role-owned skills wired.
- **evidence:** Nole orphan/unused; site-playbooks ×12 ~236 KB; T6 habit
- **plate fragment / quote:** “Lay off lifestyle skills”
- **why happy:** Cuts always-on attention tax while preserving competitor-watch role skills.

## recovery (8)

### H62 — After costly fail: dated .agents/learnings/ note — Requested / Substituted / Evidence / Stop rule / Regression — before retry.
- **category:** `recovery`
- **lifecycle_stage:** `recovery`
- **pattern:** After costly fail: dated .agents/learnings/ note — Requested / Substituted / Evidence / Stop rule / Regression — before retry.
- **evidence:** AGENTS §7; EVT→PROC; Praxist; 30-60-90 Week 4
- **plate fragment / quote:** “Requested job / Substituted job / Evidence / Stop rule”
- **why happy:** Encodes negative results as durable stop rules instead of silent retries.

### H63 — Stall→replan: same fail ≥2× ⇒ rewrite plate (Progress Ledger / Magentic-One pattern); never identical tool retry.
- **category:** `recovery`
- **lifecycle_stage:** `recovery`
- **pattern:** Stall→replan: same fail ≥2× ⇒ rewrite plate (Progress Ledger / Magentic-One pattern); never identical tool retry.
- **evidence:** external Magentic-One V5; 30-60-90 stop rules; loops §5 identical sig ≥3
- **plate fragment / quote:** “stall counter ≤2 then replan”
- **why happy:** Converts persistent-inefficient-actions into outer-loop replan.

### H64 — Live observation → identity fix → fail-closed harden as sequential recovery PRs (#13→#14).
- **category:** `recovery`
- **lifecycle_stage:** `recovery`
- **pattern:** Live observation → identity fix → fail-closed harden as sequential recovery PRs (#13→#14).
- **evidence:** evidence-chains unit 5; PR #13/#14 merged; HP6
- **plate fragment / quote:** “live miss → instanceId → delete sniff”
- **why happy:** Recovery stays phased: first correct selection, then remove fail-open paths.

### H65 — When merge gate warns host-specific landmine: block merge OR schedule hotfix plate before merge.
- **category:** `recovery`
- **lifecycle_stage:** `recovery`
- **pattern:** When merge gate warns host-specific landmine: block merge OR schedule hotfix plate before merge.
- **evidence:** PR #5 DATABASE_URL landmine → #6; evidence-chains unit 3 lesson
- **plate fragment / quote:** “MERGE GATE warned: DATABASE_URL fail-closed on Vercel”
- **why happy:** Turns known landmine into either a block or a pre-scheduled recovery plate.

### H66 — Session decision table: continue / rewind / compact / clear / subagent / stall→replan based on plate load-bearing status.
- **category:** `recovery`
- **lifecycle_stage:** `recovery`
- **pattern:** Session decision table: continue / rewind / compact / clear / subagent / stall→replan based on plate load-bearing status.
- **evidence:** 30-60-90 Week 4; Claude Code V4; external frameworks companion
- **plate fragment / quote:** “new task ⇒ new session; /clear between unrelated”
- **why happy:** Gives operators explicit recovery moves instead of endless continue.

### H67 — Codify EVT tripwires already in AGENTS; add learnings when campaigns fail — folder still thin, grow it.
- **category:** `recovery`
- **lifecycle_stage:** `recovery`
- **pattern:** Codify EVT tripwires already in AGENTS; add learnings when campaigns fail — folder still thin, grow it.
- **evidence:** happy-paths recommendation #5; evidence-chains systemic gap 3
- **plate fragment / quote:** “1 praxist postmortem on disk”
- **why happy:** Makes recovery culture measurable by growing dated learnings after fails.

### H68 — Velocity∩quality bands careful_good/fast_good with gap=none are preferred recovery targets for replay — not slow_thrash Axis-A heroes.
- **category:** `recovery`
- **lifecycle_stage:** `recovery`
- **pattern:** Velocity∩quality bands careful_good/fast_good with gap=none are preferred recovery targets for replay — not slow_thrash Axis-A heroes.
- **evidence:** strata-scores-v3 velocity_quality_band_counts; sessions 1def40b7/f43dd58a; strata-v3.md
- **plate fragment / quote:** “careful_good 65–72; prefer gap=none”
- **why happy:** Replay/teach from careful_good high happy_path_fit sessions, not thrash shippers.

### H76 — After ≥2 failed corrections: /clear + rewrite plate (do not keep correcting polluted approach).
- **category:** `recovery`
- **lifecycle_stage:** `recovery`
- **pattern:** After ≥2 failed corrections: /clear + rewrite plate (do not keep correcting polluted approach).
- **evidence:** 30-60-90 anti-patterns; Claude Code V2; Magentic-One
- **plate fragment / quote:** “Correcting >2× without clear/rewrite”
- **why happy:** Failed approaches pollute context; clear+rewrite recovers partnership faster.

## Anti (do not copy as happy)
- **#7** large UI + unchecked browser checklist / thrash overlap (`357a2e9e`).
- **EVT-0001** validation language → adjacent product (~3.5k) → revert.
- **#1** product UI buried under +90k skill corpus.
- **#5** merge with known host DATABASE_URL landmine (recovery exemplar is #6, not #5).
- Thrash cluster `b23609bb` / `a09316e9` / `3f9a6631` — ship volume ≠ loop health.

## Category counts

| category | n |
| --- | ---: |
| research | 8 |
| planning | 8 |
| spec/plate | 9 |
| impl | 12 |
| verify | 9 |
| review | 7 |
| ship | 10 |
| handoff | 7 |
| recovery | 8 |
| **total** | **78** |


