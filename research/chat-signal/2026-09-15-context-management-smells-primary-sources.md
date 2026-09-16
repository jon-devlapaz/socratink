# FM-CTXSMELL-01: Context-management smells & coding-agent failures (primary sources)

**As-of:** 2026-09-15 (America/Chicago, CT)  
**Ticket:** FM-CTXSMELL-01  
**Method:** Live Grok CLI pass (`~/.grok/bin/run-grok.sh --reasoning-effort xhigh -m grok-4.6 --always-approve`, web search **not** disabled) completed and exited successfully (~76s). That pass was **not** quota-blocked, but it returned multiple **fabricated** primary URLs/dates (e.g. nonexistent OpenAI/Anthropic/DeepMind/METR/GitHub “2025–2026 reports”). **All Grok-cited URLs in that pass were discarded.** Verified facts below come from live **WebSearch / WebFetch / curl** of official primary pages (labeled per claim). No credentials were used or exposed.

---

## Question

What concrete context-engineering and agentic failure patterns have primary/official sources documented for coding agents and long-running agents, and what mitigations are supported—especially: context pollution/stuffing, lost goals, conflicting instructions, tool/retry loops, wrong working directory/scope, hallucinated state, missing verification, premature stopping, error recovery, long-context degradation, multi-agent handoff rot, memory selection, and secret leakage risk?

---

## Verified facts

Each item is **Verified** from a primary/official page (or arXiv HTML for Magentic-One). Compact URL + as-of/publication date included. Mitigations listed only when the same source supports them.

### V1 — Context rot / long-context degradation (attention budget)

- **Fact:** Anthropic documents **context rot**: as token count in the window grows, recall/precision and long-range reasoning degrade; context is a finite “attention budget” with diminishing returns (transformer \(n^2\) attention + training distribution bias toward shorter sequences).
- **Smell mapping:** long context degradation; context pollution/stuffing.
- **Mitigation (same source):** Curate the **smallest high-signal token set**; prefer just-in-time retrieval over stuffing; treat every added token as costly.
- **Source:** https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents — **as-of / published 2025-09-29** (Anthropic Engineering).

### V2 — Compaction, structured notes (memory), sub-agents as context mitigations

- **Fact:** For long-horizon work that exceeds the window, Anthropic documents three techniques: (1) **compaction** (summarize nearing-limit transcript → new window; preserve decisions/bugs/impl details, drop redundant tool noise; after compact, Claude Code continues with compressed context + recently accessed files); (2) **structured note-taking / agentic memory** outside the window (e.g. NOTES.md / memory tool); (3) **sub-agent architectures** where workers explore in separate windows and return short summaries (~1–2k tokens) to the lead.
- **Smell mapping:** lost goals across window boundaries; memory selection; multi-agent handoff (partial—see V6).
- **Mitigation:** Tune compaction for recall-then-precision; clear stale tool results as lightest compaction; persist plans/progress outside context; isolate noisy exploration in sub-agents.
- **Source:** https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents — **2025-09-29**.

### V3 — Platform context editing + memory tool (production API)

- **Fact:** Claude Developer Platform **context editing** clears stale tool calls/results near token limits while preserving conversation flow; **memory tool** stores/consults file-based memory outside the window across sessions. Internal agentic-search eval: memory + context editing **+39%** vs baseline; context editing alone **+29%**; in a 100-turn web-search eval, context editing enabled completion that would otherwise fail and cut token use **84%**.
- **Smell mapping:** context pollution from tool-result stuffing; lost goals on long runs; memory selection.
- **Mitigation:** Enable context editing / tool-result clearing; persist critical state via memory files rather than leaving everything in transcript.
- **Source:** https://www.anthropic.com/news/context-management — **as-of page content retrieved 2026-09-15** (announces capabilities with Claude Sonnet 4.5).

### V4 — Coding-agent session smells: kitchen-sink context, correction loops, bloated instructions, missing verification, unbounded exploration

