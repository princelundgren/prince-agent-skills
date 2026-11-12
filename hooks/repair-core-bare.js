#!/usr/bin/env node
// repair-core-bare.js — SessionStart and PostToolUse hook: Claude Code's worktree tools can leave
// core.bare = true in a normal repo's shared config (anthropics/claude-code#58345, #69802), and then
// every git command in its main checkout fails with "must be run in a work tree". This sets it back
// where the repo shows the marks of a non-bare init (madeWithWorkTree), and never blocks anything.
"use strict";
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const GIT_TIMEOUT_MS = 3000;

// A session started from a git hook inherits these, and they would outrank -C.
function envWithoutRepoOverrides() {
  const { GIT_DIR, GIT_COMMON_DIR, GIT_WORK_TREE, ...env } = process.env;
  return env;
}

// Runs from the home folder, because on Windows a git.exe in the working directory would run: hence -C.
function git(args) {
  return execFileSync("git", args, {
    cwd: os.homedir(),
    env: envWithoutRepoOverrides(),
    encoding: "utf8",
    timeout: GIT_TIMEOUT_MS,
    stdio: ["ignore", "pipe", "ignore"],
  }).trim();
}

function readPayload(raw) {
  try {
    return JSON.parse(raw) || {};
  } catch {
    return {};
  }
}

function findCommonDir(cwd) {
  try {
    return git(["-C", cwd, "rev-parse", "--path-format=absolute", "--git-common-dir"]);
  } catch {
    return null;
  }
}

function readBool(configFile, key) {
  try {
    return git(["config", "--file", configFile, "--type=bool", "--get", key]) === "true";
  } catch {
    return false;
  }
}

function hasKey(configFile, key) {
  try {
    git(["config", "--file", configFile, "--get", key]);
    return true;
  } catch {
    return false;
  }
}

// Only a non-bare `git init` or clone writes logallrefupdates, as true; `always` is a person's edit
// of it. A clone switched to bare on purpose keeps all three marks, so it is flipped back.
function madeWithWorkTree(commonDir, configFile) {
  return path.basename(commonDir) === ".git"
    && fs.existsSync(path.join(commonDir, "index"))
    && hasKey(configFile, "core.logallrefupdates");
}

function reportRepaired() {
  process.stdout.write(JSON.stringify({
    systemMessage: "repair-core-bare: reset core.bare to false in this repo's shared git config. Worktree tools can leave it true.",
  }));
}

function reportFailed(hookEventName) {
  const text = "repair-core-bare: could not reset core.bare, so git fails in this repo's main checkout. Run there: git config --replace-all core.bare false";
  process.stdout.write(JSON.stringify({
    systemMessage: text,
    ...(hookEventName ? { hookSpecificOutput: { hookEventName, additionalContext: text } } : {}),
  }));
}

function repair(configFile, hookEventName) {
  try {
    git(["config", "--file", configFile, "--replace-all", "core.bare", "false"]);
    reportRepaired();
  } catch {
    reportFailed(hookEventName);
  }
}

let raw = "";
process.stdin.on("data", (chunk) => (raw += chunk));
process.stdin.on("end", () => {
  const payload = readPayload(raw);
  const commonDir = findCommonDir(typeof payload.cwd === "string" && payload.cwd ? payload.cwd : process.cwd());
  if (!commonDir) return;
  const configFile = path.join(commonDir, "config");
  if (readBool(configFile, "core.bare") && madeWithWorkTree(commonDir, configFile)) repair(configFile, payload.hook_event_name);
});
