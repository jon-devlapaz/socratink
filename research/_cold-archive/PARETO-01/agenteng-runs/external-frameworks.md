# FM-AGENTENG-01: External frameworks for steelmanned report scaffolding (primary sources)

**As-of:** 2026-09-15 (America/Chicago, CT)  
**Ticket:** FM-AGENTENG-01 (research-only)  
**Method:** Live **WebSearch + WebFetch/curl** of official/primary pages. Grok CLI **not** used this pass (companion FM-CTXSMELL pass showed fabricated URLs even when exit 0). Every URL below was HTTP-verified **200** on 2026-09-15 CT unless noted. Claims labeled **Verified** / **Assumption** / **Unknown**.

**Companion (do not duplicate wholesale):**  
`/workspace/socratink/research/2026-09-15-context-management-smells-primary-sources.md`  
Also mirrored at `research/chat-signal/2026-09-15-context-management-smells-primary-sources.md`.  
Cite companion for Anthropic context-engineering smells, Magentic-One, AgentRx, Codex harness, Copilot security, METR long-horizon. This brief adds **partnership / audit / attribution / working-memory / productivity** primaries and maps each to **LOCAL GAP** vs Socratink practice (FM-CTXSMELL taxonomy, AGENTS load-on-demand, EVT-0001).

**Local practice anchors used for LOCAL GAP:**
- FM-CTXSMELL-01 smells T1–T11 + captain/agent playbook (`research/chat-signal/FM-CTXSMELL-01.md`)
- Product `AGENTS.md` working method §1–7 (one-sentence outcome; dogfood→proof not scope; stop when proven) — flue/app agent guide
- **EVT-0001** (2026-08-24): validation-driven scope substitution — dogfood/vet/scientific ≠ license to build adjacent product
- **Load-on-demand AGENTS policy:** keep AGENTS.md short; postmortems/eval research behind pointers (not stuffed into every session)

---

## Question

Document (compact URL + as-of/publication date) the frameworks named for FM-AGENTENG-01 report scaffolding, and for each give a one-line definition plus the **LOCAL GAP** vs current Socratink agent-eng practice.

---

## Framework cards (scaffolding primaries)

### F1 — Audit Evidence Chain (intent → authority → tools → outcome → remediation)

| Field | Content |
| --- | --- |
| **1-line definition** | Responsibility-linked reconstruction path that ties an agentic work unit to **intent/ownership**, **delegated authority**, **tool/agent action**, **accepted outcome**, **exception**, and **remediation closure** — not mere logs. |
| **Primary** | Jearon Wong, *Agentic AI Auditability & Assurance White Paper 2026* (AIAAWP-2026-v0.1 Public Research Edition) |
| **URL** | https://www.jearonwong.com/research/agentic-ai-auditability-assurance-white-paper-2026/agentic-ai-auditability-assurance-white-paper-2026.pdf |
| **Landing** | https://www.jearonwong.com/research/agentic-ai-auditability-assurance-white-paper-2026/ |
| **Date** | **2026-05-18** (document DATE field; v0.1 Public Research Edition) — **Verified** via pdftotext + HTTP 200 |
| **Scaffolding notes** | Paper defines **Audit Evidence Chain** as connecting lifecycle work to authority, role, tool action, evidence pointer, accepted outcome, exception state, and closure. Explicit reconstruction questions include: who initiated / owned **intent**; what **authority** permitted action; which **agent/tool** executed; who **accepted** the result; how **remediation** closed. Cover visual: Authority → Responsibility → Agent Work → Evidence → Closure. |
| **Credibility note** | Independent public research edition; **not** a regulator/ISO audit standard (paper states this repeatedly). Closest named primary matching the FM-AGENTENG chain label. |
| **Related (not the named chain)** | AAEF (Agentic Authority & Evidence Framework) — https://github.com/mkz0010/agentic-authority-evidence-framework — five assurance questions (who acted / on whose behalf / authority / enforcement / evidence); complementary, different naming. |
| **LOCAL GAP** | Socratink has strong **outcome + proof** language (AGENTS working method; missing_verification smell T7) and **EVT-0001 intent/scope** discipline, but no durable **authority → tool → accepted-outcome → remediation** evidence object across runs. Learnings notes after costly fails are episodic, not a chain that reconstructs delegated authority or remediation closure. Side-chat packets carry outcome/cwd/proof/stop candidates but not authority/expiry/remediation fields. |

