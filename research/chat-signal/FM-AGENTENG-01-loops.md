<!-- LOOPS v2.2 BURN LOCKED for master (Firstmate/Loops 2026-09-15): prefer over v2.1/v2/v1.1. mines 65; §16 daily top-10. Companion: FM-AGENTENG-01-extract.md -->

# FM-AGENTENG-01 — Loops annex (pstack / outer-loop)

- **As-of:** 2026-09-15 20:55 CT  
- **Job id:** FM-AGENTENG-01  
- **Annex author:** loops (engineering outer loop; pstack is reference, not identity)  
- **Mode:** research-only · no PR · no push · no Brain mutation  
- **Audience:** Firstmate / Researchy synthesis  
- **Depth note:** **v2.2 BURN** — §13–§16 EXTRACT + daily top-10 pocket (§16) + **65** structural mines (+20 burn) +  45 structural home-live Cursor mines + 50 Jev pilot scores (System One Axis A/B); full PR `#1–#15` lifecycle map with **#11–#14 corrected as MERGED happy follow-ups**; per-stage `/goal` templates; cloud-agent vs IDE join gap.

## Brain / scope contract

- **North-star fit:** Improve how coding agents are briefed, looped, reviewed, and stopped so Socratink ships stay outcome-faithful.  
- **Canon relied on:** product `AGENTS.md` working method; Grok Ship scout→adversarial-review→PR; outer-loop `/goal` + proof.  
- **Claims this annex must NOT make:** no universal agent law from n≈50; no vanity %; no promotion of archived PROC into live Canon; no assertion that IDE thrash sessions never shipped value; no invented session↔PR IDs for cloud-agent `#8–#15`.  
- **Brain mutation proposed:** none.  
- **v1.1 correction:** PR `#11–#14` are **merged** happy follow-ups after `#10`, not closed phase-order failures.

## Sources

| Source | Path / id | As-of |
| --- | --- | --- |
| Context smells | `product/socratink/research/chat-signal/FM-CTXSMELL-01.md` | 2026-09-15 |
| Chat-signal pilot (Jev) | `…/FM-CHATSIG-PILOT.md` + `pilot-runs/scores.json` (n=50) | 2026-09-15 |
| Chat-signal design | `…/FM-CHATSIG-01.md` | 2026-09-15 |
| Happy-paths sibling | `…/FM-AGENTENG-01-happy-paths.md` | 2026-09-15 |
| Home-live capture | `chat-histories/captures/current-home-live` → `home-live-20260915-1952` | stamp 20260915-1952 |
| Session mine artifact | `…/agenteng-runs/loops-v2-session-mine.json` | 2026-09-15 |
| Product / workspace AGENTS | product + workspace roots | read 2026-09-15 |
| Skill Scout workflow | `product/socratink/.agents/skills/skill-scout/references/scouting-workflow.md` | read 2026-09-15 |
| Grok Ship / outer-loop / adversarial-review | factory + workflows skills | read 2026-09-15 |
| FM-PRREV-01 | `#8–#10` review | 2026-09-15 |
| GitHub MCP | `jon-devlapaz/socratink` PR `#1–#15` | verified merge states |

**Measurement caveat (verified):** Cursor jsonl stores `tool_use` inputs, not outputs — prefer repeat signatures + plate quality over string “error” counts (FM-CTXSMELL-01).

---

## 0. v2 executive snapshot (Jev + thrash)

| Metric | Value | Read |
| --- | --- | --- |
| Structural mines | **65** socratink-preferring Cursor parents (+20 burn) | Tool/path thrash + plate keywords |
| Jev scores used | **50/50** pilot pack | Axis A/B composites; no new live Jev calls this run |
| Plate keyword hit (best user msg) | **42/65** | Higher than v1 first-message-only 5/20 — still not `/goal`+proof quality |
| Proof keyword hit | **6/65** | Intake almost never names falsifiable proof |
| Axis A ∩ extreme thrash | `b23609bb`, `a09316e9`, `357a2e9e` | **Ship score ≠ loop health** |
| Gold intake | `1def40b7` (“Goal Prompt” + modularization) | Closest IDE `/goal`; still needs stop-on-proof culture |
| Cloud vs IDE | `#8–#15` cloud-agent fingerprints; **zero** home-live parents in Sep 15–16 windows | Join via PR body/`bcId`, not jsonl |

