# FM-AGENTENG-01 — EXTRACT catalogs (nuggets + smells)

- **As-of:** 2026-09-15 20:55 CT
- **Source annex:** FM-AGENTENG-01-loops.md v2.2 BURN
- **Mode:** research-only lift sheet

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

