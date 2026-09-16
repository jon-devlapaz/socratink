# Transferable non-socratink happy/smell pack (FM-AGENTENG-01)

**As-of:** 2026-09-15 ~21:03 CT
**Job:** FM-AGENTENG-01 · Researchy burn-tranche-2 T2.2 · research-only
**Sessions sampled:** 24 · **Items:** 30 (14 happy / 16 smell) · prior 22 + net-new 8
**Relevance:** {'high': 16, 'med': 13, 'low': 1}
**Max Jev top30:** scored=30 err=0 · mean happy_path_fit=0.219 thrash=0.557 is_smell=0.829 is_happy_nugget=0.309
**Live Mac this run:** false (pack-only; machineId target `3ac411d5-1001-4beb-baf5-a38080401d80`)

## Scope
- Beyond product-socratink Cursor strata (`strata-pack-v3` main product/app).
- Keywords/buckets: **tink**, **landing**, **skill-eval** (+ skill-refactor, persona_farm, app-slice, research-vault, socratink-io, flue-wiki).
- IDs only from existing inventory/mines/packs — none invented.
- Gold/anti for Socratink PRs already known; this pack is **transferable** patterns.
- T2.2: Max Jev on top 30 ambiguous; see companion `transferable-jev-top30.md`.

## Selection rule (T2.2 ambiguous top30)
Ambiguous happy-vs-smell / gap-label units from transferable non-socratink pack + related non-product sessions. Include if ANY of: (1) mid happy_path_fit 0.25–0.75; (2) happy≥0.45 AND thrash≥0.45; (3) good velocity band (fast_good|careful_good) with non-none gap; (4) mid plate (1.0–2.2) with gap; (5) prior gap=none with weak happy or low gap_confidence; (6) happy fragment mined from smell-heavy session or smell despite good band/plate; (7) paired H/S items sharing a session. Prefer buckets landing|tink|skill-eval|skill-refactor|persona_farm|app-slice|research-vault|socratink-io|flue-wiki. Rank by reason-count then Socratink-relevance high>med>low; take top 30. Keep prior 22; add net-new.

## Session sample

| harness | bucket | session_id (short) | plate | gap | band | stage |
| --- | --- | --- | ---: | --- | --- | --- |
| cursor | landing | `16a29d67` | 2.19 | thrash | fast_good | impl |
| cursor | landing | `f5892573` | 2.09 | thrash | fast_good | impl |
| cursor | landing | `262573f8` | 2.48 | handoff_rot | fast_wrong | mixed |
| cursor | landing | `73c01e2a` | 1.21 | thrash | slow_thrash | impl |
| cursor | landing | `430c4785` | 0.4 | thrash | slow_thrash | impl |
| cursor | landing | `4f258f91` | 1.7 | handoff_rot | fast_good | ship |
| cursor | landing | `ca5e4f51` | 1.06 | scope_sub | fast_wrong | ship |
| cursor | landing | `891f9f25` | 0.54 | thrash | slow_thrash | impl |
| codex | tink | `2026-08-12T21-04-44…` | 1.54 | missing_verify | careful_good | spec |
| codex | skill-eval | `2026-08-16T12-38-15…` | 0.62 | none | careful_good | research |
| codex | skill-eval | `2026-08-14T20-00-43…` | 0.19 | none | careful_good | research |
| codex | skill-eval | `2026-08-14T00-43-36…` | 0.5 | context_bloat | careful_good | research |
| codex | skill-refactor | `2026-08-12T13-23-52…` | 1.07 | thrash | careful_good | research |
| codex | persona_farm | `2026-08-30T16-13-51…` | 0.75 | governance | careful_good | review |
| cursor | app-slice | `64cfb0da` | 2.8 | over_trust | fast_good | impl |
| cursor | app-slice | `8e82a04d` | 1.53 | missing_verify | careful_good | review |
| cursor | research-vault | `b48587b4` | 1.44 | thrash | slow_thrash | ship |
| cursor | socratink-io | `14d6a02c` | 1.79 | thrash | fast_good | impl |
| cursor | flue-wiki | `22aa0740` | 0.55 | thrash | careful_good | research |
| cursor | research-vault | `87e7b60b` | 0.6 | handoff_rot | fast_good | research |
| codex | landing | `2026-09-09T11-15-41…` | 0.9 | none | careful_good | research |
| codex | socratink-io | `2026-08-09T01-17-16…` | 0.93 | thrash | careful_good | impl |
| codex | landing | `2026-09-05T09-58-40…` | 0.97 | thrash | careful_good | plan |
| codex | landing | `2026-09-11T23-54-18…` | 1.11 | context_bloat | careful_good | mixed |

Bucket counts: `{'landing': 11, 'tink': 1, 'skill-eval': 3, 'skill-refactor': 1, 'persona_farm': 1, 'app-slice': 2, 'research-vault': 2, 'socratink-io': 2, 'flue-wiki': 1}`

## Transferable items

### TN-H01 · HAPPY · Socratink-relevance **high**

