---
name: pressure-test
description: Use at Tier 3 of the pressure-test-before-building rule, or when asked to pressure-test or poke holes in a plan, for adversarial questioning that surfaces hidden assumptions before requirements, a design or non-trivial code are final.
---

# Pressure-test

Look for the reasons the plan is wrong before it is built. The `pressure-test-before-building`
rule decides when this runs.

## Steps

1. **Switch mindset**
   - Stop building; try to break the plan, not confirm it
   - Say so ("pressure-testing this before I continue")

2. **Requirements: the EARS pass** (alistairmavin.com/ears/)
   - Every claim checked against EARS' forms; one that fits none is missing a trigger, and that is a specific question
   - Ubiquitous, "The system shall X": is X really unconditional?
   - Event-driven, "WHEN <trigger>, the system shall X": what causes X?
   - State-driven, "WHILE <state>, the system shall X": when does it apply, and when not?
   - Unwanted behaviour, "IF <condition>, THEN the system shall X": what happens when it goes wrong?
   - Optional, "WHERE <feature is included>, the system shall X": optional, or just unstated?
   - A formal requirements.md still goes to the `requirements-analyst` agent

3. **Design: approaches, then a pre-mortem**
   - 2-3 approaches with trade-offs; inside a brainstorming flow that already lists them, hold it to this rather than running it twice
   - Which product or library already does this, adopted or the reason not
   - "Assume this is the wrong call — what's the most likely reason?", answered yourself first, out loud, before the user weighs in
   - Highest stakes only (architecture, wide-blast-radius infra, hard to reverse), optionally: a fresh-context critic subagent told to refute the plan against the requirements, since the context that wrote it confirms it

4. **Before code: the interview**
   - Rounds of questions, multiple choice where there are a few real options
   - On edge cases and trade-offs not yet named: inputs that break the current understanding, what "done" means, what is out of scope

## How many questions

- As many as the ambiguity needs, never a fixed count; more is fine
- Never trim a real question to look efficient
- The only question to avoid: one that can't change the outcome either way (padding)

## Not this

- Confirming your own plan: that is a status update
- Tier-1 work (typos, one-line fixes, a single obvious implementation)
- A replacement for a brainstorming flow or the `requirements-analyst` and `solution-architect` agents: it raises their rigor
