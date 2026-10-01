# Fair Chance Job Harness (prototype v0.1)

A human-in-the-loop tool that turns job postings into a ranked, evidence-backed shortlist for a justice-impacted job seeker. Zero dependencies, Node 18+.

## Quick start (5 minutes)
```bash
cd job-harness
npm test        # Measure: 8 break-it tests
npm run go      # build shortlist + run the harness checker
open outputs/shortlist.md
```

## Daily use
1. Open a job post you want (LinkedIn, company site, anywhere). Click the **Clip Job** bookmark (`tools/job-clipper-bookmarklet.txt`).
2. Paste into a new file: `jobs/07-some-job.txt`.
3. `npm run go` and read `outputs/shortlist.md`.
4. Apply yourself, using the paste-ready answers. Answer record-related questions yourself.

## Use with Codex / ChatGPT
Open this folder in Codex. It reads `AGENTS.md` automatically. Example prompt:
> "Here are 3 job posts. Save each into jobs/ in the required format, run `npm run go`, and show me the shortlist. Follow AGENTS.md."

## How it stays trustworthy
| Guardrail | File |
|---|---|
| Rules for the AI | `AGENTS.md` |
| Every scoring rule, in plain sight | `harness/config.js` |
| What agents may never do | `harness/agent-policy.js` |
| Checker: no bloat, no PII, quotes must be verbatim, no invented jobs | `harness/validate.js` |
| Break-it tests (empty / weird / wrong type / boundary / injection) | `tests/` + `TEST_RESULTS.md` |

## Before real use
Replace the SAMPLE values in `data/resume.json` and `data/answer_bank.json` with content from your real resume. Keep `{{PLACEHOLDERS}}` for personal info.
