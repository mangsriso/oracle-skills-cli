#!/usr/bin/env bun
// fleet-scan.ts - My Oracle fleet: open issues + last sessions
// Usage: bun fleet-scan.ts

import { $ } from "bun";
import { existsSync, statSync } from "fs";
import { join } from "path";

const ghqRoot = (await $`ghq root`.text()).trim();

// --- Part 1: Open Issues ---
const orgs = ["Soul-Brews-Studio", "laris-co", "nazt"];

type Issue = { repo: string; number: number; title: string; updated: string; labels: string };
const allIssues: Issue[] = [];

await Promise.all(
  orgs.map(async (org) => {
    try {
      const repos = (await $`gh repo list ${org} --json name --limit 30 --jq '.[].name'`.text())
        .trim().split("\n").filter(Boolean);
      await Promise.all(
        repos.map(async (repo) => {
          try {
            const json = await $`gh issue list --repo ${org}/${repo} --state open --limit 10 --json number,title,updatedAt,labels`.quiet().json() as Array<{ number: number; title: string; updatedAt: string; labels: Array<{ name: string }> }>;
            for (const i of json) {
              allIssues.push({
                repo: `${org}/${repo}`,
                number: i.number,
                title: i.title.slice(0, 60),
                updated: i.updatedAt.split("T")[0],
                labels: i.labels.map(l => l.name).join(","),
              });
            }
          } catch {}
        })
      );
    } catch {}
  })
);

allIssues.sort((a, b) => b.updated.localeCompare(a.updated));

// --- Part 2: Recent Sessions (local) ---
type SessionInfo = { slug: string; lastSession: string; daysAgo: number };
const sessions: SessionInfo[] = [];

// Only scan github.com repos, skip ψ/ nested and worktrees
const repos = (await $`ghq list`.text()).trim().split("\n")
  .filter(r => r.startsWith("github.com/") && !r.includes("/ψ/") && !r.includes(".wt"));

const now = Date.now();

for (const repo of repos) {
  const path = join(ghqRoot, repo);
  if (!existsSync(join(path, "ψ")) && !existsSync(join(path, "CLAUDE.md"))) continue;

  // Check for .claude/projects/ session files
  const projectsDir = join(path, ".claude", "projects");
  if (!existsSync(projectsDir)) continue;

  try {
    const newest = (await $`ls -t ${projectsDir}/*/transcript.jsonl 2>/dev/null`.text()).trim().split("\n")[0];
    if (!newest) continue;
    const mtime = statSync(newest).mtimeMs;
    const daysAgo = Math.floor((now - mtime) / 86400000);
    if (daysAgo > 30) continue; // Only show repos active in last 30 days
    const date = new Date(mtime).toISOString().slice(0, 10);
    sessions.push({ slug: repo.replace("github.com/", ""), lastSession: date, daysAgo });
  } catch {}
}

sessions.sort((a, b) => a.daysAgo - b.daysAgo);

// --- Output ---
console.log("# My Oracle Fleet\n");

// Recent sessions
if (sessions.length) {
  console.log(`## Recent Sessions (${sessions.length} repos, last 30 days)\n`);
  console.log("| Repo | Last Session | Days Ago |");
  console.log("|------|-------------|----------|");
  for (const s of sessions) {
    const age = s.daysAgo === 0 ? "today" : s.daysAgo === 1 ? "yesterday" : `${s.daysAgo}d`;
    console.log(`| ${s.slug} | ${s.lastSession} | ${age} |`);
  }
}

// Open issues
if (allIssues.length) {
  console.log(`\n## Open Issues (${allIssues.length})\n`);
  const byRepo = new Map<string, Issue[]>();
  for (const issue of allIssues) {
    const list = byRepo.get(issue.repo) || [];
    list.push(issue);
    byRepo.set(issue.repo, list);
  }
  for (const [repo, issues] of byRepo) {
    console.log(`### ${repo} (${issues.length})`);
    for (const i of issues) {
      const labels = i.labels ? ` [${i.labels}]` : "";
      console.log(`- #${i.number} ${i.title}${labels} *(${i.updated})*`);
    }
  }
}

if (!sessions.length && !allIssues.length) {
  console.log("No recent sessions or open issues found.");
}
