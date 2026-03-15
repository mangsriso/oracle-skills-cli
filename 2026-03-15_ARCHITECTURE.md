# oracle-skills-cli — Architecture & Structure

## Directory Organization

```
oracle-skills-cli/
├── src/
│   ├── cli/
│   │   ├── index.ts            # Commander.js CLI entry point
│   │   ├── commands/           # NEW v3: per-command files
│   │   │   ├── install.ts
│   │   │   ├── uninstall.ts
│   │   │   ├── init.ts
│   │   │   ├── select.ts       # Interactive multiselect
│   │   │   ├── profiles.ts
│   │   │   ├── agents.ts
│   │   │   ├── about.ts
│   │   │   └── list.ts
│   │   ├── types.ts            # AgentConfig, Skill, InstallOptions
│   │   ├── agents.ts           # 18 agent platform definitions
│   │   ├── installer.ts        # Install/uninstall/cleanup
│   │   ├── skill-source.ts     # VFS abstraction + filesystem
│   │   ├── fs-utils.ts         # Shell vs Node.js fs layer
│   │   └── generated/          # Auto-generated VFS module
│   ├── skills/                 # 30+ skills (~800K)
│   ├── profiles.ts             # seed/minimal/standard/full + features
│   ├── hooks/opencode/         # OpenCode timestamp plugin
│   └── commands/               # Generated command stubs
├── scripts/
│   ├── compile.ts              # Skills → command stubs
│   ├── generate-vfs.ts         # Skills → VFS for binary
│   ├── build-native.ts         # Bun → native binary
│   └── update-readme-table.ts  # README agent table gen
├── __tests__/                  # 9 test files
├── install.sh                  # One-command installer
└── package.json                # Bun runtime, Commander, MQTT
```

## Core Abstractions

### 1. Agent Configuration (18 agents)
- Static `AgentConfig` per agent: skills path, commands path, detection function
- Agents: Claude Code, OpenCode, Codex, Cursor, Amp, Kilo, Roo, Goose, Gemini, Antigravity, Copilot, OpenClaw, Droid, Windsurf, Cline, Aider, Continue, Zed
- `commandsOptIn: true` for Claude Code (needs `--commands` flag)
- `commandFormat: 'toml'` for Gemini CLI

### 2. Skill Source (VFS vs Filesystem)
- **Compiled mode**: Skills embedded in `skills-vfs.ts` Map at build time
- **Dev mode**: Direct filesystem reads from `src/skills/`
- Unified API: `discoverSkills()`, `readSkillFile()`, `writeSkillToDir()`

### 3. Installation Pipeline
1. Skill Resolution (profile + features + --skill union)
2. Agent Detection (auto-detect, prompt, or --agent override)
3. Scope Resolution (project-local vs global)
4. Orphan Cleanup (move stale skills to /tmp, don't delete)
5. Skill Installation (copy + inject version metadata)
6. Plugin Installation (hooks → ~/.claude/plugins/)
7. Manifest Writing (.oracle-skills.json, VERSION.md)
8. Command Stub Generation (md or toml format)

### 4. Profile + Features System (NEW v3)
- **Profiles** = tiers: seed(8), minimal(8), standard(9), full(all)
- **Features** = modules: soul(6), network(5), workspace(3), creator(4)
- Composition: `standard + soul + network` = union of skills
- Data-driven from 1,013 sessions analysis

### 5. Shell Abstraction
- `ShellMode: 'auto' | 'shell' | 'no-shell'`
- Auto = Bun.$ on Unix, Node.js fs on Windows
- Functions: mkdirp, rmrf, cpr, mv, rmf, cp

## Module Dependency Flow

```
index.ts (CLI dispatch)
  ├→ commands/*.ts (per-command logic)
  │     ├→ installer.ts (orchestration)
  │     │     ├→ agents.ts (config + detection)
  │     │     ├→ skill-source.ts (VFS/filesystem)
  │     │     ├→ fs-utils.ts (file ops)
  │     │     └→ profiles.ts (profile + features)
  │     └→ profiles.ts (listing)
  └→ agents.ts (agents command)
```

## Build Pipeline

1. `compile.ts` → Skills → command stubs (src/commands/*.md)
2. `generate-vfs.ts` → Skills → skills-vfs.ts (embedded Map)
3. `build-native.ts` → Bun build → oracle-skills binary (~59MB)
