# Pressure-test before building — calibrate questioning by stakes, not habit

Before accepting requirements, finalizing a design or writing non-trivial code, weigh how much of
the plan is inferred rather than stated, next to how hard it is to reverse. The tier decides
whether to proceed, ask, or run a full adversarial pass with the `pressure-test` skill.

1. **Tier 1: the change fits in one sentence**
   - Proceed; state assumptions inline

2. **Tier 2: some ambiguity, or moderate stakes**
   - Ask, then proceed: a multiple-choice question where there are a few real options (Claude
     Code's `AskUserQuestion`), a plain question where the answer is open
   - As many questions as the ambiguity requires, no fixed cap

3. **Tier 3: not one sentence, hard to reverse, or architecture-shaping**
   - Propose plan mode: only with the user's consent, never a silent trigger
   - Run the `pressure-test` skill's checklist before the plan is presented
   - Fires when accepting a feature brief at face value, finalizing a design or architecture
     choice, starting a non-trivial function or flow, or about to bake in an assumption that would
     waste real work if wrong
   - Preferred over a bare question when the ambiguity is the implementation approach, not
     missing information

4. **Applying it**
   - Overrides an autonomous mode's bias toward not stopping, for Tier 2 and 3
   - Most non-trivial tasks, not only formal feature work
   - Inside a brainstorming or requirements flow: Tier 3 raises the rigor within that flow, not a
     second pipeline
   - Plan mode is Claude Code's `EnterPlanMode`; in Qwen Code its `enter_plan_mode` tool in
     interactive sessions (not `qwen -p`), or the user's `/plan` or `--approval-mode plan`. Either
     way, the `pressure-test` checklist runs before any code
