import { describe, it, expect } from "bun:test";
import { profiles, labOnly, STANDARD_SKILLS, LAB_SKILLS, resolveProfile } from "../src/profiles";

// Simulated full skill list — must include all standard + lab + other discovered skills
const ALL_SKILLS = [
  ...STANDARD_SKILLS,
  ...LAB_SKILLS,
  // Full/other skills (not standard, not lab-only)
  "auto-retrospective", "incubate", "philosophy", "project",
  "resonance", "where-we-are", "who-are-you",
].sort();

describe("profiles", () => {
  it("standard has 16 skills", () => {
    expect(STANDARD_SKILLS).toHaveLength(16);
    expect(profiles.standard.include).toHaveLength(16);
  });

  it("full excludes lab-only skills", () => {
    expect(profiles.full.exclude).toEqual(labOnly);
  });

  it("lab has no include or exclude (means all)", () => {
    expect(profiles.lab.include).toBeUndefined();
    expect(profiles.lab.exclude).toBeUndefined();
  });

  it("standard includes dig", () => {
    expect(STANDARD_SKILLS).toContain("dig");
  });

  it("standard includes create-shortcut", () => {
    expect(STANDARD_SKILLS).toContain("create-shortcut");
  });

  it("standard does NOT include dream or feel", () => {
    expect([...STANDARD_SKILLS]).not.toContain("dream");
    expect([...STANDARD_SKILLS]).not.toContain("feel");
  });

  it("LAB_SKILLS has 18 experimental skills", () => {
    expect(LAB_SKILLS).toHaveLength(18);
  });

  it("labOnly matches LAB_SKILLS", () => {
    expect(labOnly).toEqual([...LAB_SKILLS]);
  });

  it("no overlap between STANDARD_SKILLS and LAB_SKILLS", () => {
    const standardSet = new Set(STANDARD_SKILLS);
    for (const skill of LAB_SKILLS) {
      expect(standardSet.has(skill)).toBe(false);
    }
  });
});

describe("resolveProfile", () => {
  it("standard returns 16 skills", () => {
    const result = resolveProfile("standard", ALL_SKILLS);
    expect(result).toHaveLength(16);
  });

  it("full returns all minus lab-only", () => {
    const result = resolveProfile("full", ALL_SKILLS)!;
    expect(result).not.toBeNull();
    expect(result.length).toBe(ALL_SKILLS.length - labOnly.length);
    for (const name of labOnly) {
      expect(result).not.toContain(name);
    }
  });

  it("lab returns null (all skills)", () => {
    const result = resolveProfile("lab", ALL_SKILLS);
    expect(result).toBeNull();
  });

  it("unknown profile returns null", () => {
    const result = resolveProfile("nonexistent", ALL_SKILLS);
    expect(result).toBeNull();
  });

  it("standard skills are a subset of all skills", () => {
    const result = resolveProfile("standard", ALL_SKILLS)!;
    for (const skill of result) {
      expect(ALL_SKILLS).toContain(skill);
    }
  });

  it("full includes everything standard has", () => {
    const full = resolveProfile("full", ALL_SKILLS)!;
    const standard = resolveProfile("standard", ALL_SKILLS)!;
    for (const skill of standard) {
      expect(full).toContain(skill);
    }
  });
});
