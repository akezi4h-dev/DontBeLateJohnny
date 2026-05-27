# AI Resistance Log
### Shift Stack — AI 201 Project 3
*Each entry documents what AI gave, why it was rejected, what was done instead, and why that decision is better.*

---

## Entry 01 — AI Proposed Stubbing OCR for the First Contact Session

**What AI gave me:**
When asked to add Tesseract OCR, AI recommended a compromise: wire up the upload button UI so Johnny can see it exists and react to it, but don't build the actual Tesseract processing until after the first contact session. The reasoning was that OCR is complex, parsing is brittle, and Johnny hasn't indicated he specifically wants this feature yet — he just takes screenshots.

> "For the session today, you don't need OCR working at all. Johnny hasn't asked for it yet — it's on the PRD because of his screenshot habit, but he hasn't seen the app. Manual entry via Add Shift might be enough to test the core flow."

**Why I rejected it:**
A stub button proves nothing in a user test. If Johnny taps Upload and gets a placeholder screen, we learn that he tapped it — that's all. We don't learn whether the feature concept is right, how he photographs his schedule, whether the parsed output makes sense, or whether he'd actually replace his screenshot-sticker workflow with this. The whole point of first contact is to see how Johnny responds to real functionality, not mockups.

**What I did instead:**
Directed AI to wire Tesseract fully — file picker, OCR processing with a progress bar, parsed shift review screen, employer correction dropdown, and import to Supabase. All of it live before the session.

**Why it's better:**
Johnny's entire workaround is screenshot-based. Showing him a real OCR upload — even an imperfect one — directly confronts the behavior the PRD was built around. His reaction to a working upload feature (whether it succeeds, fails, or surprises him) generates real design feedback. A stub generates none.

---

## Entry 02 — AI Couldn't Do What I Asked (Apple Vision Framework)

**What AI gave me:**
Asked for Apple Vision Framework as the OCR technology. AI returned a technical rejection: Apple Vision Framework is native iOS only, not accessible from a PWA or web browser. Offered a comparison table of three alternatives instead.

**Why I rejected it:**
I didn't reject the reasoning — AI was technically correct. Apple Vision Framework requires Swift/Objective-C and cannot be called from Safari or any browser-based application. This wasn't a preference call, it was a platform constraint. The rejection of Apple Vision was valid.

What I rejected was the implicit suggestion toward the paid options (Claude vision API, Google Vision API). The comparison table listed accuracy and cost, and the most accurate options were not free.

**What I did instead:**
Chose Tesseract.js specifically because it is free and runs entirely in the browser. Accepted the accuracy tradeoff.

**Why it's better:**
This is a class project with no budget. A working free solution that sometimes misreads a time is better than a perfect paid solution that can't be afforded. Tesseract.js also runs client-side — no server, no API key management, no cost that scales with Johnny's usage. For a single-user app processing ~20–30 screenshots a month, the free browser-based option is the right architecture, not a compromise.

---

## Entry 03 — AI Asked Questions Instead of Building

**What AI gave me:**
After receiving the full PRD with a clear Claude Code prompt section that said "Copy and paste this entire prompt into Claude Code to scaffold the project," AI asked three clarifying questions before writing a single line of code: GitHub username, which branch, and how complete the prototype needed to be for tomorrow's session.

