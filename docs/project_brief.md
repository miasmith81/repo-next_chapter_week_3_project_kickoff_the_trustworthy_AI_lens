# Fair Chance Job Finder — Project Brief (Source of Truth)

> Every new chat: read this file FIRST. If something is not in this brief or in the files for the current step, ASK — do not assume or invent. At the end of every step, update Section 7 (tracker), Section 8 (checklist) and Section 9 (handoff log).

## 1. Goal
Build a harnessed prompt program (ChatGPT/Codex) that finds job postings suited to a justice-impacted job seeker and fills their applications from her resume, using Mausi's resume as the example.
- **Course:** Next Chapter, Week 3 (Phase 1: AI Fluency), "The AI-Built Solution." Gate week: build on Days 2–3, present at the **Phase 1 Gate on Day 4**.
- **Form:** documented prompt system + small tool/workflow (both allowed by the assignment).

## 2. Locked decisions (do not change without Mausi saying so)
1. **Fill-and-stop (changed by Mausi 2026-09-30).** Mausi opens each job and clicks Easy Apply herself. A browser agent (ChatGPT or Claude in Chrome) may then fill that ONE form using only resume.json + answer_bank.json, click Next/Review, and STOP on the review page. The agent never clicks Submit, never logs in, never searches or scrolls job lists, and never messages or connects with anyone. Max 5 fills per 24h (`maxFillsPer24h`). Every fill returns a FILL_REPORT that must pass `npm run check-fill` before Mausi submits. Known risk Mausi accepted: LinkedIn's User Agreement §8.2 and Help Center prohibit automating activity on the site, so even fill-only use carries some risk of account restriction.
2. **Resume = single source of truth.** Every value typed or claimed must trace word-for-word to `data/resume.json` or `data/answer_bank.json`. No AI bloat.
3. **No real personal info in AI-visible files.**
   - 🟢 Usable: skills, titles, certifications, projects, years of experience
   - 🟡 Placeholder: name, email, phone, address, LinkedIn URL → `{{NAME}}`, `{{EMAIL}}`, etc. The agent leaves contact fields as the site pre-filled them.
   - 🔴 Never: record details, incarceration dates, SSN, DOB. Record, ID and EEO questions are always left blank for Mausi.
4. **Tooling:** Codex working in the repo under `AGENTS.md`, plus a zero-dependency JavaScript (Node.js 18+) pipeline and validators. Scoring is deterministic keyword rules in `harness/config.js`, not AI guessing.
5. **Delivery:** `outputs/shortlist.md` (top 5 jobs, each with an evidence quote and paste-ready answers) → the agent fills the forms and stops → `npm run check-fill` → Mausi reviews and submits.
6. **Named failure mode:** "Fair chance" false positives and false negatives. Mitigation: every fair-chance claim needs a verbatim `evidence_quote` from the posting; `unclear` routes to a human.
7. **JavaScript only.** All code in this project is JavaScript (Node.js). No Python anywhere. (Decided 2026-09-29.)
8. **Mausi's own words.** Atlas quiz answers, the scope worksheet, the exit ticket and the Lens answers are written by Mausi. Claude can coach, question and review, but doesn't write them for her.

## 3. Folder layout (v0.2 — built)
```
job-harness/
├── AGENTS.md                       ← rules for Codex/ChatGPT (fill-and-stop)
├── README.md                       ← quick start
├── package.json                    ← npm test · go · shortlist · validate · prompt · check-fill
├── data/resume.json                ← SAMPLE — replace with real resume content
├── data/answer_bank.json           ← SAMPLE — replace with real answers
├── jobs/                           ← 6 fictional sample jobs; Mausi adds real ones
├── harness/config.js               ← every scoring rule
├── harness/agent-policy.js         ← v0.2: allowed/forbidden actions, forbidden buttons, 24h cap, neverAnswer, PII
├── harness/validate.js             ← shortlist checker: bloat, PII, verbatim quotes, invented jobs
├── harness/validate-fill.js        ← FILL_REPORT checker: exact-copy values, no NEVER answers, no PII, stopped before submit, 24h cap
├── src/ingest.js · score.js · run.js ← shortlist pipeline
├── src/build-prompt.js             ← `npm run prompt` → outputs/chatgpt-fill-prompt.md (data embedded)
├── tests/harness.test.js + tests/edge-cases/ + tests/fill-good/ + tests/fill-bad/
├── tools/job-clipper-bookmarklet.(js|txt)
├── outputs/shortlist.md · shortlist.json · run-report.json · chatgpt-fill-prompt.md · fill-log/
├── TEST_RESULTS.md
└── PROMPT_LOG.md
```

