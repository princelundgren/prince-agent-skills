#!/usr/bin/env node
// Writes the files each harness reads that are made from the sources in guidelines/, agents/ and
// hooks/: the plugin's hooks/hooks.json, QWEN.md, and the Kiro forms under kiro/.
//
//   node scripts/generate.mjs           write them
//   node scripts/generate.mjs --check   exit 1, naming each file, when one is out of date
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PLUGIN_HOOKS = '${CLAUDE_PLUGIN_ROOT}/hooks';
// Where the README's Kiro steps clone this repo; Kiro's hook files run the scripts from there.
const KIRO_CLONE_HOOKS = "$HOME/.local/share/prince-agent-skills/hooks";

// Kiro's `tools:` takes category tags, not tool names, and an absent field means no tools at all.
const KIRO_TOOL_TAGS = {
  Read: "read", Grep: "read", Glob: "read",
  Write: "write", Edit: "write",
  Bash: "shell",
  WebSearch: "web", WebFetch: "web",
  Skill: null, // Kiro loads skills into every agent and has no skill tool
};

// Kiro shows `description` in its agent picker, so each agent gets a short label there.
const KIRO_LABELS = {
  "requirements-analyst": "Elicits and writes requirements in EARS and user-story form.",
  "solution-architect": "Turns requirements into a technical design — architecture, data model, APIs.",
  "implementation-planner": "Turns an approved design into an ordered, testable task plan.",
};

function listNames(dir, extension) {
  return fs.readdirSync(path.join(ROOT, dir))
    .filter((file) => file.endsWith(extension))
    .map((file) => file.slice(0, -extension.length))
    .sort();
}

function readSource(...parts) {
  return fs.readFileSync(path.join(ROOT, ...parts), "utf8");
}

function nodeHook(script, ...args) {
  const command = [`node "${PLUGIN_HOOKS}/${script}"`, ...args].join(" ");
  return { type: "command", command, timeout: 10 };
}

function pluginHooks(rules) {
  const ruleHooks = rules.map((rule) => nodeHook("inject-rule.js", rule));
  const repairCoreBare = nodeHook("repair-core-bare.js");
  return {
    hooks: {
      SessionStart: [{ hooks: [repairCoreBare, ...ruleHooks] }],
      SubagentStart: [{ hooks: ruleHooks }],
      PostToolUse: [{ matcher: "EnterWorktree|ExitWorktree|Agent", hooks: [repairCoreBare] }],
      UserPromptSubmit: [{ hooks: [nodeHook("fact-check-first.js")] }],
      Stop: [{ hooks: [nodeHook("fact-check-nudge.js")] }],
    },
  };
}

function qwenContext(rules) {
  return rules.map((rule) => readSource("guidelines", `${rule}.md`).trimEnd()).join("\n\n") + "\n";
}

function kiroSteering(rule) {
  return `---\ninclusion: always\n---\n\n${readSource("guidelines", `${rule}.md`)}`;
}

function splitFrontmatter(text, file) {
  const match = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(text);
  if (!match) throw new Error(`${file}: no YAML frontmatter between --- lines`);
  return { frontmatter: match[1], body: match[2] };
}

function readScalar(frontmatter, key) {
  return new RegExp(`^${key}:[ \\t]*(.+)$`, "m").exec(frontmatter)?.[1].trim();
}

function quoted(text) {
  return `"${text.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;
}

function kiroTags(toolList, file) {
  const tags = [];
  for (const tool of toolList.split(",").map((entry) => entry.trim()).filter(Boolean)) {
    if (!(tool in KIRO_TOOL_TAGS)) throw new Error(`${file}: no Kiro tag for tool ${tool}; add it to KIRO_TOOL_TAGS`);
    const tag = KIRO_TOOL_TAGS[tool];
    if (tag && !tags.includes(tag)) tags.push(tag);
  }
  return tags;
}

function kiroAgent(agent) {
  const file = `agents/${agent}.md`;
  const { frontmatter, body } = splitFrontmatter(readSource(file), file);
  const toolList = readScalar(frontmatter, "tools");
  if (!toolList) throw new Error(`${file}: no tools: line, and Kiro gives an agent without one no tools`);
  if (!KIRO_LABELS[agent]) throw new Error(`${file}: no Kiro label; add one to KIRO_LABELS`);
  const tags = kiroTags(toolList, file).map(quoted).join(", ");
  return `---\nname: ${agent}\ndescription: ${quoted(KIRO_LABELS[agent])}\ntools: [${tags}]\n---\n${body}`;
}

function kiroHooks() {
  const command = (script) => `node "${KIRO_CLONE_HOOKS}/${script}"`;
  const hook = (name, trigger, script) => ({
    name,
    trigger,
    action: { type: "command", command: command(script) },
    timeout: 10,
    enabled: true,
  });
  return {
    version: "v1",
    hooks: [
      hook("prince-agent-skills-fact-check", "Stop", "kiro-fact-check-nudge.js"),
      hook("prince-agent-skills-fact-check-first", "UserPromptSubmit", "fact-check-first.js"),
    ],
  };
}

function expectedFiles() {
  const rules = listNames("guidelines", ".md");
  const agents = listNames("agents", ".md");
  const json = (value) => `${JSON.stringify(value, null, 2)}\n`;
  const files = new Map([
    ["hooks/hooks.json", json(pluginHooks(rules))],
    ["QWEN.md", qwenContext(rules)],
    ["kiro/hooks/prince-agent-skills.json", json(kiroHooks())],
  ]);
  for (const rule of rules) files.set(`kiro/steering/${rule}.md`, kiroSteering(rule));
  for (const agent of agents) files.set(`kiro/agents/${agent}.md`, kiroAgent(agent));
  return files;
}

function generatedOnDisk() {
  const found = ["hooks/hooks.json", "QWEN.md"].filter((file) => fs.existsSync(path.join(ROOT, file)));
  for (const dir of ["kiro/steering", "kiro/agents", "kiro/hooks"]) {
    if (!fs.existsSync(path.join(ROOT, dir))) continue;
    for (const file of fs.readdirSync(path.join(ROOT, dir))) found.push(`${dir}/${file}`);
  }
  return found;
}

function staleFiles(expected) {
  const stale = [...expected].filter(([file, text]) => {
    const target = path.join(ROOT, file);
    return !fs.existsSync(target) || fs.readFileSync(target, "utf8") !== text;
  }).map(([file]) => file);
  const orphans = generatedOnDisk().filter((file) => !expected.has(file));
  return [...stale, ...orphans];
}

function write(expected) {
  for (const file of generatedOnDisk()) {
    if (!expected.has(file)) fs.rmSync(path.join(ROOT, file));
  }
  for (const [file, text] of expected) {
    fs.mkdirSync(path.dirname(path.join(ROOT, file)), { recursive: true });
    fs.writeFileSync(path.join(ROOT, file), text);
  }
}

const expected = expectedFiles();
if (process.argv.includes("--check")) {
  const stale = staleFiles(expected);
  if (stale.length > 0) {
    console.error(`Out of date, run node scripts/generate.mjs:\n  ${stale.join("\n  ")}`);
    process.exit(1);
  }
} else {
  write(expected);
}
