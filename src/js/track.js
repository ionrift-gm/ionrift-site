/**
 * GA4 custom events for ionrift.cloud.
 *
 * track() does nothing unless the visitor accepted analytics (window.ionriftConsent,
 * set by _includes/consent-head.njk and js/consent.js). GA itself only loads after
 * that choice, so nothing here can reach Google before consent.
 *
 * Only the params in ALLOWED_PARAMS are ever sent, and none of them is a URL.
 * No visitor tier, Patreon id, account id, credits, email or name, and no
 * user_id or user properties. `access` is the item's own gate (public, free,
 * initiate, acolyte, weaver, artificer, entitled), never the visitor's tier.
 *
 * Markup hooks:
 *   data-track-location  link_location for everything inside it
 *   data-module-id       module_id for everything inside it
 *   data-pack-id         pack_id for everything inside it
 *   data-track-event     explicit event for this element (skips the href rules)
 *   data-track-method    method for data-track-event
 *   data-track-access    access for data-track-event (else nearest data-access)
 *   data-track-skip      a page script already calls track() for this element
 *
 * Inbound campaign links (reference only, GA reads them from the landing URL,
 * so nothing here strips or rewrites query strings on the page). All lowercase:
 *   utm_source=youtube|patreon|discord
 *   utm_medium=video-description|post|pinned|welcome|about
 *   utm_campaign=<module or post slug>
 *
 * Internal traffic: ?internal=1 on any page sets localStorage ionrift_internal,
 * ?internal=0 clears it (see consent-head.njk). While set, GA config and every
 * event carry traffic_type: "internal" for the GA Internal Traffic filter.
 */

const ALLOWED_PARAMS = new Set(["link_location", "module_id", "pack_id", "access", "method"]);

/** Site module id ("respite") from a site id or a Foundry package id ("ionrift-respite"). */
export function siteModuleId(id) {
  if (!id) return undefined;
  return String(id).replace(/^ionrift-/, "") || undefined;
}

export function track(name, params = {}) {
  if (window.ionriftConsent !== "granted" || typeof window.gtag !== "function") return;
  const clean = {};
  for (const [key, value] of Object.entries(params || {})) {
    if (!ALLOWED_PARAMS.has(key) || value === undefined || value === null || value === "") continue;
    const v = key === "module_id" ? siteModuleId(value) : String(value);
    // Belt and braces: never send anything that looks like a URL.
    if (!v || /[/:?#]/.test(v)) continue;
    clean[key] = v;
  }
  if (window.ionriftInternal === true) clean.traffic_type = "internal";
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
  if (pathname === "/" || pathname === "/index.html") return "home";
  if (pathname.startsWith("/modules/")) return "module_page";
  if (pathname.startsWith("/module-shelf/")) return "module_shelf";
  if (pathname.startsWith("/overlay-shelf/")) return "overlay_shelf";
  if (pathname.startsWith("/overlays/")) return "pack_catalogue";
  if (/^\/blog\/(page\/\d+\/)?$/.test(pathname)) return "blog_list";
  if (pathname.startsWith("/blog/")) return "post";
  if (pathname.startsWith("/privacy/")) return "privacy";
  return "other";
}

function context(el) {
  return {
    link_location: el.closest("[data-track-location]")?.dataset.trackLocation || locFromPath(location.pathname),
    module_id: el.closest("[data-module-id]")?.dataset.moduleId,
    pack_id: el.closest("[data-pack-id]")?.dataset.packId,
  };
}

function onClick(event) {
  const target = event.target;
  if (!target?.closest) return;
  if (target.closest("[data-track-skip]")) return;

  const explicit = target.closest("[data-track-event]");
  if (explicit) {
    const ctx = context(explicit);
    track(explicit.dataset.trackEvent, {
      ...ctx,
      method: explicit.dataset.trackMethod,
      access: explicit.dataset.trackAccess || explicit.closest("[data-access]")?.dataset.access,
    });
    return;
  }

  const a = target.closest("a[href]");
  if (!a) return;
  const rule = RULES.find(([re]) => re.test(a.href));
  if (!rule) return;
  const ctx = context(a);
  const params = { link_location: ctx.link_location };
  if (ctx.module_id && rule[1] !== "click_discord") params.module_id = ctx.module_id;
  track(rule[1], params);
}

// One delegated listener, so links the shelves render later are caught too.
// Guarded so importing this module from a shelf script never adds a second one.
if (!window.__ionriftTrackBound) {
  window.__ionriftTrackBound = true;
  document.addEventListener("click", onClick, { capture: true });
}
