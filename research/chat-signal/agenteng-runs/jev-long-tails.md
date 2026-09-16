# Max Jev — unscored / hole long Codex+Cursor tails

- **As-of:** 2026-09-15 ~21:06 CT
- **Job:** FM-AGENTENG-01 Researchy burn-tranche-3 T3.5
- **Method:** TypeSafe SystemOne Max Jev (`noul`/`score`/`choice`); key from `box-secrets card.TYPESAFE_API_KEY` (never echoed)
- **N:** 20 · **ok:** 20 · **err:** 0
- **Selection:** P3_cursor_long_thrash_hole:8 · P1_recovery_fatal_lacking_deep_jev:7 · P2_codex_long_unscored:5
- **Harness:** codex:12 · cursor:8
- **Mac sync:** skipped
- **Brain / factory / product AGENTS / PRs:** untouched

## State rule (candidate selection)

- P1 (fill first, ≤7): recovery/fatal RS/FT cards lacking deep Max-Jev
- P3 (next, ≤8): Cursor long IDE tails — structural_top_thrash / axis_a_thrash / fail_exemplars with hole (gap=none∩happy<0.7 | gap_conf<0.35 | mid-happy∩thrash | n_tools≥500 needing Max-Jev tag)
- P2 (fill to 20): unique Codex sessions bytes≥3MB not in deep-jev/top30 Max Jev
- Dedup by session_id; never invent IDs

**Hole def:** gap===none with happy<0.7 OR gap_confidence<0.35 OR (0.25≤happy≤0.75 ∧ thrash≥0.2) OR card absent from Max-Jev result set OR extreme tool tail (≥500 tools) lacking Max-Jev transferable tag

## Means (ok only)

| Metric | Mean |
| --- | ---: |
| happy_path_fit | 0.43 |
| thrash | 0.629 |
| plate_quality | 1.099 |
| verify_ok | 0.364 |
| is_happy_nugget | 0.578 |
| is_smell | 0.773 |

## Distributions

- **primary_label:** mixed:11 · smell:6 · happy:3
- **primary_partnership_gap:** thrash:11 · none:4 · missing_verify:3 · governance:1 · over_trust:1
- **socratink_relevance:** high:19 · med:1
- **velocity_quality_band:** careful_good:10 · slow_thrash:7 · fast_good:3
- **transferable_tag:** smell_thrash:9 · nugget_recovery_flip:4 · nugget_narrow_proof:4 · smell_over_trust:1 · nugget_scout_only:1 · nugget_plate_first:1

## Still holes after Jev (labeled)

| unit_id | reason | gap | conf |
| --- | --- | --- | ---: |
| LT-RS-07 | low_conf_after_jev | none | 0.33 |
| LT-CX-2026-09-13T23-19-06-01a09e | gap_none_after_jev | none | 0.53 |
| LT-CX-2026-08-29T01-55-34-01a04c | low_conf_after_jev | none | 0.34 |
| LT-CX-2026-09-12T14-50-20-01a097 | low_conf_after_jev | missing_verify | 0.33 |
| LT-CX-2026-08-02T16-09-34-019fc4 | low_conf_after_jev | missing_verify | 0.14 |

## Per-unit results

