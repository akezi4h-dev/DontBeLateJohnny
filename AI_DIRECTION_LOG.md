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
Accepted the scaffold as-is. Every stack choice served a specific requirement from the PRD rather than a default preference. React with Vite was the right call over Next.js — this is a client-side personal tool with no server rendering needs, and Vite's build output is a static bundle that GitHub Pages can serve directly. Next.js would have introduced a Node.js runtime dependency, dynamic routing, and deployment complexity that add nothing for a single-user app with five predictable screens.

Tailwind CSS was chosen over CSS modules or styled-components because the design system in the PRD is color-first — three employer colors dominate every UI decision. Tailwind's utility-first approach makes inline color application (`text-[#00A651]`, `bg-[#CFB87C]40`) faster to iterate than defining named classes per component. Speed of iteration matters for a product being built against a first-contact session deadline.

The font pairing was specified in the PRD and AI reproduced it exactly: Syne for all display text (numbers, shift times, hero labels) because its ultra-bold weight at large sizes creates clear visual hierarchy when glancing at a screen, and Space Grotesk for metadata (employer names, facility addresses, status labels) because it reads cleanly at small sizes without losing legibility. An AI with no constraint would have defaulted to Inter or Roboto — generic legible fonts that don't carry the visual weight the time-display cards require.