- **Fact:** Claude Code official best practices state performance degrades as context fills (“forgetting” earlier instructions / more mistakes). Documented failure patterns and fixes:
  - **Kitchen-sink session** (unrelated tasks pollute context) → `/clear` between unrelated tasks.
  - **Correcting over and over** (failed approaches pollute context) → after ~two failed corrections, `/clear` and rewrite a better prompt.
  - **Over-specified CLAUDE.md** (rules get ignored in noise) → ruthlessly prune; convert must-happen rules to hooks.
  - **Trust-then-verify gap** (plausible but incomplete work) → always provide runnable verification (tests/build/linter/screenshot).
  - **Infinite exploration** (reads hundreds of files) → narrow scope or use **subagents** so exploration does not consume parent context.
- **Additional mitigations:** explore→plan→implement; `/compact` with focus instructions; customize compaction via CLAUDE.md (“preserve modified files and test commands”); adversarial review in a **fresh** subagent; Stop hooks / `/goal` to gate premature stopping; show evidence (test output) not bare assertions.
- **Smell mapping:** context pollution; conflicting/overloaded instructions; missing verification; premature stopping; wrong scope.
- **Source:** https://code.claude.com/docs/en/best-practices — **as-of retrieved 2026-09-15** (Claude Code docs).

### V5 — Compaction quality, rewind vs correct, when to clear vs compact vs subagent

- **Fact:** Anthropic’s Claude Code session guide defines **context rot** operationally and notes autocompact is lossy; **bad autocompact** often happens when the model cannot predict the next work direction (e.g. debug-heavy summary drops a side warning you later need). Compacting occurs when the model is at its **least intelligent** point due to rot—so prefer proactive `/compact` with steering. Prefer **rewind** (drop failed attempt, keep useful reads) over stacking corrections. Decision table: continue / rewind / compact / clear / subagent by situation.
- **Smell mapping:** lost goals after compaction; hallucinated/incomplete carried state; premature stopping after “looks done.”
- **Mitigation:** Proactive steered compact; clear for new tasks; subagent for high-noise intermediate work; write explicit handoff briefs after clear.
- **Source:** https://claude.com/blog/using-claude-code-session-management-and-1m-context — **as-of retrieved 2026-09-15**.

### V6 — Multi-agent coordination failures (delegation, duplication, endless search, tool misuse) + recovery patterns

- **Fact:** Anthropic’s multi-agent Research system (lead + parallel subagents) documents early failure modes: spawning too many subagents for simple queries; endless search for nonexistent sources; agents distracting each other with excessive updates; **vague delegation** causing duplicated searches / gaps; wrong tool selection (esp. with uneven MCP descriptions); overly specific first queries that return nothing. Production notes: agents are **stateful and errors compound**; prefer **resume from failure point** + tell the model a tool is failing so it can adapt; use checkpoints/retry; rainbow deploys so mid-flight agents are not broken; sync subagent waits create bottlenecks.
- **Supported mitigations:** Detailed task briefs to subagents (objective, output format, tools/sources, boundaries); scale effort to query complexity; start wide then narrow; parallel tool calls carefully; save plan to Memory before truncation; evaluate outcomes not rigid paths; **artifact + lightweight reference handoffs** to avoid “game of telephone”; summarize completed phases before spawning fresh contexts.
- **Smell mapping:** multi-agent handoff rot; conflicting instructions; tool/retry loops; lost goals; error recovery.
- **Source:** https://www.anthropic.com/engineering/multi-agent-research-system — **published 2025-06-13**.

### V7 — Magentic-One: retry/inefficient loops, missing verification, navigation/scope errors, neglected errors, weak cross-task memory

- **Fact:** Microsoft Research Magentic-One (Orchestrator + specialized workers; Task Ledger + Progress Ledger) error analysis (automated coding of validation logs across GAIA/WebArena/AssistantBench) finds top failure codes including:
  - **persistent-inefficient-actions** — repeat same failing actions without adapting (tool/retry loops).
  - **insufficient-verification-steps** — mark complete without validating outputs.
  - **inefficient-navigation-attempts** — wrong UI/path/scope cycling.
  - Also: underutilized resources; ineffective team communication; **neglected-error-notifications**; access/security barriers; delayed feedback.
