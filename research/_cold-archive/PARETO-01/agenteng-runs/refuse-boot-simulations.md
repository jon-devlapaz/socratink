# Refuse-boot simulations — Firstmate (T5.2)

- **As-of:** 2026-09-15 21:14 CT
- **Ticket:** FM-AGENTENG-01 · Researchy burn-tranche-5 · T5.2
- **Mode:** research-only · Brain untouched · factory.db **not done** · no PR · no SendToUser · Mac sync skipped
- **Companion JSON:** `refuse-boot-simulations.json`
- **Question:** What do real corpus openers look like when Firstmate should **refuse boot** for **S010 / S013 / S014** — and what should Captain replate instead?

**Labels:** **Verified (V)** · **Assumption (A)** · **Inference (I)** · **Unknown (U)**

---

## 0. One-liner

Five anonymized corpus openers (session-id prefixes already public in packs) that fail the Firstmate boot gate: missing one-sentence Outcome (**S010**), bare Codex/Cursor resume (**S013**), or trust-away without plate+proof (**S014**). Refuse → Captain pastes rewritten `/goal`+repo+cwd+proof+stop+Not-in-this-PR.

---

## 1. Doctrine map (refuse-boot)

| S* | Title (loops / smell-catalog) | Firstmate action | Happy antidote |
| --- | --- | --- | --- |
| **S010** | No one-sentence Outcome / Goal Prompt | **Refuse boot**; demand `/goal` | N010, N014, N015, H08, H10, H15, H77 |
| **S013** | “Continue where Codex left off” alone | Refuse bare resume; demand plate rewrite from repo truth | N013, H11 |
| **S014** | “I trust you” / away without restated plate+proof | Refuse trust-away; paste plate+proof before leave | N010, H10 |

**Boot fields (draft-goal-template / tripwire):** `/goal` · repo · cwd/worktree · proof or honest `Unverified:` · stop · Not-in-this-PR.

**Nearest Codex twins:** CR-S05 ↔ S013 · CR-S04 ↔ S014 (over_trust before Outcome).

---

## 2. Five simulations

### RB-01 · `c2a77998` · **S010** · V

| Field | Value |
| --- | --- |
| **Session prefix** | `c2a77998` (pack-public) |
| **Primary S*** | **S010** |
| **Also** | `T3`, `F5`, `H77` |
| **Nearest + note** | Maps S010 explicitly (no one-sentence Outcome / Goal Prompt). Multi-issue pile-on is the loops F5 poster. |

**Opener paraphrase:** Captain asks the agent to validate these two issues and fix if needed, then pastes (1) missing CSS cache-bust version bumps across three parent pins and (2) untracked test fixtures required by CLI/TUI harness tests, plus a minor dead-code note.

**Opener (anonymized quote):**

```text
can you validate these two issues and fix if needed?

Two issues:
1. Missing CSS cache-bust bumps. `<repo>/public/css/layout.css` changed but three parent pins were not bumped (`styles.css` / `index.css` / `index.html` query versions).
2. Untracked fixtures under `tests/fixtures/…` required by harness tests — suite will fail in CI if not added.
Minor: unreachable nav-loop toggle branch (harmless dead code).
```

**Why Firstmate refuses boot:** Firstmate boot gate (N010/S010) requires one observable `/goal` + repo + cwd + proof + stop + Not-in-this-PR before tools. A multi-issue validate/fix opener has zero single Outcome sentence, no named proof commands, no stop condition — classic lost_goal / wrong_scope at intake (plate_score≈1, goalish=False in loops mine).

**Captain should replate instead:**

```text
/goal Bump the three CSS cache-bust pins so the layout.css change is served; leave fixtures for a follow-up.
repo: <product-remote>
cwd: <product-worktree>
proof: grep/pin check + `pnpm check` (or named fixture test if fixtures in-scope)
stop: when the three pins match the new asset version; do not touch fixtures or dead-code nav in this plate
Not-in-this-PR: fixture add; nav-loop cleanup; drive-by refactors
```

