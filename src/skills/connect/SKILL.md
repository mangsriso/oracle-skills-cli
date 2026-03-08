---
name: connect
description: Find hidden connections between two Oracle knowledge domains. Use when user says "connect", "bridge", "link between", "how does X relate to Y". Do NOT use for SSH connections, network connectivity, or fabric provisioning.
---

# /connect — Cross-Domain Pattern Bridge

**Purpose**: Find hidden connections between two Oracle knowledge domains.

## Usage

```
/connect [topic A] | [topic B]         # Bridge two specific topics (pipe separator)
/connect SD-Access | VLAN management   # Example with multi-word topics
/connect hooks | skills                # Two single-word topics
```

**Parsing rules**:
- Topics separated by ` | ` (pipe with spaces)
- If no pipe found and input has 3+ words: ask user to clarify with pipe separator
- If exactly 2 words and no pipe: treat each word as a topic

---

## Step 0: Timestamp

```bash
date "+🕐 %H:%M %Z (%A %d %B %Y)"
```

---

## Step 1: Parse Topics & Map Domains

Parse ARGUMENTS to extract topic A and topic B using the pipe separator rules above.

Run in parallel:

1. **Domain A knowledge**: `oracle_search("[topic A]", limit=10)` — all knowledge about A

2. **Domain B knowledge**: `oracle_search("[topic B]", limit=10)` — all knowledge about B

3. **Shared concepts**: `oracle_concepts()` — find concept tags shared between A and B results

4. **Previous connect outputs**: `Glob("ψ/memory/logs/thinking/*connect*")` sorted by filename descending — read last 3. If none exist (first run), skip silently.

---

## Step 2: Cross-Domain Analysis — 4 Connection Types

Analyze for these connection types:

### 1. Pattern Transfer
Technique from domain A that solves a problem in domain B.

### 2. Shared Structure
Isomorphic patterns — A works like B because of underlying similarity.

### 3. Contradictory Approaches
A handles X one way, B handles it the opposite — tension worth examining.

### 4. Missing Bridge
A has something B needs but has never used.

---

## Step 3: Write Output

Slugify topics: lowercase, replace spaces with hyphens, strip special chars, max 30 chars per slug. If slug is empty after stripping, use "unnamed".

Output to `ψ/memory/logs/thinking/YYYY-MM-DD-HHMM-connect-SLUG_A--SLUG_B.md` (double-hyphen between slugs):

```markdown
---
type: connect
date: YYYY-MM-DD
domain_a: [topic A]
domain_b: [topic B]
---

# Connect: [A] ↔ [B] — YYYY-MM-DD

## Connections Found

### [Descriptive title]
- **From**: [domain A learning/pattern]
- **To**: [domain B application]
- **Insight**: [what the connection reveals]
- **Action**: [concrete next step to apply]

### [Next connection]
...

## Meta-Patterns
[themes appearing across connections — patterns of patterns]

## สรุป (Thai Summary)
[key bridges found for M]
```

---

## Rules

- **Actionable**: Connections MUST be actionable — not "X reminds me of Y"
- **Structure**: Each connection needs: From → To → Insight → Action
- **Insight bounds**: Min 3 connections per run. If oracle returns insufficient data for either or both domains: output fewer connections (or 0) with honest explanation of what data was available (min 3 does not apply to sparse domains)
- **Prioritize**: Surprising over obvious
- **Self-referential**: If a connection was already made in a previous output, expand it don't repeat
- **Confidence tags**: Use `[verified]`/`[assumed]` on connections
- **Write-gate**: NEVER write outside `ψ/memory/logs/thinking/`

---

## Output

After writing the file, display:
1. A brief Thai summary of the most interesting connections
2. The output file path

ARGUMENTS: $ARGUMENTS
