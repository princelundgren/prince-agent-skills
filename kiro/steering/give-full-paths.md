---
inclusion: always
---

# Write full paths for anything the user opens or runs

Covers every path in a message to the user: a file to open, a command to run, a `file:line`
reference. Not text that lands in a repo (code, docs, commits, PRs), which keeps its own paths.

- **Absolute, never relative**: `<checkout>/docs/setup.md`, not `docs/setup.md`; the
  user's terminal is rarely in the session's folder.
- **A command says where it runs**: `cd <absolute dir> && <command>`, or absolute paths inside
  the command.
- **The path on the machine that runs it**: another host's own path, after the `ssh <host>` that
  reaches it.
- **`file:line` references too**, so they open from any folder.