The employer color hex values (#00A651 Publix green, #CFB87C Vanderbilt gold, #2D6DB5 Nashville General blue) were pulled directly from brand documentation in the PRD. These are not approximations — each hex value reflects the actual employer brand. This matters for Johnny's recognition speed: he glances at a colored dot on the calendar and recognizes the employer without reading the name. If AI had generated approximate greens and golds, the recognition signal would be weaker. No invented features were added — every file created corresponded to a PRD requirement. The base path `/DontBeLateJohnny/` was correctly derived from the repo name automatically, which confirmed AI had read the deployment context of the PRD correctly rather than scaffolding a generic project.

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
Followed the diagnosis. The key editorial judgment was understanding which layer to debug first. When a GitHub Actions run shows green but the live site doesn't load, there are exactly three places the failure can be: (1) the build produced bad output, (2) the output was deployed to the wrong place, or (3) GitHub Pages isn't pointed at where the output landed. The Actions job was green — `npm run build` ran without error and the artifact was uploaded. That ruled out option 1. The `gh-pages` branch existed and had the built files. That ruled out option 2. The only remaining cause was option 3: Pages source configuration in repository settings.

Not assuming the code was broken prevented a detour through React error boundaries, Vite config changes, and base path debugging — all of which would have been solving the wrong problem. The build output was correct; the Pages source was misconfigured. This three-step diagnostic sequence (build correct? → deploy correct? → hosting config correct?) is a reliable debugging pattern for any static deployment that produces a blank page or 404 on a successful CI run. Recognizing which layer owns the failure is faster than exhaustively checking all layers from the bottom up.

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
Accepted the fix. Three alternatives existed for desktop navigation: a left sidebar, a hamburger menu, or a dedicated desktop nav bar. All three were worse choices for this specific layout.

A left sidebar would require a layout change at the `md:` breakpoint — the calendar grid would need to shift right to make room, and the two-column panel overlay already active on desktop would conflict with a persistent left rail. It would also mean maintaining two entirely separate navigation paradigms (sidebar on desktop, bottom bar on mobile) with no shared code.

A hamburger menu is anti-pattern for a six-item nav on desktop — it hides structure that users on large screens have room to see. Desktop nav should be persistent and visible, not buried behind a disclosure widget that adds an interaction step to reach any screen.

A second bottom nav is redundant — the bottom nav is already visible on `sm:` screens and hidden on `md:`, so replicating it for desktop would be a copy of the same component with no architectural reason to duplicate it.

The correct solution: expose Upload and Add Shift as `hidden md:flex` icons in the MonthView top bar, where the user's attention already is when they want to manage their schedule. The header placement is consistent with standard calendar app UI patterns — Google Calendar, Apple Calendar, and Fantastical all place the primary add action in or near the calendar header. The icons use the same SVG language as the rest of the UI, so no new visual vocabulary is introduced. The fix adds two elements visible only on desktop and touches zero mobile layout code.

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
Accepted all fixes. The OneSignal decision is the most consequential of the three. OneSignal was removed rather than configured or stubbed for two reasons.

First, OneSignal was never in scope for this build session. It was scaffolded in `index.html` at project setup because the PRD mentions push notifications as a requirement. But shipping push notification infrastructure requires an AppID, a Supabase webhook or cron job to trigger sends, user permission prompts, and cross-platform testing. That's multi-session work that wasn't ready. Leaving a misconfigured CDN script in place produced a console error on every page load and loaded a 300kb+ SDK for zero benefit — it was dead weight that actively degraded debugging sessions by introducing unrelated noise into the console.

Second, removing it sends the right signal about scope discipline: if it's not configured, it doesn't ship. A stub that throws "AppID doesn't match existing apps" is strictly worse than no integration — it implies the feature exists when it doesn't, and it pollutes the console with errors that obscure real problems. The correct pattern is: include a dependency in production only when it is doing something. Anything else is undeclared technical debt.

The icon fix and meta tag fix were straightforward but important for first-contact credibility. Creating `public/icons/icon.svg` used the same three-employer-color visual language as the rest of the app, so the favicon was consistent with the brand system rather than a missing-file placeholder. The `mobile-web-app-capable` / `apple-mobile-web-app-capable` pair ensures PWA behavior on both Android Chrome and iOS Safari, and removing the deprecation warning kept the console clean before Johnny's first session.

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

## Entry 18 — Three Screenshot Formats; Employer Selection Step

**Asked:**
Shared three types of schedule screenshots Johnny uses: Science Provider web calendar (light, blue tiles), Vanderbilt/Nashville General scheduling system (light, dashed borders, shows "2036" as the year in tiles), and iOS Calendar (dark mode). Requested the OCR flow be updated to handle all three, with a mandatory employer selection step before upload, the last selection remembered, and an improved Edge Function prompt that explicitly skips Off/RDO/Holiday entries.

**Produced:**
Full rewrite of `OCRUpload.jsx` with a new `employer` stage as the first screen. Shows all four employer options as color-coded buttons using the existing employer color system. Stores the last selection in `localStorage` and pre-fills it on the next visit. Upload area and progress bar tinted to the selected employer's color. Company name passed to Edge Function alongside the image. Employer used directly from selection — not guessed from image content. Employer badge added to each review card as a colored pill. Role shown as subtitle under the time. Empty result shows "No work shifts found — only days off detected in this screenshot." instead of generic failure. Edge Function prompt rewritten to name the company, state the current year explicitly, and list specific entry types to skip (Off, RDO, Holiday, all-day entries with no hours).

**Decided:**
Accepted. The employer selection step solves two problems at once: it replaces unreliable in-image employer detection and it forces intentionality before upload. The remembered selection removes friction for repeat uploads from the same workplace. The improved prompt addresses all three screenshot format failure modes identified from the real screenshots.

---

## Entry 19 — Custom Categories System

**Asked:**
Replace the hardcoded "Other" employer option with a fully custom category system. Each category: text name, color picker (preset palettes + custom hex), emoji picker (curated grid). Show a live preview before saving. Allow editing built-in categories (rename, recolor, re-emoji) — changes propagate to all existing shifts instantly since shifts store only the key. Add confetti burst on new category creation, celebration toast on successful import ("🎉 3 shifts added!"), preset color palettes (Neon, Pastel, Dark Mode, Retro), pulse animation on today's calendar dot, and slide-in animation on the shift detail panel.

**Produced:**
Seven new or updated files:

1. **`src/hooks/useCategories.jsx`** — New React Context. Stores all categories (built-in + custom) in a single `shiftstack_all_categories` localStorage key. Built-ins initialize on first load. Exports `getCategoryByKey(key)` (returns FALLBACK_CATEGORY if key not found — safe for existing Supabase records), `createCategory`, `updateCategory` (works on any category including built-ins), `deleteCategory` (blocked for built-ins). Exports `PALETTE_PRESETS` (Neon, Pastel, Dark Mode, Retro), `EMOJI_OPTIONS` (30 curated emoji), `BUILTIN_CATEGORIES`.

2. **`src/components/CategoryEditor.jsx`** — Bottom-sheet modal with name input (autofocused), 30-emoji curated grid (emoji highlighted and outlined when selected), palette tab switcher with 6 swatches each + custom hex color input via `<input type="color">`, and live preview card showing the exact same layout as ShiftCard's hero. Save button color matches current selection.

3. **`src/components/Toast.jsx`** — Fixed-position overlay that slides up from bottom, holds for 2.8s, fades out. Phase-based state machine (`enter` → `show` → `exit`) prevents the `onDone` callback from firing on first render.

4. **`src/components/Confetti.jsx`** — Canvas-based confetti burst. 90 particles (mix of rectangles and circles) burst from viewport center, with gravity (0.42), air resistance (0.988), rotation, and spin. Alpha fades over 85 frames. Calls `onDone` when animation completes.

5. **`src/index.css`** — Added `@keyframes slide-in-right` (28px translateX → 0, opacity 0 → 1) and `@keyframes pulse-ring` (box-shadow pulse). CSS classes `.animate-slide-in` and `.animate-pulse-ring`.

6. **`src/App.jsx`** — Wrapped in `CategoriesProvider`. Added `toast` and `confetti` state. `celebrate({ emoji, text, withConfetti })` callback passed to AddShift and OCRUpload. Renders `<Toast>` and `<Confetti>` as fixed overlays. Added `key={selectedDate}` to ShiftCard so it remounts on date change, triggering slide-in.

7. **Updated** `MonthView`, `ShiftCard`, `AddShift`, `OCRUpload` — all switched from `EMPLOYER_COLORS`/`EMPLOYER_NAMES` to `useCategories`. MonthView shows emoji as shift indicators (up to 3 per day, `+N` overflow), legend dynamically shows only categories used in the current month (emoji + color dot + name). ShiftCard shows emoji in the hero card header alongside the employer name, with `animate-slide-in` on root. AddShift shows emoji + name buttons, "+ New Category" dashed button, pencil "Edit" link for the selected category. OCRUpload employer list is fully dynamic with "+ New Category" button.

**Decided:**
Accepted. The localStorage-only approach (no Supabase table for categories) is correct for this app — categories are UI preferences, not shared data. The `getCategoryByKey` fallback pattern ensures all existing Supabase shift records (which store `publix`, `vanderbilt`, `nashville_general` as the employer key) continue to resolve correctly without any data migration. Confetti on category creation is intentional delight for a one-time flow. Toast on import closes the feedback loop that was previously silent.

---

## Entry 20 — Drag-to-Reschedule (Desktop)

**Asked:**
"Drag-to-reschedule shifts on the calendar"

**Produced:**
HTML5 drag-and-drop on each shift emoji in MonthView. Dragging an emoji sets a `draggingShift` state, dims the source cell to 45% opacity, and highlights the drop target with a white ring and scale-up. On drop, calls `updateShift` with the new date — Supabase reflects the change instantly via the realtime subscription. Ghost image is a single emoji rendered off-screen so the browser doesn't drag the full cell.

**Decided:**
Accepted for the initial push, with the explicit understanding it was a confirmed-incomplete implementation. The editorial call was deliberate: shipping the HTML5 DnD version immediately validated the core interaction model — emoji tracks the pointer, drop target highlights on hover, shift updates via Supabase realtime on drop, floating ghost image prevents accidental drops on unintended cells. These visual and interaction decisions were worth confirming on desktop before investing in a cross-platform rewrite.

The key insight from seeing the desktop version work: the drag-reschedule concept itself was correct. The emoji as the drag handle was readable, the 45%-opacity dimming on the source cell was the right visual signal, and the immediate Supabase update meant the result was visible without a page refresh. These decisions would carry over to the pointer-events implementation regardless of the input method.

The acceptance was conditional, not final. The scope limitation was noted before moving on — which meant Entry 21 was already queued. The correct iterative model is: build the fastest working version, verify the interaction is right, then fix the platform limitation. Building pointer events from scratch without first validating that drag-reschedule felt correct would have risked investing in cross-platform infrastructure for an interaction that didn't work conceptually. Testing on desktop first confirmed it did.

---

## Entry 21 — Drag-to-Reschedule (Cross-Platform Pointer Events)

**Asked:**
"Can it not be done on mobile as well?"

**Produced:**
Full replacement of HTML5 DnD with pointer events (`onPointerDown`, `onPointerMove`, `onPointerUp`, `onPointerCancel`). Key mechanics: `setPointerCapture` on pointerdown routes all subsequent events to the emoji span. An 8px dead zone (`Math.hypot(dx, dy) < DRAG_THRESHOLD`) distinguishes taps from drags — below the threshold, click propagates normally and opens the day. Above it, a floating emoji clone (`position: fixed`, `pointer-events: none`, 2.2x scale, drop shadow) appears above the fingertip and tracks the pointer. `document.elementsFromPoint` finds the day cell underneath — the floating clone's `pointer-events: none` makes it invisible to hit testing. `pointercancel` handles iOS scroll interruption. A `justDraggedRef` suppresses the day button's `onClick` for 200ms after a drag completes, preventing the day panel from opening when the finger lifts.

**Decided:**
Accepted. Pointer events are the correct cross-platform input API — they fire identically on mouse, touch, and stylus. There was no hybrid path; HTML5 DnD is architecturally incompatible with touch. The dead zone was necessary to preserve tap-to-open behavior on small emoji targets.

---

## Entry 22 — Per-Shift Task Checklist with Calendar Indicators

**Asked:**
"Task checklist — most directly quoted, simplest to build, zero dependencies. Make this also based on the calendar."

**Produced:**
`useTasks` was already scaffolded as a per-shift Supabase hook from a prior session. Refactored into `TasksProvider` — a global React context that loads all tasks for the current user in one query on mount and subscribes to all changes via a single realtime channel (`tasks:user:{userId}`). Exposed `getTasksForShift(shiftId)`, `hasTasksForShift(shiftId)`, and `allDoneForShift(shiftId)`.

ShiftCard: pulls tasks via `getTasksForShift(shift.id)`, renders a `TaskRow` list with checkbox toggle, strikethrough on complete, × delete button (hover/focus only). Add form at bottom — Enter or + button submits.

MonthView: imports `hasTasksForShift` and `allDoneForShift`. Each calendar cell computes `hasTasks` and `allDone` from its shifts. Shows a `·` in white/28 when tasks exist, a green `✓` when all tasks are completed. Indicator sits below the emoji stack inside the cell.

`useTasks.jsx` created as the real implementation; `useTasks.js` becomes a re-export shim (Vite resolves `.js` before `.jsx`, so bare imports still work).

**Decided:**
The global context load was necessary — a per-shift hook that fetches individually meant MonthView would need N queries for N shifts per cell render. Loading all tasks once and filtering in memory is both faster and simpler. "Based on the calendar" required the indicator layer, which required global visibility. The · vs ✓ distinction (open tasks vs all done) adds meaning without adding visual weight — Johnny can scan the month and know which days are fully prepared.

---

## Entry 23 — Today View

**Asked:**
"Today screen make it"

**Produced:**
`TodayView.jsx` replaces the ⚡ placeholder. Renders always-today — no date navigation.

Components per shift:
- **Hero card** — employer emoji, big Syne 800 time display (`clamp(2.4rem, 10vw, 3.4rem)`), facility name and address. Times go `rgba(255,255,255,0.3)` once the shift ends.
- **Shift progress bar** — thin white bar inside the hero card. Calculates `(elapsed / totalDuration) * 100%`. Shows "In progress · Xh Ym left" label. Rendered only while the shift is actively running — not before, not after.
- **Commute alert** — three urgency states, recalculated every 30 seconds via `setInterval`: calm (`Leave by 7:26am`, dark background), amber (≤ 30 min: `Leave in 18m`, amber-tinted), red (leave time passed, shift not started: `Leave now!`, red-tinted). In-progress shifts swap the car icon for ⚡.
- **Task checklist** — same add/toggle/delete as ShiftCard. Separate `taskInputs` state keyed by `shift.id` so multiple shifts on the same day each have independent input fields.

Day-off state shows 😴 with "No shifts today. Enjoy the break." Multiple shifts stack vertically in a scrollable column.

**Decided:**
Accepted. The live urgency system is what separates this from just clicking today's date on the calendar — the commute alert changes color and label in real time as the leave window closes, making the screen useful throughout the morning, not just once. The progress bar adds the during-shift state the calendar never shows. The 30-second clock interval keeps the view accurate without perceptible overhead.

---

## Entry 24 — AI-Generated SVG Category Icons

**Asked:**
Add AI-powered icon generation to the category editor with two input methods: upload any image (a logo, a storefront photo, a screenshot) or type a text description. Both paths call the Claude API and return a minimal SVG icon sized for 32×32. Store the SVG string in localStorage alongside the category. Display it everywhere the category emoji currently appears — the AddShift grid, MonthView calendar dots, ShiftCard hero and tabs, TodayView, CommuteView, OCRUpload, and the Sidebar legend. Emoji picker stays as a fallback — if the user doesn't generate an icon, everything works exactly as before.

**Produced:**
Four new or updated files, plus updates to every component that renders a category icon.

1. **`src/utils/generateCategoryIcon.js`** — Calls `claude-haiku-4-5-20251001` directly from the browser via `fetch`. Two exported functions: `generateIconFromImage(base64, mediaType)` sends the image alongside the SVG prompt; `generateIconFromDescription(description)` sends text only. Both strip markdown fences from the response in case Haiku wraps its output anyway. The `anthropic-dangerous-direct-browser-access: true` header is required for browser-side Anthropic API calls; it makes the intent explicit rather than relying on CORS accident.

2. **`src/components/CatIcon.jsx`** — Reusable component that checks `cat.svgIcon` first. If present, normalizes the SVG string (strips width/height attributes, injects the requested pixel size, adds `style="display:block"`) and renders it via `dangerouslySetInnerHTML` inside a fixed-size `<span>`. If absent, renders the emoji as before. A single `size` prop controls dimensions; callers pass the same values they were already using for font-size (11 for calendar dots, 16 for sidebar, 24–28 for heroes).

3. **`src/components/CategoryEditor.jsx`** — New Icon section replaces the bare emoji picker. Outer tabs: **Emoji** (original picker, unchanged) and **AI Icon**. AI Icon mode has inner method tabs: **Type description** (text input + Generate button, Enter submits) and **Upload image** (dashed border button that triggers a hidden `<input type="file">`). Loading spinner during generation. Error message in a red-tinted pill if the API call fails. Once an icon is generated: a preview panel shows it tinted in the category color alongside **Regenerate** and **Use emoji instead** buttons. The live preview card at the top updates immediately. On save, passes `svgIcon` alongside `name`, `color`, `emoji` — `null` if the user is in emoji mode, so editing a category to remove its AI icon clears it correctly.

4. **Updated display sites** — `MonthView`, `ShiftCard`, `TodayView`, `AddShift`, `Sidebar`, `OCRUpload`, `CommuteView` all import `CatIcon` and replace `{cat.emoji}` spans. The `<option>` elements in the OCR reassignment dropdown remain as `{cat.emoji} {cat.name}` since `<option>` only accepts text nodes.

**Decided:**
Accepted. The `currentColor` instruction in the SVG prompt is the key design decision — it means generated icons inherit the category color in every context (preview, grid, hero) without needing color post-processing. The normalization in `CatIcon` handles whatever width/height Claude emits, so the host component always gets an icon at the exact size it requests. Storing SVG in localStorage is consistent with how categories are already stored — no new infrastructure, no schema change.

---

## Entry 17 — am/pm Instead of a/p

**Asked:**
"Can you make this am and pm" — screenshot showed "9:30a → 6p" on the shift card.

**Produced:**
One-line change in `formatTime` in `dateHelpers.js`: changed the period suffix from `'a'`/`'p'` to `'am'`/`'pm'`.

**Decided:**
Accepted immediately. The change is one character per suffix but the impact on legibility is real. "9:30a → 6p" is a developer shorthand — it's how time might appear in a debug log or a data model. "9:30am → 6pm" is how time appears in a product a person reads before leaving the house.

The user context matters here: Johnny is a healthcare worker who reads this display quickly, sometimes in motion — in a hospital hallway, from across a room, while walking to his car. The shift card's time display is the most important element on screen, the first thing he looks at and the last thing he confirms before commuting. Any ambiguity in that display (is "a" AM? is it a label for something else?) should be removed entirely.

The PRD's design principle is "glance, not study" — the app should communicate the answer at a glance, not require the user to interpret shorthand. "9:30a" asks the reader to decode the abbreviated suffix in context. "9:30am" does not. One character removes that decoding step for every single time this user reads this display, which across daily use compounds into a meaningful legibility improvement. The correct standard was "am" and "pm" from the start; the `'a'`/`'p'` shorthand was a default that slipped through initial build.

---

## Entry 29 — Past Date Fading on Calendar Grid

**Asked:**
"When days pass by can you also make the date colors more faded for the day that passed by in order to differentiate between the days"

**Produced:**
Added an `isPast` flag to each calendar cell: `const isPast = !todayBadge && dateStr < todayStr`. Past cells receive `opacity: 0.35` on the button and `text-white/30` on the date number (instead of `text-white/80`). The today badge remains fully opaque and white-circle styled. Upcoming dates are unaffected. The `dateStr < todayStr` comparison works correctly because both are `YYYY-MM-DD` ISO strings — lexicographic order is identical to chronological order. To scope `todayStr` inside cells.map without making it a module-level constant, the map was wrapped in an IIFE: `{(() => { const todayStr = ...; return cells.map(...) })()}`.

**Decided:**
Accepted. The fading creates clear visual hierarchy between past and future at a glance — expired shifts recede, upcoming ones stay prominent. The IIFE was the cause of the syntax bugs documented in Entries 25 and 26 and Resistance Entry 15. In hindsight, `todayStr` should have been computed in component scope alongside `const cells = getCalendarDays(year, month)`, which would have avoided the IIFE entirely.

---

## Entry 30 — Colored Route Lines on Commute Map

**Asked:**
Screenshot of the commute map showing a single white/grey polyline between home and work. Request: "Can you also make the lines colored depending on the shift"

**Produced:**
Replaced the single `DirectionsService` request (home → all stops in one request with waypoints) with per-leg individual requests — one for each consecutive segment: home→stop1, stop1→stop2, etc. State changed from `directions: DirectionsResult | null` to `directionLegs: [{ directions: DirectionsResult, color: string }]`. Each leg object carries the destination category's hex color. Rendered as multiple `<DirectionsRenderer>` components, each with `polylineOptions: { strokeColor: leg.color, strokeOpacity: 0.8, strokeWeight: 5 }` and `suppressMarkers: true`. The waypoints array is built as `[{ pos: home, cat: null }, ...stops]` and sliced pairwise; the destination category's color is pulled from `to.cat?.color ?? '#ffffff'`.

**Decided:**
Accepted. The single-request waypoints approach couldn't color individual legs — the Directions API returns one polyline for the whole route. Per-leg requests are the only way to get segment-level color control. The visual result is immediately readable: each route segment matches the category color of the destination employer, so a day with two different employers shows two distinct colored paths on the map.

---

## Entry 25 — Calendar Grid Rendering as "0"

**Asked:**
Screenshot of the live app showing the month view rendering a lone `0` in the top-left corner of the calendar grid instead of day cells. The header ("What's good Johnny," "May 2026," the phrase line) and the day-of-week labels (Sun Mon Tue Wed Thu Fri Sat) both rendered correctly. Only the grid itself was broken. Caption: "This still isn't working."

**Produced:**
Diagnostic sequence in three steps:

1. **Read `MonthView.jsx` and `dateHelpers.js` in parallel.** `getCalendarDays` was correct — for May 2026 it produces a 36-element array: 5 nulls (padding for Mon–Fri before May 1) plus days 1–31. The symptom of rendering `0` instead of nothing pointed not at an empty array but at a React falsy-number render: in JSX, `{0}` renders "0" as text, whereas `{[]}`, `{null}`, `{false}`, `{undefined}` render nothing. This narrowed the cause to an expression somewhere in the JSX evaluating to the number 0.

2. **Identified the IIFE as the source.** Line 283 opens `{(() => {` and line 373 was supposed to close it with `})`)()}` (7 characters: close map callback `}`, close `.map(` `)`, close IIFE body `}`, close outer paren `)`, invoke `(`, `)`, close JSX `}`). The actual line 373 read `})}()}` — only 6 characters. The outer wrapping paren from `(() => {` was never closed. This produced valid-looking (to the eye) but syntactically incorrect JS.

3. **Tested in isolation with Node.** Attempted to use jsdom first; it wasn't installed. Pivoted to a plain `node -e` eval of the equivalent pattern:
   ```js
   const result = (() => {
     return cells.map((day, i) => { ... })
   })}()   // ← the broken form
   ```
   Node threw `SyntaxError: Unexpected token '('` immediately at the `(` after `})}`. Rewrote to `})`)()}`and re-tested — Node printed all 8 elements correctly. Applied the single-character insertion to `MonthView.jsx`, ran `npm run build` (3.05s, clean), committed, pushed.

