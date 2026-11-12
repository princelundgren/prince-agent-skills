#!/usr/bin/env node
// Kiro Stop: asks the session to fact-check its last message, as fact-check-nudge.js does for
// Claude Code. Kiro's Stop payload carries no message to measure and fires once per turn, never
// again after the continuation it asks for, so it asks every turn and lets the session itself skip
// a turn with nothing to check.
"use strict";
const fs = require("node:fs");
const path = require("node:path");

const SKIP = "If your last message was only a greeting, a status line, or one fact that a tool's " +
  "output in this session already shows, reply only \"Nothing to check.\" Otherwise: ";

try {
  fs.readFileSync(0);
  const { buildRequest } = require(path.join(__dirname, "fact-check-nudge.js"));
  process.stdout.write(`${JSON.stringify({ decision: "block", reason: SKIP + buildRequest() })}\n`);
} catch {
  // A failed check must not hold a turn open.
}
