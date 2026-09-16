---
title: "FM-CTXSMELL-01 — Context-management smells & agentic failures"
source_url: "file:///workspace/socratink/research/chat-signal/wiki-source/agenteng/related/FM-CTXSMELL-01.md"
source_kind: "agenteng-documentation"
generated: true
synced_at: "2026-09-16T02:33:24Z"
content_hash: "5e4fa01258a1f45d895a5e50118426cdf22504d936c30ba3d68401688d12df2c"
---

# FM-CTXSMELL-01 — Context-management smells & agentic failures

**As-of:** 2026-09-15 20:24 CT (primary-sources addendum)
**Task:** Research report on antipatterns / smells / prompting issues / context failures in coding-agent sessions. **Not** a shipping or strategy ranking. No PR.
**Audience:** Captain (improve personal + agent context practice) and coding agents (concrete stop rules).
**Corpus:** `current-home-live` Cursor `*socratink*` transcripts + prior pilot packs + Socratink postmortems (`EVT-0001`/`SRC-0010`/`PROC-0002`, TUI docs postmortem, Codex context-rot summary).

## Brain Contract (no mutation)

- **North-star fit:** Improve operator and agent reliability so product work stays evidence-bearing and scope-faithful.
- **Canon relied on:** jurisdiction split (Brain ≠ code ≠ harness); historical `PROC-0002` anti-pattern (archived procedure, used as incident doctrine pointer).
- **Derived context used:** Learner Agent / Evaluation Views only as routing context — not as authority for this ops report.
- **Open question / conflict:** none blocking this research.
- **Evidence / provenance needed:** session transcripts + accepted incident sources.
- **Codebase facts verified externally:** Cursor jsonl schema lacks `tool_result` payloads (tool_use only) — confirmed on live files 2026-09-15.
- **Claims this work must NOT make:** no universal agent-behavior law from n=50; no promotion of archived PROC into live Canon; no vanity %.
- **Brain mutation proposed:** none.

## Method

1. Deterministic prefilter on ~198 socratink Cursor transcripts + pilot pack overlap → **50** sessions (44 smell-rich + 6 low-smell contrast).
2. Signals in code: strict user-correction phrases, repeated identical tool signatures (≥3), unique path count, tool density. Generic “don’t / no” matches were discarded after v1 false positives.
3. TypeSafe Jev one `systemOne` call per session (Nouls + primary_smell Choice + severity Score + recoverability Choice). Privacy-redacted excerpts only.
4. Compose `smell_index` in code (severity + Nouls + capped deterministic boost). Ranks + evidence bullets — no vanity %.
5. Fold primary local postmortems as high-authority failure cases.

### Measurement caveats

- **Verified fact:** Cursor agent-transcript jsonl stores `tool_use` inputs, not tool outputs. String “error” counts inside transcripts are contaminated by skill/docs text. Prefer **repeated tool signatures** and **strict user corrections** as deterministic evidence.
- **Assumption:** Jev p≥0.65 is a useful “material smell” threshold for this corpus; report also shows p≥0.75.
- **Inference:** Dominant `tool_thrash` primary label partly reflects long UI/refactor sessions with many legitimate re-reads; treat severity + recoverability + user corrections as the triage filter.

- Sample scored: **50/50**. Primary-smell Choice distribution (raw): `{'tool_thrash': 39, 'lost_goal': 2, 'hallucinated_state': 3, 'context_stuffing': 3, 'ignored_instructions': 2, 'multiagent_handoff_rot': 1}`.

## Taxonomy

