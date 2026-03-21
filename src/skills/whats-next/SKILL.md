---
name: whats-next
description: Suggest next action based on open issues, git status, handoffs, and PRs. Use when user says "whats next", "what should I do", "next", "suggest", "priorities", or at a decision point. Do NOT trigger for session orientation (use /recap), mid-session status (use /where-we-are), or retrospectives (use /rrr).
argument-hint: "[--issues | --pulse]"
---

# /whats-next — Smart Action Suggestions

Scan context → rank priorities → suggest top 3 actions.

## Usage

```
/whats-next              # Scan everything, suggest top 3
/whats-next --issues     # Focus on open issues only
/whats-next --pulse      # Include Pulse board context
```

## Steps

### 1. Gather Context (parallel)

```bash
# Open issues
gh issue list --state open --limit 10 --json number,title,updatedAt,labels --jq '.[] | "#\(.number) \(.title) [\(.labels | map(.name) | join(","))]"' 2>/dev/null

# Git status
git status --short
git log --oneline -3

# Open PRs
gh pr list --state open --json number,title,headRefName --jq '.[] | "#\(.number) \(.title) (\(.headRefName))"' 2>/dev/null

# Latest handoff
PSI=$(readlink -f ψ 2>/dev/null || echo "ψ")
ls -t "$PSI/inbox/handoff/"*.md 2>/dev/null | head -1 | xargs head -30 2>/dev/null

# Stale branches
git branch --list | grep -v '^\*' | grep -v main
```

### 2. If --pulse flag

```bash
bun ~/Code/github.com/Pulse-Oracle/pulse-cli/packages/cli/src/pulse.ts board 2>/dev/null
```

### 3. Analyze & Rank

Score each potential action:

| Signal | Weight | Example |
|--------|--------|---------|
| Uncommitted changes | High | "Commit and push current work" |
| Open PR needs merge | High | "Merge PR #N" |
| Handoff pending items | Medium | "Continue from handoff: [item]" |
| P0/P1 issues | Medium | "Fix #N (P0)" |
| Stale branches | Low | "Clean up branch X" |
| Old issues | Low | "Close or update #N" |

### 4. Output

```markdown
## What's Next?

### 1. [Top priority action]
   Why: [reasoning from signals]
   How: `[command or /skill]`

### 2. [Second action]
   Why: [reasoning]
   How: `[command or /skill]`

### 3. [Third action]
   Why: [reasoning]
   How: `[command or /skill]`

---
💡 Pick one, or tell me what you'd rather do.
```

## Rules

- Max 3 suggestions — not a dump of everything
- Each suggestion has a concrete command or skill to run
- If nothing pending → say "All clear! Start something new or /standup"
- Never repeat what /recap already shows — this is about ACTION not STATUS

ARGUMENTS: $ARGUMENTS
