# Codex deep qualitative — evidence cards

- **As-of:** 2026-09-15 ~21:00 CT
- **Job:** FM-AGENTENG-01 Researchy burn-tranche — Codex deep qualitative
- **Cards:** 40 (20 plate-gap + 20 thrash/gov/bloat); 29 unique sessions; 11 dual-listed
- **Means (plate-gap selection):** plate=0.69 · thrash_p=0.22 · happy=0.39
- **Means (thrash leaders):** plate=0.96 · thrash_p=0.22 · happy=0.38
- **Max Jev:** n_ok=29 unique selected; holes filled=18 (refined_gap); strata 80 not rescored

## Method (short)

- Prefer existing `codex-strata-pack-v2.json` + `codex-strata-scores.json` (n=80 rows / 48 unique).
- Rank top 20 worst `plate_quality` and top 20 thrash/governance/context_bloat leaders.
- Max Jev card dimensions only where semantic holes remained (tag/relevance/refined_gap).
- Research-only; no PR; no SendToUser; no factory.db done.

## Tag / relevance distributions

```
tags: {"smell:context_bloat":10,"smell:over_trust":2,"nugget:scout_only":7,"smell:governance":3,"nugget:narrow_proof":11,"smell:missing_verify":2,"smell:thrash":5}
relevance: {"high":21,"med":19}
```

---

## A. Plate-gap top 20 (worst plate_quality)

### PG-01 · `2026-08-14T10-28-18-01a000e3-6a1c-7f23-913f-c207b0babf8a` · dual-listed

