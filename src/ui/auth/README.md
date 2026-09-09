# Demo login

Vanilla `/login.html` preview ported from the `auth-preview-draft` tag on
`socratink-landing-page`. No real auth — a localStorage flag unlocks the chat.

## Flow

1. Visit `/` without `socratink-demo-auth` → redirect to `/login.html`
2. Email continues to a fake “link sent” panel, then **Continue**
3. Google / GitHub buttons skip straight into the app
4. Menu **Sign out** clears the flag via `/login.html?signout=1`

## Files

- `../login.html`, `../login.ts`, `../login.css` — page
- `../demo-auth.ts` — session helpers
- `../brand-wordmark.png` — shared product wordmark
