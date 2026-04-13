#!/usr/bin/env python3
"""List all skills with profile tier, type, and script status.
Usage: python3 skills-list.py [--json]
"""
import os, re, sys, json

# Find repo root (works from installed skill dir or source)
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
# Try source path first, then installed path
for candidate in [
    os.path.join(SCRIPT_DIR, '..', '..', '..'),  # src/skills/team-agents/scripts → src
    os.path.join(SCRIPT_DIR, '..', '..'),
]:
    profiles_path = os.path.join(candidate, 'profiles.ts')
    skills_dir = os.path.join(candidate, 'skills')
    if os.path.exists(profiles_path) and os.path.isdir(skills_dir):
        break
else:
    # Fallback: scan installed skills
    skills_dir = os.path.expanduser('~/.claude/skills')
    profiles_path = None

# Read profile constants from profiles.ts
std_skills = []
lab_skills = []
if profiles_path and os.path.exists(profiles_path):
    with open(profiles_path) as f:
        content = f.read()
    std_match = re.search(r'STANDARD_SKILLS = \[(.*?)\]', content, re.DOTALL)
    if std_match:
        std_skills = re.findall(r"'([^']+)'", std_match.group(1))
    lab_match = re.search(r'LAB_SKILLS = \[(.*?)\]', content, re.DOTALL)
    if lab_match:
        lab_skills = re.findall(r"'([^']+)'", lab_match.group(1))

std_set = set(std_skills)
lab_set = set(lab_skills)

# Discover all skills
all_skills = []
if os.path.isdir(skills_dir):
    for name in sorted(os.listdir(skills_dir)):
        skill_dir = os.path.join(skills_dir, name)
        if not os.path.isdir(skill_dir) or name.startswith('.'):
            continue

        skill_md = os.path.join(skill_dir, 'SKILL.md')
        desc = ''
        skill_type = 'skill'
        hidden = False

        if os.path.exists(skill_md):
            with open(skill_md) as f:
                content = f.read()
            # Extract description
            m = re.search(r'description:\s*["\']?(.+?)["\']?\s*$', content, re.MULTILINE)
            if m:
                desc = m.group(1).strip("'\"")[:60]
            # Detect type
            if 'subagent' in content.lower() or 'Agent(' in content:
                skill_type = 'skill+agent'
            if os.path.isdir(os.path.join(skill_dir, 'scripts')):
                skill_type = 'skill+code'
            # Hidden?
            if re.search(r'hidden:\s*(true|yes)', content, re.IGNORECASE):
                hidden = True

        # Profile tier
        if name in std_set:
            profile = 'standard'
        elif name in lab_set:
            profile = 'lab'
        else:
            profile = 'full'

        all_skills.append({
            'name': name,
            'profile': profile,
            'type': skill_type,
            'description': desc,
            'hidden': hidden,
            'has_scripts': os.path.isdir(os.path.join(skill_dir, 'scripts')),
        })

# Output
if '--json' in sys.argv:
    print(json.dumps({
        'total': len(all_skills),
        'standard': len(std_skills),
        'full': len(all_skills) - len(lab_skills),
        'lab': len(all_skills),
        'skills': all_skills,
    }, indent=2))
else:
    std_count = sum(1 for s in all_skills if s['profile'] == 'standard')
    full_count = sum(1 for s in all_skills if s['profile'] in ('standard', 'full'))

    print()
    print(f'📦 Oracle Skills — {len(all_skills)} total')
    print()
    print(f'  standard  {std_count:3d}  /go standard')
    print(f'  full      {full_count:3d}  /go full')
    print(f'  lab       {len(all_skills):3d}  /go lab')
    print()
    print(f'  #  Skill                    Profile    Type         Scripts')
    print(f'  ── ──────────────────────── ────────── ──────────── ───────')

    for i, s in enumerate(all_skills, 1):
        scripts = '✓' if s['has_scripts'] else ''
        hidden = ' [hidden]' if s['hidden'] else ''
        print(f"  {i:2d} {s['name']:24s} {s['profile']:10s} {s['type']:12s} {scripts}{hidden}")

    print()
    print(f'  standard={std_count} | full={full_count} | lab={len(all_skills)}')
    print()
