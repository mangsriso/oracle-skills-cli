#!/usr/bin/env bun
// vault-paths.ts - Shared vault-first path resolver
// Vault: ~/.oracle/ψ/ (central, cross-repo)
// Local: <repo>/ψ/ (fallback)

import { join } from "path";
import { homedir } from "os";
import { existsSync } from "fs";

const VAULT_PSI = join(homedir(), ".oracle", "ψ");

export function getVaultPsi(): string | null {
  return existsSync(VAULT_PSI) ? VAULT_PSI : null;
}

export function resolveSchedule(localRoot?: string): string {
  const vault = join(VAULT_PSI, "inbox", "schedule.md");
  if (existsSync(vault)) return vault;
  if (localRoot) {
    for (const sub of ["memory/resonance/schedule.md", "inbox/schedule.md"]) {
      const local = join(localRoot, "ψ", sub);
      if (existsSync(local)) return local;
    }
  }
  return vault; // return vault path even if missing (let caller handle)
}

export function resolveContacts(localRoot?: string): string {
  const vault = join(VAULT_PSI, "memory", "resonance", "contacts.md");
  if (existsSync(vault)) return vault;
  if (localRoot) {
    const local = join(localRoot, "ψ", "memory", "resonance", "contacts.md");
    if (existsSync(local)) return local;
  }
  return vault;
}

export function resolveSlugs(localRoot?: string): string {
  const vault = join(VAULT_PSI, "memory", "resonance", "slugs.yaml");
  if (existsSync(vault)) return vault;
  if (localRoot) {
    const local = join(localRoot, "ψ", "memory", "resonance", "slugs.yaml");
    if (existsSync(local)) return local;
  }
  return vault;
}

export function resolveVaultPath(relativePath: string, localRoot?: string): string {
  const vault = join(VAULT_PSI, relativePath);
  if (existsSync(vault)) return vault;
  if (localRoot) {
    const local = join(localRoot, "ψ", relativePath);
    if (existsSync(local)) return local;
  }
  return vault;
}
