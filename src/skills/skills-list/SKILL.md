---
name: skills-list
description: 'List all Oracle skills with profile tier, type, and script status. Use when user says "skills list", "show skills", "what skills", "list all skills", "how many skills", or wants to see available skills by profile.'
argument-hint: "[--json]"
---

# /skills-list — Show All Skills

> See everything at a glance. Single source of truth.

## Usage

```
/skills-list          # Pretty table
/skills-list --json   # Machine-readable JSON
```

## Run

```bash
python3 ~/.claude/skills/skills-list/scripts/skills-list.py
```

Display the output directly. The script reads STANDARD_SKILLS and LAB_SKILLS from `profiles.ts` (single source of truth) and scans all skill directories.

### Output

```
📦 Oracle Skills — 41 total

  standard   15  /go standard
  full       23  /go full
  lab        41  /go lab

  #  Skill                    Profile    Type         Scripts
  ── ──────────────────────── ────────── ────────���─── ───────
   1 about-oracle             standard   skill+agent  
   2 auto-retrospective       full       skill        
   3 awaken                   standard   skill        
   ...
  41 xray                     standard   skill        

  standard=15 | full=23 | lab=41
```

### JSON mode

```bash
python3 ~/.claude/skills/skills-list/scripts/skills-list.py --json
```

Returns structured JSON with all skill metadata — useful for piping to other tools.

---

ARGUMENTS: $ARGUMENTS
