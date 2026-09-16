# PARETO-01 FREEZE notes

These are **scope freezes**, not deletion orders. Hot-tree product code named
here stays in place until Captain explicitly unfreezes.

## Praxist-as-progress

Do **not** treat Praxist campaigns, multi-agent research runs, or operator
loops as product wins, learner outcomes, or merge-ready proof.

- Passing a Praxist plate, finishing a campaign generation, or archiving
  research cards does **not** authorize product scope expansion.
- Negative results belong in dated `.agents/learnings/` postmortems with stop
  rules—not silent retries or “complete the plan” completionism.
- Before repeating Praxist, multi-agent research, or a failed operator loop,
  read matching files in [`.agents/learnings/`](../../../.agents/learnings/).

## Extra WebGL (beyond living-ink brand core)

**Brand core (keep, do not delete):** `living-ink` and
`src/ui/effects/living-ink*` when present—the primary learner-facing ink
visual identity.

**Frozen extras (no new work without explicit product request):**

| Path | Notes |
| --- | --- |
| `src/ui/effects/organic-sphere.ts` | WebGL sphere effect |
| `src/ui/effects/organic-sphere-shaders.ts` | Shader support |
| `src/ui/effects/icon-cloud.ts` | WebGL icon cloud |
| `src/ui/effects/smooth-cursor.ts` | Heavy cursor smoothing |

Do not add new WebGL experiments, expand these modules, or wire them deeper
into the learner flow unless the user explicitly requests that product
capability. Bug fixes that preserve existing behavior are fine.

**Untouched by this freeze:** `src/ui/effects/spring.ts`,
`src/ui/effects/pointer-media.ts`, and all Chat knee paths (`src/agents/chat.ts`,
questionnaire, reveal, transcript UI, providers).
