# FM-AGENTENG-01: Socratink founder-engineer 30/60/90 (human↔coding-agent partnership)

**As-of:** 2026-09-15 (America/Chicago, CT)  
**Ticket:** FM-AGENTENG-01  
**Audience:** Captain (agentic engineer building Socratink)

## Method

1. **Grok CLI:** Launched `~/.grok/bin/run-grok.sh --reasoning-effort xhigh -m grok-4.6 --always-approve -p "…"` (web search **not** disabled). Process produced **empty stdout/stderr**, hung ~3+ minutes with no usable output, then was killed on parent FINISH NOW. **Grok CLI did not succeed** (no quota SuperGrok message observed; no research text returned).
2. **Fallback (this brief):** Live **WebFetch / curl** of primary official pages + Socratink-local doctrine (`FM-CTXSMELL-01`, EVT-0001 / PROC-0002, TypeSafe / chat-signal seeds). Companion smell primaries: `2026-09-15-context-management-smells-primary-sources.md`.
3. **URL policy:** Every URL in the Sources table was HTTP-200 verified via WebFetch and/or curl on 2026-09-15. No Grok-fabricated URLs (none were returned). Claims labeled **Verified** / **Assumption** / **Unknown**.

**Product constraints (do not invent a different product):** Brain = epistemic truth; codebase = implementation; harness = orchestration; TypeSafe/Jev = typed judgments (Choice/Noul/Score), not free-text tutoring; Factory = Scout then Ship; EVT-0001 = validation-driven scope substitution; jurisdiction Brain ≠ code ≠ harness.

---

## Question

What should a founder-engineer optimizing human↔coding-agent partnership do in **30 / 60 / 90 days** for Socratink—covering plate design, verification gates, multi-agent brief quality, context load-on-demand, outer-loop `/goal` review stop rules, and skill-sprawl waste cuts—while defending against EVT-0001?

---

## Verified external levers (map → Socratink)

| ID | Lever (Verified) | Socratink mapping |
| --- | --- | --- |
| V1 | Context is a finite attention budget; prefer **smallest high-signal token set**; JIT retrieval over stuffing; compaction / notes / subagents for long horizon | Load-on-demand AGENTS/skills; Brain pointers not dumps; Scout briefs stay short |
| V2 | Claude Code: **runnable verification** before done; `/goal` + Stop hooks; `/clear` between unrelated tasks; after ~2 failed corrections rewrite plate; prune CLAUDE.md; hooks for must-happen rules; subagents for noisy exploration; adversarial review in fresh context | Plate + proof fields; thrash tripwire; verification gates; skill prune → hooks |
| V3 | Multi-agent: subagent briefs need **objective + output format + tools/sources + boundaries**; vague delegation → duplication/gaps; artifact + lightweight refs (not transcript dump); scale effort to complexity | Factory Scout packets; Firstmate/crewmate briefs; side-chat boundaries |
| V4 | Session mgmt: continue / rewind / compact / clear / subagent decision table; proactive steered compact; new task ⇒ new session | Outer-loop stop/replan rules; plate restatement after clear |
| V5 | Magentic-One: top failures **persistent-inefficient-actions** + **insufficient-verification-steps**; Progress Ledger stall counter → outer-loop replan | Thrash stop; proof-before-done; stall→replan not identical retry |
| V6 | TypeSafe System One: **code owns control flow**; narrow typed questions; probabilities/confidence gate action; not an agent loop | Jev for smell/ship/Brain-worthiness judgments; never substitute Brain mutation or tutoring generation |
| V7 | Grok Bot templates (Palmer Loops, 2026-09-08): outer-loop recipe = gather → goal/proof → coding agent → review → merge babysit; templates are recipes not clones | Install/sign Loops-style outer-loop crewmate; keep local `outer-loop` skill as durable recipe |

**Local doctrine (Verified from Socratink corpus, 2026-08-24 / smell pilot):** EVT-0001 — request to *trace/dogfood/vet/scientific* became ~3.5k-line learner-evidence expansion then revert. Lesson: proof words raise **proof obligation**, not **scope authority**. Already echoed in product AGENTS working method §3 / PROC-0002.

