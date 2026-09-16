# Codex recovery-success vs fatal thrash — evidence cards

- **As-of:** 2026-09-15 ~21:02 CT
- **Job:** FM-AGENTENG-01 Researchy burn-tranche-2 T2.3 — Codex recovery vs fatal
- **Cards:** 14 recovery-success + 12 fatal thrash (strict=10, near_expand=2)
- **Pool:** strata 48 unique / 80 rows; deep-cards 40 crossref where present
- **Means recovery:** thrash=0.193 · happy=0.564 · verify=0.321 · plate=1.117
- **Means fatal:** thrash=0.289 · happy=0.284 · verify=0.179 · plate=0.985
- **Nuggets:** 12 CR-H* · **Smells:** 12 CR-S*

## Operational criteria

### Recovery-success
1. Early/mid thrash: thrash_p ≥ 0.15 OR retry_error_hits_sample ≥ 20 OR (gap∈{thrash,context_bloat} ∧ thrash_p≥0.12)
2. Recovered outcome: happy_path_fit ≥ 0.40 OR (verify_ok ≥ 0.28 ∧ would_retry_same_way ≥ 0.48)
3. Not abandoned: would_retry_same_way ≥ 0.40 ∧ happy_path_fit ≥ 0.35
4. Note: Prefer sessions that end verify/impl/review with useful Outcome; never invent session IDs.

### Fatal thrash
1. Thrash signal: thrash_p ≥ 0.15 OR gap=thrash OR (retry_error_hits_sample≥30 ∧ thrash_p≥0.12)
2. No recovery: (happy_path_fit < 0.38 ∧ verify_ok < 0.28) OR (gap=thrash ∧ happy<0.45) OR (thrash≥0.20 ∧ happy<0.40 ∧ verify<0.25) OR (retries≥40 ∧ happy<0.40 ∧ thrash≥0.12)
3. Near expand: If strict pool <12: thrash_p≥0.13 ∧ happy_path_fit<0.38 ∧ not already recovery (label selection=near_expand)

## Method (short)

- Prefer existing session IDs from `codex-strata-pack-v2.json` + scores; never invent.
- Cross-link deep-cards PG/TL when session overlaps; do not thin the 40.
- Research-only; brain untouched; no factory done; no PR; no SendToUser; Mac sync skipped.

---

## A. Recovery-success cards

### RS-01 · `2026-09-01T14-34-46-01a05e77-86c5-7a31-951b-be73febe91be` · recovery-success · selection=strict