**Sources:** loops-v2-session-mine structural_mines c2a77998; strata-pack-v3 text_excerpt_redacted; smell-catalog-dense S010/F5; canonical-extract-index H77/S010; happy-paths planning WRONG; draft-agents-thrash-tripwire boot gate

---

### RB-02 · `01f95165` · **S010** · V

| Field | Value |
| --- | --- |
| **Session prefix** | `01f95165` (pack-public) |
| **Primary S*** | **S010** |
| **Also** | `T3`, `T15` |
| **Nearest + note** | Maps S010 explicitly — thin UI poke with no Goal Prompt, proof, or stop (loops mine plate_score=0, goalish=False, proofish=False). |

**Opener paraphrase:** Captain asks whether the agent can make the mouse move at regular speed in the app — a one-line feel request with no plate fields.

**Opener (anonymized quote):**

```text
can you make the mouse move at regular speed in the app?
```

**Why Firstmate refuses boot:** Refuse-boot fires when Outcome/Goal Prompt is missing. This opener names a vague feel change with no observable done-when, no cwd/owner module, no proof (`pnpm check` / visual gate), and no stop — Firstmate cannot hand off without inventing scope (N010).

**Captain should replate instead:**

```text
/goal Cursor overlay moves at the same perceived speed as the native pointer on the chat surface (no lag/acceleration mismatch).
repo: <product-remote>
cwd: <product-worktree>
proof: manual pointer path at fixed px + `pnpm check` on owner module (e.g. smooth-cursor / chat-surface)
stop: when speed matches native in one recorded path; no other cursor cosmetics
Not-in-this-PR: cursor shape/theme; textarea caret; fused-bar work
```

**Sources:** loops-v2-session-mine structural_mines 01f95165; smell-catalog-dense S010; draft-goal-template master /goal block; draft-agents-thrash-tripwire ban openers

---

### RB-03 · `b06e3da7` · **S013** · V

| Field | Value |
| --- | --- |
| **Session prefix** | `b06e3da7` (pack-public) |
| **Primary S*** | **S013** |
| **Also** | `T14`, `F8`, `CR-S05`, `H11`, `N013` |
| **Nearest + note** | Maps S013 explicitly. Soft-joins PRs #5/#6 in packs — can still ship, which is why resume-without-rewrite is a briefing smell not a merge-ban alone. CR-S05 is nearest Codex twin (model-switch continue without rewritten plate). |

**Opener paraphrase:** Captain asks the agent to pick up where Codex left off after usage limits ran out, then pastes a staging status dump (private service healthy, Postgres/migrations, Docker build, branch/commit, remaining promotion gate = one real AI Gateway conversation + restart/history recovery) and asks to create/transfer a gateway key into the private host.

**Opener (anonymized quote):**

```text
can you pick up where codex left off? usage limits ran out:

Northflank staging is deployed and healthy.
- Private service: <staging-service>
- Private PostgreSQL: running with Flue migrations
- Remote Docker build: successful
- Branch: codex/<staging-branch>
- Commit: <short-sha>
- Local checks … passed; worktree clean
The remaining promotion gate is one real AI Gateway conversation followed by a host restart and history recovery…
Please reply: Create and transfer the Vercel AI Gateway key to Northflank.
```

**Why Firstmate refuses boot:** S013 / T14: continuity prompt ≠ Outcome/cwd/proof/stop. Inheriting Codex narrative + status dump without rewriting `/goal`+proof from current repo truth is fatal handoff rot (CR-S05 why). Firstmate refuses bare resume; thread is context only.

**Captain should replate instead:**