---

## 30-day plan (stabilize the partnership loop)

Goal: make every long agent run **plate-locked**, **proof-gated**, and **jurisdiction-safe**—without shipping new product surfaces.

### Week 1 — Plate design + EVT-0001 hard stop

| Area | Action | Label |
| --- | --- | --- |
| Plate | Adopt mandatory one-sentence **outcome plate** on every Scout/Ship packet and long Cursor/Codex/Claude session: `outcome` + `cwd/worktree` + `proof` + `stop` + `out_of_scope`. Refuse boot / pause if missing. | **Assumption** (local playbook; aligns with V2 explore→plan→implement + V3 brief fields) |
| EVT-0001 | Add tripwire text to product `AGENTS.md`: *dogfood / vet / scientific / trace / validate → strengthen checks only; never authorize a second product*. Require explicit Captain re-scope before any adjacent build. | **Verified** (local EVT-0001 / PROC-0002) |
| Plate | Paste the plate at the top of every follow-up message in a long thread (anti plate-drift / lost_goal). | **Assumption** (local smell T3; V4 session guide) |
| Scout/Ship | Enforce Factory: research-only Scout tickets write reports under `research/`; Ship only after Captain authorization. No “while validating, also implement…”. | **Verified** (local factory posture / FM seeds) |

### Week 2 — Verification gates

| Area | Action | Label |
| --- | --- | --- |
| Verify | Every Ship (and any “done” claim) must include **runnable proof**: test/build/lint exit code, script output, or screenshot—evidence class `Verified`, not assertion. | **Verified** (Claude Code best practices; Magentic-One insufficient-verification) |
| Verify | Prefer Stop-hook or `/goal`-style gate for unattended runs: check must pass before stop; show evidence in reply. | **Verified** (V2) |
| Verify | Thrash tripwire: ≥3 identical tool signatures **or** ≥5 edit cycles on one file without green gate ⇒ stop agent, rewrite plate. | **Assumption** (local FM-CTXSMELL candidates; Magentic-One persistent-inefficient-actions) |
| Brain | No Brain mutation from coding agents without a Brain contract ticket. Jurisdiction reminder in plate: Brain ≠ code ≠ harness. | **Verified** (local jurisdiction / smell Brain Contract) |

### Week 3 — Multi-agent briefs + context load-on-demand

| Area | Action | Label |
| --- | --- | --- |
| Briefs | Standardize subagent/crewmate brief template: objective, output path/format, allowed tools/sources, **boundaries** (what not to do), proof, stop. No “research X” one-liners. | **Verified** (Anthropic multi-agent research, 2025-06-13) |
| Briefs | Handoffs = **artifact + short refs** (paths, session_id), never dump parent transcript. | **Verified** (V3 appendix: filesystem artifacts / refs) |
| Context | Audit AGENTS.md / skills: for each line, “Would removing this cause mistakes?” Cut or convert must-happen rules to **hooks**. Keep domain docs behind load-on-demand pointers. | **Verified** (Claude Code CLAUDE.md guidance) |
| Context | `/clear` (or new session) between unrelated tasks; use subagents for high-noise exploration so parent stays implementation-clean. | **Verified** (V2, V4) |

### Week 4 — Outer-loop stop rules + skill sprawl cut #1

| Area | Action | Label |
| --- | --- | --- |
| Outer-loop | Sign on a Loops-style outer-loop crewmate (Palmer template or recreate from local `outer-loop` skill): gather → `/goal`-with-proof → launch coding agent → review → merge babysit. | **Verified** (x.ai templates guide 2026-09-08; local FM-BOTFIND-01) |
| Stop rules | Decision table (Captain + agents): **continue** if plate still load-bearing; **rewind** after wrong path (keep useful reads); **compact** mid-task with steer; **clear** for new task; **subagent** when only the conclusion is needed; **stall→replan** if Progress-Ledger-style stall (same fail ≥2×). | **Verified** (V4 + Magentic-One stall counter ≤2 then replan) |
| Sprawl | Inventory skills; delete/archive unused; one owner skill per concern; ban “kitchen-sink” skill packs that auto-load every turn. | **Verified** principle (V1 tools minimal set; V2 skills on demand) |
| Learning | After costly fail: dated note under `.agents/learnings/` — Requested job / Substituted job / Evidence / Stop rule / Regression test (EVT-0001 template). | **Assumption** (local change candidate) |