**Why `0` specifically:** The broken IIFE closed incorrectly such that the outer expression evaluated to `0` — likely the result of a coercion during React's reconciliation of the malformed JSX expression. React rendered the number `0` as text per its falsy-number rendering rule, which is why the grid area showed "0" rather than being blank.

**Decided:**
Accepted. The prior commit ("Fix broken calendar grid — malformed IIFE closing syntax") had attempted the same fix but produced `})}()}` instead of `})})()}` — trading one broken sequence for a different one. The real fix required execution testing, not visual bracket counting. See Resistance Entry 15 for the full diagnosis of why two commits in a row produced broken syntax.

---

## Entry 26 — GitHub Actions CI Failure on Deploy Job

**Asked:**
Screenshot of GitHub Actions run for commit `628f882` ("Fix broken calendar grid — malformed IIFE closing syntax"), triggered 15 minutes earlier. The workflow showed two jobs: `deploy-function` (green, 18s) and `deploy` (red, 14s). Annotations panel showed: one error — "Process completed with exit code 1" on `deploy`; two warnings — both noting Node.js 20 deprecation on `actions/checkout@v4` and `actions/setup-node@v4`. Caption: "Fix this."

**Produced:**
Diagnosis: The `deploy` job runs `actions/checkout@v4` → `actions/setup-node@v4` with Node 22 → `npm ci` → `npm run build` → upload artifact → `actions/deploy-pages@v4`. The exit code 1 was on the `deploy` job itself, not on a specific step annotation. `npm run build` is Vite, and Vite fails on JSX syntax errors at transform time. The IIFE closing bug from Entry 25 — `})}()}` — would cause Vite's esbuild transformer to throw the same `SyntaxError` that Node did, producing exit code 1 from the build step.