### Jev Axis A top (pilot)

| Session | Axis A | Kind | PRs in window | shipped p |
| --- | --- | --- | --- | --- |
| `b06e3da7` | 1.150 | implementation | #5, #6 | 0.95 |
| `b23609bb` | 1.091 | implementation | #4, #5, #6 | 0.96 |
| `c585e8d6` | 1.083 | design | — | 0.88 |
| `430c4785` | 1.076 | implementation | — | 0.95 |
| `a09316e9` | 1.073 | implementation | — | 0.95 |
| `1def40b7` | 1.032 | implementation | — | 0.94 |
| `64fde956` | 0.997 | implementation | — | 0.95 |
| `fae4006d` | 0.994 | implementation | — | 0.94 |
| `357a2e9e` | 0.986 | implementation | #7 | 0.92 |
| `316e90d5` | 0.977 | debug | — | 0.88 |

### Structural thrash leaders (v2 mine)

| Session | Tools | Top reads | Plate? |
| --- | --- | --- | --- |
| `b23609bb` | 1770 | chat-surface.ts×93, styles.css×91 | goalish=False |
| `a09316e9` | 1384 | chat-surface.ts×57, styles.css×48 | goalish=True |
| `357a2e9e` | 915 | styles.css×126, chat-surface.ts×37 | goalish=True |
| `f57a99e7` | 730 | app.js×36, SKILL.md×13 | goalish=False |
| `4d0e878b` | 632 | conversation-stream-store-CXwRWonS.mjs×16, smoke.mjs×14 | goalish=False |
| `e1fe36a4` | 579 | transcript.css×41, styles.css×14 | goalish=False |
| `891f9f25` | 553 | SKILL.md×39, Hero.tsx×8 | goalish=False |
| `2fb70153` | 538 | SKILL.md×21, styles.css×19 | goalish=True |

---

## 1. Loop archetypes that work

