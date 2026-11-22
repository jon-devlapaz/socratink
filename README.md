# Socratink

Socratink is a single-learner AI conversation that runs on
[Pi Durable](https://github.com/earendil-works/pi/tree/main/packages/durable).
It supports open dialogue, structured
question cards, and records of assistance. See [PRODUCT.md](PRODUCT.md) for
the current boundary and the [North Star](NORTH-STAR.md) for the intended
direction.

## Run locally

Use the Node.js and pnpm versions specified in `package.json`.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

`pnpm dev:phone` exposes the development server to the local network. The operator model defaults to an OpenAI-compatible endpoint at
`http://127.0.0.1:3001/v1`. Configure `JON_LOCAL_BASE_URL`, `JON_LOCAL_API_KEY`,
and optionally `JON_LOCAL_MODEL_ID` for your endpoint. Do not commit values.

Local conversation and authentication databases use separate SQLite files
under `.cache/`. Configuration owners are `src/config/database.ts`, `auth.ts`,
`session.ts`, and `src/inference/operator.ts`.

## In-app feedback

Set `VITE_MODEM_FEEDBACK_TOKEN` in `src/ui/.env.local` for local use. In Vercel,
set it on the Socratink project and build a new deployment. This channel token
is public and included in the browser build. Manage it in Modem under
Settings → Integrations → In-app feedback.

Open **Feedback** from the main menu. Guests can include a name and email.
For a signed-in user, Socratink uses the account email. The tutor can offer
to send a report through Modem and waits for the learner to approve the draft.

## Identity, models, and hosted configuration

The app creates a signed guest session. Its allowance is set by
`guestTurnLimit` in `src/config/guest-turns.ts` and leads to sign-in when OAuth
providers are configured. Google and GitHub sign-in use
the matching `*_CLIENT_ID` and `*_CLIENT_SECRET` settings plus
`AUTH_REDIRECT_BASE_URL`; see [the authentication flow](src/ui/auth/README.md)
for account linking and the limits of the guest allowance.

Conversations are scoped to the session user and permitted aliases.
Model routing is owned by `src/inference/`. Every learner uses the operator
route. Saved model selections do not change that route.

Merges to `main` deploy to production. A preview deploy alone does not.
Keep the database and `SESSION_SECRET` to preserve users, cookies, and history.

Production and Vercel deployments require `DATABASE_URL` and `SESSION_SECRET`.
Vercel always uses AI Gateway. Gateway credentials come from
`AI_GATEWAY_API_KEY` or `VERCEL_OIDC_TOKEN`. Without either, inference is
unconfigured: `/healthz` returns 503 and a send is refused with
`inference_unconfigured`. Non-Vercel runs keep the `JON_LOCAL_*` settings.

Use private database connectivity. Local checks do not validate deployed
identity settings, external providers, multi-instance hosting, or suitability
for a particular learner population.

## Verify

```sh
pnpm check
pnpm smoke
pnpm smoke:durable
pnpm test:durable:postgres
pnpm smoke:durable:postgres
pnpm audit --prod
```

`pnpm check` runs the current type, contract, build, and static-routing checks.
`pnpm smoke` starts local processes with a deterministic fake model provider;
it requires no external credentials. The complete command list is in
`package.json`. Builds write generated output to `dist/` and `dist/client/`.

Set `REVEAL_BROWSER=1` when running `pnpm smoke` to include browser interaction
checks. They use the `playwright` dev dependency; `CHROME_PATH` and
`PLAYWRIGHT_MODULE` can point to existing installations. Screenshots and results
are saved under `.cache/reveal/`.

To verify PostgreSQL restart and rollback, build the candidate and previous
revision in separate directories, then run:

```sh
pnpm smoke:postgres --candidate <candidate-root> --baseline <previous-root> --out .cache/postgres-proof
```

This needs a running Docker daemon and a locally available `postgres:17-alpine`
image. It creates and removes its own database container, uses synthetic OAuth
and model responses, and saves a report of session and conversation recovery.
The previous build runs against a disposable copy of that test data.

### Tutor behaviour eval

`pnpm eval:tutor --live` runs scripted learner conversations against the real
tutor model through the durable engine, tools, and consent card. It checks what
the learner sees: one question per turn, reveals marked with `mark_reveal`, no
internal notes (#136), and "just tell me" shown without a consent card (#133).
It calls a paid model, so it refuses to run without `--live`.

```sh
VERCEL=1 AI_GATEWAY_API_KEY=... pnpm eval:tutor --live --runs 3
pnpm eval:tutor --list
```

Without `VERCEL=1` it uses the `JON_LOCAL_*` model. `--only` picks scenarios by
name. Transcripts and results go to `.cache/tutor-eval/`. A failed check exits 1.
Rules live in `src/learning/behaviour-rules.ts`, each quoting the system prompt
sentence it tests; scenarios and checks live in `evals/tutor/`.
`pnpm test:tutor-eval` (part of `pnpm check`) proves each rule's check fails on a
scripted buggy tutor and passes a policy-following one, with a fake model.
The checks are text heuristics over synthetic runs: a pass does not establish
teaching quality or learning effectiveness.

For an interaction check, start a conversation, complete an open-ended turn
and a question card, inspect the earlier-step trail, and reload to check
restoration. Check assistance markings when the tutor supplies target content.
These checks establish only the covered software behavior, not retention,
transfer, mastery, or learning effectiveness.

## Runtime failure alerts

The `Socratink runtime monitor` workflow checks production availability and
queries Vercel runtime errors and HTTP 5xx responses each time it runs. Failed or
incomplete reads fail the job and use GitHub Actions failure notifications.
The monitor uses Vercel's project log API and rejects responses with more
pages or truncated messages.
Enable email notifications for failed Actions runs in your GitHub settings.
The application logs constant failure categories for failed chat submissions
and recovery failures, including failures after an HTTP 202 admission. The
monitor publishes counts only; it never copies Vercel error bodies, request
paths, learner text, or credentials into public Actions logs.

Pi emits the same failure categories for model retries and interrupted turns.
Provider error bodies are not logged. Request failures get a generic response.

Configure `VERCEL_TOKEN` as an environment secret in `runtime-monitor`, which
is restricted to `main`. Use a token scoped to the Socratink Vercel project;
Vercel project-scoped tokens are not read-only. For a controlled preview drill,
use the separately reviewed `runtime-monitor-verification` environment and the
workflow's `preview_deployment` input. Never place this credential in source,
repository-wide secrets, or pull-request CI.

Vercel Schedules starts the production workflow every 15 minutes through the
private `api/runtime-monitor.ts` function. Hobby adds up to 15 minutes of delay.
The function only dispatches this workflow on `main`; preview deployments do
nothing. GitHub's own schedule remains a fallback. It produced gaps of 4–9
hours in November 2026, so it cannot cover the 45-minute log window alone.

Configure `MONITOR_GITHUB_TOKEN` as a sensitive **Production-only** environment
variable in the Vercel project `socratink-learner-app`, then deploy. Use a
fine-grained GitHub token limited to `jon-devlapaz/socratink` with
`Actions: read and write`. Enter it directly in Vercel; do not place it in
source, preview variables, or chat. Set an expiry and rotate it before that
date. This token can start and cancel repository workflows. It does not grant
code or secret access. The Vercel log token stays in GitHub.

After deployment, check the Vercel schedule's execution history and confirm
several automatic GitHub monitor runs. The private function has no public URL;
a public HTTP request must not dispatch a workflow. It logs only constant
failure categories. Dispatch failures return a failure status in the schedule
history; Vercel does not retry function targets. The GitHub fallback can report
those failures when it next runs.

The workflow also checks the previous successful production runtime scan.
If none started within 45 minutes, or GitHub history cannot be read, the job
fails. Preview drills cannot satisfy this check. The first run after a gap can
fail even when the current scan is clean; that clean scan lets the next run
recover. This reports a gap after execution resumes; it cannot send an alert
while both schedulers are stopped.

GitHub schedules activate only on the default branch and can be delayed or
dropped; public-repository schedules stop after 60 days without activity. The
45-minute query window deliberately overlaps runs; the same failure can alert
more than once. Vercel Hobby retains runtime logs for one hour, so a long
scheduler outage can lose evidence. The log API does not report gaps within
returned history. This is a basic failure monitor, not an on-call guarantee or
a check of model quality. It makes no model calls.

Vercel Schedules also runs the private `api/tutor-probe.ts` function once a day
at 13:00 UTC, in production only. It makes one real call through the same
gateway, model, key and output limit as a learner's turn, with the fixed prompt
"Reply with the single word: ok" and no learner data. After a 429 it waits 5
seconds and tries once more. A reply without text, a timeout after 60 seconds or
any other status logs `probe_failed` with the provider's HTTP status only. The
runtime monitor then fails its next run. The probe costs about one cent a month.
It checks the gateway, provider and request shape, not the chat engine.

Each Vercel preview build ends with the same call (`scripts/preview-probe.mjs`).
If it fails, the build fails and prints the provider's HTTP status only, so a
preview whose model call fails never reaches a taster. Production and local
builds call nothing. It costs one tiny call per preview build.
