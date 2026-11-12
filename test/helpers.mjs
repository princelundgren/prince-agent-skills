import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Runs a hook script with `input` on stdin and returns { status, stdout, stderr }. */
export function runHook(script, input, { env = {}, args = [], cwd = ROOT } = {}) {
  const result = spawnSync(process.execPath, [path.join(ROOT, "hooks", script), ...args], {
    input,
    cwd,
    env: { PATH: process.env.PATH, HOME: process.env.HOME, ...env },
    encoding: "utf8",
  });
  return { status: result.status, stdout: result.stdout, stderr: result.stderr };
}

/** A fresh temporary directory, removed when the test ends. */
export function tempDir(t) {
  const dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "prince-agent-skills-")));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}

/** A Qwen Code payload captured from a real session, with fields overridden. */
export function qwenPayload(fixture, overrides = {}) {
  const file = path.join(ROOT, "test", "fixtures", "qwen", `${fixture}.json`);
  return JSON.stringify({ ...JSON.parse(fs.readFileSync(file, "utf8")), ...overrides });
}

export const QWEN_ENV = { QWEN_PROJECT_DIR: "/SANDBOX/work" };
