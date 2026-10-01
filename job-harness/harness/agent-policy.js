// harness/agent-policy.js — rules any AI agent (Codex, ChatGPT, Claude) must obey.
// validate.js and validate-fill.js enforce the parts that can be checked by code.
// v0.2 (2026-09-30): Mausi chose FILL-AND-STOP mode — agent may fill forms, never submit.

module.exports = {
  mode: "FILL_AND_STOP",
  allowedActions: ["read_page", "type_in_field", "select_option", "click_next_or_review"],
  forbiddenActions: ["submit", "search_or_scroll_job_lists", "message_anyone", "connect", "log_in", "upload_new_files"],
  forbiddenButtonText: ["submit", "submit application", "send application", "apply now", "finish", "confirm", "send"],
  stopBeforeSubmit: true, // a human clicks every Submit button
  maxFillsPer24h: 5, // change here if you want more; human pace, not bot pace
  neverAnswer: [
    "criminal", "conviction", "convicted", "felony", "misdemeanor", "arrest", "incarcerat",
    "background check", "ssn", "social security", "date of birth", "birth date",
    "gender", "race", "ethnicity", "veteran", "disability", "sexual orientation", "pronoun",
  ],
  piiPatterns: {
    email: /[\w.+-]+@[\w-]+\.[\w.]+/,
    phone: /\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/,
    ssn: /\b\d{3}-\d{2}-\d{4}\b/,
  },
};
