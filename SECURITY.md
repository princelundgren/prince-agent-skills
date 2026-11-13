# Security

The hooks run as `node` on your machine, with your user's rights, on the prompt, session, subagent
and tool events they're registered for (`hooks/hooks.json`, `kiro/hooks/`). A flaw in one is worth
reporting privately.

## Reporting a vulnerability

Use [Report a vulnerability](https://github.com/princelundgren/prince-skills/security/advisories/new)
on this repository, not a public issue or discussion. Say which file, what an attacker controls,
and what they can do with it; a payload that shows it helps most.

In scope: the hooks in `hooks/`, the generator in `scripts/`, the CI workflow, and any rule, skill
or agent text that would lead an agent to run or leak something it shouldn't.

## Supported versions

Only `main`. A fix lands there; update your install to get it ([Install](README.md#install)).
