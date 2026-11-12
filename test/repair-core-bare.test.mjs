// Against real temporary git repos, with the user's and system's git config shut out.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { ROOT, runHook, tempDir } from "./helpers.mjs";

const GIT_ENV = { GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_SYSTEM: "/dev/null" };

function git(...args) {
  return execFileSync("git", args, { env: { ...process.env, ...GIT_ENV }, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

function initRepo(dir) {
  git("init", "-q", "-b", "main", dir);
  git("-C", dir, "-c", "user.name=t", "-c", "user.email=t@example.com", "commit", "-q", "--allow-empty", "-m", "first");
  // An empty commit writes no index, and the hook requires one, as a real checkout has.
  git("-C", dir, "read-tree", "HEAD");
}

function setup(t) {
  const root = tempDir(t);
  const repo = path.join(root, "repo");
  initRepo(repo);
  return { root, repo };
}

function hookIn(cwd, env = {}) {
  const payload = JSON.stringify({ hook_event_name: "SessionStart", cwd });
  return runHook("repair-core-bare.js", payload, { env: { ...GIT_ENV, ...env } });
}

function worksAgain(repo) {
  return git("-C", repo, "status", "--short", "--branch") === "## main";
}

test("a normal repo left bare works again, and the hook says so without printing a path", (t) => {
  const { root, repo } = setup(t);
  git("-C", repo, "config", "core.bare", "true");
  const result = hookIn(repo);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /"systemMessage"/);
  assert.ok(!result.stdout.includes(root));
  assert.ok(worksAgain(repo));
});

test("a linked worktree's hook repairs the main checkout", (t) => {
  const { root, repo } = setup(t);
  git("-C", repo, "worktree", "add", "-q", "-b", "side", path.join(root, "side"));
  git("-C", repo, "config", "core.bare", "true");
  hookIn(path.join(root, "side"));
  assert.ok(worksAgain(repo));
});

test("a subfolder of the main checkout is enough to find the repo", (t) => {
  const { repo } = setup(t);
  fs.mkdirSync(path.join(repo, "sub"));
  git("-C", repo, "config", "core.bare", "true");
  hookIn(path.join(repo, "sub"));
  assert.ok(worksAgain(repo));
});

test("a config with two core.bare lines is repaired", (t) => {
  const { repo } = setup(t);
  git("-C", repo, "config", "core.bare", "true");
  git("-C", repo, "config", "--add", "core.bare", "true");
  hookIn(repo);
  assert.ok(worksAgain(repo));
});

test("a repo whose logallrefupdates was edited to always is repaired", (t) => {
  const { repo } = setup(t);
  git("-C", repo, "config", "core.logallrefupdates", "always");
  git("-C", repo, "config", "core.bare", "true");
  hookIn(repo);
  assert.ok(worksAgain(repo));
});

test("a healthy repo is left alone and nothing is printed", (t) => {
  const { repo } = setup(t);
  const config = path.join(repo, ".git", "config");
  const before = fs.readFileSync(config, "utf8");
  assert.equal(hookIn(repo).stdout, "");
  assert.equal(fs.readFileSync(config, "utf8"), before);
});

test("bare clones stay bare, wherever they sit", (t) => {
  const { root, repo } = setup(t);
  const plain = path.join(root, "plain.git");
  git("clone", "-q", "--bare", repo, plain);

  const holder = path.join(root, "holder");
  fs.mkdirSync(holder);
  git("clone", "-q", "--bare", repo, path.join(holder, ".git"));

  // A --work-tree deploy leaves an index in a bare clone.
  const deploy = path.join(root, "deploy");
  fs.mkdirSync(deploy);
  git("clone", "-q", "--bare", repo, path.join(deploy, ".git"));
  git("-C", path.join(deploy, ".git"), "read-tree", "HEAD");

  const logging = path.join(root, "logging");
  fs.mkdirSync(logging);
  git("clone", "-q", "--bare", repo, path.join(logging, ".git"));
  git("-C", path.join(logging, ".git"), "config", "core.logallrefupdates", "true");

  for (const [cwd, gitDir] of [[plain, plain], [holder, `${holder}/.git`], [deploy, `${deploy}/.git`], [logging, `${logging}/.git`]]) {
    const result = hookIn(cwd);
    assert.equal(result.status, 0);
    assert.equal(result.stdout, "", cwd);
    assert.equal(git("-C", gitDir, "config", "--get", "core.bare"), "true", cwd);
  }
});

test("a repo whose git directory isn't named .git is left alone", (t) => {
  const { root } = setup(t);
  const sep = path.join(root, "sep");
  git("init", "-q", "-b", "main", "--separate-git-dir", path.join(root, "sep.git"), sep);
  git("-C", sep, "-c", "user.name=t", "-c", "user.email=t@example.com", "commit", "-q", "--allow-empty", "-m", "first");
  git("-C", sep, "read-tree", "HEAD");
  git("-C", sep, "config", "core.bare", "true");
  assert.equal(hookIn(sep).stdout, "");
  assert.equal(git(`--git-dir=${path.join(root, "sep.git")}`, "config", "--get", "core.bare"), "true");
});

test("GIT_DIR or GIT_COMMON_DIR from the environment doesn't send the repair to another repo", (t) => {
  const { root, repo } = setup(t);
  const other = path.join(root, "other");
  initRepo(other);
  git("-C", other, "config", "core.bare", "true");
  const otherGitDir = path.join(other, ".git");
  assert.equal(hookIn(repo, { GIT_DIR: otherGitDir }).stdout, "");
  assert.equal(hookIn(repo, { GIT_COMMON_DIR: otherGitDir }).stdout, "");
  assert.equal(git(`--git-dir=${otherGitDir}`, "config", "--get", "core.bare"), "true");
});

test("git isn't looked up in the session folder", (t) => {
  const { root, repo } = setup(t);
  const planted = path.join(root, "planted-ran");
  fs.writeFileSync(path.join(repo, "git"), `#!/bin/sh\ntouch "${planted}"\n`, { mode: 0o755 });
  // A leading "." stands in for Windows, which searches a spawn's working directory before PATH.
  const result = runHook("repair-core-bare.js", JSON.stringify({ hook_event_name: "SessionStart", cwd: repo }), {
    cwd: repo,
    env: { ...GIT_ENV, PATH: `.:${process.env.PATH}` },
  });
  assert.equal(result.status, 0);
  assert.ok(!fs.existsSync(planted));
});

test("a repair that can't write tells the user and the agent how to do it by hand, and exits 0", (t) => {
  const { repo } = setup(t);
  git("-C", repo, "config", "core.bare", "true");
  fs.writeFileSync(path.join(repo, ".git", "config.lock"), "");
  const result = hookIn(repo);
  assert.equal(result.status, 0);
  const output = JSON.parse(result.stdout);
  assert.ok(output.systemMessage);
  assert.equal(output.hookSpecificOutput.hookEventName, "SessionStart");
  assert.match(output.hookSpecificOutput.additionalContext, /git config --replace-all core\.bare false/);
});

test("a folder outside any repo, a missing folder and unreadable input all pass quietly", (t) => {
  const { root } = setup(t);
  for (const cwd of [root, path.join(root, "gone")]) {
    const result = hookIn(cwd);
    assert.equal(result.status, 0);
    assert.equal(result.stdout, "");
  }
  const result = runHook("repair-core-bare.js", "not json", { cwd: root, env: GIT_ENV });
  assert.equal(result.status, 0);
  assert.equal(result.stdout, "");
});

test("the plugin runs it at session start and after every tool that can make a worktree", () => {
  const hooks = JSON.parse(fs.readFileSync(path.join(ROOT, "hooks", "hooks.json"), "utf8")).hooks;
  const runsIt = (group) => group.hooks.some((hook) => hook.command.includes("repair-core-bare.js"));
  assert.ok(hooks.SessionStart.some(runsIt));
  assert.deepEqual(hooks.PostToolUse.filter(runsIt).map((group) => group.matcher), ["EnterWorktree|ExitWorktree|Agent"]);
});
