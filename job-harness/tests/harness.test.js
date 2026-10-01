// tests/harness.test.js — Measure: try to break it. Run: npm test
const test = require("node:test");
const assert = require("node:assert");
const path = require("path");
const { loadJobs, parseJobText } = require("../src/ingest");
const { scoreJob, fairChance, matchSkills } = require("../src/score");
const resume = require("../data/resume.json");
const answerBank = require("../data/answer_bank.json");

const edgeDir = path.join(__dirname, "edge-cases");
const { jobs, skipped } = loadJobs(edgeDir);
const byId = Object.fromEntries(jobs.map((j) => [j.id, j]));

test("Move 1 — empty input is skipped, not scored", () => {
  assert.ok(skipped.find((s) => s.file === "empty.txt"));
});

test("Move 2 — weird-but-legal: caps, emoji, non-breaking hyphen still detected", () => {
  const job = scoreJob(byId["weird-legal"], resume, answerBank);
  assert.strictEqual(job.fair_chance_signal, "yes", `got ${job.fair_chance_signal}: ${job.fair_chance_reason}`);
});

test("Move 3 — wrong type (.json) is skipped", () => {
  assert.ok(skipped.find((s) => s.file === "wrong-type.json"));
});

test("Move 4 — boundary: negated phrase is a NO, not a yes", () => {
  const job = scoreJob(byId["boundary-negation"], resume, answerBank);
  assert.strictEqual(job.fair_chance_signal, "no");
});

test("Security — prompt injection text is flagged and cannot raise the score", () => {
  const job = scoreJob(byId["injection"], resume, answerBank);
  assert.ok(job.needs_human.some((n) => n.startsWith("SECURITY")));
  assert.notStrictEqual(job.score, 10);
});

test("Red flag beats positive language", () => {
  const r = fairChance("We are a fair chance employer. Must have a clean criminal record.");
  assert.strictEqual(r.signal, "no");
});

test("Skills only come from the resume (no bloat)", () => {
  const matched = matchSkills("We need Kubernetes, Rust and sales.", resume.skills);
  assert.deepStrictEqual(matched, ["sales"]);
});

test("Evidence quote is verbatim from the posting", () => {
  const job = parseJobText("Title: X\n\nWe are a second chance employer. Sales role.", "q");
  const r = fairChance(job.body);
  assert.ok(job.body.includes(r.evidence_quote));
});

// ---- Fill-and-stop checker (v0.2) ----
const { spawnSync } = require("node:child_process");
const runFill = (dir) => spawnSync("node", [path.join(__dirname, "../harness/validate-fill.js"), path.join(__dirname, dir)], { encoding: "utf8" });

test("Fill check passes a clean, exact-copy report with blanks for record questions", () => {
  const r = runFill("fill-good");
  assert.strictEqual(r.status, 0, r.stdout);
});

test("Fill check fails on bloat, a record answer, a phone number, a fake skill, and no stop", () => {
  const r = runFill("fill-bad");
  assert.strictEqual(r.status, 1);
  for (const needle of ["AI bloat", "NEVER question", "phone", "Kubernetes", "stopped before submit"])
    assert.ok(r.stdout.includes(needle), `missing: ${needle}`);
});
