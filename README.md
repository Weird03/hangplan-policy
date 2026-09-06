# HangPlan website

Static site: landing page, support, privacy, terms, and the password-reset
handoff page. No build step — every file is plain HTML/CSS.

## Deploy on GitHub Pages

The site lives at https://weird03.github.io/hangplan-policy/ (repo
`weird03/hangplan-policy`, GitHub Pages from `main`).

1. Copy this folder's contents into the root of that repo. **Keep the
   existing `delete-account.html`** — it has the working sign-in + delete
   form and every page here links to it.
2. The old `index.html` (the privacy policy) is replaced by the landing page;
   the policy text now lives at `privacy.html`, unchanged.
3. Commit and push; Pages redeploys in about a minute.

## Supabase settings (fixes the localhost reset link)

Supabase → Authentication → URL Configuration:

- **Site URL**: `https://weird03.github.io/hangplan-policy/`
- **Redirect URLs** — add all three:
  - `https://weird03.github.io/hangplan-policy/reset-password.html`
  - `hangplan://reset-password`
  - `hangplan://confirmed`

The app asks Supabase to send reset links to `hangplan://reset-password`.
If you'd rather the email open the website first (works even when the app
isn't installed yet), change `redirectTo` in `src/screens/LoginScreen.tsx`
to the `reset-password.html` URL above — that page forwards to the app.

## Fill these in

Point the "Get it on the App Store" link (`#store-link` in `index.html`) at
the App Store URL once the listing is live. `terms.html` is a draft — worth a
read-through before the listing points at it.
