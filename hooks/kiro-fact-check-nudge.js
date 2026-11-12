#!/usr/bin/env node
// Kiro Stop: asks the session to fact-check its last message, as fact-check-nudge.js does for
// Claude Code. Kiro's Stop payload carries no message to measure and fires once per turn, never
// again after the continuation it asks for, so it asks every turn and lets the session itself skip
// a turn with nothing to check.
"use strict";
const fs = require("node:fs");
const path = require("node:path");

const SHORT_ANSWER = "If your last message was only a greeting, a status line, or one fact that a " +
  "tool's output in this session already shows";
const EXTRA_STEP_DOES_NOT_APPLY = ", and nothing else this request asks applies to this turn";

function skipLine(extra) {
  const condition = extra ? SHORT_ANSWER + EXTRA_STEP_DOES_NOT_APPLY : SHORT_ANSWER;
  return `${condition}, reply only "Nothing to check." Otherwise: `;
}

try {
  fs.readFileSync(0);
  const { buildRequest, readExtraParagraph } = require(path.join(__dirname, "fact-check-nudge.js"));
  const extra = readExtraParagraph();
  process.stdout.write(`${JSON.stringify({ decision: "block", reason: skipLine(extra) + buildRequest(extra) })}\n`);
} catch {
  // A failed check must not hold a turn open.
}
