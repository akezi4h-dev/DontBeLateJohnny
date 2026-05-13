# AI Direction Log
### Shift Stack — AI 201 Project 3
*Each entry documents what was asked of AI, what AI produced, and the editorial decision made.*

---

## Entry 01 — Establishing Ground Rules Before Any Build

**Asked:**
Before sharing the PRD, established a constraint: "do not build out anything until I give you documentation on the assignment and the class. We start with questions."

**Produced:**
AI asked five clarifying questions: what the assignment required, what "creative coding" meant in this class, whether AI integration was technical or conceptual, what tech constraints existed, and the deadline/scope.

**Decided:**
This set the correct working relationship from the start. AI was positioned as an executor responding to research, not an inventor generating features. The questions it asked back confirmed it understood the frame. The constraint was necessary because AI defaults to building immediately on vague prompts — holding it back until the PRD was ready prevented speculative scaffolding that would have needed to be torn down.

---

## Entry 02 — PRD Drop and Scope Triage

**Asked:**
Dropped the full Shift Stack PRD — a 10-section product requirements document grounded in direct research with Johnny Truong, including quotes, behavior observations, employer color decisions, data models, and milestone dates.

**Produced:**
AI parsed the full document and identified three blockers before starting: GitHub username (for Pages deployment), which branch to work on, and how complete the prototype needed to be for the May 13 first contact session.

**Decided:**
Answered directly: repo is `DontBeLateJohnny`, work on `main`, and prioritize Month View + Shift Card only for tomorrow's session. This was an active scope call — the PRD specifies four screens plus PWA plus OneSignal, but a first contact session only needs the two screens Johnny would interact with first. Building the full PRD on a deadline would have produced an untested product. Constraining to two screens produced something testable.

---

## Entry 03 — Technology Stack Confirmation

**Asked:**
Confirmed the stack specified in the PRD: React + Vite + Tailwind CSS + PWA manifest + service worker + OneSignal + GitHub Actions deployment.

**Produced:**
AI scaffolded the full project structure: `package.json`, `vite.config.js`, `tailwind.config.js`, `postcss.config.js`, `index.html`, `src/` tree, `public/manifest.json`, `public/sw.js`, SVG icons, and GitHub Actions deploy workflow. Build succeeded on first attempt.

