# The archival ink folio

The app uses the paper, ink, and type system of the Socratink landing page.
The conversation is a working folio, not a stack of chat bubbles. Product
claims and teaching direction belong to [NORTH-STAR.md](NORTH-STAR.md).

## Paper and ink

`src/ui/styles.css` owns the theme tokens.

- Light paper is Flexoki archival cream `#fffcf0`. Parchment `#f2f0e9`,
  linen `#e6e4d9`, and deep linen `#dad8ce` supply neutral control surfaces.
  Carbon ink is `#100f0f`. Secondary ink is `#575653`, quiet ink `#686762`.
- Dark paper is true carbon ink `#100f0f`, with neutral steps `#1c1b1a`,
  `#282726`, and `#343331`. Text is `#cecdc3`, secondary ink `#aaa69e`,
  and quiet ink `#8f8c85`.
- Verdigris (`#1f7a72` in light and `#3aa99f` in dark) marks actions,
  selections, focus, and confirmed evidence. Pending
  work, quotations, and supplied answers are not evidence of learner mastery.
- Ochre identifies help supplied by Socratink. Use it for the attribution label
  and margin rule, with ordinary text ink for the explanation. Its light and
  dark values are `#82571f` and `#dfb477`.
- Signal red `#d14d41` means an error, never decoration.
- Rules use `color-mix` with ink at 5–20%. Default dividers use 10%.
  Use tonal paper steps and hairlines before adding an enclosing box.
- The sign-in page uses a faint grayscale paper texture at 7.6% opacity
  in light mode and 10% in dark mode.

## Type

The landing's sans stack is Inter, ui-sans-serif, system-ui, sans-serif.
The display stack is Newsreader, ui-serif, Georgia, serif, set by
`--font-serif` in `styles.css`. Newsreader replaced the landing's Instrument
Serif in the app on 2026-11-22; the landing page has not changed yet. The app
bundles Inter and Newsreader (Latin subset, variable weight) in
`src/ui/fonts/` with their OFL licenses and downloads no fonts from other
origins. The existing Paper Mono asset and its OFL license remain there, but
no longer set dialogue.

Use the sans stack for prose, controls, learner work, and tutor explanations.
Use the serif stack for display, structured tutor questions, and quotations.
Keep normal weight near 400. Question legends use 1.65rem, scaled by the
learner's text-size preference. Keep prose within the existing 580px measure.
Monospace is for instrument labels, shortcuts, attribution marks, and technical
code. Do not use it for conversation prose or tool-output prose.

## Surfaces and actions

Before the first message, show the heading and a short explanation above the
composer. Place the three starter buttons below it in reading and keyboard
order. A starter fills the empty composer and focuses it. The learner edits
the text and sends it. Hide starters whenever the composer contains a draft,
including a draft restored on reload. Let the empty screen scroll and the
button labels wrap when text is large or the keyboard leaves little space.

The active conversation rests directly on paper. Earlier steps meet it at a
hairline, with the existing bookmark control. Do not add rounded message
bubbles, decorative badges, or floating panels.

Question cards are separated by top and bottom rules. Choices are rows with
hairline dividers. A selected row receives a small verdigris wash and left
rule. The reasoning field stays distinct from tutor help.

The consent card keeps its two direct actions, "See it" and "Try once more".
"Try once more" is the primary button. "See it" is secondary. Do not change the
submission contract or add an extra confirmation step for a visual change.

Buttons use shadcn/ui. `buttons.css` keeps their paper and ink finish. Every button is a pill with a hairline edge. A primary button is ink
with a soft top sheen and an inset highlight; use one per place, for the
forward action (send, submit, "Try once more", send feedback). A secondary
button is a paper pill. A ghost button has no fill until hover, for quiet
tools such as Skip, Hint, steering, Cancel, and the microphone. Icon buttons
are circles. There are no solid teal blocks.
The composer has a neutral paper fill and a hairline edge, with no invitation
glow. Sign-in uses the same folio rules, not a dark
floating card. Shadows must identify a meaningful state, not decoration.

## Alignment

Recorded by Codex on 2026-11-21 during the Gridlines pass.

- Current-turn text, composer text, and dictation status use a common inset
  of 1.25rem. The composer border counts toward this inset.
- Supplied help uses the same text edge for its label, first line, and wrapped
  lines as the question below. Its 2px rule sits in the margin. Earlier steps
  follows the same pattern inside its existing text column. (Codex, 2026-11-25.)
- The first text action in a question starts on the prompt's leading edge.
- Menu controls share one centered row when there is space for all of them.
  On smaller screens, keep rows centered and align the icons within each row.
- Sign-in providers share the available row width equally.

## Access and behavior

Preserve accessible names, DOM contracts, keyboard order, the earlier-step
trail, and reveal provenance. Supplied help remains visibly attributed and
must not look like learner work. The tutor alone rates subskills through the
teaching policy. A visual state does not establish mastery.

Interactive controls hold at least 44px touch targets. Choice controls use their enclosing label as the touch target. Keyboard focus adds no outline, ring, or fill.
Preserve reduced-motion alternatives, safe-area spacing, adjustable text size,
and explicit as well as system light/dark preferences. Code and tables scroll
within their own regions, never across the whole page.

## Motion

Use Magic UI’s Animated Shiny Text for the Thinking and Transcribing states.
Keep animation off when the learner requests reduced motion.
When a conversation starts or reopens, the wordmark fades in place. The
dot stays visible and the full name returns on hover or keyboard focus.
Motion uses opacity, blur, and scale, never width, height, or position, so the
conversation never moves when a control appears or a reply ends. Springs use
`--spring-pop` from `styles.css`. The composer hint blurs in on focus, and the
send arrow sinks while the tutor has the turn, then pops back.

## Browser support

Use Baseline Widely available features freely. Newly available features need
feature detection and graceful degradation. Add fallback code only when it
fits within 20 lines and adds no dependency. Otherwise redesign or skip it.

## Owners and checks

`transcript.css` owns conversation layout. `questionnaire.css` owns question
and consent styling. `reveal-mark.css` owns supplied-help attribution.
`login.css` owns sign-in appearance. `history.css` owns the History page:
rows and hairlines on paper, with the open conversation marked by a verdigris
rule and the words "Open now" in full ink. It leaves by "Back to conversation". Other UI styles use the shared tokens.
The three pages render to HTML at build time. React hydrates chat and sign-in.
The 404 links work with JavaScript disabled. Shared shadcn/ui controls live in
`src/ui/components/ui/`, with Magic UI in `src/ui/components/magicui/`.

Run `pnpm check` and `REVEAL_BROWSER=1 pnpm smoke`. Compare conversation,
question, and consent screenshots at 390px and 1280px in both themes. Screenshots
show appearance, not learning effectiveness or operator acceptance.