- **pattern:** Scratch plate with hard constraints + deliverable triad (smallest files, param map, explicit NOT-implemented).
- **evidence:** cursor 262573f8 landing: Plate under .scratch/.../v0.1/; Stack vanilla Three.js; Hard constraints from minimal-ink-black-hole.md; Deliver 1) smallest HTML/JS/GLSL 2) uniforms map 3) what you deliberately did NOT implement; Do not touch production root. plate=2.48.
- **smell-or-happy:** `happy`
- **Socratink-relevance:** high — Same plate grammar transfers to product UI/shader spikes; already echoed as H16 but origin is landing/scratch, not product PR chain.
- **sessions:** `262573f8-8b59-43db-a3e2-b74ba416a168`
- **bucket:** landing
- **epistemic:** Verified
- **ambiguity:** happy_fragment_from_smell_session, mid_happy@262573f8, paired_h_s_same_session:TN-S04
- **jev:** label=`mixed` gap=`handoff_rot` happy_path_fit=0.440 thrash=0.470 plate=2.510 is_happy=0.510 is_smell=0.810 rel_jev=`high` · epistemic=Verified

### TN-H02 · HAPPY · Socratink-relevance **high**

- **pattern:** Read-first doc list + supersession note + hard Not-in-scope (no backend/auth/analytics/deps) + new branch before Method slice.
- **evidence:** cursor 16a29d67 active-socratink-landing: spike new branch; Read AGENTS.md, method-overhaul-proposal.md, encounter-contract-slip-ship.md; Objective encounter triad; Scope #method only; Preserve hero/discipline/living-ink; Do not add backend/model/analytics/auth/new dep. plate_mine goalish=True plate=2.19.
- **smell-or-happy:** `happy`
- **Socratink-relevance:** high — Landing Method encounter is the public pedagogy surface; Not-in-scope + preserve-WIP directly maps to Socratink PR Outcome/Not-in-this-PR.
- **sessions:** `16a29d67-2ed3-4f3c-874d-ff5b890ba729`
- **bucket:** landing
- **epistemic:** Verified
- **ambiguity:** good_band+gap@16a29d67:fast_good/thrash, happy+thrash@16a29d67, happy_fragment_from_smell_session, mid_happy@16a29d67, mid_plate+gap@16a29d67
- **jev:** label=`mixed` gap=`thrash` happy_path_fit=0.550 thrash=0.700 plate=2.030 is_happy=0.560 is_smell=0.710 rel_jev=`high` · epistemic=Verified

### TN-H03 · HAPPY · Socratink-relevance **high**

- **pattern:** Task-contract protocol: natural language in; read-only discovery first; pause with Outcome/Scope contract before mutating tools.
- **evidence:** codex skill-refactor rollout-2026-08-12T13-23-52-…: Task-contract protocol + Proposed contract Outcome yt-ingest uses ~/Documents/youtube-wiki; read-only location check first; retries_sample=43 but contract gate present. Also skill-eval AGENTS Complexity warning.
- **smell-or-happy:** `happy`
- **Socratink-relevance:** high — Transferable intake gate for any agentic mutate path; pairs with Socratink /goal + plate before tools.
- **sessions:** `rollout-2026-08-12T13-23-52-019ff737-6d9e-7ba3-b71f-31d293083bbc`, `rollout-2026-08-14T00-43-36-019ffecc-1797-7190-9fc7-bb07c647e7d3`
- **bucket:** skill-refactor
- **epistemic:** Inference
- **ambiguity:** good_band+gap@rollout-:careful_good/context_bloat, good_band+gap@rollout-:careful_good/thrash, mid_happy@rollout-, mid_plate+gap@rollout-, paired_h_s_same_session:TN-H07,TN-H10,TN-S06
- **jev:** label=`mixed` gap=`thrash` happy_path_fit=0.190 thrash=0.320 plate=1.580 is_happy=0.400 is_smell=0.690 rel_jev=`high` · epistemic=Verified

### TN-H04 · HAPPY · Socratink-relevance **high**

- **pattern:** Packet worker: cwd lock + pre-edit guard + Success criteria + explicit Do not promote/open PR.
- **evidence:** cursor 64cfb0da orphaned-launch-pad-css: Work only in …/socratink-app-orphaned-launch-pad-css; run agent-work guard; Packet orphaned-launch-pad-css Phase implement; Success: no .launch-pad-* orphaned rules + cache pins; Do not promote or open a PR. plate=2.8.
- **smell-or-happy:** `happy`
- **Socratink-relevance:** high — Canonical side-chat/packet schema for Socratink cloud/IDE workers (pairs H22/H58); non-product slice proves pattern outside main app.
- **sessions:** `64cfb0da-d449-44e6-bf35-dfe506cdbd20`
- **bucket:** app-slice
- **epistemic:** Verified
- **ambiguity:** good_band+gap@64cfb0da:fast_good/over_trust, happy+thrash@64cfb0da, happy_fragment_from_smell_session, mid_happy@64cfb0da
- **jev:** label=`mixed` gap=`over_trust` happy_path_fit=0.340 thrash=0.700 plate=2.720 is_happy=0.500 is_smell=0.850 rel_jev=`high` · epistemic=Verified

### TN-H05 · HAPPY · Socratink-relevance **high**

- **pattern:** Hillclimb ACCEPT/PROVISIONAL stamps + live honesty-gate verify before commit/push.
- **evidence:** cursor 4f258f91 landing: Cut brochure reopen — fix handoff; ACCEPT 16 first then 17; Attempt clicks verified on :4500; Honesty gate holds — guest attempt on app.socratink.ai; stamp ACCEPT 17 then commit+push. stage=ship plate=1.7.
- **smell-or-happy:** `happy`
- **Socratink-relevance:** high — Landing→app handoff honesty is product-critical; transferable ship proof pattern (named verify before claim).
- **sessions:** `4f258f91-c4ae-489a-903a-3164be5dab40`
- **bucket:** landing
- **epistemic:** Verified
- **ambiguity:** good_band+gap@4f258f91:fast_good/handoff_rot, mid_plate+gap@4f258f91
- **jev:** label=`mixed` gap=`handoff_rot` happy_path_fit=0.700 thrash=0.160 plate=2.470 is_happy=0.600 is_smell=0.730 rel_jev=`high` · epistemic=Verified

