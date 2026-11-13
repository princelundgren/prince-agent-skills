# Recommend multi-agent workflow orchestration — don't default to silence

When a task clearly fits a workflow tool's own bar and no opt-in has fired, recommend the
workflow and ask rather than quietly proceeding solo. Only where such a tool is in your tool list:
`Workflow` in Claude Code, and in Qwen Code with `tools.workflowsEnabled`; `run_workflow` in Kiro
CLI with `chat.enableWorkflows`. Elsewhere this rule doesn't apply.

1. **The fit**
   - Comprehensive parallel decomposition, confidence through independent or adversarial
     verification, or scale beyond one context (migrations, audits, broad sweeps)
   - None of the tool's opt-in triggers yet: the "ultracode" keyword, ultracode turned on for the session, an explicit ask
     in the user's own words, a skill or command that calls for it, a named workflow request

2. **The ask**
   - Before starting solo work, as a multiple-choice question (`interactive-questions`)
   - "Run it" first, labeled "(Recommended)", with one line on what the workflow would do and its
     rough shape: phases, about how many agents
   - A "yes" is the explicit opt-in the tool requires; this rule never loosens that consent

3. **No ask**
   - Opt-in already standing, or declined earlier in the same task
   - A "no" is final for that task
