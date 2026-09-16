---
name: Socratink App
description: The learning engine that refuses to do the thinking for you
colors:
  paper: "#fffcf0"
  paper-2: "#f2f0e9"
  ui: "#e6e4d9"
  ui-2: "#dad8ce"
  ui-3: "#cecdc3"
  tx: "#100f0f"
  tx-2: "#575653"
  tx-3: "#686762"
  accent: "#1f7a72"
  accent-deep: "#1b6d66"
  accent-ink: "#fffcf0"
  error: "#af3029"
typography:
  display:
    fontFamily: "Instrument Serif, Georgia, serif"
    fontSize: "clamp(2rem, 3.5vw, 2.75rem)"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "-0.01em"
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    letterSpacing: "0.08em"
  code:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
    fontSize: "0.875rem"
    lineHeight: 1.5
rounded:
  button: "0.5rem"
  card: "0.75rem"
  pill: "9999px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-ink}"
    rounded: "{rounded.button}"
    padding: "0.6rem 1.1rem"
  button-secondary:
    backgroundColor: "color-mix(in srgb, {colors.paper-2} 88%, {colors.paper})"
    textColor: "{colors.tx}"
    rounded: "{rounded.button}"
    padding: "0.55rem 0.9rem"
---

# Design System: Socratink App (Operate Mode)

## Overview

**Creative North Star: "The Yohaku Dialogue Studio"**

The Socratink application is an austere, distraction-free environment for consequential technical and academic study. Unlike the landing page (which operates in **Persuade** mode to introduce the method), the application operates in **Operate** mode: its primary purpose is supporting sustained, high-friction cognitive struggle without fatigue or cognitive distortion.

The design embodies Japanese *yohaku* (余白): generous horizontal margins, quiet typography, and unhurried visual rhythm. Every element recedes so the learner's own thinking and the Socratic challenge remain the center of gravity. Surfaces are textured archival washi paper, typography is rendered in sumi carbon ink, and a solitary jade accent appears only where active choice or confirmed progress lives.

### Operate Mode vs. Persuade Mode

The app enforces strict operational discipline:
- **No Editorial Typography in Dialogue:** `Instrument Serif` is forbidden in conversational turns, timestamps, and tool metadata; fast-paced dialogue remains strictly in `Inter`.
- **Horizontal Over Vertical Yohaku:** Whitespace must not push previous dialogue turns out of view. Vertical spacing is compact and scannable; horizontal margins provide the breathing room.
- **Code & Math Breakout:** Prose is constrained to comfortable reading measures (max 65ch), while code blocks and mathematical proofs break out to the full container width with horizontal scrolling.
- **Idle Energy Conservation:** The WebGL living ink orb must decelerate and pause during inactive reading periods to preserve laptop battery and prevent fan noise.

## Colors

The application shares the foundational Flexoki paper-and-ink ramp, with true ink inversion for dark mode:

