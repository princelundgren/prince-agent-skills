#!/usr/bin/env node
// Stop: asks the main session once to fact-check a long final message with its own tools, and logs
// the request and the reply, so a reader can see how often a check corrected anything. Each check
// costs at least one more turn.
//
// FACT_CHECK_NUDGE_EXTRA_FILE may name a file whose text is added to the request, for a step of
// your own, such as keeping a memory store true. A leading ~/ is your home folder, since Claude
// Code's settings.json env expands no variables.
//
// It lets the turn end on anything it can't work out.
"use strict";
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const MIN_MESSAGE_CHARS = 400; // below this a final message is a status line or a one-fact answer
const LOGGED_REPLY_CHARS = 4000;
const PENDING_SCAN_BYTES = 256 * 1024; // the log only grows; a request and its reply sit at its end
const CHECK = "Fact-check your last message before ending the turn: take each claim about how " +
  "something behaves or what you did. If no output in this session shows it, check it now with " +
  "your tools (docs, search, a command).";
const REPLY_SHAPE = "Your reply becomes the turn's last message, so it must stand alone. Start " +
  "with the corrections and what showed them, or one line saying everything holds. Then, if your " +
  "last message had sections the user must act on (open questions, decisions, next steps), " +
  "repeat them with any correction applied. Don't repeat the rest of the message.";

function logPath() {
  const dir = process.env.CLAUDE_PLUGIN_DATA || path.join(os.homedir(), ".claude", "logs");
  return path.join(dir, "fact-check.jsonl");
}

function expandHome(file) {
  return file.startsWith("~/") ? path.join(os.homedir(), file.slice(2)) : file;
}

/** The trimmed text of the file FACT_CHECK_NUDGE_EXTRA_FILE names, or "" if unset or unreadable. */
function readExtraParagraph() {
  const setting = process.env.FACT_CHECK_NUDGE_EXTRA_FILE;
  if (!setting) return "";
  const file = expandHome(setting);
  try {
    return fs.readFileSync(file, "utf8").trim();
  } catch (error) {
    process.stderr.write(`fact-check-nudge: can't read FACT_CHECK_NUDGE_EXTRA_FILE ${file}: ${error.message}\n`);
    return "";
  }
}

/** The end-of-turn request a session receives, with `extra` between the check and the reply's shape. */
function buildRequest(extra = readExtraParagraph()) {
  return [CHECK, extra, REPLY_SHAPE].filter(Boolean).join(" ");
}

function isWaitingOnBackgroundWork(payload) {
  return payload.background_tasks?.length > 0 || payload.session_crons?.length > 0;
}

function appendToLog(entry) {
  const log = logPath();
  fs.mkdirSync(path.dirname(log), { recursive: true });
  fs.appendFileSync(log, `${JSON.stringify({ time: new Date().toISOString(), ...entry })}\n`, { mode: 0o600 });
}

function parseRow(line) {
  try {
    return JSON.parse(line);
  } catch {
    return undefined;
  }
}

function readLogTail() {
  const fd = fs.openSync(logPath(), "r");
  try {
    const size = fs.fstatSync(fd).size;
    const length = Math.min(size, PENDING_SCAN_BYTES);
    const buffer = Buffer.alloc(length);
    const bytesRead = fs.readSync(fd, buffer, 0, length, size - length);
    return buffer.toString("utf8", 0, bytesRead);
  } finally {
    fs.closeSync(fd);
  }
}

function hasPendingRequest(session) {
  if (!fs.existsSync(logPath())) return false;
  const rows = readLogTail().split("\n").map(parseRow);
  return rows.filter((row) => row?.session === session).at(-1)?.event === "asked";
}

// stop_hook_active alone can't mean this hook asked: another plugin's Stop hook can set it. The
// log decides, so one request gets one reply however many tool calls the check makes.
function handleStop(payload) {
  const message = typeof payload.last_assistant_message === "string" ? payload.last_assistant_message : "";
  const session = payload.session_id;
  if (hasPendingRequest(session)) {
    appendToLog({ event: "replied", session, reply: message.slice(0, LOGGED_REPLY_CHARS) });
    return;
  }
  if (payload.stop_hook_active || message.length < MIN_MESSAGE_CHARS || isWaitingOnBackgroundWork(payload)) return;
  appendToLog({ event: "asked", session, message_chars: message.length });
  const output = { hookSpecificOutput: { hookEventName: "Stop", additionalContext: buildRequest() } };
  process.stdout.write(`${JSON.stringify(output)}\n`);
}

module.exports = { buildRequest, readExtraParagraph };

if (require.main === module) {
  try {
    // Untested under Qwen Code, so it stays off there.
    if (!process.env.QWEN_PROJECT_DIR) {
      handleStop(JSON.parse(fs.readFileSync(0, "utf8")));
    }
  } catch {
    // A failed check must not hold a turn open.
  }
  process.exit(0);
}