Confirmed by running `npm run build` locally after applying the Entry 25 fix — 3.42s, clean, no errors. The fix that was already committed (Entry 25) resolved the CI failure. Pushed.

**On the Node.js 20 deprecation warnings:** These are informational — `actions/checkout@v4` and `actions/setup-node@v4` both still work, they run on Node 24 due to the `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true` environment variable already in `deploy.yml`. No workflow changes needed. The warnings can be resolved later by bumping to `actions/checkout@v5` and `actions/setup-node@v5` when those are stable, but they do not affect build outcomes.

**Decided:**
Accepted. The `deploy-function` job being green while `deploy` was red confirmed the problem was specific to the build step, not the Supabase deployment or GitHub Pages configuration. A broken JSX file is always the first thing to check when `npm run build` fails after a commit that touched a component. No changes to the CI workflow were needed — the root cause was the code, not the pipeline.

---

## Entry 27 — Clickable Day Rows Show Route on Commute Map

**Asked:**
"Make it when I click on the day I can see the route for the day." — referring to the upcoming-day rows in CommuteView (e.g., "Thursday May 28," "Friday May 29").

**Produced:**
Five changes to two files:

**`CommuteView.jsx`:**
1. Added `const [selectedDate, setSelectedDate] = useState(today)` — defaults to today so the map's initial state is unchanged.
2. Added `const selectedShifts = getShiftsForDate(selectedDate)` and `const selectedLabel = formatDayLabel(selectedDate, selectedDate === today)` — derived from the selected date rather than always pulling from `today`.
3. Changed each day section's header `<div>` to a `<button>` with `onClick={() => setSelectedDate(date)}`. Added `active:opacity-70 transition-opacity` for press feedback.
4. Added a `· route shown` badge inline with the date label, visible only when `selectedDate === date`:
   ```jsx
   {isSelected && (
     <span className="text-[10px] font-bold uppercase tracking-widest ml-1"
       style={{ color: 'rgba(255,255,255,0.3)' }}>
       · route shown
     </span>
   )}
   ```
5. Updated the `CommuteMap` call to `<CommuteMap shifts={selectedShifts} dateLabel={selectedLabel} ... />` replacing the previous `todayShifts` prop.

**`CommuteMap.jsx`:**
6. Changed the prop signature from `{ todayShifts, getCategoryByKey }` to `{ shifts: todayShifts, dateLabel, getCategoryByKey }` — destructure-rename keeps all internal references to `todayShifts` valid without a search-and-replace.
7. Changed the map header label from the hardcoded string `"Today's Route"` to `{dateLabel ? \`${dateLabel}'s Route\` : "Today's Route"}` — handles "Today's," "Tomorrow's," "Thursday's," etc. via JavaScript's template literal possessive.

**Why the day header and not the shift card:** The shift card already carries visual weight (the large time display, the leave-by label, the color border). Adding a click interaction to it would conflict visually with existing intent. The day label header (`Thursday  May 28`) is lightweight and clearly acts as a section selector — tapping it to change the map context is a natural group-select pattern, not a detail-select pattern.

**The `· route shown` badge:** Without it, there's no confirmation that clicking the day did anything — the map update is smooth and silent. The badge is the minimal feedback signal: it confirms which day the map is currently displaying without a modal, toast, or color change on the map itself.

