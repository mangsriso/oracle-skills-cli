---
name: prepare
description: Pre-plan knowledge integration. Use when user says "prepare", "prep for plan", or before starting plan mode on non-trivial work. Combines oracle protection + internal discovery + learn docs + gap analysis. Do NOT use for quick fixes or trivial tasks.
---

# /prepare — Pre-Plan Knowledge Integration

**Goal**: Gather everything we know before planning. Surface gotchas, related work, learn docs, and knowledge gaps — then recommend the right path forward.

## Usage

```
/prepare [topic]              # Full integration (oracle + internal + learn + gaps)
/prepare [topic] --quick      # Oracle-only (gotcha check, skip deep search)
```

---

## Step 0: Timestamp

```bash
date "+🕐 %H:%M %Z (%A %d %B %Y)"
```

---

## Step 1: Parallel Knowledge Gathering

Run ALL of these in parallel (use Agent tool or direct tool calls):

### 1a. Oracle Protection (gotchas)
```
oracle_search("[topic]", limit=10)                    # broad — finds all related knowledge
oracle_search("[topic] gotcha", limit=5, mode="fts")  # targeted — exact gotcha matches
```
**Note**: Use the broad query (no extra keywords) as primary. The "gotcha" FTS query catches tagged warnings. Don't add generic words like "mistake" or "pattern" — they dilute FTS matching.

### 1b. Learn Documentation (ψ/learn/)
```
Grep for [topic] in ψ/learn/ (if directory exists)
Glob for related files in ψ/learn/**/*.md
```

### 1c. Memory Traces (ψ/memory/)
```
Grep for [topic] in ψ/memory/traces/
Grep for [topic] in ψ/memory/learnings/
```

### 1d. Git History
```bash
git log --all --oneline --grep="[topic]" | head -10
```

### 1e. claude-mem (cross-session memory)
```
claude-mem search("[topic]")
```

**If `--quick` flag**: Only run 1a (oracle protection), skip 1b-1e → jump to Step 3. In Step 3, only show "Oracle Warnings" section + skip to Step 4.

---

## Step 2: Analyze Results

Categorize findings into 4 buckets:

### 🛡️ Gotchas (from 1a)
Past mistakes and warnings related to this topic.
**Priority**: HIGH — show these first, they prevent repeat errors.

### 📚 Existing Knowledge (from 1c, 1d, 1f)
Things we already learned, studied, or documented about this topic.
- Learn docs = deep codebase understanding
- Traces = previous explorations
- Learnings = patterns from past work
- claude-mem = cross-session context

### 🔗 Related Work (from 1e, 1b)
Commits, branches, pending decisions related to this topic.

### ❓ Gaps
What we DON'T have information about. Identify by checking:
- Topic mentions codebase we haven't /learn'd?
- Topic involves technology not in Oracle?
- Topic has no git history (completely new area)?

---

## Step 3: Present Summary (Thai)

### Format:

```
## /prepare: [topic]

### 🛡️ Oracle Warnings
[gotchas found, or "ไม่มี — topic นี้ยังไม่มี gotcha"]

### 📚 สิ่งที่รู้แล้ว
[existing knowledge summary — learn docs, learnings, traces]

### 🔗 งานที่เกี่ยวข้อง
[related commits, decisions, or "ไม่มี"]

### ❓ ช่องว่างที่ยังไม่รู้
[identified gaps, or "ไม่มี — พร้อม plan"]
```

---

## Step 4: Recommend Next Step

Based on gaps analysis:

| Situation | Recommendation |
|-----------|---------------|
| No gaps, gotchas noted | → **Enter plan mode** (พร้อมแล้ว) |
| Unfamiliar codebase found | → `/learn [repo]` ก่อน แล้วค่อย plan |
| New technology/approach | → `/research [topic]` ก่อน แล้วค่อย plan |
| No prior knowledge at all | → `/trace [topic] --deep` ก่อน (5-agent deep search) |
| Multiple gaps | → Recommend in priority order |

### Present as menu:

```
What's next?

  [A] plan: Enter plan mode (พร้อมแล้ว, gotchas noted)
  [B] learn: /learn [specific-repo] ก่อน (codebase ไม่คุ้น)
  [C] research: /research [specific-topic] ก่อน (เทคโนโลยีใหม่)
  [D] Other
```

**Max 4 options.** Always include "Other" as last.

---

## Step 5: Execute on Choice

- **plan** → Enter plan mode with gotchas loaded in context
- **learn** → Run /learn, then come back to /prepare again
- **research** → Run /research, then come back to /prepare again
- **trace** → Run /trace --deep, then come back to /prepare again

---

## Integration with Plan Mode Protocol

When /prepare recommends "Enter plan mode":
- Gotchas from Step 1a are already in context → they inform the plan
- Auto-Oracle step in CLAUDE.md can be lighter (already done here)
- Plan file backup (step 1b in protocol) still applies

---

## Philosophy

> "รู้ก่อน วางแผน. วางแผนก่อน ลงมือ."
> Know before you plan. Plan before you act.

/prepare is the **compass check** before entering the forest.
It doesn't do the work — it ensures you know which direction to walk.

**Workflow**: `/prepare` → plan mode → review → implement → `/rrr`

---

## Hard Rules

1. **Thai output** — present summary and menu in Thai
2. **Parallel searches** — all Step 1 searches run simultaneously
3. **Gotchas first** — always show warnings before anything else
4. **Honest gaps** — if we don't know something, say so clearly
5. **Don't auto-enter plan mode** — present menu, let M decide
6. **Max 4 menu items** — focused, not overwhelming

---

ARGUMENTS: $ARGUMENTS