- **Orchestrator mitigations (architecture):** Progress ledger asks if looping / making progress / which agent next; stall counter triggers outer-loop replan; educated guesses stored as qualified facts; agent reset after plan updates.
- **Documented limitations:** fixed team membership; **limited learning across tasks** (rediscover same subproblems); high cost/latency; irreversible-action risks (agents attempted password resets, contacting humans, etc.) → least privilege + oversight.
- **Smell mapping:** tool/retry loops; missing verification; wrong working directory/scope (web/file navigation); error recovery; multi-agent handoff; hallucinated state (educated guesses / unverified completion).
- **Source:** https://arxiv.org/abs/2411.04468 (HTML: https://arxiv.org/html/2411.04468) — **arXiv 2024-11** (MSR); experiments Aug–Oct 2024; still primary for failure taxonomy through 2025–2026 citations.

### V8 — AgentRx failure taxonomy (plan adherence, invention of information, tool misreads, intent misalignment)

- **Fact:** Microsoft Research AgentRx (2026) publishes a nine-category failure taxonomy from 115 annotated failed trajectories (τ-bench, Flash, Magentic-One), including: Plan Adherence Failure; **Invention of New Information** (hallucination); Invalid Invocation; **Misinterpretation of Tool Output**; Intent–Plan Misalignment; Under-specified User Intent; Intent Not Supported; Guardrails Triggered; System Failure. Notes multi-agent failures can be “passed” between agents, masking root cause. AgentRx improves failure localization (+23.6%) and root-cause attribution (+22.9%) vs prompting baselines.
- **Smell mapping:** hallucinated state; missing verification; lost goals / plan drift; tool errors; handoff rot.
- **Mitigation (framework-level):** Normalize trajectories; synthesize guarded constraints from tool schemas + policies; step-level evidence logs; localize **first critical (unrecoverable) failure**.
- **Source:** https://www.microsoft.com/en-us/research/blog/systematic-debugging-for-ai-agents-introducing-the-agentrx-framework/ — **published 2026-03-12**.

### V9 — Coding harness: growing history exhausts context; cwd/workdir in shell tool; project instruction layering

- **Fact:** OpenAI’s Codex harness post states an agent may issue hundreds of tool calls in one turn and exhaust the context window; **context window management is an agent responsibility**. Conversation history (messages + tool calls) is re-included each turn. Shell tool schema includes **`workdir`**. Prompt construction injects sandbox/permissions, aggregated **AGENTS.md / AGENTS.override.md** (root→cwd, size-limited), skills metadata, and `<environment_context>` including **cwd** and shell. Auto-compaction via Responses API when **`auto_compact_limit`** exceeded (compaction item with opaque encrypted content).
- **Smell mapping:** context stuffing from tool loops; wrong working directory/scope; conflicting layered instructions (multiple AGENTS.md).
- **Mitigation:** Harness-level compaction; explicit workdir; layered but size-capped project docs; sandbox permissions messages for shell.
- **Source:** https://openai.com/index/unrolling-the-codex-agent-loop/ — **published 2026-01-23** (fetched via curl; WebFetch returned 403).

### V10 — Secret leakage / exfiltration / prompt injection for hosted coding agents

- **Fact:** GitHub documents three risk classes for Copilot coding agent: **data exfiltration** (including leaking write tokens), impersonation/attribution, **prompt injection** (hidden Unicode/HTML in issues/files). Rules: make context visible (strip invisible Unicode/HTML); firewall network; **do not pass CI secrets / out-of-repo files by default**; revoke session tokens after run; block irreversible state changes without HITL (PRs only, no direct default-branch commits; CI not auto-run); attribute initiator+agent; only gather context from authorized (write-access) users.
- **Smell mapping:** secret leakage risk; conflicting/hidden instructions (injection); wrong scope (network/exfil).
- **Mitigation:** Least privilege; visible-context filtering; firewall; no ambient secrets; human gates on irreversible actions.
- **Source:** https://github.blog/ai-and-ml/github-copilot/how-githubs-agentic-security-principles-make-our-ai-agents-as-secure-as-possible/ — **published 2025-11-25**.

### V11 — Long-running agent reliability is the hard part (time-horizon framing)

