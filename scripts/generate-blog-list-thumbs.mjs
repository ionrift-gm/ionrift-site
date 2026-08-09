/**
 * Build list/home thumbs next to each blog cover.
 * Keeps cover.* for post hero + OG; writes cover-list.jpg for Devlog / landing cards.
 *
 * Usage: npm run thumbs:blog
 * Requires ffmpeg on PATH.
 *
 * Target: ~480px wide JPEG (~2x a 140–240px CSS thumb / landing card).
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const blogRoot = path.resolve(__dirname, "../src/img/blog");
const COVER_RE = /^cover\.(png|jpe?g|webp|gif)$/i;
const OUT_NAME = "cover-list.jpg";
const MAX_W = 480;

function walkDirs(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, name.name);
    if (name.isDirectory()) walkDirs(full, out);
  }
  out.push(dir);
  return out;
}

function findCover(dir) {
  const names = readdirSync(dir).filter((n) => COVER_RE.test(n));
  if (!names.length) return null;
  // Prefer stills over gif for list thumbs when both exist (rare).
  const ranked = names.sort((a, b) => {
    const rank = (n) => {
      const e = path.extname(n).toLowerCase();
      if (e === ".png") return 0;
      if (e === ".jpg" || e === ".jpeg") return 1;
      if (e === ".webp") return 2;
      return 3;
    };
    return rank(a) - rank(b);
  });
  return path.join(dir, ranked[0]);
}

const dirs = walkDirs(blogRoot).filter((d) => d !== blogRoot);
let ok = 0;
let skipped = 0;

for (const dir of dirs.sort()) {
  const src = findCover(dir);
  if (!src) {
    skipped += 1;
    continue;
  }
  const out = path.join(dir, OUT_NAME);
  const rel = path.relative(blogRoot, dir).replace(/\\/g, "/");
  const result = spawnSync(
    "ffmpeg",
    [
      "-y",
      "-i",
      src,
      "-vf",
      `scale=${MAX_W}:-1:force_original_aspect_ratio=decrease`,
      "-frames:v",
      "1",
      "-q:v",
      "3",
      out,
    ],
    { encoding: "utf8" },
  );
  if (result.status !== 0 || !existsSync(out)) {
    console.error(`FAIL ${rel}: ${result.stderr?.slice(-240) || "ffmpeg error"}`);
    process.exitCode = 1;
    continue;
  }
  const srcKb = Math.round(statSync(src).size / 1024);
  const outKb = Math.round(statSync(out).size / 1024);
  console.log(`OK ${rel}  ${srcKb} KB → ${outKb} KB  (${path.basename(src)} → ${OUT_NAME})`);
  ok += 1;
}

console.log(`\nWrote ${ok} list thumbs under ${blogRoot} (skipped ${skipped} folders without cover.*)`);