**Reactivity:** No changes to the effects in `CommuteMap` were needed. The geocoding, direction-building, and fitBounds effects already had `todayShifts` (now `shifts`) in their dependency arrays. Switching the prop value from today's shifts to Thursday's shifts triggers those effects automatically — any new employers are geocoded on demand, routes are rebuilt, and the map pans and zooms to fit the new day's stops.

**`getShiftsForDate` stability:** `getShiftsForDate` in `useShifts.jsx` is a plain inline function `(date) => shifts.filter(s => s.date === date)` — not a `useCallback`. This means `selectedShifts` is a new array reference on every render. For the direction-building effect in `CommuteMap` this creates a potential over-routing issue (effect re-runs every 30s when the live clock ticks). This was noted and accepted as a pre-existing characteristic of the commute map's reactivity, not a new regression introduced by this change.

**Decided:**
Accepted. The interaction is discoverable, low-noise, and the `· route shown` badge closes the feedback loop without adding UI complexity.

---

## Entry 28 — Task Locations as Commute Waypoints

**Asked:**
"When I add a task for the day, can I also add a location for the task to add it as part of the commute tab?"

**The intent decoded:** Tasks in the app are to-do items tied to a shift (e.g., "Pick up PPE," "Grab coffee"). A task with a location is an errand that must happen on the way to work — a pharmacy stop, a Kroger run, a detour. The feature request was to make those named locations appear on the commute map as actual route waypoints, not just text labels.

**Produced:**
Six files changed across four layers:

**Layer 1 — Database:**
- `supabase/migrations/003_add_task_location.sql`: `ALTER TABLE public.tasks ADD COLUMN location TEXT DEFAULT NULL;` — nullable so all existing task records are unaffected without any backfill.
- `supabase/schema.sql` updated to include `location text default null` in the `tasks` table definition for documentation consistency.

**Layer 2 — Data hook (`useTasks.jsx`):**
- `rowToTask` extended: `location: row.location ?? null` — the `??` handles both `null` (DB default) and `undefined` (older cached rows).
- `addTask(shiftId, text, location = null)` — optional third parameter with default `null`. Only writes the `location` column if a value is provided (`...(location ? { location } : {})`), keeping existing call sites (`addTask(shift.id, text)`) unchanged without needing updates.
- New `updateTaskLocation(id, location)` mutation: `supabase.from('tasks').update({ location: location || null }).eq('id', id)` — the `|| null` coercion turns empty string into a real null, which removes the location badge cleanly rather than showing a blank pill.
- `updateTaskLocation` added to the `TasksContext.Provider value` object.

**Layer 3 — Shift card UI (`ShiftCard.jsx`):**

*`TaskRow` component* — gained local state (`editingLoc`, `locValue`) and a `useEffect` to sync `locValue` from `task.location` when the task is updated externally (realtime subscription). Three new UI states per task row:

1. **No location, not editing:** The 📍 button is `opacity-0 group-hover:opacity-100` — invisible unless hovering. Color is `rgba(255,255,255,0.25)` (dim). Tapping opens the inline edit field.
2. **Has location, not editing:** Blue-tinted badge below the task text (`color: rgba(96,165,250,0.6)`): `📍 Kroger on Hwy 31`. Tappable — clicking the badge opens the inline edit field for updating.
3. **Editing:** An autofocused `<input>` below the task text. `onBlur` saves and closes. `Enter` saves. `Escape` discards and closes without writing. On save, calls `onLocationUpdate(task.id, trimmed || null)`.

*Add task form* — the existing single-row form (`[input] [+]`) was restructured to `[input] [📍] [+]` with a second optional row:

- The 📍 button toggles `showLocInput` state. When active, its background and color switch to the category color (`${color}28` bg, `color` text) — a visual confirmation it's active.
- When `showLocInput` is true, a second `<input>` appears below: placeholder "Location (e.g. Kroger on Hwy 31)…". Submitting the form sends both `newTask` and `newTaskLoc` to `addTask`, then resets both and closes the location input.
- Existing callers that don't pass `location` (`addTask(shift.id, text)`) continue to work — the third param defaults to `null`.

**Layer 4 — Commute map (`CommuteView.jsx` + `CommuteMap.jsx`):**

*`CommuteView.jsx`:*
- Added `import { useTasks }` and destructured `getTasksForShift`.
- `taskStops` derived inline:
  ```js
  const taskStops = selectedShifts
    .flatMap((s) => getTasksForShift(s.id))
    .filter((t) => t.location)
    .map((t) => ({ text: t.text, address: t.location }))
  ```
  This runs on every render, which is acceptable because `getTasksForShift` is a `useCallback` that only changes when the full tasks array changes (realtime subscription). New task locations trigger a re-derive automatically.
- `taskStops` added as a prop to `<CommuteMap>`.

*`CommuteMap.jsx`:*
- Prop signature: `{ shifts: todayShifts, dateLabel, taskStops = [], getCategoryByKey }` — default `[]` prevents null checks throughout.
- **Geocoding effect** (merged): Previously geocoded only employer addresses. Now also geocodes task stop addresses, using `task:${stop.address}` as the cache key. The `task:` prefix is necessary — without it, an address like `"1211 Medical Center Dr, Nashville, TN"` could collide with an employer key named the same. Geocode results for both employers and task stops land in the same `geoCache` state object and the same `localStorage` key (`shiftstack_geocode_cache`), so all addresses persist across sessions.
- **Direction-building effect**: `taskWaypoints` computed from geocached task positions:
  ```js
  const taskWaypoints = taskStops
    .map((stop) => geoCache[`task:${stop.address}`])
    .filter(Boolean)
    .map((pos) => ({ location: pos, stopover: true }))
  ```
  Added only to the **first leg** (`i === 0`): the segment from home to the first employer. This reflects the typical errand use case — picking something up on the way to the first shift of the day, not between hospitals. `taskStops` added to the effect's dependency array.
- **`taskIcon` useMemo**: A distinct SVG pin — smaller than the employer pin (24×30 vs 28×36), white fill at 85% opacity, with a checkmark path (`M9 13.5l3.5 3.5 6.5-6.5`) in `#141414`. `zIndex: 8` — above employer pins (5) but below home (10) and live position (20).
- **`fitBounds` effect**: Extended to include task stop positions alongside home and work markers, so the map auto-pans to show all relevant points when a day with task stops is selected.

**Key architectural decisions:**

*Why first leg only:* Task stops are modeled as "on the way to work," not as stops between employers. Inserting them into the home→employer1 leg matches the actual errand pattern. Inserting them between employer1 and employer2 would require knowing which shift a task belongs to and mapping that to a specific leg — possible, but over-engineered for the current use case.

*Why free-text address over coordinates:* The input is a plain text field ("Kroger on Hwy 31," "CVS Pharmacy"). Geocoding converts it to coordinates lazily on first map load and caches the result. This is frictionless for the user — no map picker, no address form. If the address fails to geocode, no marker appears and no waypoint is added; the route skips it silently rather than erroring.

*Why `task:` prefix in geocache:* If both an employer and a task happened to share the same address string as a key, one would overwrite the other in `geoCache`. Prefixing all task addresses prevents that collision entirely.

*Why `updateTaskLocation` not a general `updateTask`:* The existing mutations (`addTask`, `toggleTask`, `removeTask`) are each single-purpose. A general `updateTask(id, fields)` would be more flexible but also more footgun-prone — it's easy to accidentally overwrite `completed` when only meaning to change `location`. `updateTaskLocation` is explicit about what it modifies.

**Decided:**
Accepted. The feature adds genuine value to the commute tab — Johnny can tag "pick up gloves at Walgreens" as a task with a location and see it on the route map as a waypoint stop, not just a text item. The implementation is backwards-compatible at every layer: existing tasks (no location) are unaffected, existing API calls work without modification, and the map degrades gracefully if no task locations are set.

