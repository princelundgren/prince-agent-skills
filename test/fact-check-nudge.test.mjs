// `additionalContext` on stdout continues the turn; no output ends it. The payloads follow
// Claude Code's documented Stop input; none is captured from a live session.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { QWEN_ENV, ROOT, runHook, tempDir } from "./helpers.mjs";

const LONG_MESSAGE = "x".repeat(400);

function stopPayload(message, fields = {}) {
  return JSON.stringify({
    session_id: "s1",
    stop_hook_active: false,
    last_assistant_message: message,
    background_tasks: [],
    session_crons: [],
    ...fields,
  });
}

function setup(t) {
  const data = tempDir(t);
  const log = path.join(data, "fact-check.jsonl");
  const stop = (payload, env = {}) => runHook("fact-check-nudge.js", payload, { env: { CLAUDE_PLUGIN_DATA: data, ...env } });
  const rows = () => fs.readFileSync(log, "utf8").trim().split("\n").map((line) => JSON.parse(line));
  return { data, log, stop, rows };
}

test("a long final message continues the turn with the fact-check request", (t) => {
  const { stop } = setup(t);
  const result = stop(stopPayload(LONG_MESSAGE));
  assert.equal(result.status, 0);
  const output = JSON.parse(result.stdout).hookSpecificOutput;
  assert.equal(output.hookEventName, "Stop");
  assert.match(output.additionalContext, /^Fact-check your last message/);
});

