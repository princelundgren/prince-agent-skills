// The Qwen payloads are fixtures captured from Qwen Code 0.25.1 (fixtures/qwen/VERSION).
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { QWEN_ENV, ROOT, qwenPayload, runHook } from "./helpers.mjs";

const REMINDER = "[fact-check-first] Before answering, look up each fact";

test("a submitted prompt gets the reminder, and the prompt is kept", () => {
  const payload = JSON.stringify({ session_id: "s1", hook_event_name: "UserPromptSubmit", prompt: "what goes with smoked salmon?" });
  const result = runHook("fact-check-first.js", payload);
  assert.equal(result.status, 0);
  assert.ok(result.stdout.startsWith(REMINDER));
});

test("qwen: a real submission gets the reminder", () => {
  const payload = qwenPayload("UserPromptSubmit-submitted", { submitted_prompt: "what goes with smoked salmon?" });
  assert.ok(runHook("fact-check-first.js", payload, { env: QWEN_ENV }).stdout.startsWith(REMINDER));
});

test("qwen: a continuation after a tool result gets nothing, whatever its prompt holds", () => {
  const payload = qwenPayload("UserPromptSubmit-continuation", { prompt: "tool result text" });
  const result = runHook("fact-check-first.js", payload, { env: QWEN_ENV });
  assert.equal(result.status, 0);
  assert.equal(result.stdout, "");
});

test("empty input still exits 0, so the prompt is never erased", () => {
  assert.equal(runHook("fact-check-first.js", "").status, 0);
});

test("qwen: empty or non-JSON input exits 0 with nothing printed", () => {
  for (const input of ["", "not json"]) {
    const result = runHook("fact-check-first.js", input, { env: QWEN_ENV });
    assert.equal(result.status, 0);
    assert.equal(result.stdout, "");
  }
});

test("Claude Code and Kiro both run it on UserPromptSubmit", () => {
  const plugin = JSON.parse(fs.readFileSync(path.join(ROOT, "hooks", "hooks.json"), "utf8"));
  assert.match(plugin.hooks.UserPromptSubmit[0].hooks[0].command, /hooks\/fact-check-first\.js/);
  const kiro = JSON.parse(fs.readFileSync(path.join(ROOT, "kiro", "hooks", "prince-agent-skills.json"), "utf8"));
  const commands = kiro.hooks.filter((hook) => hook.trigger === "UserPromptSubmit").map((hook) => hook.action.command);
  assert.ok(commands.some((command) => command.includes("hooks/fact-check-first.js")));
});
