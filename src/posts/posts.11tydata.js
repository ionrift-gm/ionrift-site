import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { isGatedDevlog } from "../../lib/devlog.js";

const modulesPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "_data",
  "modules.json",
);

function catalogue() {
  return JSON.parse(readFileSync(modulesPath, "utf8"));
}

function moduleNames(ids) {
  if (!Array.isArray(ids)) return [];
  const all = catalogue();
  return ids.map((id) => all.find((m) => m.id === id)?.name || String(id));
}

/**
 * Directory data for src/posts. Adds SEO fields for teaser dev logs.
 * Older posts are untouched: every value falls back to what they had before.
 */
export default {
  eleventyComputed: {
    /** True when this post renders as a members-only teaser. */
    isTeaser: (data) => isGatedDevlog(data),
    /**
     * Full <title> text. Front matter `seoTitle` wins. Teasers default to
     * "Dev log #N: … | Foundry VTT modules"; other posts keep "… | Ionrift Workshop".
     */
    pageTitle: (data) => {
      if (data.seoTitle) return data.seoTitle;
      if (isGatedDevlog(data)) return `${data.title} | Foundry VTT modules`;
      return `${data.title} | Ionrift Workshop`;
    },
    /**
     * Keywords for meta, article:tag and JSON-LD. Built from front matter
     * `modules` (ids from src/_data/modules.json, or plain names) and `keywords`.
     * Empty for posts that set neither, so older posts render as before.
     */
    seoKeywords: (data) => {
      const mods = moduleNames(data.moduleIds);
      const extra = Array.isArray(data.keywords) ? data.keywords : [];
      if (!mods.length && !extra.length) return [];
      return [...new Set(["Foundry VTT", ...mods, ...extra].map(String))];
    },
    /** [{ name, url }] for the module chips and JSON-LD "about". */
    moduleRefs: (data) =>
      (Array.isArray(data.moduleIds) ? data.moduleIds : []).map((id) => {
        const m = catalogue().find((x) => x.id === id);
        return {
          name: m ? m.name : String(id),
          url: m && m.detail ? `/modules/${m.id}/` : null,
        };
      }),
  },
};
