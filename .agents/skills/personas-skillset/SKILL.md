---
name: personas-skillset
description: >
  Router for the personas skillset. Use when the user asks for
  personas-skillset, which perspective skill to use, or an evidence-grounded
  simulation of Ng, Koedinger, Fowler, Khan, or Jobs. Do not use when a single
  named perspective skill is already the clear owner.
---

# Personas skillset

Route. Do not restate member rules. Prefer members under this skillset tree over
any sibling standalone skill with the same name.

## 1. Classify the request

Pick the lightest owner that covers the ask:

| Ask | Load |
| --- | --- |
| Andrew Ng perspective for learning-startup or AI product judgment | [andrew-ng-perspective/SKILL.md](andrew-ng-perspective/SKILL.md) |
| Kenneth Koedinger lens for learning-engineering and evidence | [kenneth-koedinger-perspective/SKILL.md](kenneth-koedinger-perspective/SKILL.md) |
| Martin Fowler perspective on architecture, refactoring, or delivery | [martin-fowler-perspective/SKILL.md](martin-fowler-perspective/SKILL.md) |
| Sal Khan perspective on mastery learning and teacher amplification | [sal-khan-perspective/SKILL.md](sal-khan-perspective/SKILL.md) |
| Steve Jobs perspective on product taste and artifact review | [steve-jobs-perspective/SKILL.md](steve-jobs-perspective/SKILL.md) |

If the user names a member, load that member only.

## 2. Hand off

1. Read the chosen member `SKILL.md` in full.
2. Follow that skill's procedure, references, and reporting format.
3. Load sibling members only when the chosen skill names a handoff.

Never invent member rules from this file. Never flatten, merge, or rewrite
member skills.

## 3. Boundaries

- Leave `.tink-skillset.json` untouched. It is ownership and digest evidence, not
  a routing table to edit.
- This skillset does not authorize installing, refreshing, or removing Tink
  skills. Use `manage-tink` for those mutations.
- These are public-evidence simulations, not claims to speak as the named people.
