# Harness skills table — FM-AGENTENG-01
**As-of:** 2026-09-15T20:35-05:00 CT  
**Labels:** sizes **verified** (same-day live `du -sh` via Nole/CHATSIG); skill names **inference** from pack `paths_touched` unless noted.

## Disk sizes (Jondev.local home harnesses)

| Path | Size | Label |
| --- | --- | --- |
| `~/.codex` | **1.6G** | verified |
| `~/.cursor` | **233M** | verified |
| `~/.pi` | **199M** | verified |
| `~/.dsh` | **1.4M** | verified |
| `~/.agents` | **1.3M** | verified |
| `~/.claude` | **764K** | verified |

### Notable subdirs (inference / prior)

| Path | Note |
| --- | --- |
| `~/.cursor/projects/**/agent-transcripts` | 941 sessions; ~136M within projects |
| `~/.cursor/chats` | ~660K / ~5 threads |
| `~/.codex/sessions + archived` | 138 rollout jsonl |
| `~/.agents/skills` | home skill SoT + sprawl/runtime |
| `~/.agents/runtime/sprawl` | packet runs |
| App Support Cursor | **19G** — exclude Cache from corpus |

## Skill folder names by root (pack-derived)

### `~/.agents/skills` (n=22)

`agentic-engineering-research`, `close-loop`, `evidence-to-agency-brief`, `grok-spark-code-sprawl`, `handoff`, `nano-prompt`, `postmortem`, `praxist-control`, `praxist-diagnostic`, `praxist-interactive-task-init`, `praxist-runtime-install`, `praxist-takeover`, `skill`, `socratink-agent-flow`, `socratink-loop-status`, `subagent-sprawl`, `system-design`, `unlazy`, `ux-adversarial-review`, `variate`, `working-loop`, `write-skillset-router`

### `~/.codex/skills` (n=44)

`.system`, `agentic-engineering-research`, `ai-slop-cleaner`, `animation-vocabulary`, `autonomous-ai-agents`, `autoprompt`, `baseline-ui`, `close-loop`, `create-skill`, `design`, `distribute-skill`, `doctor`, `dynamic-workflow`, `emil-design-eng`, `evidence-to-agency-brief`, `frontend-design`, `get-api-docs`, `govuk-style`, `herdr`, `improve-the-repo`, `karpathy-take`, `khan-hassabis-take`, `launch-agent-work`, `maintain-skills`, `make-it-work`, `postmortem`, `preserve-publish-context`, `prototype`, `research`, `run-agents`, `skill`, `socratink-agent-flow`, `socratink-agent-slice-review`, `socratink-app-publish`, `socratink-flow`, `socratink-loop-status`, `socratink-research`, `stop-slop`, `subagent-sprawl`, `tool-sharpening-loop`, `ultraqa`, `ux-adversarial-review`, `what-did-i-get-done`, `writing-great-skills`

### `~/.cursor/skills` (n=13)

`automate`, `better-ui`, `canvas`, `create-hook`, `create-rule`, `create-skill`, `cursor-guide`, `migrate-to-skills`, `new-repo`, `origin`, `review-bugbot`, `update-cursor-settings`, `variate`

### `product/socratink/.agents/skills` (n=24)

`better-ui`, `better-ui-skillset`, `braintrust-wiki`, `catch-brain-to-product`, `code-review`, `common-skills-skillset`, `flue-wiki`, `how`, `improve-codebase-architecture`, `karpathy-guidelines`, `kenneth-koedinger-perspective`, `manage-tink`, `martin-fowler-perspective`, `personas`, `personas-skillset`, `sal-khan-perspective`, `skill-scout`, `socratink-brain`, `steve-jobs-perspective`, `thermo-nuclear-code-quality-review`, `triangulate-me`, `variate`, `working-loop`, `writing-for-agents`

## Duplicate names (cross-root)

| Name | Locations | Keep/Merge/Cut |
| --- | --- | --- |
| `agentic-engineering-research` | `~/.agents/skills`, `~/.codex/skills` | **merge** — Duplicate across ~/.agents and ~/.codex — pick one SoT |
| `better-ui` | `product/.agents/skills`, `~/.cursor/skills` | **keep** — Product present; treat other roots as mirrors |
| `close-loop` | `~/.agents/skills`, `~/.codex/skills` | **merge** — Merge ~/.agents + ~/.codex to one SoT |
| `create-skill` | `~/.codex/skills`, `~/.cursor/skills` | **merge** — Cross-harness name collision |
| `evidence-to-agency-brief` | `~/.agents/skills`, `~/.codex/skills` | **merge** — Duplicate across ~/.agents and ~/.codex — pick one SoT |
| `manage-tink` | `prod-app/.agents/skills`, `product/.agents/skills` | **merge** — Product vs prod-app duplicate — prefer product/ |
| `postmortem` | `~/.agents/skills`, `~/.codex/skills` | **merge** — Keep ~/.agents or ~/.codex single SoT — merge duplicate |
| `prototype` | `prod-app/.agents/skills`, `~/.codex/skills` | **merge** — Cross-harness name collision |
| `skill` | `~/.agents/skills`, `~/.codex/skills` | **merge** — Duplicate across ~/.agents and ~/.codex — pick one SoT |
| `skill-scout` | `prod-app/.agents/skills`, `product/.agents/skills` | **keep** — Product workflow; prefer product/.agents/skills over prod-app copy |
| `socratink-agent-flow` | `~/.agents/skills`, `~/.codex/skills` | **merge** — Duplicate across ~/.agents and ~/.codex — pick one SoT |
| `socratink-flow` | `prod-app/.agents/skills`, `~/.codex/skills` | **merge** — Cross-harness name collision |
| `socratink-loop-status` | `~/.agents/skills`, `~/.codex/skills` | **merge** — Duplicate across ~/.agents and ~/.codex — pick one SoT |
| `socratink-path-to-customer` | `research-vault/.agents/skills`, `~/.claude/skills` | **merge** — Cross-harness name collision |
| `socratink-research` | `research-vault/.agents/skills`, `~/.codex/skills` | **merge** — Cross-harness name collision |
| `subagent-sprawl` | `~/.agents/skills`, `~/.codex/skills` | **keep** — Active sprawl runtime skill — KEEP but tighten packet schema (P1) |
| `ux-adversarial-review` | `~/.agents/skills`, `~/.codex/skills` | **merge** — Duplicate across ~/.agents and ~/.codex — pick one SoT |
| `variate` | `product/.agents/skills`, `~/.agents/skills`, `~/.cursor/skills` | **keep** — Product present; treat other roots as mirrors |
| `working-loop` | `product/.agents/skills`, `~/.agents/skills` | **keep** — Product present; treat other roots as mirrors |

## Nole annex summary

- Unique skillish names: **304**; multi-location: **131** (many plugin-cache revs).
- Prefer product SoT for `socratink-brain`, `typesafe-ai`, `thermo-nuclear-code-quality-review`.
- Cut Vercel/plugin cache farm from personal skill mental model.