### TN-H06 · HAPPY · Socratink-relevance **med**

- **pattern:** Behavioral rewrite brief: recreate tool behavior from first principles in new repo; steel-man the prompt before codegen.
- **evidence:** codex tink rollout-2026-08-12T21-04-44-… cwd=/Users/jondev/dev/active/tink: user asks prompt to recreate repo in Go focused solely on tool behavior; start from scratch in tink-go; agent treats current repo as behavioral oracle. plate=1.54 stage=spec gap=missing_verify.
- **smell-or-happy:** `happy`
- **Socratink-relevance:** med — Useful for Tink/skill-CLI portability and any harness rewrite; less direct to product chat loop unless Socratink adopts tink skill ops.
- **sessions:** `rollout-2026-08-12T21-04-44-019ff8dd-5b73-7323-bf15-43d454449f56`
- **bucket:** tink
- **epistemic:** Inference
- **ambiguity:** good_band+gap@rollout-:careful_good/missing_verify, mid_happy@rollout-, mid_plate+gap@rollout-, paired_h_s_same_session:TN-H10,TN-S07
- **jev:** label=`mixed` gap=`missing_verify` happy_path_fit=0.330 thrash=0.150 plate=1.580 is_happy=0.300 is_smell=0.780 rel_jev=`med` · epistemic=Verified

### TN-H07 · HAPPY · Socratink-relevance **high**

- **pattern:** AGENTS Complexity warning: pause when work shifts from requested outcome to improving the process/skills/automation around it.
- **evidence:** codex skill-eval + skill-refactor AGENTS excerpts: Before proposing new abstraction/workflow/skill/agent team/persistent artifact/automation, pause when work shifted from producing requested outcome to improving the process around it.
- **smell-or-happy:** `happy`
- **Socratink-relevance:** high — Anti-EVT-0001 / anti-skill-sprawl doctrine; directly transferable to Socratink agent AGENTS.md.
- **sessions:** `rollout-2026-08-14T00-43-36-019ffecc-1797-7190-9fc7-bb07c647e7d3`, `rollout-2026-08-12T13-23-52-019ff737-6d9e-7ba3-b71f-31d293083bbc`
- **bucket:** skill-eval
- **epistemic:** Inference
- **ambiguity:** good_band+gap@rollout-:careful_good/context_bloat, good_band+gap@rollout-:careful_good/thrash, mid_happy@rollout-, mid_plate+gap@rollout-, paired_h_s_same_session:TN-H03,TN-H10,TN-S06
- **jev:** label=`mixed` gap=`context_bloat` happy_path_fit=0.190 thrash=0.190 plate=1.020 is_happy=0.480 is_smell=0.760 rel_jev=`high` · epistemic=Verified

### TN-H08 · HAPPY · Socratink-relevance **med**

- **pattern:** Orientation request → read-only bird’s-eye map (purpose, runtime, files, phase status, safe work) before any mutate.
- **evidence:** codex skill-eval-loop rollout-2026-08-16T12-38-15-…: 'can we understand this project?'; agent uses repository-analysis workflow read-only evidence-backed map; distinguishes checkout vs clean release. gap=none stage=research.
- **smell-or-happy:** `happy`
- **Socratink-relevance:** med — Good Scout posture for unfamiliar repos; skill-eval-loop itself is meta-agentic infrastructure adjacent to Socratink skill quality.
- **sessions:** `rollout-2026-08-16T12-38-15-01a00ba7-1803-7d11-9a66-3e98fb174764`
- **bucket:** skill-eval
- **epistemic:** Inference
- **ambiguity:** mid_happy@rollout-
- **jev:** label=`mixed` gap=`none` happy_path_fit=0.340 thrash=0.140 plate=1.230 is_happy=0.500 is_smell=0.360 rel_jev=`med` · epistemic=Verified

### TN-H09 · HAPPY · Socratink-relevance **med**

- **pattern:** Visual proof loop: start/verify localhost + Playwright screenshots (desktop+mobile) before design claims.
- **evidence:** cursor 73c01e2a landing: open localhost review; start npm run dev; Playwright full-page screenshots desktop+mobile. (Same session later thrash-smells — happy fragment is the verify intent.) first_user_proofish=True.
- **smell-or-happy:** `happy`
- **Socratink-relevance:** med — Landing visual verify transfers to any UI PR; product should prefer named screenshot/command proof over checklist hope.
- **sessions:** `73c01e2a-cf30-4ff6-a4b3-f85ff43fc9a0`
- **bucket:** landing
- **epistemic:** Verified
- **ambiguity:** happy_fragment_from_smell_session, mid_plate+gap@73c01e2a, paired_h_s_same_session:TN-H12,TN-S01
- **jev:** label=`mixed` gap=`thrash` happy_path_fit=0.100 thrash=0.890 plate=1.150 is_happy=0.350 is_smell=0.910 rel_jev=`med` · epistemic=Verified

### TN-H10 · HAPPY · Socratink-relevance **med**

