---
inclusion: always
---

# Ask interactively when there's a discrete choice; plaintext when there isn't

A small set of discrete choices goes to the user as a multiple-choice question, so the answer is a
click; open-ended input stays a plain question.

1. **A multiple-choice question: 2-4 enumerable options**
   - Claude Code's `AskUserQuestion` or Qwen Code's `ask_user_question`; where there is no such
     tool (Kiro CLI), numbered options in plain text, answered with a number
   - Any decision point with a short option set, a preference as much as a blocker, not only the
     hard blockers the tool's own guidance names
   - Approaches or designs, candidate files or targets, scope, style or format, a yes/no with
     named alternatives
   - `multiSelect: true` when the choices aren't mutually exclusive
   - `preview` (Claude Code only, on a single-select question) when options compare better visually: code, mockups, config diffs
   - The recommended option, if there is one, first and labeled "(Recommended)"

2. **Plain text: open-ended input**
   - Free-form values (names, paths, URLs, credentials, numbers), an unbounded answer space, or a
     list that would only guess at what the user might type
   - Ask in the response and wait for a typed reply
   - Don't force-fit: "yes / no / it depends, let me explain" is a text question

3. **A round of several questions, by its shape**
   - Up to 4 questions, each with 2-4 real options: the tool, one question each
   - Larger or open-ended: numbered questions in plain text, each with your recommended answer,
     where "yes" accepts them all

4. **Not whether to ask**
   - This rule sets how a question is asked; `pressure-test-before-building` and
     `pressure-test-before-answering` decide whether to ask or state the assumption and proceed
   - In an autonomous mode it applies only to the questions that do get asked
