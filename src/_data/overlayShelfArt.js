/**
 * Overlay id → shelf art / short name from packs.json catalogKeys.
 */
import packs from "./packs.json" with { type: "json" };

const FALLBACKS = {
  "respite-cooking-overlay": {
    image: "/img/packs/respite-core-art.png",
    name: "Core Cooking Pack",
  },
  "respite-cooking-art-overlay": {
    image: "/img/packs/respite-core-art.png",
    name: "Cooking item icons",
  },
};

export default function () {
  const map = { ...FALLBACKS };

  for (const pack of packs) {
    const entry = {
      image: pack.image || null,
      name: pack.name || null,
    };
    for (const key of pack.catalogKeys || []) {
      map[key] = {
        image: entry.image || map[key]?.image || null,
        name: map[key]?.name || entry.name,
      };
    }
  }

  return map;
}
