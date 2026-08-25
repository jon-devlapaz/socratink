# Design

## Source of truth

- Status: Active for the bounded R1 evidence loop; the general chat surface remains existing product behavior.
- Last refreshed: 2026-08-24.
- Primary product surfaces: the existing Socratink chat and the opt-in, local-only R1 learner encounter.
- Evidence reviewed: `ZEN.md`, `AGENTS.md`, `src/ui/index.html`, `src/ui/main.ts`, `src/ui/styles.css`, and `.omx/plans/agentic-course-corpus-r1-gate-a.md`.

## Brand

- Personality: calm, serious, humane, and intellectually honest.
- Trust signals: exact conditions, visible assistance provenance, bounded claims, uncertainty, and a concrete later check.
- Avoid: gamification, scores, mastery badges, inflated praise, surveillance language, security-dashboard aesthetics, and AI-authored learner answers.

## Product goals

- Goals: let one learner submit their own answer, receive only the frozen intervention when eligible, answer one fresh inverse scenario, and see a four-part evidence receipt.
- Non-goals: course browsing, retrieval, profiles, adaptive sequencing, mastery estimation, delayed-task scheduling, or general chat redesign.
- Success signals: the learner can tell what they demonstrated, what help was used, what remains uncertain, and what must be checked later.

## Personas and jobs

- Primary personas: the founder acting as the first learner; a separate human reviewer using the private CLI.
- User jobs: complete a source-closed baseline without hints; understand the fixed correction if eligible; submit a fresh response without Socratink drafting it; inspect the bounded receipt.
- Key contexts of use: one local desktop browser, one loopback-only server, text-only interaction, and a separate terminal review step.

## Information architecture

- Primary navigation: no new global navigation.
- Core routes/screens: existing chat by default; opt-in R1 mode on the same local page when `/api/r1` is available.
- Content hierarchy: conditions and privacy warning, scenario policy/facts, exact prompt, learner response, state-specific next action, then the four-part receipt.

## Design principles

- Preserve authorship: the product records learner text verbatim and never drafts or improves it.
- Make evidence boundaries visible: assistance, uncertainty, and delayed verification receive equal prominence with positive observations.
- Progressive disclosure: show only the current scenario and action; keep private reviewer detail out of the learner surface.
- Tradeoffs: clarity and auditability outrank conversational fluidity or visual novelty for R1.

## Visual language

- Color: extend the existing warm paper, charcoal, and muted brown palette; reserve restrained red for errors.
- Typography: reuse the current system sans-serif stack and compact uppercase metadata labels.
- Spacing/layout rhythm: reuse the centered single-column card and existing responsive spacing.
- Shape/radius/elevation: reuse the existing 18px card, subtle border, and low elevation.
- Motion: reuse only subtle working/focus transitions; no celebratory motion.
- Imagery/iconography: retain the existing organic sphere and brand mark; add no new decorative imagery.

## Components

- Existing components to reuse: brand lockup, organic sphere, thought card, textarea, primary circular action.
- New/changed components: mode notice, conditions checklist/declarations, scenario block, fixed-feedback block, waiting-for-review state, and four-part receipt.
- Variants and states: unavailable/default chat, baseline open/submitted/stopped, intervention eligible/post open/submitted/stopped, baseline complete, and verification pending.
- Token/component ownership: `src/ui/styles.css`; do not introduce a design-system dependency.

## Accessibility

- Target standard: WCAG 2.2 AA where applicable to this bounded surface.
- Keyboard/focus behavior: full keyboard operation, visible focus, submit shortcut remains optional, and disabled controls explain waiting states.
- Contrast/readability: preserve high-contrast body text and do not encode status by color alone.
- Screen-reader semantics: headings, fieldsets/legends, labeled status regions, and polite live updates.
- Reduced motion and sensory considerations: honor `prefers-reduced-motion`; the sphere is decorative.

## Responsive behavior

- Supported breakpoints/devices: current desktop and narrow mobile behavior down to 320px.
- Layout adaptations: one column at all sizes; metadata and receipt grids stack on narrow screens.
- Touch/hover differences: no hover-only action or explanation.

## Interaction states

- Loading: disable the active action and announce the in-progress operation.
- Empty: require an explicit submission, while preserving a whitespace-only attempt as adverse evidence if sent.
- Error: retain typed text when safe, state the bounded failure, and avoid leaking paths or credentials.
- Success: show the server-projected state and receipt; never infer beyond it.
- Disabled: distinguish waiting for human review from terminal completion.
- Offline/slow network: keep the current response in the textarea until accepted and allow safe retry with the same request ID.

## Content voice

- Tone: plain, neutral, nonjudgmental, and specific.
- Terminology: use “request validity,” “execution authorization,” “your response,” “fixed feedback,” and “check later.”
- Microcopy rules: do not say learned, mastered, retained, transferred, secure, or improved; do not praise or diagnose; label declarations as declarations rather than detected truth.

## Implementation constraints

- Framework/styling system: vanilla TypeScript and CSS in the existing Vite UI; application-owned Hono R1 API.
- Design-token constraints: reuse existing colors, type, spacing, and card treatment.
- Performance constraints: no new dependencies, no course assets, and no additional model call.
- Compatibility constraints: R1 is absent unless `SOCRATINK_R1_LOCAL=1`; founder data stays local and must not enter Braintrust or Flue conversations.
- Test/screenshot expectations: contract and route tests, typecheck/build, browser keyboard/mobile checks, and screenshots for baseline, waiting, feedback, and receipt states.

## Open questions

- [ ] After Gate B dogfood, founder to decide whether the R1 surface should remain a temporary mode or become a dedicated route; no impact on this bounded run.
- [ ] Delayed verification scheduling remains intentionally manual for R1; revisit only after evidence from this encounter.
