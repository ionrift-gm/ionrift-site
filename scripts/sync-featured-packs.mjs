/**
 * Build src/_data/packs.json from packs.catalog.json + registry + PACK_CATALOG.
 * The catalog file is a thin curation layer: product groupings, category,
 * featured flag, order, and optional name/description overrides. Tier, modules,
 * description, and preview status are derived from the registry and catalog.
 * Run after catalog or registry changes: npm run sync:packs
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { createRequire } from "module";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const siteRoot = path.resolve(__dirname, "..");
const catalogInputPath = path.join(siteRoot, "src", "_data", "packs.catalog.json");
const outputPath = path.join(siteRoot, "src", "_data", "packs.json");
const modulesPath = path.join(siteRoot, "src", "_data", "modules.json");

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

function catalogLatest(catalogKey) {
  const versions = PACK_CATALOG[catalogKey];
  if (!versions) {
    throw new Error(`Unknown catalog key: ${catalogKey}`);
  }
  return Object.values(versions).at(-1);
}

function catalogTier(catalogKey) {
  const latest = catalogLatest(catalogKey);
  if (!latest?.tier) {
    throw new Error(`No tier on catalog entry: ${catalogKey}`);
  }
  return latest.tier;
}

function catalogPublicDownload(catalogKey) {
  return catalogLatest(catalogKey)?.publicDownload === true;
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

// Public copy must not carry em/en dashes or arrows (brand tone rules).
function sanitizeCopy(text) {
  if (!text) return text;
  return text
    .replace(/\s*[—–]\s*/g, ", ")
    .replace(/\s*->\s*/g, ", ")
    .replace(/\s*<-\s*/g, ", ")
    .replace(/,\s*,/g, ", ")
    .trim();
}

function moduleAccentForPack(moduleNames, moduleByName) {
  const primary = moduleNames[0];
  const mod = primary ? moduleByName[primary] : null;
  const accent = mod?.accent || "#8b5cf6";
  return {
    accent,
    iconAccent: mod?.iconAccent || accent,
  };
}

function buildPack(product, registry, moduleByName) {
  const entries = product.catalogKeys.map((key) => {
    const reg = registryEntry(registry, key);
    if (!reg) {
      throw new Error(`Registry entry missing for ${key}`);
    }
    return { key, reg, tier: catalogTier(key) };
  });

  const tier = highestTier(entries.map((entry) => entry.tier));
  const tierLabel = entries.every((entry) => catalogPublicDownload(entry.key))
    ? "Public"
    : (TIER_LABELS[tier] || tier);

  const labels = entries.map((entry) => displayPackName(entry.reg.packLabel)).filter(Boolean);
  const uniqueLabels = [...new Set(labels)];
  const derivedName = uniqueLabels.length === 1
    ? uniqueLabels[0]
    : uniqueLabels.join(" · ") || product.id;
  const name = sanitizeCopy(product.name || derivedName);

  const modules = [
    ...new Set(entries.map((entry) => moduleLabel(entry.reg.moduleId)).filter(Boolean)),
  ];

  const derivedDescription = entries
    .map((entry) => entry.reg.description?.trim())
    .filter(Boolean)
    .join(" ");
  const description = sanitizeCopy(product.description || derivedDescription);

  // A product is a preview only when none of its parts have shipped yet.
  const preview = entries.every((entry) => entry.reg.preview === true);
  const { accent, iconAccent } = moduleAccentForPack(modules, moduleByName);

  return {
    id: product.id,
    catalogKeys: product.catalogKeys,
    name,
    tier,
    tierLabel,
    modules,
    accent,
    iconAccent,
    description,
    category: product.category || null,
    image: product.image || null,
    featured: product.featured === true,
    landing: product.landing === true,
    preview,
    status: preview ? "preview" : "available",
    order: product.order || 0,
  };
}

const catalog = JSON.parse(readFileSync(catalogInputPath, "utf8"));
const modulesData = JSON.parse(readFileSync(modulesPath, "utf8"));
const moduleByName = Object.fromEntries(modulesData.map((mod) => [mod.name, mod]));
const registry = await loadRegistry();
const packs = catalog
  .slice()
  .sort((a, b) => (a.order || 0) - (b.order || 0))
  .map((item) => buildPack(item, registry, moduleByName));

writeFileSync(outputPath, `${JSON.stringify(packs, null, 2)}\n`);
const featuredCount = packs.filter((pack) => pack.featured).length;
console.log(
  `Wrote ${packs.length} pack(s) (${featuredCount} featured) to src/_data/packs.json`,
);
