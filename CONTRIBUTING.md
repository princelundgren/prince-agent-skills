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
3. **Keep a rule short and harness-neutral.** It loads in every session and every subagent, so each
   line costs everyone. A rule must stay under 9,000 characters; a test checks it.
4. **Test a hook's behaviour, not its code.** Each hook has a test file in `test/` that runs it on
   payloads shaped like the harness's documented or captured input.

Why the repo is built this way: [docs/design.md](docs/design.md).

## Licence

By contributing you agree that your contribution is licensed under the [MIT licence](LICENSE).