**Why I rejected it:**
The questions weren't wrong — they were stalling. The PRD had everything needed to start. The Claude Code prompt section was labeled "Copy and paste this entire prompt into Claude Code to scaffold the project" — that's not an ambiguous instruction. Two of the three questions (GitHub username, branch) were configuration details that could have been handled with sensible defaults or asked mid-build without blocking the scaffold. The third question (scope for tomorrow's session) was answered explicitly in the PRD's milestone table.

**What I did instead:**
Answered all three questions immediately and directly: `DontBeLateJohnny`, `main`, Month View and Shift Card for tomorrow. Pushed AI to start building rather than continuing the Q&A.

**Why it's better:**
The session had a hard deadline — first contact with Johnny was the next day. Every question that didn't need to be answered before the scaffold was time lost from building. More importantly, the pattern AI was defaulting to — ask until all uncertainty is resolved before touching code — is wrong for deadline-driven builds where some questions can only be answered by seeing the thing. The right model: ask the minimum that's truly blocking, build the maximum that can be built, fix during iteration. AI's caution is reasonable in open-ended contexts with no deadline. It was wrong for a build that had one shot at being ready for a real user in less than 24 hours.

---

## Entry 04 — AI Produced a White Page with No Diagnosis

**What AI gave me:**
After the first GitHub Pages deployment, the live URL served a completely blank white page. AI's initial response was to check asset paths in the built `index.html`, confirm they looked correct, and suggest the issue might be a Pages configuration problem.

**Why I rejected it:**
The diagnosis was surface-level. "Asset paths look correct" is not a diagnosis — it's an observation that leaves the root cause entirely unaddressed. The actual cause was that the GitHub Actions `deploy` job ran before the required secrets (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) were added to the repository's secrets settings. At Vite build time, `import.meta.env.VITE_SUPABASE_URL` resolved to `undefined`. That produced `createClient(undefined, undefined)`, which threw a Supabase client initialization error at load time — crashing React before it could mount a single component. The white page was a JavaScript runtime error, not a missing file.

**What I did instead:**
Pushed back with the actual symptom: "this is a white page, not a 404." Forced AI to go deeper than checking the HTML. Eventually surfaced the real cause through the console error path: secrets missing from the build environment. Added secrets to repository settings, re-triggered the Actions job, site loaded correctly.

**Why it's better:**
The surface-level diagnosis would have sent debugging effort toward checking asset paths, base URL config, and Vite build output — all of which were already correct. Identifying the real cause (env vars resolving to `undefined` at build time, producing an unhandled throw before React mounted) pointed directly at the fix. This established a debugging heuristic that proved useful across the rest of the build: a blank page on a deployed React app means JavaScript crashed on load. The first diagnostic question is always "what does the browser console show," not "are the file paths correct." The console shows the exception type and call site; the HTML paths are just artifacts of a build that may have already succeeded.

---

## Entry 05 — AI Included Unrequested Seed Data

**What AI gave me:**
Without being asked, AI pre-populated `useShifts.jsx` with 12 hardcoded shifts across May 2026, one for each employer, spanning the month. It added a comment explaining the decision: "Seed data so the app looks real for first contact on May 13."

**Why I considered rejecting it:**
This was an uninstructed addition. The PRD data model section specifies localStorage with no seed data. Adding seed data changes the state of the application and could confuse Johnny if he sees shifts that don't reflect his real schedule.

**What I decided instead:**
Kept it. The reasoning AI gave was sound: an empty calendar for first contact makes it harder to evaluate the visual system. Johnny needs to see the color dots, the shift card, and the time display working together — not a blank grid. The seed data was clearly labeled and would be replaced by his real schedule through Supabase.

**Why it was actually better:**
First contact sessions need the product to look inhabited. An empty app invites "so what would this look like with my schedule" instead of "this is what my schedule looks like." The seed data moved the session from imagination to reaction. This was a case where AI anticipated a user testing need correctly without being directed to.

---

## Entry 06 — AI Defaulted to Email + Password Without Asking

**What AI gave me:**
When directed to add a login screen, AI defaulted to email + password without asking which auth method to use, noting it was going with that approach and that magic link was an alternative.

**Why I rejected it:**
I didn't reject the auth method choice — email + password was correct for Johnny's context. Supabase Magic Link would have sent an email every time the session expired, which is impractical for a healthcare worker who rarely uses email on shift. Password auth is simpler and fully within his control. What I rejected was AI's incomplete implementation: the login screen worked, but AI's default Supabase session expiry is 7 days of inactivity. A healthcare worker with two days off between shifts could easily hit that expiry and be prompted to log in again mid-week.

**What I did instead:**
After seeing the login screen, directed AI to make the session persistent — "remember when he's logged in and don't ask him to login again." Then extended the JWT expiry from the default 7 days to 90 days in Supabase Dashboard → Authentication → Settings → JWT expiry.

**Why it's better:**
Johnny uses this app daily across two devices — his iPhone while commuting and his desktop at home for shift planning. An app that prompts him to re-authenticate while he's between hospital locations, or before a shift starts, directly contradicts the product thesis. The PRD's entire argument is that Johnny will check one screen instead of managing three separate schedule sources — that value proposition only holds if the one screen is frictionless. Any login interruption breaks the habitual daily access pattern the app depends on. 90 days covers realistic usage: even during vacation, holidays, or slow weeks without shifts, the session stays valid. The tradeoff (longer session expiry = marginally higher risk if the device is compromised) is acceptable for a single-user personal scheduling tool that stores no sensitive clinical data.

---

## Entry 07 — Parser Was Built for the Wrong Screenshot Format

**What AI gave me:**
The original OCR parser was written to handle Science Provider and Teams scheduling system screenshots — formats where dates appear as "May 16" inline with shift data. When Johnny uploaded an iOS Calendar screenshot on first contact day, the parser returned zero shifts. The parser wasn't wrong for the format it was built for; it just wasn't built for the format Johnny actually uses.

**Why I rejected it:**
The PRD noted that Johnny takes screenshots of his schedule, but it assumed those screenshots came from the scheduling software portals (Science Provider, Teams). Johnny actually exports from iOS Calendar — the native Apple app — which uses a completely different layout: month names as standalone section headers, dates as bare numbers on their own lines, and timezone suffixes like "(CDT)" on time ranges.

**What I did instead:**
Directed AI to add stateful month tracking to the parser: (1) detect standalone month names as section headers and store them, (2) treat bare day numbers (like "16" or "16SAT") as dates relative to the current stored month, (3) skip "All Day" and "Off" lines that iOS Calendar uses for non-shift days.

**Why it's better:**
The fix handles both the original Science Provider / Teams format AND the iOS Calendar format without breaking anything. More importantly: the first contact session revealed a real assumption gap in the PRD. Johnny's screenshot workflow is iOS Calendar, not the scheduling portals. Building only for the portal format would have left the OCR feature permanently broken for his actual use pattern.

---

## Entry 08 — Tesseract Was Handed the Wrong Kind of Image

**What AI gave me:**
The OCR upload was passing the raw screenshot file directly to Tesseract. For the first two attempts (parser format mismatch, then the debug log) AI focused entirely on the text parsing layer — assuming Tesseract was reading the image correctly and the problem was downstream. The `[OCR raw]` output proved that assumption wrong: Tesseract was returning noise, not text.

**Why I rejected it:**
Both previous fixes were solving the wrong layer. The parser can't fix garbled input. The real failure was upstream: Tesseract never read the image correctly. iOS Calendar runs in dark mode — the screenshot has light text on a near-black background. Tesseract is trained on the opposite. Passing the raw file was always going to produce garbage.

**What I did instead:**
Directed AI to preprocess the image before OCR: draw to Canvas at 2x resolution, invert all pixel values, then pass the canvas to Tesseract. This converts the dark-mode screenshot into something Tesseract can actually read.

**Why it's better:**
Image preprocessing is the correct layer to fix this, not parser tuning. No amount of regex changes would have recovered text that was never extracted. The inversion fix addresses the actual signal loss, not its downstream symptoms.

---

## Entry 09 — Tesseract Was the Wrong Tool Entirely

**What AI gave me:**
After three rounds of Tesseract fixes (parser format, color inversion, binarization + PSM 11), OCR was still returning garbage on real iOS Calendar screenshots. AI kept patching the same broken foundation.

**Why I rejected it:**
Tesseract is a general-purpose document OCR engine. iOS Calendar screenshots are structured UI, not documents — they have colored tiles, variable font sizes, dark mode, and a grid layout that Tesseract's page segmentation was never designed for. Each fix added complexity without addressing the root problem: Tesseract cannot reliably read this type of image.

**What I did instead:**
Replaced Tesseract entirely with Claude Haiku vision via a Supabase Edge Function. Claude understands the screenshot semantically — it doesn't need preprocessing, format-specific parsers, or PSM tuning. It reads the image and returns structured JSON directly.

**Why it's better:**
The entire OCR layer went from ~150 lines of fragile, format-specific code to ~40 lines of clean API calls. More importantly, it works. The Tesseract path was producing diminishing returns — each fix required more code to handle a narrower edge case. Switching tools was the right call once it was clear the core technology was mismatched to the problem.

---

## Entry 10 — AI Assumed a Clean Integration Path That Didn't Exist

**What AI gave me:**
When proposing the Claude API switch, AI presented it as straightforward: create Edge Function, add secret, update frontend, done. The framing implied this was a simple swap that would resolve the OCR problem cleanly.

**Why I rejected it:**
Not a single step went smoothly. The actual sequence involved: no terminal access forcing a manual dashboard deploy, secrets not loading until after a redeploy, silent auth failures masking as empty results, model availability varying by account tier (Claude 3.x unavailable on new accounts), Claude ignoring its own prompt instructions and wrapping JSON in markdown anyway, and a frontend crash on null times for Off/Holiday entries that Claude correctly identified but the code never accounted for.

**What I did instead:**
Pushed through every layer — forced proper error surfacing in the Edge Function so errors were visible instead of silent, tested each model until finding one that worked, added markdown stripping when the prompt alone wasn't enough, and added null filtering when the data shape didn't match the frontend assumption.

**Why it's better:**
The integration that came out the other side is genuinely hardened. The Edge Function surfaces real Claude API errors instead of returning empty arrays. The model name is confirmed working. The markdown strip handles Claude's formatting inconsistency. The null filter handles Off/Holiday days. None of this would have existed if the integration had gone smoothly the first time. The struggle produced a more robust feature than a clean path would have.

---

## Entry 12 — AI Built Desktop-Only Drag

**What AI gave me:**
Drag-to-reschedule using the HTML5 Drag and Drop API. The feature worked — emoji indicators were draggable, drop targets highlighted, `updateShift` fired on drop. On desktop.

**Why I rejected it:**
The app's primary use case is mobile. Johnny checks his schedule on his iPhone while walking between hospital locations — that's the behavior the whole PRD is built around. A drag-to-reschedule feature that only works on desktop is a half-feature for this specific user. HTML5 DnD fires no events on touch screens; it's architecturally incompatible with mobile, not just untested.

**What I did instead:**
Asked directly: "Can it not be done on mobile as well?" Directed AI to find a cross-platform solution before merging.

**Why it's better:**
Pointer events work identically on mouse, touch, and stylus. The replacement implementation is actually cleaner — no HTML ghost image hacks, no dataTransfer string passing, no browser inconsistencies. The dead zone (8px movement before drag activates) also fixed a tap-to-open conflict that existed in the HTML5 version. Pushing back on the desktop-only implementation produced a better feature for all input types.

---

## Entry 13 — AI's useTasks Hook Had No Global Visibility

**What AI gave me:**
A `useTasks(shiftId)` hook that fetched tasks for a single shift on mount and subscribed to that shift's changes. The ShiftCard called it with the active shift's ID. This worked for the shift detail panel.

**Why I rejected it:**
Asking for the task checklist to be "based on the calendar" required the calendar grid itself to know which days had tasks. With a per-shift hook, MonthView would have needed to call the hook independently for every shift on every visible cell — that's potentially dozens of Supabase subscriptions per month view, all redundant. A hook designed for one component was being asked to serve an entire grid.

**What I did instead:**
Directed AI to refactor `useTasks` into a `TasksProvider` context that loads all of the user's tasks in a single query and subscribes to all changes through one realtime channel. Exposed `hasTasksForShift` and `allDoneForShift` as selectors that any component can call without triggering additional fetches.

**Why it's better:**
One query, one subscription, zero additional overhead per calendar cell. The global context also made the calendar indicators reactive — when Johnny checks off a task in the ShiftCard, the green ✓ updates on the calendar cell in the same render cycle. That wouldn't have been possible with independent per-shift hooks.

---

## Entry 14 — AI Would Have Proxied the API Key Through a Server

**What AI would have given me:**
The standard secure approach for calling a third-party API from a web app is to proxy the call through a backend — a Supabase Edge Function, a serverless function, or a small Express server. The API key lives on the server and never reaches the browser. AI defaults to recommending this pattern because exposing an API key in a JavaScript bundle is a security anti-pattern in production web applications.

**Why that would be wrong:**
This app has no backend beyond Supabase Edge Functions that were already added for OCR. Adding a second Edge Function just to proxy Anthropic API calls for icon generation would add a new deployment step, new Supabase secret management, new error surface, and network latency — all to protect an API key that belongs to the same person building the app. Johnny doesn't have an API key. There is no other user. The "attacker who reads the JavaScript bundle and steals the key" threat model doesn't apply when the bundle is only ever deployed to one person's personal app on GitHub Pages.

**What was done instead:**
The Anthropic API is called directly from the browser using `fetch`. The `anthropic-dangerous-direct-browser-access: true` request header is required to make this work — Anthropic's API rejects browser-origin requests without it, which is a deliberate gate that forces the developer to acknowledge the tradeoff explicitly rather than accidentally exposing a key. The API key is stored in `.env.local` (never committed) and injected by Vite as `import.meta.env.VITE_ANTHROPIC_API_KEY`. If the key is missing, the Generate button surfaces a clear error message pointing to `.env.local`.

**Why it's better:**
A proxy would have added infrastructure complexity to protect against a threat that doesn't exist for this user. The direct browser call is honest about what the app is — a personal tool, not a multi-tenant product. Anthropic's `dangerous-direct-browser-access` header is the right mechanism: it doesn't prevent the pattern, it just requires the developer to opt in knowingly. For a single-user app with no server and no intention of becoming one, that's the correct architectural call.

---

## Entry 11 — AI Would Have Used a Supabase Table for Categories

**What AI would have given me:**
A natural implementation of a categories system in a Supabase-backed app would add a `categories` table in PostgreSQL, with RLS, realtime subscription, and full sync across devices — mirroring how shifts and tasks are stored.

**Why that would be wrong:**
Categories are UI preferences, not shared data. Johnny uses this app alone. He's not collaborating with anyone who needs to see his custom category colors. A Supabase table for categories adds a schema migration, a new RLS policy, another realtime channel, and database reads on every category lookup — for data that a `localStorage` key handles just as well. The added complexity serves no user need.

**What was done instead:**
Categories are stored entirely in `localStorage` under `shiftstack_all_categories`. Built-in categories initialize on first load. Custom categories append to the same key. The `getCategoryByKey(key)` function resolves from the in-memory array on every render — no async, no loading state, no database round-trip.

**Why it's better:**
The categories feature shipped as pure UI state. No Supabase dashboard changes, no SQL to run, no migration. The existing shift records in Supabase store category keys (`publix`, `vanderbilt`, `nashville_general`, `custom_1234`). The display layer reads the key and looks it up in categories — so renaming a category or changing its color is instant and zero-cost. The tradeoff is that categories don't sync between devices (Johnny's phone and desktop would have different custom categories), but Johnny hasn't asked for that and the built-in three are always present on every device.