**30-day exit criteria:** ≥80% of long runs have a written plate; zero Brain mutations without contract; at least one Ship with proof artifact; skill inventory pruned once; outer-loop bot signed on or blocked with written reason.

---

## 60-day plan (instrument judgments; harden factory)

Goal: make partnership quality **measurable** with TypeSafe/Jev and chat-signal—still Scout-heavy before product Ship of new surfaces.

### Days 31–45 — TypeSafe / Jev as judgment lane

| Area | Action | Label |
| --- | --- | --- |
| Jev | Treat Jev as **third lane**: Tier1 deterministic / Tier2 generation / **Jev typed judgments**—not tutoring text, not control-flow owner. | **Verified** (TypeSafe how-to-build; local FM-TYPESAFE-01 framing) |
| Jev | Ship (or keep Scout-authorized) atomic judgments already piloted: smell Nouls (`thrash`, `wrong_scope`, `missing_verify`, `user_correct`), `primary_smell` Choice, severity Score; Axis A ship-worthiness / Axis B `brain_worthy` for chat-signal. Compose weights **in code**. | **Assumption** (local pilots; Verified pattern = composite scoring docs) |
| Jev | Confidence-gate: uncertain judgments → human/Captain review; never auto-mutate Brain on Jev alone. | **Verified** (TypeSafe confidence-gated routing pattern) |
| Verify | Nightly (or weekly) smell prefilter on new `*socratink*` transcripts; alert on severity + high `user_correct`—ops dashboard, not vanity %. | **Assumption** (local candidate; needs Captain auth to Ship) |

### Days 46–60 — Brief quality + outer-loop maturity

| Area | Action | Label |
| --- | --- | --- |
| Briefs | Score multi-agent packets with a thin checklist (or Jev Nouls): has objective? format? tools? boundaries? proof? stop? Reject vague Scout launches. | **Assumption** (extends V3) |
| Outer-loop | Encode stop rules in outer-loop bot memories/skills: premature-stop forbidden without proof; stall→replan; after 2 corrections clear+rewrite plate. | **Verified** principles (V2/V5) + **Assumption** on bot packaging |
| Context | Hybrid context: tiny always-on AGENTS; JIT `@`/path refs for postmortems, evals, TypeSafe skill; compact with “preserve modified files + test commands”. | **Verified** (V1 hybrid; V2 compaction customize) |
| Scout/Ship | Two-track factory: (A) partnership harness improvements (hooks, plates, outer-loop) vs (B) pedagogical product code—never mix in one plate. | **Assumption** (anti-EVT-0001 structure) |
| Sprawl | Second prune: merge overlapping skills; skill-suggestion pattern (at most one skill/turn) if agent skill catalog grows. | **Assumption**; TypeSafe skill-suggestion cookbook exists as Verified technique |

**60-day exit criteria:** Jev judgments running on a bounded corpus with privacy redaction; outer-loop reviewing PRs with proof gates; AGENTS.md shorter than day-0; documented reject rate for vague briefs.

---

## 90-day plan (durable partnership OS)

Goal: partnership practices become **default harness behavior**, with Brain saturation only from high-signal, gated paths.

### Days 61–75 — Close the loop on EVT-0001 class failures

