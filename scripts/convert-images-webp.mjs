/**
 * One-off: write WebP copies of the heavy site images at display size.
 * Each output sits next to its source (same name, .webp). Sources used as
 * og:image (module icons, previews, blog covers, page headers) are kept;
 * templates pick the .webp for display via the `webp` filter (lib/webp.js).
 *
 * Usage: node scripts/convert-images-webp.mjs [--force]
 * Requires ffmpeg with libwebp on PATH (same as the thumb scripts).
 * Skips sources that are gone (logo, anvil, hero panel and pack covers were
 * swapped to WebP outright) and existing .webp files unless --force.
 *
 * Widths are about 2x the largest CSS size each image renders at.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const img = path.resolve(__dirname, "../src/img");
const force = process.argv.includes("--force");
const moduleIcons = JSON.parse(readFileSync(path.resolve(__dirname, "../src/_data/modules.json"), "utf8"))
  .map((m) => m.icon)
  .filter((p) => p && /^\/img\/modules\/[^/]+\.png$/.test(p))
  .map((p) => p.slice("/img/".length));
// Blog covers named by a post's ogImage.
const postsDir = path.resolve(__dirname, "../src/posts");
const blogCovers = readdirSync(postsDir)
  .filter((f) => f.endsWith(".md"))
  .map((f) => readFileSync(path.join(postsDir, f), "utf8").match(/^ogImage:\s*"?(\/img\/blog\/[^"\s]+\.png)"?/m)?.[1])
  .filter(Boolean)
  .map((p) => p.slice("/img/".length));

/** [path relative to src/img, max width, quality] */
const targets = [
  // Nav logo (ionrift_logo.webp) and favicons are generated from the brandmark master, not here.
  // Icons: 38-72px on cards and module pages.
  ["fvtt-anvil.png", 192, 85],
  ...moduleIcons.map((rel) => [rel, 160, 85]),
  // Hero art: background up to ~960px wide on large screens.
  ["hero-panel.png", 1024, 80],
  // Pack covers: up to 450px wide cards.
  ...["qm-core.png", "dust-bone.png", "craft-professions.png", "respite-core-art.png",
    "resonance-core.jpg", "wanderers.jpg", "authoring-kit.jpg", "frost-stone.jpg", "cursewright.jpg"]
    .map((f) => [`packs/${f}`, 900, 80]),
  ["packs/_header.jpg", 1400, 78],
  ["shelf/header.jpg", 840, 80],
  // Module page previews: up to ~1050px wide.
  ["modules/previews/monstrous-feast-owlbear.png", 1600, 80],
  ["modules/previews/quiz-night-overview.png", 1600, 80],
  // Blog post heroes: up to ~670px wide.
  ...blogCovers.map((rel) => [rel, 1340, 80]),
];

let before = 0;
let after = 0;
for (const [rel, maxW, q] of targets) {
  const src = path.join(img, rel);
  const out = src.replace(/\.(png|jpe?g)$/i, ".webp");
  if (!existsSync(src) || (existsSync(out) && !force)) continue;
  const res = spawnSync("ffmpeg", [
    "-y", "-loglevel", "error", "-i", src,
    // Never upscale; keep aspect ratio; keep alpha for PNGs.
    "-vf", `scale='min(${maxW},iw)':-2:flags=lanczos`,
    "-c:v", "libwebp", "-quality", String(q), "-compression_level", "6",
    ...(rel.endsWith(".png") ? ["-pix_fmt", "yuva420p"] : []),
    out,
  ], { encoding: "utf8" });
  if (res.status !== 0 || !existsSync(out)) {
    console.error(`FAIL ${rel}: ${res.stderr?.slice(-300)}`);
    process.exitCode = 1;
    continue;
  }
  const a = statSync(src).size;
  const b = statSync(out).size;
  before += a;
  after += b;
  console.log(`${String(Math.round(a / 1024)).padStart(6)} KB -> ${String(Math.round(b / 1024)).padStart(5)} KB  ${rel}`);
}
console.log(`\nTotal ${Math.round(before / 1024)} KB -> ${Math.round(after / 1024)} KB`);
