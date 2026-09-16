# Smell catalog — densest (FM-AGENTENG-01)

- **As-of:** 2026-09-15 ~21:35 CT
- **Canonical IDs:** Loops **v2.1 EXTRACT** **S*** (30 rows, IDs through S071) + STOP rules
- **Densest merge policy:** Loops S* primary. Researchy T1–T26 full appendix preserved (not thinned).
- **Backups:** `smell-catalog-dense.md.bak-researchy-20260915-2132`
- **Gold/anti:** `#8–#14` (+`#6`); anti `#7`+EVT-0001

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

## Net-new T* vs Loops S* (overlap-filtered)

**26** of 26 Researchy T rows.

| ID | Smell | Description |
| --- | --- | --- |
| T1 | **Validation-driven scope substitution** | Dogfood/vet/scientific/trace language treated as license to build a larger adjacent product instead of strengthening proof. |
| T2 | **Tool thrash / path thrash** | Same Read/StrReplace/Shell signature repeated ≥3–10× (or ≥5 edit cycles on one file) without a green gate or progress. |
| T3 | **Lost goal / plate drift** | Session leaves stated cwd/outcome; stacks jobs mid-thread; multi-issue opener without one observable outcome. |
| T4 | **Ignored standing instructions** | AGENTS.md / skills / worktree guard / thrash tripwires not applied despite being in context or expected. |
| T5 | **Wrong cwd / worktree gap** | Fresh worktree missing node_modules; commit hooks fail; wrong repo/cwd; identical re-commit-fail. |
| T6 | **Context stuffing / prompt bloat** | Huge attached skills, external_links, parent history, or AGENTS dumps into agent window before a single outcome sentence. |
| T7 | **Missing verification** | Claims done / mergeable without proving the named observable outcome; unchecked UI checklists treated as verify. |
| T8 | **Hallucinated / assumed state** | Acts as if files, ports, prior results, env, or host config exist without ls/prove. |
| T9 | **Multi-agent / handoff rot** | Subagent inherits parent assignment; side-chat boundary ignored; sprawl boot without packet brief (outcome/cwd/proof/stop). |
| T10 | **Premature stop / recovery failure** | Retries same failing command; no diagnose→fix→retry; or stops without proof / campaigns continue after negative result. |
| T11 | **Secret / exfil risk** | Raw transcripts, credentials, .env, or ambient secrets pulled into context, tool args, or reports. |
| T12 | **Learning-context / information overload** | Too much unpruned context degrades effectiveness (operator parallel to product Learning-Context Rot). |
| T13 | **Over-trust / away prompt** | Captain says “I trust you” / leaves without restated plate+proof; agent continues without falsifiable done-when. |
| T14 | **Resume / harness handoff without plate rewrite** | “Pick up where Codex/Cursor left off” without rewriting /goal+proof from current repo truth. |
| T15 | **Weak / missing plate at intake** | No one-sentence Outcome, fences, proof, or stop at session start; plate_quality ~0–1 on 0–3 scale. |
| T16 | **Governance / jurisdiction gap** | Brain≠code≠harness crossed; merge without captain; Scout edits; Brain mutation mid-task; roster/policy drift. |
| T17 | **Proof theater (unit path ≠ production path)** | Green unit/contract treated as closed production/security proof while instrument path residual remains. |
| T18 | **Merge with known host landmine** | Merge despite called-out host/env fail-closed risk; production break follows. |
| T19 | **Giant unrelated corpus in product PR** | Skill/corpus catch-up dominates product behavior diff (+tens of k lines) burying the real change. |
| T20 | **Campaign completionism after negative result** | Continue generations/phases after evidence shows no parent-eligible outcome; finish-the-plan over stop-on-proof. |
| T21 | **Cloud-agent observability / session-join gap** | Merge-bound cloud work invisible to chat-signal packs (no local IDE jsonl; empty pr_urls/bcId ingestion). |
| T22 | **CI / host env gap** | Ship/infra change without adequate host-env verification; CI/green local ≠ production config. |
| T23 | **Orchestration ceremony without proof (packet/LEDGER)** | Packet tables / LEDGER / sprawl boot language substitutes for named outcome proof. |
| T24 | **UI size-without-proof ship** | Large UI PR merges with unchecked browser checklist and thrash-overlapping sessions. |
| T25 | **Research VERIFY widens discovery** | Research/Scout VERIFY step opens new search ladder mid-flight instead of checkpointing ≤3 finalists. |
| T26 | **Fast-wrong velocity (speed without quality)** | Velocity∩quality band fast_wrong: moves quickly on wrong plate/scope. |