| ID | Smell | What it looks like | Local anchor |
| --- | --- | --- | --- |
| T1 | **Validation-driven scope substitution** | “Dogfood / scientific / vet” read as license to build a larger adjacent product | `EVT-0001`, `SRC-0010`, `PROC-0002` |
| T2 | **Tool thrash / path thrash** | Same Read/StrReplace/Shell signature repeated ≥3–10× without progress | Deterministic repeats; many top ranks |
| T3 | **Lost goal / plate drift** | Session leaves stated cwd/outcome; starts another job mid-thread | Jev `context_lost` / `lost_goal` |
| T4 | **Ignored standing instructions** | AGENTS.md / skills / worktree guard not applied | Jev `ignored_standing_instructions` |
| T5 | **Wrong cwd / worktree gap** | Fresh worktree missing `node_modules`; commit hooks fail; wrong repo | TUI postmortem 2026-06-28 |
| T6 | **Context stuffing / prompt bloat** | Huge attached skills, external_links, parent history into subagent | Side-chat boundary sessions; contrast vs load-on-demand AGENTS policy |
| T7 | **Missing verification** | Claims done without proving the observable outcome | Product AGENTS.md already forbids this; still fires in sample |
| T8 | **Hallucinated / assumed state** | Acts as if files, ports, or prior results exist | Jev primary `hallucinated_state` |
| T9 | **Multi-agent / handoff rot** | Subagent inherits parent assignment; boundary ignored | Side-chat boundary + sprawl packets |
| T10 | **Premature stop / recovery failure** | Retries same failing command; no diagnose→fix→retry | TUI postmortem regression test |
| T11 | **Secret / exfil risk** | Raw transcripts/credentials in context | Workspace AGENTS privacy rules |
| T12 | **Learning-context / information overload** (product analogy) | Too much unpruned context degrades effectiveness | Codex summary 2026-08-13 (provisional product language) |

## Frequencies (n=50 smell-biased sample)

### Deterministic

- Strict user-correction sessions: **6**/50
- Sessions with repeated tool signatures (≥3 identical): **45**/50
- Sessions with unique_paths > 30: **41**/50

### Jev Nouls (material @ p≥0.65 / severe @ p≥0.75)

| Smell Noul | p≥0.65 | p≥0.75 |
| --- | --- | --- |
| `tool_thrash` | 39 | 33 |
| `missing_verification` | 14 | 4 |
| `wrong_scope` | 9 | 4 |
| `user_had_to_correct` | 8 | 7 |
| `context_lost` | 4 | 2 |
| `ignored_standing_instructions` | 2 | 1 |

- Severity Score (rounded 0–3): {0: 1, 1: 11, 2: 26, 3: 12} — **0** clean · **1** mild · **2** material · **3** severe
- Recoverability Choice: {'recoverable': 36, 'fatal': 5, 'clean': 9}

## Highest-signal failure sessions

| Rank | Smell idx | Primary | Severity | Recoverability | Session | Project |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1.037 | hallucinated_state | 2.76 | fatal | `64cfb0da@1fee4c` | `socratink-prod-socratink-app-orphaned-launch-pad-css` |
| 2 | 1.029 | tool_thrash | 2.80 | recoverable | `e8a25b04@83440b` | `socratink-prod-socratink-app` |
| 3 | 1.006 | tool_thrash | 2.94 | fatal | `3f9a6631@747931` | `active-socratink-product-socratink` |
| 4 | 0.969 | tool_thrash | 2.61 | recoverable | `e8a25b04@5b3831` | `socratink-prod-socratink-app` |
| 5 | 0.967 | tool_thrash | 2.53 | recoverable | `f4d88dd4@223989` | `active-socratink-product-socratink` |
| 6 | 0.954 | tool_thrash | 2.82 | fatal | `f57a99e7@d082d5` | `socratink-prod-socratink-app-training-sync-due` |
| 7 | 0.943 | lost_goal | 2.48 | recoverable | `f5892573@a3fba8` | `active-socratink-prod-socratink-landing` |
| 8 | 0.939 | tool_thrash | 2.57 | recoverable | `44e8029b@67827e` | `socratink-prod-socratink-app` |
| 9 | 0.907 | tool_thrash | 2.90 | fatal | `73c01e2a@e661bb` | `socratink-prod-socratink-landing` |
| 10 | 0.907 | tool_thrash | 2.62 | recoverable | `97408866@7cf1e3` | `active-socratink-product-socratink` |
| 11 | 0.881 | tool_thrash | 2.60 | recoverable | `c7033f65@cc6ad3` | `socratink-prod-socratink-app` |
| 12 | 0.866 | tool_thrash | 2.22 | recoverable | `a09316e9@4924e1` | `active-socratink-product-socratink` |

