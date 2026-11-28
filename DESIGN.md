# Socratink conversation

Socratink should feel like an open book with room to write. The active
conversation rests directly on the same warm paper as the landing page. Give
the current question and the learner’s own words the clearest space on the
page. A change in type, a margin, or a fine rule is usually enough to show
where the next part begins.
[Landing page design](https://github.com/jon-devlapaz/socratink-landing-page/blob/main/DESIGN.md)

## Paper and ink

In light mode, set carbon ink (`#100f0f`) on warm cream (`#fffcf0`).
In dark mode, set pale ink (`#cecdc3`) on carbon. Use graphite for supporting
text and a slight change in paper tone for a control. The default dividing
line is one pixel of ink at 10% opacity. Keep the sign-in page’s grain faint.
[Theme colors and type](src/ui/styles.css)

Reserve verdigris teal for an action or state the learner needs to find.
The Send arrow sits on a teal circle. A selected answer has a light teal wash
and a fine rule at its leading edge. In History, the same rule and the words
“Open now” identify the current conversation. Use red for an error.

## Type and margins

Use Newsreader at regular weight for headings, structured tutor questions,
and quotations. Use Inter for explanations, the learner’s writing, and
controls. Set code, keyboard shortcuts, and attribution labels in monospace.

Keep the conversation in one column, up to 580px wide. Align the current
turn, the text in the composer, and the dictation status to the same 1.25rem
inset. Start the first text action under a question on the question’s left
edge. The header shares the landing page’s 72rem width and side margins of
1rem on phones and 2rem from 640px up.

## Reading and writing

On the opening page, place a heading and a short invitation above the writing
field. The three starters sit below it. Choosing one puts words in the draft
and returns focus to the field. The learner decides when to send.

Give a question a fine rule above and below it. Set the choices in rows with
a divider between them. Mark help with a label such as “Hint from Socratink”
and a 2px rule in the margin. Use ochre for both. Set the explanation in
ordinary text ink and align it with the label and the question below.

Use the bookmark beside “Earlier steps” to reopen earlier work. In History,
give each conversation a row with a fine divider. On sign-in, place the
provider buttons side by side at equal widths when space allows.

## Controls and motion

Give the writing field a paper fill and a hairline edge. Use an ink-filled
pill for the main action, a paper pill for a secondary action, and a plain
control for tools such as Hint. For the choice to reveal an answer,
“Try once more” is primary and “See it” is secondary.

Give each control a touch target at least 44px high. Make the whole choice label
selectable. Keep keyboard and reading order together. Underline the label
when a question action or sign-in provider has keyboard focus. Preserve
accessible names. Let headings and button labels wrap at larger text sizes.
On a short screen, keep the writing field and its actions reachable. Let wide code and
tables scroll within the reading column.

Keep the question in place as controls appear or a reply ends. During a
conversation, the wordmark fades to its ink dot. The name returns on hover
or keyboard focus. Thinking and Transcribing remain
readable as plain text with reduced motion. Support the learner’s text size
and their choice of light, dark, or system appearance.