**Decided:**
Accepted the scaffold as-is. The base path `/DontBeLateJohnny/` was correctly derived from the repo name. The font pairing (Syne for display, Space Grotesk for body) and employer color hex values (#00A651 Publix green, #CFB87C Vanderbilt gold, #2D6DB5 Nashville General blue) were pulled directly from the PRD without drift. No invented features were added.

---

## Entry 04 — Seed Data Decision

**Asked:**
Did not explicitly ask for seed data. Directed AI to build Month View and Shift Card.

**Produced:**
AI included 12 pre-populated shifts across May 2026 in `useShifts.jsx` with a note: "Seed data so the app looks real for first contact on May 13."

**Decided:**
Kept the seed data. The decision was correct for the testing context — putting an empty calendar in front of Johnny for first contact would have made it harder to evaluate the visual system (color dots, shift card layout, time display). The seed data included all three employers across multiple days, which let Johnny see the full color differentiation in one glance. This was AI anticipating a user testing need correctly without being asked.

---

## Entry 05 — GitHub Pages Configuration Diagnosis

**Asked:**
Reported the site wasn't working after GitHub Actions ran green.

**Produced:**
AI ran a curl check, confirmed 404, fetched the gh-pages branch to verify the build landed correctly, then identified the problem: Pages was not configured to serve from the `gh-pages` branch. Directed to Settings → Pages and provided the exact URL `github.com/akezi4h-dev/DontBeLateJohnny/settings/pages`.

**Decided:**
Followed the diagnosis. The key editorial judgment was not assuming the code was broken — AI correctly distinguished between a deployment problem (Pages source config) and a build problem (bad code). That distinction saved time that would have been spent debugging correct code.

---

## Entry 06 — Supabase Addition (Beyond Original PRD)

**Asked:**
"I want to add Supabase" — expanding scope beyond the original PRD, which specified localStorage only.

**Produced:**
AI asked two scoping questions before touching any code: what Supabase was for (sync vs auth vs both) and what OCR service to use.

**Decided:**
This was the right gate. The scope change was significant — it touched every data layer in the app. AI not immediately building prevented it from making assumptions about auth flow, data model, or OCR service. The answers given (sync + OCR, login screen, Apple Vision) shaped the entire implementation. Forcing the questions produced a better-scoped build.

---

## Entry 07 — Apple Vision Framework Redirect

**Asked:**
Specified Apple Vision Framework as the OCR technology.

**Produced:**
AI flagged a technical constraint: Apple Vision Framework is native iOS only and inaccessible from a PWA or web browser. Offered three alternatives with a comparison table: Claude vision API (best accuracy, costs ~$0.01/image), Google Vision API (very good, ~$0.0015/image), and Tesseract.js (decent for clean text, free, runs in browser).

**Decided:**
This was a genuine technical correction, not AI preference. Apple Vision Framework cannot be called from Safari or any PWA. The redirect was necessary. The alternatives table gave enough information to make a real choice, rather than just substituting one technology without explanation.

---

## Entry 08 — Choosing Tesseract.js Over Paid OCR

**Asked:**
"How easy would Tesseract.js be — I am broke."

**Produced:**
AI gave an honest assessment: easy to add, but parsing is the hard part. Tesseract extracts raw text; a separate parser has to interpret which text is a date, which is a time, which is an employer. Since Johnny's screenshots come from only two known systems (Science Provider and Teams), custom parsers are feasible but brittle. Recommended stubbing the upload button for today's session and building the full parser after hearing Johnny's reaction.

**Decided:**
Rejected the stub recommendation. Directed AI to wire Tesseract fully today. This was a deliberate call — having a working (even imperfect) upload feature in front of Johnny tomorrow gives real feedback on whether he would use it, how he photographs his schedule, and whether parsed results make sense to him. A stub button proves nothing in a user session.

---

## Entry 09 — Session Persistence Request

**Asked:**
"Email + password, but remember when he's logged in and don't ask him to login again."

**Produced:**
AI explained that this behavior is already built in — Supabase Auth stores sessions in localStorage by default and auto-refreshes tokens. No code change needed. Noted the default expiry is 7 days of inactivity and that it can be extended in Supabase dashboard under Authentication → Settings → JWT expiry.

**Decided:**
Extended to 90 days. Johnny's use pattern (daily, across two devices) means a 7-day timeout would constantly expire during weekends off or schedule gaps. 90 days matches realistic usage without requiring a permanent session (which would be a security anti-pattern for a healthcare-adjacent app).

---

## Entry 10 — Desktop Navigation Gap

**Asked:**
After seeing the live app: "no bottom nav."

**Produced:**
AI identified the issue: `BottomNav` has `md:hidden` — it correctly disappears on desktop, but no desktop-equivalent navigation existed. Added upload and add icons to the MonthView top bar as `hidden md:flex` elements, sitting between the month title and the forward arrow. Mobile keeps bottom nav, desktop gets header icons.

**Decided:**
Accepted the fix. The placement is correct — it puts actions near where the user's attention already is (the month header) rather than adding a separate sidebar that would complicate the two-column layout. The icons use the same SVG language as the rest of the UI.

---

## Entry 11 — iOS Calendar Screenshot Parsing Failure

**Asked:**
Uploaded an iOS Calendar screenshot ("Your shifts / Pharmacy (CDT)") showing May and June shifts. The OCR upload returned no results — zero shifts parsed.

**Produced:**
Diagnosed the mismatch: `parseSchedule.js` expected dates in "May 16" or "5/16" format, but the iOS Calendar layout puts the month name as a standalone section header ("May") and the day as a bare number on its own line ("16" or "16SAT"). The parser had no concept of stateful month tracking and couldn't associate "16" with May. Also confirmed the time format "9:30 AM – 6:00 PM (CDT)" was compatible with the existing range regex once a date was found.

Fixed by adding two behaviors to `parseScheduleText`: (1) when a line matches a standalone month name, store `currentMonth`; (2) when a line matches a bare 1–2 digit number optionally followed by a day abbreviation, and `currentMonth` is set, construct the full ISO date from `currentYear + currentMonth + day`. Also added skip logic for "All Day" and "Off" lines to avoid false positives.

**Decided:**
Accepted the fix. The real source of the failure was that the parser was written for Science Provider and Teams screenshot formats, not the native iOS Calendar app. Johnny is evidently exporting directly from iOS Calendar, not a scheduling system. The fix handles both formats without breaking the original logic.

---

## Entry 12 — Console Noise Cleanup (Icon 404, OneSignal, Deprecated Meta)

**Asked:**
Shared browser console output showing three non-OCR errors: `icons/icon.svg` 404, "AppID doesn't match existing apps" from OneSignal, and a deprecation warning on `apple-mobile-web-app-capable`.

**Produced:**
Identified all three causes: (1) the `public/icons/` directory was created but never populated — the favicon and manifest both referenced SVG files that didn't exist; (2) the OneSignal CDN script was scaffolded in `index.html` at project setup but never initialized with an AppID, causing the SDK to throw on every page load; (3) `mobile-web-app-capable` is the current standard, with `apple-mobile-web-app-capable` kept alongside for iOS Safari compatibility.

Fixed by creating `public/icons/icon.svg` (horizontal bars in the three employer colors on a dark background), copying it to `icon-192.svg` and `icon-512.svg` for the manifest, removing the OneSignal script tag entirely, adding `mobile-web-app-capable`, and pointing the apple-touch-icon at the SVG instead of a missing PNG.

**Decided:**
Accepted all fixes. OneSignal was removed rather than stubbed — it was never configured and has no AppID, so keeping it only produces noise and loads an unnecessary CDN script on every page view.

---

## Entry 13 — Tesseract Fails on Dark UI Screenshots

**Asked:**
Pasted the `[OCR raw]` console output after uploading the iOS Calendar screenshot. The extracted text was almost entirely garbage — day abbreviations and month names came through, but date numbers and the time range "9:30 AM – 6:00 PM (CDT)" were completely lost.

**Produced:**
Diagnosed the root cause: Tesseract is trained on dark text on light backgrounds. iOS Calendar uses dark mode — light text on a near-black surface (#1c1c1e). Passing the image directly inverts Tesseract's assumptions and produces noise. Fixed by adding a `preprocessForOCR()` function that draws the file to a Canvas at 2x scale (to make small phone text larger) then inverts all RGB pixel values before passing the canvas to Tesseract instead of the raw file.

**Decided:**
Accepted the fix. The image inversion is the standard workaround for OCR on dark-mode UI screenshots. The 2x scale addresses a secondary issue — phone screenshots at native resolution have small text that Tesseract struggles with even on good backgrounds.

---

## Entry 14 — Switch OCR from Tesseract to Claude Haiku via Edge Function

**Asked:**
After multiple failed Tesseract attempts (parser format mismatch, color inversion, binarization, PSM 11), asked whether the Claude API would be easier and what it costs. Decided to switch after confirming cost is ~$0.002/image via Claude Haiku — under $0.10/month for Johnny's usage.

**Produced:**
Created a Supabase Edge Function (`extract-shifts/index.ts`) that accepts a base64 image and media type, proxies it to `claude-haiku-4-5-20251001` with a structured prompt requesting a JSON array of shifts, and returns the raw response. Rewrote `OCRUpload.jsx` to encode the file as base64, call the Edge Function via `supabase.functions.invoke`, and map the returned `{ date, startTime, endTime, role, location }` objects to the app's shift shape. Removed all Tesseract code, preprocessing, and the custom parser.

**Decided:**
Accepted the full replacement. Tesseract required format-specific parsers, image preprocessing, and PSM tuning — and still failed on real screenshots. Claude Haiku understands the image semantically and returns structured data directly. The Edge Function keeps the API key server-side. The entire OCR layer went from ~150 lines of fragile code to ~40 lines.

---

## Entry 15 — Edge Function Setup: Everything That Went Wrong

**Asked:**
Deploy the `extract-shifts` Supabase Edge Function and wire it to the frontend.

**Produced:**
A full deployment and debugging sequence spanning multiple hours and every layer of the stack. In order:

1. **No terminal access** — user's computer blocks terminal. Deployed via Supabase dashboard "Via Editor" instead of CLI.
2. **Secret not reaching the function** — `ANTHROPIC_API_KEY` was saved but Deno couldn't read it. Required redeploying the function after the secret was set. Supabase Edge Functions don't pick up new secrets until the next deploy.
3. **Model `claude-haiku-4-5-20251001` returned empty array** — because the API key wasn't working yet at that point, the error was silently swallowed and returned `[]`. Appeared as a parser failure, was actually an auth failure.
4. **Auth error exposed** — added error surfacing to the Edge Function. Confirmed `x-api-key header is required` — secret still not loading.
5. **Secret renamed and re-saved** — user confirmed name was wrong. Fixed to exact string `ANTHROPIC_API_KEY`.
6. **Model `claude-3-5-haiku-20241022` not found** — new Anthropic accounts in 2026 don't have access to Claude 3.x models. Switched to `claude-3-haiku-20240307`. Also not found.
7. **Switched to `claude-3-5-haiku-20241022` → `claude-3-haiku-20240307` → `claude-haiku-4-5-20251001`** — only Claude 4.x Haiku available on this account tier.
8. **Claude returned markdown-wrapped JSON** — despite explicit prompt instructions, Haiku 4.5 wrapped the response in ` ```json ``` ` fences. Added regex strip in Edge Function.
9. **Off/Holiday days included with null times** — Claude correctly identified all 10 calendar entries including non-shift days. Frontend crashed calling `formatTime(null)`. Added `.filter(s => s.startTime && s.endTime)` before mapping.
10. **First successful upload** — May 28 shift (09:30–18:00) parsed correctly and shown in review screen.

**Decided:**
Every fix was necessary and each one revealed the next real problem. The sequence wasn't wasted — it produced a hardened Edge Function with proper error surfacing, secret validation awareness, markdown stripping, and null-safe shift filtering.

---

## Entry 16 — Post-Import Crash and Wrong Year

**Asked:**
After the first successful OCR import, the app crashed to a white page and the shift landed on May 28 2024 instead of 2026.

**Produced:**
Two separate bugs found and fixed simultaneously. (1) `ShiftCard` was passing `empty_${date}` to `useTasks` when a day had no shifts — that string is not a valid UUID, so Supabase returned 400 which crashed React. Fixed by passing `null` instead, which the existing `if (!shiftId)` guard already handled correctly. (2) Claude inferred the year from screenshot context and returned 2024. Fixed by replacing the year in Claude-returned dates with `new Date().getFullYear()` before saving.

**Decided:**
Both fixes accepted. The `empty_${date}` pattern was a latent bug that existed before OCR was added — it just never surfaced because no one had clicked an empty day in production before. The year correction is a permanent necessity: Claude will always infer the wrong year from a screenshot that has no explicit year visible.

---

## Entry 17 — am/pm Instead of a/p

**Asked:**
"Can you make this am and pm" — screenshot showed "9:30a → 6p" on the shift card.

**Produced:**
One-line change in `formatTime` in `dateHelpers.js`: changed the period suffix from `'a'`/`'p'` to `'am'`/`'pm'`.

**Decided:**
Accepted. "9:30am → 6pm" reads naturally. "9:30a → 6p" was a shorthand that made sense in code but looked unfinished in the UI.

---
