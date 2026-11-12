# prince-skills — instructions for agents

This repository is public: everything in it, its commits and its pull requests are public. Write
nothing about the maintainer's own machines, accounts, private repositories or employer.

- **Sources and generated files.** Edit `guidelines/`, `skills/`, `agents/` and `hooks/*.js`; then
  `npm run generate`, which writes `hooks/hooks.json`, `QWEN.md` and `kiro/`. Never edit those by
  hand: CI fails when they differ from what the generator writes.
- **Test:** one file with `node --test test/<name>.test.mjs`, all of them with `npm test`. A bare
  `node --test test/` fails.
- **Validate the plugin:** `claude plugin validate .`. Its warnings for the missing `version`
  (`docs/design.md`) and icon are expected.
- **Hooks are CommonJS** (`require`), run by harnesses as plain `node <script>`. A `"type":
  "module"` in `package.json` breaks every hook; the generator and tests are `.mjs` instead.
- **Rules are named `guidelines/`** because Qwen Code reads an extension's `rules/` folder
  differently (`docs/design.md`).
- **A file that names another rule or skill** names one published here, or a tool the user may not
  have, said as optional.
- **CI** runs on GitHub-hosted runners only, never with `pull_request_target` or `workflow_run`.
