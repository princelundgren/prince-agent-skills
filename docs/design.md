# Design notes

The decisions behind this repo's shape, and why. What each file does is in the README.

## One source per file; every harness form generated from it

Each rule, skill, agent and hook is one file. `scripts/generate.mjs` writes the forms each harness
needs from them: the plugin's `hooks/hooks.json`, `QWEN.md`, and `kiro/`. CI runs
`generate.mjs --check`, so a generated file can't drift from its source. Change the source, run
`npm run generate`, commit both.

## How the rules reach each harness

A Claude Code plugin ships commands, agents, skills, hooks and MCP servers, but not rules.

- **Claude Code:** `inject-rule.js` prints one rule as `additionalContext`, on `SessionStart` and
  on `SubagentStart`, the only way a hook's context reaches a subagent. One hook per rule, because
  Claude Code passes a string over 10,000 characters as a file path with a short preview, which
  the model isn't asked to read. A test fails when a rule reaches 9,000 characters.
- **Qwen Code:** the rules are concatenated into `QWEN.md`, which Qwen loads as an extension's
  context file. `inject-rule.js` prints nothing when Qwen's `QWEN_PROJECT_DIR` is set, so a session
  doesn't get each rule twice.
- **Kiro CLI:** steering files with `inclusion: always`.

The sources live in `guidelines/`, not `rules/`: Qwen Code 0.27.1 reads an extension's `rules/` as
path-scoped rules, and skips and warns about each one with no `paths:`.

A rule scoped to some files can't be published this way, since a hook can't scope by path. Such a
rule becomes a skill whose description says when it applies.

## Updates follow `main`

`plugin.json` and the marketplace entry carry no `version`, so Claude Code uses the commit SHA and
every merge to `main` is an update. The cost is that `claude plugin validate` warns about it.

Kiro's own plugin form, a power, isn't used: Kiro CLI installs a power only from Kiro's catalog or
a local folder, loads it only on keywords in a prompt, and a power holds no hooks or steering.

## Hooks

- **Fail open.** The hooks that can block exit 0 on anything they can't work out: a
  `UserPromptSubmit` hook that exits 2 blocks the user's prompt, and a `Stop` hook that exits 2
  keeps the turn going. `inject-rule` exits 1 on a rule it can't find, which on `SessionStart` and
  `SubagentStart` only shows the user the error.
- **`fact-check-nudge` asks once per turn, and its log decides.** `stop_hook_active` can't mean
  this hook asked, since another plugin's `Stop` hook can set it. The log records each request and
  its reply, so one request gets one reply however many tool calls the check makes, and a reader
  can see how often a check corrected anything. It logs the checked message's length, never its
  text, and the reply's first 4000 characters, which repeat the answer.
- **The check's reply repeats the whole answer**, in Claude Code and in Kiro. A headless session
  (`claude -p`) prints the turn's result, its last message, and no hook input tells a headless
  session from an interactive one, so a reply that left the answer out would replace it. An
  interactive session shows the answer twice.
- **`fact-check-nudge` is off under Qwen Code**, where it is untested; each check costs a turn.
- **Kiro's `Stop` payload holds no message**, so `kiro-fact-check-nudge` asks every turn and lets
  the session skip a turn with nothing to check, and nothing for the extra file's step to do.
- **Your own step goes in a file**, named by `FACT_CHECK_NUDGE_EXTRA_FILE`, not in an edit to the
  hook.

## Agents

A plugin's agents ignore `hooks`, `mcpServers` and `permissionMode`, so none of them declares an
MCP server; they use the session's. `solution-architect` has no `tools:` line, so it inherits the
session's tools, docs MCP servers included, which a design checked against the docs needs. Each
preloads `find-docs` by its plugin name, `prince-skills:find-docs`, because a subagent starts
without its parent's skills. Kiro's `tools:` takes category tags, and an agent with none gets no
tools, so the generator maps each tool, fails on one it doesn't know, and gives an agent with no
`tools:` line every tag.

## `comparing-products` is a skill, not an agent

Agent Skills are a portable standard ([agentskills.io](https://agentskills.io)): the same
`SKILL.md` works in Claude Code, the Claude apps and the API, while a subagent works in Claude Code
alone. So its frontmatter is the standard's `name` and `description` only, it is one file, and it
holds no product facts or prices, which go stale: it checks them live.

## Pressure-testing: a lean rule and an on-demand skill

The rule is always on and short: when to ask, by stakes. The skill holds the questioning
technique, loaded only when a plan is high-stakes or ambiguous. Folding both into one always-on
rule pays for the technique in every session; putting both in a skill lets a missed trigger skip
the check.

- **Calibrated by stakes and ambiguity**, the judgment an agent already applies to risky actions.
- **No cap on the number of questions.** A question that can't change the outcome isn't asked;
  any other one is.
- **A change that fits in one sentence needs no plan**, Claude Code's own test.

What it rests on:

| Source | What it showed |
|---|---|
| [Claude Code best practices](https://code.claude.com/docs/en/best-practices) | Explore, plan, code, commit; skip the plan when the diff fits in one sentence; let the agent interview you for a larger feature |
| [GitHub Spec Kit](https://github.com/github/spec-kit) | Phase gates, and a clarify step that resolves ambiguity before planning |
| [Kiro specs](https://kiro.dev/docs/specs/feature-specs/) | Requirements, design and tasks with approvals, requirements in EARS form, and a quick path for well-understood work |
| [BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD) | The questioning role kept apart from the building one, or questioning gets skipped |
| [EARS](https://alistairmavin.com/ears/) | A requirement grammar whose missing trigger is a question to ask |
| [Cursor plan mode](https://cursor.com/blog/plan-mode) | Not every task needs a plan |
| ["Ask or Assume?"](https://arxiv.org/abs/2603.26233) | On underspecified SWE-bench Verified tasks, agents that spot what's missing apart from writing the code, and ask only then, resolved 69.4%, well above a single agent, asking little on simple tasks |

## Only my own work is published

Skills I use but didn't write are linked from the README, not copied, whatever their licence.

## CI

GitHub-hosted runners only, and no `pull_request_target` or `workflow_run`, so a fork's pull
request runs with a read-only token and no secrets.