```text
/goal Staging host has a persistent AI Gateway credential and recovers chat history after one restart (promotion gate closed).
repo: <product-remote>
cwd: <product-worktree>  # confirm branch/commit from `git status`/`git log -1`, do not trust paste alone
proof: named CLI checks for secret present + one approved live Chat turn + restart + history readback; or Unverified: live Chat with residual listed
stop: when restart recovery proof is green for this gate only
Not-in-this-PR: making Northflank one-stop for everything; unrelated infra widen; Brain mutation
# Resume rule: rewrite plate from repo truth; ban continue-alone (N013/H11)
```

**Sources:** strata-pack-v3 b06e3da7 user_query; loops F8 / S013; canonical-extract-index N013/S013/CR-S05; happy-paths AH10 / planning WRONG; draft-agents-thrash-tripwire resume rewrite

---

### RB-04 · `316e90d5` · **S013** · V

| Field | Value |
| --- | --- |
| **Session prefix** | `316e90d5` (pack-public) |
| **Primary S*** | **S013** |
| **Also** | `T14`, `F8`, `T10`, `CR-S05` |
| **Nearest + note** | Maps S013 explicitly (harness resume without plate rewrite). Nearest CR-S05 (model-switch / continue-without-rewrite). Co-travels T10 recovery failure when agent replays Codex tail instead of a new falsifiable Outcome. |

**Opener paraphrase:** Captain says Codex usage ran out mid Praxist run and asks the agent to determine what Codex did, where it left off, and what is pending from a pasted tool/error tail (baseline schema defect, hook exit 127, stop/relaunch notes).

**Opener (anonymized quote):**

```text
my codex usage ran out mid praxist. can you determine what it did, where it left off, and what is pending from this tail end?

• The run launched, but … Praxist parsed the baseline as 0.0 instead of the measured 0.3057… stopping … correcting the baseline schema, and relaunching…
• PreToolUse/PostToolUse hook (failed) exit 127
• Edited praxist_task/task.yaml baseline fields…
(+ long Codex tool/error tail)
```

**Why Firstmate refuses boot:** Bare resume/diagnose-from-Codex-tail without a rewritten one-sentence Outcome + proof + stop. Continuity of another harness's transcript is not a plate (S013). Boot should refuse until Captain states the single next observable outcome from current repo truth (often: fix baseline schema OR stop campaign — not both).

**Captain should replate instead:**

```text
/goal Praxist task.yaml baseline uses metric_name/metric_value so a fresh run compares against 0.3057 (not 0.0); no full campaign relaunch in this plate.
repo: <product-remote>
cwd: <product-worktree>/praxist_task
proof: `praxist status`/`validate` (or named diagnostic) shows baseline 0.3057; hook-127 is Unverified unless fixed in-scope
stop: when baseline schema proof is green; do not start gen campaigns
Not-in-this-PR: multi-generation Praxist campaign; FreeLLM model swap; unrelated hook install
# After ~2 failed corrections rewrite plate again (T10)
```

**Sources:** strata-pack-v3 316e90d5 user_query; loops F8 / S013; smell-catalog-dense T14/T10; canonical-extract-index S013/CR-S05; draft-agents-thrash-tripwire

---

### RB-05 · `a09316e9` · **S014** · V

| Field | Value |
| --- | --- |
| **Session prefix** | `a09316e9` (pack-public) |
| **Primary S*** | **S014** |
| **Also** | `T13`, `F3`, `CR-S04`, `S010`, `S030` |
| **Nearest + note** | Maps S014 explicitly (over-trust / away without restated plate+proof). Prior turn in same session configured FreeLLMAPI on deployed production for a hiring-share — already weak plate (S010 co-travel). CR-S04 is nearest Codex twin (oh-my-codex multi-agent before one-sentence Outcome). Session later hits extreme path thrash (S030) — Axis A ∩ thrash warning. |

**Opener paraphrase:** After asking to configure FreeLLMAPI on deployed production (credits exhausted; about to share with hiring team), Captain says they are going to shower and asks the agent to agentically get it working and deployed with verification checks, ending with I trust you can do this.

**Opener (anonymized quote):**

