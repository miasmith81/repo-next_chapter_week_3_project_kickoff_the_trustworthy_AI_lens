// harness/agent-policy.js — rules the browser agent must obey
const agentPolicy = {
  blockedDomains: ["linkedin.com"],            // never automate here
  allowedActions: ["read", "fill"],            // "submit" is NOT in the list
  maxApplicationsPerDay: 5,                    // human pace, not bot pace
  stopBeforeSubmit: true,                      // human clicks Submit
  neverAnswer: [
    "criminal history",                        // 🔴 always routed to Mausi
    "conviction",
    "background check",
    "ssn",
    "date of birth",
  ],
  logEveryPage: "PROMPT_LOG.md",               // evidence for Control grade
};

module.exports = agentPolicy;