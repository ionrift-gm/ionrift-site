/**
 * Keeps the Gloom & Spore landing page out of the build until it is switched on.
 * Switch: PAGE_LIVE in src/_data/gloomSpore.js.
 * Preview: IONRIFT_PREVIEW_DRAFTS=1 renders it with noindex, outside collections and the sitemap.
 */
import gloomSpore from "../_data/gloomSpore.js";

export default {
  permalink: gloomSpore.pageOn ? gloomSpore.page.url : false,
  eleventyExcludeFromCollections: !gloomSpore.PAGE_LIVE,
  noindex: !gloomSpore.PAGE_LIVE,
  draft: !gloomSpore.PAGE_LIVE,
};
