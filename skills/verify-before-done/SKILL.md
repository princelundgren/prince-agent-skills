---
name: verify-before-done
description: Use before saying a bug is fixed, a work item is done or a deploy worked, for what counts as proof.
---

# Verify before done

What counts as proof that work is done: run the check, read its output, claim only what it shows.
`verify-before-asserting` at the moment of saying "done".

## Checks

1. **The right layer**
   - The check targets the reported symptom, not a step on the way to it
   - A deploy read back proves distribution; a clean restart, that it starts; green CI, that it builds
   - Would it still pass if the fix were wrong? Then it is a prerequisite: find the check that fails

2. **Measurements, not estimates**
   - A number that decides the fix (a size, timeout, threshold or limit), measured at the layer that owns it
   - Sampled past the happy path: the tail is where caps get breached
   - Machine-readable sources over eyeballing: tool results, logs, exit codes
   - An estimate said to be one

3. **Say what you didn't prove**
   - Failures reported as failures, never softened ("mostly passing") or buried
   - Skipped or unverifiable here: say exactly that ("config written but not exercised")
   - Test-first work: the runner's real output for red and for green

4. **Not verification**
   - Typecheck or lint where a runtime path can be driven
   - Closing work without checking that the design doc governing it still matches
