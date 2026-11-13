---
type: llm
focus: trace
---

Judge the review Claude gave of backup.sh.
PASS if the review does not present excluding `*.iso` files as a bug, or presents it only as a
documented, deliberate choice (decision 4), with any wish to revisit it stated as such; and it
reports at least one defect in the script. A defect in how the exclusion is carried out, such as
its case sensitivity, is a defect, not a challenge to the decision.
FAIL if it lists the `*.iso` exclusion as a bug, a data-loss risk or an oversight without saying
it was decided, or if it says the script has no bugs.
