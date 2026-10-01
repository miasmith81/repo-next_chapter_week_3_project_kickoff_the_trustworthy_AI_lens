// src/run.js — the pipeline: load jobs → score → rank → write shortlist files.
// Usage: node src/run.js [jobsFolder]

const fs = require("fs");
const path = require("path");
const { loadJobs } = require("./ingest");
const { scoreJob } = require("./score");
const config = require("../harness/config");

const root = path.join(__dirname, "..");
const jobsDir = path.resolve(process.argv[2] || path.join(root, "jobs"));
const outDir = path.join(root, "outputs");

const resume = JSON.parse(fs.readFileSync(path.join(root, "data/resume.json"), "utf8"));
const answerBank = JSON.parse(fs.readFileSync(path.join(root, "data/answer_bank.json"), "utf8"));

const { jobs, skipped } = loadJobs(jobsDir);
const scored = jobs.map((job) => scoreJob(job, resume, answerBank));
const ranked = scored
  .filter((j) => j.fair_chance_signal !== "no" && j.score >= config.scoring.minScore)
  .sort((a, b) => b.score - a.score);
const shortlist = ranked.slice(0, config.scoring.shortlistSize);
const excluded = scored.filter((j) => !shortlist.includes(j));

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "shortlist.json"), JSON.stringify(shortlist, null, 2));
fs.writeFileSync(
  path.join(outDir, "run-report.json"),
  JSON.stringify({ ranAt: new Date().toISOString(), jobsDir, total: jobs.length, skipped, excluded }, null, 2)
);

// Human-readable version for Mausi.
const answersById = Object.fromEntries(answerBank.answers.map((a) => [a.id, a]));
let md = `# Job Shortlist\n\nRun: ${new Date().toLocaleString()} · ${jobs.length} jobs read · ${shortlist.length} shortlisted · ${skipped.length} skipped\n\n`;
md += `> You review every job and click Apply yourself. Never let an AI answer record-related questions.\n\n`;
shortlist.forEach((j, i) => {
  md += `## ${i + 1}. ${j.title} — ${j.company}  (score ${j.score}/10)\n\n`;
  if (j.url) md += `- Link: ${j.url}\n`;
  md += `- Fair chance: **${j.fair_chance_signal}** (${j.fair_chance_reason})\n`;
  if (j.evidence_quote) md += `- Evidence: "${j.evidence_quote}"\n`;
  md += `- Skills matched from your resume: ${j.matched_skills.join(", ") || "none"}\n`;
  md += `- Apply type: ${j.apply_type}\n`;
  if (j.answers_to_use.length) {
    md += `- Paste-ready answers:\n`;
    j.answers_to_use.forEach((id) => (md += `  - ${answersById[id].question} → **${answersById[id].answer}**\n`));
  }
  if (j.needs_human.length) md += `- ⚠️ Needs you:\n${j.needs_human.map((n) => `  - ${n}`).join("\n")}\n`;
  md += `\n`;
});
if (excluded.length) {
  md += `## Not shortlisted\n\n`;
  excluded.forEach((j) => (md += `- ${j.title} — ${j.company}: fair chance **${j.fair_chance_signal}** (${j.fair_chance_reason}), score ${j.score}\n`));
}
if (skipped.length) {
  md += `\n## Skipped files\n\n`;
  skipped.forEach((s) => (md += `- ${s.file}: ${s.reason}\n`));
}
fs.writeFileSync(path.join(outDir, "shortlist.md"), md);

console.log(`Read ${jobs.length} jobs, shortlisted ${shortlist.length}, skipped ${skipped.length}.`);
console.log(`→ outputs/shortlist.md  (open this)`);
