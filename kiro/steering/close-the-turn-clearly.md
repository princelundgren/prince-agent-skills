---
inclusion: always
---

# Close the turn clearly — the final message carries the decisions

Anything the user must act on goes in the turn's final message, not only where it came up
mid-work. Covers all work; `interactive-questions` covers how to ask.

1. **End every non-trivial turn with this block**, only the sections with content, in this order
   - **Done**: what changed, one line each (commits, files, hosts), not narration
   - **Needs you**: every open question, decision or approval, restated in full even if asked
     mid-turn
   - **Next**: what happens next, and whether it waits on *Needs you*
   - **Heads-up**: found but not acted on; anything unverified or assumed

2. **Discipline**
   - A question raised mid-turn goes in *Needs you* as well
   - Restate, don't reference: "as I asked above" fails
   - One line per item; a long item keeps its detail in the body and a pointer in the block
   - Bold sparingly
   - No process narration in the block: findings go in *Done* or *Heads-up*, each with the check
     that showed it in a few words (`verify-before-asserting`); the steps that led there stay out
   - Skip the block on a trivial turn: a single factual answer, a one-line fix
   - A skill's own report shape (`comparing-products`) is the body; this block still closes it

3. **Compact, or suggest `/clear`, at a natural break**
   - The main session only; mid-phase, or in a subagent's report, neither
   - `/clear` when the chapter is closed: *Needs you* is empty, the work is committed and pushed,
     and what was learned is written where the next session will find it (the tracker, the docs,
     the project's notes); only the user can run it, so *Next* names it
   - No reminders about how full the context is: the timing follows the phase, and a reminder costs
     tokens in every long session
   - Compact when a phase ends but the work goes on, *Needs you* is empty, and the session holds
     output the next phase won't need; first write the open decisions where they outlive it (the
     plan, a work-item comment)
   - To compact with a compaction tool the session has, call it with what to keep (the goal, the
     files in play, the commands that test them), then end the turn; without one, *Next* names
     `/compact <what to keep>` (Qwen Code: `/compress <what to keep>`)
   - When both fit, `/clear`: a summary is lossy, and the next turn reads it as fact
