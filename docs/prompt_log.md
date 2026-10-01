# Prompt Log — Fair Chance Job Harness (Next Chapter Week 3)

**Builder:** Mausi · **AI:** Claude (Cowork) · **Dates:** Sept 29–30, 2026
**Project:** A harnessed ChatGPT/Codex program that finds and fills job applications for justice-impacted job seekers, using only resume data.

---

## Iteration 1 — Brainstorm the program
**My prompt:** Brainstorm a precise prompt program and harness for ChatGPT/Codex to find job applications for justice-impacted people (using me as the example), from my real LinkedIn. Cover: how to identify and protect data, simplify Easy Apply, build a harness and delivery system, and how LinkedIn will react and what blockers to expect.

**Claude's response:** Claude researched LinkedIn's automation rules and recommended a human-in-the-loop design where the AI never touches LinkedIn. It proposed a 🟢/🟡/🔴 data-privacy system, a `resume.json` source of truth, an answer bank for Easy Apply, a Codex folder harness with a validator, and a blocker table (account restriction, CAPTCHAs, external ATS redirects, prompt injection, false "fair chance" labels).

**Judgment / notes:** The proposed starter code was in Python, which I later switched to JavaScript.

---

## Iteration 2 — Avoid drift across chats
**My prompt:** How do I start a new chat for each step without pasting the whole conversation, so the AI doesn't drift or hallucinate?

**Claude's response:** Claude created `PROJECT_BRIEF.md` in my Claude Project as a single source of truth: locked decisions, folder layout, schema, blockers, a step tracker and a handoff log. It gave me a starter prompt for each new chat, an end-of-step update ritual, and an optional custom instruction for the Project.

---

## Iteration 3 — JavaScript only + course requirements
**My prompt:** All code in JavaScript, no Python. Read my Next Chapter Atlas dashboard for "Week 3 Project Kickoff + The Trustworthy AI Lens" so we follow the guidelines and check items off. Update the project brief.

**Claude's response:** Claude locked "JavaScript only" into the brief. Atlas showed a sign-in screen in Claude's built-in browser, so Claude asked me to sign in.

---

## Iteration 4 — Read the dashboard from my Chrome
**My prompt:** Go to my open Chrome browser; that's my Next Chapter dashboard.

**Claude's response:** Claude used Claude in Chrome to read the Week 3 Day 1 lesson without submitting anything. It turned the lesson into a checklist in the brief: Day 1 tasks, the Fluency/Control/Responsible Use/Communication requirements, the Map/Measure/Manage lens with its four test moves, and the gate rubric (Technical 40 / Verbal 30 / Applied 30). It realigned the build steps to the course days (gate on Day 4) and added a rule that my quiz and lens answers stay in my own words.

---

## Iteration 5 — Push for more automation
**My prompt:** You and ChatGPT can both use my browser to fill out applications. What are LinkedIn's restraints, and how can we make the project more automated with a strict harness?

**Claude's response:** Claude quoted LinkedIn's User Agreement §8.2 and its Help Center: no bots, scrapers or browser add-ons that automate activity, with a risk of account restriction. It laid out an "automation ladder": off-LinkedIn automation is fine, reading one tab is a gray area, and AI searching or applying is prohibited. It also proposed an `agent-policy.js` rules file.

---

## Iteration 6 — "Working prototype within the hour"
**My prompt:** I want a detailed implementation plan, the blockers, and a working prototype within the hour.

**Claude's response:** Claude built v0.1: a zero-dependency Node.js pipeline that scores jobs with fixed rules (fair-chance signals, red flags, negations, resume-only skill matching), plus a validator, `AGENTS.md`, tests and a job-clipper bookmarklet. All 8 tests pass. A tamper test proved the validator catches a fake skill, a fake quote and a phone number.

**AI mistake caught (Measure):** The "weird-but-legal" test showed that "FAIR‑CHANCE" written with a non-breaking hyphen was silently missed. That was fixed with `normalize()` and logged in `TEST_RESULTS.md`.

---

## Iteration 7 — Fill-and-stop mode
**My prompt:** This doesn't simplify applying. Fill out the application inputs using only my resume (no AI bloat), do NOT hit Submit, and STOP for my final approval, with a limited number per 24 hours. Give me a step-by-step plan with my harness so I can prompt ChatGPT.

**Claude's response:** Claude built v0.2 fill-and-stop mode: `npm run prompt` generates a ChatGPT prompt with my data built in, and `npm run check-fill` checks every value the AI typed word-for-word against my resume. The rules: forbidden Submit buttons, blanks for record and EEO questions, contact fields left alone, and a 5-per-24-hour cap. All 10 tests pass. Claude listed the remaining blockers: the agent must run in my own browser, plus logins and CAPTCHAs, resume upload, custom questions, sample data, and some leftover LinkedIn rules risk, which I accepted.

**Decision change:** Decision #1 changed from "AI never touches LinkedIn" to "fill-and-stop, human submits."

---

## Iteration 8 — See the actual rule
**My prompt:** Show me LinkedIn's rule section 8.2.

**Claude's response:** I declined the browser step, so Claude summarized §8.2 from secondary sources and pointed me to the official page. The section bans scraping tools, browser plugins and add-ons, and "bots or other unauthorized automated methods to access the Services." Claude explained that form-filling isn't named but is covered by the automation language, so my safeguards reduce the risk but don't remove it.

---

## Iteration 9 — This log
**My prompt:** Write a prompt log of our whole conversation, summarizing each response in 2–3 sentences, in markdown.

**Claude's response:** This document.

---

## Summary for gate day
| Rubric area | Evidence from this log |
|---|---|
| **Fluency** | System-style rules (`AGENTS.md`, the fill-and-stop prompt), output schemas, iterating on design across 9 rounds |
| **Control** | Project Brief as source of truth, locked decisions, a 10/10 test suite, an AI mistake caught and fixed (hyphen bug) |
| **Responsible use** | Failure mode named (wrong "fair chance" label); LinkedIn §8.2 risk weighed; record and EEO questions never answered by the AI |
| **Still to do** | Real resume data, one supervised live fill, Lens answers in my own words, presentation prep |