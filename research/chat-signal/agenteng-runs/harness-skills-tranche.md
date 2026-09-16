# Harness size + skill collision tranche (partial pkg1)

**As-of:** 2026-09-15 CT · **Verified** via `du -sh` + SKILL.md / skills-dir walk on Jondev.local

## Disk (home harnesses)

| Path | Size |
| --- | --- |
| `~/.codex` | **1.6G** |
| `~/.cursor` | 233M |
| `~/.pi` | 199M |
| `~/.dsh` | 1.4M |
| `~/.agents` | 1.3M |
| `~/.claude` | 764K |

**Inference:** Codex home is the dominant storage cost (likely session/cache). Cursor skill collisions are heavily driven by **plugin cache version duplicates**, not hand-authored duplicates.

## Skillish name inventory

- Unique skillish names found: **304**
- Names appearing in multiple locations: **131** (many = plugin cache revisions under `~/.cursor/plugins/cache/...`)

### Cross-harness collisions worth human review (not mere cache rev)

| Name | Locations (sample) | Candidate |
| --- | --- | --- |
| `docent` | `.codex` plugins + `.claude` | **merge** — pick one harness source of truth |
| `thermo-nuclear-code-quality-review` | cursor plugin cache + product `.agents/skills` | **keep product**; ignore cache dups |
| `socratink-brain` | product skills (canonical) | **keep** |
| `typesafe-ai` | product skills | **keep** |
| Vercel plugin skill farm (ai-sdk, nextjs, …) | multiple cursor plugin cache hashes | **cut** from mental model — treat as managed plugin, not personal skills |

### Dead-weight suspects (inference until mtime pass completes)

- Unnamed Grok bots: `New Bot`, `New Agent` under box `/home/box/agent-data/agents/`
- Plugin-cache skill duplicates (do not hand-edit; prune via plugin uninstall / cache clear if needed)
- Product learnings folder thin: 1 postmortem — process maturity gap vs EVT-0001 importance

Full keep/merge/cut table continues in inventory executor output.
