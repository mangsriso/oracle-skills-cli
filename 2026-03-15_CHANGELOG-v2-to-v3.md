# oracle-skills-cli CHANGELOG: v2.0.10 → v3.0.4

## Breaking Changes

1. **Removed 3 skills**: `fyi`, `merged`, `retrospective` (use `/rrr` instead)
2. **Profile membership changed**: standard now 9 skills (was 12)
3. **`/forward` enforced 3-step plan**: EnterPlanMode → write → ExitPlanMode (mandatory)
4. **CLI split into commands/**: index.ts is now modular

## New Features

### Profiles + Features System
- **Profiles** (tiers): seed(8), minimal(8), standard(9), full(all)
- **Features** (modules): soul(6), network(5), workspace(3), creator(4)
- Composable: `standard + soul + network`
- Data-driven from 1,013 session analysis

### New Commands
- `oracle-skills select` — interactive multiselect picker
- `oracle-skills init` — setup + profile initialization
- `oracle-skills about` — prereqs check + system status
- `--feature <name>` flag for install/uninstall

### New Skill: `/go`
- Switch profiles: `/go minimal`, `/go standard + soul`
- Enable/disable: `/go enable trace`, `/go disable watch`
- Disable = rename .md → .md.disabled (nothing deleted)

### `oracle-soul-sync-update` added to all profiles

## Skill Improvements

- `/dig --all` auto-detects session count (no arbitrary cap)
- `/rrr --dig` worktree-aware session mining
- `/worktree new [name]` named worktree support
- `/about-oracle` runs prereqs check first
- `/recap-rich.ts` guards git calls in non-git directories

## Bug Fixes

- `/rrr --dig` path encoding fixed
- `/forward` 3-step plan approval enforcement (#70)
- Pulse skills reverted (added then reverted)

## Stats

- 24 commits since v2.0.10
- 68 files changed: +1,872 / -947
- 15 new unit tests for profiles + features
- 30 skills (down from 33: removed fyi, merged, retrospective)
