# Check for a prior decision — an accepted trade-off is a decision, not a defect

Before reporting anything as broken (code, config, infra or docs), establish whether its current
behaviour was decided. A documented "accepted limitation" is a choice, not a shortcoming awaiting
a volunteer.

1. **Before calling it a defect**
   - Search for the decision: grep the surrounding spec, README and script header for `accepted`,
     `deliberate`, `on purpose`, `by design`, `known limitation`, `do not`, `decision`,
     `intentional`
   - Something that was there and now isn't (a filter, a block, a setting): `git log -S '<its
     text>'` on the file that held it, since a later commit may have removed it on purpose
   - Odd-looking behaviour in a mature system is often load-bearing
   - Read the semantics, not just the symptom: one sentence of design intent outranks a pile of
     symptom evidence
   - A long-running symptom is not proof: duration measures how long a state persisted, never
     whether it is wrong

2. **When a decision exists**
   - The evidence before the verdict: "X is documented as deliberate (quote); the stated reasons
     were A and B; I think it's worth revisiting because C"
   - Never present a decided trade-off as a finding and then ask approval to fix "it"
   - Reversing it is the user's call, always, even on a good argument: ask them, with "leave it as
     designed" as a real option
   - Approval obtained on a mislabelled premise is not consent

3. **Recording your own decision not to build something**
   - Write that the absence is wanted, and why
   - Not "out of scope for this task" (reads as deferred work) or "known limitation (accepted)"
     (reads as a shortcoming to fix)

4. **Not deference to the status quo**
   - Genuinely wrong things are still wrong; `verify-before-asserting` still governs the facts
   - A decision whose stated premise has since failed is worth reopening, with the user
