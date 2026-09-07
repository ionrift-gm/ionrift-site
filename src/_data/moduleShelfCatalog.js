/**
 * Modules listed on the Module Shelf (Foundry install desk).
 * Includes public Foundry/GitHub installs and Patreon-gated manifest tokens.
 */
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const modules = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), "modules.json"), "utf8"),
);

const SHELF_METHODS = new Set(["foundry", "github", "patreon-manifest"]);

export default function () {
  return modules
    .filter((m) => m.install && SHELF_METHODS.has(m.install.method) && m.status !== "roadmap")
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map((m) => {
      const method = m.install.method;
      const packageId = m.install.moduleId || `ionrift-${m.id}`;
      return {
        id: m.id,
        packageId,
        name: m.name,
        tagline: m.tagline || "",
        icon: m.icon || null,
        accent: m.accent || null,
        method,
        minTier: m.install.minTier || (method === "patreon-manifest" ? "Acolyte" : null),
        label: m.install.label || "Install",
        manifest: m.install.manifest || null,
        foundryPackage: m.links?.foundryPackage || null,
        github: m.links?.github || null,
        patreon: m.links?.patreon || null,
        detailUrl: m.detail ? `/modules/${m.id}/` : null,
        accessLabel: m.accessLabel || null,
      };
    });
}