test("the request asks for the whole answer again, since a headless session returns only the reply", (t) => {
  const { stop } = setup(t);
  const request = JSON.parse(stop(stopPayload(LONG_MESSAGE)).stdout).hookSpecificOutput.additionalContext;
  assert.match(request, /give your last message again in full/);
  assert.doesNotMatch(request, /Don't repeat/);
});

test("a request is logged with its session and the message's length, never its text", (t) => {
  const { stop, rows, log } = setup(t);
  stop(stopPayload(LONG_MESSAGE));
  const row = rows().at(-1);
  assert.deepEqual([row.event, row.session, row.message_chars], ["asked", "s1", 400]);
  assert.ok(!fs.readFileSync(log, "utf8").includes("xxxx"));
});

test("the reply to a request ends the turn and is logged, however long it is", (t) => {
  const { stop, rows } = setup(t);
  stop(stopPayload(LONG_MESSAGE));
  const result = stop(stopPayload(`Correction: ${LONG_MESSAGE}`, { stop_hook_active: true }));
  assert.equal(result.stdout, "");
  assert.deepEqual([rows().at(-1).event, rows().at(-1).session], ["replied", "s1"]);
});

test("a reply ends the turn even if the active flag has gone false", (t) => {
  const { stop, rows } = setup(t);
  stop(stopPayload(LONG_MESSAGE));
  assert.equal(stop(stopPayload(LONG_MESSAGE)).stdout, "");
  assert.equal(rows().at(-1).event, "replied");
});

test("the next turn after a reply is checked again", (t) => {
  const { stop } = setup(t);
  stop(stopPayload(LONG_MESSAGE));
  stop(stopPayload(LONG_MESSAGE));
  assert.match(stop(stopPayload(LONG_MESSAGE)).stdout, /additionalContext/);
});

test("an active stop this hook didn't ask for ends the turn and logs nothing", (t) => {
  const { stop, log } = setup(t);
  assert.equal(stop(stopPayload(LONG_MESSAGE, { stop_hook_active: true })).stdout, "");
  assert.ok(!fs.existsSync(log));
});

test("another session's request doesn't count as this one's", (t) => {
  const { stop, rows } = setup(t);
  stop(stopPayload(LONG_MESSAGE));
  assert.match(stop(stopPayload(LONG_MESSAGE, { session_id: "s2" })).stdout, /additionalContext/);
  assert.deepEqual([rows().at(-1).event, rows().at(-1).session], ["asked", "s2"]);
});

test("a logged reply is cut to its limit", (t) => {
  const { stop, rows } = setup(t);
  stop(stopPayload(LONG_MESSAGE));
  stop(stopPayload("y".repeat(4100), { stop_hook_active: true }));
  assert.equal(rows().at(-1).reply.length, 4000);
});

test("a damaged log row doesn't stop later checks", (t) => {
  const { stop, log } = setup(t);
  fs.writeFileSync(log, '{"partial\n');
  assert.match(stop(stopPayload(LONG_MESSAGE)).stdout, /additionalContext/);
});

test("the log can be read only by its owner", (t) => {
  const { stop, log } = setup(t);
  stop(stopPayload(LONG_MESSAGE));
  assert.equal((fs.statSync(log).mode & 0o777).toString(8), "600");
});

test("a message just under the limit ends the turn", (t) => {
  const { stop, log } = setup(t);
  assert.equal(stop(stopPayload(LONG_MESSAGE.slice(1))).stdout, "");
  assert.ok(!fs.existsSync(log));
});

test("a turn waiting on a background task or a scheduled wakeup ends without a check", (t) => {
  const { stop } = setup(t);
  const task = { id: "t", type: "shell", status: "running" };
  assert.equal(stop(stopPayload(LONG_MESSAGE, { background_tasks: [task] })).stdout, "");
  assert.equal(stop(stopPayload(LONG_MESSAGE, { session_crons: [{ id: "c" }] })).stdout, "");
});

test("a request at the end of a log larger than the scanned tail still gets one reply", (t) => {
  const { stop, rows, log } = setup(t);
  const row = JSON.stringify({ event: "asked", session: "old", pad: "z".repeat(1000) });
  fs.writeFileSync(log, `${row}\n`.repeat(300));
  stop(stopPayload(LONG_MESSAGE));
  assert.equal(stop(stopPayload(LONG_MESSAGE)).stdout, "");
  assert.deepEqual([rows().at(-1).event, rows().at(-1).session], ["replied", "s1"]);
});

test("Qwen Code never checks or logs", (t) => {
  const { stop, log } = setup(t);
  const result = stop(stopPayload(LONG_MESSAGE), QWEN_ENV);
  assert.equal(result.status, 0);
  assert.equal(result.stdout, "");
  assert.ok(!fs.existsSync(log));
});

test("a payload it can't read ends the turn", (t) => {
  const { stop } = setup(t);
  const result = stop("not json");
  assert.equal(result.status, 0);
  assert.equal(result.stdout, "");
});

test("a log it can't write ends the turn rather than holding it", (t) => {
  const notADirectory = path.join(tempDir(t), "file");
  fs.writeFileSync(notADirectory, "");
  const result = runHook("fact-check-nudge.js", stopPayload(LONG_MESSAGE), { env: { CLAUDE_PLUGIN_DATA: notADirectory } });
  assert.equal(result.status, 0);
  assert.equal(result.stdout, "");
});

test("without CLAUDE_PLUGIN_DATA the log goes under ~/.claude/logs", (t) => {
  const home = tempDir(t);
  runHook("fact-check-nudge.js", stopPayload(LONG_MESSAGE), { env: { HOME: home } });
  assert.ok(fs.existsSync(path.join(home, ".claude", "logs", "fact-check.jsonl")));
});

test("the extra file's paragraph sits between the check and the reply's shape", (t) => {
  const { stop, data } = setup(t);
  const extra = path.join(data, "extra.md");
  fs.writeFileSync(extra, "Then update the notes this turn made false.\n");
  const request = JSON.parse(stop(stopPayload(LONG_MESSAGE), { FACT_CHECK_NUDGE_EXTRA_FILE: extra }).stdout)
    .hookSpecificOutput.additionalContext;
  assert.match(request, /\(docs, search, a command\)\. Then update the notes this turn made false\. Your reply becomes/);
});

test("an extra file named from ~/ is read from the home folder", (t) => {
  const { stop } = setup(t);
  const home = tempDir(t);
  fs.writeFileSync(path.join(home, "extra.md"), "Then update the notes this turn made false.\n");
  const request = JSON.parse(stop(stopPayload(LONG_MESSAGE), { HOME: home, USERPROFILE: home, FACT_CHECK_NUDGE_EXTRA_FILE: "~/extra.md" }).stdout)
    .hookSpecificOutput.additionalContext;
  assert.match(request, /Then update the notes this turn made false\./);
});

test("an extra file it can't read is named on stderr and the request still goes out", (t) => {
  const { stop, data } = setup(t);
  const missing = path.join(data, "missing.md");
  const result = stop(stopPayload(LONG_MESSAGE), { FACT_CHECK_NUDGE_EXTRA_FILE: missing });
  assert.match(result.stdout, /Fact-check your last message/);
  assert.match(result.stderr, /missing\.md/);
});

test("the plugin runs it on Stop", () => {
  const hooks = JSON.parse(fs.readFileSync(path.join(ROOT, "hooks", "hooks.json"), "utf8")).hooks;
  const commands = hooks.Stop.flatMap((group) => group.hooks).map((hook) => hook.command);
  assert.ok(commands.some((command) => command.includes("hooks/fact-check-nudge.js")));
});