### Primary
- **Jade Accent** (#1f7a72, dark #3aa99f): The single accent color. Applied to send actions, selected questionnaire choices, active tool cards, and keyboard focus rings.
- **Deep Jade** (#1b6d66, dark #24837b): Hover, press, and active focus boundaries.

### Neutral
- **Washi Paper** (#fffcf0): The master stage and canvas background.
- **Parchment Surface** (#f2f0e9): Secondary panels, active input composer, dock background.
- **Linen Wells** (#e6e4d9): Recessed containers, hover washes, and inactive tool badges.
- **Carbon Ink** (#100f0f): Primary typographic ink for learner and assistant turns.
- **Soft Graphite** (#575653): Secondary metadata, prompts, trail summaries, and muted labels.
- **Faint Graphite** (#686762): Borders, hairline dividers, and timestamps.
- **Signal Red** (#af3029): Functional error states and invalid inputs only. Never decorative.

### Dark Mode (`:root[data-theme="dark"]`)
- Inverted sumi ramp: Paper ground is deep carbon (#100f0f), text is warm bone (#cecdc3), secondary text is stone (#aaa69e), and accent is luminous jade (#3aa99f).

### Named Rules
**The One Accent Rule.** Jade is used exclusively for actionable controls and active selections.
**The Hairline Rule.** Dividers, card boundaries, and panel borders must use 1px ink at 8% to 15% opacity (`color-mix(in srgb, var(--tx) 10%, transparent)`), never solid grays.

## Typography

**Prose & Interface:** Inter (system sans-serif fallback)  
**Code & Notation:** Monospace stack (SFMono, Menlo, Consolas)  
**Display & Empty Stage:** Instrument Serif (reserved strictly for empty states and milestone titles)

### Hierarchy
- **Empty Stage Invitation:** Instrument Serif, weight 400, `clamp(2rem, 3.5vw, 2.75rem)`, line-height 1.1.
- **Turn Text:** Inter, weight 400, `1rem`, line-height 1.6, letter-spacing `-0.01em`.
- **Tool & Questionnaire Headings:** Inter, weight 500, `1.125rem`, line-height 1.3.
- **Metadata & Cues:** Inter, weight 500, `0.75rem`, letter-spacing `0.04em`.
- **Code Fences:** Monospace, `0.875rem`, line-height 1.5.

### Named Rules
**The Serif Reserve Rule.** Instrument Serif must never appear in live conversational messages, tool cards, or buttons. It is reserved exclusively for the empty stage opening and session completion summaries.
**The Code Breakout Rule.** Inline prose is constrained to `65ch`. Code blocks (`<pre><code>`), data tables, and mathematical expressions have `max-width: 100%` and `overflow-x: auto` so indentation and formulas are never artificially clipped.

## Layout

- **The Stage (`.stage`):** Centered viewport stage with a maximum width of `48rem` (768px). Ample horizontal margins (`padding: 0 1.5rem` to `2.5rem`) frame the interaction.
- **Active Turn vs. Trail:** The current turn remains in full visual fidelity. Completed turns recede vertically into compact summary steps (`.history-step`), ensuring the learner maintains continuous context across 20+ turns without excessive scrolling.
- **Dock & Composer:** Fixed at the lower edge with a frosted paper background (`backdrop-blur`), safe-area inset padding, and reachable controls.

## Elevation & Depth

- **Tactile Paper Grain:** A permanent background SVG grain tooth (`--grain`) texture is applied to the root canvas.
- **Flat Folio Layering:** Panels and cards rest flat against the paper; depth is conveyed through subtle tonal shifts (`var(--paper)` to `var(--paper-2)`) and hairline ink boundaries.
- **No Floating Drop Shadows:** Drop shadows are prohibited on cards. Shadows are reserved for the dock composer lift and focus rings.

## Shapes

- **The Living Ink Droplet (`.alive-core`):** A centralized WebGL fluid orb, reacting to voice activity, assistant thinking, and inquiry cues.
- **Controls & Chips:** Softly rounded rectangles (`border-radius: 0.5rem` to `0.75rem`).
- **Interactive Question Cards:** Clean rectangular sheets bounded by 1px hairline ink rules.

## Components

### 1. The Stage & Living Ink Core (`.alive-core`)
- The visual anchor of the session. Displays the organic sumi droplet.
- Automatically throttles and pauses simulation during idle reading states.

### 2. The Conversational Transcript (`.chat-surface`)
- Streamed assistant responses and learner inputs rendered with high typographic clarity.
- Interactive questionnaire cards (`present_question`) mounted directly into the flow without modal overlays.

### 3. Audio & Dictation Control (`#dictation-button`)
- Real-time voice energy analysis driving the living ink orb.
- Visual state transitions: idle, listening, processing, review.

### 4. Tool Cards (`.tool-card`)
- Clean, minimal execution indicators displaying tool invocation, state, and outputs using hairline borders and monospace status pills.

### 5. Login Surface (`login.html`)
- Centered archival card with Wordmark, IPA pronunciation, email input, and light/dark theme boot synchronization.

## Do's and Don'ts

### Do:
- **Do** prioritize learner context retention: keep vertical turn spacing compact so recent turns remain visible.
- **Do** allow code blocks, proofs, and traces to expand to full container width.
- **Do** throttle and pause the WebGL canvas after 3–5 seconds of user/model inactivity.
- **Do** preserve deterministic DOM class names (`.tool-card`, `.active-turn`, `.questionnaire-form`) to protect contract tests.

### Don't:
- **Don't** use Instrument Serif in dialogue turns or metadata.
- **Don't** add large vertical padding gaps that push active inquiry below the fold.
- **Don't** use bright or saturated accent colors beyond Jade (#1f7a72 / #3aa99f).
- **Don't** allow continuous WebGL rendering during idle periods.