**Label:** **Verified** (named construct + chain elements on primary PDF).

---

### F2 — HarnessAudit L1–L3 (boundary / execution fidelity / stability)

| Field | Content |
| --- | --- |
| **1-line definition** | Trajectory-level harness safety audit across **L1 Boundary Compliance** (tools/resources/info-flow), **L2 Execution Fidelity** (action validity + checkpointed completion), and **L3 System Stability** (L1/L2 under injection, ambiguity, tool/runtime errors). |
| **Primary paper** | Liu et al., *Auditing Agent Harness Safety* (HarnessAudit) |
| **URL (abs)** | https://arxiv.org/abs/2605.14271 |
| **URL (HTML)** | https://arxiv.org/html/2605.14271 |
| **Project site** | https://harnessaudit.github.io/ |
| **Code** | https://github.com/UCSB-AI/HarnessAudit |
| **Date** | Submitted **2026-05-14**, revised **2026-05-16** (v2) — **Verified** from arXiv abs |
| **Scaffolding notes** | Harness (not final answer) is the unit of audit; hidden evidence channels agents cannot manipulate. Metrics: SAR (tool/resource/flow) for L1; AVS + TCR for L2; PB / perturbation stability for L3. Empiric claim useful for steelman: completion ≠ safety; violations accumulate with trajectory length. |
| **LOCAL GAP** | FM-CTXSMELL scores **smells in transcripts** (thrash, wrong scope, stuffing) but does **not** score harness L1 permission/info-flow adherence, L2 action-validity vs checkpoints, or L3 perturbation stability. Jurisdiction note (“Brain ≠ code ≠ harness”) exists conceptually; no HarnessAudit-style hidden audit channel or SAR/AVS/TCR dashboard for Cursor/Codex/Claude Code configs used on Socratink. EVT-0001 catches intent/scope substitution after the fact, not mid-trajectory resource-boundary violations. |

**Label:** **Verified**.

---

### F3 — AgentAudit failure attribution stages

| Field | Content |
| --- | --- |
| **1-line definition** | Post-hoc trust evaluation that scores a full agent trace on **ten pipeline stages** and attributes failure to the responsible stage(s) (primary + secondary causes), instead of pass/fail alone. |
| **Primary** | Nag et al., *AgentAudit: An Open, Extensible Framework for Full-Lifecycle Trust Evaluation of AI Agents* |
| **URL (abs)** | https://arxiv.org/abs/2609.09875 |
| **URL (pdf)** | https://arxiv.org/pdf/2609.09875 |
| **Code (paper)** | https://github.com/ShreyNag/AgentAudit |
| **Date** | Submitted **2026-09-09** — **Verified** from arXiv abs |
| **Ten scored stages (Verified)** | instruction integrity · planner · memory · tool selection · tool invocation · tool correctness · alignment · tool faithfulness · security · execution integrity |
| **Diagnostic modules (no own score)** | Behavioural classification + **Failure Attribution** (primary/secondary cause, affected components, confidence) |
| **Scaffolding notes** | Failure Attribution Report pinpoints whether failure is instruction integrity, planner, memory retrieval, tool selection/invocation/failures, weak alignment, hallucination, or active attack (injection / memory-tool poisoning / MCP). Distinguishes unsafe compliance from mere task failure. |
| **Do not confuse with** | Who&When multi-agent “which agent/step” attribution (Zhang et al., PMLR); MSR **AgentRx** (companion V8) — related diagnosis family, different taxonomy. |
| **LOCAL GAP** | Smell report collapses failures into Nouls (`tool_thrash`, `lost_goal`, `hallucinated_state`, …) without **stage-localized** attribution across instruction→planner→memory→tools→alignment→security. No Composite Trust Score; no primary/secondary cause report after thrash sessions. EVT-0001 is a human postmortem for **intent/plan misalignment**, closest to AgentAudit “instruction integrity / planner / intent” stages, but not automated on traces. |

**Label:** **Verified**.

---

### F4 — Microsoft Agentic-Agile: 8 partnership dimensions