### Evidence cards (top 8)

#### `64cfb0da@1fee4c`
- Packetized dead-code cleanup with explicit cwd + `agent-work guard`, then drift into tool-sharpening / worktree evaluation. High ignored-instructions + wrong-scope + missing-verification. Deterministic: repeated sprawl boot + LEDGER reads.
- Jev: thrash p=0.78, wrong_scope p=0.82, user_correct p=0.46, missing_verify p=0.89
- Top repeat: n=4 `Shell|command=python3 /Users/jondev/.agents/skills/subagent-sprawl/scripts/boot.py \
  --packet-file /tmp/agent-work-smell-sprawl/packet-pat…`

#### `3f9a6631@747931`
- Phased modularization with quality gates → extreme Read/StrReplace thrash on `chat-surface.ts` / markdown modules (15×/13× repeats). User later: “we need to change this.” Marked fatal.
- Jev: thrash p=0.87, wrong_scope p=0.54, user_correct p=0.90, missing_verify p=0.73
- Top repeat: n=15 `Read|path=/Users/jondev/dev/active/socratink/product/socratink/src/ui/chat-surface.ts…`

#### `e8a25b04 (dup keys)`
- Subagent under side-chat boundary + sprawl packets; user correction required (p≈0.9). Repeated boot.py and product file re-reads. Shows handoff-boundary + thrash co-occurrence. Deduplicate by source_path in future runs.
- Jev: thrash p=0.87, wrong_scope p=0.73, user_correct p=0.91, missing_verify p=0.80
- Top repeat: n=7 `Shell|command=python3 /Users/jondev/.agents/skills/subagent-sprawl/scripts/boot.py \
  --packet-file /Users/jondev/.agents/runtime/sprawl/fp…`

#### `a09316e9@4924e1`
- Production FreeLLMAPI + verify while Captain away → later timeout troubleshooting. Extreme repeats on `chat-surface.ts` (57× Read / 49× StrReplace). Trust-heavy prompt (“I trust you”) without a single-sentence outcome plate mid-flight.
- Jev: thrash p=0.83, wrong_scope p=0.65, user_correct p=0.22, missing_verify p=0.68
- Top repeat: n=57 `Read|path=/Users/jondev/dev/active/socratink/product/socratink/src/ui/chat-surface.ts…`

#### `f4d88dd4@223989`
- Prototype loop under `/tmp/socratink-prototype` with repeated StrReplace/Playwright; starts from .gitignore ask — scope expansion into UI prototype thrash.
- Jev: thrash p=0.85, wrong_scope p=0.79, user_correct p=0.48, missing_verify p=0.70
- Top repeat: n=15 `StrReplace|path=/tmp/socratink-prototype/downstream-chat-v6.html…`

#### `f5892573`
- Landing aperture study with clear plate, then sphere fidelity grill — lower thrash relative to peers; still ranked for lost_goal risk when goals stack. Useful contrast: explicit plate helped.
- Jev: thrash p=0.82, wrong_scope p=0.86, user_correct p=0.77, missing_verify p=0.49
- Top repeat: n=11 `StrReplace|path=/Users/jondev/dev/active/socratink/prod/socratink-landing/.scratch/inkwell-vision-landing/v0.1/organic-sphere/src/style.css…`

#### `fae4006d@5ad6f6`
- Clear destructive restart of Chat empty state (“Do not salvage”). Repeated StrReplace on effects/CSS — thrash even when goal is clear; needs stop-on-proof.
- Jev: thrash p=0.78, wrong_scope p=0.57, user_correct p=0.39, missing_verify p=0.62
- Top repeat: n=16 `StrReplace|path=/Users/jondev/dev/active/socratink/product/socratink/src/ui/effects/organic-sphere.ts…`

