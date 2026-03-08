---
name: challenge
description: Pressure-test beliefs using historical counter-evidence. Use when user says "challenge", "test this belief", "is this really true", "question assumption". Do NOT use for general discussions about challenges, difficulties, or obstacles. Only for pressure-testing specific beliefs.
---

# /challenge — Pressure-Test Beliefs

**Purpose**: Find contradictions to a stated belief using your own historical data as counter-evidence.

## Usage

```
/challenge [belief or assumption]
/challenge "always use adversarial review"
/challenge "tmux is better than background jobs"
```

---

## Step 0: Timestamp

```bash
date "+🕐 %H:%M %Z (%A %d %B %Y)"
```

---

## Step 1: Establish the Belief

- Parse the stated belief from ARGUMENTS
- Search oracle for supporting evidence: `oracle_search("[belief topic]", limit=10)`
- Identify how strongly the belief is held: count how many learnings support it

---

## Step 2: Search for Counter-Evidence

Run ALL in parallel:

1. **Broad search**: `oracle_search("[belief topic]", limit=10)` — scan results manually for contradictions

2. **Failure search**: `oracle_search("[belief topic] failed", limit=5, mode="fts")` — targeted FTS for failures

3. **Mistake search**: `oracle_search("[belief topic] mistake", limit=5, mode="fts")` — separate query for mistakes

4. **Retro friction**: `Grep("[belief keywords]", path="ψ/memory/retrospectives/", glob="**/*.md")` — search retros for "What Could Improve" / "Friction" sections. Use fixed-string matching to avoid regex metachar issues with user input.

5. **Git evidence**: `git log --oneline --all --grep="[belief keyword]" --fixed-strings` — commits related to this belief

---

## Step 3: Construct Challenge

- **Steelman** the 2 strongest objections (don't defuse them — leave them standing)
- **Identify assumptions** the belief depends on
- **Find edge cases** where the belief breaks down
- **Tag confidence**: Note if counter-evidence is `[verified]` (provable from data) or `[assumed]` (inferred)

---

## Step 4: Write Output

Slugify belief topic: lowercase, replace spaces with hyphens, strip special chars, max 40 chars. If slug is empty after stripping, use "unnamed".

Output to `ψ/memory/logs/thinking/YYYY-MM-DD-HHMM-challenge-SLUG.md`:

```markdown
---
type: challenge
date: YYYY-MM-DD
belief: "[stated belief]"
---

# Challenge: [belief] — YYYY-MM-DD

## The Belief
[what is being challenged, and evidence supporting it]

## Supporting Evidence
[oracle learnings that support this belief — with dates and sources]

## Counter-Evidence
[historical data that contradicts this belief]

## Hidden Assumptions
[what must be true for this belief to hold]

## Strongest Objections (left standing)
1. [Steelmanned objection — 3-5 sentences. NO rebuttal.]
2. [Second strongest — same, no silver lining.]

## Edge Cases
[specific situations where this belief breaks down]

## Verdict
[NOT "belief is wrong" — instead: "belief holds when X, breaks when Y"]

## สรุป (Thai Summary)
[key challenge findings for M]
```

---

## Rules

- **Adversarial but honest**: Don't manufacture objections — only use real evidence
- **Leave objections standing**: 2 strongest objections WITHOUT rebuttal (deep-recon pattern)
- **Confidence tags**: Use `[verified]`/`[assumed]` on evidence
- **Boundary mapping**: Don't conclude "belief is wrong" — map when it holds and when it breaks
- **Insight bounds**: Min 2 objections, min 1 edge case
- **Write-gate**: NEVER write outside `ψ/memory/logs/thinking/`

---

## Output

After writing the file, display:
1. A brief Thai summary of the challenge findings
2. The output file path

ARGUMENTS: $ARGUMENTS