| Area | Action | Label |
| --- | --- | --- |
| EVT-0001 | Regression: any ticket containing validate/dogfood/trace language auto-attaches EVT-0001 stop rule + proof-only plate; Captain must flip a scope bit to allow build. | **Assumption** (operationalize Verified incident) |
| Plate | Packet runner refuses launch without `outcome/cwd/proof/stop/out_of_scope`; side-chat workers get packet-only context. | **Assumption** (local candidate + V3) |
| Verify | Adversarial review subagent on every non-trivial Ship: fresh context, gaps vs plate only (no style theater). | **Verified** (Claude Code adversarial review) |
| Brain | Chat-signal Axis B → Brain saturation queue only after human gate; store session_id + scores + short rationale, not full transcripts. | **Verified** (local FM-CHATSIG design) |

### Days 76–90 — Scale without stuffing

| Area | Action | Label |
| --- | --- | --- |
| Context | Structured notes outside window (NOTES.md / learnings / task ledger) for campaigns >1 session; never maximize context into the agent window. | **Verified** (V1 structured note-taking; local Codex learning-context rot analogy) |
| Outer-loop | Progress-ledger style questions each review cycle: looping? making progress? next agent? proof green? plate still true? | **Verified** (Magentic-One Progress Ledger pattern) |
| Multi-agent | Parallelize only breadth-first Scout; most coding Ships stay single-agent + reviewer subagent (Anthropic notes coding is less parallelizable than research). | **Verified** (V3) |
| Sprawl | Quarterly skill budget: max N always-on skills; rest on-demand; measure token tax of AGENTS+skills startup. | **Assumption** |
| Product | Only then consider Ship of partnership features into product UI—if at all; pedagogical axioms remain non-negotiable and separate plates. | **Assumption** |

**90-day exit criteria:** EVT-0001-class substitution incidents = 0 in window; median time-to-green-proof down; skill always-on set frozen; Brain ingest path gated; Captain can leave unattended runs with `/goal`/hooks without EVT-0001 risk.

---

## Anti-patterns to ban

| Ban | Why | Source |
| --- | --- | --- |
| **Validation-driven scope substitution (EVT-0001)** | Proof language ≠ build license | Local Verified incident |
| Kitchen-sink session (unrelated tasks in one window) | Context rot / ignored rules | Claude Code Verified |
| Correcting >2× without clear/rewrite | Failed approaches pollute | Claude Code Verified |
| Over-specified AGENTS/CLAUDE.md | Rules lost in noise | Claude Code Verified |
| Trust-then-verify gap (done without runnable check) | Magentic-One #2 failure | Verified |
| Vague subagent “research X” | Duplication / gaps | Anthropic multi-agent Verified |
| Transcript-dump handoffs | Game of telephone | Anthropic Verified |
| Identical tool retry loops | Magentic-One #1 failure | Verified |
| Auto-loading skill sprawl every turn | Attention budget tax | Anthropic context eng Verified |
| Jev/LLM free-text as control flow or tutoring grades | Violates TypeSafe posture + Socratink axioms | TypeSafe + local axioms Verified |
| Coding agent mutates Brain without contract | Jurisdiction split | Local Verified |
| Mixing Scout research and Ship implementation in one plate | Factory collapse → EVT-0001 | Local Assumption / doctrine |

---

## Compact sources (Verified URLs + dates)

