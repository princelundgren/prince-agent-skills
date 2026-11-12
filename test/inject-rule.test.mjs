import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { QWEN_ENV, ROOT, runHook } from "./helpers.mjs";

// Claude Code hands a hook string over 10,000 characters to the session as a file path with a
// preview; this leaves room under it.
const RULE_LIMIT = 9_000;
const RULES = fs.readdirSync(path.join(ROOT, "guidelines")).filter((file) => file.endsWith(".md")).map((file) => file.slice(0, -3));

function inject(rule, event, env = {}) {
  return runHook("inject-rule.js", JSON.stringify({ hook_event_name: event, session_id: "s1" }), { args: [rule], env });
}

test("each rule reaches a session and a subagent as context under its own event name", () => {
  for (const event of ["SessionStart", "SubagentStart"]) {
    const result = inject("own-your-mistakes", event);
    assert.equal(result.status, 0);
    const output = JSON.parse(result.stdout).hookSpecificOutput;
    assert.equal(output.hookEventName, event);
    assert.equal(output.additionalContext, fs.readFileSync(path.join(ROOT, "guidelines", "own-your-mistakes.md"), "utf8"));
  }
});

test("every rule stays clear of Claude Code's context cap", () => {
  for (const rule of RULES) {
    const context = JSON.parse(inject(rule, "SessionStart").stdout).hookSpecificOutput.additionalContext;
    assert.ok(context.length < RULE_LIMIT, `${rule} is ${context.length} characters`);
  }
});

test("under Qwen Code it prints nothing, since QWEN.md carries the rules there", () => {
  const result = inject("own-your-mistakes", "SessionStart", QWEN_ENV);
  assert.equal(result.status, 0);
  assert.equal(result.stdout, "");
});

test("a name that isn't a rule's fails without reading outside guidelines/", () => {
  for (const name of ["../README", "", "Own-Your-Mistakes"]) {
    const result = inject(name, "SessionStart");
    assert.equal(result.status, 1);
    assert.equal(result.stdout, "");
  }
});

test("the plugin injects every rule at session start and at every subagent start", () => {
  const hooks = JSON.parse(fs.readFileSync(path.join(ROOT, "hooks", "hooks.json"), "utf8")).hooks;
  for (const event of ["SessionStart", "SubagentStart"]) {
    const commands = hooks[event].flatMap((group) => group.hooks).map((hook) => hook.command);
    for (const rule of RULES) {
      assert.ok(commands.some((command) => command.endsWith(`inject-rule.js" ${rule}`)), `${event} lacks ${rule}`);
    }
  }
});
