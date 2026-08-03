/**
 * Overlay id → shelf art / short name from packs.json catalogKeys.
 * Shelf tiles are 72px; always prefer /img/packs/thumbs/* (144px @2x).
 */
import packs from "./packs.json" with { type: "json" };

/** @param {string|null|undefined} image */
function toShelfThumb(image) {
  if (!image) return null;
  const match = String(image).match(/\/img\/packs\/([^/]+?)\.(png|jpe?g|webp)$/i);
  if (!match) return image;
  return `/img/packs/thumbs/${match[1]}.jpg`;
}

const FALLBACKS = {
  "respite-core-overlay": {
    image: "/img/packs/thumbs/respite-core-art.jpg",
    name: "Core pack",
  },
  "respite-core-art-overlay": {
    image: "/img/packs/thumbs/respite-core-art.jpg",
    name: "Core pack art",
  },
  "respite-cooking-overlay": {
    image: "/img/packs/thumbs/respite-core-art.jpg",
    name: "Core Cooking Pack",
  },
  "respite-cooking-art-overlay": {
    image: "/img/packs/thumbs/respite-core-art.jpg",
    name: "Cooking item icons",
  },
  "respite-craft-professions-overlay": {
    image: null,
    name: "Craft Professions Pack",
  },
  "respite-craft-professions-art-overlay": {
    image: null,
    name: "Craft Professions item icons",
  },
  "respite-frost-stone-art-overlay": {
    image: "/img/packs/thumbs/frost-stone.jpg",
    name: "Frost & Stone terrain art",
  },
  "respite-bone-dust-art-overlay": {
    image: "/img/packs/thumbs/dust-bone.jpg",
    name: "Dust & Bone terrain art",
  },
  "quartermaster-core-art-overlay": {
    image: "/img/packs/thumbs/qm-core.jpg",
    name: "Core pack art",
  },
  "quartermaster-frost-stone-art-overlay": {
    image: "/img/packs/thumbs/frost-stone.jpg",
    name: "Frost & Stone pack art",
  },
  "quartermaster-bone-dust-art-overlay": {
    image: "/img/packs/thumbs/dust-bone.jpg",
    name: "Bone & Dust pack art",
  },
};

export default function () {
  const map = { ...FALLBACKS };

  for (const pack of packs) {
    const entry = {
      image: toShelfThumb(pack.image) || null,
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
