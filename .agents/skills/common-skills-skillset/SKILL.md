---
name: common-skills-skillset
description: >
  Router for the common-skills skillset. Use when the user asks for
  common-skills-skillset, which member skill to use, or work that spans
  specs, pull requests, review, debugging, research, or documentation. Do not
  use when a single named member skill is already the clear owner.
---

# Common skills skillset

Route. Do not restate member rules. Prefer members under this skillset tree over
any sibling standalone skill with the same name.

## 1. Classify the request

If the user names a member, load that member only.

### Workflow coordinators

| Ask | Load |
| --- | --- |
| Autonomous medium-to-large feature saga with workers (`/saga`) | [saga/SKILL.md](saga/SKILL.md) |
| Spec-first feature workflow (`PRODUCT.md` then `TECH.md` then build) | [spec-driven-implementation/SKILL.md](spec-driven-implementation/SKILL.md) |
| Model-diverse subagent council on one contested decision | [council/SKILL.md](council/SKILL.md) |

### Specs & planning

| Ask | Load |
| --- | --- |
| Write a `PRODUCT.md` user-facing behavioral spec | [write-product-spec/SKILL.md](write-product-spec/SKILL.md) |
| Write a `TECH.md` architecture and implementation spec | [write-tech-spec/SKILL.md](write-tech-spec/SKILL.md) |
| Implement an approved feature from `PRODUCT.md` and `TECH.md` | [implement-specs/SKILL.md](implement-specs/SKILL.md) |
| Compare a PR implementation against `spec_context.md` | [check-impl-against-spec/SKILL.md](check-impl-against-spec/SKILL.md) |
| Validate a branch or PR matches product/tech/security/release specs | [validate-changes-match-specs/SKILL.md](validate-changes-match-specs/SKILL.md) |
| Draft MDX feature docs from `PRODUCT.md` and/or `TECH.md` | [write-feature-docs/SKILL.md](write-feature-docs/SKILL.md) |

### PR lifecycle

| Ask | Load |
| --- | --- |
| Open or submit a pull request for the current branch | [create-pr/SKILL.md](create-pr/SKILL.md) |
| Write or refresh a PR description and reviewer guidance | [write-pr-description/SKILL.md](write-pr-description/SKILL.md) |
| Review a PR diff into structured `review.json` feedback | [review-pr/SKILL.md](review-pr/SKILL.md) |
| Walk PR comments interactively, reply, and resolve threads | [respond-to-pr-comments-in-blocklist/SKILL.md](respond-to-pr-comments-in-blocklist/SKILL.md) |
| Diagnose CI failures on a PR and plan fixes | [diagnose-ci-failures/SKILL.md](diagnose-ci-failures/SKILL.md) |
| Resolve merge or rebase conflicts from extracted hunks | [resolve-merge-conflicts/SKILL.md](resolve-merge-conflicts/SKILL.md) |
| Generate an interactive D3 map or walkthrough of a PR | [pr-walkthrough/SKILL.md](pr-walkthrough/SKILL.md) |
| Delegate noisy codebase/log/diff investigation to subagents | [research/SKILL.md](research/SKILL.md) |

### Diagnostics & fixing

| Ask | Load |
| --- | --- |
| Fix compilation, clippy/fmt, or test failures in Rust | [fix-errors/SKILL.md](fix-errors/SKILL.md) |
| Reproduce a UI bug report with computer-use cloud agents | [reproduce-bug-report/SKILL.md](reproduce-bug-report/SKILL.md) |

### Research & critique

| Ask | Load |
| --- | --- |
| Second-round critique circulating proposals among subagents | [cross-critique/SKILL.md](cross-critique/SKILL.md) |

### Docs & readout

| Ask | Load |
| --- | --- |
| Create or review Warp- or Oz-branded assets, mockups, or copy | [brandalf/SKILL.md](brandalf/SKILL.md) |
| Produce a self-contained HTML readout under `~/.readouts` | [readout/SKILL.md](readout/SKILL.md) |

### Meta & feedback

| Ask | Load |
| --- | --- |
| Author or refine `SKILL.md` definitions | [update-skill/SKILL.md](update-skill/SKILL.md) |
| Grade skill performance from conversation transcripts | [skill-doctor/SKILL.md](skill-doctor/SKILL.md) |
| Submit anonymous unstructured tooling complaints to Slack | [complain/SKILL.md](complain/SKILL.md) |
| Submit proactive agent-tooling friction feedback | [suggestion-box/SKILL.md](suggestion-box/SKILL.md) |

If several domains are in play and a coordinator owns that workflow, load it.
Otherwise load only the owners needed for the change.

## 2. Hand off

1. Read the chosen member `SKILL.md` in full.
2. Follow that skill's procedure, references, and reporting format.
3. Load sibling members only when the chosen skill names a handoff, or when a
   coordinator requires its workers.

Never invent member rules from this file. Never flatten, merge, or rewrite
member skills.

## 3. Boundaries

- Leave `.tink-skillset.json` untouched. It is ownership and digest evidence, not
  a routing table to edit.
- This skillset does not authorize installing, refreshing, or removing Tink
  skills. Use `manage-tink` for those mutations.
- Deprecated: `scan-new-specs` — retired 2026-08-20; do not invoke. For docs
  gaps use `missing_docs` in `warpdotdev/docs` (drift-watch) instead.