- **pattern:** Inspect vs mutate authority split for skill/CLI ops (read commands first; one authorized mutation; refusal ends turn).
- **evidence:** manage-tink SKILL.md (box flue copy) + skill-refactor task-contract: inspection authority ≠ mutation authority; Tink refusal ends turn; skill-refactor pauses with approval contract before edits.
- **smell-or-happy:** `happy`
- **Socratink-relevance:** med — If Socratink crew uses Tink for skillsets, this is the ops contract; also generalizes to any skill-manager agent.
- **sessions:** `rollout-2026-08-12T21-04-44-019ff8dd-5b73-7323-bf15-43d454449f56`, `rollout-2026-08-12T13-23-52-019ff737-6d9e-7ba3-b71f-31d293083bbc`
- **bucket:** tink
- **notes:** Doctrine evidence includes manage-tink SKILL.md on box; session evidence is tink + skill-refactor codex.
- **epistemic:** Inference
- **ambiguity:** good_band+gap@rollout-:careful_good/missing_verify, good_band+gap@rollout-:careful_good/thrash, mid_happy@rollout-, mid_plate+gap@rollout-, paired_h_s_same_session:TN-H03,TN-H06,TN-H07
- **jev:** label=`mixed` gap=`missing_verify` happy_path_fit=0.430 thrash=0.230 plate=1.160 is_happy=0.470 is_smell=0.760 rel_jev=`med` · epistemic=Verified

### TN-H11 · HAPPY · Socratink-relevance **med**

- **pattern:** Scout DISCOVER mode with interpreted contract before shortlisting skill candidates (no candidate supplied → search first).
- **evidence:** cursor 14d6a02c sandbox-socratink-io: Mode DISCOVER — no candidate supplied; search local+public; Contract interpreted: find reusable skill for multiplayer 3D; shortlist with repository-level evidence. plate=1.79.
- **smell-or-happy:** `happy`
- **Socratink-relevance:** med — Matches Skill Scout ≤3 finalists pattern; useful for Socratink skill adoption without premature install.
- **sessions:** `14d6a02c-5a3f-4348-a52a-ea27e15c5667`
- **bucket:** socratink-io
- **epistemic:** Verified
- **ambiguity:** good_band+gap@14d6a02c:fast_good/thrash, happy_fragment_from_smell_session, mid_happy@14d6a02c, mid_plate+gap@14d6a02c
- **jev:** label=`mixed` gap=`thrash` happy_path_fit=0.430 thrash=0.740 plate=2.070 is_happy=0.530 is_smell=0.800 rel_jev=`med` · epistemic=Verified

### TN-H12 · HAPPY · Socratink-relevance **high**

- **pattern:** Founder correction in prompt overrides older visual choreography docs; product/a11y/verify requirements remain binding.
- **evidence:** cursor 73c01e2a first_user: senior interactive art director end-to-end; Follow AGENTS.md; For visual decisions, the founder correction in this prompt overrides older visual choreography in project documents; Product truth, accessibility, verification remain binding.
- **smell-or-happy:** `happy`
- **Socratink-relevance:** high — Precedence rules prevent doc thrash vs live plate; transferable to Socratink when PR body /goal supersedes stale wiki.
- **sessions:** `73c01e2a-cf30-4ff6-a4b3-f85ff43fc9a0`
- **bucket:** landing
- **epistemic:** Verified
- **ambiguity:** happy_fragment_from_smell_session, mid_plate+gap@73c01e2a, paired_h_s_same_session:TN-H09,TN-S01
- **jev:** label=`mixed` gap=`thrash` happy_path_fit=0.080 thrash=0.900 plate=0.960 is_happy=0.380 is_smell=0.910 rel_jev=`high` · epistemic=Verified

### TN-S01 · SMELL · Socratink-relevance **high**

- **pattern:** Single-file path thrash: ≥100 StrReplace on one HTML without green gate / plate restatement.
- **evidence:** cursor 73c01e2a: top_repeated_tools StrReplace|…/index.html n=132; Read same n=22; repeated_tool_extra=194; band=slow_thrash; neg_feedback_hits=22.
- **smell-or-happy:** `smell`
- **Socratink-relevance:** high — Same tripwire as product thrash (b23609bb/357a2e9e); landing proves smell is harness-general not product-only.
- **sessions:** `73c01e2a-cf30-4ff6-a4b3-f85ff43fc9a0`
- **bucket:** landing
- **epistemic:** Verified
- **ambiguity:** mid_plate+gap@73c01e2a, paired_h_s_same_session:TN-H09,TN-H12
- **jev:** label=`smell` gap=`thrash` happy_path_fit=0.060 thrash=0.950 plate=0.710 is_happy=0.110 is_smell=0.950 rel_jev=`high` · epistemic=Verified

### TN-S02 · SMELL · Socratink-relevance **high**

- **pattern:** Cross-repo bleed: landing-rooted session repeatedly edits /active/tink and product paths without cwd re-plate.
- **evidence:** cursor 430c4785 project=active-socratink-landing but top_repeated includes StrReplace|/Users/jondev/dev/active/tink/src/skillsets.rs n=10 plus Hero.tsx/organic-sphere; unique_paths=138; plate=0.4 slow_thrash.
- **smell-or-happy:** `smell`
- **Socratink-relevance:** high — Breaks packet cwd lock; Socratink must refuse multi-root edits unless plate lists all roots.
- **sessions:** `430c4785-99a5-4355-83d6-c5314041f7f3`
- **bucket:** landing
- **epistemic:** Verified
- **ambiguity:** paired_h_s_same_session:TN-S05
- **jev:** label=`smell` gap=`thrash` happy_path_fit=0.080 thrash=0.910 plate=0.210 is_happy=0.100 is_smell=0.960 rel_jev=`high` · epistemic=Verified