#### `c2a77998@d7fba1`
- Validate/fix cache-bust + connection leak + push issues; high error-ish text + lost_goal/wrong_scope Nouls — multi-issue pile-on without one-sentence outcome.
- Jev: thrash p=0.57, wrong_scope p=0.78, user_correct p=0.26, missing_verify p=0.74
- Top repeat: n=6 `Read|path=/Users/jondev/dev/socratink/prod/socratink-app/scripts/agent-push.py…`

## Primary postmortems (outside the 50)

### EVT-0001 / SRC-0010 / PROC-0002 — validation-driven scope substitution (2026-08-24)
- Requested: trace normal Socratink runs in Braintrust.
- Observed: R1 learner-evidence product expansion (~3.5k lines) then reverted.
- Lesson: dogfood/vet/scientific language raises **proof** obligation, not **scope** authority.
- Already encoded in product `AGENTS.md` working method §3 and archived `PROC-0002` tripwires.

### TUI documents-refactoring postmortem (2026-06-28)
- Fresh worktree commit failed: missing `node_modules` / eslint not found.
- Lesson: document `npm ci` / `pnpm install` before first commit in new worktrees; don’t retry the same failing commit.

### Codex summary — learning-context rot analogy (2026-08-13)
- Provisional product language: Information Window / Learning-Context Rot.
- Operator parallel: do not maximize context entering the agent window; keep the smallest set that enables the next correct act.

## Captain playbook

1. **One-sentence plate** before any long agent run: observable outcome, cwd/worktree, proof, stop condition. Paste it at the top of every follow-up.
2. **Separate proof words from build words.** “Dogfood / vet / scientific” → strengthen checks; never imply a second product.
3. **Prefer load-on-demand docs.** Keep AGENTS.md short; put postmortems and eval research behind explicit pointers (already started in workspace AGENTS).
4. **Interrupt thrash early.** If the same file is edited >~5 cycles without a passing gate, stop the agent and rewrite the plate.
5. **Side-chat / subagent boundaries are load-bearing.** When spawning workers, restate the packet only; do not rely on inherited parent history.
6. **Ask for evidence class labels** in replies: verified / inference / unknown — matches Brain posture and reduces shallow confirmations.
7. **After a costly fail, demand a dated learning note** under `.agents/learnings/` before retrying the same campaign.

## Agent playbook

1. Write the requested observable outcome in one sentence; treat Brain milestones as constraints, not alternate jobs.
2. Read the smallest owner instructions (`AGENTS.md`, `ZEN.md`, matching skill) before broad search.
3. If a tool call fails: diagnose → change one variable → retry once. Never identical retry loops.
4. Cap re-reads: if you Read the same path ≥3 times in a phase, summarize what you still lack or stop and ask.
5. New worktree ⇒ install deps before first commit/hook.
6. Subagent: obey side-chat boundaries; parent history is reference only.
7. Stop when the stated outcome is proven; do not “improve adjacent surfaces.”
8. Never put secrets, raw `.env`, or unrelated chat into tool args or reports.

## Concrete change candidates

| Target | Candidate change | Why |
| --- | --- | --- |
| `product/socratink/AGENTS.md` | Add a **Thrash tripwire** bullet: ≥3 identical tool signatures or ≥5 edit cycles on one file without green gate ⇒ stop and restate plate | Dominant sample smell |
| `product/socratink/AGENTS.md` | Add **Worktree install** note: run `pnpm install --frozen-lockfile` before first commit in a new worktree | TUI postmortem |
| Workspace `AGENTS.md` | Keep eval/postmortem paths load-on-demand (already); add pointer to this report under chat-signal | Prevent stuffing |
| `.agents/learnings/` | Template: Requested job / Substituted job / Evidence / Stop rule / Regression test | Codify EVT-0001 pattern |
| Agent skill / packet runner | Require `outcome`, `cwd`, `proof`, `stop` fields; refuse boot if missing | Side-chat + sprawl failures |
| Research tooling | Deduplicate sessions by `source_path`, not UUID alone (subagent UUID collisions) | Duplicate e8a25b04 rows |
| Optional Jev monitor | Nightly smell prefilter on new transcripts; alert on severity≥2 + user_correct p≥0.7 | Operationalize this report |