| Field | Content |
| --- | --- |
| **1-line definition** | Composite measurement of **human–agent software partnership** across eight dimensions: Spec Quality, Decomposition Effectiveness, Agent Reliability, Partnership Efficiency, Delivery Performance, Governance Health, Cost Efficiency, Process Maturity. |
| **Primary MS blog** | Daniel Epstein, *Agentic-Agile: Why Agent Development Needs Agile (Not Just Prompts)* — Microsoft for Developers |
| **URL (blog)** | https://developer.microsoft.com/blog/agentic-agile-why-agent-development-needs-agile-not-just-prompts |
| **Date (blog)** | **2026-05-19** — **Verified** |
| **Primary MS dimensions doc** | `docs/evaluation-framework.md` in microsoft/agentic-agile-template |
| **URL (raw)** | https://raw.githubusercontent.com/microsoft/agentic-agile-template/main/docs/evaluation-framework.md |
| **URL (GitHub UI)** | https://github.com/microsoft/agentic-agile-template/blob/main/docs/evaluation-framework.md |
| **Manifesto** | https://github.com/microsoft/agentic-agile-template/blob/main/MANIFESTO.md |
| **Date (framework doc)** | Living template doc; content retrieved **2026-09-15** CT — dimensions **Verified** from raw file |
| **Eight dimensions (exact names, Verified)** | 1 Spec Quality · 2 Decomposition Effectiveness · 3 Agent Reliability · 4 Partnership Efficiency · 5 Delivery Performance · 6 Governance Health · 7 Cost Efficiency · 8 Process Maturity |
| **Anti-LOC note (same doc, Verified)** | “Commit counts, PR volume, and **lines of code** all increase mechanically when multiple agents execute in parallel. These are **not** productivity gains.” Measure stories accepted, escaped defects, cost per feature. |
| **Related MS (different “8”)** | Engineering@Microsoft “Eight Elements of Co-Creative Partnership” (Identity, Purpose, Goals, Framework, Security, Validation, Escalation, Recognition) — prompt-template framing, **not** the Agentic-Agile evaluation dimensions. Do not conflate. |
| **LOCAL GAP** | Socratink measures session **smells** and has strong Spec/Proof culture (AGENTS + EVT-0001), but lacks a standing **eight-dimension partnership scorecard** (first-pass acceptance, merge conflicts per wave, escaped defects, cost-per-issue, maturity level). No wave/file-ownership decomposition metric. Partnership Efficiency (architecture time vs correction loops) is felt as thrash (T2) but not tracked as a partnership KPI. |

**Label:** **Verified** (Microsoft primary for both intro + eight dimensions).

---

### F5 — Working-memory eval levels (stored / delivered / management cost / outcome)

| Field | Content |
| --- | --- |
| **1-line definition** | Four-level evaluation of agent working-memory management: **stored state**, **delivered context**, **management work** (cost), and **task/process outcome** — because equal token budgets ≠ equal delivered context or equal cost. |
| **Primary** | Chen et al., *Measure Before You Manage: Evaluating Agent Working Memory in Coding Agents* |
| **URL (abs)** | https://arxiv.org/abs/2608.31057 |
| **URL (HTML)** | https://arxiv.org/html/2608.31057 |
| **Date** | Submitted **2026-08-31** — **Verified** |
| **Four levels (Verified from abstract + Table 4)** | 1 **Stored state** (type/size/representation/residency) · 2 **Delivered context** (what actually enters the model under a shared cap) · 3 **Management work** (extra calls, latency, $ for compress/retrieve) · 4 **Task/process outcome** |
| **Scaffolding notes** | Semantic heterogeneity of WM objects (instructions, artifacts, tool outputs, agent state) drives retention/compression behavior. “Measure before you manage.” Complements Anthropic attention-budget / compaction story (companion V1–V5) with an explicit multi-level **eval frame**. |
| **LOCAL GAP** | Load-on-demand AGENTS + “smallest high-signal set” playbook address **intent** of levels 2–4, but Socratink does **not** instrument stored vs delivered vs management-cost vs outcome separately. Companion notes token occupancy as **Could not check**. Compaction/clear advice is qualitative; no WorkMemEval-style accounting of management work (extra tool/summary calls) vs outcome lift. Context stuffing (T6) is detected as a smell, not budgeted as delivered-context vs stored-state mismatch. |

**Label:** **Verified**.

---

### F6 — Coding-agent productivity = velocity ∩ quality (not LOC)

