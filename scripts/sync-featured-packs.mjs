/**
 * Build src/_data/packs.json from packs.featured.json + registry + PACK_CATALOG.
 * Run after catalog or registry changes: npm run sync:packs
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { createRequire } from "module";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const siteRoot = path.resolve(__dirname, "..");
const featuredPath = path.join(siteRoot, "src", "_data", "packs.featured.json");
const outputPath = path.join(siteRoot, "src", "_data", "packs.json");

const catalogPath = path.resolve(
  siteRoot,
  "..",
  "ionrift-cloud",
  "middleware",
  "src",
  "packs.js",
);
const registryPath = path.resolve(siteRoot, "..", "ionrift-pack-registry", "registry.json");
const REGISTRY_URL = "https://ionrift-gm.github.io/ionrift-pack-registry/registry.json";

const TIER_ORDER = ["Free", "Initiate", "Acolyte", "Weaver", "Artificer"];
const TIER_LABELS = {
  Free: "Subscriber",
  Initiate: "Initiate",
  Acolyte: "Acolyte",
  Weaver: "Weaver",
  Artificer: "Artificer",
};

const MODULE_LABELS = {
  "ionrift-respite": "Respite",
  "ionrift-quartermaster": "Quartermaster",
  "ionrift-resonance": "Resonance",
  "ionrift-cursewright": "Cursewright",
  respite: "Respite",
};

const require = createRequire(import.meta.url);
const { PACK_CATALOG } = require(catalogPath);

async function loadRegistry() {
  if (existsSync(registryPath)) {
    return JSON.parse(readFileSync(registryPath, "utf8"));
  }
  const res = await fetch(REGISTRY_URL);
  if (!res.ok) {
    throw new Error(`Registry fetch failed: ${res.status}`);
  }
  return res.json();
}

function catalogTier(catalogKey) {
  const versions = PACK_CATALOG[catalogKey];
  if (!versions) {
    throw new Error(`Unknown catalog key: ${catalogKey}`);
  }
  const latest = Object.values(versions).at(-1);
  if (!latest?.tier) {
    throw new Error(`No tier on catalog entry: ${catalogKey}`);
  }
  return latest.tier;
}

function highestTier(tiers) {
  return tiers.reduce((best, tier) => {
    const bestIdx = TIER_ORDER.indexOf(best);
    const tierIdx = TIER_ORDER.indexOf(tier);
    return tierIdx > bestIdx ? tier : best;
  });
}

function registryEntry(registry, catalogKey) {
  return (
    registry.overlays?.[catalogKey]
    || registry.packs?.[catalogKey]
    || registry.modules?.[catalogKey]
    || null
  );
}

function moduleLabel(moduleId) {
  return MODULE_LABELS[moduleId] || moduleId.replace(/^ionrift-/, "").replace(/-/g, " ");
}

function displayPackName(packLabel) {
  if (!packLabel) return null;
  return packLabel.replace(/\s+pack$/i, "").trim();
}

function buildFeaturedPack(featured, registry) {
  const entries = featured.catalogKeys.map((key) => {
    const reg = registryEntry(registry, key);
    if (!reg) {
      throw new Error(`Registry entry missing for ${key}`);
    }
    return { key, reg, tier: catalogTier(key) };
  });

  const tier = highestTier(entries.map((entry) => entry.tier));
  const labels = entries.map((entry) => displayPackName(entry.reg.packLabel)).filter(Boolean);
  const uniqueLabels = [...new Set(labels)];
  const name = uniqueLabels.length === 1 ? uniqueLabels[0] : uniqueLabels.join(" · ") || featured.id;

  const modules = [
    ...new Set(entries.map((entry) => moduleLabel(entry.reg.moduleId)).filter(Boolean)),
  ];

  const description = entries
    .map((entry) => entry.reg.description?.trim())
    .filter(Boolean)
    .join(" ");

  return {
    id: featured.id,
    catalogKeys: featured.catalogKeys,
    name,
    tier,
    tierLabel: TIER_LABELS[tier] || tier,
    modules,
    description,
    status: "available",
    order: featured.order,
  };
}

const featured = JSON.parse(readFileSync(featuredPath, "utf8"));
const registry = await loadRegistry();
const packs = featured
  .slice()
  .sort((a, b) => (a.order || 0) - (b.order || 0))
  .map((item) => buildFeaturedPack(item, registry));

writeFileSync(outputPath, `${JSON.stringify(packs, null, 2)}\n`);
console.log(`Wrote ${packs.length} featured pack(s) to src/_data/packs.json`);