| ID | Archetype | What it looks like | Local evidence |
| --- | --- | --- | --- |
| W1 | **Plate → narrow owner → gate** | One observable outcome; edit owning module; run nearest contract then `pnpm check` / `pnpm smoke`; stop | Product `AGENTS.md` §§1–6; Axis A shippers `b06e3da7` (#5/#6), `430c4785` (tsc loops) |
| W2 | **Grok Ship scout → ship → adversarial review → PR** | Scout: report only. Ship: branch + tests, fresh adversarial-review, ask-user to Firstmate; captain merges | `GROK_BOT_CREWMATE.md`; `adversarial-review` skill |
| W3 | **Outer-loop /goal + proof** | Outer bot gathers, writes falsifiable `/goal`, launches cloud agent, reviews, babysits PR | `outer-loop` skill |
| W4 | **Explicit plate mid-UI** | Captain pastes Plate/cwd/stop even for visual work | `f5892573` |
| W5 | **Destructive restart with fence** | Clear “do not salvage” + single surface | `fae4006d` — still needs stop-on-proof |
| W6 | **Skill Scout gated discover** | Contract → ≤3 finalists → checkpoint → opt-in web; VERIFY does not widen | `scouting-workflow.md` |
| W7 | **Phased cloud PR chain** | Outcome / Proof / Not-in-this-PR; one invariant per PR; follow-ups for residuals | `#8→#14` (+ `#15` open); FM-PRREV CONCERN recorded on `#10` |
| W8 | **Goal Prompt intake** | Named Goal Prompt + architecture intent before tools | `1def40b7` |

---

## 2. Loop archetypes that fail

| ID | Fail archetype | Smell | Evidence |
| --- | --- | --- | --- |
| F1 | **UI file thrash without gate** | T2 | `b23609bb` 1770 tools; `357a2e9e` 915 (126× `styles.css`); `a09316e9` 1384; `3f9a6631` phased → fatal thrash |
| F2 | **Clear goal, no stop-on-proof** | T2+T7 | `fae4006d`; high Axis A without proof culture |
| F3 | **Trust / away prompt** | T7+T3 | `a09316e9` FreeLLMAPI on production |
| F4 | **Scope substitution** | T1 | EVT-0001 / SRC-0010 / PROC-0002 |
| F5 | **Multi-issue pile-on** | T3 | `c2a77998` |
| F6 | **Handoff / sprawl rot** | T9 | `e8a25b04`, `64cfb0da` |
| F7 | **Gitignore → prototype expansion** | T1+T2 | `f4d88dd4` |
| F8 | **Harness resume without plate rewrite** | T3+T10 | `b06e3da7`, `316e90d5` — can still ship |
| F9 | **Skill stuffing at intake** | T6 | `c585e8d6`, `df80810e`, `2fb70153` |
| F10 | **Missing verification culture** | T7 | Pilot `missing_verification` 14/50; proofish **6/65** in v2 mine |
| F11 | **Proof theater** | T7 | FM-PRREV CONCERN on `#10` (ALS unit path ≠ Flue instrument / live Chat) |
| F12 | **Verify-weak large UI PR** | T2+T7 | `#7` unchecked browser checklist |

**v2 mine snapshot:** plate-ish keywords **30/45**; proof keywords **5/45**. Axis A can rank thrash sessions at the top — treat Jev ship signal as necessary but not sufficient for loop health.

---

## 3. pstack-quality `/goal` discipline vs observed Cursor/Codex loops

### What “good” means (pstack / outer-loop)

- **One job**, named repo, **done-when a stranger could check**.  
- Constraints as fences, not a patch recipe.  
- Implement prompts say **what good looks like**, not line edits.  
- Gather read-only first; cloud agent implements; **adversarial review before PR**; captain merges.  
- Stop when proof lands — no adjacent polish.

### What home-live actually does

| Dimension | Target | Observed |
| --- | --- | --- |
| Intake | `/goal` + proof + stop | Resume Codex, skill dumps, multi-issue, images, “I trust you”; rare Goal Prompt (`1def40b7`) |
| Loop body | Narrow owner + targeted checks | Extreme Read/StrReplace on `chat-surface.ts` / `styles.css` |
| Review | Fresh adversarial-review | Ad-hoc / none in IDE; FM-PRREV only when tasked |
| Stop | Outcome proven | Usage, correction, or interrupt |
| Sep phase work | Same as W3/W7 | **Cloud agents** — invisible to home-live packs |

---

## 4. Briefing patterns (recommend)

```text
/goal <one observable learner/operator outcome>
repo: jon-devlapaz/socratink   # never guess
cwd / worktree: <exact path>
proof: <pnpm test:… and/or pnpm check + pnpm smoke; name live check if needed>
stop: when proof green for /goal; do not polish adjacent surfaces
fences: no BYOK UI | no Flue rewrite | no Brain mutation | …
out_of_scope: …
```

**Ban:** “pick up where Codex left off” alone; “validate these two issues”; trust-away without proof; skill dumps before outcome; `.gitignore`→prototype.

---

## 5. Stop / review patterns (recommend)

| Trigger | Action |
| --- | --- |
| Same file Read/StrReplace ≥5 without green gate | **Stop.** Rewrite plate. |
| Identical tool signature ≥3 | Diagnose → change one variable → retry once |
| Ship branch ready | Fresh **adversarial-review**; error ⇒ no PR; ask-user ⇒ Firstmate |
| Auth/BYOK PR | FM-PRREV-style Scout; record CONCERN residuals |
| Outcome proven | Stop. New `/goal` for next phase |

---

## 6. Concrete Socratink outer-loop template

**Name:** Intake plate → loop → adversarial review → stop-on-proof  

### A–D (unchanged intent)

1. Write `/goal` + proof + fences + named repo.  
2. Scout = report-only; Ship = branch + tests, no PR before adversarial-review.  
3. Captain merges.  
4. Resume = **rewrite plate from current truth**.

### E. Ship prompt skeleton

```text
/goal <observable outcome>
Repo: https://github.com/jon-devlapaz/socratink
Done-when: <commands + observable check>
Constraints: smallest owner; match AGENTS.md + ZEN.md; no drive-by refactors
Context: <paths/PRs as context, not line prescriptions>
Out of scope: <list>
On done: push branch only; do not open PR (outer loop runs adversarial-review next)
```

---

## 7. Grok Ship Scout/Ship vs ad-hoc chat agents — gaps

| Gap | Grok Ship | Ad-hoc Cursor/Codex | Cost |
| --- | --- | --- | --- |
| Task truth | `factory.db` + task id | Chat memory | Lost goal |
| Isolation | Cloud VM | Dirty local worktree | Wrong cwd |
| Review gate | Adversarial before PR | Optional | Thrash-shipped UI |
| Merge authority | Captain | Local when asked | Policy drift |
| Observability | PR/`bcId` | IDE jsonl only | `#8–#15` invisible to packs |

**Inference:** Prefer Ship path for merge-bound work; IDE for plate-bound hotfixes with thrash tripwires. Ingest `pr_urls` / `bcId` into chat-signal packs.

---

## 8. Concrete Socratink shipping workflow changes

| Pri | Change | Evidence |
| --- | --- | --- |
| **P0** | Require `/goal` + `proof` + `stop` on every Ship (and IDE >15 min) | Proofish 6/65; CTXSMELL playbook |
| **P0** | Thrash tripwire in product `AGENTS.md` | `b23609bb`, `357a2e9e`, `a09316e9` |
| **P0** | Route merge-bound work through Scout/Ship + adversarial-review | CREWMATE vs home-live; `#8–#14` cloud success |
| **P1** | Resume/Codex-handoff: rewrite plate | `b06e3da7`, `316e90d5` |
| **P1** | Subagent packet: outcome, cwd, proof, stop | `e8a25b04`, `64cfb0da` |
| **P1** | Pack `pr_urls` / cloud `bcId` | Happy-paths verified gap |
| **P2** | Load-on-demand research; smell prefilter; dated learnings | T6; EVT-0001 |

---

## 9. Handoff bullets for Researchy (lift into master)

1. Written loop (AGENTS + Grok Ship) is closer to pstack than practiced IDE loops.  
2. Dominant failure is **T2 thrash** on UI owners — often with high Axis A.  
3. Proof in intake remains rare (**6/65** after burn mine).  
4. Plate language helps (`f5892573`, `1def40b7`, `fae4006d`) but needs **stop-on-proof**.  
5. EVT-0001: validation words ≠ scope authority.  
6. Sprawl/handoff rot is packet-fixable.  
7. Default merge path: outer-loop template → cloud ship → adversarial → captain merge.  
8. P0: `/goal`+proof+stop; thrash tripwire; Ship path for merges.  
9. Skill Scout gated DISCOVER = positive research archetype.  
10. Do not overfit smell-biased frequencies as base rates.  
11. **PR gold chain `#8→#9→#10` then merged follow-ups `#11→#14`** (+ hotfix `#6`). Fail exemplars: `#7` verify-weak UI; IDE thrash; EVT-0001 — **not** `#11–#14`.  
12. `#8–#15` are cloud-agent; join via PR/`bcId`, not home-live jsonl.  
13. Axis A ∩ thrash warning: `b23609bb` / `a09316e9` / `357a2e9e`.
14. EXTRACT catalogs §13–§16: atomic nuggets N001–N071 + smells S001–S071 with stop rules and happy↔smell pairs.
15. Burn v2.2: 65 structural mines; §16 daily top-10 N*/S* pocket card.

---

## 10. Software lifecycle — PR `#1–#15` map (outer-loop lens)

**Verified merge rule:** `pull_request_read` `merged=true` wins over list-view quirks.

| PR | Title | Merged? | Fingerprint | Stage role | Happy? | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| #1 | Current exchange on chat stage | yes | feat/ | Impl/UI | Mixed | Scoped UI; risk of corpus dump (happy-paths AH5) |
| #2 | Vercel AI Gateway fallback | yes | feat/ | Impl | Partial | Escape hatch |
| #3 | Prove Git production auto-deploy | yes | chore/ | Verify probe | Happy | Intentional verify/ship probe |
| #4 | Questionnaire span metadata | yes | feat/ | Observability | Happy | Scoped |
| #5 | Northflank staging | yes | **codex/** | Infra | Mixed | Durable staging; host landmine → #6 |
| #6 | Vercel Chat OIDC boot | yes | fix/ | Verify→ship hotfix | **Happy** | Tiny; session `b06e3da7` **verified** join |
| #7 | Learner motion / dock | yes | feat/ | UI impl | **Fail-ish** | Large + unchecked checklist; `357a2e9e` thrash **inference** |
| #8 | Phase 1 session cookie | yes | **cursor/** | Plan→spec→ship | **Happy** | Outcome/Proof/Not-in-PR; FM-PRREV PASS |
| #9 | Phase 2 encrypted store | yes | **cursor/** | Phase | **Happy** | Library-first; FM-PRREV PASS |
| #10 | Phase 3 hotel-safety proof | yes | **cursor/** | Spec→verify→review | **Happy-ish** | Strong plate; FM-PRREV **CONCERN** residual |
| #11 | Wire stored OpenAI keys | yes | **cursor/** | Impl follow-up | **Happy** | After #10; fail-closed missing key |
| #12 | gpt-5-nano BYOK | yes | **cursor/** | Impl tweak | **Happy** | Small model pick |
| #13 | Flue instanceId OpenAI select | yes | **cursor/** | Fix | **Happy** | Identity wiring |
| #14 | Fail closed missing instance id | yes | **cursor/** | Governance | **Happy** | Deletes sniff fallback |
| #15 | Phase 4 OpenRouter PKCE | **open** | **cursor/** | In-flight | Watch | Plate+proof; don’t widen mid-flight |

### Gold vs avoid

- **Gold:** `#8→#9→#10→#11→#14` (+ `#6` hotfix; `#3` probe).  
- **Avoid as loop health:** `#7` + IDE thrash cluster; EVT-0001.  
- **Do not cite as fail:** `#11–#14` (v1.1 error — corrected).

### Session joins

| Join | Status | Evidence |
| --- | --- | --- |
| `b06e3da7` ↔ `#5`/`#6` | **Verified** (pilot lifecycle commit lines) | Axis A #1 |
| `357a2e9e` ↔ `#7` | Inference (commit window includes merge #7) | Thrash poster |
| `#8–#15` ↔ IDE parents | **Unavailable** | Cloud-agent only; pack soft-join empty |

---

## 11. Per-stage `/goal` templates (copy-paste)

Repo for all: `https://github.com/jon-devlapaz/socratink` — never guess.

### 11.1 Research (Scout)

```text
/goal Produce a report-only answer to: <question>. No code changes.
Repo: jon-devlapaz/socratink
Done-when: report at reports/<id>.md with sources, unknowns, and a recommended next /goal OR explicit stop.
Fences: no PR, no push, no “quick fix,” no scope into product features.
Not-in-this-PR: N/A (no PR).
Stop: when unknowns are listed and recommendation is one sentence.
```
*Exemplar:* Skill Scout W6; factory Scout tasks.

### 11.2 Plan

```text
/goal Name the next shippable phase for <theme> as one outcome sentence plus fences.
Repo: jon-devlapaz/socratink
Done-when: written plate with phase name, Outcome, Not-in-this-PR list, and named proof command — captain-ready to paste into Ship.
Fences: one phase only; no implementation in this step.
Stop: when plate is paste-ready; do not start coding.
```
*Exemplar:* Phase titles on `#8–#15`.

### 11.3 Spec

```text
/goal Specify the contract that proves <invariant> (e.g. overlapping Chat streams cannot mix learner keys).
Repo: jon-devlapaz/socratink
Done-when: named test file/path + pass criteria a stranger can run; production gaps listed as Out of scope.
Fences: no UI paste product; no Flue rewrite unless named.
Proof: pnpm test:<slice> must be inventable from the spec alone.
Stop: when Done-when is falsifiable.
```
*Exemplar:* `#10` `test:learner-key` before/with impl.

### 11.4 Impl

```text
/goal <one observable outcome matching the phase plate>
Repo: jon-devlapaz/socratink
Done-when: branch pushed; diff matches Outcome only; nearest contracts green locally.
Constraints: smallest owner; match AGENTS.md; no drive-by refactors.
Out of scope: <copy Not-in-this-PR>
On done: push branch only — no PR until adversarial-review.
```
*Exemplar:* `#8–#9` cloud agent; `#11` wire-after-proof.

### 11.5 Verify

```text
/goal Prove <invariant> with named commands; do not add features.
Repo: jon-devlapaz/socratink
Done-when: `pnpm test:<slice> && pnpm check && pnpm smoke` green; any live check listed as verified or explicitly Unverified.
Fences: no new product surface; no widening Not-in-this-PR.
Stop: when commands green or failure diagnosed once with a new plate.
```
*Exemplar:* `#3` probe; `#6` check; `#10`/`#14` contract lists.

### 11.6 Review

```text
/goal Independent review of PR #<n> against its Outcome/Proof claims.
Repo: jon-devlapaz/socratink
Done-when: severity-tagged findings (error/warning/info); explicit PASS / CONCERN / FAIL; residuals named.
Fences: review-only — no merge, no push, no “fix while reviewing.”
Stop: when verdict + counts delivered to Firstmate.
```
*Exemplar:* FM-PRREV-01 on `#8–#10` (CONCERN on `#10` is happy-path honesty).

### 11.7 Ship

```text
/goal Open/land PR for phase <name> with Outcome / Proof / Not-in-this-PR body.
Repo: jon-devlapaz/socratink
Done-when: PR URL recorded; adversarial-review clean of errors (concerns documented); captain merge decision captured.
Fences: no silent scope; no treating CONCERN as closed security proof without Firstmate note.
Stop: after merge or explicit park — next phase gets a new /goal.
```
*Exemplar:* `#8–#14` bodies; captain merge.

---

## 12. Right vs wrong cheatsheet (corrected)

| Signal | Right | Wrong |
| --- | --- | --- |
| Plate | Outcome + Not-in-this-PR (`#8–#14`) | Multi-issue / resume without rewrite |
| Phase order | Session → store → isolation proof → wire BYOK (`#8→#11`) | Wire BYOK before isolation **as the first proof** |
| Proof | Named contracts in body | Unchecked UI checklist (`#7`) |
| Agent form | Cloud agent + review | IDE thrash then large merge |
| Review | CONCERN recorded (`#10`) | Market CONCERN as closed hotel-safety |
| Follow-ups | `#11–#14` after `#10` | Pretend follow-ups were “failed closed PRs” |
| Stop | New `/goal` next phase | Widen Not-in-this-PR in-place |

---

---

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

## 14. Fail smells + stop rules (EXTRACT)

Format: **S###** · stage · smell · evidence · **STOP** · pairs-with nugget.

### Research

| ID | Smell | Evidence | STOP | ↔ Nugget |
| --- | --- | --- | --- | --- |
| S001 | Validation/trace/vet language expands into adjacent product | EVT-0001 / SRC-0010 · **V** | Freeze scope; write Scout report; new `/goal` only if build authorized | N001,N004 |
| S002 | Research VERIFY widens discovery mid-flight | Anti-Skill-Scout | Checkpoint; ≤3 finalists; no new search ladder without ask | N002 |
| S003 | Finish campaign generations after negative result | Praxist · **V** | Stop campaign; dated `.agents/learnings/`; do not “complete gens” | N003 |

### Plan / intake

| ID | Smell | Evidence | STOP | ↔ Nugget |
| --- | --- | --- | --- | --- |
| S010 | No one-sentence Outcome / Goal Prompt | Mine proofish 5/45; multi-issue `c2a77998` · **V** | Refuse boot; demand `/goal` | N010,N014,N015 |
| S011 | Missing Not-in-this-PR; scope creeps in-diff | Contrast `#8–#11` vs thrash · **I** | Diff review vs plate; cut or new PR | N011,N032,N062 |
| S012 | Skip phase order (wire before prove) | Doctrine; `#10` before `#11` is correct · **V** | Reorder: proof PR first | N012,N023 |
| S013 | “Continue where Codex left off” alone | `b06e3da7`,`316e90d5` · **V** | Rewrite plate from repo; ban bare resume | N013 |
| S014 | “I trust you” / away without restated plate+proof | `a09316e9` · **V** | Paste plate; name proof; no trust-away | N010 |
| S015 | Skill dump before Outcome | `c585e8d6`,`df80810e`,`2fb70153` · **V** | Outcome first; skills load-on-demand | N010 |

### Spec

| ID | Smell | Evidence | STOP | ↔ Nugget |
| --- | --- | --- | --- | --- |
| S020 | No named contract / check | Pilot missing_verification 14/50 · **V** | Invent `pnpm test:<slice>` before more impl | N020 |
| S021 | Spec is UI wish, not falsifiable invariant | `#7` checklist culture · **I** | Rewrite Outcome as observable invariant | N021 |
| S022 | Claim live proof while Unverified empty | FM-PRREV `#10` risk · **V** | Mark Unverified or run live; no overclaim | N022,N044 |

### Impl

| ID | Smell | Evidence | STOP | ↔ Nugget |
| --- | --- | --- | --- | --- |
| S030 | Path thrash: ≥5 Read/StrReplace same file without green gate | `b23609bb` 1770; `357a2e9e` 126× styles; `a09316e9` · **V** | **Tripwire:** stop; restate plate; change one variable | N030,N043 |
| S031 | Merge-bound work only in long IDE thrash | Contrast `#8–#14` cloud · **I** | Hand to Ship/cloud with plate | N031,N063 |
| S033 | Identity sniff / fail-open to operator key | Pre-`#14` · **V** | Fail closed; parse `instanceId` only | N033 |
| S034 | Agent merges or force-pushes | Policy · **V** | Captain only | N034 |
| S035 | Known host landmine merged without hotfix plate | `#5`→prod 500 · **V** | Immediate narrow `#6`-shaped fix | N035 |
| S036 | Giant unrelated corpus in product PR | `#1` +90k skills · **V** | Split corpus vs behavior PRs | N030 |
| S037 | `.gitignore` → `/tmp` prototype product | `f4d88dd4` · **V** | Kill prototype; new scoped `/goal` | N001 |

### Verify

| ID | Smell | Evidence | STOP | ↔ Nugget |
| --- | --- | --- | --- | --- |
| S040 | Unchecked browser checklist as “test plan” | `#7` · **V** | Require named commands green or cut scope | N040,N060 |
| S042 | Proof not wired into `check` | Pre-contract PRs · **I** | Add test to check when claiming invariant | N042 |
| S044 | Market CONCERN as closed hotel-safety | FM-PRREV `#10` · **V** | Firstmate residual note; follow-up `/goal` | N044,N052 |

### Review

| ID | Smell | Evidence | STOP | ↔ Nugget |
| --- | --- | --- | --- | --- |
| S050 | Self-review only on auth/BYOK | Absence vs FM-PRREV · **I** | Launch FM-PRREV / adversarial-review | N050,N051 |
| S053 | Fix-while-reviewing same agent | Anti-pattern · **V** doctrine | Fresh reviewer; separate fix agent | N053 |
| S054 | User “we need to change this” mid-thrash | `3f9a6631` · **V** | Hard stop; new plate | N014 |

### Ship / stop

| ID | Smell | Evidence | STOP | ↔ Nugget |
| --- | --- | --- | --- | --- |
| S061 | Local merge without captain | Policy · **V** | Wait Firstmate/captain | N061 |
| S064 | One-more-polish after proof green | Stop-on-proof failures · **I** | Stop; open next `/goal` | N064 |
| S065 | Axis A high + thrash ⇒ treat as healthy loop | `b23609bb`,`a09316e9` top Axis A · **V** | Score loop health separately (tripwires) | N043,N063 |

### Observability

| ID | Smell | Evidence | STOP | ↔ Nugget |
| --- | --- | --- | --- | --- |
| S070 | Invent IDE session IDs for cloud PRs | Happy-paths gap · **V** | Use `bcId`/PR only; fix packs to ingest | N070 |
| S071 | Sprawl boot without packet (outcome/cwd/proof/stop) | `e8a25b04`,`64cfb0da` · **V** | Refuse subagent; demand packet | N013 |

---

## 15. Happy ↔ smell pairs (quick index)

| Happy | Smell | One-line rule |
| --- | --- | --- |
| N001/N004 | S001 | Scout ≠ build |
| N002 | S002 | VERIFY does not widen |
| N010/N015 | S010/S014/S015 | Outcome before tools/skills/trust |
| N011/N032/N062 | S011 | Follow-up PR > widen |
| N012/N023 | S012 | Prove then wire |
| N013 | S013/S071 | Rewrite plate / packet |
| N020/N040 | S020/S040 | Named commands or stop |
| N030 | S030/S036 | Small owner; tripwire thrash |
| N031/N063 | S031 | Cloud Ship for merges |
| N033 | S033 | Fail closed |
| N035 | S035 | Same-day narrow hotfix |
| N044/N052 | S044 | CONCERN tracked ≠ closed |
| N050 | S050 | Fresh review on auth |
| N060/N061 | S061/S064 | Plate body; captain; stop-on-proof |
| N070 | S070 | `bcId` join for `#8–#15` |
| — | S065 | Axis A ∩ thrash ≠ healthy |

---

## 16. Captain pocket card — daily top 10 (BURN)

Carry these ten. Full catalogs remain §13–§15.

### Do (N*)

| # | ID | Daily rule | Evidence |
| --- | --- | --- | --- |
| 1 | **N010** | One Outcome sentence before tools | `#8–#11` bodies |
| 2 | **N040** | Proof = named commands you ran | `#8–#11`, `#14–#15` |
| 3 | **N011** | Not-in-this-PR list; follow-up PR > widen | `#10` then `#11` |
| 4 | **N030** | Smallest owner / tiny causal fix | `#6`, `#13`, `#14` |
| 5 | **N020** | Name the contract (`test:…`) with the slice | `#9–#11`, `#14` |
| 6 | **N050** | Fresh FM-PRREV / adversarial on auth-BYOK | FM-PRREV-01 |
| 7 | **N044** | Record CONCERN; don’t market as closed | `#10` |
| 8 | **N031** | Merge-bound → cloud `cursor/…` Ship | `#8–#14` |
| 9 | **N001** | Scout = report-only | Factory Scout / W6 |
| 10 | **N062** | Next phase = new `/goal` | `#8→#15` chain |

### Don’t / STOP (S*)

| # | ID | Tripwire | STOP |
| --- | --- | --- | --- |
| 1 | **S030** | ≥5 same-file Read/StrReplace without green gate | Stop; replate; one variable |
| 2 | **S010** | No Outcome / Goal Prompt | Refuse boot |
| 3 | **S040** | Unchecked UI checklist as proof | Named commands or cut |
| 4 | **S001** | Trace/vet/dogfood → adjacent product | Scout report; no build |
| 5 | **S014** | “I trust you” / away without plate+proof | Paste plate |
| 6 | **S013** | Bare “continue Codex” | Rewrite plate from repo |
| 7 | **S044** | CONCERN sold as closed hotel-safety | Residual ticket + Firstmate |
| 8 | **S031** | Merge-bound only in IDE thrash | Hand to Ship/cloud |
| 9 | **S065** | High Axis A + thrash = “healthy” | Score loop health separately |
| 10 | **S070** | Fake IDE session IDs for `#8–#15` | Join via `bcId`/PR only |

### One-liner

`/goal` + proof + stop → thrash tripwire → auth gets review → captain merges → new `/goal` next phase.

---

## 17. Burn addendum (2026-09-15 20:55 CT)

- Structural mines: **45 → 65** (+20 from remaining socratink-preferring home-live parents; 87 candidates still unused).  
- Plate-ish **42/65**; proofish **6/65** (proof intake still rare).  
- Thrash leaders unchanged: `b23609bb` 1770 · `a09316e9` 1384 · `357a2e9e` 915.  
- New shorts added (sample): `e327eaae`, `bbdb37b2`, `7fe3a487`, `45147840`, … (full list in mine `burn_addendum.added_shorts`).  
- Mine artifact updated: `agenteng-runs/loops-v2-session-mine.json`.  
- Researchy H*/T* packs remain complementary — this burn does not thin-overwrite them.  
- No Brain mutation. Idle OK after this addendum unless Captain asks another pass.

## Assumptions / open / could not check

- Plate keyword mine undercounts non-English or late-thread plates; overcounts skill-attachment boilerplate that mentions “goal.”  
- High tool counts include legitimate exploration — triage with max_repeat + user correction + missing_verify.  
- `#8–#15` session joins unavailable from home-live (verified gap).  
- Could not re-run live Jev API this pass — reused pilot `scores.json`.  
- List-PRs `merged` field can disagree with `pull_request_read`; prefer the latter.

## Artifacts

- This annex: `product/socratink/research/chat-signal/FM-AGENTENG-01-loops.md`  
- Factory mirror: `/home/box/agent-data/grok-ship/reports/FM-AGENTENG-01-loops.md`  
- Mine: `…/agenteng-runs/loops-v2-session-mine.json` (+ factory `loops-v2-session-mine.json`)  
- Sibling (do not delete): `FM-AGENTENG-01-happy-paths.md`  
- Extract lift: `FM-AGENTENG-01-extract.md` (N*/S* catalogs; pocket card lives in annex §16)