| Field | Content |
| --- | --- |
| **1-line definition** | Treat coding-agent productivity as the **intersection of delivery velocity and quality/mergeability**, explicitly rejecting raw **lines of code** (and inflated activity metrics) as the success function. |
| **Primaries (bundle)** | See table below — all HTTP 200 on 2026-09-15 CT |

| Source | Compact claim | URL | Date | Label |
| --- | --- | --- | --- | --- |
| Anthropic Institute | As of May 2026, >80% of merged production code authored by Claude; Q2 2026 ~**8×** LOC/engineer/day vs 2024; **LOC imperfect / overstates** true productivity; quality roughly at parity by mid-2026 narrative | https://www.anthropic.com/institute/recursive-self-improvement | page as-of retrieved 2026-09-15 (claims reference May/Q2 2026) | **Verified** |
| METR RCT | Experienced OSS developers with early-2025 AI took **19% longer** (AI made them slower) in that snapshot setting | https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/ | **2025-07-10** | **Verified** |
| METR transcript note | Time-savings upper bound ~**1.5×–13×** on Claude Code tasks with caveats (task substitution → soft upper bound); LOC explains only part of task-minute variation | https://metr.org/notes/2026-02-17-exploratory-transcript-analysis-for-estimating-time-savings-from-coding-agents/ | **2026-02-17** | **Verified** |
| METR SWE-bench merge | Roughly **half** of test-passing SWE-bench Verified agent PRs **would not be merged** by maintainers → tests≠quality/velocity | https://metr.org/notes/2026-03-10-many-swe-bench-passing-prs-would-not-be-merged-into-main/ | **2026-03-10** | **Verified** |
| GitHub Changelog | Copilot usage metrics: PR throughput, **time to merge**, agent-authored merged PRs, review suggestion acceptance — velocity via merge cycle, not LOC | https://github.blog/changelog/2026-02-19-pull-request-throughput-and-time-to-merge-available-in-copilot-usage-metrics-api/ | **2026-02-19** | **Verified** |
| Microsoft Agentic-Agile eval | Explicitly: LOC/PR volume inflate under agent parallelism; measure **stories accepted**, **escaped defects**, **cost per feature** | https://raw.githubusercontent.com/microsoft/agentic-agile-template/main/docs/evaluation-framework.md | retrieved 2026-09-15 | **Verified** |
| METR on Anthropic 8× | Analytic note translating Anthropic LOC surge into plausible researcher uplift (with quality caveats) | https://metr.org/notes/2026-07-08-anthropic-researcher-uplift/ | **2026-07-08** | **Verified** (secondary analysis of Anthropic claim) |

| **LOCAL GAP** | Socratink playbooks optimize for **observable proven outcomes** and forbid vanity %, but FM-AGENTENG strata currently emphasize session tool density / smells, not **mergeability ∩ cycle time ∩ escaped defects**. No org-level time-to-merge / first-pass acceptance dashboard. Risk of mistaking thrash-adjacent high tool_call_count for productivity. EVT-0001 shows “more code shipped” (~3.5k lines) can be **negative** productivity when scope was substituted. |

**OpenAI primary:** No dedicated OpenAI “productivity = velocity ∩ quality (not LOC)” measurement page found this pass that matches METR/Anthropic/GitHub/MS strength. Codex harness post remains in **companion** for loop/context behavior, not productivity KPI framing. **Unknown** / gap for OpenAI-official productivity metric primary.

**Label:** Core claim **Verified** from Anthropic + METR + GitHub + Microsoft bundle; OpenAI-specific KPI primary **Unknown**.

---

## Anthropic effective context engineering ↔ local gaps (companion fold)

**Primary (already verified in companion V1–V2, V12):**  
https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents — **Published 2025-09-29** — re-verified HTTP 200 + WebFetch “Published Sep 29, 2025” on 2026-09-15 CT.

**1-line definition:** Treat context as a finite **attention budget**; curate the **smallest high-signal token set**; mitigate long-horizon rot via compaction, structured notes/memory, and sub-agents returning short summaries.

