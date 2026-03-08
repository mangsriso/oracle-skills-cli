---
name: emerge
description: Surface unnamed patterns from Oracle knowledge base. Use when user says "emerge", "what patterns", "what am I missing", "surface patterns". Do NOT use for searching specific topics — use /trace instead. Do NOT use for daily reflection — use /rrr instead.
---

# /emerge — Surface Unnamed Patterns

**Purpose**: Scan Oracle knowledge base for patterns you have but haven't named.

## Usage

```
/emerge                    # Last 14 days (default)
/emerge --month            # Last 30 days
/emerge --quarter          # Last 90 days
```

---

## Step 0: Timestamp

```bash
date "+🕐 %H:%M %Z (%A %d %B %Y)"
```

---

## Step 1: Parse Arguments & Set Variables

Parse ARGUMENTS for period flag:
- `--month` → $PERIOD=30
- `--quarter` → $PERIOD=90
- (default) → $PERIOD=14

Derive:
- `$LIMIT`: 14d→30, 30d→50, 90d→100
- `$CUTOFF_DATE`: today minus $PERIOD days (calculate with `date -d "$PERIOD days ago" +%Y-%m-%d`)

---

## Step 2: Parallel Data Gathering

Run ALL of these in parallel:

1. **Recent learnings**: `oracle_list(limit=$LIMIT, type="learning")` — filter client-side by extracting date from `source_file` path (learnings use `YYYY-MM-DD` prefix in filename). Compare against $CUTOFF_DATE.

2. **Recent retros**: `oracle_list(limit=$LIMIT, type="retro")` — filter client-side by extracting date from `source_file` path (retros use date in directory path like `YYYY-MM/DD/`). Compare against $CUTOFF_DATE.

3. **Top concepts**: `oracle_concepts(limit=30)` — feed into "Recurring Themes" analysis (concepts appearing across multiple docs)

4. **Recent traces**: `oracle_trace_list(limit=20)` — feed into "Incomplete Investigations" analysis (traces without follow-up)

5. **Current focus**: Read `ψ/inbox/focus.md` — feed into "Implicit Energy" analysis (compare focus vs actual activity)

6. **Activity themes**: `Grep` for themes in `ψ/memory/logs/activity.log` (entries from last $PERIOD days)

7. **Git activity**: `git log --oneline --since="$PERIOD days ago"`

8. **Previous emerge outputs**: `Glob("ψ/memory/logs/thinking/*emerge*")` sorted by filename descending — read last 3. If none exist (first run), skip silently.

**Context budget**: If any single source exceeds ~5k tokens, summarize key points before analysis. Total input to analysis step should stay under ~20k tokens.

---

## Step 3: Deep Analysis — 6 Pattern Types

Analyze gathered data for these 6 pattern types:

### 1. Recurring Themes
Concepts/topics appearing in 3+ documents within the period. Cross-reference oracle_concepts data with actual document content.

### 2. Incomplete Investigations
Traces opened but never closed, questions raised in learnings/retros but not answered. Check trace_list for traces without follow-up learnings.

### 3. Contradictions
Learnings that say opposite things about the same topic. Productive tensions worth examining.

### 4. Decision Loops
Same decision reconsidered across multiple sessions. Look for similar topics appearing in handoffs/retros repeatedly.

### 5. Implicit Energy
What gets most attention (commit frequency, learning density) vs what M says is priority (focus.md). Where does time actually go?

### 6. Unasked Questions
Questions the data raises but nobody has asked. Gaps between what's documented and what's implied.

---

## Step 4: Write Output

Output to `ψ/memory/logs/thinking/YYYY-MM-DD-HHMM-emerge.md` (use current time for HHMM):

```markdown
---
type: emerge
date: YYYY-MM-DD
period: 14d|30d|90d
documents_scanned: N
---

# Emerge — YYYY-MM-DD

## Recurring Themes
[themes in 3+ docs with oracle references]

## Incomplete Investigations
[traces/learnings that open questions but don't close them]

## Contradictions
[learnings that conflict — productive tensions]

## Decision Loops
[decisions reconsidered repeatedly]

## Implicit Energy
[where attention actually goes vs stated focus]

## Unasked Questions
[questions the data implies but nobody asked]

## สรุป (Thai Summary)
[3-5 bullet points in Thai — key takeaways for M]
```

---

## Rules

- **Tone**: Curious, not prescriptive — "I noticed..." never "You should..."
- **Cite sources**: "In learning X from Feb 15..."
- **Insight bounds**: Min 3 insights if significant patterns exist, max 10. If no significant patterns found in the period: output 0 insights with honest explanation (min 3 does not apply to empty periods)
- **Confidence tags**: Use `[verified]`/`[assumed]` on each insight
- **Self-referential**: Read previous emerge outputs to avoid repetition + build on prior analysis
- **Write-gate**: NEVER write outside `ψ/memory/logs/thinking/`

---

## Output

After writing the file, display:
1. A brief Thai summary of the most interesting findings
2. The output file path

ARGUMENTS: $ARGUMENTS
