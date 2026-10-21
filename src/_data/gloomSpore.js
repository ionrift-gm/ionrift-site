/**
 * Gloom & Spore: Respite events pack. DRAFT, NOT LIVE.
 *
 * "The Deep" is only the in-game terrain name. Product surfaces say "Gloom & Spore".
 *
 * Switches (each is one line):
 *   PAGE_LIVE  -> /overlays/gloom-spore/ landing page, its card on /overlays/,
 *                 its sitemap entry, and the cover images in the build.
 *   SHELF_LIVE -> Overlay Shelf name, art and note for the overlay id below.
 *                 Only matters once the release run adds the pack to the
 *                 registry, packs.js and /packs/status (planned for 1 Dec).
 *
 * Local preview without switching anything on:
 *   IONRIFT_PREVIEW_DRAFTS=1 npm start
 * Preview builds render the page with noindex and keep it out of the sitemap.
 * Production builds (no env var, both switches false) emit nothing for this pack.
 */
const PAGE_LIVE = false;
const SHELF_LIVE = false;

const preview = process.env.IONRIFT_PREVIEW_DRAFTS === "1";
const pageOn = PAGE_LIVE || preview;
const shelfOn = SHELF_LIVE || preview;

/** Overlay id from the workshop spec (overlays/respite-the-deep-overlay.json, 21 Oct). */
const OVERLAY_ID = "respite-the-deep-overlay";

const card = {
  id: "gloom-spore",
  catalogKeys: [OVERLAY_ID],
  name: "Gloom & Spore",
  tier: "Initiate",
  tierLabel: "Initiate",
  tierBadge: "initiate",
  modules: ["Respite"],
  accent: "#E4CFAA",
  iconAccent: "#E4CFAA",
  // DRAFT copy for the owner: factual only.
  description: "8 events and the disaster The Spore Tide for the Respite terrain The Deep.",
  category: "events",
  ai: "art",
  image: "/img/packs/gloom-spore.webp",
  href: "/overlays/gloom-spore/",
  preview: false,
  order: 70,
};

export default {
  PAGE_LIVE,
  SHELF_LIVE,
  preview,
  pageOn,
  shelfOn,
  /** Cover files ship in the build only when something needs them. */
  assetsOn: pageOn || shelfOn,
  overlayId: OVERLAY_ID,
  /** Extra /overlays/ cards: empty unless the page is on. */
  cards: pageOn ? [card] : [],
  card,
  page: {
    url: "/overlays/gloom-spore/",
    eventCount: 8,
    disaster: "The Spore Tide",
    terrain: "The Deep",
    /** Hero background: crop of cover/background (AI-generated). */
    hero: "/img/packs/gloom-spore-bg.webp",
    /** Social preview: the 16:9 cover (AI-generated). */
    ogImage: "/img/packs/gloom-spore-og.jpg",
  },
  /** Overlay Shelf entries, merged into overlayShelfArt only when SHELF_LIVE (or preview). */
  shelf: shelfOn
    ? {
        [OVERLAY_ID]: {
          image: "/img/packs/thumbs/gloom-spore.jpg",
          name: "Gloom & Spore",
          // DRAFT copy for the owner.
          note: "Also update Respite Core art to get this pack's terrain images.",
        },
      }
    : {},
  /** Cover image files in src/img that stay out of the build until assetsOn. */
  assetFiles: [
    "packs/gloom-spore.webp",
    "packs/gloom-spore-bg.webp",
    "packs/gloom-spore-og.jpg",
    "packs/thumbs/gloom-spore.jpg",
  ],
};
