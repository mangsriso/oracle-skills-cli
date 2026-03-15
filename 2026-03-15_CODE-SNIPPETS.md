# oracle-skills-cli — Code Snippets

## Profile + Features System (v3)

```typescript
// src/profiles.ts
export const profiles: Record<string, { include?: string[]; exclude?: string[] }> = {
  seed: { include: ['trace', 'dig', 'recap', 'learn', 'rrr', 'who-are-you', 'forward', 'standup'] },
  minimal: { include: ['trace', 'dig', 'recap', 'learn', 'rrr', 'who-are-you', 'forward', 'standup'] },
  standard: { include: ['trace', 'dig', 'recap', 'learn', 'rrr', 'who-are-you',
    'worktree', 'oracle', 'standup', 'forward', 'prepare', 'research'] },
  full: {},
};

export const features: Record<string, string[]> = {
  soul: ['awaken', 'philosophy', 'who-are-you', 'about-oracle', 'birth', 'feel'],
  network: ['talk-to', 'oracle-family-scan', 'oracle-soul-sync-update', 'oracle', 'oraclenet'],
  workspace: ['worktree', 'physical', 'schedule'],
  creator: ['speak', 'deep-research', 'watch', 'gemini'],
};

export function resolveProfile(name: string, allSkills: string[]): string[] | null {
  const profile = profiles[name];
  if (!profile) return null;
  if (profile.include?.length) return profile.include;
  if (profile.exclude?.length) return allSkills.filter(s => !profile.exclude!.includes(s));
  return null; // full = no filter
}
```

## Agent Configuration Pattern

```typescript
// src/cli/agents.ts
export const agents: Record<AgentType, AgentConfig> = {
  'claude-code': {
    name: 'claude-code',
    displayName: 'Claude Code',
    skillsDir: '.claude/skills',
    globalSkillsDir: join(home, '.claude/skills'),
    commandsDir: '.claude/commands',
    globalCommandsDir: join(home, '.claude/commands'),
    useFlatFiles: true,
    commandsOptIn: true,  // Only with --commands flag
    detectInstalled: () => existsSync(join(home, '.claude')),
  },
  gemini: {
    // ...
    commandFormat: 'toml',  // TOML instead of Markdown
  },
};

export function detectInstalledAgents(): string[] {
  return Object.entries(agents)
    .filter(([_, config]) => config.detectInstalled())
    .map(([name]) => name);
}
```

## VFS Abstraction

```typescript
// src/cli/skill-source.ts
declare const IS_COMPILED: boolean;  // Build-time define

let _vfs: Map<string, Map<string, string>> | null = null;

export function isCompiled(): boolean {
  try { return typeof IS_COMPILED !== 'undefined' && IS_COMPILED; }
  catch { return false; }
}

export async function discoverSkills(): Promise<Skill[]> {
  if (isCompiled()) {
    const { vfs, skillNames } = await getVFS();
    return skillNames.map(name => ({
      name,
      description: vfs.get(name)?.get('SKILL.md')?.match(/description:\s*(.+)/)?.[1] || '',
      path: `vfs://${name}`,
    }));
  }
  // Filesystem mode: walk src/skills/ directory
}
```

## Orphan Cleanup Pattern

```typescript
// src/cli/installer.ts — orphans moved to /tmp, never deleted
for (const installed of installedDirs) {
  if (await isOurSkill(installedPath) && !sourceSkillNames.includes(installed)) {
    await mv(installedPath, join(trashDir, basename(installedPath)), shellMode);
    p.log.info(`Cleaned up orphan: ${installed} → ${trashDir}`);
  }
}
```

## Version Injection

```typescript
// Inject version + scope into SKILL.md during install
content = content.replace(/^---\n/,
  `---\ninstaller: oracle-skills-cli v${pkg.version}\norigin: Nat Weerawan's brain...\n`);
const scopeChar = scope === 'Global' ? 'G' : 'L';
content = content.replace(/^(description:\s*)(.+?)(\n)/m,
  `$1v${pkg.version} ${scopeChar}-SKLL | $2$3`);
```

## Shell Mode Abstraction

```typescript
// src/cli/fs-utils.ts
export type ShellMode = 'auto' | 'shell' | 'no-shell';
const isWindows = process.platform === 'win32';

function useShell(mode: ShellMode): boolean {
  if (mode === 'shell') return true;
  if (mode === 'no-shell') return false;
  return !isWindows;
}

export async function cpr(src: string, dest: string, mode: ShellMode = 'auto') {
  useShell(mode) ? await $`cp -r ${src} ${dest}`.quiet() : cpSync(src, dest, { recursive: true });
}
```

## SKILL.md Frontmatter Format

```yaml
---
name: ask
description: "Two-layer knowledge retrieval: Oracle + NLM"
trigger: /ask
negative_trigger:
  - /research
  - /notebooklm
---
```

## Command Stub Generation

```typescript
// scripts/compile.ts
const commandContent = `---
description: v${pkg.version} | ${rawDescription}
---
# /${skillName}
Execute the \`${skillName}\` skill with the provided arguments.
## Instructions
**If you have a Skill tool available**: Use it directly with \`skill: "${skillName}"\`
**Otherwise**: Read the skill file at: \`~/.claude/skills/${skillName}/SKILL.md\`
`;
```

## Test Pattern

```typescript
// __tests__/index.test.ts
import { describe, it, expect } from 'bun:test';
describe('agents', () => {
  it('should have 18 agents defined', () => {
    expect(Object.keys(agents).length).toBe(18);
  });
});
```