### TN-S03 · SMELL · Socratink-relevance **high**

- **pattern:** Dynamic-tool / subagent catalog thrash (GetDynamicTools/CallDynamicTool spam) without goalish first_user.
- **evidence:** cursor 891f9f25: CallDynamicTool n=158, GetDynamicTools n=61; first_user_goalish=False plate_mine=1; repeated_tool_extra=365; band=slow_thrash; started as vague 'use paper to help enhance my landing page'.
- **smell-or-happy:** `smell`
- **Socratink-relevance:** high — Handoff/sprawl smell for Cursor multi-agent; Socratink side-chats need packet before dynamic tool fishing.
- **sessions:** `891f9f25-29b7-4426-9673-10f3aa88539b`
- **bucket:** landing
- **epistemic:** Verified
- **ambiguity:** catalog_transferable_ambiguous
- **jev:** label=`smell` gap=`thrash` happy_path_fit=0.090 thrash=0.930 plate=0.900 is_happy=0.130 is_smell=0.940 rel_jev=`high` · epistemic=Verified

### TN-S04 · SMELL · Socratink-relevance **high**

- **pattern:** Interrupt/replace prior focus mid-session without rewriting plate (vote UX overlays aperture study).
- **evidence:** cursor f5892573: continuing ink-blob vote work Interrupt/replace prior focus with updated UX + finish deploy after aperture plate in same/adjacent thread; det_smells repeated Read/StrReplace/Write on Experience* n=22/22/16; neg_feedback_hits=74; gap=thrash despite plate=2.09.
- **smell-or-happy:** `smell`
- **Socratink-relevance:** high — Shows high plate text ≠ safe if focus swaps; Socratink should require new /goal on interrupt.
- **sessions:** `f5892573-a6d2-4be0-97c8-f7d6f2fea820`, `262573f8-8b59-43db-a3e2-b74ba416a168`
- **bucket:** landing
- **epistemic:** Verified
- **ambiguity:** good_band+gap@f5892573:fast_good/thrash, mid_happy@262573f8, mid_happy@f5892573, mid_plate+gap@f5892573, paired_h_s_same_session:TN-H01, smell_despite_good_band_or_plate
- **jev:** label=`mixed` gap=`thrash` happy_path_fit=0.150 thrash=0.910 plate=2.270 is_happy=0.210 is_smell=0.890 rel_jev=`high` · epistemic=Verified

### TN-S05 · SMELL · Socratink-relevance **high**

- **pattern:** Manually attached skill dump / skill inline before Outcome sentence.
- **evidence:** Multiple non-product sessions open with <manually_attached_skills> blocks (430c4785 karpathy-guidelines; ca5e4f51 close-loop; b48587b4 git-slice/prototype/evidence-to-agency-brief; 64cfb0da tool-sharpening-loop) often before or instead of a one-sentence Outcome.
- **smell-or-happy:** `smell`
- **Socratink-relevance:** high — Same as S015 skill-dump smell in product extract; landing/vault confirm population-wide.
- **sessions:** `430c4785-99a5-4355-83d6-c5314041f7f3`, `ca5e4f51-586f-46b6-8bc5-7993f3f1b99b`, `b48587b4-52c2-4d32-bb8b-e726f7726791`
- **bucket:** landing
- **epistemic:** Verified
- **ambiguity:** mid_happy@b48587b4, mid_happy@ca5e4f51, mid_plate+gap@b48587b4, mid_plate+gap@ca5e4f51, paired_h_s_same_session:TN-S02,TN-S08,TN-S09
- **jev:** label=`mixed` gap=`thrash` happy_path_fit=0.100 thrash=0.860 plate=0.270 is_happy=0.160 is_smell=0.940 rel_jev=`high` · epistemic=Verified

### TN-S06 · SMELL · Socratink-relevance **med**

- **pattern:** Checkout≠source confusion: local skill-eval folder is installed skills only; agent must redirect to published README/repo.
- **evidence:** codex skill-eval sandbox rollout-2026-08-14T00-43-36-…: how do i use this repo? github.com/…/skill-eval-loop; local folder contains only installed skills not evaluator source; context_bloat gap; plate=0.5.
- **smell-or-happy:** `smell`
- **Socratink-relevance:** med — Warns Socratink skill installs vs source-of-truth; agents must label cwd authority.
- **sessions:** `rollout-2026-08-14T00-43-36-019ffecc-1797-7190-9fc7-bb07c647e7d3`
- **bucket:** skill-eval
- **epistemic:** Inference
- **ambiguity:** good_band+gap@rollout-:careful_good/context_bloat, mid_happy@rollout-, paired_h_s_same_session:TN-H03,TN-H07, smell_despite_good_band_or_plate
- **jev:** label=`mixed` gap=`context_bloat` happy_path_fit=0.140 thrash=0.140 plate=0.990 is_happy=0.270 is_smell=0.870 rel_jev=`med` · epistemic=Verified

### TN-S07 · SMELL · Socratink-relevance **med**