| # | Source | Date / as-of | Used for |
| --- | --- | --- | --- |
| 1 | https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents | Published **2025-09-29** | Attention budget, JIT, compaction, notes, subagents |
| 2 | https://code.claude.com/docs/en/best-practices | Retrieved **2026-09-15** | Verify, `/goal`, hooks, clear, prune CLAUDE.md, skills, failure patterns |
| 3 | https://claude.com/blog/using-claude-code-session-management-and-1m-context | Retrieved **2026-09-15** | continue/rewind/compact/clear/subagent table |
| 4 | https://www.anthropic.com/engineering/multi-agent-research-system | Published **2025-06-13** | Brief quality, delegation, artifacts, effort scaling |
| 5 | https://www.anthropic.com/news/context-management | Retrieved **2026-09-15** | Context editing / memory tool (platform) |
| 6 | https://arxiv.org/abs/2411.04468 (HTML v1) | arXiv **2024-11-07** | Magentic-One Orchestrator loops; error codes |
| 7 | https://docs.typesafe.ai/llms.txt | Retrieved **2026-09-15** | TypeSafe index / primitives |
| 8 | https://docs.typesafe.ai/concepts/how-to-build-with-system-one.md | Retrieved **2026-09-15** | Code-in-control; atomic questions; confidence |
| 9 | https://docs.typesafe.ai/patterns/composite-scoring.md | Retrieved **2026-09-15** | Compose judgments in code |
| 10 | https://docs.typesafe.ai/concepts/system-one.md | Retrieved **2026-09-15** | System One / Jev definition |
| 11 | https://x.ai/bot/guides/templates-for-grok-bot | **2026-09-08** | Grok Bot templates / Loops recipe |
| 12 | https://x.ai/bot/Ub3T7usX-c6yRQibQq83P | Retrieved **2026-09-15** | Palmer Loops template page |
| 13 | https://openai.com/index/unrolling-the-codex-agent-loop/ | Retrieved **2026-09-15** | Codex agent loop / AGENTS layering (secondary) |
| 14 | https://metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks/ | **2025-03-19** | Long-horizon reliability (secondary) |
| 15 | Local: `chatsig-pilot/smell-runs/FM-CTXSMELL-01.md` + EVT-0001 | **2026-08-24** incident; pilot **2026-09-15** | Plate playbook, EVT-0001, thrash tripwires |

Companion verified smell brief: `/workspace/socratink/research/2026-09-15-context-management-smells-primary-sources.md`

---

## Assumptions

- One-sentence plate + four fields (`outcome/cwd/proof/stop`) is the highest-leverage 30-day control for Socratink’s observed smells (thrash, wrong_scope, lost_goal).
- Jev p≥0.65 material / p≥0.75 severe thresholds remain useful operational defaults until a labeled calibration set exists.
- Outer-loop bot import of Palmer Loops remains the fastest path to `/goal`-with-proof review; fallback is local `outer-loop` skill recreation.
- Separating partnership-harness work from pedagogical product work into distinct plates is sufficient to prevent most EVT-0001 recurrence without new product UI.

## Unknowns

- Whether Captain authorizes Ship of nightly Jev smell monitor vs keeping it Scout-only.
- Exact always-on skill budget (token tax not measured this pass).
- Whether `/goal` Stop-hook semantics in Claude Code map 1:1 to Cursor Cloud Agents / Codex—may need harness-specific proof gates (**Unknown** across harnesses).
- Durable Brain write API / contract format for Axis B saturation (design exists; product path **Unknown**).
- Grok CLI reliability for xhigh live research under current box quotas/timeouts (this run: hang, empty output).

## Open questions for Captain

1. Authorize packet-runner hard refuse (no plate ⇒ no boot) in 30 days, or soft warn first?
2. Prefer import Palmer Loops now vs recreate Socratink-native outer-loop identity?
3. First Jev Ship: smell monitor, chat-signal Axis A/B ranking, or pedagogical phase-08 judgments?
4. Freeze always-on skills list at what N?

---

*End FM-AGENTENG-01 primary brief.*

## Jev-max fold-in (2026-09-15 ~20:55 CT)

| Horizon | Habit from data |
| --- | --- |
| **30d** | Enforce plate template (happy-nuggets) on every `/goal`; thrash stop ≥3 identical tool sigs. Use smell catalog T1–T10 tripwires in AGENTS (short). |
| **60d** | Execute Nole W0–W1 (archive QC clones; cut unnamed bots). Prefer load-on-demand WM exemplars over stuffed parents. |
| **90d** | Nole W2–W3 single-source skills + connector layoffs. Treat Cursor v3 plate mean ~1.03 as population KPI — raise via plate+proof, not more thrash hunting (smell sample was biased). |

**Verified packs:** Cursor parents n=132; Codex n=80; PR Jev 15/15; WM 20; evidence-chains 12; Nole MERGE-FINAL locked.