## Net-new from Jev packs

- Codex strata n=80/80, mean plate_quality≈1.12; gaps {'thrash': 4, 'none': 44, 'missing_verify': 5, 'context_bloat': 8, 'governance': 17, 'over_trust': 1, 'handoff_rot': 1}.
- Cursor parents v3 n=132/132, mean plate≈1.1175757575757579; gaps {'thrash': 42, 'over_trust': 6, 'handoff_rot': 8, 'governance': 8, 'missing_verify': 9, 'scope_sub': 8, 'none': 45, 'context_bloat': 1, 'weak_plate': 5}.
- PR Jev n=15/15; gold #8–#14 primary_failure=none; #11–#14 merged happy; prefer over Loops v1 §10.3 mislabel.


---

## Appendix — Researchy dense T* catalog (full, not thinned)

# Smell catalog — dense (exhaustive EXTRACT)

- **As-of:** 2026-09-15 20:55 CT
- **Job:** FM-AGENTENG-01 Researchy EXTRACT · research-only · no PR · no SendToUser
- **Extends:** CTXSMELL T1–T12 + Loops F1–F10 + Nole G1–G4 + PR-anti P1–P4 + strata/Codex/WM/sprawl extensions T13–T26
- **Sources:** FM-CTXSMELL-01 · FM-AGENTENG-01-loops · FM-AGENTENG-01-nole · happy-paths · sprawl-audit · strata-scores-v3.json · strata-scores.json · codex-strata-scores.json · wm-jev-scores.json · pr-jev-scores.json · smell-scores-v2.json

## Frequency legend (do not vanity-%)

| Pack | n | Primary partnership / related gaps |
| --- | ---: | --- |
| **strata-scores-v3** (primary) | 132 | thrash=42, missing_verify=9, handoff_rot=8, scope_sub=8, governance=8, over_trust=6, weak_plate=5, context_bloat=1, none=45 |
| strata-scores biased | 59 | thrash=41, scope_sub=5, missing_verify=4, governance=3, context_bloat=2, handoff_rot=1, over_trust=1, weak_plate=1, none=1 |
| codex-strata-scores | 80 | none=44, governance=17, context_bloat=8, missing_verify=5, thrash=4, over_trust=1, handoff_rot=1 · verify_ok no=68 · mean_plate=1.125 |
| pilot smell-scores-v2 | 50 | primary: thrash=39, stuffing=3, halluc=3, lost_goal=2, ignored=2, handoff=1 · Noul p≥0.65 missing_verification=14 |
| WM stuffed (wm-jev) | 20 | estimate stuffed=8 mixed=7 load-on-demand=5 · Jev stuffed p≥0.65=10 p≥0.90=8 |
| sprawl-audit session hits | — | subagent-sprawl=18, side_chat_boundary=10, grok-spark-code-sprawl=6, LEDGER=20, packet=33 |
| PR Jev #1–#15 | 15 | primary_failure: none=9, missing_verify=4, scope_sub=1, ci_gap=1 |

**Bands (strata-v3):** slow_thrash=24, careful_good=65, fast_good=28, fast_wrong=6, unclear=9 · mean_plate≈1.118
**Bands (biased n=59):** slow_thrash=37, careful_good=8, fast_good=8, fast_wrong=6