- **pattern:** Spec-stage rewrite without verify plan (missing_verify) after behavioral prompt steel-man.
- **evidence:** codex tink rollout… plate=1.54 careful_good but primary_partnership_gap=missing_verify stage=spec; retries_sample=33 — research/prompt work without named proof for tink-go fidelity.
- **smell-or-happy:** `smell`
- **Socratink-relevance:** med — Even good careful sessions need a named verify (golden CLI cases) before claiming rewrite ready — applies to Socratink CLI/skill ports.
- **sessions:** `rollout-2026-08-12T21-04-44-019ff8dd-5b73-7323-bf15-43d454449f56`
- **bucket:** tink
- **epistemic:** Inference
- **ambiguity:** good_band+gap@rollout-:careful_good/missing_verify, mid_happy@rollout-, mid_plate+gap@rollout-, paired_h_s_same_session:TN-H06,TN-H10, smell_despite_good_band_or_plate
- **jev:** label=`mixed` gap=`missing_verify` happy_path_fit=0.150 thrash=0.220 plate=0.800 is_happy=0.210 is_smell=0.870 rel_jev=`med` · epistemic=Verified

### TN-S08 · SMELL · Socratink-relevance **med**

- **pattern:** close-loop / ship-stage skill attached to exploratory Q → scope_sub / fast_wrong.
- **evidence:** cursor ca5e4f51: first_user attaches close-loop skill; query is locate how landing shows example learning material (read-only locate); gap=scope_sub band=fast_wrong stage=ship plate=1.06; top_writes index.html n=34.
- **smell-or-happy:** `smell`
- **Socratink-relevance:** med — Skill choice must match stage; attaching ship/close skills to research locates drives wrong velocity band.
- **sessions:** `ca5e4f51-586f-46b6-8bc5-7993f3f1b99b`
- **bucket:** landing
- **epistemic:** Verified
- **ambiguity:** mid_happy@ca5e4f51, mid_plate+gap@ca5e4f51, paired_h_s_same_session:TN-S05
- **jev:** label=`mixed` gap=`scope_sub` happy_path_fit=0.100 thrash=0.800 plate=0.780 is_happy=0.190 is_smell=0.900 rel_jev=`med` · epistemic=Verified

### TN-S09 · SMELL · Socratink-relevance **med**

- **pattern:** Skill-script thrash inside ~/.agents while 'shipping' research-vault work (render_brief_view.py ×14).
- **evidence:** cursor b48587b4 research-vault: use evidence-to-agency-brief on YouTube URL; top_repeated StrReplace|~/.agents/skills/evidence-to-agency-brief/scripts/render_brief_view.py n=14; neg_feedback_hits=81; slow_thrash; stage=ship.
- **smell-or-happy:** `smell`
- **Socratink-relevance:** med — Process-tooling edit mid outcome (Complexity warning violation); Socratink should park skill fixes to separate /goal.
- **sessions:** `b48587b4-52c2-4d32-bb8b-e726f7726791`
- **bucket:** research-vault
- **epistemic:** Verified
- **ambiguity:** mid_happy@b48587b4, mid_plate+gap@b48587b4, paired_h_s_same_session:TN-S05
- **jev:** label=`mixed` gap=`thrash` happy_path_fit=0.100 thrash=0.950 plate=1.070 is_happy=0.160 is_smell=0.930 rel_jev=`med` · epistemic=Verified

### TN-S10 · SMELL · Socratink-relevance **low**

- **pattern:** Persona/skill-stack session with governance gap and weak plate (multi skill attach without Outcome/Proof).
- **evidence:** codex persona_farm rollout-2026-08-30T16-13-51-…: huashu-nuwa + triangulate-me skills for Andrew Ng persona vs learnvector.ai; gap=governance plate=0.75 stage=review; retries=37.
- **smell-or-happy:** `smell`
- **Socratink-relevance:** low — Sandbox persona farming is weakly coupled to Socratink product loops; keep as anti-pattern of skill-stack without plate.
- **sessions:** `rollout-2026-08-30T16-13-51-01a05485-8327-76c0-a537-67c77d7d235c`
- **bucket:** persona_farm
- **epistemic:** Inference
- **ambiguity:** good_band+gap@rollout-:careful_good/governance, mid_happy@rollout-, smell_despite_good_band_or_plate
- **jev:** label=`mixed` gap=`governance` happy_path_fit=0.130 thrash=0.720 plate=0.810 is_happy=0.100 is_smell=0.810 rel_jev=`low` · epistemic=Verified

### TN-H13 · HAPPY · Socratink-relevance **high**

- **pattern:** Read-only source auditor: confirm/refute agent-work smells without launching herdr or mutate tools.
- **evidence:** cursor 8e82a04d orphaned-launch-pad-css: You are a read-only source auditor. Confirm or refute these agent-work smells. Do NOT launch herdr, do NOT run agent-work launch. Audits script + Loop contract; checks print_herdr_launch_next, worktree reuse, skipped-launch exit 0, cmd_guard dirty. plate=1.53 gap=missing_verify band=careful_good stage=review.
- **smell-or-happy:** `happy`
- **Socratink-relevance:** high — Fail-closed read-only audit plate transfers to Socratink agent-work / herdr gates; pairs with packet Success criteria before promote.
- **sessions:** `8e82a04d-5d7d-474e-8011-e6f265e27c2c`
- **bucket:** app-slice
- **epistemic:** Verified
- **ambiguity:** good_band+gap:careful_good/missing_verify, mid_happy=0.39, happy_pattern_with_verify_hole
- **jev:** label=`mixed` gap=`missing_verify` happy_path_fit=0.220 thrash=0.190 plate=1.490 is_happy=0.340 is_smell=0.810 rel_jev=`high` · epistemic=Verified

