---
inclusion: always
---

# Clean code — write what a stranger can read and safely change

Covers how the code, comments and tests you write read, not how much of it to change.

1. **Names**
   - Say what the thing is for: `retry_budget`, never `data`, `info`, `manager` or `utils`
   - Searchable and pronounceable: no abbreviation a stranger must decode, no type prefix
   - Functions are verbs, types and values nouns, booleans a question (`is_ready`)

2. **Functions**
   - One job at one level of abstraction: reading, deciding and formatting are three jobs
   - Either change state or return an answer, not both; returning what it created or removed, or
     a `Result`, is fine
   - No effect the name hides
   - Few parameters, and no boolean that switches between two behaviours: two functions instead
   - Short because it does one thing, not to meet a line count; no numeric limits here, since an
     agent applies a number literally
   - Logic that must change together lives in one place; code that only looks alike stays apart

3. **Comments**
   - **Default to no comment, even in a heavily commented file**, public APIs aside. One line,
     never a block, only where the code can't show something a reader would get wrong: a hidden
     invariant, a workaround for a specific bug, a surprising value. If removing it wouldn't
     confuse a future reader, don't write it.
   - **A doc comment on every public API**, in the language's own form: the contract (what it
     does, returns or raises, its side effects), never the signature restated.
   - **Never in a comment:** what you changed, decisions or history, your tracker's ids or dates,
     a pointer in place of the reason, or what the code already shows. It reads right to someone
     who never saw the diff.
   - No comment that restates a test.
   - Names, small functions and clear types before any comment; never banners, changelog notes or
     commented-out code.

4. **Errors and null**
   - An error message names what failed and on which input (never a secret's value), and what to
     try where that is known
   - The language's own error path: `Result` in Rust, exceptions in Python, the project's habit
     elsewhere
   - Absence in the type: `Option`, `T | None` under a strict checker, or an empty collection;
     never an unchecked null, returned or passed
   - Never swallow one you don't understand

5. **Types and design**
   - A type or module has one job, like a function
   - A small type over a bare string or int when the value has rules: an id, a unit, a state
   - An enum over a set of booleans; an exhaustive `match` or `switch` over type checks
   - Composition over inheritance
   - An interface, trait or factory only once two real implementations exist; a design pattern
     only where it makes the code simpler
   - Pass a function what it needs, not an object to dig its parts out of
     (`order.customer().address()`); fluent and iterator chains are fine

6. **Fitting in**
   - The repo's conventions and the language's idioms, in a new file as much as an old one
   - Layout and line length are the repo's formatter's, where it has one; never a reformat of
     lines you didn't change

7. **Tests**
   - **Tests that check behaviour that matters**, not tests that restate the code
   - Named for the behaviour they pin, in arrange, act, assert
   - Fixture, mock and timing assumptions flagged, so no one "fixes" them into a false green

8. **Smells: avoid them in what you write, notice them in what you pass by**
   - Anything that breaks the sections above
   - A function working mostly on another type's data: it belongs on that type, where you own it
   - Code reaching into another module's internals instead of its public surface
   - A field set only in some states: an enum or a separate type
   - Dead code: removed when your change orphaned it

9. **Code you pass by: suggest it, don't change it**
   - The lines you write follow this rule; the code beside them stays as it is
   - A suggestion only for a smell above that makes the next change harder or riskier
   - In the closing block's Heads-up (`close-the-turn-clearly`), not asked: `file:line` and why,
     one line each, three at most, each once; no answer is a skip
   - The user may answer now, ticket or skip: now is its own commit (its own PR where the repo
     uses PRs), apart from the task, with the tests green before and after
   - A ticket only on the user's yes, in the repo's own tracker
   - Never a `TODO` comment in its place
