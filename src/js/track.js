/**
 * GA4 custom events for ionrift.cloud.
 *
 * track() does nothing unless the visitor accepted analytics (window.ionriftConsent,
 * set by _includes/consent-head.njk and js/consent.js). GA itself only loads after
 * that choice, so nothing here can reach Google before consent.
 *
 * Only the params in ALLOWED_PARAMS are ever sent. No tier, Patreon id, account id,
 * credits, email or name, and no user_id or user properties.
 */

const ALLOWED_PARAMS = new Set([
  "link_location",
  "link_url",
  "module_id",
  "pack_id",
  "access",
  "method",
  "pack_count",
]);

/** Site module id ("respite") from a site id or a Foundry package id ("ionrift-respite"). */
export function siteModuleId(id) {
  if (!id) return undefined;
  return String(id).replace(/^ionrift-/, "") || undefined;
}

/** Strip the query string and fragment so tokens or campaign tags never reach GA. */
export function cleanUrl(href) {
  return String(href || "").split(/[?#]/)[0];
}

export function track(name, params = {}) {
  if (window.ionriftConsent !== "granted" || typeof window.gtag !== "function") return;
  const clean = {};
  for (const [key, value] of Object.entries(params || {})) {
    if (!ALLOWED_PARAMS.has(key) || value === undefined || value === null || value === "") continue;
    clean[key] = key === "module_id" ? siteModuleId(value) : value;
  }
  window.gtag("event", name, clean);
}

const RULES = [
  [/patreon\.com\/(?!oauth2)/i, "click_patreon"],
  [/discord\.(gg|com)/i, "click_discord"],
  [/foundryvtt\.com\/packages\//i, "click_foundry_listing"],
  [/github\.com/i, "click_github"],
];

/** link_location from the page path, used when no data-track-location is set. */
function locFromPath(pathname) {
  if (pathname.startsWith("/modules/")) return "module_page";
  if (pathname.startsWith("/module-shelf/")) return "module_shelf";
  if (pathname.startsWith("/overlay-shelf/")) return "overlay_shelf";
  if (pathname.startsWith("/blog/")) return "post";
  return "other";
}

function onClick(event) {
  const a = event.target?.closest?.("a[href]");
  if (!a) return;
  const rule = RULES.find(([re]) => re.test(a.href));
  if (!rule) return;
  const loc = a.closest("[data-track-location]")?.dataset.trackLocation || locFromPath(location.pathname);
  const mod = a.closest("[data-module-id]")?.dataset.moduleId;
  const params = { link_location: loc, link_url: cleanUrl(a.href) };
  if (mod && rule[1] !== "click_discord") params.module_id = mod;
  track(rule[1], params);
}

// One delegated listener, so links the shelves render later are caught too.
// Guarded so importing this module from a shelf script never adds a second one.
if (!window.__ionriftTrackBound) {
  window.__ionriftTrackBound = true;
  document.addEventListener("click", onClick, { capture: true });
}
