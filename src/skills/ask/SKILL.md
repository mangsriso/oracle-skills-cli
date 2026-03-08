---
name: ask
description: "Two-layer knowledge retrieval: Oracle + NLM. Use when user says 'ask', 'ask about', 'what do we know about', 'query knowledge'. Do NOT use for web research — use /research. Do NOT use for notebook management — use /notebooklm. Do NOT use for deep Gemini research — use /deep-research."
trigger: /ask
negative_trigger:
  - /research
  - /notebooklm
  - /deep-research
  - /trace
  - /learn
---

# /ask — Two-Layer Knowledge Retrieval

**Goal**: Query Oracle (instant, local) + NLM (deep, citation-backed) in one unified flow.

## Usage

```
/ask "SD-Access VN routing"              # Oracle only
/ask "how to build claude skills" --deep  # Oracle + NLM
/ask "LISP routing" --deep --save         # Oracle + NLM + save atom
/ask --notebooks                          # List registered notebooks
/ask --sync                               # Sync notebook registry
/ask "topic" --deep --nb <slug>           # Force specific notebook
```

---

## Step 0: Timestamp

```bash
date "+%Y-%m-%d %H:%M %Z"
```

---

## Step 1: Parse Arguments

Parse `$ARGUMENTS` for:
- **Query text**: everything not a flag
- **`--deep`**: enable NLM Layer 2
- **`--save`**: save answer as Oracle atom (requires --deep)
- **`--notebooks`**: list registry → jump to Variant A
- **`--sync`**: run sync script → jump to Variant B
- **`--nb <slug>`**: override notebook selection

If `--notebooks` → skip to **Variant A**.
If `--sync` → skip to **Variant B**.

---

## Step 2: Oracle Search (Layer 1) — ALWAYS runs

```
oracle_search(query, limit=10, mode="hybrid")
```

Present results in Thai:
- Count of results found
- Top 5 with: type icon, title preview, relevance score
- Format: compact table or bullet list

---

## Step 3: Decision Gate

- If NO `--deep` flag: show Oracle results, then ask:
  > "ต้องการ NLM deep dive ไหม? (พิมพ์ --deep เพื่อค้นหาเพิ่มจาก NotebookLM)"
- If `--deep` flag present: auto-proceed to Step 4

---

## Step 4: Notebook Selection

1. Read `ψ/memory/notebooks.json` (the registry)
   - If missing or empty → tell M: "ยังไม่มี registry — ลอง `/ask --sync` ก่อน" and stop
2. If `--nb <slug>` provided → find notebook by slug, error if not found
3. Otherwise → score notebooks by keyword overlap with query words:
   - Split query into lowercase words (>= 3 chars)
   - Count matching keywords per notebook
   - Pick highest score; on tie, pick most recently updated
4. Show selected notebook to M: name + slug + source_count

---

## Step 5: NLM Deep Query (Layer 2)

Run via Bash:
```bash
nlm notebook query "<notebook-id>" "<question>" --json --timeout 300
```

**Bash timeout**: 360000 (6 min — covers NLM 5-min timeout + overhead)

**Parse response defensively**:
```
# NLM CLI wraps response in .value (JsonFormatter), but handle both paths
parsed = JSON.parse(stdout)
inner = parsed.value || parsed
answer = inner.answer || inner.text || ""
citations = inner.citations || {}
```

**Present to M in Thai**:
- Answer text (translated summary if needed)
- Citation count: "อ้างอิงจาก N แหล่ง"
- Notebook name used

**Error handling**:
- If command fails, check stderr for auth patterns: `auth`, `login`, `cookie`, `403`, `401`
- If auth error → suggest: "NLM auth อาจหมดอายุ — ลอง `nlm notebook list` เพื่อตรวจสอบ"
- For other errors → show raw stderr to M

---

## Step 6: Save Atom (only if --save)

1. Generate filename:
   ```
   ψ/memory/learnings/YYYY-MM-DD_HHMM_ask-{notebook-slug}_{query-slug}.md
   ```
   - `query-slug`: first 40 chars of slugified query

2. Write file with frontmatter:
   ```markdown
   ---
   title: "NLM: {query}"
   type: reference
   tags: [ask-query, {notebook-slug}]
   source: nlm-ask
   date: YYYY-MM-DD
   ---

   # {query}

   ## Answer (from NLM: {notebook-name})

   {answer text}

   ## Citations
   {citation details if available}

   ## Oracle Context
   {brief summary of Oracle results from Step 2}
   ```

3. Index into Oracle:
   ```bash
   cd /home/aitma/sda-script && bun run /home/aitma/.local/share/oracle-v2/src/indexer.ts --files ψ/memory/learnings/{filename}
   ```

4. Confirm to M: "บันทึกแล้ว + index เข้า Oracle แล้ว"

---

## Variant A: --notebooks (List Registry)

1. Read `ψ/memory/notebooks.json`
2. If missing → suggest `--sync`
3. Display as table:

```
| Slug | Name | Sources | Source | Updated |
|------|------|---------|--------|---------|
| ... | ... | ... | ... | ... |
```

---

## Variant B: --sync (Sync Registry)

Run:
```bash
bun /home/aitma/.claude/skills/ask/scripts/sync-registry.ts
```

Then read and display the resulting `ψ/memory/notebooks.json` as table (same as Variant A).

---

## Hard Rules

1. **Thai output** for all presentations to M
2. **Oracle ALWAYS first** — even with --deep, run oracle_search before NLM
3. **Never auto-save** without explicit --save flag
4. **Show notebook selection** — M can override with --nb
5. **If registry empty/missing** → suggest --sync before NLM query
6. **Auth error handling** — if NLM query fails with auth pattern in stderr, suggest `nlm notebook list` to check auth. Do NOT retry automatically (NLM CLI lacks auto-retry)
7. **One NLM query per /ask** — don't loop or retry with different notebooks

---

## Scope Boundaries

- `/ask` = Oracle + NLM query + save atom (knowledge Q&A)
- `/research` = web search + multi-source synthesis
- `/notebooklm` = browser notebook management (add/remove/auth)
- `/deep-research` = Gemini Deep Research
- `/trace` = discovery/archaeology across repos

---

**Version**: 1.0
**Updated**: 2026-03-06

ARGUMENTS: $ARGUMENTS