- **Slug/cwd:** socratink · `/Users/jondev/dev/active/socratink/product/socratink`
- **Scores:** plate=1.01 · thrash_p=0.26 · happy=0.46 · load=2.22 · verify=0.29 · stage=mixed · band=careful_good · gap=governance
- **Retries/toolish:** retry_err≈36 · toolish≈62 · bytes≈3.8MB
- **Transferable tag:** `nugget:narrow_proof` · **Socratink-relevance:** **high**
- **Deep-card crossrefs:** PG-20, TL-05
- **Timeline sketch:**
  - Open: mixed · band=careful_good · bytes≈3.8MB · toolish≈62 · retry/err≈36
  - Scores: plate=1.01 thrash_p=0.26 happy=0.46 verify=0.29 load=2.22 gap=governance
  - Harness flags: app_context, spawn
  - Signal1: “Codex (desktop) app, which allows some additional features not available in the CLI alone:  ### Images/Visuals/Files - In the app, the model can display images,…”
  - Signal2: “but not installed.  - Atlassian Rovo (atlassian-rovo@openai-curated-remote) - Box (box@openai-curated-remote) - Google Calendar (google-calendar@openai-curated-…”
  - Signal3: “no i am commited to socratink. Please what is remaining for it to be stable and reliable?”
  - Flip: verify_ok rose (≥0.28) — named proof / stop-on-green likely landed
  - End-state: recovery-success (thrash early/mid → happy/verify cleared; would_retry=0.5)
- **What flipped recovery:**
  - verify_ok rose (≥0.28) — named proof / stop-on-green likely landed

### RS-02 · `2026-08-30T15-13-16-01a05356-7d5f-7871-8623-970e02a2c54c` · recovery-success · selection=strict

- **Slug/cwd:** socratink · `/Users/jondev/dev/active/socratink/product/socratink`
- **Scores:** plate=0.7 · thrash_p=0.24 · happy=0.47 · load=2.55 · verify=0.335 · stage=verify · band=careful_good · gap=none
- **Retries/toolish:** retry_err≈27 · toolish≈149 · bytes≈15.1MB
- **Transferable tag:** `smell:context_bloat` · **Socratink-relevance:** **high**
- **Deep-card crossrefs:** PG-08, TL-13
- **Timeline sketch:**
  - Open: verify · band=careful_good · bytes≈15.1MB · toolish≈149 · retry/err≈27
  - Scores: plate=0.7 thrash_p=0.24 happy=0.47 verify=0.335 load=2.55 gap=none
  - Harness flags: agents_md, proof, skill_eval
  - Signal1: “ions to follow that is stored in a `SKILL.md` file. Below is the list of skills that can be used. Each entry includes a name, description, and a short path that…”
  - Signal2: “<timezone>America/Chicago</timezone>   <filesystem><workspace_roots><root>/Users/jondev/dev/active/socratink/product/socratink</root><root>/Users/jondev/.codex/…”
  - Signal3: “Proceeding. The updated project guide requires a fresh read of `ZEN.md`; I’m doing that before the remaining Brain edits, then I’ll finish the already-scoped co…”
  - Flip: verify_ok rose (≥0.28) — named proof / stop-on-green likely landed
  - Flip: lifecycle landed in verify with usable happy fit
- **What flipped recovery:**
  - verify_ok rose (≥0.28) — named proof / stop-on-green likely landed
  - lifecycle landed in verify with usable happy fit

### RS-03 · `2026-09-11T21-28-35-01a09371-fa97-7633-9969-d9bf00c5fb35` · recovery-success · selection=strict

- **Slug/cwd:** socratink · `/Users/jondev/dev/active/socratink-landing`
- **Scores:** plate=1.235 · thrash_p=0.235 · happy=0.81 · load=2.72 · verify=0.235 · stage=review · band=careful_good · gap=none
- **Retries/toolish:** retry_err≈54 · toolish≈137 · bytes≈7.3MB
- **Transferable tag:** `nugget:recovery_flip` · **Socratink-relevance:** **med**
- **Timeline sketch:**
  - Open: review · band=careful_good · bytes≈7.3MB · toolish≈137 · retry/err≈54
  - Scores: plate=1.235 thrash_p=0.235 happy=0.81 verify=0.235 load=2.72 gap=none
  - Harness flags: app_context
  - Signal1: “Codex (desktop) app, which allows some additional features not available in the CLI alone:  ### Images/Visuals/Files - In the app, the model can display images,…”
  - Signal2: “but not installed.  - Atlassian Rovo (atlassian-rovo@openai-curated-remote) - Box (box@openai-curated-remote) - Databricks Genie (databricks@openai-curated-remo…”
  - Signal3: “I’ll ground this in the landing-page implementation first, then turn it into a tightly scoped Astra brief: what to change, what to leave alone, and how to prove…”
  - Flip: happy_path_fit strong (≥0.55) — Outcome/useful path recovered despite early thrash
  - Flip: high retry/error sample (54) then still recovered — diagnose→change-one-variable rather than abandon
- **What flipped recovery:**
  - happy_path_fit strong (≥0.55) — Outcome/useful path recovered despite early thrash
  - high retry/error sample (54) then still recovered — diagnose→change-one-variable rather than abandon
  - lifecycle landed in review with usable happy fit

### RS-04 · `2026-09-01T23-16-07-01a06054-d36d-7e71-a321-6105bae161e4` · recovery-success · selection=strict

- **Slug/cwd:** socratink · `/Users/jondev/dev/active/socratink/product/socratink`
- **Scores:** plate=1.3 · thrash_p=0.22 · happy=0.675 · load=2.195 · verify=0.21 · stage=verify · band=careful_good · gap=governance
- **Retries/toolish:** retry_err≈84 · toolish≈173 · bytes≈13.0MB
- **Transferable tag:** `nugget:narrow_proof` · **Socratink-relevance:** **high**
- **Deep-card crossrefs:** TL-08
- **Timeline sketch:**
  - Open: verify · band=careful_good · bytes≈13.0MB · toolish≈173 · retry/err≈84
  - Scores: plate=1.3 thrash_p=0.22 happy=0.675 verify=0.21 load=2.195 gap=governance
  - Harness flags: app_context, agents_md, spawn, outcome_plate, skill_eval
  - Signal1: “Codex (desktop) app, which allows some additional features not available in the CLI alone:  ### Images/Visuals/Files - In the app, the model can display images,…”
  - Signal2: “You are `/root`, the primary agent in a team of agents collaborating to fulfill the user\”
  - Signal3: “implement [native-composer-dictation.md](/Users/jondev/dev/active/socratink/product/socratink/specs/native-composer-dictation.md)”
  - Flip: happy_path_fit strong (≥0.55) — Outcome/useful path recovered despite early thrash
  - Flip: high retry/error sample (84) then still recovered — diagnose→change-one-variable rather than abandon
- **What flipped recovery:**
  - happy_path_fit strong (≥0.55) — Outcome/useful path recovered despite early thrash
  - high retry/error sample (84) then still recovered — diagnose→change-one-variable rather than abandon
  - lifecycle landed in verify with usable happy fit

### RS-05 · `2026-08-31T19-37-04-01a05a65-eedb-7ab3-9ca6-e527f1fbda82` · recovery-success · selection=strict

- **Slug/cwd:** socratink · `/Users/jondev/dev/active/socratink/product/socratink`
- **Scores:** plate=0.75 · thrash_p=0.215 · happy=0.665 · load=2.645 · verify=0.3 · stage=verify · band=careful_good · gap=none
- **Retries/toolish:** retry_err≈48 · toolish≈166 · bytes≈5.7MB
- **Transferable tag:** `nugget:narrow_proof` · **Socratink-relevance:** **high**
- **Deep-card crossrefs:** PG-09
- **Timeline sketch:**
  - Open: verify · band=careful_good · bytes≈5.7MB · toolish≈166 · retry/err≈48
  - Scores: plate=0.75 thrash_p=0.215 happy=0.665 verify=0.3 load=2.645 gap=none
  - Harness flags: app_context, agents_md, spawn, outcome_plate, skill_eval, doctrine
  - Signal1: “Codex (desktop) app, which allows some additional features not available in the CLI alone:  ### Images/Visuals/Files - In the app, the model can display images,…”
  - Signal2: “You are `/root`, the primary agent in a team of agents collaborating to fulfill the user\”
  - Signal3: “# Files pasted by the user:  ## "# Implement the Socratink AI Engineer — v0 You are working in the Socratink pro…": /Users/jondev/.codex/attachments/8f95e1eb-63…”
  - Flip: verify_ok rose (≥0.28) — named proof / stop-on-green likely landed
  - Flip: happy_path_fit strong (≥0.55) — Outcome/useful path recovered despite early thrash
- **What flipped recovery:**
  - verify_ok rose (≥0.28) — named proof / stop-on-green likely landed
  - happy_path_fit strong (≥0.55) — Outcome/useful path recovered despite early thrash
  - high retry/error sample (48) then still recovered — diagnose→change-one-variable rather than abandon

### RS-06 · `2026-09-09T11-15-41-01a086f4-2002-7880-8702-faa6d5ce3e95` · recovery-success · selection=strict

- **Slug/cwd:** socratink · `/Users/jondev/dev/active/socratink-landing`
- **Scores:** plate=0.905 · thrash_p=0.195 · happy=0.615 · load=2.08 · verify=0.345 · stage=research · band=careful_good · gap=none
- **Retries/toolish:** retry_err≈52 · toolish≈181 · bytes≈32.7MB
- **Transferable tag:** `nugget:narrow_proof` · **Socratink-relevance:** **med**
- **Deep-card crossrefs:** PG-14
- **Timeline sketch:**
  - Open: research · band=careful_good · bytes≈32.7MB · toolish≈181 · retry/err≈52
  - Scores: plate=0.905 thrash_p=0.195 happy=0.615 verify=0.345 load=2.08 gap=none
  - Harness flags: multi_agent_role, app_context, agents_md, spawn, skill_eval
  - Signal1: “Codex (desktop) app, which allows some additional features not available in the CLI alone:  ### Images/Visuals/Files - In the app, the model can display images,…”
  - Signal2: “but not installed.  - Atlassian Rovo (atlassian-rovo@openai-curated-remote) - Box (box@openai-curated-remote) - Google Calendar (google-calendar@openai-curated-…”
  - Signal3: “I’ll trace how the sphere is built and rendered, then research improvements against the current implementation and your screenshot. I’ll keep this as a research…”
  - Flip: verify_ok rose (≥0.28) — named proof / stop-on-green likely landed
  - Flip: happy_path_fit strong (≥0.55) — Outcome/useful path recovered despite early thrash
- **What flipped recovery:**
  - verify_ok rose (≥0.28) — named proof / stop-on-green likely landed
  - happy_path_fit strong (≥0.55) — Outcome/useful path recovered despite early thrash
  - high retry/error sample (52) then still recovered — diagnose→change-one-variable rather than abandon

### RS-07 · `2026-08-12T09-10-25-019ff64f-640f-7673-807c-94d044149429` · recovery-success · selection=strict

- **Slug/cwd:** socratink · `/Users/jondev/dev/active/socratink/prod/socratink`
- **Scores:** plate=1.62 · thrash_p=0.18 · happy=0.6 · load=2.74 · verify=0.52 · stage=verify · band=careful_good · gap=none
- **Retries/toolish:** retry_err≈66 · toolish≈141 · bytes≈24.1MB
- **Transferable tag:** `nugget:narrow_proof` · **Socratink-relevance:** **med**
- **Timeline sketch:**
  - Open: verify · band=careful_good · bytes≈24.1MB · toolish≈141 · retry/err≈66
  - Scores: plate=1.62 thrash_p=0.18 happy=0.6 verify=0.52 load=2.74 gap=none
  - Harness flags: app_context, agents_md, spawn, permissions, skill_eval
  - Signal1: “Codex (desktop) app, which allows some additional features not available in the CLI alone:  ### Images/Visuals/Files - In the app, the model can display images,…”
  - Signal2: “You are `/root`, the primary agent in a team of agents collaborating to fulfill the user\”
  - Signal3: “<skill> <name>noob-mode</name> <path>/Users/jondev/dev/active/socratink/prod/socratink/.agents/skills/noob-mode/SKILL.md</path> --- name: noob-mode description:…”
  - Flip: verify_ok rose (≥0.28) — named proof / stop-on-green likely landed
  - Flip: happy_path_fit strong (≥0.55) — Outcome/useful path recovered despite early thrash
- **What flipped recovery:**
  - verify_ok rose (≥0.28) — named proof / stop-on-green likely landed
  - happy_path_fit strong (≥0.55) — Outcome/useful path recovered despite early thrash
  - high retry/error sample (66) then still recovered — diagnose→change-one-variable rather than abandon

### RS-08 · `2026-09-11T23-54-18-01a093f7-6356-7192-a0d8-2250fe8704d0` · recovery-success · selection=strict

- **Slug/cwd:** socratink · `/Users/jondev/dev/active/socratink-landing`
- **Scores:** plate=1.125 · thrash_p=0.175 · happy=0.49 · load=2.26 · verify=0.21 · stage=impl · band=careful_good · gap=context_bloat
- **Retries/toolish:** retry_err≈51 · toolish≈98 · bytes≈6.3MB
- **Transferable tag:** `smell:context_bloat` · **Socratink-relevance:** **med**
- **Deep-card crossrefs:** TL-17
- **Timeline sketch:**
  - Open: impl · band=careful_good · bytes≈6.3MB · toolish≈98 · retry/err≈51
  - Scores: plate=1.125 thrash_p=0.175 happy=0.49 verify=0.21 load=2.26 gap=context_bloat
  - Harness flags: multi_agent_role, app_context, agents_md, spawn, memory_folder, skill_eval
  - Signal1: “Codex (desktop) app, which allows some additional features not available in the CLI alone:  ### Images/Visuals/Files - In the app, the model can display images,…”
  - Signal2: “but not installed.  - Atlassian Rovo (atlassian-rovo@openai-curated-remote) - Box (box@openai-curated-remote) - Databricks Genie (databricks@openai-curated-remo…”
  - Signal3: “could you critique the last two sections please and offer ways to imrpove them and make them seem more congruous to the beginnings of socratink in theme and sty…”
  - Flip: high retry/error sample (51) then still recovered — diagnose→change-one-variable rather than abandon
  - Flip: lifecycle landed in impl with usable happy fit
- **What flipped recovery:**
  - high retry/error sample (51) then still recovered — diagnose→change-one-variable rather than abandon
  - lifecycle landed in impl with usable happy fit

### RS-09 · `2026-08-30T16-13-51-01a05485-8327-76c0-a537-67c77d7d235c` · recovery-success · selection=strict

- **Slug/cwd:** unknown · `/Users/jondev/dev/sandbox/persona_farm`
- **Scores:** plate=0.77 · thrash_p=0.175 · happy=0.43 · load=2.105 · verify=0.165 · stage=review · band=careful_good · gap=governance
- **Retries/toolish:** retry_err≈37 · toolish≈122 · bytes≈4.2MB
- **Transferable tag:** `nugget:narrow_proof` · **Socratink-relevance:** **med**
- **Deep-card crossrefs:** PG-10, TL-10
- **Timeline sketch:**
  - Open: review · band=careful_good · bytes≈4.2MB · toolish≈122 · retry/err≈37
  - Scores: plate=0.77 thrash_p=0.175 happy=0.43 verify=0.165 load=2.105 gap=governance
  - Harness flags: app_context, agents_md, spawn, skill_eval
  - Signal1: “Codex (desktop) app, which allows some additional features not available in the CLI alone:  ### Images/Visuals/Files - In the app, the model can display images,…”
  - Signal2: “You are `/root`, the primary agent in a team of agents collaborating to fulfill the user\”
  - Signal3: “/huashu-nuwa/SKILL.md) on creating a persona for Andrew Ng with a particular orientation toward creating the best competitive startup against his named [https:/…”
  - Flip: lifecycle landed in review with usable happy fit
  - End-state: recovery-success (thrash early/mid → happy/verify cleared; would_retry=0.515)
- **What flipped recovery:**
  - lifecycle landed in review with usable happy fit

### RS-10 · `2026-08-16T12-38-15-01a00ba7-1803-7d11-9a66-3e98fb174764` · recovery-success · selection=strict

- **Slug/cwd:** unknown · `/Users/jondev/dev/active/skill-eval-loop`
- **Scores:** plate=0.62 · thrash_p=0.17 · happy=0.36 · load=2.37 · verify=0.37 · stage=research · band=careful_good · gap=none
- **Retries/toolish:** retry_err≈45 · toolish≈124 · bytes≈9.5MB
- **Transferable tag:** `nugget:scout_only` · **Socratink-relevance:** **med**
- **Deep-card crossrefs:** PG-07
- **Timeline sketch:**
  - Open: research · band=careful_good · bytes≈9.5MB · toolish≈124 · retry/err≈45
  - Scores: plate=0.62 thrash_p=0.17 happy=0.36 verify=0.37 load=2.37 gap=none
  - Harness flags: app_context, agents_md, spawn, skill_eval
  - Signal1: “Codex (desktop) app, which allows some additional features not available in the CLI alone:  ### Images/Visuals/Files - In the app, the model can display images,…”
  - Signal2: “You are `/root`, the primary agent in a team of agents collaborating to fulfill the user\”
  - Signal3: “I’ll build a bird’s-eye map of the project—purpose, runtime flow, important files, current Phase 2 status, and how to work on it safely. I’m using the repositor…”
  - Flip: verify_ok rose (≥0.28) — named proof / stop-on-green likely landed
  - End-state: recovery-success (thrash early/mid → happy/verify cleared; would_retry=0.52)
- **What flipped recovery:**
  - verify_ok rose (≥0.28) — named proof / stop-on-green likely landed

### RS-11 · `2026-08-29T14-56-14-01a04f4f-0981-7fd3-84bd-b8fba659113d` · recovery-success · selection=strict

- **Slug/cwd:** socratink · `/Users/jondev/dev/active/socratink/product/socratink`
- **Scores:** plate=1.365 · thrash_p=0.165 · happy=0.51 · load=2.155 · verify=0.225 · stage=mixed · band=careful_good · gap=none
- **Retries/toolish:** retry_err≈94 · toolish≈172 · bytes≈15.1MB
- **Transferable tag:** `nugget:recovery_flip` · **Socratink-relevance:** **high**
- **Timeline sketch:**
  - Open: mixed · band=careful_good · bytes≈15.1MB · toolish≈172 · retry/err≈94
  - Scores: plate=1.365 thrash_p=0.165 happy=0.51 verify=0.225 load=2.155 gap=none
  - Harness flags: app_context, agents_md, spawn, skill_eval, doctrine
  - Signal1: “Codex (desktop) app, which allows some additional features not available in the CLI alone:  ### Images/Visuals/Files - In the app, the model can display images,…”
  - Signal2: “You are `/root`, the primary agent in a team of agents collaborating to fulfill the user\”
  - Signal3: “what is the state of the UI? can you evaluate it?”
  - Flip: high retry/error sample (94) then still recovered — diagnose→change-one-variable rather than abandon
  - End-state: recovery-success (thrash early/mid → happy/verify cleared; would_retry=0.55)
- **What flipped recovery:**
  - high retry/error sample (94) then still recovered — diagnose→change-one-variable rather than abandon

### RS-12 · `2026-09-12T21-12-22-01a09889-7ed8-79a1-ac9b-6e69cec50780` · recovery-success · selection=strict

- **Slug/cwd:** socratink · `/Users/jondev/dev/active/socratink-landing`
- **Scores:** plate=0.955 · thrash_p=0.165 · happy=0.485 · load=1.975 · verify=0.48 · stage=impl · band=fast_good · gap=none
- **Retries/toolish:** retry_err≈26 · toolish≈126 · bytes≈7.3MB
- **Transferable tag:** `nugget:narrow_proof` · **Socratink-relevance:** **med**
- **Deep-card crossrefs:** PG-18
- **Timeline sketch:**
  - Open: impl · band=fast_good · bytes≈7.3MB · toolish≈126 · retry/err≈26
  - Scores: plate=0.955 thrash_p=0.165 happy=0.485 verify=0.48 load=1.975 gap=none
  - Harness flags: multi_agent_role, app_context, agents_md, spawn, memory_folder, skill_eval
  - Signal1: “Codex (desktop) app, which allows some additional features not available in the CLI alone:  ### Images/Visuals/Files - In the app, the model can display images,…”
  - Signal2: “but not installed.  - Box (box@openai-curated-remote) - Databricks Genie (databricks@openai-curated-remote) - Notion (notion@openai-curated-remote) - Outlook Ca…”
  - Signal3: “lets go section by section to improve this landing page please to a finished state to push to prod.”
  - Flip: verify_ok rose (≥0.28) — named proof / stop-on-green likely landed
  - Flip: lifecycle landed in impl with usable happy fit
- **What flipped recovery:**
  - verify_ok rose (≥0.28) — named proof / stop-on-green likely landed
  - lifecycle landed in impl with usable happy fit

### RS-13 · `2026-09-01T14-17-04-01a05e67-52f8-7c03-bf7c-0f195be2c6f4` · recovery-success · selection=strict

- **Slug/cwd:** socratink · `/Users/jondev/dev/active/socratink/product/socratink`
- **Scores:** plate=1.37 · thrash_p=0.155 · happy=0.56 · load=2.51 · verify=0.17 · stage=plan · band=careful_good · gap=none
- **Retries/toolish:** retry_err≈68 · toolish≈156 · bytes≈7.2MB
- **Transferable tag:** `nugget:recovery_flip` · **Socratink-relevance:** **high**
- **Timeline sketch:**
  - Open: plan · band=careful_good · bytes≈7.2MB · toolish≈156 · retry/err≈68
  - Scores: plate=1.37 thrash_p=0.155 happy=0.56 verify=0.17 load=2.51 gap=none
  - Harness flags: app_context, agents_md, spawn, skill_eval, doctrine
  - Signal1: “Codex (desktop) app, which allows some additional features not available in the CLI alone:  ### Images/Visuals/Files - In the app, the model can display images,…”
  - Signal2: “You are `/root`, the primary agent in a team of agents collaborating to fulfill the user\”
  - Flip: happy_path_fit strong (≥0.55) — Outcome/useful path recovered despite early thrash
  - Flip: high retry/error sample (68) then still recovered — diagnose→change-one-variable rather than abandon
  - End-state: recovery-success (thrash early/mid → happy/verify cleared; would_retry=0.51)
- **What flipped recovery:**
  - happy_path_fit strong (≥0.55) — Outcome/useful path recovered despite early thrash
  - high retry/error sample (68) then still recovered — diagnose→change-one-variable rather than abandon

### RS-14 · `2026-09-11T23-35-54-01a093e6-88c2-7c22-9689-f075fb5e36fe` · recovery-success · selection=strict

- **Slug/cwd:** socratink · `/Users/jondev/dev/active/socratink-landing`
- **Scores:** plate=1.92 · thrash_p=0.15 · happy=0.77 · load=2.93 · verify=0.645 · stage=impl · band=fast_good · gap=none
- **Retries/toolish:** retry_err≈41 · toolish≈74 · bytes≈4.9MB
- **Transferable tag:** `nugget:narrow_proof` · **Socratink-relevance:** **med**
- **Timeline sketch:**
  - Open: impl · band=fast_good · bytes≈4.9MB · toolish≈74 · retry/err≈41
  - Scores: plate=1.92 thrash_p=0.15 happy=0.77 verify=0.645 load=2.93 gap=none
  - Harness flags: multi_agent_role, app_context, agents_md, spawn, memory_folder, skill_eval
  - Signal1: “Codex (desktop) app, which allows some additional features not available in the CLI alone:  ### Images/Visuals/Files - In the app, the model can display images,…”
  - Signal2: “but not installed.  - Atlassian Rovo (atlassian-rovo@openai-curated-remote) - Box (box@openai-curated-remote) - Databricks Genie (databricks@openai-curated-remo…”
  - Signal3: “ue and implement a focused 10x redesign of the scroll-driven “How a session works” section.  Inspect the live page at [http://localhost:3002](http://localhost:3…”
  - Flip: verify_ok rose (≥0.28) — named proof / stop-on-green likely landed
  - Flip: happy_path_fit strong (≥0.55) — Outcome/useful path recovered despite early thrash
- **What flipped recovery:**
  - verify_ok rose (≥0.28) — named proof / stop-on-green likely landed
  - happy_path_fit strong (≥0.55) — Outcome/useful path recovered despite early thrash
  - high retry/error sample (41) then still recovered — diagnose→change-one-variable rather than abandon

---

## B. Fatal thrash cards

### FT-01 · `2026-08-09T01-17-16-019fe52b-1e6a-7e22-9e16-09e1ae1358af` · fatal-thrash · selection=strict

- **Slug/cwd:** socratink · `/Users/jondev/dev/sandbox/socratink.io`
- **Scores:** plate=0.93 · thrash_p=0.7 · happy=0.25 · load=2.3 · verify=0.13 · stage=impl · band=careful_good · gap=thrash
- **Retries/toolish:** retry_err≈50 · toolish≈163 · bytes≈5.7MB
- **Transferable tag:** `smell:thrash` · **Socratink-relevance:** **high**
- **Deep-card crossrefs:** PG-16, TL-01
- **Timeline sketch:**
  - Open: impl · band=careful_good · bytes≈5.7MB · toolish≈163 · retry/err≈50
  - Scores: plate=0.93 thrash_p=0.7 happy=0.25 verify=0.13 load=2.3 gap=thrash
  - Harness flags: agents_md, memory_folder, skill_eval
  - Signal1: “rior runs. It can save time and help you stay consistent. Use it whenever it is likely to help.  Decision boundary: should you use memory for a new user query? …”
  - Signal2: “can you use skill-scout to find a skill that orients you to the code base best?”
  - Signal3: “I’m using `skill-scout` to inventory the repository’s available skills and identify the strongest codebase-orientation fit, with evidence from the repo rather t…”
  - Stuck: primary_gap=thrash — skill/path or tool cycles without green gate
  - Stuck: extreme thrash_p=0.70 without happy/verify recovery
- **Why fatal:**
  - primary_gap=thrash — skill/path or tool cycles without green gate
  - extreme thrash_p=0.70 without happy/verify recovery
  - verify_ok stuck low (0.13) — no stop-on-green
  - happy_path_fit never cleared (0.25)

### FT-02 · `2026-08-01T11-24-13-019fbe23-ee7c-7451-ac56-885f75b08c91` · fatal-thrash · selection=strict

- **Slug/cwd:** unknown · `/Users/jondev`
- **Scores:** plate=1.68 · thrash_p=0.48 · happy=0.37 · load=2.35 · verify=0.12 · stage=impl · band=careful_good · gap=governance
- **Retries/toolish:** retry_err≈26 · toolish≈165 · bytes≈7.7MB
- **Transferable tag:** `smell:governance` · **Socratink-relevance:** **med**
- **Deep-card crossrefs:** TL-04
- **Timeline sketch:**
  - Open: impl · band=careful_good · bytes≈7.7MB · toolish≈165 · retry/err≈26
  - Scores: plate=1.68 thrash_p=0.48 happy=0.37 verify=0.12 load=2.35 gap=governance
  - Harness flags: outcome_plate, proof, permissions
  - Signal1: “s can be read or written. `sandbox_mode` is `workspace-write`: The sandbox permits reading files, and editing files in `cwd` and `writable_roots`. Editing files…”
  - Signal2: “ll>   <current_date>2026-08-01</current_date>   <timezone>America/Chicago</timezone>   <filesystem><workspace_roots><root>/Users/jondev</root></workspace_roots>…”
  - Signal3: “can you use youtube transcript extractor on this video: https://youtu.be/g-CD1d0q01I?si=7i57SZdLz9gJslh7  and save it somewhere in the socratink project?”
  - Stuck: extreme thrash_p=0.48 without happy/verify recovery
  - Stuck: verify_ok stuck low (0.12) — no stop-on-green
- **Why fatal:**
  - extreme thrash_p=0.48 without happy/verify recovery
  - verify_ok stuck low (0.12) — no stop-on-green
  - co-traveling gap=governance blocked recovery

### FT-03 · `2026-09-10T23-32-30-01a08ebd-1231-74d0-9524-57ccd7966c89` · fatal-thrash · selection=strict

- **Slug/cwd:** socratink · `/Users/jondev/dev/active/socratink-landing`
- **Scores:** plate=0.785 · thrash_p=0.395 · happy=0.245 · load=2.735 · verify=0.155 · stage=review · band=careful_good · gap=none
- **Retries/toolish:** retry_err≈37 · toolish≈157 · bytes≈4.0MB
- **Transferable tag:** `smell:missing_verify` · **Socratink-relevance:** **med**
- **Deep-card crossrefs:** PG-12
- **Timeline sketch:**
  - Open: review · band=careful_good · bytes≈4.0MB · toolish≈157 · retry/err≈37
  - Scores: plate=0.785 thrash_p=0.395 happy=0.245 verify=0.155 load=2.735 gap=none
  - Harness flags: app_context
  - Signal1: “Codex (desktop) app, which allows some additional features not available in the CLI alone:  ### Images/Visuals/Files - In the app, the model can display images,…”
  - Signal2: “but not installed.  - Atlassian Rovo (atlassian-rovo@openai-curated-remote) - Box (box@openai-curated-remote) - Databricks Genie (databricks@openai-curated-remo…”
  - Stuck: verify_ok stuck low (0.155) — no stop-on-green
  - Stuck: happy_path_fit never cleared (0.245)
  - End-state: fatal thrash / no recovery (happy=0.245 verify=0.155)
- **Why fatal:**
  - verify_ok stuck low (0.155) — no stop-on-green
  - happy_path_fit never cleared (0.245)

### FT-04 · `2026-08-29T22-27-23-01a050ec-1013-7b51-a6b1-8055e87b6d36` · fatal-thrash · selection=strict

- **Slug/cwd:** socratink · `/Users/jondev/dev/active/socratink/product/socratink`
- **Scores:** plate=0.14 · thrash_p=0.275 · happy=0.155 · load=1.935 · verify=0.14 · stage=research · band=careful_good · gap=over_trust
- **Retries/toolish:** retry_err≈38 · toolish≈165 · bytes≈4.9MB
- **Transferable tag:** `smell:over_trust` · **Socratink-relevance:** **med**
- **Deep-card crossrefs:** PG-02, TL-19
- **Timeline sketch:**
  - Open: research · band=careful_good · bytes≈4.9MB · toolish≈165 · retry/err≈38
  - Scores: plate=0.14 thrash_p=0.275 happy=0.155 verify=0.14 load=1.935 gap=over_trust
  - Harness flags: agents_md, spawn, oh_my_codex, skill_eval
  - Signal1: “You are `/root`, the primary agent in a team of agents collaborating to fulfill the user\”
  - Signal2: “uct/socratink  <INSTRUCTIONS> <!-- AUTONOMY DIRECTIVE — DO NOT REMOVE --> YOU ARE AN AUTONOMOUS CODING AGENT. EXECUTE TASKS TO COMPLETION WITHOUT ASKING FOR PER…”
  - Signal3: “skills/praxist-takeover/SKILL.md</path> --- name: praxist-takeover description: Orchestrate first-use Praxist onboarding, current task initialization, validatio…”
  - Stuck: verify_ok stuck low (0.14) — no stop-on-green
  - Stuck: happy_path_fit never cleared (0.155)
- **Why fatal:**
  - verify_ok stuck low (0.14) — no stop-on-green
  - happy_path_fit never cleared (0.155)
  - co-traveling gap=over_trust blocked recovery

### FT-05 · `2026-09-05T09-58-40-01a07214-2d30-7301-84e3-c251ad08f785` · fatal-thrash · selection=strict

- **Slug/cwd:** socratink · `/Users/jondev/dev/active/socratink-landing`
- **Scores:** plate=0.99 · thrash_p=0.26 · happy=0.335 · load=1.775 · verify=0.11 · stage=plan · band=careful_good · gap=thrash
- **Retries/toolish:** retry_err≈54 · toolish≈162 · bytes≈117.1MB
- **Transferable tag:** `smell:thrash` · **Socratink-relevance:** **high**
- **Deep-card crossrefs:** PG-19, TL-02
- **Timeline sketch:**
  - Open: plan · band=careful_good · bytes≈117.1MB · toolish≈162 · retry/err≈54
  - Scores: plate=0.99 thrash_p=0.26 happy=0.335 verify=0.11 load=1.775 gap=thrash
  - Harness flags: multi_agent_role, app_context, agents_md, spawn, skill_eval
  - Signal1: “Codex (desktop) app, which allows some additional features not available in the CLI alone:  ### Images/Visuals/Files - In the app, the model can display images,…”
  - Signal2: “but not installed.  - Atlassian Rovo (atlassian-rovo@openai-curated-remote) - Box (box@openai-curated-remote) - Google Calendar (google-calendar@openai-curated-…”
  - Signal3: “ow described in `plugins/nateherk-design/skills/scroll-craft/SKILL.md`.  Task: Read `plugins/nateherk-design/skills/scroll-craft/SKILL.md` and use it to build m…”
  - Stuck: primary_gap=thrash — skill/path or tool cycles without green gate
  - Stuck: verify_ok stuck low (0.11) — no stop-on-green
- **Why fatal:**
  - primary_gap=thrash — skill/path or tool cycles without green gate
  - verify_ok stuck low (0.11) — no stop-on-green
  - retry/error sample 54 without happy recovery — identical-retry smell

### FT-06 · `2026-08-27T01-13-50-01a04211-603f-7142-93f2-5742ae250e01` · fatal-thrash · selection=strict

- **Slug/cwd:** socratink · `/Users/jondev/dev/active/socratink/product/socratink`
- **Scores:** plate=1.055 · thrash_p=0.245 · happy=0.31 · load=2.54 · verify=0.195 · stage=review · band=careful_good · gap=none
- **Retries/toolish:** retry_err≈57 · toolish≈105 · bytes≈5.2MB
- **Transferable tag:** `smell:thrash` · **Socratink-relevance:** **high**
- **Timeline sketch:**
  - Open: review · band=careful_good · bytes≈5.2MB · toolish≈105 · retry/err≈57
  - Scores: plate=1.055 thrash_p=0.245 happy=0.31 verify=0.195 load=2.54 gap=none
  - Harness flags: app_context, agents_md, spawn, skill_eval, doctrine
  - Signal1: “Codex (desktop) app, which allows some additional features not available in the CLI alone:  ### Images/Visuals/Files - In the app, the model can display images,…”
  - Signal2: “You are `/root`, the primary agent in a team of agents collaborating to fulfill the user\”
  - Signal3: “-jobs-perspective](/Users/jondev/dev/active/socratink/product/socratink/.agents/skills/steve-jobs-perspective/SKILL.md) might critique it for the agentic era? t…”
  - Stuck: verify_ok stuck low (0.195) — no stop-on-green
  - Stuck: retry/error sample 57 without happy recovery — identical-retry smell
- **Why fatal:**
  - verify_ok stuck low (0.195) — no stop-on-green
  - retry/error sample 57 without happy recovery — identical-retry smell

### FT-07 · `2026-08-15T00-33-52-01a003e9-8abc-7602-acc3-96966c220eac` · fatal-thrash · selection=strict

- **Slug/cwd:** unknown · `/Users/jondev`
- **Scores:** plate=0.77 · thrash_p=0.21 · happy=0.28 · load=2.54 · verify=0.11 · stage=research · band=careful_good · gap=context_bloat
- **Retries/toolish:** retry_err≈37 · toolish≈132 · bytes≈4.0MB
- **Transferable tag:** `smell:context_bloat` · **Socratink-relevance:** **med**
- **Deep-card crossrefs:** PG-11, TL-15
- **Timeline sketch:**
  - Open: research · band=careful_good · bytes≈4.0MB · toolish≈132 · retry/err≈37
  - Scores: plate=0.77 thrash_p=0.21 happy=0.28 verify=0.11 load=2.54 gap=context_bloat
  - Harness flags: agents_md, spawn, oh_my_codex, skill_eval
  - Signal1: “You are `/root`, the primary agent in a team of agents collaborating to fulfill the user\”
  - Signal2: “— DO NOT REMOVE --> YOU ARE AN AUTONOMOUS CODING AGENT. EXECUTE TASKS TO COMPLETION WITHOUT ASKING FOR PERMISSION. DO NOT STOP TO ASK "SHOULD I PROCEED?" — PROC…”
  - Signal3: “how docan you help me fix omx? heres the repo: https://github.com/Yeachan-Heo/oh-my-codex”
  - Stuck: verify_ok stuck low (0.11) — no stop-on-green
  - Stuck: happy_path_fit never cleared (0.28)
- **Why fatal:**
  - verify_ok stuck low (0.11) — no stop-on-green
  - happy_path_fit never cleared (0.28)
  - co-traveling gap=context_bloat blocked recovery

### FT-08 · `2026-09-04T18-56-51-01a06eda-8d20-77c3-a8e8-d680ade4b200` · fatal-thrash · selection=strict

- **Slug/cwd:** socratink · `/Users/jondev/dev/active/socratink/product/socratink`
- **Scores:** plate=0.525 · thrash_p=0.2 · happy=0.22 · load=2.145 · verify=0.2 · stage=research · band=careful_good · gap=governance
- **Retries/toolish:** retry_err≈121 · toolish≈152 · bytes≈5.1MB
- **Transferable tag:** `smell:governance` · **Socratink-relevance:** **med**
- **Deep-card crossrefs:** PG-06, TL-07
- **Timeline sketch:**
  - Open: research · band=careful_good · bytes≈5.1MB · toolish≈152 · retry/err≈121
  - Scores: plate=0.525 thrash_p=0.2 happy=0.22 verify=0.2 load=2.145 gap=governance
  - Harness flags: agents_md, spawn, model_switch, skill_eval
  - Signal1: “ase continue the conversation according to the following instructions:  You are Codex, an agent based on GPT-5. You and the user share one workspace, and your j…”
  - Signal2: “k.  You can spawn sub-agents to handle subtasks, and those sub-agents can spawn their own sub-agents. All agents in the team, including the agents that you can …”
  - Signal3: “I’ll build a read-only evidence set from the repository guidance, dated learnings, git history, project skill definitions, and bounded Codex task history. I’ll …”
  - Stuck: happy_path_fit never cleared (0.22)
  - Stuck: co-traveling gap=governance blocked recovery
- **Why fatal:**
  - happy_path_fit never cleared (0.22)
  - co-traveling gap=governance blocked recovery
  - retry/error sample 121 without happy recovery — identical-retry smell

### FT-09 · `2026-08-12T13-23-52-019ff737-6d9e-7ba3-b71f-31d293083bbc` · fatal-thrash · selection=strict

- **Slug/cwd:** unknown · `/Users/jondev/dev/sandbox/skill-refactor`
- **Scores:** plate=1.07 · thrash_p=0.19 · happy=0.33 · load=2.46 · verify=0.11 · stage=research · band=careful_good · gap=thrash
- **Retries/toolish:** retry_err≈43 · toolish≈135 · bytes≈5.9MB
- **Transferable tag:** `smell:thrash` · **Socratink-relevance:** **med**
- **Deep-card crossrefs:** TL-03
- **Timeline sketch:**
  - Open: research · band=careful_good · bytes≈5.9MB · toolish≈135 · retry/err≈43
  - Scores: plate=1.07 thrash_p=0.19 happy=0.33 verify=0.11 load=2.46 gap=thrash
  - Harness flags: agents_md, memory_folder, outcome_plate, skill_eval
  - Signal1: “rior runs. It can save time and help you stay consistent. Use it whenever it is likely to help.  Decision boundary: should you use memory for a new user query? …”
  - Signal2: “nts  ## Complexity warning  Before proposing or creating a new abstraction, workflow, skill, agent team, persistent artifact, or automation, pause when any of t…”
  - Signal3: “can you help me fix the path of yt-wiki vault Its in my Documents folder now. i get an error when running yt-ingest”
  - Stuck: primary_gap=thrash — skill/path or tool cycles without green gate
  - Stuck: verify_ok stuck low (0.11) — no stop-on-green
- **Why fatal:**
  - primary_gap=thrash — skill/path or tool cycles without green gate
  - verify_ok stuck low (0.11) — no stop-on-green

### FT-10 · `2026-09-13T22-57-14-01a09e0f-d99e-7170-a9fe-5bf3d8edbb5b` · fatal-thrash · selection=strict

- **Slug/cwd:** socratink · `/Users/jondev/dev/active/socratink-landing`
- **Scores:** plate=1.025 · thrash_p=0.16 · happy=0.285 · load=2.495 · verify=0.265 · stage=research · band=careful_good · gap=context_bloat
- **Retries/toolish:** retry_err≈43 · toolish≈149 · bytes≈4.5MB
- **Transferable tag:** `smell:context_bloat` · **Socratink-relevance:** **med**
- **Deep-card crossrefs:** TL-16
- **Timeline sketch:**
  - Open: research · band=careful_good · bytes≈4.5MB · toolish≈149 · retry/err≈43
  - Scores: plate=1.025 thrash_p=0.16 happy=0.285 verify=0.265 load=2.495 gap=context_bloat
  - Harness flags: multi_agent_role, app_context, agents_md, spawn, skill_eval
  - Signal1: “Codex (desktop) app, which allows some additional features not available in the CLI alone:  ### Images/Visuals/Files - In the app, the model can display images,…”
  - Signal2: “but not installed.  - Box (box@openai-curated-remote) - Databricks Genie (databricks@openai-curated-remote) - Notion (notion@openai-curated-remote) - Outlook Ca…”
  - Signal3: “I’ll open the page and watch the hero’s motion, then inspect how the ink blob is built so I can identify what would make it feel more alive and ready to publish…”
  - Stuck: happy_path_fit never cleared (0.285)
  - Stuck: co-traveling gap=context_bloat blocked recovery
- **Why fatal:**
  - happy_path_fit never cleared (0.285)
  - co-traveling gap=context_bloat blocked recovery

### FT-11 · `2026-08-07T19-17-07-019fdebb-0850-7140-9900-0414963a85f8` · fatal-thrash · selection=near_expand

- **Slug/cwd:** socratink · `/Users/jondev/dev/sandbox/socratink.io`
- **Scores:** plate=0.91 · thrash_p=0.21 · happy=0.28 · load=1.86 · verify=0.3 · stage=research · band=careful_good · gap=none
- **Retries/toolish:** retry_err≈24 · toolish≈119 · bytes≈7.2MB
- **Transferable tag:** `nugget:scout_only` · **Socratink-relevance:** **high**
- **Deep-card crossrefs:** PG-15
- **Timeline sketch:**
  - Open: research · band=careful_good · bytes≈7.2MB · toolish≈119 · retry/err≈24
  - Scores: plate=0.91 thrash_p=0.21 happy=0.28 verify=0.3 load=1.86 gap=none
  - Harness flags: agents_md, skill_eval
  - Signal1: “ions to follow that is stored in a `SKILL.md` file. Below is the list of skills that can be used. Each entry includes a name, description, and a short path that…”
  - Signal2: “$skill-scout to find a skill that looks at a code base, understands its system architecture, and is able to iterate on another version of the core logic and fun…”
  - Signal3: “ocratink.io/.agents/skills/skill-scout/SKILL.md</path> --- name: skill-scout description: >   Scout existing agent skills with evidence before creating one. Use…”
  - Stuck: happy_path_fit never cleared (0.28)
  - End-state: fatal thrash / no recovery (happy=0.28 verify=0.3)
- **Why fatal:**
  - happy_path_fit never cleared (0.28)
  - near-fatal expand: thrash≥0.13 + happy<0.38 (pool shortfall)

### FT-12 · `2026-08-25T12-22-03-01a03a28-6ee3-7622-a577-2484959b1e1a` · fatal-thrash · selection=near_expand

- **Slug/cwd:** socratink · `/Users/jondev/dev/active/socratink/product/socratink`
- **Scores:** plate=1.945 · thrash_p=0.145 · happy=0.345 · load=1.555 · verify=0.315 · stage=research · band=careful_good · gap=none
- **Retries/toolish:** retry_err≈27 · toolish≈160 · bytes≈6.1MB
- **Transferable tag:** `smell:thrash` · **Socratink-relevance:** **high**
- **Timeline sketch:**
  - Open: research · band=careful_good · bytes≈6.1MB · toolish≈160 · retry/err≈27
  - Scores: plate=1.945 thrash_p=0.145 happy=0.345 verify=0.315 load=1.555 gap=none
  - Harness flags: app_context, agents_md, spawn, memory_folder, outcome_plate, skill_eval
  - Signal1: “Codex (desktop) app, which allows some additional features not available in the CLI alone:  ### Images/Visuals/Files - In the app, the model can display images,…”
  - Signal2: “You are `/root`, the primary agent in a team of agents collaborating to fulfill the user\”
  - Signal3: “.agents/skills/socratink-brain (run orient, read read\\_now, then context/show EXP-0001). Do not reconstruct doctrine from memory.  One-sentence outcome for THI…”
  - Stuck: thrash signal without verify+happy recovery
  - End-state: fatal thrash / no recovery (happy=0.345 verify=0.315)
- **Why fatal:**
  - thrash signal without verify+happy recovery
  - near-fatal expand: thrash≥0.13 + happy<0.38 (pool shortfall)

---

## C. Codex happy nuggets (recovery-shaped / plate-strong) — CR-H*

### CR-H01 · recovery
- **Pattern:** Thrash early → rewrite Outcome plate → verify stage lands with happy≥0.55
- **Evidence sessions:** `2026-09-11T21-28-35-01a09371-fa97-7633-9969-d9bf00c5fb35`, `2026-09-01T23-16-07-01a06054-d36d-7e71-a321-6105bae161e4`, `2026-08-31T19-37-04-01a05a65-eedb-7ab3-9ca6-e527f1fbda82`
- **Why:** Recovery is plate-shaped, not “try harder” identical retries.
- **Socratink-relevance:** high

### CR-H02 · recovery
- **Pattern:** High retry/error sample (≥40) still recovers when diagnose→change-one-variable
- **Evidence sessions:** `2026-09-11T21-28-35-01a09371-fa97-7633-9969-d9bf00c5fb35`, `2026-09-01T23-16-07-01a06054-d36d-7e71-a321-6105bae161e4`, `2026-08-31T19-37-04-01a05a65-eedb-7ab3-9ca6-e527f1fbda82`
- **Why:** Retry count alone ≠ fatal; flip is changing the variable.
- **Socratink-relevance:** high

### CR-H03 · recovery
- **Pattern:** Narrow proof / stop-on-green clears thrash (verify_ok≥0.45)
- **Evidence sessions:** `2026-08-12T09-10-25-019ff64f-640f-7673-807c-94d044149429`, `2026-09-12T21-12-22-01a09889-7ed8-79a1-ac9b-6e69cec50780`, `2026-09-11T23-35-54-01a093e6-88c2-7c22-9689-f075fb5e36fe`
- **Why:** Named proof commands convert thrash into recovery-success.
- **Socratink-relevance:** high

### CR-H04 · plate-strong
- **Pattern:** Impl/review sessions with happy≥0.60 despite mid thrash_p
- **Evidence sessions:** `2026-09-11T21-28-35-01a09371-fa97-7633-9969-d9bf00c5fb35`, `2026-09-11T23-35-54-01a093e6-88c2-7c22-9689-f075fb5e36fe`
- **Why:** Ship-shaped end state can outrank early path noise.
- **Socratink-relevance:** high

### CR-H05 · recovery
- **Pattern:** User re-asks for remaining/stable scope mid-session → agent re-plates
- **Evidence sessions:** `2026-09-01T14-34-46-01a05e77-86c5-7a31-951b-be73febe91be`
- **Why:** Human “what remains for stable?” is a recovery tripwire — treat as new plate.
- **Socratink-relevance:** high

### CR-H06 · plate-strong
- **Pattern:** Doctrine/brief unpack before edits (AI Engineer v0-style) then architecture-as-docs
- **Evidence sessions:** `2026-08-31T19-37-04-01a05a65-eedb-7ab3-9ca6-e527f1fbda82`
- **Why:** Grounding against doctrine before code reduces thrash into narrow proof.
- **Socratink-relevance:** high

### CR-H07 · recovery
- **Pattern:** Subagent completes scoped visual/motion fix after scout diagnosis
- **Evidence sessions:** `2026-09-11T21-28-35-01a09371-fa97-7633-9969-d9bf00c5fb35`
- **Why:** Scout→scoped subagent handoff recovers when parent stops thrashing the same file.
- **Socratink-relevance:** med

### CR-H08 · plate-strong
- **Pattern:** Verify-stage sessions with gap=none despite thrash_p≥0.18
- **Evidence sessions:** `2026-08-30T15-13-16-01a05356-7d5f-7871-8623-970e02a2c54c`, `2026-08-31T19-37-04-01a05a65-eedb-7ab3-9ca6-e527f1fbda82`, `2026-08-12T09-10-25-019ff64f-640f-7673-807c-94d044149429`
- **Why:** Gap=none + verify stage is the recovery signature in Codex strata.
- **Socratink-relevance:** high

### CR-H09 · recovery
- **Pattern:** Landing/prod push ask finishes with verify≈happy≈0.48 after thrash 0.17
- **Evidence sessions:** `2026-09-12T21-12-22-01a09889-7ed8-79a1-ac9b-6e69cec50780`
- **Why:** Prod-gate ask + dual happy/verify mid scores = recovery over abandon.
- **Socratink-relevance:** med

### CR-H10 · plate-strong
- **Pattern:** Mixed/verify with would_retry≥0.50 after governance-flavored thrash
- **Evidence sessions:** `2026-09-01T14-34-46-01a05e77-86c5-7a31-951b-be73febe91be`, `2026-09-01T23-16-07-01a06054-d36d-7e71-a321-6105bae161e4`, `2026-08-30T16-13-51-01a05485-8327-76c0-a537-67c77d7d235c`
- **Why:** Governance thrash can still recover if plate+proof reasserted.
- **Socratink-relevance:** high

### CR-H11 · recovery
- **Pattern:** fast_good band + thrash mid → keep tripwire but do not auto-fatal
- **Evidence sessions:** `2026-09-12T21-12-22-01a09889-7ed8-79a1-ac9b-6e69cec50780`, `2026-09-11T23-35-54-01a093e6-88c2-7c22-9689-f075fb5e36fe`
- **Why:** Band≠loop-health; recovery cards teach tripwire without punishing ship.
- **Socratink-relevance:** med

### CR-H12 · plate-strong
- **Pattern:** High happy (≥0.70) with only mid thrash — plate held under load
- **Evidence sessions:** `2026-09-11T21-28-35-01a09371-fa97-7633-9969-d9bf00c5fb35`, `2026-09-11T23-35-54-01a093e6-88c2-7c22-9689-f075fb5e36fe`
- **Why:** Plate-strong sessions are positive controls for recovery heuristics.
- **Socratink-relevance:** high

## D. Fatal smells — CR-S*

### CR-S01 · fatal
- **Pattern:** Skill-path thrash: missing SKILL.md / wrong scout path, retry loops, verify never greens
- **Evidence sessions:** `2026-09-05T09-58-40-01a07214-2d30-7301-84e3-c251ad08f785`, `2026-08-09T01-17-16-019fe52b-1e6a-7e22-9e16-09e1ae1358af`
- **Why:** Fatal when skill discovery substitutes for Outcome+proof.
- **Maps to:** T2/T4
- **Socratink-relevance:** high

### CR-S02 · fatal
- **Pattern:** Extreme thrash_p (≥0.40) with happy<0.40 and verify<0.20
- **Evidence sessions:** `2026-08-09T01-17-16-019fe52b-1e6a-7e22-9e16-09e1ae1358af`, `2026-08-01T11-24-13-019fbe23-ee7c-7451-ac56-885f75b08c91`
- **Why:** Poster fatal — tool cycles without recovery flip.
- **Maps to:** T2/F1
- **Socratink-relevance:** high

### CR-S03 · fatal
- **Pattern:** Home-root / wide cwd + permissions sprawl during thrash
- **Evidence sessions:** `2026-08-01T11-24-13-019fbe23-ee7c-7451-ac56-885f75b08c91`, `2026-08-15T00-33-52-01a003e9-8abc-7602-acc3-96966c220eac`
- **Why:** Unfenced cwd turns thrash into governance blast-radius.
- **Maps to:** T5/governance
- **Socratink-relevance:** med

### CR-S04 · fatal
- **Pattern:** Over-trust / oh-my-codex multi-agent before one-sentence Outcome
- **Evidence sessions:** `2026-08-29T22-27-23-01a050ec-1013-7b51-a6b1-8055e87b6d36`
- **Why:** Sprawl invited before plate → thrash without recovery.
- **Maps to:** over_trust
- **Socratink-relevance:** med

### CR-S05 · fatal
- **Pattern:** Model-switch continue without rewritten plate
- **Evidence sessions:** `2026-09-04T18-56-51-01a06eda-8d20-77c3-a8e8-d680ade4b200`
- **Why:** Continuity prompt ≠ Outcome/cwd/proof/stop — fatal handoff rot.
- **Maps to:** F8/T10
- **Socratink-relevance:** high

### CR-S06 · fatal
- **Pattern:** Context bloat preamble consumes window; thrash mid; happy stuck <0.30
- **Evidence sessions:** `2026-08-15T00-33-52-01a003e9-8abc-7602-acc3-96966c220eac`, `2026-09-13T22-57-14-01a09e0f-d99e-7170-a9fe-5bf3d8edbb5b`
- **Why:** Bloat masks plate; thrash never gets a clean rewrite.
- **Maps to:** context_bloat
- **Socratink-relevance:** med

### CR-S07 · fatal
- **Pattern:** 117MB long-horizon skill-path hunt without green gate
- **Evidence sessions:** `2026-09-05T09-58-40-01a07214-2d30-7301-84e3-c251ad08f785`
- **Why:** Size+thrash without verify = abandoned recovery.
- **Maps to:** T2/T10
- **Socratink-relevance:** high

### CR-S08 · fatal
- **Pattern:** Path-fix thrash (yt-wiki / Documents path) without plate rewrite
- **Evidence sessions:** `2026-08-12T13-23-52-019ff737-6d9e-7ba3-b71f-31d293083bbc`
- **Why:** Identical path retries; primary_gap=thrash.
- **Maps to:** T2/T5
- **Socratink-relevance:** med

### CR-S09 · fatal
- **Pattern:** Review-stage thrash with happy≈0.24 verify≈0.15 (landing)
- **Evidence sessions:** `2026-09-10T23-32-30-01a08ebd-1231-74d0-9524-57ccd7966c89`
- **Why:** Review without proof still fatal if thrash dominates.
- **Maps to:** T7/T24
- **Socratink-relevance:** med

### CR-S10 · fatal
- **Pattern:** Retry/error sample ≥100 with governance gap and low happy
- **Evidence sessions:** `2026-09-04T18-56-51-01a06eda-8d20-77c3-a8e8-d680ade4b200`
- **Why:** Identical-retry campaign; recovery failure (T10).
- **Maps to:** T10
- **Socratink-relevance:** high

### CR-S11 · fatal
- **Pattern:** Happy never recovers (<0.38) even if verify mid — treat as fatal thrash
- **Evidence sessions:** `2026-08-07T19-17-07-019fdebb-0850-7140-9900-0414963a85f8`, `2026-08-25T12-22-03-01a03a28-6ee3-7622-a577-2484959b1e1a`
- **Why:** Operational: happy is the recovery gate, not verify alone.
- **Maps to:** T10
- **Socratink-relevance:** med

### CR-S12 · fatal
- **Pattern:** Sandbox skill-scout orientation ask without Outcome fence
- **Evidence sessions:** `2026-08-09T01-17-16-019fe52b-1e6a-7e22-9e16-09e1ae1358af`
- **Why:** Scout-only ask + thrash_p=0.70 poster for fatal.
- **Maps to:** T2/scout_only
- **Socratink-relevance:** high

---

## Caveats

- Excerpts are redacted first-window (~pack text_excerpt); late recovery may be under-represented for huge rollouts (e.g. 117MB).
- Size-biased Codex strata (top 80 by bytes) → long-horizon bias.
- Scores averaged across capture vs ~/.codex path dupes when present.
- Timeline sketches are evidence-grounded from scores+excerpt signals+deep-card crossrefs — not freeform fiction; session IDs only from pack.
- Brain untouched; factory not marked done; no PR; no SendToUser; Mac sync skipped.

## Blockers

- Fatal strict pool only 10 unique sessions under operational cut; expanded with 2 near_expand (happy-never-recovered) to reach 12.
