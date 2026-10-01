// harness/config.js — every rule the scorer uses lives here, in plain sight.
// Change a rule here, not inside the code.

module.exports = {
  // Phrases that signal an employer welcomes justice-impacted applicants.
  fairChancePositive: [
    "fair chance",
    "fair-chance",
    "second chance",
    "second-chance",
    "justice-involved",
    "justice involved",
    "justice-impacted",
    "justice impacted",
    "formerly incarcerated",
    "returning citizens",
    "reentry",
    "re-entry",
    "arrest and conviction records",
    "conviction records",
    "criminal histories",
    "ban the box",
    "background-friendly",
  ],

  // Phrases that mean "this job will likely screen you out."
  hardRedFlags: [
    "no felonies",
    "no felony",
    "clean criminal record",
    "clean background",
    "no criminal record",
    "no criminal history",
    "security clearance",
  ],

  // Phrases that are not a no, but need a human to look.
  softCautions: ["background check", "background screening", "drug screen", "fingerprint"],

  // Words that flip a positive phrase ("we are NOT a fair chance employer").
  negations: ["not", "no", "never", "isn't", "aren't", "without"],
  negationWindowWords: 4,

  // Text that looks like someone trying to instruct the AI (prompt injection).
  injectionPatterns: [
    /ignore (all|any|previous|prior) instructions/i,
    /you are (an|a) (ai|language model|assistant)/i,
    /rate this (job|posting)? ?(a )?10/i,
    /system prompt/i,
  ],

  applyTypeSignals: {
    EASY_APPLY: ["easy apply"],
    EXTERNAL_ATS: ["workday", "greenhouse", "lever.co", "icims", "apply on company website", "taleo"],
  },

  scoring: {
    fairChanceYes: 4,
    fairChanceUnclear: 1,
    skillWeight: 6, // max points from skill match coverage
    shortlistSize: 5,
    minScore: 3,
  },
};
