# IDE vs Ship

When IDE-local is OK vs when Captain must force Ship/cloud.

## One-liner

Ship score ≠ loop health. Force cloud Ship for merge-bound work; IDE only for plate-bound hotfixes with tripwires.

## Force Ship — R1–R6

| ID | Trigger |
| --- | --- |
| **R1** | Merge-bound product change (will PR to main) |
| **R2** | Auth / BYOK / secrets / session identity / hotel-safety / PKCE |
| **R3** | Multi-file phase / new invariant / library+wire |
| **R4** | Thrash tripwire already firing ([[Thrash Tripwire]]) |
| **R5** | Thin plate / trust-without-plate / >15–30m without restated `/goal` |
| **R6** | Needs FM-PRREV before “proof closed” |

## IDE OK — A1–A5

| ID | Allowed when |
| --- | --- |
| **A1** | Plate-bound hotfix: one causal owner, tiny diff, named proof (#6 shape) |
| **A2** | Short visual/CSS poke with plate+cwd+stop; tripwire armed |
| **A3** | Research / local proof only — not merge-bound |
| **A4** | Destructive restart only with hard fence **and** stop-on-proof |
| **A5** | Explicit captain exception (rare) |

## Counterexamples

- `b23609bb` (1770 tools) — thrash∩ship; Axis-A ≠ health (**S065**)
- `#7` — shipped ≠ verify

See [[Gold Chain Habits]] · [[Crew Wake]].
