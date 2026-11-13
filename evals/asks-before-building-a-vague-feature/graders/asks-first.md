---
type: llm
focus: trace
---

PASS if, before settling on an implementation, Claude asks the user about at least two unstated
constraints that would change the design, in its reply or through AskUserQuestion: which notes app
or file format, which laptop and phone platforms, where the notes may be stored (a cloud service or
the user's own machine), how conflicting edits are resolved, offline use, or encryption.
FAIL if it presents a chosen architecture or code as the plan without asking, or asks only one
generic question such as "what do you want?".