| Anthropic ECE idea | Maps to FM-CTXSMELL / AGENTS / EVT | LOCAL GAP still open |
| --- | --- | --- |
| Context rot / attention budget | T3 lost goal; T6 stuffing; Codex context-rot analogy in FM-CTXSMELL | No token-occupancy telemetry (**Could not check** in smell report) |
| Just-in-time retrieval vs stuffing | **Load-on-demand AGENTS**; agent playbook “smallest owner instructions first” | Still fires: skills/external_links/parent history dumped into subagents (T6) |
| Right-altitude system prompts; prune bloated tools | T4 ignored instructions; product AGENTS keep short | Thrash tripwire candidate not yet committed to product AGENTS |
| Compaction + NOTES.md / memory outside window | Captain playbook dated learnings under `.agents/learnings/` | No steered compaction policy in harness; learnings optional after costly fail only |
| Sub-agents return 1–2k summaries + artifacts | Side-chat boundary playbook; packet fields | Parent-history inheritance still observed; packet `outcome/cwd/proof/stop` not enforced at boot |
| Tool-result clearing as light compaction | Platform context editing (companion V3) | Not wired into Socratink Cursor/Codex session norms |
| Goldilocks instructions (not brittle if-else / not vague) | EVT-0001: proof words ≠ scope authority; one-sentence plate | Soft language (“dogfood/scientific”) still triggers scope substitution without chain-of-intent evidence |

**Do not re-list companion V3–V12 here** — cite companion for Magentic-One, AgentRx, Claude Code best practices, multi-agent research system, Copilot security, METR long tasks, Codex agent loop.

---

## Suggested steelman report skeleton (how to use these frameworks)

Use as section scaffolding for FM-AGENTENG-01 (research narrative, not a shipping ranking):

1. **Intent & authority** — F1 Audit Evidence Chain + EVT-0001 / AGENTS working method §3  
2. **Harness safety layers** — F2 HarnessAudit L1–L3 (map T5 wrong cwd/scope → L1 resource; T2 thrash → L2/L3)  
3. **Failure localization** — F3 AgentAudit stages (overlay FM-CTXSMELL Nouls)  
4. **Partnership maturity** — F4 eight MS dimensions (start with Spec Quality, Decomposition, Governance Health per MS guidance)  
5. **Context / working memory** — Anthropic ECE (companion) + F5 four WM levels  
6. **Outcome metric** — F6 velocity ∩ quality (GitHub merge metrics + METR mergeability; ban LOC as north-star)  
7. **Remediation closure** — F1 remediation + `.agents/learnings/` stop-rule template  

---

## Assumptions

- **A1:** “Primary” for scaffolding includes org-primary blogs/docs + arXiv author PDFs when they **name** the construct; peer-reviewed venue not required for steelman structure.
- **A2:** Wong AIAAWP is the best match for “Audit Evidence Chain” naming; treat as **credible public research**, not certified audit law.
- **A3:** Microsoft evaluation-framework.md in the public template is the canonical list of the **eight partnership dimensions** referenced by the Agentic-Agile program.
- **A4:** AgentAudit (2026-09-09) is the primary for “AgentAudit failure attribution stages”; AgentRx remains companion material for MSR diagnosis taxonomy.
- **A5:** LOCAL GAP statements are inferences from FM-CTXSMELL + AGENTS + EVT-0001, not new empirical measurements this pass.

---

## Unknown / unverifiable / discarded

| Item | Status |
| --- | --- |
| Exact phrase “intent→authority→tools→outcome→remediation” as a trademarked five-token slogan | **Unverified as slogan**; **Verified** as reconstructible chain content in AIAAWP (intent, authority, tool, outcome, remediation all present) |
| OpenAI official productivity = velocity∩quality (not LOC) measurement page | **Unknown** / not found this pass |
| DeepMind / Gemini parallel harness-audit L1–L3 | **Unknown** (out of named list; not required) |
| WorkMemEval GitHub (N8sGit) as *the* four-level frame | **Not used as primary** — different WM behavioral benchmark; four-level frame is arXiv 2608.31057 |
| H33 “AI Evidence Chains” product pages | Related crypto evidence bundling; **not** the named governance Audit Evidence Chain |
| Any Grok-CLI-only URL | **Discarded** (none used) |

---

## Verified frameworks (1-line each) — return summary

