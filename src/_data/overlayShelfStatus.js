/**
 * Local Overlay Shelf status listing built from workspace registry + PACK_CATALOG.
 * Served at /overlay-shelf/status.json for localhost so the Shelf can preview
 * unpublished pack splits before Monday middleware/registry publish.
 */
import { createRequire } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const siteRoot = path.resolve(__dirname, "../..");
const packsPath = path.resolve(siteRoot, "..", "ionrift-cloud", "middleware", "src", "packs.js");
const registryPath = path.resolve(siteRoot, "..", "ionrift-pack-registry", "registry.json");

const require = createRequire(import.meta.url);

export default function () {
  if (!existsSync(packsPath) || !existsSync(registryPath)) {
    return {
      schemaVersion: 1,
      generatedAt: new Date().toISOString(),
      overlays: [],
      modules: [],
      source: "missing-local-sources",
    };
  }

  const { buildPublicStatusListing } = require(packsPath);
  const { sanitizeStatusListing } = require(
    path.resolve(siteRoot, "..", "ionrift-cloud", "middleware", "src", "bundles.js")
  );
  const registry = JSON.parse(readFileSync(registryPath, "utf8"));
  const listing = buildPublicStatusListing(registry);
  return {
    ...sanitizeStatusListing(listing),
    source: "local-registry+catalog",
  };
}