- **Fact:** METR measures agent capability as length of tasks completed at a given success rate; agents often fail more at **stringing long action sequences** than at single-step skill. Frontier models (as of paper) near ~100% on <~4 min human tasks but <10% on >~4 hour tasks (paper-era curves). Time horizons have grown exponentially (paper: ~7 month doubling; later suite updates exist).
- **Smell mapping:** premature stopping; error recovery over long horizons; lost goals; missing verification on long chains.
- **Mitigation (implied by framing, not a playbook recipe):** Evaluate and design for **multi-step reliability over time**, not only single-shot accuracy.
- **Source:** https://metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks/ — **published 2025-03-19** (note on page: some static figures outdated; see METR time-horizons page for updates).

### V12 — System-prompt / tool-set design smells (brittle vs vague; bloated tools)

- **Fact:** Anthropic recommends system prompts at the “right altitude” (not brittle if-else hardcoded logic; not vague high-level guidance that assumes shared context). **Bloated overlapping tool sets** are a common failure mode—if a human cannot choose which tool to use, the agent will not either. Prefer diverse canonical examples over stuffing every edge case into the prompt.
- **Smell mapping:** conflicting instructions; context stuffing via tools/examples; tool selection loops.
- **Mitigation:** Minimal viable tool set; clear sections (XML/Markdown); diverse few-shots; just-in-time retrieval.
- **Source:** https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents — **2025-09-29**.

---

## Assumptions

- A1: Failure taxonomies from Magentic-One / AgentRx generalize usefully to coding-agent harnesses (Claude Code, Codex, Copilot) even when domains differ (web/API vs repo coding).
- A2: “Primary/official” includes Anthropic/OpenAI/GitHub engineering blogs + Claude Code docs + MSR arXiv/blog + METR blog; peer-reviewed venue not required if org-primary.
- A3: Stats quoted only when present on the fetched primary page (e.g. Anthropic +39%/+29%/84%; AgentRx +23.6%/+22.9%; Magentic-One leaderboard percentages). No extrapolation beyond those pages.
- A4: OpenAI Agents API announcement content was not fully verified here (openai.com WebFetch 403); Codex harness post (curl) was used instead as the OpenAI primary for agent-loop/context behavior.

---

## Inferences

*(Not direct quotes from sources; derived for FM-CTXSMELL-01 / Captain playbook.)*

- I1: Most “smells” reduce to **attention-budget mismanagement**: stuffing tool noise, failed retries, and unrelated tasks into one window until goals and constraints drown.
- I2: **Verification-as-stop-condition** is the cross-vendor antidote to premature stopping (Claude Code hooks/goals; Magentic-One insufficient-verification code; AgentRx invention/misinterpretation categories).
- I3: **Handoff rot** is mitigated by artifacts + short summaries + persisted plans (Anthropic Research appendix; Magentic-One ledgers; compaction steering), not by dumping full child transcripts into the parent.
- I4: **Wrong cwd/scope** should be treated as a first-class harness concern (Codex `workdir` + cwd environment context; Magentic navigation errors; GitHub firewall/scope).
- I5: Secret leakage is primarily a **capability + context inclusion** problem: if secrets/network are in the agent’s reachable set, injection can exfiltrate them—mitigate by omission + visibility filters + HITL irreversible gates.

---

## Open questions

- O1: Do Google DeepMind / Gemini official 2025–2026 posts provide a comparable coding-agent failure taxonomy? (Search did not surface an equivalent primary failure catalog in this pass.)
- O2: Exact public production rates for “bad compaction” / goal loss after summarization across vendors (beyond qualitative Anthropic guidance).
- O3: Quantitative comparison of tool-result clearing vs full-transcript compaction vs subagent isolation on the same coding tasks.
- O4: Best cross-task memory selection policy (what to write to NOTES.md / memory tool vs what to re-fetch) under secret-leakage constraints.
- O5: Whether OpenAI’s managed Agents API compaction/recovery behavior matches Codex CLI’s documented auto_compact (Agents API page not successfully fetched this pass).

---

## Could not check

- C1: Full PDF internals / Appendix-only Magentic-One examples beyond arXiv HTML (partial coverage of Appendix C codes obtained).
- C2: OpenAI `openai.com/index/introducing-the-agents-api/` body (HTTP 403 via WebFetch); relied on Codex harness post instead.
- C3: Live reproduction of Anthropic internal evals (+39%/+29%/84%)—accepted as stated on Anthropic news page only.
- C4: GitHub Copilot cloud-agent secrets docs deep-dive beyond the Nov 2025 principles blog (related docs exist; not all fetched).
- C5: Grok CLI’s web-search citations could not be trusted; any claim only present in the Grok log and not re-fetched is omitted.

