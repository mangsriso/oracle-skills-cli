#!/usr/bin/env bun
/**
 * sync-registry.ts — Discover NLM notebooks and enrich with auto-learn + notebooklm metadata.
 * Ground truth: `nlm notebook list --json`
 * Output: ψ/memory/notebooks.json
 */

import { $ } from "bun";
import { readFileSync, existsSync, readdirSync } from "fs";
import { join } from "path";

const AUTO_LEARN_OUTPUT = "/home/aitma/ghq/github.com/mangsriso/auto-learn/output/youtube";
const LIBRARY_JSON = "/home/aitma/.claude/skills/notebooklm/data/library.json";
const REGISTRY_OUTPUT = "/home/aitma/sda-script/ψ/memory/notebooks.json";

interface NlmNotebook {
  id: string;
  title: string;
  source_count: number;
  updated_at: string;
}

interface NotebookEntry {
  id: string;
  slug: string;
  name: string;
  source: "auto-learn" | "notebooklm" | "manual";
  description: string;
  keywords: string[];
  source_count: number;
  updated_at: string;
}

interface Registry {
  version: 1;
  updated_at: string;
  notebooks: NotebookEntry[];
}

// --- Step 1: Get live notebooks from NLM CLI ---
async function getLiveNotebooks(): Promise<NlmNotebook[]> {
  try {
    const result = await $`nlm notebook list --json`.text();
    return JSON.parse(result);
  } catch (e: any) {
    console.error("Failed to get NLM notebook list. Check auth or CLI installation.");
    console.error(e.message || e);
    process.exit(1);
  }
}

// --- Step 2: Load auto-learn enrichment (keyed by notebook_id) ---
function loadAutoLearnEnrichment(): Map<string, {
  topic: string;
  source_slug: string;
  video_count: number;
}> {
  const map = new Map();
  if (!existsSync(AUTO_LEARN_OUTPUT)) return map;

  for (const dir of readdirSync(AUTO_LEARN_OUTPUT)) {
    const statePath = join(AUTO_LEARN_OUTPUT, dir, "state.json");
    if (!existsSync(statePath)) continue;

    try {
      const state = JSON.parse(readFileSync(statePath, "utf-8"));
      const notebookId = state.synthesis?.notebook_id;
      if (!notebookId) continue;

      map.set(notebookId, {
        topic: state.topic || "",
        source_slug: state.source_slug || dir,
        video_count: state.harvest?.after_filter || 0,
      });
    } catch {
      // skip malformed state files
    }
  }
  return map;
}

// --- Step 3: Load notebooklm library enrichment (keyed by UUID from URL) ---
function loadLibraryEnrichment(): Map<string, {
  libraryId: string;
  name: string;
  description: string;
  topics: string[];
}> {
  const map = new Map();
  if (!existsSync(LIBRARY_JSON)) return map;

  try {
    const lib = JSON.parse(readFileSync(LIBRARY_JSON, "utf-8"));
    for (const [libraryId, entry] of Object.entries(lib.notebooks || {})) {
      const e = entry as any;
      // Extract UUID from URL like https://notebooklm.google.com/notebook/<UUID>
      const urlMatch = e.url?.match(/notebook\/([a-f0-9-]+)/);
      if (!urlMatch) continue;

      map.set(urlMatch[1], {
        libraryId,
        name: e.name || "",
        description: e.description || "",
        topics: e.topics || [],
      });
    }
  } catch {
    // skip malformed library
  }
  return map;
}

// --- Derive keywords from topic ---
function deriveKeywords(topic: string, slug: string): string[] {
  // If topic is a URL, use slug instead
  const source = topic.startsWith("http") ? slug : topic;
  return source
    .split(/[\s\-_\/]+/)
    .map((w) => w.toLowerCase())
    .filter((w) => w.length >= 3);
}

// --- Slugify a title for fallback ---
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

// --- Main ---
async function main() {
  console.log("Syncing NLM notebook registry...");

  const liveNotebooks = await getLiveNotebooks();
  console.log(`Found ${liveNotebooks.length} live notebooks`);

  const autoLearn = loadAutoLearnEnrichment();
  console.log(`Loaded ${autoLearn.size} auto-learn enrichments`);

  const library = loadLibraryEnrichment();
  console.log(`Loaded ${library.size} library enrichments`);

  const notebooks: NotebookEntry[] = liveNotebooks.map((nb) => {
    const al = autoLearn.get(nb.id);
    const lib = library.get(nb.id);

    // Determine slug: auto-learn slug > library id > slugified title
    const slug = al?.source_slug || lib?.libraryId || slugify(nb.title);

    // Determine name: library name > NLM title
    const name = lib?.name || nb.title;

    // Determine source
    const source = al ? "auto-learn" : lib ? "notebooklm" : "manual";

    // Determine description
    const description = lib?.description || (al ? `Auto-learned from ${al.topic} (${al.video_count} videos)` : "");

    // Determine keywords: library topics + derived from topic/slug
    const keywords = [
      ...(lib?.topics || []).map((t: string) => t.toLowerCase()),
      ...(al ? deriveKeywords(al.topic, al.source_slug) : []),
      ...slugify(nb.title).split("-").filter((w) => w.length >= 3),
    ];
    // Deduplicate
    const uniqueKeywords = [...new Set(keywords)];

    return {
      id: nb.id,
      slug,
      name,
      source,
      description,
      keywords: uniqueKeywords,
      source_count: nb.source_count,
      updated_at: nb.updated_at,
    };
  });

  const registry: Registry = {
    version: 1,
    updated_at: new Date().toISOString(),
    notebooks,
  };

  await Bun.write(REGISTRY_OUTPUT, JSON.stringify(registry, null, 2) + "\n");
  console.log(`Registry written to ${REGISTRY_OUTPUT}`);
  console.log(`Notebooks: ${notebooks.map((n) => n.slug).join(", ")}`);
}

main();
