/**
 * Analytics consent banner. No dependencies.
 * Choice lives in localStorage as `ionrift_consent` = { v, analytics: "granted" | "denied", ts }.
 * GA itself is loaded by window.ionriftLoadGA (see _includes/consent-head.njk).
 */
(function () {
  var KEY = "ionrift_consent";
  var VERSION = 1;
  var banner = document.getElementById("consent-banner");
  if (!banner) return;

  var statusEl = banner.querySelector("[data-consent-status]");
  var returnFocusTo = null;

  function save(value) {
    try {
      localStorage.setItem(KEY, JSON.stringify({ v: VERSION, analytics: value, ts: new Date().toISOString() }));
    } catch (e) {
      /* private mode or storage full: the choice still applies to this page */
    }
    window.ionriftConsent = value;
  }

  /** Remove GA cookies (_ga, _ga_<id>, plus legacy _gid/_gat) on this host and its parent domains. */
  function clearGaCookies() {
    var names = document.cookie
      .split(";")
      .map(function (c) { return c.split("=")[0].trim(); })
      .filter(function (n) { return n === "_ga" || n.indexOf("_ga_") === 0 || n === "_gid" || n.indexOf("_gat") === 0; });
    if (!names.length) return;
    var parts = location.hostname.split(".");
    var domains = [""];
    for (var i = 0; i < parts.length - 1; i++) {
      var d = parts.slice(i).join(".");
      domains.push(d, "." + d);
    }
    names.forEach(function (name) {
      domains.forEach(function (domain) {
        document.cookie = name + "=; Max-Age=0; path=/" + (domain ? "; domain=" + domain : "") + "; SameSite=Lax";
      });
    });
  }

  function describeCurrent() {
    if (!statusEl) return;
    if (window.ionriftConsent === "granted") statusEl.textContent = "Right now, analytics is on.";
    else if (window.ionriftConsent === "denied") statusEl.textContent = "Right now, analytics is off.";
    else statusEl.textContent = "";
  }

  function show(moveFocus) {
    describeCurrent();
    banner.hidden = false;
    document.documentElement.classList.add("has-consent-banner");
    if (moveFocus) {
      returnFocusTo = document.activeElement;
      banner.focus();
    }
  }

  function hide() {
    banner.hidden = true;
    document.documentElement.classList.remove("has-consent-banner");
    if (returnFocusTo && typeof returnFocusTo.focus === "function") returnFocusTo.focus();
    returnFocusTo = null;
  }

  function accept() {
    save("granted");
    hide();
    if (typeof window.ionriftLoadGA === "function") window.ionriftLoadGA();
  }

  function decline() {
    var wasLoaded = window.ionriftGaLoaded === true;
    save("denied");
    if (window.ionriftGaId) window["ga-disable-" + window.ionriftGaId] = true;
    if (typeof window.gtag === "function") window.gtag("consent", "update", { analytics_storage: "denied" });
    clearGaCookies();
    if (wasLoaded) {
      // Reload so the GA script is gone from this page entirely.
      location.reload();
      return;
    }
    hide();
  }

  banner.querySelector("[data-consent-accept]").addEventListener("click", accept);
  banner.querySelector("[data-consent-decline]").addEventListener("click", decline);

  document.addEventListener("click", function (event) {
    var opener = event.target.closest && event.target.closest("[data-consent-open]");
    if (!opener) return;
    event.preventDefault();
    show(true);
  });

  // No saved choice yet. Global Privacy Control counts as a no.
  // Cookie settings can still turn analytics on later, and that choice sticks.
  if (window.ionriftConsent === "unset" && navigator.globalPrivacyControl === true) {
    save("denied");
  }

  // A "denied" choice also clears cookies left from an earlier visit.
  if (window.ionriftConsent === "denied") clearGaCookies();

  if (window.ionriftConsent === "unset") show(false);
})();
