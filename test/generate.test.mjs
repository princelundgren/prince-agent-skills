import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { ROOT } from "./helpers.mjs";

const read = (...parts) => fs.readFileSync(path.join(ROOT, ...parts), "utf8");
const guidelines = fs.readdirSync(path.join(ROOT, "guidelines")).filter((file) => file.endsWith(".md")).sort();

test("the generated files match their sources", () => {
  const result = spawnSync(process.execPath, [path.join(ROOT, "scripts", "generate.mjs"), "--check"], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
});

test("QWEN.md holds every rule in full, since it is the only way the rules reach Qwen Code", () => {
  const context = read("QWEN.md");
  for (const file of guidelines) assert.ok(context.includes(read("guidelines", file).trimEnd()), file);
});

test("every rule is a Kiro steering file that is always included", () => {
  const steering = fs.readdirSync(path.join(ROOT, "kiro", "steering")).sort();
  assert.deepEqual(steering, guidelines);
  for (const file of steering) {
    const text = read("kiro", "steering", file);
    assert.ok(text.startsWith("---\ninclusion: always\n---\n"), file);
    assert.ok(text.endsWith(read("guidelines", file)), file);
  }
});

test("Claude Code injects every rule at session start and into every subagent", () => {
  const { hooks } = JSON.parse(read("hooks", "hooks.json"));
  const injected = (event) => hooks[event][0].hooks
    .map((hook) => /inject-rule\.js" ([a-z0-9-]+)$/.exec(hook.command)?.[1])
    .filter(Boolean)
    .map((rule) => `${rule}.md`)
    .sort();
  assert.deepEqual(injected("SessionStart"), guidelines);
  assert.deepEqual(injected("SubagentStart"), guidelines);
});

test("Kiro's hooks run the scripts from the folder the README clones into", () => {
  const clone = /git clone \S+ (\S+)/.exec(read("README.md"))[1].replace(/^~/, "$HOME");
  const { hooks } = JSON.parse(read("kiro", "hooks", "prince-agent-skills.json"));
  for (const hook of hooks) {
    const script = /hooks\/([a-z-]+\.js)"$/.exec(hook.action.command)[1];
    assert.equal(hook.action.command, `node "${clone}/hooks/${script}"`);
    assert.ok(fs.existsSync(path.join(ROOT, "hooks", script)), script);
  }
});
