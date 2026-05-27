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
Accepted for the initial push, but the scope was immediately identified as incomplete — HTML5 DnD is not supported on touch screens. Desktop worked. Mobile did not.

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
Accepted. "9:30am → 6pm" reads naturally. "9:30a → 6p" was a shorthand that made sense in code but looked unfinished in the UI.

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
Screenshot showing the month view rendering a lone `0` in the calendar grid instead of date cells. Caption: "This still isn't working."

**Produced:**
Diagnosed the cause by testing the IIFE closing sequence in isolation with Node. The closing on line 373 of `MonthView.jsx` was `})}()}` — only 6 characters, missing the `)` that closes the outer wrapping paren from `{(() => {`. In Node the pattern threw `SyntaxError: Unexpected token '('`. The correct sequence is `})})()}`: close map callback `}`, close `.map(` `)`, close IIFE body `}`, close outer paren `)`, invoke `()`, close JSX expression `}`. One character inserted, build passed, committed and pushed.

**Decided:**
Accepted. The prior commit ("Fix broken calendar grid — malformed IIFE closing syntax") had attempted the same fix but produced `})}()}` instead of `})})()}` — a different malformed sequence. The real fix required testing the JS in isolation, not relying on Vite's tolerance.

---

## Entry 26 — GitHub Actions CI Failure on Deploy Job

**Asked:**
Screenshot of GitHub Actions showing `deploy-function` green, `deploy` red, exit code 1. No other context.

**Produced:**
Identified that the `deploy` job runs `npm run build`, and the same IIFE syntax error that broke the browser render also broke Vite's build step. The CI failure was a downstream symptom of Entry 25's bug. Applied the fix from Entry 25, confirmed `npm run build` completes successfully locally in 3.4s, committed, pushed.

**Decided:**
Accepted. The CI pipeline is minimal — checkout, node setup, `npm ci`, `npm run build`, upload artifact, deploy pages. Syntax errors in JSX are the most common reason `npm run build` fails at this layer. No workflow changes were needed.

---

## Entry 27 — Clickable Day Rows Show Route on Commute Map

**Asked:**
"Make it when I click on the day I can see the route for the day."

**Produced:**
Added `selectedDate` state to `CommuteView` (defaulting to today). Changed each day header from a `<div>` to a `<button>` with an `onClick` that sets the selected date. When a day is selected, a small `· route shown` badge appears next to the date label. The `selectedShifts` derived value (previously computed as `getShiftsForDate(selectedDate)`) is passed to `CommuteMap` via the `shifts` prop instead of `todayShifts`. `CommuteMap` was updated to accept `dateLabel` (e.g. `"Thursday"`) and render it as `"Thursday's Route"` in the map header strip.

The geocoding, direction-building, and fitBounds effects in `CommuteMap` already depended on the `shifts` prop, so switching days re-geocodes new employers and re-routes automatically without further changes.

**Decided:**
Accepted. The clickable day label is the right affordance — tapping the date header is intuitive and doesn't require the user to discover a hidden interaction. The `· route shown` badge confirms which day the map is currently displaying without adding heavy UI.

---

## Entry 28 — Task Locations as Commute Waypoints

**Asked:**
"When I add a task for the day, can I also add a location for the task to add it as part of the commute tab?"

**Produced:**
Six files changed across four layers:

1. **Database** — `supabase/migrations/003_add_task_location.sql` adds `location text default null` to the `tasks` table. `schema.sql` updated to match.

2. **`useTasks.jsx`** — `rowToTask` includes `location`. `addTask(shiftId, text, location?)` accepts an optional third argument. New `updateTaskLocation(id, location)` mutation exposed through the context.

3. **`ShiftCard.jsx`** — `TaskRow` component gained a 📍 pin button that appears on hover: tapping opens an inline text input (blur/Enter saves, Escape cancels). When a location is set, it shows as a blue-tinted address badge below the task text. The add form gained a 📍 toggle button between the text field and the + button; toggling it reveals a location input that submits alongside the task text.

4. **`CommuteView.jsx`** — Imports `useTasks`. Computes `taskStops` (array of `{text, address}`) by calling `getTasksForShift` on each of the selected day's shifts, filtering to tasks with locations. Passes `taskStops` to `CommuteMap`.

