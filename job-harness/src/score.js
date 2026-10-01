// src/score.js — deterministic scoring. No AI guessing: every result has a quote behind it.

const config = require("../harness/config");
const policy = require("../harness/agent-policy");

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Split into sentences so the evidence quote is a real, verbatim sentence.
function sentences(text) {
  return text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

// Normalize look-alike characters so "FAIR‑CHANCE" (non-breaking hyphen) === "fair-chance".
// Found by the Measure test "weird-but-legal" (see TEST_RESULTS.md).
function normalize(s) {
  return s
    .normalize("NFKC")
    .replace(/[‐-―−]/g, "-") // all dash look-alikes → "-"
    .replace(/[  -​]/g, " ") // odd spaces → " "
    .toLowerCase();
}

function isNegated(sentence, phrase) {
  const lower = normalize(sentence);
  const idx = lower.indexOf(phrase);
  if (idx === -1) return false;
  const before = lower.slice(0, idx).split(/\s+/).filter(Boolean).slice(-config.negationWindowWords);
  return before.some((w) => config.negations.includes(w.replace(/[^a-z']/g, "")));
}

function findPhrase(text, phrases, { checkNegation = false } = {}) {
  for (const sentence of sentences(text)) {
    const lower = normalize(sentence); // compare normalized, but return the ORIGINAL sentence as evidence
    for (const phrase of phrases) {
      if (lower.includes(phrase)) {
        const negated = checkNegation && isNegated(sentence, phrase);
        return { phrase, sentence, negated };
      }
    }
  }
  return null;
}

function fairChance(text) {
  const red = findPhrase(text, config.hardRedFlags);
  if (red) return { signal: "no", evidence_quote: red.sentence, reason: `red flag: "${red.phrase}"` };

  const pos = findPhrase(text, config.fairChancePositive, { checkNegation: true });
  if (pos && pos.negated) return { signal: "no", evidence_quote: pos.sentence, reason: `negated: "${pos.phrase}"` };
  if (pos) return { signal: "yes", evidence_quote: pos.sentence, reason: `matched: "${pos.phrase}"` };

  const soft = findPhrase(text, config.softCautions);
  if (soft) return { signal: "unclear", evidence_quote: soft.sentence, reason: `caution: "${soft.phrase}"` };

  return { signal: "unclear", evidence_quote: "", reason: "no fair-chance language found" };
}

function matchSkills(text, skills) {
  return skills.filter((skill) => new RegExp(`\\b${escapeRegex(skill)}\\b`, "i").test(text));
}

function applyType(text) {
  const lower = text.toLowerCase();
  for (const [type, signals] of Object.entries(config.applyTypeSignals)) {
    if (signals.some((s) => lower.includes(s))) return type;
  }
  return "UNKNOWN";
}

function answersToUse(text, answerBank) {
  const lower = text.toLowerCase();
  return answerBank.answers
    .filter((a) => a.question_patterns.some((p) => lower.includes(p)))
    .map((a) => a.id);
}

function scoreJob(job, resume, answerBank) {
  const fc = fairChance(job.body);
  const matched = matchSkills(job.body, resume.skills);
  const coverage = resume.skills.length ? matched.length / resume.skills.length : 0;
  const type = applyType(job.fullText);
  const needsHuman = [];

  if (fc.signal === "unclear") needsHuman.push("Fair-chance status unclear: check the company before applying");
  if (type === "EXTERNAL_ATS") needsHuman.push("External application site: apply there yourself");
  if (type === "UNKNOWN") needsHuman.push("Apply method not stated");
  if (policy.neverAnswer.some((w) => job.body.toLowerCase().includes(w)))
    needsHuman.push("Posting mentions sensitive topics (record, ID, or EEO): answer those questions yourself, never the AI");
  if (config.injectionPatterns.some((re) => re.test(job.fullText)))
    needsHuman.push("SECURITY: posting contains text that tries to instruct the AI; it was ignored");

  let score = 0;
  if (fc.signal === "yes") score += config.scoring.fairChanceYes;
  if (fc.signal === "unclear") score += config.scoring.fairChanceUnclear;
  score += Math.round(coverage * config.scoring.skillWeight * 10) / 10;
  if (fc.signal === "no") score = 0; // screened-out jobs never make the list

  return {
    id: job.id,
    title: job.title,
    company: job.company,
    url: job.url,
    fair_chance_signal: fc.signal,
    fair_chance_reason: fc.reason,
    evidence_quote: fc.evidence_quote,
    matched_skills: matched,
    score: Math.min(10, Math.round(score * 10) / 10),
    apply_type: type,
    answers_to_use: answersToUse(job.body, answerBank),
    needs_human: needsHuman,
  };
}

module.exports = { scoreJob, fairChance, matchSkills, applyType, isNegated };
