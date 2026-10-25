import rssPlugin from "@11ty/eleventy-plugin-rss";
import { webp } from "./lib/webp.js";
import {
  FILL_IN,
  TEASER_MAX_CHARS,
  isGatedDevlog,
  isScheduled,
  teaserTextLength,
} from "./lib/devlog.js";
import { existsSync, readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packsPath = path.join(__dirname, "src", "_data", "packs.json");
const modulesPath = path.join(__dirname, "src", "_data", "modules.json");

function loadModules() {
  return JSON.parse(readFileSync(modulesPath, "utf8"));
}

function buildCatalogue() {
  // shelfOnly modules (e.g. Companion) live on the Module Shelf only: no homepage card or detail page.
  // Retired modules keep their detail page (old links) but drop out of the homepage lists.
  const sorted = [...loadModules()]
    .filter((m) => !m.shelfOnly && m.status !== "retired")
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  const shippable = sorted.filter((m) => m.status !== "roadmap");
  return {
    hero: shippable.slice(0, 3),
    compact: shippable.slice(3),
    roadmap: sorted.filter((m) => m.status === "roadmap"),
  };
}

function buildPackShowcase() {
  const packs = JSON.parse(readFileSync(packsPath, "utf8"));
  const landing = packs
    .filter((pack) => pack.landing)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  return {
    landing,
    total: packs.length,
    moreCount: Math.max(0, packs.length - landing.length),
  };
}

/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
export default function (eleventyConfig) {
  eleventyConfig.addPlugin(rssPlugin);

  eleventyConfig.addGlobalData("catalogue", buildCatalogue);
  eleventyConfig.addGlobalData("packShowcase", buildPackShowcase);

  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/img");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/macros");
  eleventyConfig.addPassthroughCopy("src/data");
  eleventyConfig.addPassthroughCopy("src/CNAME");
  eleventyConfig.addPassthroughCopy("src/robots.txt");
  eleventyConfig.addPassthroughCopy({ "src/favicon.ico": "favicon.ico" });


  /**
   * Dev log teaser safeguard (see docs/devlog-teasers.md).
   * - Future-dated posts are left out until their time. DEVLOG_PREVIEW=1 builds them.
   * - Dev logs dated on/after 20 Oct 2026 (or not tier Public) only publish when
   *   marked `teaser: true`. Anything else, e.g. a full copy dropped in by the
   *   Patreon sync, is left out of the whole build: page, lists, feed, sitemap.
   * - A teaser still holding a "[Fill in" placeholder is left out too, with a warning.
   * - A teaser body over TEASER_MAX_CHARS fails the build: it's probably pasted full text.
   */
  const preview = process.env.DEVLOG_PREVIEW === "1";
  eleventyConfig.addPreprocessor("devlog-teasers", "md", (data, content) => {
    if (!data.page?.inputPath?.includes("/posts/")) return;
    const file = data.page.inputPath;
    if (isScheduled(data) && !preview) {
      console.log(`[devlog] ${file}: dated in the future, left out of this build.`);
      return false;
    }
    if (!isGatedDevlog(data)) return;
    if (data.teaser !== true) {
      console.warn(
        `[devlog] ${file}: members-only dev log without "teaser: true", left out of the build. ` +
          "Replace the body with a short teaser (docs/devlog-teasers.md).",
      );
      return false;
    }
    const length = teaserTextLength(content);
    if (length > TEASER_MAX_CHARS) {
      throw new Error(
        `[devlog] ${file}: teaser is ${length} characters (limit ${TEASER_MAX_CHARS}). ` +
          "Is this the full members-only text? Keep it to 2–4 sentences.",
      );
    }
    if (!data.description || !data.patreonUrl) {
      throw new Error(`[devlog] ${file}: a teaser needs "description" and "patreonUrl".`);
    }
    const unfilled = [
      content,
      data.title,
      data.description,
      data.patreonUrl,
      data.seoTitle,
      ...(Array.isArray(data.moduleIds) ? data.moduleIds : []),
      ...(Array.isArray(data.keywords) ? data.keywords : []),
    ].some((v) => typeof v === "string" && v.includes(FILL_IN));
    if (unfilled) {
      if (preview) {
        console.warn(`[devlog] ${file}: still has a "${FILL_IN}: …]" placeholder (shown in preview).`);
        return;
      }
      // Kept out rather than failing, so other site changes still deploy.
      console.warn(
        `[devlog] ${file}: still has a "${FILL_IN}: …]" placeholder, left out of the build until it's filled in.`,
      );
      return false;
    }
  });

  eleventyConfig.addCollection("posts", (collectionApi) =>
    collectionApi
      .getFilteredByGlob("src/posts/*.md")
      .sort((a, b) => b.date - a.date),
  );

  eleventyConfig.addFilter("jsonEncode", (value) => JSON.stringify(value));

  /** Display path for an /img/ PNG/JPG: its .webp copy when one exists. */
  eleventyConfig.addFilter("webp", webp);

  eleventyConfig.addFilter("htmlDateString", (value) => {
    if (!value) return "";
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 10);
  });

  eleventyConfig.addFilter("pathBasename", (p) => {
    if (!p || typeof p !== "string") return "";
    const s = p.replace(/\\/g, "/");
    const i = s.lastIndexOf("/");
    return i === -1 ? s : s.slice(i + 1);
  });

  eleventyConfig.addWatchTarget("src/_data/modules.json");

  eleventyConfig.addCollection("moduleDetails", () =>
    loadModules().filter((m) => m.detail),
  );

  eleventyConfig.addFilter("moduleById", (id) =>
    loadModules().find((m) => m.id === id),
  );

  eleventyConfig.addFilter("systemLabel", (id) => {
    const labels = {
      dnd5e: "D&D 5e",
      pf2e: "Pathfinder 2e",
      daggerheart: "Daggerheart",
      sfrpg: "Starfinder 1e",
      sf2e: "Starfinder 2e",
      generic: "Other systems",
      pf1: "Pathfinder 1e",
      D35E: "D&D 3.5e",
      ose: "Old-School Essentials",
      CoC7: "Call of Cthulhu 7e",
      swade: "Savage Worlds",
      wfrp4e: "Warhammer Fantasy 4e",
      "cyberpunk-red-core": "Cyberpunk RED",
      "blades-in-the-dark": "Blades in the Dark",
    };
    return labels[id] || id;
  });

  /**
   * Devlog / landing list thumb. Prefer cover-list.jpg beside a local cover.*;
   * keep full ogImage for post hero and social tags.
   */
  eleventyConfig.addFilter("blogListImage", (ogImage) => {
    if (!ogImage || typeof ogImage !== "string") return ogImage;
    if (!ogImage.startsWith("/img/blog/")) return ogImage;
    const m = ogImage.match(/^(.*\/)cover\.(png|jpe?g|webp|gif)$/i);
    if (!m) return ogImage;
    const listPath = `${m[1]}cover-list.jpg`;
    const disk = path.join(__dirname, "src", listPath.replace(/^\//, "").replace(/\//g, path.sep));
    return existsSync(disk) ? listPath : ogImage;
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      layouts: "_layouts",
      data: "_data",
    },
    templateFormats: ["md", "njk", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
