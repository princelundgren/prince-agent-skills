---
name: comparing-products
description: Compares and helps choose between products, tools or services — physical goods, software and apps, subscriptions and services, developer tools and libraries, and AI models; use when the user weighs specific options ("X vs Y", "which should I buy or use", "is A or B better") or asks for the best option in a category. Not for comparing source code, diffs, git branches, or arbitrary text or data.
---

# Comparing products

Produce a decision, not a spec dump. The moves below are what make a comparison useful.

## Scale effort to the stakes

- Low stakes ("which is cheaper, A or B?"): one or two checks and a direct answer
- Big-ticket, hard to reverse or a long commitment: the full sequence

## The sequence

1. **Fix the premise**
   - Each named option exists, its exact model, version, edition or tier pinned from a live source
   - A wrong or conflated name said out loud
   - An open-ended ask: a shortlist of 2–5 credible candidates first
   - The vendor's current line checked for a newer or adjacent model before comparing
   - Silent revisions: one name can cover different versions on sale side by side, so pin the
     revision

2. **Elicit the deciders**
   - As many questions as change the recommendation, no fixed cap, never a generic questionnaire
   - Domain-adapted, multiple choice preferred, nothing already known
   - Typical: space or scale, budget, existing ecosystem, region, must-have features, data and
     privacy needs, lock-in tolerance

3. **Verify from primary sources**
   - Specs, features and pricing from vendor spec pages, official docs and changelogs,
     cross-checked where they disagree
   - The session's search and fetch tools, reading full pages rather than summaries
   - Anything unverified stated as an assumption; never a spec or price from memory
   - No web access: say so and mark facts unverified
   - Vendor claims labelled apart from independent measurements, never mixed unlabelled in one
     table, and no ✅ against a blank for a rival whose page you didn't read
   - An independent test source that turns up (review lab, benchmark database, standards body) is
     opened and read
   - A hands-on test on a live account: its plan or tier read from the account itself (billing
     page, API) before the first measurement and again at the end; a signup can start a paid
     trial, and a "free" result measured on a trial describes the trial

4. **Right-size, and find the better-shaped option**
   - Advantages the user's constraints make irrelevant dropped (a 10G port on a 1 Gbps line)
   - An option they didn't name that fits better looked for: another tier, form factor or
     category

5. **Recommend**
   - A table of the decision-relevant dimensions only (Domain dimensions), with a column for the
     user's situation
   - One lead recommendation, the honest tradeoffs, and the 1–2 facts that would flip it
   - Price and availability localized to the user's region, asked once if unknown

6. **Cite and date**
   - Sources named, the date noted, anything pre-release or unverified flagged

7. **Offer to capture**
   - The user commits to a choice and a memory tool is available: offer to save it with its
     rationale

## Gather first, recommend once

- The candidate set and comparable data assembled before naming a winner
- Never a pick published and then revised as each search returns
- A decisive fact unobtainable: say what is missing and label the answer provisional

## Domain dimensions

Use the set that matches what is being compared.

1. **Physical goods**: specs that matter (not marketing numbers), real-world review consensus,
   ports and compatibility, size and fit, warranty and support, regional availability, total cost
   of ownership
2. **Software / apps**: platforms, core features vs the user's must-haves, data ownership and
   export, privacy and telemetry, pricing model, open source or not, lock-in and migration cost,
   integrations, project health (maintenance, release cadence)
3. **Subscriptions / services**: regional coverage, real all-in cost (fees, overage), contract
   length and exit cost, SLA and support, reliability reputation
4. **Dev tools / libraries**: fit to the existing stack, maturity and maintenance health, community
   and ecosystem size, license, performance at the target scale, migration cost, currency (current
   stable or LTS)
5. **AI models**: task fit, context and output limits, price per token, latency and throughput,
   self-host vs API, licensing and openness

## Output format

1. **Verdict first**: the pick and a one-line reason in the first two lines
2. **One table**: the same dimensions for every candidate, comparable units, bare values, no prose
   or marketing adjectives in cells; a second table splits by what the reader decides (specs vs
   price), never by product
3. **What the evidence says**: three or four one-sentence bullets, a lab's conclusion compressed,
   no block quotes
4. **Caveats and gaps**: one block at the end, never ⚠️ or ❗ between data sections
5. **Sources and date**: unverified or pre-release flagged

Formatting:

- Bold on a handful of things per report at most
- No inline block quotes from sources: compress the finding into your own sentence and cite it
- Facts in table rows, not paragraphs
- Every dimension that doesn't change the decision cut, however hard it was to find
- No process narration ("I then checked"): process notes go in the caveats block or nowhere
