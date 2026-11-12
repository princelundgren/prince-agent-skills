#!/usr/bin/env node
// UserPromptSubmit: reminds the session, before it answers, to look up the facts it will state, so
// the check happens before the answer and not only in the end-of-turn fact-check after it.
//
// Every exit is 0: exit 2 on UserPromptSubmit blocks the user's prompt.
"use strict";
const fs = require("node:fs");

const REMINDER = "[fact-check-first] Before answering, look up each fact the answer will state " +
  "(docs, search, a live check), on any topic, coding or not. Being sure from memory is the " +
  "signal to check (verify-before-asserting).";

// Qwen Code also fires this event on tool-result and hook continuations; only a real submission
// carries submitted_prompt.
function isQwenContinuation(raw) {
  if (!process.env.QWEN_PROJECT_DIR) return false;
  try {
    const prompt = JSON.parse(raw).submitted_prompt;
    return !(typeof prompt === "string" && prompt.length > 0);
  } catch {
    return true;
  }
}

try {
  if (!isQwenContinuation(fs.readFileSync(0, "utf8"))) process.stdout.write(`${REMINDER}\n`);
} catch {
  // A failed reminder must not cost the user their prompt.
}
process.exit(0);
