#!/usr/bin/env node
// SessionStart and SubagentStart: hands the session one rule from ../guidelines as context. A plugin
// can't ship rules, and a hook's context is the only kind that reaches a subagent. One rule per
// hook entry, because Claude Code passes a hook's string over 10,000 characters as a file path.
// Qwen Code reads the same rules from QWEN.md, so under Qwen this prints nothing.
"use strict";
const fs = require("node:fs");
const path = require("node:path");

const RULE_NAME = /^[a-z0-9-]+$/;

function isQwen() {
  return Boolean(process.env.QWEN_PROJECT_DIR);
}

function readEventName(raw) {
  try {
    const name = JSON.parse(raw).hook_event_name;
    return typeof name === "string" && name ? name : "SessionStart";
  } catch {
    return "SessionStart";
  }
}

function main() {
  const rule = process.argv[2] ?? "";
  if (!RULE_NAME.test(rule)) {
    process.stderr.write(`inject-rule: "${rule}" is not a rule name; expected lowercase words joined by hyphens\n`);
    process.exit(1);
  }
  const raw = fs.readFileSync(0, "utf8");
  if (isQwen()) return;
  const text = fs.readFileSync(path.join(__dirname, "..", "guidelines", `${rule}.md`), "utf8");
  const output = { hookSpecificOutput: { hookEventName: readEventName(raw), additionalContext: text } };
  process.stdout.write(`${JSON.stringify(output)}\n`);
}

main();
