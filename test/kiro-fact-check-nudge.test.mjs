// Kiro continues the turn on {"decision":"block"} and ends it on no output. The payload was
// captured from kiro-cli 2.37.1.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { test } from "node:test";
import { ROOT, runHook, tempDir } from "./helpers.mjs";

const PAYLOAD = JSON.stringify({ session_id: "sess_670caf5b-92b2-4139-a7cb-413e7db4d2ed", hook_event_name: "Stop", cwd: "/tmp/probe" });
const { buildRequest } = createRequire(import.meta.url)(path.join(ROOT, "hooks", "fact-check-nudge.js"));

const SHORT_ANSWER = "If your last message was only a greeting, a status line, or one fact that a tool's " +
  "output in this session already shows";

test("a Kiro stop continues the turn with Claude Code's request and a way to skip a short answer", () => {
  const result = runHook("kiro-fact-check-nudge.js", PAYLOAD);
  assert.equal(result.status, 0);
  const output = JSON.parse(result.stdout);
  assert.equal(output.decision, "block");
  assert.equal(output.reason, `${SHORT_ANSWER}, reply only "Nothing to check." Otherwise: ${buildRequest("")}`);
});

test("with an extra file, a short answer is skipped only if the extra step doesn't apply either", (t) => {
  const extra = path.join(tempDir(t), "extra.md");
  fs.writeFileSync(extra, "Then update the notes this turn made false.\n");
  const output = JSON.parse(runHook("kiro-fact-check-nudge.js", PAYLOAD, { env: { FACT_CHECK_NUDGE_EXTRA_FILE: extra } }).stdout);
  const skip = `${SHORT_ANSWER}, and nothing else this request asks applies to this turn, reply only "Nothing to check." Otherwise: `;
  assert.equal(output.reason, skip + buildRequest("Then update the notes this turn made false."));
});

test("a second stop in the same session is checked too", () => {
  const first = runHook("kiro-fact-check-nudge.js", PAYLOAD).stdout;
  assert.equal(runHook("kiro-fact-check-nudge.js", PAYLOAD).stdout, first);
});

test("without the Claude Code hook beside it, it ends the turn", (t) => {
  const dir = tempDir(t);
  const copy = path.join(dir, "kiro-fact-check-nudge.js");
  fs.copyFileSync(path.join(ROOT, "hooks", "kiro-fact-check-nudge.js"), copy);
  const result = spawnSync(process.execPath, [copy], { input: PAYLOAD, encoding: "utf8" });
  assert.equal(result.status, 0);
  assert.equal(result.stdout, "");
});

test("loading the Claude Code hook as a module doesn't run its Stop handler", () => {
  const script = `require(${JSON.stringify(path.join(ROOT, "hooks", "fact-check-nudge.js"))}); console.log("loaded")`;
  const result = spawnSync(process.execPath, ["-e", script], { input: "", encoding: "utf8" });
  assert.equal(result.stdout, "loaded\n");
});

test("Kiro's hooks run it on Stop", () => {
  const kiro = JSON.parse(fs.readFileSync(path.join(ROOT, "kiro", "hooks", "prince-skills.json"), "utf8"));
  const commands = kiro.hooks.filter((hook) => hook.trigger === "Stop").map((hook) => hook.action.command);
  assert.ok(commands.some((command) => command.includes("hooks/kiro-fact-check-nudge.js")));
});
