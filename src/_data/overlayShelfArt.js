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
  "respite-frost-stone-art-overlay": {
    image: "/img/packs/frost-stone.jpg",
    name: "Frost & Stone terrain art",
  },
  "respite-bone-dust-art-overlay": {
    image: "/img/packs/dust-bone.png",
    name: "Dust & Bone terrain art",
  },
  "quartermaster-core-art-overlay": {
    image: "/img/packs/qm-core.png",
    name: "Core pack art",
  },
  "quartermaster-frost-stone-art-overlay": {
    image: "/img/packs/frost-stone.jpg",
    name: "Frost & Stone pack art",
  },
  "quartermaster-bone-dust-art-overlay": {
    image: "/img/packs/dust-bone.png",
    name: "Bone & Dust pack art",
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
