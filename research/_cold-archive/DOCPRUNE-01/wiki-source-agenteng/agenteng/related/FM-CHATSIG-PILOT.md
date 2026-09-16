# FM-CHATSIG-PILOT — TypeSafe Jev scoring of coding-agent sessions

**As-of:** 2026-09-15 20:16 CT  
**Task:** Authorized pilot — score ~50 sessions with Jev; Axis A + B ranked lists. Research report only. **No PR.**  
**Corpus:** `current-home-live` → `home-live-20260915-1952` Cursor `agent-transcripts` with socratink project slugs.  
**Method:** normalize → git lifecycle join → privacy redact → one System One call per session (Axis A+B) → code-owned composite ranks.

## Summary

- Extracted **199** socratink Cursor transcripts; selected **50** stratified (**25** with `commits_in_window>0`, **25** without). Pool with commits: **106**.
- Scored **50/50** via `@typesafe-ai/sdk` `systemOne` (Jev). Errors: **0**.
- Composition weights per FM-CHATSIG-01; deterministic `code_boost = min(0.25, 0.05 * commits_in_window)`. No vanity % UX — ranks, band labels, evidence bullets.
- Secrets: redacted before API; `TYPESAFE_API_KEY` used from box secret store (never written into this report).

## Axis A — Product needle (shipping)

| Rank | Score | Band | Kind | Commits | Session | Project |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1.150 | milestone (score≈2.99) | implementation | 4 | `b06e3da7…` | `active-socratink-product-socratink` |
| 2 | 1.091 | mergeable (score≈2.48) | implementation | 28 | `b23609bb…` | `active-socratink-product-socratink` |
| 3 | 1.083 | milestone (score≈2.68) | design | 35 | `c585e8d6…` | `active-socratink-product-socratink` |
| 4 | 1.076 | milestone (score≈2.56) | implementation | 8 | `430c4785…` | `active-socratink-landing` |
| 5 | 1.073 | milestone (score≈2.62) | implementation | 15 | `a09316e9…` | `active-socratink-product-socratink` |
| 6 | 1.032 | mergeable (score≈2.32) | implementation | 9 | `1def40b7…` | `active-socratink-product-socratink` |
| 7 | 0.997 | mergeable (score≈1.95) | implementation | 10 | `64fde956…` | `active-socratink-product-socratink` |
| 8 | 0.994 | mergeable (score≈2.32) | implementation | 10 | `fae4006d…` | `active-socratink-product-socratink` |
| 9 | 0.986 | mergeable (score≈2.19) | implementation | 9 | `357a2e9e…` | `active-socratink-product-socratink` |
| 10 | 0.977 | mergeable (score≈2.05) | debug | 6 | `316e90d5…` | `active-socratink-product-socratink` |
| 11 | 0.947 | mergeable (score≈2.08) | implementation | 7 | `97408866…` | `active-socratink-product-socratink` |
| 12 | 0.941 | mergeable (score≈1.98) | implementation | 7 | `e1fe36a4…` | `active-socratink-product-socratink` |
| 13 | 0.932 | mergeable (score≈1.98) | implementation | 9 | `2fb70153…` | `active-socratink-product-socratink` |
| 14 | 0.919 | mergeable (score≈2.01) | implementation | 9 | `df80810e…` | `active-socratink-product-socratink` |
| 15 | 0.909 | mergeable (score≈1.82) | implementation | 10 | `b2f082d5…` | `active-socratink-product-socratink` |
| 16 | 0.891 | mergeable (score≈2.50) | implementation | 2 | `444749b4…` | `active-socratink-product-socratink` |
| 17 | 0.873 | mergeable (score≈2.00) | implementation | 12 | `202b533e…` | `active-socratink-product-socratink` |
| 18 | 0.847 | mergeable (score≈1.50) | implementation | 9 | `3f9a6631…` | `active-socratink-product-socratink` |
| 19 | 0.812 | mergeable (score≈1.68) | implementation | 13 | `29896b44…` | `active-socratink-product-socratink` |
| 20 | 0.789 | mergeable (score≈1.85) | design | 3 | `891f9f25…` | `active-socratink-landing` |

### Axis A — top 10 evidence

