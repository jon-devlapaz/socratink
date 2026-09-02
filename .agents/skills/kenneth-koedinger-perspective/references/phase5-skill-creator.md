# Phase 5 skill-creator review — Kenneth R. Koedinger perspective

**Reviewer:** skill-creator perspective  
**Date:** 2026-08-31  
**Scope:** Instruction-design review only. `SKILL.md` was not modified.

## Verdict

The skill is unusually careful about a living person's public-framework boundary and about hiring misuse. Its activation description names real user intents, the role rules prevent identity/authority laundering, and the workflow produces a usable product or hiring decision rather than a generic literature summary. The largest design cost is entrypoint size: 3,508 words / 27,868 bytes load on every invocation, including a historical timeline and source catalog that are valuable for audit but not for ordinary perspective answers.

## Activation and routing

- **Coverage:** Strong for explicit Koedinger-perspective prompts, evidence-bounded Socratink learning-design reviews, and hiring work sessions. The description also has a useful non-auto-trigger boundary.
- **Misrouting risk:** “Socratink learning-design review” is broad enough to attract ordinary Socratink product work even when the user has not requested this particular lens. The ending sentence contradicts that breadth a little.
- **Question routing:** The fact/framework/mixed split is legible. A simple current-fact request is unnecessarily routed to “continue to Step 2,” which can imply the full five-track research protocol when live verification alone is enough.
- **Role and safety rules:** Strong. The one-time disclaimer, novel-domain label, source rule, no-endorsement rule, candidate-consent requirement, and unknown-fit boundary are all concrete. The hiring prohibition is repeated in three locations; retain the top-level hard rule and avoid repeating the same list.
- **Failure prevention:** Strong and proportionate for the real risks: impersonation, current-fact drift, authority laundering, measuring assisted performance as learning, and covert or non-consensual hiring evaluation.

## Resources and progressive disclosure

All referenced resources exist and are used: the six research tracks substantiate the framework, `synthesis.md` explains extraction, `hiring-brief.md` preserves the supplied role, and `phase4-validation.md` records behavioral validation. No placeholders or orphaned resources were found.

The entrypoint is bigger than a normal runtime needs. The five models, heuristics, operating contract, and role rules belong in it because they change behavior. The detailed 1984–2026 timeline and 17-item source catalog mainly support provenance/current-fact verification; keep them in the skill package, but route to them only when someone asks for biography, current-status verification, or evidence audit. Preserve a compact in-entrypoint research cutoff and a direct link to the records.

## Three exact recommended changes

### 1. Tighten discovery without losing the hiring use case

Replace frontmatter lines 3–4 with:

```yaml
description: >
  Apply a Kenneth R. Koedinger-derived, public-evidence learning-engineering lens when the user explicitly requests the Koedinger perspective or a Koedinger-informed Socratink learning-science or hiring evaluation. Do not use for general Socratink work or claim to speak for Koedinger.
```

This makes selection discriminating, resolves the present tension between the broad Socratink phrase and “Do not auto-trigger otherwise,” and preserves the two intended modes.

### 2. Route simple facts cheaply; reserve the research tracks for decisions

In the Step 1 table, replace the **Fact-dependent** action with:

```markdown
Research live. If the user only wants the fact, answer with the dated source; use the relevant Step 2 tracks only when the fact informs a recommendation or evaluation.
```

Add this sentence immediately after the Step 2 introductory paragraph (line 47):

```markdown
Do not run a track merely because a proper noun appears; select it only when it can change the requested decision.
```

This keeps live verification mandatory while preventing a costly, ritualized five-track workflow for a narrow request such as a current title or award.

### 3. Remove duplicated static material from the always-loaded entrypoint

Replace the entire `## Historical calibration` through `### Latest verified snapshot` block (lines 241–259) **and** the two source lists under `## Sources / 调研来源` (lines 309–330) with:

```markdown
## Evidence record and historical calibration

The public-evidence record, detailed 1984–2026 timeline, and source catalog are in `references/research/`, `references/synthesis.md`, and `references/phase4-validation.md`. Read them for biography, source audit, disputed findings, or current-status verification. The research cutoff is 2026-08-31; verify live facts before reuse.
```

Also delete the duplicate hiring-fit prohibition at operating-contract line 216 and the duplicate availability bullet at honest-boundary line 296; retain the authoritative top-level `Hiring boundary` rule (line 24) and preserve the separate adult-workplace evidence limitation (line 297).

This cuts routine context without weakening Nuwa-required provenance, timeline, anti-impersonation, or hiring safeguards. It moves conditional audit material to resources already present and removes only repeated text.

## No-change findings

- Keep the one-time public-framework disclaimer and the explicit novel-domain inference label. They are necessary anti-impersonation controls, not generic policy repetition.
- Keep the hiring work-session reduction and the consented, job-relevant work-sample requirement. They convert a reputation-based request into an evidence-sensitive hiring process.
- Keep the five model limitations and the adult/open-ended-work caveat. Those are substantive boundaries, not defensive boilerplate.
