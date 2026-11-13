# Contributing

Reports of what an agent did with these files are as welcome as pull requests: open an issue, or
start a discussion for a question or an idea for a new rule or skill. A security problem goes
through [SECURITY.md](SECURITY.md), never a public issue.

## A pull request

1. **Say what it changes in an agent's behaviour, in your own words.** The PR template asks for it;
   a generated summary doesn't tell me why you want the change.
2. **Edit the source, then regenerate.** `guidelines/`, `skills/`, `agents/` and `hooks/*.js` are
   the sources; `hooks/hooks.json`, `QWEN.md` and `kiro/` are generated from them:

   ```bash
   npm run generate
   npm test
   ```

   Tests need Node 22 or later and git, and nothing to install.
3. **Keep a rule short and harness-neutral.** Most rules load in every session and every subagent, so each
   line costs everyone. A rule must stay under 9,000 characters; a test checks it.
4. **Test a hook's behaviour, not its code.** Each hook has a test file in `test/` that runs it on
   payloads shaped like the harness's documented or captured input.

## Evals

`evals/` holds cases that measure whether a rule changes what Claude Code does: each case runs
three times with the plugin and three times without it, and the report shows the difference. Every
run is a real model call on your own account, so the suite runs by hand, never in CI:

```bash
claude plugin eval . --scaffold
```

It needs Claude Code 2.1.269 or later and, if git is installed, git 2.31 or later. `--scaffold`
runs each case's `fixture.sh` as you, outside the agent's sandbox, to build the files the case works
on: read the `fixture.sh` files in a pull request before running its cases. To try one case once
while changing it: `claude plugin eval . --scaffold --case <name> --runs 1 --ablation none`. That
mode also scores the graders that only show whether a skill fired, so a case can score under 1.00
even when Claude did what it should.
A change to a rule is worth a run before and after; [Claude Code's eval
docs](https://code.claude.com/docs/en/plugin-evals) explain the cases and graders.

Why the repo is built this way: [docs/design.md](docs/design.md).

## Licence

By contributing you agree that your contribution is licensed under the [MIT licence](LICENSE).