#### #1 `b06e3da7-48bc-402e-b015-5632e0be88da` — composite 1.150
- git: 4 commit(s) in window — e.g. `a033e873 Merge pull request #6 from jon-devlapaz/fix/vercel-chat-oidc-boot`
- shipped_code_change p=0.95
- unblocked_milestone p=0.94
- architecture_decision_landed p=0.88
- kind_a=implementation conf=0.42
- needle_band=milestone (score≈2.99)

#### #2 `b23609bb-0c9c-42ad-9894-7847b1aae21b` — composite 1.091
- git: 28 commit(s) in window — e.g. `76bb67d6 Import Fluid pool attach from db-connections, not the package barrel.`
- shipped_code_change p=0.96
- unblocked_milestone p=0.75
- architecture_decision_landed p=0.81
- kind_a=implementation conf=0.93
- needle_band=mergeable (score≈2.48)

#### #3 `c585e8d6-1893-4da5-bba8-1a0295583d57` — composite 1.083
- git: 35 commit(s) in window — e.g. `9476612a feat(ui): add rotating wait copy for in-flight replies`
- shipped_code_change p=0.88
- unblocked_milestone p=0.72
- architecture_decision_landed p=0.78
- kind_a=design conf=0.26
- needle_band=milestone (score≈2.68)

#### #4 `430c4785-99a5-4355-83d6-c5314041f7f3` — composite 1.076
- git: 8 commit(s) in window — e.g. `d458f72 Match the app favicon: a bare ink orb on transparent.`
- shipped_code_change p=0.95
- unblocked_milestone p=0.58
- architecture_decision_landed p=0.87
- kind_a=implementation conf=1.00
- needle_band=milestone (score≈2.56)

#### #5 `a09316e9-6e8b-4e04-a7c9-30b266ec40e2` — composite 1.073
- git: 15 commit(s) in window — e.g. `131f2cec Add Andrej and Kenneth specialist roles with eval fixtures and harness shims.`
- shipped_code_change p=0.95
- unblocked_milestone p=0.70
- architecture_decision_landed p=0.70
- kind_a=implementation conf=0.92
- needle_band=milestone (score≈2.62)

#### #6 `1def40b7-fa28-4a4c-aebf-6fbdceb396a6` — composite 1.032
- git: 9 commit(s) in window — e.g. `fe004182 feat(evidence): add unmounted R1 record contracts`
- shipped_code_change p=0.94
- architecture_decision_landed p=0.93
- kind_a=implementation conf=0.37
- needle_band=mergeable (score≈2.32)
- code_boost=+0.25

#### #7 `64fde956-4c99-476a-9265-0bedb8845667` — composite 0.997
- git: 10 commit(s) in window — e.g. `f02bd13d Keep the composer open after a confirmed stop so a new message can be sent.`
- shipped_code_change p=0.95
- unblocked_milestone p=0.55
- architecture_decision_landed p=0.86
- kind_a=implementation conf=0.99
- needle_band=mergeable (score≈1.95)

#### #8 `fae4006d-f921-462f-98be-6bc47129dd4d` — composite 0.994
- git: 10 commit(s) in window — e.g. `f02bd13d Keep the composer open after a confirmed stop so a new message can be sent.`
- shipped_code_change p=0.94
- architecture_decision_landed p=0.81
- kind_a=implementation conf=0.98
- needle_band=mergeable (score≈2.32)
- code_boost=+0.25

#### #9 `357a2e9e-af77-4411-8da7-6efe95234ea9` — composite 0.986
- git: 9 commit(s) in window — e.g. `3e8c0ef4 delete handoff`
- shipped_code_change p=0.92
- unblocked_milestone p=0.57
- architecture_decision_landed p=0.68
- kind_a=implementation conf=0.99
- needle_band=mergeable (score≈2.19)

#### #10 `316e90d5-9037-43f1-9853-36175d628813` — composite 0.977
- git: 6 commit(s) in window — e.g. `b0192e68 Enhance AGENTS.md with guidance on reading postmortems before Praxist runs and multi-agent campaigns. Add a new postmortem file detailing the negative outcomes of a Praxist protocol-reliability campaign, including stop rules and lessons learned. Introduce a README in the learnings directory to outline when to read and add postmortems, emphasizing the importance of documenting costly failures for future reference.`
- shipped_code_change p=0.88
- architecture_decision_landed p=0.88
- kind_a=debug conf=0.95
- needle_band=mergeable (score≈2.05)
- code_boost=+0.25

## Axis B — Productization / profitability signal