---

## Entry 31 — Zoom +/− Buttons on Commute Map

**Asked:**
"Can you also add a plus and minus button for the map"

**Produced:**
Two frosted-glass buttons stacked in the top-right corner of the map container, absolutely positioned as an overlay with `pointer-events: none` on the wrapper and `pointer-events: auto` on each button so the map beneath stays interactive. `+` increments `mapRef.getZoom() + 1`; `−` decrements. Border radius is asymmetric: top button rounds on top corners, bottom button rounds on bottom corners, giving a joined pill appearance. Styled with `rgba(14,14,14,0.85)` background and `backdrop-filter: blur(12px)` matching the "Update home" button. The `−` uses the Unicode minus sign (`−`) rather than a hyphen to render at the correct visual weight.

**Decided:**
Accepted. The zoom buttons were a direct response to a real mobility constraint: at the time of this request, `gestureHandling: 'none'` was active, which disabled all gesture input on the map. On iOS this meant pinch-to-zoom was blocked — the map was fully locked at its default zoom level. The +/− buttons were the correct addition because they call `mapRef.setZoom()` programmatically, which bypasses the gesture block entirely. Google Maps' `gestureHandling` option controls only whether user gestures are interpreted as map interactions; it has no effect on API calls. Explicit button controls work regardless of gesture settings.

The frosted-glass visual treatment (`rgba(14,14,14,0.85)`, `backdrop-filter: blur(12px)`) matches the "Update home" button already on the map, creating a consistent visual language for all overlaid map controls. The asymmetric border radius — top button rounded on top corners, bottom button rounded on bottom corners — produces a joined pill appearance that reads as a paired control rather than two disconnected buttons. This is a consistent affordance in mapping UIs: Google Maps and Apple Maps both use joined zoom controls specifically because they communicate "these two actions are related" without a label.

The Unicode minus sign (`−`) rather than a hyphen (`-`) matters at small button sizes: at 14px, a hyphen is visually narrower than the `+` and reads as a dash. The proper minus sign matches the `+` visual weight exactly, making the two buttons optically equivalent.

When `gestureHandling` was later switched to `'greedy'` in Entry 32, pinch-to-zoom became available on mobile — but the +/− buttons were kept. They remain useful for precise single-increment zoom, particularly on desktop where scroll-to-zoom can be imprecise when the user's intent is one zoom level, not three.

---

## Entry 32 — Half-Screen Map with Pan and Scroll Zoom

**Asked:**
"Make the map fit half of the screen when dragged the map can move and the user can look around" — followed by "drag also on laptop"

**Produced:**
Two separate commits:

1. **Height + pan**: Changed map container from `height: 220` (fixed px) to `height: min(50dvh, 50vh)`. Changed `MAP_OPTIONS` from `gestureHandling: 'none', draggable: false` to `gestureHandling: 'greedy', draggable: true`. `gestureHandling: 'greedy'` lets one finger pan the map on touch without requiring a two-finger gesture; the map captures the touch event rather than passing it to the page scroll.

2. **Scroll zoom on desktop**: `scrollwheel` was still `false` after the first commit, which blocked scroll-to-zoom on desktop. Set to `true`.

**Decided:**
Accepted both. The switch from `gestureHandling: 'none'` to `gestureHandling: 'greedy'` was necessary — `'none'` disables all gesture input entirely, which was the iOS scroll-protection workaround from an earlier session. Now that the map occupies half the screen and the user explicitly expects to interact with it, capturing touch is correct. `gestureHandling: 'cooperative'` (two-finger pan on touch) was not used because it produces a "use two fingers to move the map" overlay on accidental one-finger touches, which is worse UX for a dedicated map area.

---

## Entry 33 — Shift Cards as Map Selectors

**Asked:**
Screenshot of a shift card in the commute list. "When I also click the card can it interact with the map as well"

**Produced:**
Changed the shift card from a `<div>` to a `<button>` with `onClick={() => setSelectedDate(date)}` — the same call the day label button already makes. Added `active:scale-[0.98]` for press feedback. When the card's date is the currently selected map date (`isSelected`), the card gets a faint category-color `outline` ring (`${cat.color}40` opacity) to confirm the selection visually.

**Decided:**
Accepted. The reasoning is about hit area, discoverability, and feedback — all three needed to be correct for this to work on mobile.

The day label button added in Entry 27 (`Thursday  May 28`) is the correct semantic control — tapping a day header to show that day's route is a natural group-select pattern. But a day label on mobile occupies roughly 44×24 pixels of touchable area. The shift card below it occupies the full screen width and approximately 80 pixels of height. When both elements trigger the same map update, the larger, more prominent element should be interactive — that's where the user's hand already is.

The outline ring (`${cat.color}40` opacity) was the critical addition for this feature. Without it, tapping the card produces a smooth map pan with a `· route shown` badge appearing on the day header above — the card itself is silent. The ring confirms selection at the card level, so the user sees feedback exactly where they tapped, not in a different part of the screen they may have scrolled past. The category-color opacity ensures the ring is recognizable as a selection state without overwhelming the card's visual design.

The `active:scale-[0.98]` press animation is consistent with every other tappable card in this app (AddShift modal, OCRUpload employer buttons, ShiftCard in MonthView). Consistent press behavior across all interactive cards creates a unified affordance: anything that scales on press is a button. Any element that doesn't scale is not. Adding this to the commute shift card completes that system rather than creating a gap where one card type feels unresponsive.

---

## Entry 34 — Shift Stack Logo in Sidebar

**Asked:**
Screenshot of sidebar showing "Yo Johnny" / "Good to see you Johnny" greeting. "Can you make it say shift stack for the words near the nav bar"

