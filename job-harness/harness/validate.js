// harness/validate.js — the gatekeeper. Fails (exit code 1) if anything breaks the rules.
// Run after every AI or pipeline run: npm run validate

const fs = require("fs");
const path = require("path");
const policy = require("./agent-policy");
const { loadJobs } = require("../src/ingest");

const root = path.join(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");

const errors = [];
const resume = JSON.parse(read("data/resume.json"));
const shortlist = JSON.parse(read("outputs/shortlist.json"));
const { jobs } = loadJobs(path.join(root, process.argv[2] || "jobs"));
const jobsById = Object.fromEntries(jobs.map((j) => [j.id, j]));
const resumeSkills = new Set(resume.skills.map((s) => s.toLowerCase()));

// 1. Resume must contain placeholders, not real personal info or record details.
const resumeText = JSON.stringify(resume);
for (const [name, re] of Object.entries(policy.piiPatterns)) {
  if (re.test(resumeText)) errors.push(`resume.json contains a real ${name}; use a {{PLACEHOLDER}}`);
}
for (const word of policy.neverAnswer) {
  if (resumeText.toLowerCase().includes(word)) errors.push(`resume.json contains a 🔴 never-data word: "${word}"`);
}

// 2. Every shortlisted job must follow the schema and trace back to real sources.
const required = ["id", "title", "company", "fair_chance_signal", "evidence_quote", "matched_skills", "score", "apply_type", "answers_to_use", "needs_human"];
for (const job of shortlist) {
  for (const field of required) if (!(field in job)) errors.push(`${job.id}: missing field "${field}"`);

  for (const skill of job.matched_skills || []) {
    if (!resumeSkills.has(skill.toLowerCase())) errors.push(`${job.id}: skill "${skill}" is not in resume.json (AI bloat)`);
  }

  const source = jobsById[job.id];
  if (!source) {
    errors.push(`${job.id}: no source job file found (invented job?)`);
    continue;
  }
  if (job.fair_chance_signal === "yes" && !job.evidence_quote) errors.push(`${job.id}: says fair chance with no evidence quote`);
  if (job.evidence_quote && !source.body.includes(job.evidence_quote)) errors.push(`${job.id}: evidence quote is not verbatim in the posting`);
  if (job.fair_chance_signal === "no") errors.push(`${job.id}: a "no" job made the shortlist`);
  if (typeof job.score !== "number" || job.score < 0 || job.score > 10) errors.push(`${job.id}: score out of range`);

  const out = JSON.stringify(job);
  for (const [name, re] of Object.entries(policy.piiPatterns)) {
    if (re.test(out)) errors.push(`${job.id}: output contains a ${name} (PII leak)`);
  }
}

// 3. Policy: nothing in outputs may claim an automated LinkedIn action.
const md = fs.existsSync(path.join(root, "outputs/shortlist.md")) ? read("outputs/shortlist.md") : "";
if (/\b(submitted|auto-?applied|applied for you)\b/i.test(md)) errors.push("shortlist.md claims an application was submitted; humans submit");
if (shortlist.length > policy.maxFillsPer24h) errors.push(`shortlist has ${shortlist.length} jobs; max is ${policy.maxFillsPer24h}/day`);

if (errors.length) {
  console.log("❌ HARNESS FAILED");
  errors.forEach((e) => console.log("  -", e));
  process.exit(1);
}
console.log(`✅ HARNESS PASSED — ${shortlist.length} jobs checked against resume, sources, and policy.`);
