# FM-DOGFOOD-01

- **As-of:** 2026-09-15 22:51 CT  
- **Job:** FM-DOGFOOD-01 · Chrome DevTools dogfood · research-only · no PR  
- **Target:** https://app.socratink.ai  
- **Note:** Prod includes OpenRouter max_tokens cap (#17) per Firstmate  
- **Author:** loops  

## Executive summary

**J1 FAIL (P0, product)** on both unsigned passes: cold open redirects to `/login.html`. Chat/composer never loads for an unsigned learner. Hygiene on the login page itself looks clean (no secrets, no console errors, strong Lighthouse). **J2–J5 blocked** until a signed session (captain box help / SSO).

## Journey status

| Journey | Pass 1 | Pass 2 | Status |
| --- | --- | --- | --- |
| J1 Cold open unsigned | **FAIL P0** | **FAIL P0** | Login wall; Chat not reached |
| J2 Signed Chat turn | blocked | blocked | Needs signed session |
| J3 Key path | blocked | blocked | Needs signed Chat |
| J4 Fail-closed identity | blocked | blocked | Needs signed / instrumented path |
| J5 Hygiene (full Chat) | partial | — | Login-page hygiene only so far |

## Findings (ranked)

### F1 — Unsigned Chat unreachable (P0 · product · blocks learning)

| | |
| --- | --- |
| **Steps** | Incognito → `https://app.socratink.ai` (×2) |
| **Expected (J1)** | Chat loads; composer empty; smoke/jon-local path usable unsigned |
| **Actual** | Redirect to `https://app.socratink.ai/login.html` — “Welcome back / Log in to continue learning” (email, Google, GitHub). No Chat UI. |
| **Severity** | **P0** — blocks unsigned learning / smoke dogfood as specified |
| **Class** | Product (auth gate) — confirm if intentional vs regression vs journey assumption wrong |
| **Evidence** | Run1/2 UI screenshots; Network only `login.html` + 2 JS + CSS + brand PNG, all `304` |

### F2 — Login page metrics mostly healthy (P2 polish)

| Metric | Value | Note |
| --- | --- | --- |
| Lighthouse Perf / A11y / BP / SEO | 100 / 95 / 100 / 91 | mobile |
| FCP / LCP / TBT / CLS / SI / TTFB | 0.9s / 1.0s / 0ms / 0 / 0.9s / 60ms | |
| DevTools LCP / CLS | 0.26s / 0 | local |
| Coverage cold | 45% used / 55% unused (8.8/19.3 KiB) | CSS unused 54.1%; login JS unused 62.3% |
| Warm CSS used | ~46% | |
| Memory JS heap | ~2.8 MB | login only; no Chat turns |
| Console / Issues | empty / “No Issues” | |
| Storage | no cookies, localStorage, sessionStorage; no SW | |
| Security | HTTPS TLS 1.3; no mixed content; no tokens in query | |
| Cache | `public, max-age=0, must-revalidate`; Vercel HIT | |
| Network | 5 first-party; no 4xx/5xx; no Fetch/XHR/SSE/WS; no slow >1s | expected for static login |

**P2 inefficiencies / a11y:** render-blocking 4.5 KiB CSS; image missing explicit dimensions; one non-composited animation; low contrast on “or” separator; missing meta description.

### F3 — Cannot validate Chat stream / keys / identity (blocked)

J2–J4 require signed Chat. No credentials invented. Awaiting captain box help / SSO per Firstmate standing rule.

## Screenshots (box assets)

Under agent assets (J1 UI/Console/Network ×2 + Lighthouse/Coverage/Memory/Security). Paths recorded in dogfood run log; copies may be mirrored under `/workspace/dogfood/FM-DOGFOOD-01/`.

## Next

1. Captain signed session on box (Google/GitHub/email) via Firstmate → resume J2–J5 + Chat-turn memory/stream metrics.  
2. Clarify product intent: is unsigned Chat deliberately gated? If yes, rewrite J1 expected to “login wall is pass” and move smoke to signed or dedicated unsigned smoke URL.