| Rank | Score | Band | Theme | Session | Project |
| --- | --- | --- | --- | --- | --- |
| 1 | 0.903 | doctrine-grade (score≈2.95) | moat | `f57a99e7…` | `socratink-prod-socratink-app-training-sync-due` |
| 2 | 0.774 | doctrine-grade (score≈2.94) | gtm | `e8a25b04…` | `socratink-prod-socratink-app` |
| 3 | 0.732 | doctrine-grade (score≈2.84) | gtm | `e8a25b04…` | `socratink-prod-socratink-app` |
| 4 | 0.555 | doctrine-grade (score≈2.68) | pedagogy | `84579c75…` | `active-socratink-product-socratink` |
| 5 | 0.500 | actionable (score≈2.08) | pedagogy | `202b533e…` | `active-socratink-product-socratink` |
| 6 | 0.459 | actionable (score≈2.26) | pedagogy | `07847e35…` | `socratink-prod-socratink-app` |
| 7 | 0.445 | actionable (score≈1.64) | pedagogy | `c585e8d6…` | `active-socratink-product-socratink` |
| 8 | 0.442 | actionable (score≈2.01) | pedagogy | `4d0e878b…` | `active-socratink-product-socratink` |
| 9 | 0.421 | actionable (score≈1.53) | pedagogy | `1def40b7…` | `active-socratink-product-socratink` |
| 10 | 0.418 | actionable (score≈1.92) | none | `b48587b4…` | `socratink-research-socratink-research-vault` |
| 11 | 0.416 | actionable (score≈1.99) | none | `444749b4…` | `active-socratink-product-socratink` |
| 12 | 0.400 | actionable (score≈2.04) | pedagogy | `316e90d5…` | `active-socratink-product-socratink` |
| 13 | 0.398 | actionable (score≈1.58) | pedagogy | `44e8029b…` | `socratink-prod-socratink-app` |
| 14 | 0.376 | actionable (score≈1.79) | pedagogy | `64fde956…` | `active-socratink-product-socratink` |
| 15 | 0.367 | actionable (score≈1.58) | pedagogy | `b2f082d5…` | `active-socratink-product-socratink` |
| 16 | 0.366 | actionable (score≈1.96) | none | `19c63579…` | `socratink-prod-socratink-app` |
| 17 | 0.364 | actionable (score≈1.87) | none | `582bef0a…` | `socratink-prod-socratink-app` |
| 18 | 0.359 | actionable (score≈1.59) | pedagogy | `29896b44…` | `active-socratink-product-socratink` |
| 19 | 0.341 | actionable (score≈1.76) | none | `891f9f25…` | `active-socratink-landing` |
| 20 | 0.317 | fleeting (score≈1.28) | pedagogy | `fae4006d…` | `active-socratink-product-socratink` |

### Axis B — top 10 evidence

#### #1 `f57a99e7-7502-435b-b366-94f165d9636b` — composite 0.903
- brain_worthy p=0.78
- pedagogical_differentiation p=0.95
- mentions_icp_or_buyer p=0.86
- pricing_or_packaging p=0.92
- gtm_or_retention p=0.92
- kind_b=moat

#### #2 `e8a25b04-6d00-4a10-a155-c50fc2c5cb9c` — composite 0.774
- brain_worthy p=0.76
- pedagogical_differentiation p=0.73
- mentions_icp_or_buyer p=0.63
- pricing_or_packaging p=0.55
- gtm_or_retention p=0.90
- kind_b=gtm

#### #3 `e8a25b04-6d00-4a10-a155-c50fc2c5cb9c` — composite 0.732
- brain_worthy p=0.74
- pedagogical_differentiation p=0.65
- mentions_icp_or_buyer p=0.57
- pricing_or_packaging p=0.51
- gtm_or_retention p=0.88
- kind_b=gtm

#### #4 `84579c75-306d-4dfb-8a57-715be3c57202` — composite 0.555
- brain_worthy p=0.83
- pedagogical_differentiation p=0.98
- kind_b=pedagogy
- strategy_band=doctrine-grade (score≈2.68)
- excerpt: Skill Name: socratink-brain…

#### #5 `202b533e-a671-491f-94f0-13a3035be0c1` — composite 0.500
- brain_worthy p=0.72
- pedagogical_differentiation p=0.95
- kind_b=pedagogy
- strategy_band=actionable (score≈2.08)
- excerpt: assistant: Nothing is staged. `main` is 1 commit ahead of origin (`docs: point CONTEXT at the Brain R1 freeze pack`). Everything below is un…

