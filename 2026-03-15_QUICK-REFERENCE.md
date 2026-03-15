# oracle-skills-cli — Quick Reference

Cross-agent skill installer deploying Oracle workflows to 18 AI coding agents. Install once, all agents gain session awareness, retrospectives, codebase exploration, and knowledge management.

## Installation

```bash
curl -fsSL https://raw.githubusercontent.com/Soul-Brews-Studio/oracle-skills-cli/main/install.sh | bash
```

## CLI Commands

| Command | Description |
|---------|-------------|
| `oracle-skills install -g -y` | Install all skills globally |
| `oracle-skills install -p standard -g -y` | Install standard profile |
| `oracle-skills install -p minimal --feature soul -g -y` | Profile + feature |
| `oracle-skills install -s trace learn recap -g -y` | Specific skills |
| `oracle-skills install -l` | List available skills |
| `oracle-skills uninstall -g -y` | Uninstall all |
| `oracle-skills list -g` | Show installed skills |
| `oracle-skills agents` | List 18 supported agents |
| `oracle-skills profiles [name]` | Show profiles |
| `oracle-skills select` | Interactive skill picker |
| `oracle-skills about` | Prerequisites check |
| `oracle-skills init` | Setup + profile init |

## Profiles (Base Tiers)

| Profile | Skills | Use Case |
|---------|--------|----------|
| seed | 8 (trace, dig, recap, learn, rrr, who-are-you, forward, standup) | Daily ritual |
| minimal | 8 (same as seed) | Alias |
| standard | 9 (seed + worktree, oracle, prepare, research) | Daily driver (96% coverage) |
| full | 30+ (everything) | All skills |

## Features (Add-on Modules)

| Feature | Skills | Domain |
|---------|--------|--------|
| soul | awaken, philosophy, who-are-you, about-oracle, birth, feel | Birth/awaken oracles |
| network | talk-to, oracle-family-scan, oracle-soul-sync-update, oracle, oraclenet | Multi-oracle comms |
| workspace | worktree, physical, schedule | Parallel work + ops |
| creator | speak, deep-research, watch, gemini | Content + research |

## 18 Supported Agents

Claude Code, OpenCode, Codex, Cursor, Amp, Kilo Code, Roo Code, Goose, Gemini CLI, Antigravity, GitHub Copilot, OpenClaw, Droid, Windsurf, Cline, Aider, Continue, Zed

## Key Flags

| Flag | Description |
|------|-------------|
| `-g, --global` | User directory (not project) |
| `-y, --yes` | Skip prompts |
| `-a, --agent <names>` | Target agents |
| `-s, --skill <names>` | Specific skills |
| `-p, --profile <name>` | Profile tier |
| `--feature <names>` | Feature modules |
| `--commands` | Install command stubs |
| `-l, --list` | List only |

## /go Skill (Profile Switching)

```
/go                       # Show current state
/go minimal               # Switch profile
/go standard + soul       # Profile + feature
/go enable trace dig      # Enable skills
/go disable watch         # Disable (reversible)
```