1. **Audit Evidence Chain** — Reconstruct intent/authority/tool/outcome/remediation as responsibility-linked evidence (AIAAWP, 2026-05-18).  
2. **HarnessAudit L1–L3** — Boundary compliance / execution fidelity / stability over full harness trajectories (arXiv 2605.14271, 2026-05-14/16).  
3. **AgentAudit failure attribution** — Ten pipeline stages + primary/secondary cause report (arXiv 2609.09875, 2026-09-09).  
4. **MS Agentic-Agile 8 dimensions** — Spec→Decomposition→Reliability→Partnership→Delivery→Governance→Cost→Maturity (MS blog 2026-05-19 + template eval doc).  
5. **Working-memory four levels** — Stored / delivered / management work / outcome (arXiv 2608.31057, 2026-08-31).  
6. **Productivity = velocity ∩ quality** — Anthropic LOC caveat + METR time/merge evidence + GitHub merge metrics + MS anti-LOC partnership metrics (2025-07 → 2026-07 bundle).  
7. **Anthropic ECE (companion)** — Attention budget + compaction/notes/subagents (2025-09-29); mapped to local gaps above.

**Unverifiable names this pass:** OpenAI-official “not LOC” productivity KPI page; slogan-exact five-arrow trademark for Audit Evidence Chain.

---

## Primary source index (this brief; new vs companion)

| # | Framework | Org / authors | Compact URL | Date |
| --- | --- | --- | --- | --- |
| 1 | Audit Evidence Chain | Jearon Wong / AIAAWP | https://www.jearonwong.com/research/agentic-ai-auditability-assurance-white-paper-2026/agentic-ai-auditability-assurance-white-paper-2026.pdf | 2026-05-18 |
| 2 | HarnessAudit L1–L3 | Liu et al. (UCSB et al.) | https://arxiv.org/abs/2605.14271 | 2026-05-14/16 |
| 3 | HarnessAudit site | same | https://harnessaudit.github.io/ | retrieved 2026-09-15 |
| 4 | AgentAudit stages | Nag et al. | https://arxiv.org/abs/2609.09875 | 2026-09-09 |
| 5 | Agentic-Agile intro | Microsoft / Epstein | https://developer.microsoft.com/blog/agentic-agile-why-agent-development-needs-agile-not-just-prompts | 2026-05-19 |
| 6 | 8 partnership dimensions | Microsoft template | https://raw.githubusercontent.com/microsoft/agentic-agile-template/main/docs/evaluation-framework.md | retrieved 2026-09-15 |
| 7 | WM four levels | Chen et al. | https://arxiv.org/abs/2608.31057 | 2026-08-31 |
| 8 | ECE (companion fold) | Anthropic | https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents | 2025-09-29 |
| 9 | LOC≠productivity | Anthropic Institute | https://www.anthropic.com/institute/recursive-self-improvement | retrieved 2026-09-15 |
| 10 | AI slowdown RCT | METR | https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/ | 2025-07-10 |
| 11 | Transcript upper bound | METR | https://metr.org/notes/2026-02-17-exploratory-transcript-analysis-for-estimating-time-savings-from-coding-agents/ | 2026-02-17 |
| 12 | Tests≠merge | METR | https://metr.org/notes/2026-03-10-many-swe-bench-passing-prs-would-not-be-merged-into-main/ | 2026-03-10 |
| 13 | PR throughput / TTM | GitHub | https://github.blog/changelog/2026-02-19-pull-request-throughput-and-time-to-merge-available-in-copilot-usage-metrics-api/ | 2026-02-19 |
| 14 | Anthropic 8× analysis | METR | https://metr.org/notes/2026-07-08-anthropic-researcher-uplift/ | 2026-07-08 |

Companion index (≥10 Anthropic/OpenAI/MSR/GitHub/METR context-smell sources) remains authoritative for context-management smells — **cite, do not copy**.

---

## Implications for FM-AGENTENG-01 steelman (inferences)

1. Structure the report as **chain (F1) × harness layers (F2) × stage attribution (F3) × partnership scorecard (F4) × WM levels (F5) × velocity∩quality (F6)**.  
2. Treat FM-CTXSMELL Nouls as a **local failure vocabulary** that should be *mapped into* AgentAudit stages and HarnessAudit L1–L3, not left as the only taxonomy.  
3. Elevate EVT-0001 from anecdote to **intent/authority control** example inside F1 + F4 Spec Quality.  
4. Operationalize load-on-demand as F5 “delivered context” control, with management-cost accounting when compaction/subagents are added.  
5. Ban LOC and raw tool_call_count as north-star; prefer merge/TTM/first-pass acceptance/escaped defects (F4 + F6).