## 4. Schemas
- **Shortlist job:** `id`, `title`, `company`, `url`, `fair_chance_signal`, `fair_chance_reason`, `evidence_quote`, `matched_skills`, `score`, `apply_type`, `answers_to_use`, `needs_human`
- **FILL_REPORT:** `job_title`, `company`, `url`, `filled_at`, `stopped_before_submit` (must be true), `fields[] {label, value, source}`, `needs_mausi[]`, `warnings[]`

## 5. Known blockers and planned responses
- LinkedIn: search and submit are never automated; filling is (Decision 1), capped at 5 per 24h, and always stops before submit. Mausi accepted the remaining terms-of-service risk.
- The agent's browser must be Mausi's own: if the ChatGPT agent runs in its own cloud browser, the filled form isn't in her tabs to submit. Use an agent that acts in her browser (for example ChatGPT's Atlas browser agent, or Claude in Chrome).
- Login, CAPTCHA, 2FA → the agent stops; Mausi handles them.
- Multi-page Easy Apply, custom screening questions, dropdowns → the agent fills exact matches only; everything else goes to `needs_mausi`.
- Resume file upload → the agent selects the resume already saved on LinkedIn and never uploads a file.
- Redirects to an external ATS (Workday etc.) → flagged `EXTERNAL_ATS`; the same fill-and-stop prompt works there, but each site's terms vary.
- Prompt injection in postings or forms → the prompt and AGENTS.md treat that text as DATA; the scorer flags it; the fill check catches any value that isn't in the resume.
- AI tool changes (a third-party report says ChatGPT agent mode was retired in Aug 2026; check what your ChatGPT plan offers now) → the harness is tool-agnostic.
- Coverage gaps → later: job alert emails via a Gmail connector plus a scheduled task; public job APIs.

## 6. Teaching style for every chat
Step by step, one step per chat. All code in JavaScript (Node.js), explained line by line — what each piece of syntax does and why.

