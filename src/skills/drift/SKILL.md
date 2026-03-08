---
name: drift
description: Compare intention vs reality over 30-60 days. Use when user says "drift", "am I on track", "what changed", "intention vs reality". Do NOT use for daily standup — use /standup instead. Do NOT use for session wrap-up — use /rrr instead.
---

# /drift — Intention vs Reality

**Purpose**: Compare what you say you'll focus on vs what you actually did over 30-60 days.

## Usage

```
/drift                     # Last 30 days (default)
/drift --60                # Last 60 days
```

---

## Step 0: Timestamp

```bash
date "+🕐 %H:%M %Z (%A %d %B %Y)"
```

---

## Step 1: Parse Arguments & Set Variables

Parse ARGUMENTS for period flag:
- `--60` → $PERIOD=60
- (default) → $PERIOD=30

Derive:
- `$LIMIT`: 30d→50, 60d→100
- `$CUTOFF_DATE`: today minus $PERIOD days (calculate with `date -d "$PERIOD days ago" +%Y-%m-%d`)

---

## Step 2: Gather Intentions

Run in parallel:

1. **Current focus**: Read `ψ/inbox/focus.md` — current stated focus

2. **Handoffs**: `Glob("ψ/inbox/handoff/*.md")` — filenames contain `YYYY-MM-DD`. Filter by comparing against $CUTOFF_DATE. Extract "Pending" and "Next Session" sections from matching files.

3. **Traces**: `oracle_trace_list()` — what was explored and discovered

4. **Retro next steps**: `Glob("ψ/memory/retrospectives/**/*.md")` — retro paths contain date in directory structure (`YYYY-MM/DD/`). Parse year-month from parent dir + day from subdir to reconstruct date. Compare against $CUTOFF_DATE. Extract "Next Steps" sections.

---

## Step 3: Gather Actuals

Run in parallel:

1. **Git commits**: `git log --oneline --since="$PERIOD days ago"` — what actually got committed

2. **Activity topics**: `Grep` in `ψ/memory/logs/activity.log` for session topics within $PERIOD days

3. **Recent learnings**: `oracle_list(limit=$LIMIT, type="learning")` — filter client-side by extracting date from `source_file` path or `id` field. Compare against $CUTOFF_DATE.

4. **Investigations**: `oracle_trace_list(limit=20)` — what was actually investigated

---

## Step 4: Gap Analysis

Compare intentions vs actuals across these dimensions:

### Alignment (intention = action)
Things that matched — stated priorities that received actual work.

### Avoidance Patterns (planned but not done)
Things repeatedly intended but never executed. Speculate on possible why.

### Attraction Patterns (not planned but done)
Things that keep pulling attention despite not being "the plan".

### Drift Direction
Overall trajectory: are we drifting toward X, away from Y? Is the drift intentional reprioritization or unconscious?

---

## Step 5: Write Output

Output to `ψ/memory/logs/thinking/YYYY-MM-DD-HHMM-drift.md` (use current time for HHMM):

```markdown
---
type: drift
date: YYYY-MM-DD
period: 30d|60d
---

# Drift Analysis — YYYY-MM-DD

## Stated Focus
[what focus.md / handoffs / decisions said]

## Actual Activity
[what git log / activity.log / traces show]

## Alignment (where intention = action)
[things that matched]

## Avoidance Patterns (planned but not done)
[things repeatedly intended but never executed — and possible why]

## Attraction Patterns (not planned but done)
[things that keep pulling attention despite not being "the plan"]

## Drift Direction
[overall: are we drifting toward X, away from Y?]

## สรุป (Thai Summary)
[key insights for M]
```

---

## Rules

- **Tone**: No judgment — observe, don't evaluate
- **Distinguish**: Intentional reprioritization from unconscious drift
- **Cite sources**: Specific dates and sessions
- **Insight bounds**: Min 3 observations across the categories
- **Confidence tags**: Use `[verified]`/`[assumed]` on observations
- **Write-gate**: NEVER write outside `ψ/memory/logs/thinking/`

---

## Output

After writing the file, display:
1. A brief Thai summary of the most interesting drift patterns
2. The output file path

ARGUMENTS: $ARGUMENTS
