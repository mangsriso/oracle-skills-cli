# Migration Guide: v2.0.10 → v3.0.4

## Current Situation

- **Local HEAD** (f78aa5f): 2 commits ahead (8 community skills)
- **origin/main** (84d0198): v3.0.4 + /forward fix = 24 commits ahead
- **Status**: DIVERGED — can't fast-forward

## Local Customizations Impact

| Item | In v3? | Action |
|------|--------|--------|
| ask, challenge, connect, drift, emerge, prepare, research, skill-creator | ask exists; others custom | Merge will keep |
| SKILL.md overrides (forward, standup, learn, rrr, where-we-are, who-are-you) | All exist in v3 | Safe — merge takes yours |
| recap (SKILL.md + recap.ts + recap-rich.ts) | Exists in v3 | Safe |
| auto-learn | Not in v3 | Backup + restore manually |
| notebooklm, push-ports | Project-specific | Keep local, unaffected |
| fyi, merged, retrospective | REMOVED in v3 | Will disappear |

## Recommended: Merge Strategy

### Step 1: Backup

```bash
cp -r ~/.claude/skills ~/.claude/skills.backup.2026-03-15
cd ~/ghq/github.com/Soul-Brews-Studio/oracle-skills-cli
git branch feat/community-skills-backup
```

### Step 2: Merge origin/main

```bash
git fetch origin
git merge origin/main
# Conflicts expected in: profiles.ts, README.md, maybe forward/SKILL.md
# Resolution: accept origin's profiles.ts + forward, keep your skills
git add -A && git commit -m "merge: integrate v3 + keep community skills"
```

### Step 3: Rebuild

```bash
bun install
bun run scripts/compile.ts
```

### Step 4: Reinstall

```bash
cd ~/sda-script  # or any project dir
bun run ~/ghq/github.com/Soul-Brews-Studio/oracle-skills-cli/src/cli/index.ts install -g -y
```

### Step 5: Restore custom skills

```bash
cp -r ~/.claude/skills.backup.2026-03-15/auto-learn ~/.claude/skills/
```

### Step 6: Verify

```bash
oracle-skills list -g
oracle-skills --version
# Test: /recap, /forward, /ask
```

## Rollback

```bash
git checkout feat/community-skills-backup
cp -r ~/.claude/skills.backup.2026-03-15/* ~/.claude/skills/
```

## What You Gain

- Profile + Features system (composable installs)
- `/go` skill for instant profile switching
- `/forward` 3-step enforcement (safer)
- `/dig --all` no cap
- `/worktree new [name]` named worktrees
- Interactive `select` command
- `about` prereqs check