### TN-H14 · HAPPY · Socratink-relevance **med**

- **pattern:** Narrow research-spike plate (organic-sphere behavior) before impl — but verify still weak (happy∩missing_verify).
- **evidence:** codex landing rollout-2026-09-09T11-15-41: userish 'i need to research spike how to make the organic sphere produce…'; plate=0.91 happy=0.62 thrash=0.20 verify_ok=0.35 gap prior=none refined=missing_verify band=careful_good; 33MB research rollout. Deep tag nugget:narrow_proof.
- **smell-or-happy:** `happy`
- **Socratink-relevance:** med — Landing research-spike grammar is transferable; also shows why named Proof must ride with spike plates.
- **sessions:** `rollout-2026-09-09T11-15-41-01a086f4-2002-7880-8702-faa6d5ce3e95`
- **bucket:** landing
- **notes:** Exact sid from codex-strata-pack-v2
- **epistemic:** Inference
- **ambiguity:** mid_happy, gap_none_prior_refined_missing_verify, happy_fragment_weak_verify
- **jev:** label=`mixed` gap=`missing_verify` happy_path_fit=0.310 thrash=0.380 plate=1.120 is_happy=0.380 is_smell=0.700 rel_jev=`med` · epistemic=Verified

### TN-S11 · SMELL · Socratink-relevance **high**

- **pattern:** Cross-root Flue/wiki session discovers Brain vault elsewhere and switches roots mid-task without re-plate.
- **evidence:** cursor 22aa0740 flue-obsidian-wiki: task=minimal ontology-preserving upgrade of Brain vault templates; Templates aren't in this Flue wiki repo → switch to Brain vault root. plate=0.55 gap=thrash (prior) happy=0.23 verify=0.12 band=careful_good stage=research.
- **smell-or-happy:** `smell`
- **Socratink-relevance:** high — Brain≠wiki≠code jurisdiction; Socratink must re-plate cwd when vault root changes (pairs TN-S02 cross-repo bleed).
- **sessions:** `22aa0740-209a-471b-9bf4-e7b1d1b480dd`
- **bucket:** flue-wiki
- **epistemic:** Verified
- **ambiguity:** good_band+gap:careful_good/thrash, weak_plate, cross_root_discovery
- **jev:** label=`smell` gap=`thrash` happy_path_fit=0.090 thrash=0.600 plate=0.880 is_happy=0.190 is_smell=0.920 rel_jev=`high` · epistemic=Verified

### TN-S12 · SMELL · Socratink-relevance **med**

- **pattern:** Research-vault ingest starts with manually_attached_skills then handoff_rot (X fetch fallbacks) on weak plate.
- **evidence:** cursor 87e7b60b research-vault: skill dump then agentic-engineering-research ingest on X post; X blocked → syndication/browser; creates atomic insights. plate=0.6 gap=handoff_rot band=fast_good happy=0.37 stage=research.
- **smell-or-happy:** `smell`
- **Socratink-relevance:** med — Skill-first ingest without Outcome/Proof mirrors S015; handoff_rot under fast_good band is classic ambiguous label.
- **sessions:** `87e7b60b-7161-4de6-b033-a9deae5dafdb`
- **bucket:** research-vault
- **epistemic:** Verified
- **ambiguity:** good_band+gap:fast_good/handoff_rot, mid_happy=0.37, skill_dump_before_outcome
- **jev:** label=`mixed` gap=`handoff_rot` happy_path_fit=0.160 thrash=0.210 plate=1.020 is_happy=0.260 is_smell=0.860 rel_jev=`med` · epistemic=Verified

### TN-S13 · SMELL · Socratink-relevance **high**

- **pattern:** skill-scout / memory-preamble thrash: orient-me skill loop without Outcome/Proof fence.
- **evidence:** codex sandbox-socratink.io rollout-2026-08-09T01-17-16: userish 'can you use skill-scout to find a skill that orients you to the code base best?'; Memory-folder preamble before crisp Outcome; thrash_p=0.70 happy=0.25 verify=0.13 plate=0.93 toolish≈163; deep tag smell:thrash.
- **smell-or-happy:** `smell`
- **Socratink-relevance:** high — Scout-without-contract anti-pattern; contrasts TN-H11 DISCOVER with interpreted contract.
- **sessions:** `rollout-2026-08-09T01-17-16-019fe52b-1e6a-7e22-9e16-09e1ae1358af`
- **bucket:** socratink-io
- **epistemic:** Verified
- **ambiguity:** happy+thrash_conflict, careful_good+thrash_gap, scout_vs_contract
- **jev:** label=`smell` gap=`thrash` happy_path_fit=0.140 thrash=0.910 plate=0.900 is_happy=0.190 is_smell=0.910 rel_jev=`high` · epistemic=Verified

### TN-S14 · SMELL · Socratink-relevance **high**

