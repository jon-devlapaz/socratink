---
name: better-ui-skillset
description: >
  Router for the better-ui skillset. Use when the user asks for better-ui-skillset,
  which better-* skill to use, a cross-discipline interface review, or UI work that
  spans accessibility, layout, writing, typography, color, or polish. Do not use when
  a single named member skill is already the clear owner.
---

# Better UI skillset

Route. Do not restate member rules. Prefer members under this skillset tree over any
sibling standalone skill with the same name.

## 1. Classify the request

Pick the lightest owner that covers the ask:

| Ask | Load |
| --- | --- |
| Holistic review of a screen, flow, feature, or product interface | [better-interface/SKILL.md](better-interface/SKILL.md) |
| Keyboard, focus, hit areas, ARIA, forms, screen readers, reduced motion | [better-accessibility/SKILL.md](better-accessibility/SKILL.md) |
| Grouping, alignment, spacing, breakpoints, progressive disclosure, spatial RTL | [better-layout/SKILL.md](better-layout/SKILL.md) |
| Labels, errors, empty states, voice, tone, terminology | [better-writing/SKILL.md](better-writing/SKILL.md) |
| Type scale, wrapping, truncation, OpenType, text spacing, font loading | [better-typography/SKILL.md](better-typography/SKILL.md) |
| Palettes, tokens, formats, contrast measurement, color remediation | [better-colors/SKILL.md](better-colors/SKILL.md) |
| Radius, shadows, icons, motion, optical alignment, surface polish | [better-ui/SKILL.md](better-ui/SKILL.md) |

If the user names a member, load that member only.

If several domains are in play and the ask is a review, load `better-interface`.
It already routes every domain skill, consolidates findings, and owns the verdict.

If several domains are in play and the ask is implementation, load only the owners
needed for the change. Do not run a full interface review unless asked.

## 2. Hand off

1. Read the chosen member `SKILL.md` in full.
2. Follow that skill's procedure, references, and reporting format.
3. Load sibling members only when the chosen skill names a handoff, or when
   `better-interface` requires every available domain owner.

Never invent accessibility, layout, writing, typography, color, or polish rules
from this file. Never flatten, merge, or rewrite member skills.

## 3. Boundaries

- Change-scoped review of a branch, PR, commit range, or uncommitted diff belongs
  to `interface-review` when that skill is installed. `better-interface` cannot
  start it; ask the user to run it.
- Leave `.tink-skillset.json` untouched. It is ownership and digest evidence, not
  a routing table to edit.
- This skillset does not authorize installing, refreshing, or removing Tink skills.
  Use `manage-tink` for those mutations.