## External primary sources (companion brief)

Companion (verified WebSearch/WebFetch/curl; Grok-fabricated URLs discarded): `/workspace/socratink/research/2026-09-15-context-management-smells-primary-sources.md`
Also mirrored under product research if copied: same filename beside this report’s smell-runs folder.

| Our taxonomy | External support (as-of 2026-09-15) |
| --- | --- |
| T2 Tool thrash / retry loops | Magentic-One `persistent-inefficient-actions` (arXiv 2411.04468); Claude Code “correcting over and over” → clear after ~2 fails ([best practices](https://code.claude.com/docs/en/best-practices)) |
| T3 Lost goal / plate drift | Anthropic context rot + compaction loss ([effective context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents), 2025-09-29); METR long-horizon reliability ([2025-03-19](https://metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks/)) |
| T4 Ignored standing instructions | Claude Code over-specified CLAUDE.md ignored in noise; Codex layered AGENTS.md size-capped ([Codex agent loop](https://openai.com/index/unrolling-the-codex-agent-loop/), 2026-01-23) |
| T5 Wrong cwd / worktree | Codex shell `workdir` + environment cwd; Magentic-One inefficient-navigation |
| T6 Context stuffing | Anthropic attention budget / kitchen-sink sessions; platform context editing clears stale tool results ([context management](https://www.anthropic.com/news/context-management)) |
| T7 Missing verification | Claude Code trust-then-verify; Magentic-One `insufficient-verification-steps` |
| T8 Hallucinated state | AgentRx “Invention of New Information” ([2026-03-12](https://www.microsoft.com/en-us/research/blog/systematic-debugging-for-ai-agents-introducing-the-agentrx-framework/)) |
| T9 Multi-agent handoff rot | Anthropic multi-agent research vague delegation + artifact handoffs ([2025-06-13](https://www.anthropic.com/engineering/multi-agent-research-system)) |
| T10 Premature stop / recovery | Claude Code stop hooks / goal gates; Magentic-One stall→replan; resume from failure point |
| T11 Secret / exfil | GitHub Copilot agentic security principles ([2025-11-25](https://github.blog/ai-and-ml/github-copilot/how-githubs-agentic-security-principles-make-our-ai-agents-as-secure-as-possible/)) |

**Playbook reinforcement from primaries (already aligned with captain/agent sections above):** smallest high-signal context; clear between unrelated tasks; after ~2 failed corrections rewrite plate; verification stop-gates; detailed subagent briefs + artifact refs (not parent transcript dump); stall→replan not identical retry; least privilege / no ambient secrets.

## Assumptions / open questions / could not check

**Assumptions**
- Smell-biased sample overstates thrash vs a random sample; frequencies are for triage design, not base rates.
- Companion primary-sources brief is now at `/workspace/socratink/research/2026-09-15-context-management-smells-primary-sources.md` (Grok pass discarded for fabricated URLs; facts verified via WebFetch/curl). Session frequencies remain local-only.

**Open questions**
- Should thrash thresholds differ for UI polish vs backend wiring?
- Include Codex/omp sessions in v2 frequency tables?
- Promote a short live Canon/ops note from EVT-0001 (founder authority) vs leave archived PROC pointer?

**Could not check**
- True tool exit codes / stderr (absent from Cursor jsonl).
- Token counts / context window occupancy.
- Whether commits in thrash sessions ultimately shipped value (out of scope for this smell report).

## Artifacts

- `research/chat-signal/smell-runs/smell-pack-v2.json`
- `research/chat-signal/smell-runs/smell-scores-v2.json`
- Factory mirror: `/home/box/agent-data/grok-ship/reports/FM-CTXSMELL-01.md`
