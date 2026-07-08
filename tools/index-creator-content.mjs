#!/usr/bin/env node
/**
 * index-creator-content.mjs — zero-dependency creator-content index builder.
 *
 * Scans READ-ONLY sources outside this repo:
 *   - /home/user/FrankX/content/blog/*.{mdx,md}                (private authoring repo)
 *   - /home/user/frankx.ai-vercel-website/content/blog/*.mdx   (production repo)
 *   - /home/user/frankx.ai-vercel-website/app/music* + app/vibe page.tsx routes
 *
 * Classifies every item music-related or not by keyword match, then writes
 * data/creator-content-index.json with deterministic ordering (sorted by
 * surface, then path — no generatedAt timestamp, so re-runs on unchanged
 * sources produce byte-identical output).
 *
 * Absent source directories are skipped with a note, never a crash.
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HUB = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(HUB, "data", "creator-content-index.json");

const FRANKX_BLOG = "/home/user/FrankX/content/blog";
const PROD = "/home/user/frankx.ai-vercel-website";
const PROD_BLOG = join(PROD, "content", "blog");
const PROD_APP = join(PROD, "app");

// Word-boundary keyword match so "dj" doesn't fire on "adjacent".
// Deliberately excludes high-noise tech words that dominate Frank's non-music
// writing ("production" deploys, "track" progress, agent "orchestration",
// Claude Code "mastering") — verified against the corpus 2026-07-08.
const MUSIC_RE = new RegExp(
  "\\b(" +
    [
      "music", "musical", "suno", "vibe", "vibes", "audio", "song", "songs",
      "album", "albums", "guardian", "guardians", "arcanea", "arcanean",
      "frequency", "frequencies", "solfeggio", "lufs", "bpm", "playlist",
      "spotify", "lyric", "lyrics", "melody", "chord", "chords", "soundtrack",
      "dj", "piano", "guitar", "violin", "xylophone", "drums",
    ].join("|") +
    ")\\b",
  "i"
);

const notes = [];

/** Minimal frontmatter reader: title, date, description, tags. */
function parseFrontmatter(raw) {
  if (!raw.startsWith("---")) return null;
  const end = raw.indexOf("\n---", 3);
  if (end === -1) return null;
  const block = raw.slice(3, end);
  const fm = {};
  const lines = block.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(title|date|description|tags):\s*(.*)$/);
    if (!m) continue;
    const [, key, rest] = m;
    if (key === "tags") {
      if (rest.trim().startsWith("[")) {
        // Inline array: ["AI", "Music"] or [ai, music]
        fm.tags = rest
          .replace(/^\[|\]$/g, "")
          .split(",")
          .map((t) => t.trim().replace(/^["']|["']$/g, ""))
          .filter(Boolean);
      } else if (rest.trim() === "") {
        // YAML list on following lines
        const tags = [];
        for (let j = i + 1; j < lines.length; j++) {
          const item = lines[j].match(/^\s+-\s*(.+)$/);
          if (!item) break;
          tags.push(item[1].trim().replace(/^["']|["']$/g, ""));
        }
        fm.tags = tags;
      }
    } else {
      fm[key] = rest.trim().replace(/^["']|["']$/g, "");
    }
  }
  return fm;
}

function scanBlogDir(dir, surface) {
  if (!existsSync(dir)) {
    notes.push(`skipped ${surface}: source dir absent (${dir})`);
    return [];
  }
  const items = [];
  let skipped = 0;
  for (const name of readdirSync(dir).sort()) {
    if (!/\.(mdx|md)$/.test(name)) continue;
    const path = join(dir, name);
    let raw;
    try {
      raw = readFileSync(path, "utf8");
    } catch {
      skipped++;
      continue;
    }
    const fm = parseFrontmatter(raw);
    if (!fm || !fm.title) {
      // Non-content files that live in the blog dir (CLAUDE.md, CONTENT_SCHEMA.md, ...)
      skipped++;
      continue;
    }
    const haystack = [fm.title, fm.description ?? "", (fm.tags ?? []).join(" "), name].join(" ");
    const item = {
      title: fm.title,
      path,
      surface,
      musicRelated: MUSIC_RE.test(haystack),
    };
    if (fm.date) item.date = fm.date;
    if (fm.tags?.length) item.tags = fm.tags;
    items.push(item);
  }
  if (skipped) notes.push(`${surface}: skipped ${skipped} file(s) without frontmatter title`);
  return items;
}

/** Recursive page.tsx route inventory under a directory. */
function scanRoutes(appDir) {
  if (!existsSync(appDir)) {
    notes.push(`skipped prod-route: app dir absent (${appDir})`);
    return [];
  }
  const roots = readdirSync(appDir)
    .filter((n) => n.startsWith("music") || n === "vibe")
    .map((n) => join(appDir, n));
  const pages = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir, { withFileTypes: true }).sort((a, b) =>
      a.name.localeCompare(b.name)
    )) {
      const p = join(dir, name.name);
      if (name.isDirectory()) walk(p);
      else if (name.name === "page.tsx") pages.push(p);
    }
  };
  for (const root of roots) if (existsSync(root)) walk(root);
  return pages.map((path) => {
    const route = "/" + relative(appDir, dirname(path)).split("\\").join("/");
    return {
      title: route,
      path,
      surface: "prod-route",
      musicRelated: MUSIC_RE.test(route.replace(/[/-]/g, " ")),
    };
  });
}

const items = [
  ...scanBlogDir(FRANKX_BLOG, "frankx-blog"),
  ...scanBlogDir(PROD_BLOG, "prod-blog"),
  ...scanRoutes(PROD_APP),
].sort((a, b) => (a.surface === b.surface ? a.path.localeCompare(b.path) : a.surface.localeCompare(b.surface)));

const bySurface = {};
for (const it of items) {
  bySurface[it.surface] ??= { total: 0, musicRelated: 0 };
  bySurface[it.surface].total++;
  if (it.musicRelated) bySurface[it.surface].musicRelated++;
}

const index = {
  items,
  stats: {
    total: items.length,
    musicRelated: items.filter((i) => i.musicRelated).length,
    bySurface,
  },
  notes,
};

import { writeFileSync, mkdirSync } from "node:fs";
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(index, null, 2) + "\n");

console.log(`Wrote ${relative(HUB, OUT)}`);
console.log("STATS " + JSON.stringify(index.stats, null, 2));
for (const n of notes) console.log("NOTE  " + n);