---

## Entry 16 — AI Used an IIFE When a Variable Would Have Done It

**What AI gave me:**
When asked to fade past calendar dates, AI scoped `todayStr` inside `cells.map` by wrapping the entire map in an IIFE: `{(() => { const todayStr = ...; return cells.map(...) })()}`. This introduced a deeply nested bracket sequence that required precise closing syntax (`})`)()`) to terminate correctly.

**Why I rejected it:**
The IIFE was unnecessary complexity. `todayStr` is `toISODate(today.getFullYear(), today.getMonth(), today.getDate())` — a synchronous, side-effect-free expression. It can be computed in component scope on any render, the same way `const cells = getCalendarDays(year, month)` is computed. Nothing about it required block-scoping inside the map callback.

**What was done instead:**
The IIFE pattern broke the calendar across two commits before being fully repaired (documented in Direction Entries 25–26 and Resistance Entry 15). The root fix was having `todayStr` declared in component scope directly, where it could be referenced anywhere in the JSX without any extra wrapping.

**Why it's better:**
One line in the right place: `const todayStr = toISODate(today.getFullYear(), today.getMonth(), today.getDate())` alongside `const cells = getCalendarDays(year, month)`. No IIFE, no nested brackets, no bracket counting. The simpler the scope decision, the harder it is to break the closing syntax on the next edit.

---

## Entry 17 — AI Gated on React State Instead of the Actual API Object

**What AI gave me:**
The location autocomplete `queryPlaces` function was gated with `if (!mapsLoaded || !window.google)` — using `mapsLoaded`, a React state boolean set by `useJsApiLoader`, as the guard for whether the Places API was ready to use.

**Why I rejected it:**
The dropdown didn't appear. Typed "RIGDID", got the red ring (invalid state), no suggestions. `mapsLoaded` is an async React state value — it is `false` until the `useJsApiLoader` hook resolves, which happens on the next render after the script loads. The user typed before that render cycle completed, the guard returned early, and no query was made. The fundamental problem: using a React state snapshot as a proxy for `window.google` availability conflates two different things — the JS object being present on `window` (synchronous, happens when the script executes) and a React state flag being `true` (async, happens one render after).

**What was done instead:**
Replaced the `mapsLoaded` guard with `window.google?.maps?.places?.AutocompleteService` — the actual constructor, checked at call time. Added `pendingLocationRef` to track whatever the user last typed; a `useEffect` watching `mapsLoaded` replays the query when the API finishes loading so text typed before the API was ready still produces results.

**Why it's better:**
Reading `window.google.maps.places.AutocompleteService` is the ground truth — either the constructor exists or it doesn't. No React render cycle required. The retry effect means the UI is forgiving regardless of network speed: type immediately, see the dropdown appear the moment the API is ready, no manual re-type needed.

---

## Entry 18 — No Terminal Forced Client-Side Architecture Over Server-Side Fix

**What AI gave me:**
The Supabase `extract-shifts` Edge Function was using `claude-3-5-haiku-20241022`, a model that no longer exists on new Anthropic accounts in 2026. Screenshots were returning 502 errors. The clean fix would have been to update the model string in `supabase/functions/extract-shifts/index.ts` and redeploy — a one-line change and one CLI command (`supabase functions deploy extract-shifts`). AI's default instinct was to fix the edge function and redeploy.

**Why I rejected it:**
No terminal access. No Supabase CLI installed. The Supabase dashboard "Edit via Editor" had already proven unreliable in Entry 15 — it let code be saved but didn't guarantee the secret or deploy state would match. Attempting another dashboard-based redeployment risked repeating the same sequence of silent failures that took multiple sessions to debug the first time.

**What I did instead:**
Bypassed the edge function entirely. Created `src/utils/extractShifts.js` to call the Anthropic API directly from the browser — the same pattern already used for AI icon generation in `generateCategoryIcon.js`. The `VITE_ANTHROPIC_API_KEY` was already in the bundle. No new infrastructure, no deployment step, no Supabase involvement.

**Why it's better:**
The constraint forced a simpler architecture. The edge function was a proxy that existed only to keep the API key server-side — a security pattern that doesn't apply when the same key is already in the browser bundle for another feature. Removing the proxy removed a network hop, a deployment dependency, a Supabase secret, and an entire failure surface. The result is fewer moving parts, not a compromise. Constraints in this project have consistently pushed toward better-architected solutions than the default path would have produced.

---

## Entry 15 — AI's "Fix" Introduced a Different Syntax Error (Two Bad Commits in a Row)

**What AI gave me:**
The original broken IIFE closing on line 373 of `MonthView.jsx` was `})}())}` — 7 characters where the invocation `()` appeared before the outer paren `)`, making the sequence malformed. A prior session produced a commit titled "Fix broken calendar grid — malformed IIFE closing syntax." That commit changed the closing to `})}()}` — 6 characters. The calendar still showed a lone `0` in the grid area. A different broken sequence replaced the first one.

**The full bracket analysis — why it was confusing:**

The IIFE in MonthView opens on line 283 as `{(() => {` and the map callback opens on line 285 as `return cells.map((day, i) => {`. The correct closing, character by character:

| Char | Closes |
|------|--------|
| `}` | map callback `(day, i) => {` |
| `)` | `cells.map(` |
| `}` | IIFE body `() => {` |
| `)` | outer wrapping paren `(` from `{(` |
| `(` | IIFE invocation open |
| `)` | IIFE invocation close |
| `}` | JSX expression `{` |

Correct sequence: `})`)()}`  (7 characters).

The "fixed" commit produced `})}()}` (6 characters) — the outer paren `)` was dropped entirely. The result is syntactically ambiguous: the JS parser sees the IIFE invoked inside a dangling expression with no outer paren to close, which evaluates to something React renders as `0`.

**Why this happened — and why it keeps happening:**

This IIFE was introduced in Entry 29 ("Past Date Fading") to scope `todayStr` inside the map. The pattern `{(() => { const x = ...; return array.map(...) })()}` has seven closing characters after the deepest nested content. Visually counting seven characters across `}`, `)`, `}`, `)`, `(`, `)`, `}` in an editor is prone to transposition and omission. Two separate attempts — once in the prior session's fix commit and once in the fix for that fix — both produced wrong sequences by visual inspection alone.

**Why I rejected it:**

The symptom (calendar shows `0`) was still present. `0` in React is a rendered falsy number, which means the JSX expression was evaluating to the number 0 rather than an array of elements. The "fixed" closing `})}()}` is not syntactically valid JavaScript: Node.js throws `SyntaxError: Unexpected token '('` on it immediately. Any JS runtime would reject it. Vite/Babel may have been more tolerant during the development build, but the CI pipeline runs `npm run build` which uses Vite's production build path — and that failed with exit code 1 (documented in Entry 26).

**What was done instead:**

Discarded visual bracket counting entirely. Reproduced the pattern in a plain Node eval:

```js
node -e "
const cells = [null, null, null, null, null, 1, 2, 3];
const result = (() => {
  return cells.map((day, i) => {
    if (!day) return 'empty';
    return day;
  })
})();
console.log(result.length);
"
```

Output: `8` — correct. Then tested the broken form:

```js
})}()}  // inside equivalent structure
```

Node: `SyntaxError: Unexpected token '('` — confirmed broken. Then derived `})`)()}` from the bracket table above, tested it, got `8`, applied to `MonthView.jsx`, ran `npm run build` (3.05s clean), committed, pushed. CI went green.

**What this episode reveals about the IIFE itself:**

The root cause is not bad syntax-fixing — it's that the IIFE was the wrong tool for the job. `todayStr` is `toISODate(today.getFullYear(), today.getMonth(), today.getDate())` — a synchronous, pure expression. It should have been declared in component scope alongside `const cells = getCalendarDays(year, month)`. No IIFE, no 7-character closing sequence, no bracket errors possible. Every time this line has been edited since Entry 29, there has been a closing syntax bug. The IIFE is the cause, not an unlucky coincidence. (Documented separately in Resistance Entry 16.)

**Why it's better:**

Testing bracket sequences in isolation before committing is the only reliable method. Visual counting fails at depth ≥ 4. A 10-second `node -e` would have caught both broken commits before they reached the repo. The correct debugging loop for any closing-bracket question: write the minimal reproducer, run it, confirm the result, then apply to the source. The two bad commits cost two CI runs, two deployments to fix, and created the gap that led to the CI failure in Entry 26. Execution testing would have reduced that to zero.

---
