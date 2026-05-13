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
The questions weren't wrong — they were stalling. The PRD had everything needed to start. The Claude Code prompt was explicit. Two of the three questions (GitHub username, branch) were configuration details that could have been asked mid-build or handled with a placeholder.

**What I did instead:**
Answered all three questions immediately and directly: `DontBeLateJohnny`, `main`, Month View and Shift Card for tomorrow. Pushed AI to start building.

**Why it's better:**
The session had a hard deadline — first contact with Johnny was the next day. Every question that didn't need to be asked before the build was time lost. The right model for a deadline build is: ask the minimum, build the maximum, fix during iteration. AI's caution was reasonable in a normal context but wrong for this timing.

---

## Entry 04 — AI Produced a White Page with No Diagnosis

**What AI gave me:**
After the first GitHub Pages deployment, the live URL served a completely blank white page. AI's initial response was to check asset paths in the built `index.html`, confirm they looked correct, and suggest the issue might be a Pages configuration problem.

**Why I rejected it:**
The diagnosis was surface-level. "Asset paths look correct" is not a diagnosis — it's an observation. The actual cause was that the Supabase build ran before the GitHub secrets (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) were added to the repository. This meant `import.meta.env.VITE_SUPABASE_URL` resolved to `undefined` at build time, causing `createClient(undefined, undefined)` to throw on load and crash React before it mounted. The white page was a JavaScript runtime error, not an asset path issue.

**What I did instead:**
Pushed back with the actual symptom ("this is what I see") and forced AI to go deeper. Eventually identified the real cause: secrets missing from the build environment. Re-ran the Actions job after adding secrets.

**Why it's better:**
The surface-level diagnosis would have sent time toward checking HTML paths that were already correct. Identifying the real cause (env vars undefined at build time) pointed directly at the fix. The lesson is that a blank page on a deployed React app almost always means JavaScript crashed on load — the first question should be "what error does the console show," not "are the asset paths right."

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
I didn't reject the choice — email + password was the right call for Johnny's context. But I did add a requirement AI hadn't included: persistent sessions. AI built a login screen that would work but would ask Johnny to log in again after every session expiry.

**What I did instead:**
After seeing the login screen, directed AI to keep him logged in and not prompt again. Then extended the JWT expiry from 7 days to 90 days in Supabase settings.

**Why it's better:**
Johnny uses this app daily across two devices while walking between hospital locations. An app that interrupts him with a login screen mid-month would break the use case entirely. The PRD's entire argument is that Johnny will check one screen instead of three — that only holds if the one screen is frictionless. Persistent 90-day sessions remove an interruption that would have contradicted the product's core thesis.

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
