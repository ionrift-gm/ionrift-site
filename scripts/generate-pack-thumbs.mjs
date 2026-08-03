/**
 * Build 144px square pack thumbs for Overlay Shelf tiles (72px CSS @2x).
 *
 * Usage: node scripts/generate-pack-thumbs.mjs
 * Requires ffmpeg on PATH.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packsDir = path.resolve(__dirname, "../src/img/packs");
const thumbDir = path.join(packsDir, "thumbs");

mkdirSync(thumbDir, { recursive: true });

const files = readdirSync(packsDir)
  .filter((name) => /\.(png|jpe?g|webp)$/i.test(name) && !name.startsWith("_"));

/** @type {Map<string, string>} */
const byStem = new Map();
for (const name of files) {
  const stem = path.basename(name, path.extname(name));
  const full = path.join(packsDir, name);
  const ext = path.extname(name).toLowerCase();
  const existing = byStem.get(stem);
  if (!existing) {
    byStem.set(stem, full);
    continue;
  }
  const existingExt = path.extname(existing).toLowerCase();
  if (existingExt === ".png" && (ext === ".jpg" || ext === ".jpeg" || ext === ".webp")) {
    byStem.set(stem, full);
  }
}

let ok = 0;
for (const [stem, src] of [...byStem.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
  const out = path.join(thumbDir, `${stem}.jpg`);
  const result = spawnSync(
    "ffmpeg",
    [
      "-y",
      "-i",
      src,
      "-vf",
      "scale=144:144:force_original_aspect_ratio=decrease,pad=144:144:(ow-iw)/2:(oh-ih)/2:color=0x0a0a12",
      "-q:v",
      "3",
      out,
    ],
    { encoding: "utf8" }
  );
  if (result.status !== 0 || !existsSync(out)) {
    console.error(`FAIL ${stem}: ${result.stderr?.slice(-200) || "ffmpeg error"}`);
    process.exitCode = 1;
    continue;
  }
  const kb = Math.round(statSync(out).size / 1024);
  console.log(`OK ${stem} (${kb} KB) from ${path.basename(src)}`);
  ok += 1;
}

console.log(`\nWrote ${ok} thumbs to ${thumbDir}`);