```text
[prior] please configure the freeLLMAPI for <product> on deployed production. i think its using free credits but they ran out and am about to share to hiring team.

[refuse-boot opener] im going to shower now. please agentically get this working and deployed with verifiaction checks. I trust you can do this.
```

**Why Firstmate refuses boot:** S014 / T13: trust-away without restated plate+proof licenses unsupervised widen. Firstmate refuses: trust is not a done-when; production provider switch needs falsifiable proof/stop (and usually Ship-cloud + residual Unverified for live paths). Ban openers per tripwire draft.

**Captain should replate instead:**

```text
/goal Production Chat provider uses FreeLLMAPI (or named fallback) so a hiring-share turn does not die on exhausted gateway credits.
repo: <product-remote>
cwd: <product-worktree>
proof: named env/config check on host + one throwaway live turn OR Unverified: live Chat path with residual ticket
stop: when provider proof is green for hiring-share; no UI polish
Not-in-this-PR: chat-surface/styles thrash; unrelated deploy widen; Brain mutation
# Do not leave on trust-away — paste this plate before stepping away (N010/H10)
```

**Sources:** strata-pack-v3 a09316e9 user_queries; loops F3 / S014 / Axis A thrash intersection; smell-catalog-dense T13/F3/S014; canonical-extract-index S014/CR-S04; happy-paths planning WRONG AH10; draft-agents-thrash-tripwire

---

## 3. Coverage matrix

| Sim | Prefix | S010 | S013 | S014 | Nearest CR* |
| --- | --- | :---: | :---: | :---: | --- |
| RB-01 | `c2a77998` | ● | | | — (F5/T3) |
| RB-02 | `01f95165` | ● | | | — |
| RB-03 | `b06e3da7` | | ● | | CR-S05 |
| RB-04 | `316e90d5` | | ● | | CR-S05 |
| RB-05 | `a09316e9` | co-travel | | ● | CR-S04 |

● = primary fire. RB-05 notes prior FreeLLMAPI production ask as **S010 co-travel** before the trust-away line.

---

## 4. Contrast — what passes boot (not a sim)

Gold intake `1def40b7` opens with named **Goal Prompt** + Context/Authority + stop-when-proven language (N015) — closest IDE `/goal` in corpus. Still needs stop-on-proof culture; listed only as positive contrast (**V** · loops gold_intake).

---

## 5. Anonymization

- Absolute home/dev paths → `<HOME>/…`, `<product-worktree>`, `<product-remote>`.
- Host/service/branch names generalized where not already pack-public abbreviations.
- Session **prefixes** kept (`c2a77998`, `b06e3da7`, `316e90d5`, `a09316e9`, `01f95165`) — already cited across loops / smell-catalog / happy-paths / canonical-extract-index.
- No secrets, tokens, or live credentials reproduced.

---

## 6. Caveats

- Strata `text_excerpt_redacted` / loops `first_user_excerpt` sometimes capture harness preambles first; user_query blocks above are the refuse-boot openers (**V** from strata excerpts).
- `b06e3da7` later soft-joins #5/#6 — refuse-boot is about **intake plate quality**, not “never ships.”
- Simulations are research doctrine for Firstmate routing — **not** product `AGENTS.md` landings.

---

## 7. Sources spine

- `canonical-extract-index` S010/S013/S014 · N010/N013 · CR-S04/CR-S05
- `smell-catalog-dense` S010/S013/S014 · T13/T14 · F3/F5/F8
- `draft-agents-thrash-tripwire` boot gate + ban openers
- `draft-goal-template` master `/goal` block
- `FM-AGENTENG-01-loops` § intake / F3/F5/F8 / top-10 S*
- `loops-v2-session-mine.json` + `strata-pack-v3.json` real openers
- `FM-AGENTENG-01-happy-paths` planning WRONG / AH10
- `happy-nuggets` H10/H11/H77

**Status:** research draft under `agenteng-runs/` + mirrored `grok-ship/reports/` — Brain untouched · factory not marked done.
