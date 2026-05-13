# 🚑 The Ambulance Sticker Problem
### Six Roles, Three Hospitals, One Broken System
 
> *"The schedule tells him where to be. This tool tells him whether he can also be everything else."*
 
---
 
## 📋 Overview
 
This is a pre-AI UX design thesis documenting a real person, a real problem, and a defensible definition of "helped." Every claim is grounded in direct quotes, observed artifacts, and documented behavior nothing is invented or assumed.
 
---
 
## 👤 Section 1 — The Person
 
**Johnny Truong** is a 35-year-old Vietnamese American man living in the suburbs outside Nashville, Tennessee.
 
On any given week, he holds shifts across three separate hospital systems while managing multiple additional roles:
 
| Role | Employer |
|---|---|
| 💊 Pharmacist | Publix |
| 💊 Pharmacist | Vanderbilt Hospital |
| 💊 Pharmacist | Nashville General Hospital |
| 🏠 Real Estate Agent | Independent |
| 💅 Nail Shop Co-Owner | Independent |
| 👨‍👧 Father | — |
 
He is not disorganized. He is overloaded by systems that were never built to coexist. Each employer controls its own scheduling platform, its own login, and its own two-factor authentication. None of them talk to each other and Johnny lives in the gaps between them.
 
### By the Numbers
 
| | |
|---|---|
| **6** | Concurrent roles across employers |
| **3** | Separate hospital scheduling systems |
| **1–2 months** | How far in advance schedules are sent |
 
---
 
## 🔥 Section 2 — The Problem
 
Johnny struggles to manage a complex, multirole schedule across multiple employers with separate systems, logins, and verification steps making it nearly impossible to view his schedule in one place.
 
### In His Own Words
 
> *"Different logins. Different passwords. Two factor authentications."*
> — On what's hardest about switching between hospital systems
 
> *"When things change last minute I have to basically paint/photoshop my shit lol."*
> — On schedule changes
 
> *"Ease, frequency of changes, lack of drive to look for something better."*
> — On why he sticks with screenshots
 
> *"Habit."*
> — The single word that explains the whole system
 
> *"There's probably a calendar app for all this. I just haven't had the time to look."*
> — On awareness of alternatives
 
> *"My problems revolve around commute times and making sure I got the necessary time/bandwidth to take care of the things I need to do."*
> — On what the real problem actually is
 
### Observed Artifacts
 
**🚑 The Calendar**
Johnny screenshots his Publix scheduling app, then manually places ambulance emoji stickers over dates to mark Vanderbilt and Nashville General shifts. Days off get a hand-drawn X. This is his primary scheduling interface.
 
**📱 The Task System**
For tasks, Johnny texts reminders to himself, then edits or crosses them out within the message thread. No dedicated app. No connection between tasks and the shift they belong to.
 
### Pain Points
 
| # | Pain Point |
|---|---|
| 01 | The hardest mental task each week: **remembering which facility he's commuting to** — not the clinical work, the logistics |
| 02 | He checks his schedule **once a week or right before a shift** — because checking more often means logging into three separate systems |
| 03 | Last-minute changes break the entire system — the screenshot becomes outdated and has to be manually re-edited |
| 04 | Tasks live in a completely separate thread from his schedule — **no connection between what he needs to do and when he has time** |
 
---
 
## 👂 Section 3 — The Listening Plan
 
This isn't a one-time interview. Johnny's problem is dynamic — shifts change, commutes vary, and new friction surfaces weekly.
 
### Research Cadence
 
| Format | Frequency | Purpose |
|---|---|---|
| Text check-ins | 3× per week | Real-time friction, updates, emerging pain points |
| Scheduled call | 1× per week | Deeper conversation on root causes and design feedback |
| Natural observation | Ongoing | Evenings and post-shift, when he naturally reviews his schedule |
 
### Research Ethics
- ✅ Clear consent obtained before research began
- ✅ Permission granted to take notes and reference quotes
- ✅ Permission granted to use his information for this project
- ✅ Research conducted at natural moments, not manufactured ones
---
 
## ✅ Section 4 — What Help Looks Like
 
Johnny defined this himself, unprompted:
 
> *"It would be cool to have something that I can differentiate my days then when I click on the day I can add tasks to do and cross them off as I go."*
> — Johnny Truong, direct feature request
 
