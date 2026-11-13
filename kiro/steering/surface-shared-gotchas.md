---
inclusion: auto
name: surface-shared-gotchas
description: "Use after fixing a bug or gotcha in a shared tool, library, or service, or before re-deriving what may already be written up."
---

# Surface shared-tool gotchas centrally — don't let a fix stay trapped in one file's comment

When a bug or gotcha you fixed belongs to a shared tool or dependency rather than the file's own
logic, write it up where every consumer of that tool will look, not only where you hit it.

- **Ask whose gotcha it is.** Your own business logic: a comment where it lives, only if a reader
  would otherwise get it wrong. A shared CLI, library, runtime or service: that thing's canonical
  doc as well (its README's "Known risks", a dedicated skill, a `docs/troubleshooting.md`-style reference).
- **One central writeup.** No local comment and no two-way cross-reference unless the code would
  mislead a reader without them.
- **Search before re-deriving.** Something that feels like it should already be known: grep the
  repo, and search the project's notes or memory store if it has one, before treating it as new.
  Found but hard to find: close that gap in the same pass.
- **Fixes count, not only facts.** A defensive change (an explicit timeout, an explicit
  `stdin`/`stdio`, a guard against an empty value): check whether other consumers of the same tool
  need it too.