| unit | harness | sel | prior gap | Jev gap | label | tag | happy | thrash | plate | verify | rel |
| --- | --- | --- | --- | --- | --- | --- | ---: | ---: | ---: | ---: | --- |
| LT-RS-03 | codex | Precovery_fatal | none | missing_verify | mixed | nugget_recovery_flip | 0.85 | 0.63 | 1.63 | 0.22 | high |
| LT-RS-07 | codex | Precovery_fatal | none | none | mixed | nugget_recovery_flip | 0.78 | 0.61 | 1.92 | 0.58 | high |
| LT-RS-11 | codex | Precovery_fatal | none | thrash | mixed | nugget_recovery_flip | 0.75 | 0.57 | 1.1 | 0.4 | high |
| LT-RS-13 | codex | Precovery_fatal | none | thrash | happy | nugget_recovery_flip | 0.73 | 0.79 | 1.18 | 0.24 | high |
| LT-RS-14 | codex | Precovery_fatal | none | thrash | mixed | nugget_narrow_proof | 0.83 | 0.65 | 2.11 | 0.68 | high |
| LT-FT-06 | codex | Precovery_fatal | governance | governance | smell | smell_thrash | 0.13 | 0.89 | 0.84 | 0.11 | high |
| LT-FT-12 | codex | Precovery_fatal | none | thrash | smell | smell_thrash | 0.14 | 0.82 | 1.15 | 0.16 | high |
| LT-CU-b23609bb | cursor | Pcursor thrash_hol | thrash | thrash | mixed | smell_thrash | 0.19 | 0.83 | 0.75 | 0.32 | high |
| LT-CU-a09316e9 | cursor | Pcursor thrash_hol | over_trust | over_trust | mixed | smell_over_trust | 0.28 | 0.72 | 0.8 | 0.51 | high |
| LT-CU-357a2e9e | cursor | Pcursor thrash_hol | thrash | thrash | smell | smell_thrash | 0.12 | 0.84 | 0.6 | 0.17 | high |
| LT-CU-f57a99e7 | cursor | Pcursor thrash_hol | thrash | thrash | smell | smell_thrash | 0.08 | 0.91 | 0.16 | 0.17 | high |
| LT-CU-4d0e878b | cursor | Pcursor thrash_hol | thrash | thrash | mixed | smell_thrash | 0.13 | 0.91 | 0.68 | 0.33 | high |
| LT-CU-e1fe36a4 | cursor | Pcursor thrash_hol | thrash | thrash | mixed | smell_thrash | 0.14 | 0.87 | 0.9 | 0.2 | high |
| LT-CU-891f9f25 | cursor | Pcursor thrash_hol | thrash | thrash | smell | smell_thrash | 0.11 | 0.78 | 0.36 | 0.26 | high |
| LT-CU-2fb70153 | cursor | Pcursor thrash_hol | thrash | thrash | smell | smell_thrash | 0.08 | 0.92 | 0.33 | 0.15 | high |
| LT-CX-2026-09-13T23-19-06-01a09e | codex | Pcodex unscored | none | none | happy | nugget_narrow_proof | 0.67 | 0.16 | 1.46 | 0.63 | high |
| LT-CX-2026-08-27T01-33-15-01a042 | codex | Pcodex unscored | none | none | mixed | nugget_narrow_proof | 0.79 | 0.14 | 1.46 | 0.77 | high |
| LT-CX-2026-08-29T01-55-34-01a04c | codex | Pcodex unscored | none | none | happy | nugget_narrow_proof | 0.71 | 0.19 | 2.18 | 0.68 | high |
| LT-CX-2026-09-12T14-50-20-01a097 | codex | Pcodex unscored | none | missing_verify | mixed | nugget_scout_only | 0.4 | 0.2 | 0.97 | 0.16 | med |
| LT-CX-2026-08-02T16-09-34-019fc4 | codex | Pcodex unscored | none | missing_verify | mixed | nugget_plate_first | 0.68 | 0.15 | 1.4 | 0.54 | high |

## Takeaways (research)

1. Long tails remain **smell-heavy** (mean thrash≈0.629, is_smell≈0.773) — thrash tripwire + `/goal` plate are the right operationalization.
2. Dominant refined gap: **thrash** — aligns CR-S02/S030 and Cursor axis-A∩thrash exemplars (`b23609bb`, `a09316e9`, `357a2e9e`).
3. Mixed labels common on recovery cards — keep **nugget:replate_on_thrash / recovery_flip** separate from fatal thrash smells.
4. Units still labeled hole after Jev are called out above — do not invent cleaner gaps.

## Sources

- `jev-long-tails-pack.json` (state rule + units)
- `codex-strata-pack-v2` / `codex-recovery-cards` / `codex-deep-jev-scores`
- `strata-pack-v3` + `strata-scores-v3` + `loops-v2-session-mine` (Cursor thrash tails)
- Companion: `draft-agents-thrash-tripwire.md`, `draft-goal-template.md`

---

**SUCCESS:** n_ok=20 (≥10) · n_err=0 · still_holes_labeled=5 · research-only.