#### #6 `07847e35-01f9-4d1b-b830-1cb34894302b` — composite 0.459
- brain_worthy p=0.61
- pedagogical_differentiation p=0.76
- kind_b=pedagogy
- strategy_band=actionable (score≈2.26)
- excerpt:  You are Claude Fable 5 acting as the productization lead for Socratink.…

#### #7 `c585e8d6-1893-4da5-bba8-1a0295583d57` — composite 0.445
- brain_worthy p=0.81
- pedagogical_differentiation p=0.79
- kind_b=pedagogy
- strategy_band=actionable (score≈1.64)
- excerpt: Path: /Users/jondev/dev/active/socratink/product/socratink/.agents/skills/improve-codebase-architecture/SKILL.md…

#### #8 `4d0e878b-4b4b-475a-8ff5-19036fa0cf1d` — composite 0.442
- brain_worthy p=0.68
- pedagogical_differentiation p=0.78
- kind_b=pedagogy
- strategy_band=actionable (score≈2.01)
- excerpt: assistant: I'll start from the project's working agreements and current tree, then look for issues that actually affect learners or operator…

#### #9 `1def40b7-fa28-4a4c-aebf-6fbdceb396a6` — composite 0.421
- brain_worthy p=0.74
- pedagogical_differentiation p=0.86
- kind_b=pedagogy
- strategy_band=actionable (score≈1.53)
- excerpt: You are working on the Socratink product repository, which currently implements a minimal Flue-backed conversation surface. The strategic di…

#### #10 `b48587b4-52c2-4d32-bb8b-e726f7726791` — composite 0.418
- brain_worthy p=0.67
- kind_b=none
- strategy_band=actionable (score≈1.92)
- excerpt: user: <timestamp>Tuesday, Jul 14, 2026, 1:50 AM (UTC-5)</timestamp>…

## Intersection — top-15 A ∩ top-15 B

| Session | Axis A | Axis B | Project |
| --- | --- | --- | --- |
| `c585e8d6…` | 1.083 (#3) | 0.445 (#7) | `active-socratink-product-socratink` |
| `1def40b7…` | 1.032 (#6) | 0.421 (#9) | `active-socratink-product-socratink` |
| `64fde956…` | 0.997 (#7) | 0.376 (#14) | `active-socratink-product-socratink` |
| `316e90d5…` | 0.977 (#10) | 0.400 (#12) | `active-socratink-product-socratink` |
| `b2f082d5…` | 0.909 (#15) | 0.367 (#15) | `active-socratink-product-socratink` |
| `444749b4…` | 0.891 (#16) | 0.416 (#11) | `active-socratink-product-socratink` |
| `202b533e…` | 0.873 (#17) | 0.500 (#5) | `active-socratink-product-socratink` |
| `84579c75…` | 0.610 (#27) | 0.555 (#4) | `active-socratink-product-socratink` |
| `4d0e878b…` | 0.584 (#29) | 0.442 (#8) | `active-socratink-product-socratink` |
| `b48587b4…` | 0.437 (#35) | 0.418 (#10) | `socratink-research-socratink-research-vault` |

## Assumptions

- Socratink Cursor slug allowlist only (no Codex in this pilot run).
- Git-only lifecycle join (no `gh`); when start≈end collapsed, window widened ±6h then ±2h pad for `git log`.
- Some worktree/branch project slugs map to the parent repo cwd; commits_in_window may over-attribute nearby commits.
- Jev answers are typed probabilities, not ground truth; ranks are for calibration, not auto-promotion into Brain.

## Open questions

- Re-run with Codex (~15–20) for multi-harness calibration?
- Tune Axis B weights after Captain skim of top-10 B (several high-B sessions may be research/vault talk).
- Tighten cwd mapping for `dev-socratink-prod-*` worktrees before map-reducing all 199.

## What could not be checked

- PR/issue URL enrichment (`gh` deferred).
- Whether commits in window were authored by the same agent session (git join is time∩repo only).
- Full transcript fidelity beyond ≤6k redacted excerpt.

## Artifacts

- `research/chat-signal/pilot-runs/sessions-pack.json`
- `research/chat-signal/pilot-runs/scores.json`
- Factory mirror: `/home/box/agent-data/grok-ship/reports/FM-CHATSIG-PILOT.md`
