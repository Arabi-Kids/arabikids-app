# ArabiKids release plan: 12:00 am Malaysia time (MYT), 2026-10-22

Scope chosen by Jimmy: everything, including the Arabic/Malay wording, the 277 Arabic narration clips and the adhkar stage. Nothing below has been run yet.

## What is live today vs what this release changes
- Live site: arabikids.online on Cloudflare Pages. Pushing to `main` on GitHub deploys it automatically (Cloudflare Pages and Workers Builds show as checks on `main`).
- Live database today: 165 `content_items`, all `draft`; 851 `audio_assets`, all `pending`; 3 characters. Public visitors only see `approved` content, so the new Letters and Practical Life pages show "coming soon" until the go-live steps below.
- This release adds the code (letter loop, Practical Life stages 1-10, characters, music, Arabic/Malay wording, animated pictures, admin review pages) and 1,158 voice clips (56 MB).
- Backup of the live tables before any change: `../arabikids-live-backup-2026-10-21/` (content_items, audio_assets, characters).

## Scheduled (Claude desktop app, must be open and awake; if closed, each task runs when the app next opens)
- 12:00 am MYT, 22 Oct: `arabikids-release-2026-10-22` runs the release steps below and stops at the first failure.
- 12:30 am MYT, 22 Oct: `arabikids-announcement-2026-10-22` sends the approved push (to the 4 subscribed devices) and email (41 parents) from the admin portal, only if the release is verified live.
- Also in this release: "Sing along" songs on all 28 letters (frontend/public/audio/songs, 56 files, AI-sung with ACE-Step, take 2 in Arabic and English; Malay uses the English one), the home page "What's new" section (English, Arabic, Malay) and a line-break fix for announcement emails.

## Checked on 2026-10-21
- `vite build` passes, also on a clean checkout without the local-only fixture file (this was a real build breaker, fixed: the fixture is now loaded with `import.meta.glob`, so the Cloudflare build cannot fail on it).
- All 20 preview pages load and step through in English, Arabic and Malay with no errors; text scan found no reviewer notes or internal codes in kid-facing text.
- No secrets in the files to be committed (only placeholders in `.env.example`).
- Stripe webhook `https://arabikids.online/api/stripe-webhook` answers (400 to an unsigned test, as it should).
- `frontend/public/audio/lesson/` holds all 1,158 clips (859 approved earlier + 277 Arabic + 22 adhkar), including the slower chants and fixed sentence clips.
- Dry runs pass: `import-content-pack.mjs --dry-run`, `approve-content.mjs`, `publish-audio.mjs`.

## Before midnight
1. Stripe webhook: confirmed by Jimmy, the event destination is `https://arabikids.online/api/stripe-webhook`. Done.
2. Nothing else to decide: all items go live (the 165 already in the database plus the 24 adhkar), including letter 22 (the dog word, as in the pack) and the 12+ wudu breaker rules (shown only to children aged 12 and over).

## Release steps (in order, from the `arabikids-app` folder)
1. Add the new rows (draft, invisible to children): `node scripts/import-content-pack.mjs "..\arabikids-content-pack-draft.md" "..\arabikids-adhkar-draft.md"`
2. Commit and push to `main`. Cloudflare builds and deploys; wait until both checks are green (about 2-4 minutes).
3. Open https://arabikids.online and check the home page, a lesson and the pricing page.
4. Mark the clips approved in the live database: `node scripts/publish-audio.mjs --include-arabic-narration --include-adhkar --apply`
5. Go live: `node scripts/approve-content.mjs --apply` (approves every item, 189 after step 1)
6. Smoke test as a logged-in child in English, Arabic and Malay: Letter 1, wudu, prayer order, an adhkar card, music toggle, a Qur'an verse.

## Rollback
- Content back to hidden: `node scripts/approve-content.mjs --revert --apply` (everything returns to draft, the original state).
- Code: Cloudflare dashboard > Pages > Deployments > roll back to the previous deployment (instant).
- Audio: set `audio_assets.status` back to `pending` (backup lists the original state).
- Netlify files are still in the repo as the old rollback path.

## Still open after launch
- Reviewer sign-off on the adhkar, the Arabic/Malay wording and the Arabic clips (shipping them now at Jimmy's decision).
- Jimmy's own Qur'an recordings, and a commissioned illustrator, can replace the current ones later with no code changes.
