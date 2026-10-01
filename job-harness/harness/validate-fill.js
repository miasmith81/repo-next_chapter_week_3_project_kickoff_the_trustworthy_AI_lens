// harness/validate-fill.js — checks every FILL_REPORT the agent gives back.
// Save each ChatGPT reply as outputs/fill-log/<name>.json, then: npm run check-fill
// Fails if ANY typed value can't be traced back to resume.json / answer_bank.json word-for-word.

const fs = require("fs");
const path = require("path");
const policy = require("./agent-policy");

const root = path.join(__dirname, "..");
const logDir = path.resolve(process.argv[2] || path.join(root, "outputs/fill-log"));
const resume = JSON.parse(fs.readFileSync(path.join(root, "data/resume.json"), "utf8"));
const bank = JSON.parse(fs.readFileSync(path.join(root, "data/answer_bank.json"), "utf8"));
const answersById = Object.fromEntries(bank.answers.map((a) => [a.id, a]));

// "years_experience.sales" → resume.years_experience.sales
const resolve = (key) => key.split(".").reduce((obj, k) => (obj == null ? undefined : obj[k]), resume);

function traces(field) {
  const value = String(field.value ?? "").trim();
  if (value === "") return true; // blank is always allowed
  const bankEntry = answersById[field.source];
  if (bankEntry) return bankEntry.answer === value && !value.includes("{{");
  const fact = resolve(field.source || "");
  if (fact === undefined) return false;
  if (Array.isArray(fact)) return fact.map(String).includes(value);
  return String(fact) === value;
}

function checkReport(report, name) {
  const errors = [];
  if (report.stopped_before_submit !== true) errors.push("agent did not confirm it stopped before submit");
  for (const f of report.fields || []) {
    const label = String(f.label || "").toLowerCase();
    const value = String(f.value ?? "");
    if (value && policy.neverAnswer.some((w) => label.includes(w)))
      errors.push(`answered a NEVER question: "${f.label}"`);
    if (!traces(f)) errors.push(`"${f.label}" = "${value}" does not match source "${f.source}" word-for-word (AI bloat)`);
    for (const [kind, re] of Object.entries(policy.piiPatterns))
      if (re.test(value)) errors.push(`"${f.label}" contains a ${kind}; contact fields must be left to the site`);
    if (value.includes("{{")) errors.push(`"${f.label}" typed a placeholder`);
  }
  return errors.map((e) => `${name}: ${e}`);
}

if (!fs.existsSync(logDir)) {
  console.log(`No fill reports yet in ${logDir}`);
  process.exit(0);
}

const files = fs.readdirSync(logDir).filter((f) => f.endsWith(".json"));
const errors = [];
const reports = [];
for (const file of files) {
  try {
    const report = JSON.parse(fs.readFileSync(path.join(logDir, file), "utf8"));
    reports.push(report);
    errors.push(...checkReport(report, file));
  } catch (e) {
    errors.push(`${file}: not valid JSON (${e.message})`);
  }
}

// 24-hour cap
const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
const recent = reports.filter((r) => Date.parse(r.filled_at) > dayAgo).length;
if (recent > policy.maxFillsPer24h) errors.push(`${recent} forms filled in the last 24h; max is ${policy.maxFillsPer24h}`);

// Human to-do list
for (const r of reports) {
  const todo = [...(r.needs_mausi || []), ...(r.warnings || []).map((w) => `⚠️ ${w}`)];
  console.log(`\n📝 ${r.job_title} — ${r.company}  (${r.fields?.length || 0} filled, ${r.needs_mausi?.length || 0} for you)`);
  todo.forEach((t) => console.log(`   • ${t}`));
}
console.log(`\nForms filled in last 24h: ${recent}/${policy.maxFillsPer24h}`);

if (errors.length) {
  console.log("\n❌ FILL CHECK FAILED — fix these on the form BEFORE you click Submit:");
  errors.forEach((e) => console.log("  -", e));
  process.exit(1);
}
console.log("\n✅ FILL CHECK PASSED — every typed value traces to your resume. Review the tab, then YOU click Submit.");
