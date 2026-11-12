---
name: find-docs
description: Use whenever a task involves a specific library, framework, SDK, API, CLI tool or cloud service ("how do I" questions, syntax and signatures, configuration, version migration, setup, library-specific debugging), even a well-known one, for current docs, API references and code examples over training data; prefer it to web search.
---

# Find docs

The vendor's own docs MCP server where the domain has one, Context7 for everything else, the live
page when Context7 can't answer.

## Steps

1. **A dedicated docs MCP server**
   - Where the session has one for the domain (AWS's Knowledge MCP server, an Apple docs server, a
     vendor's own), it goes first: its text is the vendor's
   - Route by where the doc lives, not by vendor: a community SDK documented on docs.rs or a
     package registry goes to Context7. In doubt, the dedicated server wins for its domain
   - None in this session, or a subagent without it: steps 2 and 3

2. **Context7**
   - MCP: `resolve-library-id`, then `query-docs`
   - Otherwise the `ctx7` CLI, also when the MCP offers only `authenticate` tools, says it needs
     authentication or answers "Invalid API key": none of these is "Context7 unavailable"
   - Resolve the ID first, unless given as `/org/project` or `/org/project/version`
   - `query`: the user's full question, not one word; it drives the ranking
   - Pick by exact name, more snippets, High/Medium reputation, higher Benchmark Score; name your
     pick if several fit, suggest a refinement if none does
   - At most 3 lookups per question, then use the best result you have
   - Lossy: it can drop a parameter, so read the vendor page (step 3) when the answer turns on the
     complete contract

   ```bash
   npx ctx7@latest <command>    # or install it: npm install -g ctx7@latest

   ctx7 library react "How to clean up useEffect with async operations"
   ctx7 docs /facebook/react "How to clean up useEffect with async operations"
   ```

   Login check: `ctx7 whoami`. Higher rate limits: `export CONTEXT7_API_KEY=…` or `ctx7 login`.

3. **The live page**: no Context7 entry, its quota is gone, or you need the unabridged text
   - Known page: fetch it with the session's fetch tool, preferring one that returns the page's own
     text over one that returns a model's summary, which drops exact signatures
   - Unknown page: a web search for `"<library> official documentation"`, then fetch it

## When every path fails

- A Context7 quota error ("Monthly quota reached", "quota exceeded"): step 3 first
- Only if step 3 fails or is impractical: tell the user the quota is gone (and that the live read
  failed, if it did), suggest `ctx7 login` if it recurs, and answer from training knowledge
  marked possibly out of date
- Never fall back to training data silently

## Common mistakes

- A web search before steps 1 and 2. A bug report or community thread is a web search: the place
  to learn how a tool actually behaves, not how it is designed to
- A question in a domain with its own docs server sent through Context7
- A library ID without its leading `/` (`/facebook/react`), or `ctx7 docs` before resolving
- API keys, passwords, personal data or proprietary code in any query