- **Slug/cwd:** socratink · `/Users/jondev/dev/active/socratink/doctrine/socratink`
- **Scores:** plate=0.09 · thrash_p=0.09 · happy=0.2 · load=2.32 · verify=0.2 · stage=plan · band=careful_good
- **Primary gap:** context_bloat (prior=context_bloat, conf=0.58)
- **Transferable tag:** `smell:context_bloat` · **Socratink-relevance:** **high**
- **Why:**
  - Plate 0.09/3 on a 14.5MB plan rollout in doctrine tree; happy_path_fit=0.20, verify_ok=0.20.
  - Excerpt opens on harness boilerplate (multi_agent_role, app_context, agents_md, spawn); observable user Outcome/Proof/stop is thin or buried — classic plate-gap ∩ context stuffing.
  - User-ish ask visible: “research decisions, learning strategy, AI enginee --- [{” — plate quality judged against whether that ask was fenced with proof/stop.
  - Context bloat dominant: long AGENTS/desktop/multi-agent preamble consumes the scored excerpt window (caveat: first ~400 lines).
  - Socratink-labeled (doctrine tree); lesson feeds plate/thrash/governance loops directly.
- **Evidence flags:** multi_agent_role, app_context, agents_md, spawn, doctrine · toolish≈118 · userish: “research decisions, learning strategy, AI enginee --- [{…”

### PG-02 · `2026-08-29T22-27-23-01a050ec-1013-7b51-a6b1-8055e87b6d36` · dual-listed

- **Slug/cwd:** socratink · `/Users/jondev/dev/active/socratink/product/socratink`
- **Scores:** plate=0.14 · thrash_p=0.28 · happy=0.16 · load=1.94 · verify=0.14 · stage=research · band=careful_good
- **Primary gap:** over_trust (prior=over_trust, conf=0.07)
- **Transferable tag:** `smell:over_trust` · **Socratink-relevance:** **med**
- **Why:**
  - Plate 0.14/3 on a 4.9MB research rollout in product repo; happy_path_fit=0.15, verify_ok=0.14.
  - Excerpt opens on harness boilerplate (multi_agent_role, agents_md, oh_my_codex, spawn); observable user Outcome/Proof/stop is thin or buried — classic plate-gap ∩ context stuffing.
  - User-ish ask visible: “research project already runs on this machine, with required code, data, simulator, runtime/container, and credentials present. If those are…” — plate quality judged against whether that ask was fenced with proof/stop.
  - Over-trust / trust-without-plate: oh-my-codex / multi-agent routing invited unsupervised sprawl before a one-sentence Outcome.
  - Socratink-labeled (product repo); lesson feeds plate/thrash/governance loops directly.
- **Evidence flags:** multi_agent_role, agents_md, oh_my_codex, spawn · toolish≈165 · userish: “research project already runs on this machine, with required code, data, simulator, runtime/containe…”

### PG-03 · `2026-08-14T20-00-43-01a002ef-778b-7e73-b1e0-7c1c1255bce3`

- **Slug/cwd:** unknown · `/Users/jondev/dev/active/skill-eval-loop`
- **Scores:** plate=0.19 · thrash_p=0.11 · happy=0.33 · load=2.73 · verify=0.16 · stage=research · band=careful_good
- **Primary gap:** weak_plate (prior=none, conf=0.32)
- **Transferable tag:** `nugget:scout_only` · **Socratink-relevance:** **med**
- **Why:**
  - Plate 0.19/3 on a 7.1MB research rollout in skill-eval sandbox; happy_path_fit=0.33, verify_ok=0.16.
  - Excerpt opens on harness boilerplate (multi_agent_role, app_context, agents_md, spawn); observable user Outcome/Proof/stop is thin or buried — classic plate-gap ∩ context stuffing.
  - Verification weak (verify_ok=0.16); work may advance without named proof commands or stop-on-green.
  - Slug=unknown (skill-eval sandbox); transferable as harness smell even when not product-core.
- **Evidence flags:** multi_agent_role, app_context, agents_md, spawn · toolish≈110

### PG-04 · `2026-08-24T13-53-41-01a03555-f8a1-7c71-8a2f-e0551692133b` · dual-listed

- **Slug/cwd:** socratink · `/Users/jondev/dev/active/socratink/product/socratink`
- **Scores:** plate=0.49 · thrash_p=0.19 · happy=0.4 · load=2.15 · verify=0.28 · stage=research · band=careful_good
- **Primary gap:** governance (prior=governance, conf=0.59)
- **Transferable tag:** `nugget:scout_only` · **Socratink-relevance:** **high**
- **Why:**
  - Plate 0.48/3 on a 13.8MB research rollout in product repo; happy_path_fit=0.40, verify_ok=0.28.
  - Excerpt opens on harness boilerplate (multi_agent_role, app_context, agents_md, spawn); observable user Outcome/Proof/stop is thin or buried — classic plate-gap ∩ context stuffing.
  - User-ish ask visible: “research and planning through Gate A only; product-code implementation remains gated. I’m starting Phase 0 solo: loading the three required …” — plate quality judged against whether that ask was fenced with proof/stop.
  - Governance gap: HITL/secrets/observability or fail-closed boundaries unclear; band=careful_good and would_retry=0.46.
  - Socratink-labeled (product repo); lesson feeds plate/thrash/governance loops directly.
- **Evidence flags:** multi_agent_role, app_context, agents_md, spawn, doctrine · toolish≈169 · userish: “research and planning through Gate A only; product-code implementation remains gated. I’m starting P…”

### PG-05 · `2026-08-14T00-43-36-019ffecc-1797-7190-9fc7-bb07c647e7d3` · dual-listed

- **Slug/cwd:** unknown · `/Users/jondev/dev/sandbox/skill-eval`
- **Scores:** plate=0.5 · thrash_p=0.08 · happy=0.28 · load=2.4 · verify=0.23 · stage=research · band=careful_good
- **Primary gap:** context_bloat (prior=context_bloat, conf=0.32)
- **Transferable tag:** `smell:context_bloat` · **Socratink-relevance:** **med**
- **Why:**
  - Plate 0.50/3 on a 6.0MB research rollout in skill-eval sandbox; happy_path_fit=0.28, verify_ok=0.23.
  - Excerpt opens on harness boilerplate (multi_agent_role, agents_md, memory_folder, spawn); observable user Outcome/Proof/stop is thin or buried — classic plate-gap ∩ context stuffing.
  - User-ish ask visible: “help you stay consistent. Use it whenever it is likely to help. Decision boundary: should you use memory for a new user query? - Skip memory…” — plate quality judged against whether that ask was fenced with proof/stop.
  - Context bloat dominant: long AGENTS/desktop/multi-agent preamble consumes the scored excerpt window (caveat: first ~400 lines).
  - Slug=unknown (skill-eval sandbox); transferable as harness smell even when not product-core.
- **Evidence flags:** multi_agent_role, agents_md, memory_folder, outcome_plate, spawn, skill_eval · toolish≈169 · userish: “help you stay consistent. Use it whenever it is likely to help. Decision boundary: should you use me…”

### PG-06 · `2026-09-04T18-56-51-01a06eda-8d20-77c3-a8e8-d680ade4b200` · dual-listed

- **Slug/cwd:** socratink · `/Users/jondev/dev/active/socratink/product/socratink`
- **Scores:** plate=0.52 · thrash_p=0.2 · happy=0.22 · load=2.15 · verify=0.2 · stage=research · band=careful_good
- **Primary gap:** governance (prior=governance, conf=0.21)
- **Transferable tag:** `smell:governance` · **Socratink-relevance:** **med**
- **Why:**
  - Plate 0.52/3 on a 5.1MB research rollout in product repo; happy_path_fit=0.22, verify_ok=0.20.
  - Session continues across a model_switch without a rewritten plate; continuity prompt substitutes for Outcome/cwd/proof/stop.
  - User-ish ask visible: “Please continue the conversation according to the following instructions: You are Codex, an agent based on GPT-5. You and the user share one…” — plate quality judged against whether that ask was fenced with proof/stop.
  - Governance gap: HITL/secrets/observability or fail-closed boundaries unclear; band=careful_good and would_retry=0.47.
  - Socratink-labeled (product repo); lesson feeds plate/thrash/governance loops directly.
- **Evidence flags:** agents_md, model_switch, spawn · toolish≈152 · userish: “Please continue the conversation according to the following instructions: You are Codex, an agent ba…”

### PG-07 · `2026-08-16T12-38-15-01a00ba7-1803-7d11-9a66-3e98fb174764`

- **Slug/cwd:** unknown · `/Users/jondev/dev/active/skill-eval-loop`
- **Scores:** plate=0.62 · thrash_p=0.17 · happy=0.36 · load=2.37 · verify=0.37 · stage=research · band=careful_good
- **Primary gap:** missing_verify (prior=none, refined=missing_verify)
- **Transferable tag:** `nugget:scout_only` · **Socratink-relevance:** **med**
- **Why:**
  - Plate 0.62/3 on a 9.5MB research rollout in skill-eval sandbox; happy_path_fit=0.36, verify_ok=0.37.
  - Excerpt opens on harness boilerplate (multi_agent_role, app_context, agents_md, spawn); observable user Outcome/Proof/stop is thin or buried — classic plate-gap ∩ context stuffing.
  - Verification weak (verify_ok=0.37); work may advance without named proof commands or stop-on-green.
  - Slug=unknown (skill-eval sandbox); transferable as harness smell even when not product-core.
- **Evidence flags:** multi_agent_role, app_context, agents_md, spawn, skill_eval · toolish≈124

### PG-08 · `2026-08-30T15-13-16-01a05356-7d5f-7871-8623-970e02a2c54c` · dual-listed

- **Slug/cwd:** socratink · `/Users/jondev/dev/active/socratink/product/socratink`
- **Scores:** plate=0.7 · thrash_p=0.24 · happy=0.47 · load=2.55 · verify=0.34 · stage=verify · band=careful_good
- **Primary gap:** context_bloat (prior=context_bloat, conf=0.25)
- **Transferable tag:** `smell:context_bloat` · **Socratink-relevance:** **high**
- **Why:**
  - Plate 0.70/3 on a 15.1MB verify rollout in product repo; happy_path_fit=0.47, verify_ok=0.34.
  - Excerpt opens on harness boilerplate (agents_md); observable user Outcome/Proof/stop is thin or buried — classic plate-gap ∩ context stuffing.
  - User-ish ask visible: “research gap; prediction stays an existing task form rather than becoming a new family; diagram, ink, and voice remain archived modality/cap…” — plate quality judged against whether that ask was fenced with proof/stop.
  - Context bloat dominant: long AGENTS/desktop/multi-agent preamble consumes the scored excerpt window (caveat: first ~400 lines).
  - Socratink-labeled (product repo); lesson feeds plate/thrash/governance loops directly.
- **Evidence flags:** agents_md, proof · toolish≈149 · userish: “research gap; prediction stays an existing task form rather than becoming a new family; diagram, ink…”

### PG-09 · `2026-08-31T19-37-04-01a05a65-eedb-7ab3-9ca6-e527f1fbda82`

- **Slug/cwd:** socratink · `/Users/jondev/dev/active/socratink/product/socratink`
- **Scores:** plate=0.75 · thrash_p=0.22 · happy=0.67 · load=2.65 · verify=0.3 · stage=verify · band=careful_good
- **Primary gap:** missing_verify (prior=none, refined=missing_verify)
- **Transferable tag:** `nugget:narrow_proof` · **Socratink-relevance:** **high**
- **Why:**
  - Plate 0.75/3 on a 5.7MB verify rollout in product repo; happy_path_fit=0.67, verify_ok=0.30.
  - Excerpt opens on harness boilerplate (multi_agent_role, app_context, agents_md, spawn); observable user Outcome/Proof/stop is thin or buried — classic plate-gap ∩ context stuffing.
  - User-ish ask visible: “Implement the Socratink AI Engineer — v0 You are working in the Socratink pro…": /Users/jondev/.codex/attachments/8f95e1eb-63b9-4809-bde5-a9…” — plate quality judged against whether that ask was fenced with proof/stop.
  - Verification weak (verify_ok=0.30); work may advance without named proof commands or stop-on-green.
  - Socratink-labeled (product repo); lesson feeds plate/thrash/governance loops directly.
- **Evidence flags:** multi_agent_role, app_context, agents_md, outcome_plate, spawn, doctrine · toolish≈166 · userish: “Implement the Socratink AI Engineer — v0 You are working in the Socratink pro…": /Users/jondev/.code…”

### PG-10 · `2026-08-30T16-13-51-01a05485-8327-76c0-a537-67c77d7d235c` · dual-listed

- **Slug/cwd:** unknown · `/Users/jondev/dev/sandbox/persona_farm`
- **Scores:** plate=0.77 · thrash_p=0.18 · happy=0.43 · load=2.11 · verify=0.17 · stage=review · band=careful_good
- **Primary gap:** governance (prior=governance, conf=0.25)
- **Transferable tag:** `nugget:narrow_proof` · **Socratink-relevance:** **med**
- **Why:**
  - Plate 0.77/3 on a 4.2MB review rollout in non-product / adjacent cwd; happy_path_fit=0.43, verify_ok=0.17.
  - Excerpt opens on harness boilerplate (multi_agent_role, app_context, agents_md, spawn); observable user Outcome/Proof/stop is thin or buried — classic plate-gap ∩ context stuffing.
  - Governance gap: HITL/secrets/observability or fail-closed boundaries unclear; band=careful_good and would_retry=0.52.
  - Slug=unknown (non-product / adjacent cwd); transferable as harness smell even when not product-core.
- **Evidence flags:** multi_agent_role, app_context, agents_md, spawn · toolish≈122

### PG-11 · `2026-08-15T00-33-52-01a003e9-8abc-7602-acc3-96966c220eac` · dual-listed

- **Slug/cwd:** unknown · `/Users/jondev`
- **Scores:** plate=0.77 · thrash_p=0.21 · happy=0.28 · load=2.54 · verify=0.11 · stage=research · band=careful_good
- **Primary gap:** context_bloat (prior=context_bloat, conf=0.22)
- **Transferable tag:** `smell:context_bloat` · **Socratink-relevance:** **med**
- **Why:**
  - Plate 0.77/3 on a 4.0MB research rollout in home-root cwd (wide blast radius); happy_path_fit=0.28, verify_ok=0.11.
  - Excerpt opens on harness boilerplate (multi_agent_role, agents_md, oh_my_codex, spawn); observable user Outcome/Proof/stop is thin or buried — classic plate-gap ∩ context stuffing.
  - User-ish ask visible: “can you help me fix omx? heres the repo: https://github.com/Yeachan-Heo/oh-my-codex” — plate quality judged against whether that ask was fenced with proof/stop.
  - Verification weak (verify_ok=0.11); work may advance without named proof commands or stop-on-green.
  - Slug=unknown (home-root cwd (wide blast radius)); transferable as harness smell even when not product-core.
- **Evidence flags:** multi_agent_role, agents_md, oh_my_codex, proof, spawn · toolish≈132 · userish: “can you help me fix omx? heres the repo: https://github.com/Yeachan-Heo/oh-my-codex…”

### PG-12 · `2026-09-10T23-32-30-01a08ebd-1231-74d0-9524-57ccd7966c89`

- **Slug/cwd:** socratink · `/Users/jondev/dev/active/socratink-landing`
- **Scores:** plate=0.79 · thrash_p=0.4 · happy=0.25 · load=2.74 · verify=0.16 · stage=review · band=careful_good
- **Primary gap:** missing_verify (prior=none, refined=missing_verify)
- **Transferable tag:** `smell:missing_verify` · **Socratink-relevance:** **med**
- **Why:**
  - Plate 0.79/3 on a 4.0MB review rollout in landing/site; happy_path_fit=0.24, verify_ok=0.15.
  - Verification weak (verify_ok=0.15); work may advance without named proof commands or stop-on-green.
  - Socratink-labeled (landing/site); lesson feeds plate/thrash/governance loops directly.
- **Evidence flags:** app_context · toolish≈157

### PG-13 · `2026-09-11T23-11-43-01a093d0-641b-7c50-a387-fb61bb9f4d86`

- **Slug/cwd:** socratink · `/Users/jondev/dev/active/socratink-landing`
- **Scores:** plate=0.86 · thrash_p=0.12 · happy=0.67 · load=2.6 · verify=0.15 · stage=impl · band=careful_good
- **Primary gap:** missing_verify (prior=none, refined=missing_verify)
- **Transferable tag:** `nugget:narrow_proof` · **Socratink-relevance:** **high**
- **Why:**
  - Plate 0.85/3 on a 4.2MB impl rollout in landing/site; happy_path_fit=0.67, verify_ok=0.15.
  - User-ish ask visible: “Implement one animation concept in the existing --- [{” — plate quality judged against whether that ask was fenced with proof/stop.
  - Verification weak (verify_ok=0.15); work may advance without named proof commands or stop-on-green.
  - Socratink-labeled (landing/site); lesson feeds plate/thrash/governance loops directly.
- **Evidence flags:** app_context, proof · toolish≈138 · userish: “Implement one animation concept in the existing --- [{…”

### PG-14 · `2026-09-09T11-15-41-01a086f4-2002-7880-8702-faa6d5ce3e95`

- **Slug/cwd:** socratink · `/Users/jondev/dev/active/socratink-landing`
- **Scores:** plate=0.91 · thrash_p=0.2 · happy=0.62 · load=2.08 · verify=0.35 · stage=research · band=careful_good
- **Primary gap:** missing_verify (prior=none, refined=missing_verify)
- **Transferable tag:** `nugget:narrow_proof` · **Socratink-relevance:** **med**
- **Why:**
  - Plate 0.91/3 on a 32.7MB research rollout in landing/site; happy_path_fit=0.61, verify_ok=0.34.
  - Excerpt opens on harness boilerplate (multi_agent_role, app_context, agents_md, spawn); observable user Outcome/Proof/stop is thin or buried — classic plate-gap ∩ context stuffing.
  - User-ish ask visible: “i need to research spike how to make the organic sphere produce --- [{” — plate quality judged against whether that ask was fenced with proof/stop.
  - Verification weak (verify_ok=0.34); work may advance without named proof commands or stop-on-green.
  - Socratink-labeled (landing/site); lesson feeds plate/thrash/governance loops directly.
  - Size caveat: 33MB rollout — early-excerpt scoring may under-represent late thrash/ship evidence.
- **Evidence flags:** multi_agent_role, app_context, agents_md, spawn · toolish≈181 · userish: “i need to research spike how to make the organic sphere produce --- [{…”

### PG-15 · `2026-08-07T19-17-07-019fdebb-0850-7140-9900-0414963a85f8`

- **Slug/cwd:** socratink · `/Users/jondev/dev/sandbox/socratink.io`
- **Scores:** plate=0.91 · thrash_p=0.21 · happy=0.28 · load=1.86 · verify=0.3 · stage=research · band=careful_good
- **Primary gap:** missing_verify (prior=none, refined=missing_verify)
- **Transferable tag:** `nugget:scout_only` · **Socratink-relevance:** **high**
- **Why:**
  - Plate 0.91/3 on a 7.2MB research rollout in landing/site; happy_path_fit=0.28, verify_ok=0.30.
  - User-ish ask visible: “implement improvement --- [{” — plate quality judged against whether that ask was fenced with proof/stop.
  - Verification weak (verify_ok=0.30); work may advance without named proof commands or stop-on-green.
  - Socratink-labeled (landing/site); lesson feeds plate/thrash/governance loops directly.
- **Evidence flags:** agents_md, proof, skill_eval · toolish≈119 · userish: “implement improvement --- [{…”

### PG-16 · `2026-08-09T01-17-16-019fe52b-1e6a-7e22-9e16-09e1ae1358af` · dual-listed

- **Slug/cwd:** socratink · `/Users/jondev/dev/sandbox/socratink.io`
- **Scores:** plate=0.93 · thrash_p=0.7 · happy=0.25 · load=2.3 · verify=0.13 · stage=impl · band=careful_good
- **Primary gap:** thrash (prior=thrash, conf=0.7)
- **Transferable tag:** `smell:thrash` · **Socratink-relevance:** **high**
- **Why:**
  - Plate 0.93/3 on a 5.7MB impl rollout in landing/site; happy_path_fit=0.25, verify_ok=0.13.
  - Memory-folder preamble present without a crisp Outcome plate — prior-run memory invited before goal fences.
  - User-ish ask visible: “can you use skill-scout to find a skill that orients you to the code base best?” — plate quality judged against whether that ask was fenced with proof/stop.
  - Toolish sample≈163; thrash signal is material — repeated tool/path cycles without a green gate, or skill-path thrash (wrong skill path / scout loops).
  - Socratink-labeled (landing/site); lesson feeds plate/thrash/governance loops directly.
- **Evidence flags:** agents_md, memory_folder, proof, skill_eval · toolish≈163 · userish: “can you use skill-scout to find a skill that orients you to the code base best?…”

### PG-17 · `2026-09-01T01-30-34-01a05ba9-9170-7e13-9248-9f00cae928e4`

- **Slug/cwd:** socratink · `/Users/jondev/dev/active/socratink/product/socratink`
- **Scores:** plate=0.95 · thrash_p=0.14 · happy=0.67 · load=2.36 · verify=0.46 · stage=impl · band=fast_good
- **Primary gap:** missing_verify (prior=none, refined=missing_verify)
- **Transferable tag:** `nugget:narrow_proof` · **Socratink-relevance:** **high**
- **Why:**
  - Plate 0.95/3 on a 6.7MB impl rollout in product repo; happy_path_fit=0.67, verify_ok=0.46.
  - Excerpt opens on harness boilerplate (multi_agent_role, app_context, agents_md, spawn); observable user Outcome/Proof/stop is thin or buried — classic plate-gap ∩ context stuffing.
  - User-ish ask visible: “Implement Socratink Learning Scientist — “Kenneth” v0 You are working in the Socratink product repository. Socratink already has a provider-…” — plate quality judged against whether that ask was fenced with proof/stop.
  - Verification weak (verify_ok=0.46); work may advance without named proof commands or stop-on-green.
  - Socratink-labeled (product repo); lesson feeds plate/thrash/governance loops directly.
- **Evidence flags:** multi_agent_role, app_context, agents_md, outcome_plate, spawn, doctrine · toolish≈182 · userish: “Implement Socratink Learning Scientist — “Kenneth” v0 You are working in the Socratink product repos…”

### PG-18 · `2026-09-12T21-12-22-01a09889-7ed8-79a1-ac9b-6e69cec50780`

- **Slug/cwd:** socratink · `/Users/jondev/dev/active/socratink-landing`
- **Scores:** plate=0.96 · thrash_p=0.17 · happy=0.49 · load=1.98 · verify=0.48 · stage=impl · band=fast_good
- **Primary gap:** missing_verify (prior=none, refined=missing_verify)
- **Transferable tag:** `nugget:narrow_proof` · **Socratink-relevance:** **med**
- **Why:**
  - Plate 0.96/3 on a 7.3MB impl rollout in landing/site; happy_path_fit=0.48, verify_ok=0.48.
  - Excerpt opens on harness boilerplate (multi_agent_role, app_context, agents_md, spawn); observable user Outcome/Proof/stop is thin or buried — classic plate-gap ∩ context stuffing.
  - User-ish ask visible: “please to a finished state to push to prod. ” — plate quality judged against whether that ask was fenced with proof/stop.
  - Verification weak (verify_ok=0.48); work may advance without named proof commands or stop-on-green.
  - Socratink-labeled (landing/site); lesson feeds plate/thrash/governance loops directly.
- **Evidence flags:** multi_agent_role, app_context, agents_md, spawn · toolish≈126 · userish: “please to a finished state to push to prod. …”

### PG-19 · `2026-09-05T09-58-40-01a07214-2d30-7301-84e3-c251ad08f785` · dual-listed

- **Slug/cwd:** socratink · `/Users/jondev/dev/active/socratink-landing`
- **Scores:** plate=0.99 · thrash_p=0.26 · happy=0.34 · load=1.78 · verify=0.11 · stage=plan · band=careful_good
- **Primary gap:** thrash (prior=thrash, conf=0.78)
- **Transferable tag:** `smell:thrash` · **Socratink-relevance:** **high**
- **Why:**
  - Plate 0.99/3 on a 117.1MB plan rollout in landing/site; happy_path_fit=0.34, verify_ok=0.11.
  - Excerpt opens on harness boilerplate (multi_agent_role, app_context, agents_md, spawn); observable user Outcome/Proof/stop is thin or buried — classic plate-gap ∩ context stuffing.
  - User-ish ask visible: “Please provide the correct skill path or add the skill and its referenced --- [{” — plate quality judged against whether that ask was fenced with proof/stop.
  - Toolish sample≈162; thrash signal is material — repeated tool/path cycles without a green gate, or skill-path thrash (wrong skill path / scout loops).
  - Socratink-labeled (landing/site); lesson feeds plate/thrash/governance loops directly.
  - Size caveat: 117MB rollout — early-excerpt scoring may under-represent late thrash/ship evidence.
- **Evidence flags:** multi_agent_role, app_context, agents_md, spawn · toolish≈162 · userish: “Please provide the correct skill path or add the skill and its referenced --- [{…”

### PG-20 · `2026-09-01T14-34-46-01a05e77-86c5-7a31-951b-be73febe91be` · dual-listed

- **Slug/cwd:** socratink · `/Users/jondev/dev/active/socratink/product/socratink`
- **Scores:** plate=1.01 · thrash_p=0.26 · happy=0.46 · load=2.22 · verify=0.29 · stage=mixed · band=careful_good
- **Primary gap:** governance (prior=governance, conf=0.52)
- **Transferable tag:** `nugget:narrow_proof` · **Socratink-relevance:** **high**
- **Why:**
  - Plate 1.01/3 on a 3.8MB mixed rollout in product repo; happy_path_fit=0.46, verify_ok=0.29.
  - User-ish ask visible: “Please what is remaining for it to be stable and reliable? ” — plate quality judged against whether that ask was fenced with proof/stop.
  - Governance gap: HITL/secrets/observability or fail-closed boundaries unclear; band=careful_good and would_retry=0.50.
  - Socratink-labeled (product repo); lesson feeds plate/thrash/governance loops directly.
- **Evidence flags:** app_context, spawn · toolish≈62 · userish: “Please what is remaining for it to be stable and reliable? …”

---

## B. Thrash / governance / context_bloat leaders top 20

### TL-01 · `2026-08-09T01-17-16-019fe52b-1e6a-7e22-9e16-09e1ae1358af` · dual-listed

- **Slug/cwd:** socratink · `/Users/jondev/dev/sandbox/socratink.io`
- **Scores:** plate=0.93 · thrash_p=0.7 · happy=0.25 · load=2.3 · verify=0.13 · stage=impl · band=careful_good
- **Primary gap:** thrash (prior=thrash, conf=0.7)
- **Transferable tag:** `smell:thrash` · **Socratink-relevance:** **high**
- **Why:**
  - Thrash/gov leader: primary_gap=thrash (conf 0.70), thrash_p=0.70, plate=0.93, partnership_load=2.30 on 5.7MB impl session.
  - Memory-folder preamble present without a crisp Outcome plate — prior-run memory invited before goal fences.
  - User-ish ask visible: “can you use skill-scout to find a skill that orients you to the code base best?” — plate quality judged against whether that ask was fenced with proof/stop.
  - Toolish sample≈163; thrash signal is material — repeated tool/path cycles without a green gate, or skill-path thrash (wrong skill path / scout loops).
  - Socratink-labeled (landing/site); lesson feeds plate/thrash/governance loops directly.
- **Evidence flags:** agents_md, memory_folder, proof, skill_eval · toolish≈163 · userish: “can you use skill-scout to find a skill that orients you to the code base best?…”

### TL-02 · `2026-09-05T09-58-40-01a07214-2d30-7301-84e3-c251ad08f785` · dual-listed

- **Slug/cwd:** socratink · `/Users/jondev/dev/active/socratink-landing`
- **Scores:** plate=0.99 · thrash_p=0.26 · happy=0.34 · load=1.78 · verify=0.11 · stage=plan · band=careful_good
- **Primary gap:** thrash (prior=thrash, conf=0.78)
- **Transferable tag:** `smell:thrash` · **Socratink-relevance:** **high**
- **Why:**
  - Thrash/gov leader: primary_gap=thrash (conf 0.78), thrash_p=0.26, plate=0.99, partnership_load=1.77 on 117.1MB plan session.
  - Excerpt opens on harness boilerplate (multi_agent_role, app_context, agents_md, spawn); observable user Outcome/Proof/stop is thin or buried — classic plate-gap ∩ context stuffing.
  - User-ish ask visible: “Please provide the correct skill path or add the skill and its referenced --- [{” — plate quality judged against whether that ask was fenced with proof/stop.
  - Toolish sample≈162; thrash signal is material — repeated tool/path cycles without a green gate, or skill-path thrash (wrong skill path / scout loops).
  - Socratink-labeled (landing/site); lesson feeds plate/thrash/governance loops directly.
  - Size caveat: 117MB rollout — early-excerpt scoring may under-represent late thrash/ship evidence.
- **Evidence flags:** multi_agent_role, app_context, agents_md, spawn · toolish≈162 · userish: “Please provide the correct skill path or add the skill and its referenced --- [{…”

### TL-03 · `2026-08-12T13-23-52-019ff737-6d9e-7ba3-b71f-31d293083bbc`

- **Slug/cwd:** unknown · `/Users/jondev/dev/sandbox/skill-refactor`
- **Scores:** plate=1.07 · thrash_p=0.19 · happy=0.33 · load=2.46 · verify=0.11 · stage=research · band=careful_good
- **Primary gap:** thrash (prior=thrash, conf=0.27)
- **Transferable tag:** `smell:thrash` · **Socratink-relevance:** **med**
- **Why:**
  - Thrash/gov leader: primary_gap=thrash (conf 0.27), thrash_p=0.19, plate=1.07, partnership_load=2.46 on 5.9MB research session.
  - User-ish ask visible: “can you help me fix the path of yt-wiki vault Its in my Documents folder now. i get an error when running yt-ingest” — plate quality judged against whether that ask was fenced with proof/stop.
  - Toolish sample≈135; thrash signal is material — repeated tool/path cycles without a green gate, or skill-path thrash (wrong skill path / scout loops).
  - Slug=unknown (skill-eval sandbox); transferable as harness smell even when not product-core.
- **Evidence flags:** agents_md, memory_folder, outcome_plate · toolish≈135 · userish: “can you help me fix the path of yt-wiki vault Its in my Documents folder now. i get an error when ru…”

### TL-04 · `2026-08-01T11-24-13-019fbe23-ee7c-7451-ac56-885f75b08c91`

- **Slug/cwd:** unknown · `/Users/jondev`
- **Scores:** plate=1.68 · thrash_p=0.48 · happy=0.37 · load=2.35 · verify=0.12 · stage=impl · band=careful_good
- **Primary gap:** governance (prior=governance, conf=0.45)
- **Transferable tag:** `smell:governance` · **Socratink-relevance:** **med**
- **Why:**
  - Thrash/gov leader: primary_gap=governance (conf 0.45), thrash_p=0.48, plate=1.68, partnership_load=2.35 on 7.7MB impl session.
  - Wide workspace / sandbox permissions framing; governance & scope risk elevated when cwd is not product-fenced.
  - User-ish ask visible: “can you use youtube transcript extractor on this video: https://youtu.be/g-CD1d0q01I?si=7i57SZdLz9gJslh7 and save it somewhere in the socrat…” — plate quality judged against whether that ask was fenced with proof/stop.
  - Toolish sample≈165; thrash signal is material — repeated tool/path cycles without a green gate, or skill-path thrash (wrong skill path / scout loops).
  - Slug=unknown (home-root cwd (wide blast radius)); transferable as harness smell even when not product-core.
- **Evidence flags:** outcome_plate, proof, permissions · toolish≈165 · userish: “can you use youtube transcript extractor on this video: https://youtu.be/g-CD1d0q01I?si=7i57SZdLz9gJ…”

### TL-05 · `2026-09-01T14-34-46-01a05e77-86c5-7a31-951b-be73febe91be` · dual-listed

- **Slug/cwd:** socratink · `/Users/jondev/dev/active/socratink/product/socratink`
- **Scores:** plate=1.01 · thrash_p=0.26 · happy=0.46 · load=2.22 · verify=0.29 · stage=mixed · band=careful_good
- **Primary gap:** governance (prior=governance, conf=0.52)
- **Transferable tag:** `nugget:narrow_proof` · **Socratink-relevance:** **high**
- **Why:**
  - Thrash/gov leader: primary_gap=governance (conf 0.52), thrash_p=0.26, plate=1.01, partnership_load=2.22 on 3.8MB mixed session.
  - User-ish ask visible: “Please what is remaining for it to be stable and reliable? ” — plate quality judged against whether that ask was fenced with proof/stop.
  - Governance gap: HITL/secrets/observability or fail-closed boundaries unclear; band=careful_good and would_retry=0.50.
  - Socratink-labeled (product repo); lesson feeds plate/thrash/governance loops directly.
- **Evidence flags:** app_context, spawn · toolish≈62 · userish: “Please what is remaining for it to be stable and reliable? …”

### TL-06 · `2026-08-24T13-53-41-01a03555-f8a1-7c71-8a2f-e0551692133b` · dual-listed

- **Slug/cwd:** socratink · `/Users/jondev/dev/active/socratink/product/socratink`
- **Scores:** plate=0.49 · thrash_p=0.19 · happy=0.4 · load=2.15 · verify=0.28 · stage=research · band=careful_good
- **Primary gap:** governance (prior=governance, conf=0.59)
- **Transferable tag:** `nugget:scout_only` · **Socratink-relevance:** **high**
- **Why:**
  - Thrash/gov leader: primary_gap=governance (conf 0.59), thrash_p=0.18, plate=0.48, partnership_load=2.15 on 13.8MB research session.
  - Excerpt opens on harness boilerplate (multi_agent_role, app_context, agents_md, spawn); observable user Outcome/Proof/stop is thin or buried — classic plate-gap ∩ context stuffing.
  - User-ish ask visible: “research and planning through Gate A only; product-code implementation remains gated. I’m starting Phase 0 solo: loading the three required …” — plate quality judged against whether that ask was fenced with proof/stop.
  - Governance gap: HITL/secrets/observability or fail-closed boundaries unclear; band=careful_good and would_retry=0.46.
  - Socratink-labeled (product repo); lesson feeds plate/thrash/governance loops directly.
- **Evidence flags:** multi_agent_role, app_context, agents_md, spawn, doctrine · toolish≈169 · userish: “research and planning through Gate A only; product-code implementation remains gated. I’m starting P…”

### TL-07 · `2026-09-04T18-56-51-01a06eda-8d20-77c3-a8e8-d680ade4b200` · dual-listed

- **Slug/cwd:** socratink · `/Users/jondev/dev/active/socratink/product/socratink`
- **Scores:** plate=0.52 · thrash_p=0.2 · happy=0.22 · load=2.15 · verify=0.2 · stage=research · band=careful_good
- **Primary gap:** governance (prior=governance, conf=0.21)
- **Transferable tag:** `smell:governance` · **Socratink-relevance:** **med**
- **Why:**
  - Thrash/gov leader: primary_gap=governance (conf 0.21), thrash_p=0.20, plate=0.52, partnership_load=2.15 on 5.1MB research session.
  - Session continues across a model_switch without a rewritten plate; continuity prompt substitutes for Outcome/cwd/proof/stop.
  - User-ish ask visible: “Please continue the conversation according to the following instructions: You are Codex, an agent based on GPT-5. You and the user share one…” — plate quality judged against whether that ask was fenced with proof/stop.
  - Governance gap: HITL/secrets/observability or fail-closed boundaries unclear; band=careful_good and would_retry=0.47.
  - Socratink-labeled (product repo); lesson feeds plate/thrash/governance loops directly.
- **Evidence flags:** agents_md, model_switch, spawn · toolish≈152 · userish: “Please continue the conversation according to the following instructions: You are Codex, an agent ba…”

### TL-08 · `2026-09-01T23-16-07-01a06054-d36d-7e71-a321-6105bae161e4`

- **Slug/cwd:** socratink · `/Users/jondev/dev/active/socratink/product/socratink`
- **Scores:** plate=1.3 · thrash_p=0.22 · happy=0.68 · load=2.19 · verify=0.21 · stage=verify · band=careful_good
- **Primary gap:** governance (prior=governance, conf=0.57)
- **Transferable tag:** `nugget:narrow_proof` · **Socratink-relevance:** **high**
- **Why:**
  - Thrash/gov leader: primary_gap=governance (conf 0.57), thrash_p=0.22, plate=1.30, partnership_load=2.19 on 13.0MB verify session.
  - Excerpt opens on harness boilerplate (multi_agent_role, app_context, agents_md, spawn); observable user Outcome/Proof/stop is thin or buried — classic plate-gap ∩ context stuffing.
  - User-ish ask visible: “Please open the preserved Chrome tab titled **“Socratink dictation probe,”** allow microphone access, speak a short phrase, click --- [{” — plate quality judged against whether that ask was fenced with proof/stop.
  - Governance gap: HITL/secrets/observability or fail-closed boundaries unclear; band=careful_good and would_retry=0.66.
  - Socratink-labeled (product repo); lesson feeds plate/thrash/governance loops directly.
- **Evidence flags:** multi_agent_role, app_context, agents_md, outcome_plate, proof, spawn · toolish≈173 · userish: “Please open the preserved Chrome tab titled **“Socratink dictation probe,”** allow microphone access…”

### TL-09 · `2026-08-24T10-06-14-01a03485-b99e-7913-abca-acb85ce4cb70`

- **Slug/cwd:** socratink · `/Users/jondev/dev/active/socratink/product/socratink`
- **Scores:** plate=1.22 · thrash_p=0.14 · happy=0.6 · load=1.72 · verify=0.27 · stage=research · band=careful_good
- **Primary gap:** governance (prior=governance, conf=0.55)
- **Transferable tag:** `nugget:scout_only` · **Socratink-relevance:** **high**
- **Why:**
  - Thrash/gov leader: primary_gap=governance (conf 0.55), thrash_p=0.14, plate=1.22, partnership_load=1.72 on 7.3MB research session.
  - Excerpt opens on harness boilerplate (multi_agent_role, app_context, agents_md, spawn); observable user Outcome/Proof/stop is thin or buried — classic plate-gap ∩ context stuffing.
  - Governance gap: HITL/secrets/observability or fail-closed boundaries unclear; band=careful_good and would_retry=0.55.
  - Socratink-labeled (product repo); lesson feeds plate/thrash/governance loops directly.
- **Evidence flags:** multi_agent_role, app_context, agents_md, proof, spawn, doctrine · toolish≈161

### TL-10 · `2026-08-30T16-13-51-01a05485-8327-76c0-a537-67c77d7d235c` · dual-listed

- **Slug/cwd:** unknown · `/Users/jondev/dev/sandbox/persona_farm`
- **Scores:** plate=0.77 · thrash_p=0.18 · happy=0.43 · load=2.11 · verify=0.17 · stage=review · band=careful_good
- **Primary gap:** governance (prior=governance, conf=0.25)
- **Transferable tag:** `nugget:narrow_proof` · **Socratink-relevance:** **med**
- **Why:**
  - Thrash/gov leader: primary_gap=governance (conf 0.25), thrash_p=0.17, plate=0.77, partnership_load=2.10 on 4.2MB review session.
  - Excerpt opens on harness boilerplate (multi_agent_role, app_context, agents_md, spawn); observable user Outcome/Proof/stop is thin or buried — classic plate-gap ∩ context stuffing.
  - Governance gap: HITL/secrets/observability or fail-closed boundaries unclear; band=careful_good and would_retry=0.52.
  - Slug=unknown (non-product / adjacent cwd); transferable as harness smell even when not product-core.
- **Evidence flags:** multi_agent_role, app_context, agents_md, spawn · toolish≈122

### TL-11 · `2026-08-24T10-39-57-01a034a4-997c-73a2-993f-638fd2bc600e`

- **Slug/cwd:** socratink · `/Users/jondev/dev/active/socratink/product/socratink`
- **Scores:** plate=1.42 · thrash_p=0.14 · happy=0.57 · load=2.37 · verify=0.2 · stage=research · band=careful_good
- **Primary gap:** governance (prior=governance, conf=0.57)
- **Transferable tag:** `nugget:narrow_proof` · **Socratink-relevance:** **high**
- **Why:**
  - Thrash/gov leader: primary_gap=governance (conf 0.57), thrash_p=0.14, plate=1.42, partnership_load=2.37 on 4.0MB research session.
  - Governance gap: HITL/secrets/observability or fail-closed boundaries unclear; band=careful_good and would_retry=0.56.
  - Socratink-labeled (product repo); lesson feeds plate/thrash/governance loops directly.
- **Evidence flags:** none · toolish≈161

### TL-12 · `2026-08-30T09-42-52-01a05356-7d5f-7871-8623-970e02a2c54c`

- **Slug/cwd:** socratink · `/Users/jondev/dev/active/socratink/product/socratink`
- **Scores:** plate=1.94 · thrash_p=0.14 · happy=0.38 · load=2.51 · verify=0.29 · stage=plan · band=careful_good
- **Primary gap:** governance (prior=governance, conf=0.41)
- **Transferable tag:** `nugget:scout_only` · **Socratink-relevance:** **high**
- **Why:**
  - Thrash/gov leader: primary_gap=governance (conf 0.41), thrash_p=0.14, plate=1.94, partnership_load=2.51 on 9.4MB plan session.
  - Excerpt opens on harness boilerplate (multi_agent_role, app_context, agents_md, spawn); observable user Outcome/Proof/stop is thin or buried — classic plate-gap ∩ context stuffing.
  - User-ish ask visible: “research Sources, and conceptual Views; execution truth is duplicated across `CURRENT STATE`, Active notes, roadmaps, and engineering catch-…” — plate quality judged against whether that ask was fenced with proof/stop.
  - Governance gap: HITL/secrets/observability or fail-closed boundaries unclear; band=careful_good and would_retry=0.57.
  - Socratink-labeled (product repo); lesson feeds plate/thrash/governance loops directly.
- **Evidence flags:** multi_agent_role, app_context, agents_md, outcome_plate, spawn · toolish≈148 · userish: “research Sources, and conceptual Views; execution truth is duplicated across `CURRENT STATE`, Active…”

### TL-13 · `2026-08-30T15-13-16-01a05356-7d5f-7871-8623-970e02a2c54c` · dual-listed

- **Slug/cwd:** socratink · `/Users/jondev/dev/active/socratink/product/socratink`
- **Scores:** plate=0.7 · thrash_p=0.24 · happy=0.47 · load=2.55 · verify=0.34 · stage=verify · band=careful_good
- **Primary gap:** context_bloat (prior=context_bloat, conf=0.25)
- **Transferable tag:** `smell:context_bloat` · **Socratink-relevance:** **high**
- **Why:**
  - Thrash/gov leader: primary_gap=context_bloat (conf 0.25), thrash_p=0.24, plate=0.70, partnership_load=2.55 on 15.1MB verify session.
  - Excerpt opens on harness boilerplate (agents_md); observable user Outcome/Proof/stop is thin or buried — classic plate-gap ∩ context stuffing.
  - User-ish ask visible: “research gap; prediction stays an existing task form rather than becoming a new family; diagram, ink, and voice remain archived modality/cap…” — plate quality judged against whether that ask was fenced with proof/stop.
  - Context bloat dominant: long AGENTS/desktop/multi-agent preamble consumes the scored excerpt window (caveat: first ~400 lines).
  - Socratink-labeled (product repo); lesson feeds plate/thrash/governance loops directly.
- **Evidence flags:** agents_md, proof · toolish≈149 · userish: “research gap; prediction stays an existing task form rather than becoming a new family; diagram, ink…”

### TL-14 · `2026-08-14T10-28-18-01a000e3-6a1c-7f23-913f-c207b0babf8a` · dual-listed

- **Slug/cwd:** socratink · `/Users/jondev/dev/active/socratink/doctrine/socratink`
- **Scores:** plate=0.09 · thrash_p=0.09 · happy=0.2 · load=2.32 · verify=0.2 · stage=plan · band=careful_good
- **Primary gap:** context_bloat (prior=context_bloat, conf=0.58)
- **Transferable tag:** `smell:context_bloat` · **Socratink-relevance:** **high**
- **Why:**
  - Thrash/gov leader: primary_gap=context_bloat (conf 0.58), thrash_p=0.09, plate=0.09, partnership_load=2.32 on 14.5MB plan session.
  - Excerpt opens on harness boilerplate (multi_agent_role, app_context, agents_md, spawn); observable user Outcome/Proof/stop is thin or buried — classic plate-gap ∩ context stuffing.
  - User-ish ask visible: “research decisions, learning strategy, AI enginee --- [{” — plate quality judged against whether that ask was fenced with proof/stop.
  - Context bloat dominant: long AGENTS/desktop/multi-agent preamble consumes the scored excerpt window (caveat: first ~400 lines).
  - Socratink-labeled (doctrine tree); lesson feeds plate/thrash/governance loops directly.
- **Evidence flags:** multi_agent_role, app_context, agents_md, spawn, doctrine · toolish≈118 · userish: “research decisions, learning strategy, AI enginee --- [{…”

### TL-15 · `2026-08-15T00-33-52-01a003e9-8abc-7602-acc3-96966c220eac` · dual-listed

- **Slug/cwd:** unknown · `/Users/jondev`
- **Scores:** plate=0.77 · thrash_p=0.21 · happy=0.28 · load=2.54 · verify=0.11 · stage=research · band=careful_good
- **Primary gap:** context_bloat (prior=context_bloat, conf=0.22)
- **Transferable tag:** `smell:context_bloat` · **Socratink-relevance:** **med**
- **Why:**
  - Thrash/gov leader: primary_gap=context_bloat (conf 0.22), thrash_p=0.21, plate=0.77, partnership_load=2.54 on 4.0MB research session.
  - Excerpt opens on harness boilerplate (multi_agent_role, agents_md, oh_my_codex, spawn); observable user Outcome/Proof/stop is thin or buried — classic plate-gap ∩ context stuffing.
  - User-ish ask visible: “can you help me fix omx? heres the repo: https://github.com/Yeachan-Heo/oh-my-codex” — plate quality judged against whether that ask was fenced with proof/stop.
  - Verification weak (verify_ok=0.11); work may advance without named proof commands or stop-on-green.
  - Slug=unknown (home-root cwd (wide blast radius)); transferable as harness smell even when not product-core.
- **Evidence flags:** multi_agent_role, agents_md, oh_my_codex, proof, spawn · toolish≈132 · userish: “can you help me fix omx? heres the repo: https://github.com/Yeachan-Heo/oh-my-codex…”

### TL-16 · `2026-09-13T22-57-14-01a09e0f-d99e-7170-a9fe-5bf3d8edbb5b`

- **Slug/cwd:** socratink · `/Users/jondev/dev/active/socratink-landing`
- **Scores:** plate=1.02 · thrash_p=0.16 · happy=0.29 · load=2.5 · verify=0.27 · stage=research · band=careful_good
- **Primary gap:** context_bloat (prior=context_bloat, conf=0.5)
- **Transferable tag:** `smell:context_bloat` · **Socratink-relevance:** **med**
- **Why:**
  - Thrash/gov leader: primary_gap=context_bloat (conf 0.50), thrash_p=0.16, plate=1.02, partnership_load=2.50 on 4.5MB research session.
  - Excerpt opens on harness boilerplate (multi_agent_role, app_context, agents_md, spawn); observable user Outcome/Proof/stop is thin or buried — classic plate-gap ∩ context stuffing.
  - Context bloat dominant: long AGENTS/desktop/multi-agent preamble consumes the scored excerpt window (caveat: first ~400 lines).
  - Socratink-labeled (landing/site); lesson feeds plate/thrash/governance loops directly.
- **Evidence flags:** multi_agent_role, app_context, agents_md, spawn · toolish≈149

### TL-17 · `2026-09-11T23-54-18-01a093f7-6356-7192-a0d8-2250fe8704d0`

- **Slug/cwd:** socratink · `/Users/jondev/dev/active/socratink-landing`
- **Scores:** plate=1.13 · thrash_p=0.18 · happy=0.49 · load=2.26 · verify=0.21 · stage=impl · band=careful_good
- **Primary gap:** context_bloat (prior=context_bloat, conf=0.32)
- **Transferable tag:** `smell:context_bloat` · **Socratink-relevance:** **med**
- **Why:**
  - Thrash/gov leader: primary_gap=context_bloat (conf 0.32), thrash_p=0.17, plate=1.13, partnership_load=2.26 on 6.3MB impl session.
  - Excerpt opens on harness boilerplate (multi_agent_role, app_context, agents_md, spawn); observable user Outcome/Proof/stop is thin or buried — classic plate-gap ∩ context stuffing.
  - User-ish ask visible: “please and offer ways to imrpove them and make them seem more congruous to the beginnings of socratink in theme and style and scroll feel? ” — plate quality judged against whether that ask was fenced with proof/stop.
  - Context bloat dominant: long AGENTS/desktop/multi-agent preamble consumes the scored excerpt window (caveat: first ~400 lines).
  - Socratink-labeled (landing/site); lesson feeds plate/thrash/governance loops directly.
- **Evidence flags:** multi_agent_role, app_context, agents_md, spawn · toolish≈98 · userish: “please and offer ways to imrpove them and make them seem more congruous to the beginnings of socrati…”

### TL-18 · `2026-08-14T00-43-36-019ffecc-1797-7190-9fc7-bb07c647e7d3` · dual-listed

- **Slug/cwd:** unknown · `/Users/jondev/dev/sandbox/skill-eval`
- **Scores:** plate=0.5 · thrash_p=0.08 · happy=0.28 · load=2.4 · verify=0.23 · stage=research · band=careful_good
- **Primary gap:** context_bloat (prior=context_bloat, conf=0.32)
- **Transferable tag:** `smell:context_bloat` · **Socratink-relevance:** **med**
- **Why:**
  - Thrash/gov leader: primary_gap=context_bloat (conf 0.32), thrash_p=0.08, plate=0.50, partnership_load=2.40 on 6.0MB research session.
  - Excerpt opens on harness boilerplate (multi_agent_role, agents_md, memory_folder, spawn); observable user Outcome/Proof/stop is thin or buried — classic plate-gap ∩ context stuffing.
  - User-ish ask visible: “help you stay consistent. Use it whenever it is likely to help. Decision boundary: should you use memory for a new user query? - Skip memory…” — plate quality judged against whether that ask was fenced with proof/stop.
  - Context bloat dominant: long AGENTS/desktop/multi-agent preamble consumes the scored excerpt window (caveat: first ~400 lines).
  - Slug=unknown (skill-eval sandbox); transferable as harness smell even when not product-core.
- **Evidence flags:** multi_agent_role, agents_md, memory_folder, outcome_plate, spawn, skill_eval · toolish≈169 · userish: “help you stay consistent. Use it whenever it is likely to help. Decision boundary: should you use me…”

### TL-19 · `2026-08-29T22-27-23-01a050ec-1013-7b51-a6b1-8055e87b6d36` · dual-listed

- **Slug/cwd:** socratink · `/Users/jondev/dev/active/socratink/product/socratink`
- **Scores:** plate=0.14 · thrash_p=0.28 · happy=0.16 · load=1.94 · verify=0.14 · stage=research · band=careful_good
- **Primary gap:** over_trust (prior=over_trust, conf=0.07)
- **Transferable tag:** `smell:over_trust` · **Socratink-relevance:** **med**
- **Why:**
  - Thrash/gov leader: primary_gap=over_trust (conf 0.07), thrash_p=0.28, plate=0.14, partnership_load=1.94 on 4.9MB research session.
  - Excerpt opens on harness boilerplate (multi_agent_role, agents_md, oh_my_codex, spawn); observable user Outcome/Proof/stop is thin or buried — classic plate-gap ∩ context stuffing.
  - User-ish ask visible: “research project already runs on this machine, with required code, data, simulator, runtime/container, and credentials present. If those are…” — plate quality judged against whether that ask was fenced with proof/stop.
  - Over-trust / trust-without-plate: oh-my-codex / multi-agent routing invited unsupervised sprawl before a one-sentence Outcome.
  - Socratink-labeled (product repo); lesson feeds plate/thrash/governance loops directly.
- **Evidence flags:** multi_agent_role, agents_md, oh_my_codex, spawn · toolish≈165 · userish: “research project already runs on this machine, with required code, data, simulator, runtime/containe…”

### TL-20 · `2026-08-27T17-34-26-01a04593-271c-7773-8102-214ee050e528`

- **Slug/cwd:** socratink · `/Users/jondev/dev/active/socratink/product/socratink`
- **Scores:** plate=1.44 · thrash_p=0.13 · happy=0.41 · load=2.3 · verify=0.31 · stage=review · band=careful_good
- **Primary gap:** missing_verify (prior=missing_verify, conf=0.19)
- **Transferable tag:** `smell:missing_verify` · **Socratink-relevance:** **high**
- **Why:**
  - Thrash/gov leader: primary_gap=missing_verify (conf 0.19), thrash_p=0.13, plate=1.44, partnership_load=2.30 on 16.0MB review session.
  - Excerpt opens on harness boilerplate (multi_agent_role, app_context, agents_md, spawn); observable user Outcome/Proof/stop is thin or buried — classic plate-gap ∩ context stuffing.
  - User-ish ask visible: “can you evaluatte this project for code cleanliness and system archtiecture? i want to make sure its in a diamond qualiuy state before doing…” — plate quality judged against whether that ask was fenced with proof/stop.
  - Verification weak (verify_ok=0.31); work may advance without named proof commands or stop-on-green.
  - Socratink-labeled (product repo); lesson feeds plate/thrash/governance loops directly.
- **Evidence flags:** multi_agent_role, app_context, agents_md, proof, spawn · toolish≈155 · userish: “can you evaluatte this project for code cleanliness and system archtiecture? i want to make sure its…”

---

## Caveats

- Excerpts are first ~400 lines redacted; long rollouts may under-represent late thrash.
- Size-biased corpus (top 80 by bytes) → long-horizon bias.
- Pack row dupes (capture vs ~/.codex) averaged rather than double-counted in ranking.
- Qualitative why is evidence-grounded synthesis from scores + excerpt signals + Max Jev tags; not a freeform LLM narrative field.

## Blockers

- None.
