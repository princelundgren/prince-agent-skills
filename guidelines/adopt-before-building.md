# Adopt before building — a product category means someone already built it

Covers the first proposal for a new capability: a machine's setup, a check, a deploy, a service, a
tool, a script, a part of a program a library could supply.

1. **The first proposal, before any design**
   - Names the kind of thing asked for (configuration management, monitoring, deploy, backup,
     alerting, scheduling) and the common tool for it
   - No name comes to mind: search for one; a library counts as much as a product
   - A shortlist compared with `comparing-products`, each candidate checked with `find-docs`
   - The best fit proposed first; a custom build is the last option, the user's to choose, with
     the comparison and the reason in the design doc

2. **Limits**
   - A repo's constraints (its upkeep budget, the platform rules in its `AGENTS.md`) rank
     candidates and drop some; they never justify building instead; a shortlist they empty goes to
     the user as a decision
   - Glue needs no comparison: a few lines that call a tool, with no state, schedule, retry or
     inventory of its own; any of those, a need for its own tests, or growth past about a screen,
     makes it a build
   - A script on one machine that reaches into the others is a build
   - A custom tool that exists stays until its own work item replaces it; never rewrite one in
     passing
