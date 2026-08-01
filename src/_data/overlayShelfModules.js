/**
 * Status API moduleId (ionrift-*) → label + site icon path from modules.json.
 */
import modules from "./modules.json" with { type: "json" };

const EXTRA = {
  // Status listing ids that do not match modules.json id + ionrift- prefix.
};

export default function () {
  const map = { ...EXTRA };

  for (const m of modules) {
    const entry = {
      label: m.name || m.id,
      icon: m.icon || null,
      accent: m.accent || null,
    };
    map[m.id] = entry;
    map[`ionrift-${m.id}`] = entry;
  }

  // Site id dh-animator vs package ionrift-daggerheart-animator (if ever listed).
  if (map["dh-animator"]) {
    map["ionrift-daggerheart-animator"] = map["dh-animator"];
  }

  return map;
}
