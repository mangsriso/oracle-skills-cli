---
name: research
description: Multi-source deep dive research. Use when user says "research", "deep dive", "study topic", or wants to explore a topic across web, repos, and oracle. Do NOT use for codebase exploration or YouTube — use /learn or /watch. Do NOT use for querying Oracle+NLM knowledge base — use /ask.
trigger: /research
negative_trigger:
  - /ask
---

# /research — Multi-Source Deep Dive

**Goal**: Structured topic exploration across web + repos + oracle → synthesized output.

## Usage

```
/research multi-agent orchestration patterns
/research "how does cursor implement tab completion"
/research intent-aware memory retrieval
```

---

## CRITICAL: Check Oracle First

**Before any web search, check what we already know:**

```
oracle_search("[topic]")
claude-mem search("[topic]")
```

If oracle/memory already has rich content → summarize existing knowledge, ask M if deeper dive needed.
This prevents re-researching what we already learned.

---

## Step 0: Timestamp + Oracle Check

```bash
date "+🕐 %H:%M %Z (%A %d %B %Y)"
```

1. Search oracle for existing learnings on this topic
2. Search claude-mem for past session work
3. Present: "สิ่งที่รู้แล้ว" vs "สิ่งที่ยังไม่รู้"

---

## Step 1: Web Search (2-3 queries)

Search for the topic with varied angles:
- Technical overview: `"[topic] architecture 2026"`
- Implementation examples: `"[topic] github implementation"`
- Comparisons/tradeoffs: `"[topic] vs alternatives"`

**Output**: สรุป 3-5 relevant sources in Thai — title, key insight, URL

---

## Step 2: Ask M — Go Deeper?

Present findings and ask:

```markdown
## 🔍 Research: [topic]

### สิ่งที่รู้แล้ว (จาก Oracle/Memory)
- [existing learning 1]
- [existing learning 2]

### สิ่งที่เจอใหม่ (จาก Web Search)
| Source | Key Insight |
|--------|------------|
| [repo/article 1] | [insight] |
| [repo/article 2] | [insight] |

### ขั้นตอนถัดไป
1. `/learn [repo]` — clone + study repo ไหม?
2. `/watch [url]` — ดู YouTube ที่เกี่ยวข้องไหม?
3. สรุปแค่นี้พอ?
```

**DO NOT auto-clone repos or watch videos.** Always ask M first.

---

## Step 3: Synthesize (after M decides scope)

After optional `/learn` or `/watch`, create synthesis document:

**Location**: `ψ/learn/[topic-slug]/[date]_RESEARCH.md`

```markdown
# Research: [Topic]

**Date**: YYYY-MM-DD
**Duration**: ~X minutes
**Sources**: N web + N repos + N oracle learnings

## Key Findings
1. [Finding with source attribution]
2. [Finding with source attribution]
3. [Finding with source attribution]

## Applicable Patterns
- [Pattern that could apply to our work]
- [Pattern that could apply to our work]

## Comparison Matrix (if applicable)
| Aspect | Option A | Option B |
|--------|----------|----------|
| ... | ... | ... |

## Oracle Integration
- Existing learnings confirmed: [list]
- New insights to save: [list]

## Tags
`tag1`, `tag2`, `tag3`
```

---

## Step 4: Save to Oracle (REQUIRED)

Save the single most valuable new insight:

```
oracle_learn(pattern: "[key finding from research]", concepts: ["research", "topic-tags"], source: "/research [topic] [date]")
```

**What to save**: Not a summary — the one actionable insight or applicable pattern.

---

## Hard Rules

1. **Oracle + Memory FIRST** — don't re-research known topics
2. **Ask before cloning** — never auto-clone repos or watch videos
3. **Lightweight by default** — web search + synthesis is often enough
4. **สรุปภาษาไทย** — present findings in Thai for M
5. **One oracle_learn** — save the key takeaway, not everything

---

## When NOT to use /research

- For querying Oracle+NLM knowledge base → use `/ask`
- If you already know the repo → use `/learn` directly
- If M shares a YouTube URL → use `/watch` directly
- If the question is simple → just answer it, don't over-research

---

**Philosophy**: Know what you know. Find what you don't. Don't repeat the search.

**Version**: 1.0
**Updated**: 2026-02-12

ARGUMENTS: $ARGUMENTS
