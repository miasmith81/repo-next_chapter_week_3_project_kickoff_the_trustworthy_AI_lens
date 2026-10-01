// src/ingest.js — turns job text files into job objects.
// Expected file format (header lines optional):
//   Title: Customer Success Manager
//   Company: Example Co
//   URL: https://...
//   <blank line>
//   full job description...

const fs = require("fs");
const path = require("path");

function parseJobText(raw, id) {
  const text = String(raw ?? "").replace(/\r\n/g, "\n");
  const header = {};
  const lines = text.split("\n");
  let bodyStart = 0;

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/^(Title|Company|URL|Location):\s*(.*)$/i);
    if (match) {
      header[match[1].toLowerCase()] = match[2].trim();
      bodyStart = i + 1;
    } else if (lines[i].trim() === "" && Object.keys(header).length) {
      bodyStart = i + 1;
      break;
    } else {
      break;
    }
  }

  const body = lines.slice(bodyStart).join("\n").trim();
  return {
    id,
    title: header.title || "UNKNOWN_TITLE",
    company: header.company || "UNKNOWN_COMPANY",
    url: header.url || "",
    location: header.location || "",
    body,
    fullText: text,
  };
}

function loadJobs(dir) {
  if (!fs.existsSync(dir)) return { jobs: [], skipped: [] };
  const jobs = [];
  const skipped = [];

  for (const file of fs.readdirSync(dir).sort()) {
    const fullPath = path.join(dir, file);
    if (!fs.statSync(fullPath).isFile()) continue;
    if (!/\.(txt|md)$/i.test(file)) {
      skipped.push({ file, reason: "wrong file type (only .txt or .md)" });
      continue;
    }
    const raw = fs.readFileSync(fullPath, "utf8");
    if (raw.includes("\u0000")) {
      skipped.push({ file, reason: "binary content" });
      continue;
    }
    const job = parseJobText(raw, path.parse(file).name);
    if (job.body.length < 40) {
      skipped.push({ file, reason: "empty or too short to judge (<40 chars)" });
      continue;
    }
    jobs.push(job);
  }
  return { jobs, skipped };
}

module.exports = { parseJobText, loadJobs };
