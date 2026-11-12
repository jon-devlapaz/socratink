# Existing interface conventions

This document guides changes to the current conversation UI. Product direction
belongs to the [North Star](socratink-brain/NORTH-STAR.md); these conventions
describe the existing interface, not future capabilities.

## Readability and appearance

- Keep the learner's work and current conversation easy to read. Use compact
  vertical spacing without hiding required context or interactive controls.
- Use the existing paper/ink palette and jade action accent. The actual theme
  tokens live in `src/ui/styles.css`; reuse them instead of copying color values.
- Use Paper Mono for dialogue and controls. It is bundled in `src/ui/fonts/`
  under the SIL Open Font License 1.1 (`OFL.txt` there). It has no italic,
  so the browser slants emphasis. Use monospace for code, and the existing
  display serif only for introductory or empty-state copy.
- Keep code, tables, and mathematics readable without forcing the whole page
  to scroll horizontally. Preserve light/dark themes and adjustable text size.
- Preserve keyboard focus, accessible control names, reduced-motion behavior,
  touch targets, and safe-area spacing. Check narrow screens as well as desktop.

## Existing surfaces

- **Conversation:** `chat-surface.ts`, `turn-view.ts`, and `transcript.css`
  own the active turn and earlier-step trail. Pending, cancel, recovery, and
  error feedback stays visible in the conversation, one block per request.
  Learner turns show the learner's own words: a card answer shows the answer,
  and a steering control shows its short line, while the tutor receives the
  full message. An answered card-only turn shows the question it asked.
- **Question cards:** `questionnaire.ts` and `questionnaire.css` render
  structured choices, learner reasoning, and the Hint and "I don't know"
  buttons within the flow.
- **Dictation:** `dictation.ts` and `dictation.css` provide input states; do
  not describe dictation as an autonomous voice tutor.
- **Sign-in:** `login.html`, `login.ts`, and `login.css` show configured OAuth
  providers. The current flow has no email field; see
  [the authentication flow](src/ui/auth/README.md).

Use adjacent components before inventing a new visual pattern. Change DOM
contracts together with their consumers and relevant checks. UI wording must
describe the actual state and must not imply learning or mastery from an
animation or completion state. Mastery ratings come only from the tutor's
skill map.
