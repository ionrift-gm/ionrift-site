/**
 * Dev log teaser rules (decided 20 Oct 2026).
 *
 * Patreon dev logs are for free and paid members only. The site keeps a short
 * public teaser of each one and links to Patreon for the full text. Older
 * public dev logs (dated before TEASER_CUTOFF) stay exactly as they are.
 *
 * See docs/devlog-teasers.md for the checklist.
 */

/** Dev log posts dated on or after this (the day of the decision) are teaser-only. */
export const TEASER_CUTOFF = new Date("2026-10-20T00:00:00Z");

/** A teaser body longer than this fails the build (catches pasted full text). */
export const TEASER_MAX_CHARS = 1200;

/** Marker for anything still to be filled in by hand. */
export const FILL_IN = "[Fill in";

function postDate(data) {
  const raw = data?.page?.date ?? data?.date;
  if (!raw) return null;
  const d = raw instanceof Date ? raw : new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** True for posts that should only ever show a teaser on the site. */
export function isGatedDevlog(data) {
  if (!data || data.type !== "devlog") return false;
  if (data.teaser === true) return true;
  // A human can mark a later post as fully public (e.g. a public release post).
  if (data.fullText === true) return false;
  const d = postDate(data);
  if (d && d >= TEASER_CUTOFF) return true;
  // Anything the sync marks as not public is gated too, whatever its date.
  if (data.tier && String(data.tier).toLowerCase() !== "public") return true;
  return false;
}

/** Future-dated posts stay out of the build until their time (unless previewing). */
export function isScheduled(data, now = new Date()) {
  const d = postDate(data);
  return Boolean(d && d > now);
}

/** Visible text of a markdown teaser body, for the length check. */
export function teaserTextLength(content) {
  return String(content || "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#*_>`-]/g, "")
    .replace(/\s+/g, " ")
    .trim().length;
}