**Caveat:** Smell-biased n=59 overstates thrash vs population; use v3 n=132 for triage base. Codex size-biased (top 80 by bytes). Frequencies are for design, not universal law.

---

## Exhaustive smell rows

| ID | Name | Definition | Evidence (session/PR/EVT) | Frequency signal | Captain fix | Agent fix | Severity |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T1 | **Validation-driven scope substitution** | Dogfood/vet/scientific/trace language treated as license to build a larger adjacent product instead of strengthening proof. | EVT-0001 / SRC-0010 / PROC-0002 (2026-08-24): Braintrust trace ask → ~3.5k learner-evidence product → revert. Session f4d88dd4 (.gitignore→/tmp prototype). PR #1 scope_sub (Jev). | strata-v3 n=132 scope_sub=8; biased n=59 scope_sub=5; PR primary_failure scope_sub=1/15; pilot wrong_scope Noul 9/50 @p≥0.65 | Separate proof words from build words; dogfood/vet → checks only. One-sentence plate + Not-in-this-PR fences before any expansion. | Treat Brain milestones as constraints not alternate jobs. If validation language appears, strengthen named proof — never open a second product surface. | severe |
| T2 | **Tool thrash / path thrash** | Same Read/StrReplace/Shell signature repeated ≥3–10× (or ≥5 edit cycles on one file) without a green gate or progress. | Sessions b23609bb (1770 tools; 93× chat-surface Read), 357a2e9e (126×/124× styles.css), a09316e9 (57×/49×), 3f9a6631 (15× Read fatal), fae4006d (16× StrReplace). | strata-v3 thrash=42/132 (slow_thrash band=24); biased thrash=41/59 (slow_thrash=37); codex thrash=4/80; pilot primary tool_thrash=39/50; det ≥3 identical sigs 45/50 | Interrupt if same file edited >~5 cycles without gate; rewrite plate. Prefer Ship/cloud for merge-bound work. | Cap re-reads: ≥3 same path in a phase → summarize lack or ask. ≥3 identical tool sig → diagnose→change one variable→retry once. Never identical retry loops. | severe |
| T3 | **Lost goal / plate drift** | Session leaves stated cwd/outcome; stacks jobs mid-thread; multi-issue opener without one observable outcome. | c2a77998 multi-issue validate/fix; f5892573 lost_goal risk when goals stack; pilot lost_goal primary=2; Jev context_lost 4/50. | strata-v3 weak_plate=5 + scope_sub=8 co-travel; biased weak_plate=1; pilot lost_goal=2 primary / context_lost Noul 4/50; loops mine first-user goalish 5/20, proof words 0/20 | Paste one-sentence plate at top of every follow-up. Ban multi-issue openers. | Write requested observable outcome in one sentence first; refuse to start second job without new plate. | material |
| T4 | **Ignored standing instructions** | AGENTS.md / skills / worktree guard / thrash tripwires not applied despite being in context or expected. | Jev ignored_standing_instructions 2/50; 64cfb0da high ignored-instructions + wrong-scope; product AGENTS already forbids claim-without-proof but still fires. | pilot ignored_instructions primary=2/50; ignored_standing Noul 2/50 @p≥0.65 (1 @p≥0.75); strata governance gap (related) v3=8 biased=3 codex=17 | Keep AGENTS short; load-on-demand postmortems. Ask for verified/inference/unknown labels. | Read smallest owner instructions (AGENTS, ZEN, matching skill) before broad search. Obey thrash/worktree tripwires. | material |
| T5 | **Wrong cwd / worktree gap** | Fresh worktree missing node_modules; commit hooks fail; wrong repo/cwd; identical re-commit-fail. | TUI documents-refactoring postmortem 2026-06-28: missing node_modules / eslint not found on fresh worktree commit. | Incident-class (TUI 2026-06-28); not a top strata primary label but co-travels with thrash/recovery; Magentic-One inefficient-navigation external support | Document pnpm install --frozen-lockfile before first commit in new worktrees. | New worktree ⇒ install deps before first commit/hook. Fix cwd before retrying failing commit. | material |
| T6 | **Context stuffing / prompt bloat** | Huge attached skills, external_links, parent history, or AGENTS dumps into agent window before a single outcome sentence. | Sessions c585e8d6, df80810e, 2fb70153, 29896b44 (WM stuffed_score 6–8, Jev stuffed_p≥0.90); e8a25b04 parent dump; PR #1 +90k skill corpus; Nole: 654L steve-jobs-perspective, 8040-char Firstmate desc, 277L AGENTS. | WM n=20 estimate stuffed=8 mixed=7 load-on-demand=5; WM stuffed p≥0.65=10/20 p≥0.90=8/20; strata-v3 context_bloat=1; biased=2; codex context_bloat=8/80; pilot context_stuffing primary=3/50 | Prefer load-on-demand docs; detach skills until plate set; split skill-corpus PRs from product behavior PRs. | Load smallest high-signal context; do not maximize window; refuse sprawl boot with parent transcript dump. | material |
| T7 | **Missing verification** | Claims done / mergeable without proving the named observable outcome; unchecked UI checklists treated as verify. | Pilot missing_verification 14/50; PR #7/#2/#6/#15 missing_verify; #10 CONCERN unit≠instrument path; #5→#6 landmine after merge. | strata-v3 missing_verify=9/132; biased=4/59; codex=5/80 (+ verify_ok no=68/80); PR primary_failure missing_verify=4/15; pilot Noul 14/50 | Require named proof commands in every Ship brief; treat CONCERN as tracked residual not closed security marketing. | Stop only when stated outcome proven with named pnpm test/check/smoke (or honest Unverified). Never claim live Chat from unit wrap alone. | severe |
| T8 | **Hallucinated / assumed state** | Acts as if files, ports, prior results, env, or host config exist without ls/prove. | Pilot primary hallucinated_state=3/50; top rank 64cfb0da@1fee4c severity 2.76 fatal; PR #5 assumed Vercel DATABASE_URL safe despite merge-gate warning. | pilot primary hallucinated_state=3/50; PR ci_gap/landmine #5; AgentRx external Invention-of-New-Information support | Demand evidence class labels; after costly fail require dated learning before retry. | ls/prove file/port/env first. Never assume prior tool results (Cursor jsonl lacks tool_result payloads). | severe |
| T9 | **Multi-agent / handoff rot** | Subagent inherits parent assignment; side-chat boundary ignored; sprawl boot without packet brief (outcome/cwd/proof/stop). | e8a25b04, 64cfb0da repeated boot.py; side_chat_boundary cluster; sprawl-audit subagent-sprawl 18 sessions; Nole sand-subagent ~65MB pile. | strata-v3 handoff_rot=8/132; biased=1/59; codex=1/80; sprawl-audit subagent-sprawl=18 side_chat=10 grok-spark-code-sprawl=6; pilot multiagent_handoff_rot primary=1/50 | When spawning workers, restate packet only; require outcome/cwd/proof/stop fields; refuse boot if missing. | Obey side-chat boundaries; parent history is reference only. Fresh brief packet per subagent. | material |
| T10 | **Premature stop / recovery failure** | Retries same failing command; no diagnose→fix→retry; or stops without proof / campaigns continue after negative result. | TUI postmortem identical commit retry; Praxist 4× gens after gen0 negative; F8 resume without rewrite (b06e3da7, 316e90d5). | Incident + campaign class; recovery co-travels with thrash; loops F8/F10; AH7 campaign completionism | After ~2 failed corrections rewrite plate. After costly fail demand dated .agents/learnings/ before retry. | Diagnose → change one variable → retry once. Stall→replan not identical retry. Stop campaign on negative result. | material |
| T11 | **Secret / exfil risk** | Raw transcripts, credentials, .env, or ambient secrets pulled into context, tool args, or reports. | Workspace AGENTS privacy rules; Firstmate coding/cloud grants need narrow-gate (Nole); GitHub Copilot agentic security principles external. | Policy/control class (Nole Fix: narrow-gate Firstmate); not a strata primary_partnership_gap label; high severity when fires | Narrow-gate coding/cloud grants; least privilege; no ambient secrets in briefs. | Never put secrets, raw .env, or unrelated chat into tool args or reports. Redact transcripts. | severe |
| T12 | **Learning-context / information overload** | Too much unpruned context degrades effectiveness (operator parallel to product Learning-Context Rot). | Codex summary 2026-08-13 Information Window / Learning-Context Rot; Anthropic attention budget; Nole 277L AGENTS + perspective dumps. | Codex strata context_bloat=8/80 + mean plate=1.125; WM discipline mean~1.41/3 on stuffed exemplars; population plate mean v3~1.12 | Keep smallest set that enables next correct act; clear between unrelated tasks. | Do not maximize context; prune stale tool results; load-on-demand perspectives. | mild-material |
| T13 | **Over-trust / away prompt** | Captain says “I trust you” / leaves without restated plate+proof; agent continues without falsifiable done-when. | a09316e9 FreeLLMAPI production while Captain away; CTXSMELL trust-away; strata over_trust gap. | strata-v3 over_trust=6/132; biased=1/59; codex=1/80; loops F3 | Ban trust-away openers; always restate outcome+proof+stop before leaving. | If plate lacks proof/stop, halt and ask — do not interpret trust as license to widen. | material |
| T14 | **Resume / harness handoff without plate rewrite** | “Pick up where Codex/Cursor left off” without rewriting /goal+proof from current repo truth. | b06e3da7, 316e90d5 Codex resume intake risk (still may ship); loops F8. | Loops mine F8 exemplars; related to weak_plate (v3=5) and handoff_rot (v3=8) | Resume template: rewrite plate from repo state; ban continue-alone. | On resume: rewrite plate from current truth before tools; inherit thread as context not goal. | material |
| T15 | **Weak / missing plate at intake** | No one-sentence Outcome, fences, proof, or stop at session start; plate_quality ~0–1 on 0–3 scale. | strata-v3 mean_plate_quality≈1.12; weak_plate primary=5; loops 0/20 first messages with proof words; codex mean plate 1.125. | strata-v3 weak_plate=5/132 mean_plate≈1.118; biased weak_plate=1 mean~1.29 (v2); codex mean=1.125; population-wide plate problem | Refuse Ship/IDE>15min without /goal+proof+stop+fences. | Refuse boot for Ship if outcome/cwd/proof/stop missing. | material |
| T16 | **Governance / jurisdiction gap** | Brain≠code≠harness crossed; merge without captain; Scout edits; Brain mutation mid-task; roster/policy drift. | strata governance primary; codex governance dominant gap 17/80; Nole G1 roster; brain_jurisdiction_ok no=1/80 Codex. | strata-v3 governance=8/132; biased=3/59; codex governance=17/80 (top non-none Codex gap) | Captain merges; Scout report-only; no Brain mutation in coding jobs. | Respect jurisdiction split; push branch only; adversarial-review before PR; never merge. | material |
| T17 | **Proof theater (unit path ≠ production path)** | Green unit/contract treated as closed production/security proof while instrument path residual remains. | FM-PRREV CONCERN on PR #10 hotel-safety; happy-paths AH3; PR bodies with unchecked live Chat. | PR #10 CONCERN (gold chain still honest if residual tracked); missing_verify cluster PR 4/15; T7 specialization | Record CONCERN + residual instrument-path risk; don't market as closed security. | Name Unverified live paths explicitly; never equate unit wrap with live Chat proof. | severe |
| T18 | **Merge with known host landmine** | Merge despite called-out host/env fail-closed risk; production break follows. | PR #5 Northflank merge gate warned Vercel DATABASE_URL → production 500 → PR #6 OIDC hotfix same day. | PR primary_failure ci_gap=1/15 (#5); happy-paths AH4 | Block merge on known host landmines; or ship narrow fix first. | Surface merge-gate risks as blocking errors in adversarial-review; do not soft-warn then ship. | severe |
| T19 | **Giant unrelated corpus in product PR** | Skill/corpus catch-up dominates product behavior diff (+tens of k lines) burying the real change. | PR #1 +90343/−1061 skill corpus dominates UI change; happy-paths AH5; Jev scope_sub + low happy_path_fit p=0.27. | PR #1 anti-happy; related T6/T1; WM stuffed sessions c585e8d6/df80810e near #1–#3 window | Split skill-corpus PRs from product behavior PRs. | Smallest owner; match /goal only; no drive-by corpus dumps in product PRs. | material |
| T20 | **Campaign completionism after negative result** | Continue generations/phases after evidence shows no parent-eligible outcome; finish-the-plan over stop-on-proof. | Praxist postmortem 2026-08-30: 4 gens after gen0 showed no parent-eligible; happy-paths AH7; extract S003. | Campaign-class; pairs with T10; not a strata primary label | Negative result → dated learning → stop rule; do not finish gens. | Stop campaign; write .agents/learnings/; new /goal only if re-authorized. | material |
| T21 | **Cloud-agent observability / session-join gap** | Merge-bound cloud work invisible to chat-signal packs (no local IDE jsonl; empty pr_urls/bcId ingestion). | PRs #8–#15 zero local session hits; cursor/* + Cursor Agent author + bc- footers; AH6; cloud-bc-pr-scan.json. | 7+ cloud PRs (#8–#15) join-Unavailable from home-live; packs empty pr_urls | Populate pr_urls / bcId into session packs; cloud-agent capture lane. | Join cloud work via PR body + bcId + commits — never force false IDE session IDs. | mild-material |
| T22 | **CI / host env gap** | Ship/infra change without adequate host-env verification; CI/green local ≠ production config. | PR #5 ci_gap primary_failure; #5→#6 production break; PR Jev verify_ok low on ship infra. | PR primary_failure ci_gap=1/15; co-travels T7/T8/T18 | Named host proof for infra PRs; fail-closed defaults. | Prove boot path on target host class before merge language. | severe |
| T23 | **Orchestration ceremony without proof (packet/LEDGER)** | Packet tables / LEDGER / sprawl boot language substitutes for named outcome proof. | sprawl-audit: packet=33 LEDGER=20 session hits; H3 ceremony>outcome inference; e8a25b04 boot.py repeats. | sprawl-audit packet=33 LEDGER=20 subagent-sprawl=18; co-travels T9/T6 | Require outcome fields on packets; ceremony ≠ done. | Refuse boot if outcome/cwd/proof/stop missing; LEDGER is audit not proof. | mild-material |
| T24 | **UI size-without-proof ship** | Large UI PR merges with unchecked browser checklist and thrash-overlapping sessions. | PR #7 learner motion +1506; session 357a2e9e 915 tools; Jev happy_path_fit p=0.20 verify p=0.23 missing_verify. | PR anti-happy #7; thrash sessions overlapping Aug 28–29 ship window | Require named contract or honest Unverified; thrash tripwire before merge-bound UI. | Stop-on-proof; unchecked UI checklist ≠ verify. | material |
| T25 | **Research VERIFY widens discovery** | Research/Scout VERIFY step opens new search ladder mid-flight instead of checkpointing ≤3 finalists. | Anti-Skill-Scout; extract S002; Skill Scout workflow forbids widen. | Doctrine class (Skill Scout); research lifecycle strata-v3 research=34 stages | Checkpoint; ≤3 finalists; no new search without ask. | VERIFY does not widen; dual checkpoint before opt-in web. | mild-material |
| T26 | **Fast-wrong velocity (speed without quality)** | Velocity∩quality band fast_wrong: moves quickly on wrong plate/scope. | strata-v3 fast_wrong=6; biased fast_wrong=6; contrast careful_good/fast_good. | strata-v3 fast_wrong=6/132; biased=6/59; codex has 0 fast_wrong (careful_good=71) | Prefer careful_good/fast_good; interrupt fast_wrong with plate rewrite. | Speed only after plate+proof set; else slow down to verify. | material |
| F1 | **UI file thrash without gate** | Extreme Read/StrReplace on chat-surface.ts / styles.css / organic-sphere without green gate. | b23609bb, 357a2e9e, a09316e9, 3f9a6631; maps→T2 | Dominant thrash exemplars inside strata thrash=42 and biased thrash=41; pilot tool_thrash=39/50 | Stop after 5 edit cycles on UI owners; rewrite plate. | Targeted tsc/check gate in-loop; stop-on-proof (contrast 430c4785). | severe |
| F2 | **Clear goal, no stop-on-proof** | Strong destructive/clear fence but continues edits without named green gate. | fae4006d vs contrast 430c4785; maps→T2+T7 | Loops F2; co-travels missing_verify | Plate must name green gate. | Stop when proof green for /goal only. | material |
| F3 | **Trust / away prompt** | Alias of T13 in loop taxonomy. | a09316e9; maps→T13/T7/T3 | strata over_trust v3=6 | See T13. | See T13. | material |
| F4 | **Scope substitution / adjacent product** | Alias of T1 in loop taxonomy. | EVT-0001; maps→T1 | scope_sub v3=8 biased=5 | See T1. | See T1. | severe |
| F5 | **Multi-issue pile-on** | Multiple issues in one opener without one-sentence outcome. | c2a77998; maps→T3 | lost_goal/wrong_scope cluster | One sentence outcome only. | Refuse multi-issue without prioritized single plate. | material |
| F6 | **Handoff sprawl** | Alias of T9 in loop taxonomy. | e8a25b04, 64cfb0da; maps→T9 | handoff_rot v3=8; sprawl 18 | See T9. | See T9. | material |
| F7 | **Gitignore → prototype expansion** | Tiny ask expands into /tmp prototype thrash campaign. | f4d88dd4; maps→T1+T2 | Scope jump exemplar inside scope_sub+thrash | .gitignore ask ≠ prototype campaign. | Stay on named outcome; no /tmp product campaign from tiny ask. | material |
| F8 | **Resume without rewrite** | Alias of T14 in loop taxonomy. | b06e3da7, 316e90d5; maps→T14 | See T14 | See T14. | See T14. | material |
| F9 | **Skill stuffing at intake** | manually_attached_skills / external_links before outcome sentence. | c585e8d6, df80810e, 2fb70153; maps→T6 | WM stuffed 8/20 estimate; stuffed_p≥0.90 includes these | Detach skills until plate set. | Load-on-demand after plate. | material |
| F10 | **Missing verification culture** | Culture-level T7: AGENTS forbids but sessions/PRs still claim without proof. | pilot 14/50; PR missing_verify 4/15; maps→T7 | See T7 | Enforce proof in PR body + Firstmate refuse handoff. | Honest Unverified > fake checklist. | severe |
| G1 | **Unnamed bots / roster governance** | Empty New Bot/New Agent profiles; ghost archived IDs; dead pins; off-sidebar named bots without section. | Nole: New Bot 0afca9ff + New Agent 9b1a1ad1 empty; 2/9 flagged; 18 archived / 16 ghosts; dead pins 5cd14cd6, 91a574c6. | box profiles 2/9 empty charter; sprawl-audit H4; strata governance co-travel | Named agents only; Cut empty; clean ghost roster; crew Nole/Job Assist deliberately. | Refuse to operate as unnamed New Bot; require charter. | mild-material |
| G2 | **Dual-source skill drift** | Same skill name in workflows vs grok-ship pack with diverged md5/frontmatter; workspace skill copies. | Nole twin diffs: adversarial-review, ahoy, lavish-session, project-management md5 mismatches; karpathy/thermo multi-copy. | 4 pack↔workflow twins diverged; 264 SKILL.md (~2.3MB) across harnesses | Single-source skills (pack canonical); workflows=checkout of pack. | Prefer pack path; do not fork skill text mid-task. | mild-material |
| G3 | **Dead capture / over-instrumentation** | Huge archived transcripts, unbounded audit-outbox, sand-subagent pile without TTL/outcomes. | transcript 1643d9f1=53MB archived; sand-subagent ~65MB/133 folders; audit-outbox 2.48MB. | Nole inventory verified sizes; T2/T9 co-travel | TTL transcripts; bound instrumentation; cold-archive dead capture. | Do not grow capture without outcome pointer. | mild |
| G4 | **Disk sprawl without outcomes** | Multi-GB QC/landing clones and duplicate scout trees without archive-before-clone habit. | Nole: ~3176MB QC/landing (pr2/3/4 + landing-page); legacy-scout vs app-scout dup 9MB each; CW assets ~20MB. | ~3176MB hot QC/landing verified; G4 habit archive-before-clone | Archive-before-clone; prune assets; one scout tree. | Do not clone full Next trees for QC without archive plan. | mild-material |
| P1 | **PR anti — UI without proof (#7)** | Large UI merge with unchecked browser checklist and thrash overlap. | PR #7; sessions 357a2e9e/b23609bb; maps→T24/F1/T7 | 1/15 anti-happy PR; missing_verify | Reject size-without-proof UI as merge path. | Named proof or Unverified; thrash stop. | material |
| P2 | **PR anti — EVT scope substitution** | Historical validation→product expansion; encoded tripwire. | EVT-0001/SRC-0010/PROC-0002; maps→T1/F4 | Highest-cost historical; scope_sub strata ongoing | Keep EVT tripwires in AGENTS. | Validation ≠ build authority. | severe |
| P3 | **PR anti — corpus-buried UI (#1)** | Product UI change buried under skill corpus. | PR #1; maps→T19/T6 | 1/15; +90k lines | Split corpus vs product PRs. | Smallest product owner only. | material |
| P4 | **PR anti — landmine merge (#5)** | Infra merge with known host risk. | PR #5→#6; maps→T18/T22 | ci_gap 1/15 | Block or fix-first. | Fail-closed host proof. | severe |

---

## Crosswalk (F/G/P → T)

| Alias | Maps to |
| --- | --- |
| F1 | T2 (UI specialization) |
| F2 | T2+T7 |
| F3 | T13 |
| F4 | T1 |
| F5 | T3 |
| F6 | T9 |
| F7 | T1+T2 |
| F8 | T14 |
| F9 | T6 |
| F10 | T7 |
| G1 | T16 (roster ops) |
| G2 | T6/T12 + skill governance |
| G3 | T9/T2 capture residue |
| G4 | disk ops extension |
| P1 | T24/F1/T7 |
| P2 | T1/F4 |
| P3 | T19/T6 |
| P4 | T18/T22 |

## Strata gap → smell ID map

| strata primary_partnership_gap | Smell IDs |
| --- | --- |
| thrash | T2, F1, F2 |
| missing_verify | T7, F10, T17, T24 |
| handoff_rot | T9, F6, T23 |
| scope_sub | T1, F4, F7, P2 |
| governance | T16, G1, G2 |
| over_trust | T13, F3 |
| weak_plate | T15, T3, T14 |
| context_bloat | T6, F9, T12 |
| none | (happy / careful_good contrast) |

## Artifact count

- **Smell rows in this catalog:** 44
- **T-core:** T1–T12 (12)
- **T-extended:** T13–T26 (14)
- **F-loops:** F1–F10 (10)
- **G-nole:** G1–G4 (4)
- **P-PR-anti:** P1–P4 (4)

## Companion files

- `happy-smell-pairs.md` — Happy nugget ↔ smell prevention pairs
- `smell-catalog-dense.json` — machine-readable same rows
- Mirror: `/home/box/agent-data/grok-ship/reports/`