> *"Less stressful, Cause planned out further ahead and more accurate if it could update all 3 schedules in real time. Accuracy. Editable. Customizable. Fun."*
> — On what a better system would feel like
 
### Defensible Definition of "Helped"
 
**Johnny feels helped when he can open one screen the night before a workday and immediately know — without logging into three systems or doing any mental math — which employer he's working for, how long the commute will take, and whether the day has room for anything else.**
 
Tasks live on the day they belong to. When a shift changes, the view updates automatically. He stops photoshopping ambulance stickers at 10pm.
 
---
 
## 🛠️ Section 5 — The Approach
 
A **screenshot-to-schedule calendar app** that uses character recognition to automatically extract shift details from uploaded screenshots and converts them into structured events across multiple work calendars in one unified view.
 
### Core Features
 
**📸 OCR Screenshot Ingestion**
Upload or capture a schedule screenshot — the app reads it automatically and creates calendar events without manual re-entry.
 
**🏷️ Employer Tagging**
Each event is tagged by employer (Vanderbilt, Nashville General, Publix) with visual color labels so Johnny can scan a month view and instantly know where he's going each day.
 
**✅ Day-Level Task Lists**
Tap a day, add tasks, check them off as he goes — connected directly to that shift, not floating in a separate app or text thread.
 
**↔️ Drag-and-Reschedule with Version History**
When shifts change last minute, updates are fast and reversible — no re-screenshotting, no sticker replacement.
 
**🚗 Commute-Aware Alerts**
A real-time "leave now" notification calculated from his current location, the next shift's facility address, and live traffic — so he stops doing commute math in his head.
 
---
 
## 🎯 Section 6 — Position Going In
 
The core position: **eliminate the manual workaround loop** — the screenshot, the sticker, the Photoshop edit — by turning raw schedule information directly into usable, structured calendar events. The user should never have to touch a schedule twice.
 
### Assumptions & Open Questions
 
| | |
|---|---|
| ⚠️ **Open Question** | Can a lightly built app reliably support real-time commute notifications? Notifications are where trust lives — if they fail, the whole system fails |
| ⚠️ **Technical Concern** | What happens when the app is offline? For time-sensitive commute alerts, offline failure is a missed shift — a defined fallback is required |
| 💡 **Design Assumption** | Johnny knows a better solution probably exists. The barrier isn't awareness — it's time. The app must be low-setup and immediately useful from day one |
| 📏 **Success Metric** | Johnny stops texting himself reminders. Johnny stops editing screenshots. Johnny checks one screen instead of three. Observable. Falsifiable. |
 
---
 
## 🚫 Section 7 — What This Project Is Not
 
- ✕ **Not an offline machine** — Requires internet for real-time traffic, commute alerts, and schedule syncing. Offline capability is out of scope.
- ✕ **Not a replacement for employer systems** — Cannot change the login requirements, two-factor authentication, or access restrictions imposed by Vanderbilt, Nashville General, or Publix. It works *around* them, not *through* them.
- ✕ **Not a general productivity app** — Designed specifically for Johnny's multi-employer, multi-commute life. Not a calendar for everyone — a tool built around one person's observed, documented pain.
- ✕ **Not invented or assumed** — Every feature traces back to something Johnny said or something observed in his actual behavior. Features without evidence don't belong here.
---
 
## 💬 All Direct Quotes
 
| Quote | Context |
|---|---|
| *"Different logins. Different passwords. Two factor authentications."* | On switching between hospital systems |
| *"When things change last minute I have to basically paint/photoshop my shit lol."* | On schedule changes |
| *"Ease, frequency of changes, lack of drive to look for something better."* | On why he uses screenshots |
| *"Habit."* | The single-word explanation |
| *"There's probably a calendar app for all this. I just haven't had the time to look."* | On awareness of alternatives |
| *"Remembering which facility im going to."* | His biggest source of mental effort |
| *"I text myself reminders/lists and edit or cross out."* | His task management system |
| *"It would be cool to have something that I can differentiate my days then when I click on the day I can add tasks to do and cross them off as I go."* | His direct feature request |
| *"My problems revolve around commute times and making sure I got the necessary time/bandwidth to take care of the things I need to do."* | The real underlying problem |
 
---
 
*Primary Research conducted April 2026 · UX Research Thesis*