5. **`CommuteMap.jsx`** — Accepts `taskStops` prop. The single geocoding effect now handles both employer addresses (`geoCache[employer_key]`) and task stop addresses (`geoCache["task:<address>"]`). The direction-building effect adds geocoded task positions as `waypoints` to the first leg (home → first employer). A `taskIcon` (white pin with a checkmark SVG) is rendered as a distinct `<Marker>` for each geocoded task stop. `fitBounds` extended to include task stop positions.

**Decided:**
Accepted. Adding task locations to the first leg only is the right default — the typical use case is a stop on the way to work, not between employers. The `task:` prefix on geocache keys avoids collisions with employer keys. Storing location as free-text address (rather than coordinates) keeps the input frictionless; geocoding happens on first map load and caches persistently.

---

## Entry 31 — Zoom +/− Buttons on Commute Map

**Asked:**
"Can you also add a plus and minus button for the map"

**Produced:**
Two frosted-glass buttons stacked in the top-right corner of the map container, absolutely positioned as an overlay with `pointer-events: none` on the wrapper and `pointer-events: auto` on each button so the map beneath stays interactive. `+` increments `mapRef.getZoom() + 1`; `−` decrements. Border radius is asymmetric: top button rounds on top corners, bottom button rounds on bottom corners, giving a joined pill appearance. Styled with `rgba(14,14,14,0.85)` background and `backdrop-filter: blur(12px)` matching the "Update home" button. The `−` uses the Unicode minus sign (`−`) rather than a hyphen to render at the correct visual weight.

**Decided:**
Accepted. `gestureHandling: 'none'` (at the time) blocked pinch-to-zoom on iOS, making the +/− buttons the only way to zoom on mobile. Programmatic zoom via `mapRef.setZoom()` works regardless of gestureHandling — the option only gates user gesture input, not API calls.

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
Accepted. The day label button was already the right interaction, but it's a small tap target at the top of the section. Making the entire shift card tappable gives a much larger hit area for the same action — especially important on mobile where the cards dominate the screen. The outline ring closes the feedback loop: tapping any card shows which day the map is currently routing.

---

## Entry 34 — Shift Stack Logo in Sidebar

**Asked:**
Screenshot of sidebar showing "Yo Johnny" / "Good to see you Johnny" greeting. "Can you make it say shift stack for the words near the nav bar"

**Produced:**
Removed the `GREETINGS` array and random greeting from `Sidebar.jsx`. Replaced the greeting `<div>` with the three-bar icon + wordmark lockup matching the login screen: a 32×32 dark-rounded box containing three stacked bars in Publix green (#00A651), Vanderbilt gold (#CFB87C), and Nashville General blue (#2D6DB5) at 71% and 43% widths respectively, followed by "Shift" in white and "Stack" in `text-white/40`. `useState` import removed since it was only used for the greeting.

**Decided:**
Accepted. The rotating greeting was appropriate for a prototype but not for a tool used daily — it added noise without information. The logo is identifiable, consistent with the login screen, and leaves the sidebar header as a stable landmark rather than a random message.

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
Accepted. The prompt instruction is correct but the model is non-deterministic — it sometimes follows formatting instructions and sometimes doesn't, especially at lower temperature or on shorter responses. The defensive strip is the right layer to add this: cleaning the raw string before parsing means the code is correct whether or not the model obeys the instruction. The same strip was already present in the edge function from Entry 15; the new client-side path needed the same guard.

---

## Entry 40 — Mermaid Architecture Diagram in README

**Asked:**
"Make a mermaid diagram and add it to the section after user testing in the readme."

**Produced:**
Added Section 12: "App Architecture & User Flow" to `README.md` immediately following Section 11 (User Testing). The flowchart traces the full system from Supabase Auth entry through five screen paths: Upload Schedule (screenshot → Canvas compression → Anthropic AI → review → Supabase), Add Shift Manually (form → Google Places → Supabase), Month View (tap date → shift card → tasks → Supabase), Commute View (commuteCalc → leave-time display), and Today View (glance state). Realtime sync loop shown as a return edge from Supabase back to Month View.

**Decided:**
Accepted. The diagram bridges the UX research document and the technical implementation — it shows how the decisions traced through the README (screenshots, commute, tasks) map onto actual system components and data flows. GitHub renders Mermaid natively in READMEs, so no image export or external tool is needed.

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
