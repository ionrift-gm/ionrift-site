import rssPlugin from "@11ty/eleventy-plugin-rss";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import modules from "./src/_data/modules.json" with { type: "json" };

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packsPath = path.join(__dirname, "src", "_data", "packs.json");

function buildCatalogue() {
  const sorted = [...modules].sort((a, b) => (a.order || 0) - (b.order || 0));
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
  eleventyConfig.addPassthroughCopy("src/data");
  eleventyConfig.addPassthroughCopy("src/audio");
  eleventyConfig.addPassthroughCopy("src/CNAME");
  eleventyConfig.addPassthroughCopy("src/robots.txt");

  eleventyConfig.addCollection("posts", (collectionApi) =>
    collectionApi
      .getFilteredByGlob("src/posts/*.md")
      .sort((a, b) => b.date - a.date),
  );

  eleventyConfig.addFilter("jsonEncode", (value) => JSON.stringify(value));

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

  eleventyConfig.addCollection("moduleDetails", () =>
    modules.filter((m) => m.detail),
  );

  eleventyConfig.addFilter("systemLabel", (id) => {
    const labels = {
      dnd5e: "D&D 5e",
      pf2e: "Pathfinder 2e",
      daggerheart: "Daggerheart",
    };
    return labels[id] || id;
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