---

## Implications for Captain playbook

*(Inferences unless tagged Verified.)*

1. **Context budget as a first-class resource** (V1–V5): Track fill; clear between unrelated tasks; steer compaction; never treat “window not full” as “safe to stuff.”
2. **Stop conditions = external verification** (V4, V7, V8): Tests/build/linter/screenshot or ledger checklist before “done”; ban assert-only completion.
3. **Retry hygiene** (V6–V8): Bound identical tool retries; force strategy change on stall; surface tool errors to the model; localize first critical failure.
4. **Scope & cwd** (V7, V9, V10): Declare cwd/workdir; isolate sandbox; least-privilege network/files; no ambient CI secrets in agent context.
5. **Handoffs** (V2, V6): Subagents return summaries + artifact refs; persist plan/progress outside chat before compact/truncate.
6. **Instructions hygiene** (V4, V12): Keep AGENTS.md/CLAUDE.md short and broadly applicable; move rare workflows to on-demand skills; avoid overlapping tools.

---

## Implications for agent prompt / AGENTS.md changes

*(Inferences; align with Verified patterns.)*

1. Add an explicit **context-hygiene** block: clear/compact policy; “after two failed corrections, reset”; do not mix unrelated tasks in one thread.
2. Add **verification gate**: “Do not claim done without running [tests/build] and pasting evidence.”
3. Add **retry policy**: max N identical failing calls; then change approach or escalate; never ignore repeated error output.
4. Add **scope rules**: prefer tool `workdir`/cwd; refuse actions outside allowed trees; no reading `.env`/secret stores unless explicitly tasked and sanitized.
5. Add **handoff template** for subagents: objective, out-of-scope, tools allowed, output format, artifact path; parent keeps only summary + refs.
6. Keep AGENTS.md **minimal** (V4/V12); put long domain playbooks in skills; instruct compaction to preserve: goal, constraints, modified files, failing tests, next step.

---

## Primary source index (≥6)

| # | Org | Title / topic | URL | Date |
|---|-----|---------------|-----|------|
| 1 | Anthropic | Effective context engineering for AI agents | https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents | 2025-09-29 |
| 2 | Anthropic | Managing context on the Claude Developer Platform | https://www.anthropic.com/news/context-management | retrieved 2026-09-15 |
| 3 | Anthropic | How we built our multi-agent research system | https://www.anthropic.com/engineering/multi-agent-research-system | 2025-06-13 |
| 4 | Anthropic | Best practices for Claude Code | https://code.claude.com/docs/en/best-practices | retrieved 2026-09-15 |
| 5 | Anthropic | Session management and 1M context | https://claude.com/blog/using-claude-code-session-management-and-1m-context | retrieved 2026-09-15 |
| 6 | OpenAI | Unrolling the Codex agent loop | https://openai.com/index/unrolling-the-codex-agent-loop/ | 2026-01-23 |
| 7 | Microsoft Research | Magentic-One | https://arxiv.org/abs/2411.04468 | 2024-11 |
| 8 | Microsoft Research | AgentRx framework | https://www.microsoft.com/en-us/research/blog/systematic-debugging-for-ai-agents-introducing-the-agentrx-framework/ | 2026-03-12 |
| 9 | GitHub | Agentic security principles (Copilot) | https://github.blog/ai-and-ml/github-copilot/how-githubs-agentic-security-principles-make-our-ai-agents-as-secure-as-possible/ | 2025-11-25 |
| 10 | METR | Measuring AI ability to complete long software tasks | https://metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks/ | 2025-03-19 |

---

## Grok CLI note (for audit)

- Launcher: `~/.grok/bin/run-grok.sh --reasoning-effort xhigh -m grok-4.6 --always-approve -p "..."`  
- Log: `/workspace/socratink/research/2026-09-15-context-management-smells-primary-sources.grok.log`  
- Outcome: completed, exit 0, **not quota-blocked**; content treated as **untrusted / largely fabricated citations**; this report re-grounded via WebSearch/WebFetch/curl.