- **pattern:** Skill-path correction / add-skill thrash on oversized landing rollout (plan-stage, weak verify).
- **evidence:** codex landing rollout-2026-09-05T09-58-40 (117MB): userish 'Please provide the correct skill path or add the skill and its referenced…'; prior gap=thrash conf≈0.78; plate=0.99 happy=0.34 verify=0.11 toolish≈162; multi_agent_role preamble. Deep tag smell:thrash.
- **smell-or-happy:** `smell`
- **Socratink-relevance:** high — Wrong-skill-path loops are a Socratink harness landmine; size caveat on early-excerpt scoring.
- **sessions:** `rollout-2026-09-05T09-58-40-01a07214-2d30-7301-84e3-c251ad08f785`
- **bucket:** landing
- **epistemic:** Inference
- **ambiguity:** mid_happy, good_band+gap, huge_rollout_excerpt_caveat
- **jev:** label=`mixed` gap=`thrash` happy_path_fit=0.130 thrash=0.850 plate=0.990 is_happy=0.160 is_smell=0.890 rel_jev=`high` · epistemic=Verified

### TN-S15 · SMELL · Socratink-relevance **med**

- **pattern:** Codex multi-agent / AGENTS preamble context_bloat buries user Outcome (congruous theme/scroll ask).
- **evidence:** codex landing rollout-2026-09-11T23-54-18: userish improve congruous theme/style/scroll feel; gap=context_bloat plate=1.13 happy=0.49 thrash=0.18 verify=0.21 band=careful_good; deep tag smell:context_bloat.
- **smell-or-happy:** `smell`
- **Socratink-relevance:** med — Harness preamble eating the plate window is transferable; Socratink agents should surface Outcome above multi_agent_role boilerplate.
- **sessions:** `rollout-2026-09-11T23-54-18-01a093f7-6356-7192-a0d8-2250fe8704d0`
- **bucket:** landing
- **epistemic:** Inference
- **ambiguity:** mid_happy, good_band+gap:careful_good/context_bloat, happy_vs_bloat
- **jev:** label=`mixed` gap=`context_bloat` happy_path_fit=0.190 thrash=0.250 plate=1.280 is_happy=0.260 is_smell=0.880 rel_jev=`med` · epistemic=Verified

### TN-S16 · SMELL · Socratink-relevance **med**

- **pattern:** Gap-label hole: prior primary_gap=none (low conf) on careful_good skill-eval research with plate≪1 — refine toward weak_plate.
- **evidence:** codex skill-eval-loop rollout-2026-08-14T20-00-43: plate=0.19 happy=0.33 thrash=0.11 verify=0.16 gap=none conf=0.32 band=careful_good; deep refined primary_gap=weak_plate; tag nugget:scout_only vs plate-gap. Classic ambiguous gap-label case.
- **smell-or-happy:** `smell`
- **Socratink-relevance:** med — Shows strata gap=none is unreliable when plate is near-zero; Max Jev refinement target for Socratink eval labeling.
- **sessions:** `rollout-2026-08-14T20-00-43-01a002ef-778b-7e73-b1e0-7c1c1255bce3`
- **bucket:** skill-eval
- **epistemic:** Inference
- **ambiguity:** gap_none_weak_happy, gap_confidence_low, plate_near_zero, tag_scout_vs_weak_plate
- **jev:** label=`mixed` gap=`weak_plate` happy_path_fit=0.120 thrash=0.340 plate=0.610 is_happy=0.280 is_smell=0.770 rel_jev=`med` · epistemic=Verified

## Max Jev summary

- Scored 30/30 (err=0)
- Means: happy_path_fit=0.219 thrash=0.557 plate=1.253 verify_ok=0.314 is_happy_nugget=0.309 is_smell=0.829
- Labels: {'mixed': 25, 'smell': 5}
- Gaps: {'handoff_rot': 3, 'thrash': 14, 'over_trust': 1, 'missing_verify': 5, 'context_bloat': 3, 'none': 1, 'scope_sub': 1, 'governance': 1, 'weak_plate': 1}
- Companion: `transferable-jev-top30.md` + `.json`

## Unknowns

- Live Mac Shell+machineId not available this executor (box hostname only) — no fresh Cursor parent jsonl for true non-socratink projects beyond pack mirrors.
- strata-pack-v3 / loops mine are Cursor *socratink*-named projects; landing/app-slice/flue/vault are beyond product-socratink but still socratink-org paths. True cwd /active/tink and skill-eval appear only in Codex pack on box.
- No Cursor parent IDs found on box for /Users/jondev/dev/active/tink or skill-eval-loop (inventory notes ~403 Cursor projects; only socratink-slug packs copied).
- Codex excerpts are long-horizon redacted peels — full tool timelines / exact verify commands Unknown without Mac re-read of rollout jsonl.
- home-ambiguous Codex cwd=/Users/jondev sessions excluded (cannot attribute project).
- Duplicate rollout rows in codex-strata-pack-v2 (same session_id twice for some landings) — deduped by session_id.
- Codex landing/skill peels remain early-excerpt biased on multi-MB rollouts (Assumption).

## Blockers

- No live Mac route for this subagent — cannot enlarge Cursor non-socratink sample from ~/.cursor projects.
- Research-only: no PR, no SendToUser, no factory.db done (per tranche).
- Research-only T2.2: brain untouched; no factory done; no PR; no SendToUser.

## Paths

- `/workspace/socratink/research/chat-signal/agenteng-runs/transferable-nonsocratink.json`
- `/workspace/socratink/research/chat-signal/agenteng-runs/transferable-nonsocratink.md`
- `/workspace/socratink/research/chat-signal/agenteng-runs/transferable-jev-top30.md`
- `/workspace/socratink/research/chat-signal/agenteng-runs/transferable-jev-top30.json`
- `/home/box/agent-data/grok-ship/reports/transferable-nonsocratink.md`
- `/workspace/grok-ship/reports/transferable-nonsocratink.md`