**Produced:**
Removed the `GREETINGS` array and random greeting from `Sidebar.jsx`. Replaced the greeting `<div>` with the three-bar icon + wordmark lockup matching the login screen: a 32×32 dark-rounded box containing three stacked bars in Publix green (#00A651), Vanderbilt gold (#CFB87C), and Nashville General blue (#2D6DB5) at 71% and 43% widths respectively, followed by "Shift" in white and "Stack" in `text-white/40`. `useState` import removed since it was only used for the greeting.

**Decided:**
Accepted. The rotating greeting was built into the prototype specifically for first contact — showing Johnny a personalized message ("Good to see you, Johnny") makes the app feel made for him, which is accurate and appropriate for a first-exposure session. But Johnny's use pattern after adoption is not first exposure. It is daily access, same device, same account, multiple times a day before and during shifts. A greeting that changes randomly on each open provides no information on the twentieth visit. It adds visual noise to a screen Johnny opens specifically to navigate to a different screen.

The replacement — the three-bar icon lockup with "Shift" in white and "Stack" in `text-white/40` — is stable, immediately identifiable, and matches the login screen. The login screen is the first thing Johnny sees when he authenticates; the sidebar header being the same visual element means the app's identity is coherent from entry to navigation. When both the first screen and the persistent nav use the same wordmark, the app feels intentional, not cobbled together. A random greeting at the top of the nav is a design element left over from prototyping that has no purpose in daily use.

Removing `useState` from the Sidebar component was a minor architectural improvement that the greeting removal unlocked. The component no longer needs to initialize state or track a selected greeting, which makes it a pure render function. A sidebar with no internal state is easier to reason about, easier to test, and renders faster. This is a small gain but it compounds: every component that doesn't need state and doesn't have it is simpler than every component that doesn't need state but has it anyway.

---

## Entry 35 — Per-Shift Location Field Wired to Commute Map

**Asked:**
"For add shift make sure you can add location and that it affects the map"

**Produced:**
Four files changed across three layers:

1. **Database** — `supabase/migrations/004_add_shift_location.sql` adds `location text DEFAULT NULL` to the `shifts` table.

2. **`useShifts.jsx`** — `rowToShift` includes `location: row.location || null`. `addShift` and `updateShift` both write `location: data.location ?? null` to Supabase.

3. **`AddShift.jsx`** — New 📍 Location field in the manual entry form, positioned above Notes. The placeholder text shows the category's default address from `FACILITY_INFO` (e.g. `1211 Medical Center Dr, Nashville, TN` for Vanderbilt) so the user knows what the map uses by default. A helper line reads "Leave blank to use the default address for this category." `FACILITY_INFO` imported from `commuteCalc.js`.

4. **`CommuteMap.jsx`** — Geocoding effect now also geocodes custom shift locations with cache key `shift-loc:<address>`. Stop-building logic and `workMarkers` both check `shift.location && geoCache[\`shift-loc:${shift.location}\`]` first, falling back to the employer geocache key. This means a custom location silently overrides the employer default for both the map pin and the route polyline without any other UI change.

**Decided:**
Accepted. The `shift-loc:` prefix avoids collisions with the existing `employer` keys and the `task:` prefix already in use. The fallback chain (custom location → employer default) means all existing shifts continue to work without any data migration. Storing the location as a free-text address rather than pre-geocoded coordinates is consistent with how task locations are handled — frictionless input, lazy geocoding on first map load.

---

## Entry 36 — Google Places Autocomplete on Location Field

**Asked:**
Screenshot showing a plain text input with "ghg" typed and no dropdown. "Use logic and a dropdown and make sure location is real, and also make sure that if the location doesn't exist then put an error statement"

**Produced:**
Replaced the bare text input with a full Places Autocomplete flow:

- `useJsApiLoader` with `libraries: ['places']` added to `AddShift` to ensure the Maps API and Places library are available even when `CommuteMap` hasn't been loaded yet.
- `AutocompleteService.getPlacePredictions()` called on a 300ms debounce as the user types, with `types: ['establishment', 'geocode']`.
- Results rendered as a custom dropdown (`<ul>`) overlaid below the input using absolute positioning and `z-50`. Each row splits `structured_formatting.main_text` (bold place name) from `structured_formatting.secondary_text` (city, state) for clean two-line display.
- `locationValid` boolean tracks whether the current text was picked from the dropdown. Any subsequent typing sets it back to `false`.
- Input ring color: neutral default → red when text present but not validated → green when confirmed.
- Pin icon swaps to ✅ on validation. Helper text below reads "✓ Location confirmed" when valid, inline red warning when invalid, default hint when blank.
- `handleSave` blocks if `location.trim()` is non-empty and `locationValid` is false, returning an error message.
- Outside-click closes the dropdown via a `mousedown` listener on `document`; `onMouseDown` on list items uses `e.preventDefault()` to prevent the input's blur from firing before the click registers.

**Decided:**
Accepted. Free-text entry was the original implementation and had no safeguard against typos or non-existent addresses — both would silently produce failed geocode calls on the commute map with no feedback to the user. The autocomplete enforces that only geocodable addresses are saved, and the visual state (ring color, pin icon, helper text) communicates the validation status without a separate error step.

---

## Entry 38 — OCR Path Rewritten to Bypass Supabase Edge Function

**Asked:**
Screenshots were returning "Anthropic API error" (502) on both Mac and Windows. The Supabase `extract-shifts` Edge Function was using `claude-3-5-haiku-20241022`, a model that no longer exists on new Anthropic accounts in 2026. No terminal access and no Supabase CLI meant the edge function could not be redeployed with an updated model name.

**Produced:**
Created `src/utils/extractShifts.js` — a new client-side utility that calls the Anthropic API directly from the browser using `VITE_ANTHROPIC_API_KEY` (the same key already exposed for AI icon generation) with `anthropic-dangerous-direct-browser-access: 'true'`. Model set to `claude-haiku-4-5`. Exports a single function `extractShiftsFromImage(base64, mediaType, { year, company })` that returns the parsed shift array directly. Updated both `OCRUpload.jsx` and `AddShift.jsx` to import and call `extractShiftsFromImage` instead of `supabase.functions.invoke('extract-shifts', ...)`. Removed the `supabase` import from both components. The edge function still exists in the repo but is no longer called.

**Decided:**
Accepted. The `VITE_ANTHROPIC_API_KEY` is already in the browser bundle for icon generation — exposing it for screenshot extraction raises no new security surface for a single-user personal tool. The `anthropic-dangerous-direct-browser-access` header is the explicit opt-in Anthropic requires; using it is architecturally consistent with the icon generation path already in production. Bypassing the edge function entirely removed the dependency on an undeployable Supabase function and cut the round-trip latency by eliminating the proxy hop.

---

## Entry 39 — Markdown Fence Stripping in extractShifts.js

**Asked:**
After the edge function bypass shipped, a new error appeared: `Unexpected token '\`', "\`\`\`json [{"... is not valid JSON`. The model returned its response wrapped in markdown code fences despite the prompt explicitly saying "Return ONLY a raw JSON array — no markdown, no backticks, no explanation."

**Produced:**
One-line fix in `extractShifts.js`: after reading `data.content[0].text`, the raw string is cleaned with two regex replacements before `JSON.parse`: `raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '')`. Handles both ` ```json ` and plain ` ``` ` wrappers.

**Decided:**
Accepted. The prompt instruction (`Return ONLY a raw JSON array — no markdown, no backticks, no explanation.`) is correct and necessary — without it, Claude wraps output in fences on the majority of calls. With it, Claude obeys the instruction on most calls. But "most calls" is not sufficient for a feature that parses JSON: a single unstripped fence causes `JSON.parse` to throw `SyntaxError: Unexpected token '\`'`, which surfaces to the user as a failed import with a cryptic error message they cannot act on.

The defensive strip is two regex replacements applied unconditionally after every API response, before `JSON.parse`. If the model returned a naked array, both regexes match nothing and leave the string unchanged. If it returned a fenced array, the fences are stripped and `JSON.parse` succeeds. The cost is two fast string operations per call — negligible. The benefit is that the feature works correctly even when the model doesn't follow formatting instructions exactly.

This pattern is generalizable to every place in this project that calls an AI model and parses structured output: prompt engineering sets intent; defensive parsing handles variance. Both layers are necessary, and neither is sufficient alone. The same strip was added to the Supabase Edge Function in Entry 15 after Claude returned fenced JSON despite identical instructions. The history is consistent — at every point in this project where AI-generated output has been parsed, the model has at some point violated the no-markdown instruction. The strip is not defensive coding against an unlikely case; it responds to observed, repeatable model behavior across three separate parsing sites in this codebase.

---

## Entry 40 — Mermaid Architecture Diagram in README

**Asked:**
"Make a mermaid diagram and add it to the section after user testing in the readme." — later updated to match the full built system accurately.

**Produced:**
Added Section 12: "App Architecture & User Flow" to `README.md` immediately following Section 11 (User Testing). The updated flowchart traces the full built system:

- **Auth**: Supabase Auth, email + password, 90-day session
- **Upload Schedule path**: employer selection (localStorage) → screenshot capture → Canvas API (resize/compress/base64) → `Anthropic claude-haiku-4-5` (browser-direct, `dangerous-browser-access`) → markdown fence strip + null-time filter → review screen → Supabase
- **Add Shift path**: form (date/time/employer/optional location) → `Google Places AutocompleteService` (300ms debounce, `locationValid` gate, ring color feedback) → Supabase
- **Category Editor path**: emoji + palette → localStorage; or image/text → `Anthropic claude-sonnet-4-6` (browser-direct) → `currentColor` SVG → localStorage (`shiftstack_all_categories`)
- **`CatIcon` component**: reads localStorage categories, renders in all views
- **Supabase Realtime**: subscription feeds Month View, Today View, and Commute View
- **Month View**: calendar grid (emoji/color/task indicators) → tap date → Shift Card (time hero, task checklist, optional task location 📍 → Supabase); drag emoji → Pointer Events API (8px dead zone, floating clone) → reschedule → Supabase
- **Today View**: `commuteCalc` (`FACILITY_INFO` hardcoded drive times from Spring Hill TN) → 30-second clock interval → urgency state machine (calm → amber → red/progress bar)
- **Commute View**: `useCommuteAlerts` (Web Notification API, 30/10/0 min triggers); select day → shifts + task locations from Supabase → Google Maps Geocoding (`task:` and `shift-loc:` cache key prefixes, `localStorage shiftstack_geocode_cache`) → Directions API (one request per route leg) → colored polylines (per-employer hex) + task stop waypoints (first leg only) → half-screen interactive map (zoom buttons, greedy gestures, `fitBounds`)

**Decided:**
Accepted. The placement — Section 12, immediately following the User Testing section — is deliberate. The README traces the product from user research (Sections 1–3, Johnny's behavior observations and pain points) through design decisions (Sections 4–8, PRD decisions and UI system) to user testing feedback (Section 11). The architecture diagram at Section 12 closes the narrative: it shows how the decisions documented in the README actually translate into running system components and data flows. Without it, the README describes what was built and why; the diagram shows how it actually works as a connected system.

For the AI 201 case study context, the diagram documents specifically how AI-assisted building distributes work across the stack. The Upload Schedule path (screenshot → Canvas compression → Anthropic AI → review → Supabase) shows AI doing the semantic interpretation layer that replaced ~150 lines of fragile Tesseract parsing. The Add Shift path (form → Google Places → Supabase) shows the validation layer that prevents bad addresses from reaching the geocoder. The Month View and Today View paths show the Supabase realtime subscription loop that makes all screens reactive without page refresh. A prose description of this architecture would take multiple paragraphs and be harder to navigate than a diagram that communicates the same information in a glance.

GitHub's native Mermaid rendering is what makes this worth including rather than exporting a PNG. An exported image goes stale the moment the architecture changes and requires a separate tool to update. A Mermaid diagram in the README is live documentation: it can be updated alongside the code in the same commit, and it renders correctly in the repository browser, in pull request previews, and in any Markdown renderer that supports Mermaid. For a case study that documents AI decision-making across a full build, having the architecture diagram in version control alongside the code is the right choice.

---

## Entry 37 — Autocomplete Dropdown Timing Fix

**Asked:**
Screenshot showing the red ring (invalid state) with "RIGDID" typed, but no dropdown visible. "DROPDOWN NOT SHOWING UP"

**Produced:**
Identified the root cause: `queryPlaces` was gated on `mapsLoaded` being `true`, but `mapsLoaded` is an async React state value that lags behind the actual script load. When the user types before the Maps API finishes initialising, `mapsLoaded` is still `false` and the function returns early without making the API call or showing suggestions.

Two fixes:

1. **Direct window check**: Replaced the `mapsLoaded` guard with `window.google?.maps?.places?.AutocompleteService` — the actual constructor object, read at call time. This is synchronous and accurate; `mapsLoaded` can be `false` while `window.google` is already populated.

2. **Re-fire on load**: Added `pendingLocationRef` to track the last typed value. A `useEffect` watching `mapsLoaded` calls `queryPlaces(pendingLocationRef.current)` when the API finishes loading — so any text typed before the API was ready automatically triggers a query the moment it becomes available.

**Decided:**
Accepted. Using a React state flag as a proxy for `window.google` availability is a category of async timing bug that appears frequently with external scripts. The correct pattern is to read the actual object (`window.google.maps.places`) at the moment of the call, not a React state snapshot from some earlier render. The `pendingLocationRef` retry makes the UX forgiving: the user can type immediately after opening Add Shift and the dropdown appears as soon as the Maps API loads, with no manual re-type required.

---

## Entry 41 — Shifts With Unfamiliar Labels/Icons Dropped from Screenshots

**Asked:**
Screenshot of a scheduling calendar (May 2026) where most shifts were skipped on upload — only the "Time Off" day on May 5 should have been excluded, but entries with different tags below the time (e.g. "Train C2 w...", "Train IV1 w...", and a May 26 entry showing a different icon next to "C3") weren't being added either.

**Produced:**
Root cause was in the extraction prompt (`src/utils/extractShifts.js`, mirrored in the unused `supabase/functions/extract-shifts/index.ts`). The prompt said `INCLUDE only confirmed, scheduled work shifts` and `SKIP ... shifts shown with dashed or dotted borders (pending, open, or unconfirmed)`. Claude was generalizing "confirmed" too broadly — entries with an unfamiliar icon, badge, or label (training tags, swap/exchange icons, role codes) got classified as "unconfirmed" and dropped, even though they clearly displayed a start-end time range.

Rewrote both prompts: any entry showing a start-end time range (e.g. "6a - 1p") is now explicitly a confirmed shift to extract, regardless of color, border style, icon, badge, or label text — those are called out as "extra metadata" that is "NEVER a reason to skip a shift." The SKIP list was narrowed to exactly two cases: entries with no time range labeled Off/Day Off/Time Off/RDO/Holiday/etc., and dates from an adjacent month's calendar overflow. The dashed-border "pending/unconfirmed" exclusion was removed entirely.

**Decided:**
Accepted. The dashed-border rule was added in Entry 18 for a specific screenshot format (Vanderbilt/Nashville General dashed-border open shifts), but it gave the model a vague heuristic — "unconfirmed" — that it applied to any visually unusual shift block, not just genuinely empty/open placeholders. The fix trades that heuristic for a concrete, visually-checkable signal (does this block show a time range?), which matches the actual product requirement: every worked shift should land on the calendar, and "Time Off" is the only thing that should not.

---

## Entry 42 — App Stuck on "Loading…" Forever

**Asked:**
Screenshot of the live site (`akezi4h-dev.github.io`) showing only a dark screen with "Loading…" centered — the app never progressed past this state.

**Produced:**
Traced the screen to `App.jsx`'s top-level gate: `if (loading) return <div>Loading…</div>`, where `loading` comes from `useAuth()`. In `src/hooks/useAuth.jsx`, `loading` is only set to `false` inside `supabase.auth.getSession().then(({ data: { session } }) => {...})` — there was no `.catch()` or `.finally()`. If that promise rejects (e.g. the Supabase project is unreachable or paused) or resolves with an unexpected shape (destructuring `data.session` throws), the `.then()` callback never runs to completion and `setLoading(false)` is never called — the app hangs on "Loading…" indefinitely with no error shown.

Fixed by restructuring the `getSession()` call: `.then(({ data, error }) => ...)` now logs any `error` and safely reads `data?.session?.user`, a `.catch()` handles outright promise rejection (sets `user` to `null`), and a `.finally(() => setLoading(false))` guarantees the loading gate always clears — successful, errored, or rejected — so the app always reaches either the Login screen or the main app instead of hanging.

**Decided:**
Accepted. This is a defensive fix for a hang with no console-visible cause to the end user. It doesn't address a potential underlying cause (e.g. a paused Supabase free-tier project after a period of inactivity, which returns non-JSON/error responses to auth calls) — if sign-in itself now fails on the Login screen, the Supabase project status should be checked in the dashboard. But the app should never again be stuck on a silent, un-recoverable "Loading…" screen — any auth-check failure now surfaces the Login form, where Login.jsx already displays `error.message` from failed sign-in attempts.

---
