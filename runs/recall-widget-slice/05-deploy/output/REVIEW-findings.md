Checks: recall 3/3 and ink 1/1 passed. Browser and mutation checks were not run under the review restrictions.

Interfaces: added `createRecallSession(source): HTMLElement | undefined`, which owns extraction and the recall lifecycle; changed `createActiveTurn` behavior without expanding its signature; added `pnpm test:recall` to `check`; added the standalone browser-smoke command. No new flags or pass-throughs.

1. **`src/ui/recall-session.ts:86–88` — blocking.** Multiline definitions lose their reference or disappear. `**Term**: first line\ncontinued meaning` reveals only “first line”; an indented list continuation makes the entire entry fail the regex. Parse complete definition entries, preserving continuation text. Add public-turn regressions asserting the full revealed reference for paragraph and list forms.

2. **`src/ui/recall-session.css:102–104` — blocking.** Recall hides history chrome but leaves `#jump-latest` available. Scrolling upward through a long reference activates the existing rounded “Latest” pill, violating the explicit no-pills constraint. Suppress that control during active recall, or provide a paper-and-ink equivalent. Extend browser coverage with overflowing content and upward scrolling.

VERDICT: REQUEST CHANGES