## 7. Step tracker
| # | Step | Course day | Status | Output file |
|---|------|-----------|--------|-------------|
| 0 | Plan and reframe (this brief) | Day 1 | ✅ Done | PROJECT_BRIEF.md |
| P | Prototype v0.1: pipeline, validator, AGENTS.md, policy, tests, clipper, SAMPLE data | Day 1 | ✅ Done | job-harness.zip |
| F | v0.2 fill-and-stop: prompt builder + fill checker + 2 tests (10/10 pass) | Day 1 | ✅ Done | chatgpt-fill-prompt.md |
| 1 | Scope worksheet + Map/mitigation quiz answers (Mausi's words, Claude coaches) | Day 1 | ⏭️ Next | Atlas |
| 2 | Replace SAMPLE `resume.json` with real resume content (🟢🟡🔴 sort) | Day 2 | ⬜ | data/resume.json |
| 3 | Explain-it-back walkthrough of AGENTS.md, config.js, score.js, validate.js, validate-fill.js | Day 2 | ⬜ | — |
| 4 | Push to GitHub; first supervised live fill on 1 real job; log it | Day 2 | ⬜ | repo, PROMPT_LOG.md, fill-log/ |
| 5 | Replace SAMPLE `answer_bank.json` with real answers | Day 2–3 | ⬜ | data/answer_bank.json |
| 6 | Measure: 5 real jobs through shortlist + fill + check-fill; log what broke | Day 3 | 🟡 | TEST_RESULTS.md |
| 7 | Lens write-up (Map/Measure/Manage) + presentation prep | Day 3 | ⬜ | LENS.md, talk notes |
| 8 | Gate: present + submit GitHub repo link on Atlas | Day 4 | ⬜ | — |

## 8. Atlas Week 3 requirements checklist
Source: AtlasLearn → Week 3 · Day 1 "Project Kickoff + The Trustworthy-AI Lens" (read 2026-09-29).
Key: ✅ done · 🟡 in progress · ⬜ not started

### A. Day 1 lesson tasks (in Atlas)
- ⬜ Quiz 1 (free response): the one place it could produce a wrong/biased/harmful output, **who's affected, and whether they'd be able to tell**
- ⬜ Quiz 2 (free response): the mitigation for that risk, plus an honest answer to "if it happened tomorrow, would the mitigation catch it?"
- ⬜ Scope worksheet: real problem + who has it · one-sentence solution · form · what's in scope · what's deliberately left out · first guess at failure mode
- ⬜ "Go find one" (~6 min): find a plain-language intro to "trustworthy AI," skim two, keep the clearer one, note which one you picked
- ⬜ (Optional) Pre-reading notes / question for instructor
- ⬜ Exit ticket
- ⬜ Submit work (GitHub repo link, live URL, or written response)
- ⬜ Mark lesson complete

### B. What every project must show
- **Fluency**
  - 🟡 Advanced prompting used (AGENTS.md, the fill-and-stop prompt with rules, steps and output schema) — needs a real run logged
  - 🟡 Read and judged the AI's output well (validators + tamper tests) — needs Mausi's own review notes
- **Control**
  - ✅ Scoped tightly (Section 2 + Section E)
  - ⬜ Can explain every part in my own words (Step 3)
  - 🟡 Prompt Log started — keep adding
  - 🟡 AI mistakes caught and logged — add ones Mausi catches in live fills
- **Responsible use**
  - ✅ One failure mode named (Decision 6)
  - 🟡 Trustworthy-AI Lens applied (Section C)
- **Communication**
  - ⬜ Clear presentation on gate day
  - ⬜ Ready for questions — expect "isn't this against LinkedIn's rules?"; have the fill-and-stop, 5/day cap and accepted-risk answer ready

### C. Trustworthy-AI Lens (Map / Measure / Manage — Govern comes in Phase 2)
- **Map** — 🟡 Fair-chance label wrong → applicant screened out without knowing. Second risk: the agent types something that isn't true to the resume, and it gets submitted in Mausi's name. Mausi to write both in her own words.
- **Measure** — 🟡 Shortlist: 4 moves + injection + tamper (1 bug found, fixed). Fill: a clean report passes; a bad report (bloat, record answer, phone number, fake skill, no stop) fails on every count. Still needed: real jobs.
- **Manage** — 🟡 The agent can't submit; the fill check blocks any non-exact value; record/EEO questions are always blank; 5/24h cap; human final approval. ⬜ Honest "would it catch it tomorrow?" answer in Mausi's words.

### D. Gate rubric (Day 4)
- **Technical (40%)** — it works + I controlled the build
- **Verbal (30%)** — presentation + questions
- **Applied (30%)** — Lens + failure mode + mitigation
- Need **Proficient or higher on all three**.

### E. Deliberately left out (scope guard)
Auto-SUBMIT, AI login, AI job searching or scraping on LinkedIn, cover-letter writing, multiple users, a UI or website, Govern (Phase 2).

## 9. Handoff log
- **Step 0 (2026-09-29):** Architecture decided.
- **2026-09-29:** JavaScript only; Atlas checklist built.
- **2026-09-29 (v0.1):** Prototype built; tests 8/8; hyphen bug found and fixed. Resume and answer bank are SAMPLE data.
- **2026-09-30 (v0.2 fill-and-stop):** Mausi changed Decision 1: the agent fills the form and stops before Submit. Built `npm run prompt` (ChatGPT prompt with data embedded), `validate-fill.js` (`npm run check-fill`), policy v0.2, and the AGENTS.md update. Tests 10/10. Next: real resume (Step 2), then 1 supervised live fill on a real job, logged in PROMPT_LOG.md.