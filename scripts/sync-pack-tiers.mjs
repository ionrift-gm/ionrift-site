/**
 * Sync featured pack tier labels from ionrift-cloud PACK_CATALOG.
 * Run after middleware pack tier changes: npm run sync:packs
 */
import { readFileSync, writeFileSync } from "fs";
import { createRequire } from "module";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const siteRoot = path.resolve(__dirname, "..");
const packsDataPath = path.join(siteRoot, "src", "_data", "packs.json");
const catalogPath = path.resolve(
  siteRoot,
  "..",
  "ionrift-cloud",
  "middleware",
  "src",
  "packs.js",
);

const require = createRequire(import.meta.url);
const { PACK_CATALOG } = require(catalogPath);

function tierForCatalogKey(catalogKey) {
  const versions = PACK_CATALOG[catalogKey];
  if (!versions) {
    throw new Error(`Unknown catalogKey: ${catalogKey}`);
  }
  const latest = Object.values(versions).at(-1);
  if (!latest?.tier) {
    throw new Error(`No tier on catalog entry: ${catalogKey}`);
  }
  return latest.tier;
}

const packs = JSON.parse(readFileSync(packsDataPath, "utf8"));
let changed = 0;

for (const pack of packs) {
  if (!pack.catalogKey) {
    console.warn(`skip ${pack.id}: no catalogKey`);
    continue;
  }
  const tier = tierForCatalogKey(pack.catalogKey);
  if (pack.tier !== tier) {
    console.log(`${pack.id}: ${pack.tier} -> ${tier}`);
    pack.tier = tier;
    changed += 1;
  }
}

writeFileSync(packsDataPath, `${JSON.stringify(packs, null, 2)}\n`);
console.log(changed ? `Updated ${changed} pack tier(s).` : "Pack tiers already in sync.");
