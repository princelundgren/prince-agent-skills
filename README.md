# prince-agent-skills

[![CI](https://github.com/princelundgren/prince-agent-skills/actions/workflows/ci.yml/badge.svg)](https://github.com/princelundgren/prince-agent-skills/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Rules, skills, agents and hooks that make coding agents check facts, own their mistakes and
pressure-test plans before building. One plugin for Claude Code and Qwen Code, with generated forms
for Kiro CLI and any agent that reads `SKILL.md` folders.

I use these every day. They came out of watching agents state API behaviour from memory, guess
past repeated failures, and treat a decided trade-off as a bug.

## What's in it

**Rules**, always on: in every session, and in Claude Code in every subagent too.

| Rule | What it makes the agent do |
|---|---|
| [`verify-before-asserting`](guidelines/verify-before-asserting.md) | Check each factual claim against a live source before stating it |
| [`own-your-mistakes`](guidelines/own-your-mistakes.md) | Say what went wrong, size it, find the cause, then fix it |
| [`stop-after-repeated-failures`](guidelines/stop-after-repeated-failures.md) | Stop guessing after 2-3 failed variations and switch strategy |
| [`check-for-a-prior-decision`](guidelines/check-for-a-prior-decision.md) | Look for a recorded decision before calling something a defect |
| [`pressure-test-before-building`](guidelines/pressure-test-before-building.md) | Ask questions in proportion to the stakes before building |
| [`keep-working-after-a-mid-task-prompt`](guidelines/keep-working-after-a-mid-task-prompt.md) | Treat a message sent mid-task as an addition, not a replacement |

**Skills**, loaded when a task needs them:

- [`pressure-test`](skills/pressure-test/SKILL.md): an adversarial pass over a plan, design or brief that surfaces hidden assumptions
- [`comparing-products`](skills/comparing-products/SKILL.md): compares products, tools or services on verified facts and recommends one
- [`find-docs`](skills/find-docs/SKILL.md): routes "how does this library work" questions to current documentation instead of memory

**Agents** for spec-driven work, each preloading `find-docs` in Claude Code:

- [`requirements-analyst`](agents/requirements-analyst.md): a brief becomes `requirements.md`, in EARS form with acceptance criteria
- [`solution-architect`](agents/solution-architect.md): requirements become `design.md`, with its decisions and trade-offs
- [`implementation-planner`](agents/implementation-planner.md): a design becomes `tasks.md`, ordered, with a check per task

**Hooks:**

- `fact-check-first`: before each answer, a reminder to look up the facts it will state
- `fact-check-nudge`: after a long final message, one request to fact-check it with the agent's own tools
- `repair-core-bare`: undoes the `core.bare = true` that Claude Code's worktree tools can leave behind ([anthropics/claude-code#58345](https://github.com/anthropics/claude-code/issues/58345))

## Install

### Claude Code

```text
/plugin marketplace add princelundgren/prince-agent-skills
/plugin install prince-agent-skills@prince-agent-skills
```

Updates are off by default for a marketplace outside Anthropic's own. Turn them on in `/plugin` →
**Marketplaces** → `prince-agent-skills` → **Enable auto-update**, or declare the marketplace with
`autoUpdate` in a settings file ([plugin docs](https://code.claude.com/docs/en/plugins/loading)).

### Qwen Code

```bash
qwen extensions install princelundgren/prince-agent-skills:prince-agent-skills
qwen extensions update --all   # to update
```

Qwen Code reads the rules from `QWEN.md`, so the rule hooks stay silent there and each rule loads
once. `fact-check-first` and the session-start `repair-core-bare` run; `fact-check-nudge` is off.

### Kiro CLI

The skills install with [`skills`](https://github.com/vercel-labs/skills); the rules, agents and
hooks come from a clone, whose path the hooks name:

```bash
npx skills add princelundgren/prince-agent-skills -g -a kiro-cli
git clone https://github.com/princelundgren/prince-agent-skills.git ~/.local/share/prince-agent-skills
cd ~/.local/share/prince-agent-skills
mkdir -p ~/.kiro/steering ~/.kiro/agents ~/.kiro/hooks
cp kiro/steering/*.md ~/.kiro/steering/
cp kiro/agents/*.md ~/.kiro/agents/
cp kiro/hooks/*.json ~/.kiro/hooks/
```

To update: `npx skills update -g`, then `git pull` in the clone and the three `cp` lines again.

### Any other agent

```bash
npx skills add princelundgren/prince-agent-skills
```

This installs the skills only. The rules are plain Markdown in [`guidelines/`](guidelines/): add
them to your agent's always-on instructions.

## Configure

`fact-check-nudge` appends the text of the file named by `FACT_CHECK_NUDGE_EXTRA_FILE`, if set, to
its request: a step of your own, such as keeping a notes store true. In Claude Code, set it in the
`env` block of `settings.json`.

## Known limits

- **Kiro over ACP** (inside Zed, for one) loads no hooks; the steering and agents still work.
- **Qwen Code subagents** may not get the rules: whether an extension's `QWEN.md` reaches them is
  unverified.
- **`fact-check-nudge` costs a turn** each time it asks, and it doesn't run under Qwen Code.
- **Hooks need `node`** on `PATH`.

## Works well with

Not mine, so not published here:

- [Karpathy-inspired coding guidelines](https://github.com/multica-ai/andrej-karpathy-skills): think first, keep it simple, change only what you must
- [`grilling` and `grill-me`](https://github.com/mattpocock/skills) by Matt Pocock: an interview that stress-tests a plan
- [`github-actions-hardening`](https://github.com/github/awesome-copilot/tree/main/skills/github-actions-hardening) from GitHub: a workflow threat model
- [Create README](https://docs.github.com/en/copilot/tutorials/customization-library/prompt-files/create-readme) from GitHub Docs
- [`playwright-cli`](https://github.com/microsoft/playwright-cli): browser automation for agents

## Help and feedback

Questions and ideas go in [Discussions](https://github.com/princelundgren/prince-agent-skills/discussions),
bugs in [Issues](https://github.com/princelundgren/prince-agent-skills/issues). Feedback on whether a
rule changes what your agent does is the most useful kind.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). How the repo is put together, and why:
[docs/design.md](docs/design.md).

Maintained by [Prince Lundgren](https://github.com/princelundgren). [MIT](LICENSE).
