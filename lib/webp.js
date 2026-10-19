/**
 * Display path for a site image: "/img/x.png" -> "/img/x.webp" when the WebP
 * copy exists in src/img (see scripts/convert-images-webp.mjs). Anything else
 * (external URLs, GIF/MP4, images without a WebP copy) passes through.
 * og:image tags keep the original PNG/JPG for platforms without WebP support.
 */
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const srcDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "src");

export function webp(p) {
  if (!p || typeof p !== "string" || !p.startsWith("/img/")) return p;
  if (!/\.(png|jpe?g)$/i.test(p)) return p;
  const candidate = p.replace(/\.(png|jpe?g)$/i, ".webp");
  return existsSync(path.join(srcDir, candidate)) ? candidate : p;
}
