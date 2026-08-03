/**
 * Overlay Shelf: tile grid by module, open + entitled downloads, Patreon login.
 */

import {
  isSelectablePack,
  partitionShelfOverlays,
  defaultSelectedIds,
  applySelectAllData,
  dataSelectionState,
  matchOverlayBundle,
} from "./overlay-shelf-selection.js";
import {
  getSession,
  connectPatreon,
  clearToken,
  downloadEntitledPack,
  downloadOverlayBundle,
  onSessionChange,
} from "./overlay-shelf-auth.js";

const API_BASE = "https://api.ionrift.cloud";
const PUBLIC_LATEST = (id) => `${API_BASE}/packs/public/${id}/latest`;
const PATREON_HOME = "https://www.patreon.com/c/Ionrift";

/** Local Eleventy builds serve workspace registry+catalog; production uses the API. */
function statusUrl() {
  const host = typeof location !== "undefined" ? location.hostname : "";
  if (host === "localhost" || host === "127.0.0.1") {
    return "/overlay-shelf/status.json";
  }
  return `${API_BASE}/packs/status`;
}

/** Overlay ids hidden on the Shelf until a real GCS pack exists. */
const SHELF_OVERLAY_HIDE = new Set(["cursewright-core-overlay"]);

const MODULE_LABELS = {
  "ionrift-respite": "Respite",
  "ionrift-quartermaster": "Quartermaster",
  "ionrift-resonance": "Resonance",
  "ionrift-cursewright": "Cursewright",
};

/** @type {Record<string, { image?: string|null, name?: string|null }>} */
let artMap = {};

/** @type {Record<string, { label?: string|null, icon?: string|null, accent?: string|null }>} */
let moduleMap = {};

/** @type {Set<string>} */
const selectedIds = new Set();

/** @type {Set<string>|null} null = use defaults on first paint */
let openModuleIds = null;

/** Collapsed-by-default: overlays not offered for this session. */
let notOfferedOpen = false;

let statusLoadGeneration = 0;

function readJsonMap(id) {
  const el = document.getElementById(id);
  if (!el) return {};
  try {
    return JSON.parse(el.textContent || "{}");
  } catch (err) {
    console.warn(`Overlay Shelf: ${id} parse failed`, err);
    return {};
  }
}

function readArtMap() {
  return readJsonMap("shelf-art-map");
}

function readModuleMap() {
  return readJsonMap("shelf-module-map");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function moduleMeta(moduleId) {
  return moduleMap[moduleId] || {};
}

function moduleLabel(moduleId) {
  return moduleMeta(moduleId).label || MODULE_LABELS[moduleId] || moduleId || "Other";
}

function moduleIconHtml(moduleId) {
  const icon = moduleMeta(moduleId).icon;
  if (!icon) return "";
  return `<img class="shelf-module-icon" src="${escapeHtml(icon)}" alt="" width="28" height="28" loading="lazy">`;
}

function artFor(id) {
  return artMap[id] || {};
}

function displayName(row) {
  const art = artFor(row.id);
  if (art.name) return art.name;
  if (row.label && row.label.length < 48) return row.label;
  if (row.packLabel) return row.packLabel;
  return row.id;
}

function visibleOverlays(overlays) {
  return (overlays || []).filter((row) => !SHELF_OVERLAY_HIDE.has(row.id));
}

function isPrimaryCorePack(row) {
  const id = String(row.id || "");
  const sublayer = String(row.sublayer || "");
  return sublayer === "core" || /(?:^|-)core-overlay$/.test(id);
}

function comparePackRows(a, b) {
  const coreA = isPrimaryCorePack(a) ? 0 : 1;
  const coreB = isPrimaryCorePack(b) ? 0 : 1;
  if (coreA !== coreB) return coreA - coreB;
  const compA = a.optionalCompanion ? 1 : 0;
  const compB = b.optionalCompanion ? 1 : 0;
  if (compA !== compB) return compA - compB;
  return displayName(a).localeCompare(displayName(b), undefined, { sensitivity: "base" });
}

function groupByModule(overlays) {
  const groups = new Map();
  for (const row of overlays) {
    const key = row.moduleId || "other";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }
  for (const rows of groups.values()) {
    rows.sort(comparePackRows);
  }
  const order = ["ionrift-respite", "ionrift-quartermaster", "ionrift-resonance", "ionrift-cursewright"];
  return [...groups.entries()].sort((a, b) => {
    const ia = order.indexOf(a[0]);
    const ib = order.indexOf(b[0]);
    const ra = ia === -1 ? 99 : ia;
    const rb = ib === -1 ? 99 : ib;
    if (ra !== rb) return ra - rb;
    return String(a[0]).localeCompare(String(b[0]));
  });
}

function captureOpenModules() {
  const open = new Set();
  document.querySelectorAll("details.shelf-module-block[data-module-id][open]").forEach((el) => {
    open.add(el.getAttribute("data-module-id"));
  });
  return open;
}

function defaultOpenModules(groups) {
  const open = new Set();
  if (!groups.length) return open;
  open.add(groups[0][0]);
  for (const [moduleId, rows] of groups) {
    if (rows.length >= 3) open.add(moduleId);
  }
  return open;
}

function moduleSelectionSummary(rows) {
  const selectable = rows.filter((r) => isSelectablePack(r));
  const selected = selectable.filter((r) => selectedIds.has(r.id)).length;
  const total = rows.length;
  if (selectable.length) {
    return `${selected} selected · ${total} pack${total === 1 ? "" : "s"}`;
  }
  return `${total} pack${total === 1 ? "" : "s"}`;
}

function tierLabel(row) {
  if (row.downloadMode === "public" || row.publicDownload) return "Open";
  if (row.audience === "member" || (!row.tier || /^free$/i.test(String(row.tier)))) {
    return "Member";
  }
  const tier = String(row.tier || "").trim();
  return tier || "Patreon";
}

function generativeBadge(row) {
  const kind = row.generativeKind === "audio"
    ? "audio"
    : (row.generative || row.generativeKind === "art" ? "art" : null);
  if (!kind) return "";
  const label = kind === "audio" ? "Generative audio" : "Generative art";
  return `<span class="shelf-tile-badge shelf-tile-badge--generative">${escapeHtml(label)}</span>`;
}

function renderOverlayTile(row) {
  const selectable = isSelectablePack(row);
  const selected = selectable && selectedIds.has(row.id);
  const title = displayName(row);
  const art = artFor(row.id);
  const metaBits = [tierLabel(row), `v${row.latest}`];

  let action = "";
  if (row.downloadMode === "public" || (row.publicDownload && row.canDownload !== false)) {
    action = `<a class="btn btn-secondary btn-sm" href="${escapeHtml(PUBLIC_LATEST(row.id))}" rel="noopener">Download</a>`;
  } else if (row.downloadMode === "entitled" || (row.canDownload && !row.publicDownload)) {
    action = `<button type="button" class="btn btn-secondary btn-sm" data-entitled-download="${escapeHtml(row.id)}">Download</button>`;
  }

  const select = selectable
    ? `<label class="shelf-tile-select">
        <input type="checkbox" data-select-id="${escapeHtml(row.id)}" ${selected ? "checked" : ""}>
        <span class="visually-hidden">Select ${escapeHtml(title)}</span>
      </label>`
    : "";

  const imgSrc = art.image || "";
  const media = imgSrc
    ? `<div class="shelf-tile-media"><img src="${escapeHtml(imgSrc)}" alt="" loading="lazy" width="72" height="72"></div>`
    : `<div class="shelf-tile-media shelf-tile-media--empty" aria-hidden="true"></div>`;

  const tileClass = [
    "shelf-tile",
    selected ? "shelf-tile--selected" : "",
  ].filter(Boolean).join(" ");

  const pathTitle = row.installPath ? ` title="${escapeHtml(row.installPath)}"` : "";
  const badge = generativeBadge(row);

  return `
    <article class="${tileClass}" data-pack-id="${escapeHtml(row.id)}"${pathTitle}>
      ${select}
      ${media}
      <div class="shelf-tile-body">
        <h4 class="shelf-tile-title">${escapeHtml(title)}</h4>
        <p class="shelf-tile-meta"><span>${escapeHtml(metaBits.join(" · "))}</span>${badge}</p>
        ${action}
      </div>
    </article>
  `;
}

/** Read-only tile for packs not offered in this session. */
function renderUnavailableTile(row) {
  const title = displayName(row);
  const art = artFor(row.id);
  const required = tierLabel(row);
  const metaBits = [`Requires ${required}`, `v${row.latest}`];
  const badge = generativeBadge(row);
  const imgSrc = art.image || "";
  const media = imgSrc
    ? `<div class="shelf-tile-media"><img src="${escapeHtml(imgSrc)}" alt="" loading="lazy" width="72" height="72"></div>`
    : `<div class="shelf-tile-media shelf-tile-media--empty" aria-hidden="true"></div>`;
  const moduleBit = row.moduleId
    ? `<span class="shelf-tile-module">${escapeHtml(moduleLabel(row.moduleId))}</span>`
    : "";

  return `
    <article class="shelf-tile shelf-tile--unavailable" data-pack-id="${escapeHtml(row.id)}" aria-disabled="true">
      ${media}
      <div class="shelf-tile-body">
        <h4 class="shelf-tile-title">${escapeHtml(title)}</h4>
        <p class="shelf-tile-meta"><span>${escapeHtml(metaBits.join(" · "))}</span>${badge}${moduleBit}</p>
      </div>
    </article>
  `;
}

function notOfferedNote() {
  const session = getSession();
  if (session.authenticated) {
    return `Connected as ${session.tier || "Free"}. Packs listed here need a higher Patreon tier than this account currently has.`;
  }
  return "These packs need a Patreon membership tier. Connect Patreon above to refresh the list for your account.";
}

function captureNotOfferedOpen() {
  const el = document.getElementById("shelf-not-offered");
  if (el instanceof HTMLDetailsElement) notOfferedOpen = el.open;
}

function renderModuleBlocks(rows) {
  const groups = groupByModule(rows);
  if (openModuleIds === null) {
    openModuleIds = defaultOpenModules(groups);
  }
  return groups.map(([moduleId, moduleRows]) => {
    const isOpen = openModuleIds.has(moduleId);
    const accent = moduleMeta(moduleId).accent;
    const style = accent ? ` style="--shelf-module-accent: ${escapeHtml(accent)}"` : "";
    return `
    <details class="shelf-module-block" data-module-id="${escapeHtml(moduleId)}"${isOpen ? " open" : ""}${style}>
      <summary class="shelf-module-summary">
        ${moduleIconHtml(moduleId)}
        <span class="shelf-module-summary-text">
          <span class="shelf-module-label">${escapeHtml(moduleLabel(moduleId))}</span>
          <span class="shelf-module-count">${escapeHtml(moduleSelectionSummary(moduleRows))}</span>
        </span>
      </summary>
      <div class="shelf-tile-grid">
        ${moduleRows.map(renderOverlayTile).join("")}
      </div>
    </details>
  `;
  }).join("");
}

function renderUnavailableSection(unavailable) {
  if (!unavailable.length) return "";
  const sorted = [...unavailable].sort((a, b) => {
    const ma = moduleLabel(a.moduleId).localeCompare(moduleLabel(b.moduleId), undefined, { sensitivity: "base" });
    if (ma !== 0) return ma;
    return displayName(a).localeCompare(displayName(b), undefined, { sensitivity: "base" });
  });
  const n = sorted.length;
  return `
    <details class="shelf-not-offered" id="shelf-not-offered"${notOfferedOpen ? " open" : ""}>
      <summary class="shelf-not-offered-summary">
        <span class="shelf-not-offered-title">Other overlays</span>
        <span class="shelf-not-offered-count">${n} pack${n === 1 ? "" : "s"}</span>
      </summary>
      <p class="shelf-note shelf-not-offered-note">${escapeHtml(notOfferedNote())}</p>
      <div class="shelf-tile-grid shelf-tile-grid--unavailable">
        ${sorted.map(renderUnavailableTile).join("")}
      </div>
    </details>
  `;
}

function renderOverlayGroups(overlays) {
  const visible = visibleOverlays(overlays);
  if (!visible.length) {
    return `<p class="shelf-empty">No overlays in the status listing yet.</p>`;
  }

  const { available, unavailable } = partitionShelfOverlays(visible);
  const main = available.length
    ? renderModuleBlocks(available)
    : `<p class="shelf-empty">No overlays available for download in this session.</p>`;

  return `${main}${renderUnavailableSection(unavailable)}`;
}

function renderModules(modules) {
  const HIDDEN_MODULE_IDS = new Set(["ionrift-cartographer"]);
  const rows = (modules || []).filter((row) => !HIDDEN_MODULE_IDS.has(row.id));
  if (!rows.length) {
    return `<a class="btn btn-secondary btn-sm" href="${PATREON_HOME}" target="_blank" rel="noopener">Patreon modules</a>`;
  }
  return rows.map((row) => {
    const href = row.browserHandoff || PATREON_HOME;
    return `<a class="btn btn-secondary btn-sm" href="${escapeHtml(href)}" target="_blank" rel="noopener">${escapeHtml(row.id)}</a>`;
  }).join(" ");
}

function syncSelectionFromDom() {
  selectedIds.clear();
  document.querySelectorAll("[data-select-id]:checked").forEach((el) => {
    selectedIds.add(el.getAttribute("data-select-id"));
  });
  updateSelectedHint();
}

function updateSelectedHint() {
  const hint = document.getElementById("download-selected-hint");
  const btn = document.getElementById("download-selected-btn");
  const n = selectedIds.size;
  const bundles = window.__ionriftStatus?.bundles || [];
  const hit = n ? matchOverlayBundle(selectedIds, bundles) : null;
  if (hint) {
    if (!n) {
      hint.textContent = "Select one or more packs, then Download selected, or use Download on a single tile.";
    } else if (hit) {
      hint.textContent = `${n} pack${n === 1 ? "" : "s"} selected. Download selected will use the cached ${hit.label} zip.`;
    } else {
      hint.textContent = `${n} pack${n === 1 ? "" : "s"} selected. Download selected starts each zip in turn.`;
    }
  }
  if (btn) {
    btn.disabled = n === 0;
    btn.textContent = n ? `Download selected overlays (${n})` : "Download selected overlays";
  }
  syncSelectAllDataToggle();
}

function syncSelectAllDataToggle() {
  const toggle = document.getElementById("select-all-data-toggle");
  if (!(toggle instanceof HTMLInputElement)) return;
  const overlays = visibleOverlays(window.__ionriftStatus?.overlays || []);
  const state = dataSelectionState(selectedIds, overlays);
  toggle.indeterminate = state === "some";
  toggle.checked = state === "all";
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function triggerPublicDownload(packId) {
  const a = document.createElement("a");
  a.href = PUBLIC_LATEST(packId);
  a.rel = "noopener";
  a.download = "";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

async function downloadSelectedOverlays() {
  const overlays = visibleOverlays(window.__ionriftStatus?.overlays || []);
  const byId = new Map(overlays.map((row) => [row.id, row]));
  const ids = [...selectedIds].filter((id) => {
    const row = byId.get(id);
    return row && isSelectablePack(row);
  });
  if (!ids.length) return;

  const btn = document.getElementById("download-selected-btn");
  const hint = document.getElementById("download-selected-hint");
  if (btn instanceof HTMLButtonElement) {
    btn.disabled = true;
    btn.textContent = "Preparing download...";
  }

  const bundleHit = matchOverlayBundle(ids, window.__ionriftStatus?.bundles || []);
  if (bundleHit) {
    try {
      if (btn instanceof HTMLButtonElement) {
        btn.textContent = "Downloading bundle...";
      }
      await downloadOverlayBundle(bundleHit);
      if (hint) {
        hint.textContent = `Started ${bundleHit.label}. Unzip at Foundry Data root (creates ionrift-data/overlays/...).`;
      }
      updateSelectedHint();
      return;
    } catch (err) {
      console.warn("Overlay Shelf: bundle download failed; falling back to per-pack", err);
      if (String(err?.message) === "unauthorized" || String(err?.message) === "not-authenticated") {
        if (hint) hint.textContent = "Connect Patreon, then try Download selected again.";
        await runConnect();
        updateSelectedHint();
        return;
      }
      if (hint) {
        hint.textContent = "Cached bundle unavailable; starting each pack zip in turn.";
      }
    }
  }

  if (btn instanceof HTMLButtonElement) {
    btn.textContent = `Downloading 0 / ${ids.length}...`;
  }

  let done = 0;
  let failed = 0;
  for (const id of ids) {
    const row = byId.get(id);
    try {
      if (row.publicDownload || row.downloadMode === "public") {
        triggerPublicDownload(id);
      } else {
        await downloadEntitledPack(id);
      }
      done += 1;
    } catch (err) {
      failed += 1;
      console.warn(`Overlay Shelf: selected download failed for ${id}`, err);
      if (String(err?.message) === "unauthorized" || String(err?.message) === "not-authenticated") {
        if (hint) hint.textContent = "Connect Patreon, then try Download selected again.";
        await runConnect();
        updateSelectedHint();
        return;
      }
    }
    if (btn instanceof HTMLButtonElement) {
      btn.textContent = `Downloading ${done} / ${ids.length}...`;
    }
    // Give the browser a beat between zip starts so multiple downloads are not dropped.
    if (done + failed < ids.length) await sleep(450);
  }

  if (hint) {
    hint.textContent = failed
      ? `Started ${done} of ${ids.length} downloads (${failed} failed). Check the browser download bar.`
      : `Started ${done} download${done === 1 ? "" : "s"}. Check the browser download bar, then unzip into ionrift-data.`;
  }
  updateSelectedHint();
}

function pruneSelection(overlays) {
  const visible = new Set(visibleOverlays(overlays).filter((r) => isSelectablePack(r)).map((r) => r.id));
  for (const id of [...selectedIds]) {
    if (!visible.has(id)) selectedIds.delete(id);
  }
}

function defaultSelectOpen(overlays) {
  if (selectedIds.size) return;
  for (const id of defaultSelectedIds(visibleOverlays(overlays))) {
    selectedIds.add(id);
  }
}

function renderAuthChrome(session = getSession()) {
  const slot = document.getElementById("shelf-auth-slot");
  if (!slot) return;
  if (session.authenticated) {
    slot.innerHTML = `
      <span class="shelf-auth-chip" id="shelf-auth-chip">
        <span class="shelf-auth-tier">Connected · ${escapeHtml(session.tier || "Free")}</span>
        <button type="button" class="btn btn-secondary btn-sm" id="shelf-disconnect-btn">Disconnect</button>
      </span>`;
  } else {
    slot.innerHTML = `
      <button type="button" class="btn btn-secondary" id="shelf-connect-btn">Connect Patreon</button>`;
  }
}

async function runConnect() {
  const connectBtn = document.getElementById("shelf-connect-btn");
  if (connectBtn instanceof HTMLButtonElement) {
    connectBtn.disabled = true;
    connectBtn.textContent = "Waiting for Patreon...";
  }
  try {
    const result = await connectPatreon();
    if (!result.ok) {
      if (result.error === "popup-blocked" && result.authUrl) {
        window.open(result.authUrl, "_blank", "noopener");
      }
      // Rebuild the slot so a cancelled/timeout wait never leaves a stuck disabled button.
      renderAuthChrome(getSession());
      return;
    }
    await loadStatus({ resetSelection: true });
  } catch (err) {
    console.warn("Overlay Shelf: Connect Patreon failed", err);
    renderAuthChrome(getSession());
  }
}

async function loadStatus(opts = {}) {
  const overlaysEl = document.getElementById("shelf-overlays");
  const modulesEl = document.getElementById("shelf-modules");
  if (!overlaysEl) return;

  const generation = ++statusLoadGeneration;
  const session = getSession();
  renderAuthChrome(session);

  try {
    const headers = {};
    if (session.authenticated) {
      headers.Authorization = `Bearer ${session.token}`;
    }
    // Localhost status.json is anonymous; production uses API with optional Bearer.
    const res = await fetch(statusUrl(), { cache: "no-store", headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (generation !== statusLoadGeneration) return;

    window.__ionriftStatus = data;
    if (opts.resetSelection) selectedIds.clear();
    captureNotOfferedOpen();
    const capturedModules = captureOpenModules();
    if (capturedModules.size) openModuleIds = capturedModules;
    defaultSelectOpen(data.overlays || []);
    pruneSelection(data.overlays || []);
    overlaysEl.innerHTML = renderOverlayGroups(data.overlays || []);
    if (modulesEl) modulesEl.innerHTML = renderModules(data.modules || []);
    updateSelectedHint();
  } catch (err) {
    console.error("Overlay Shelf: status load failed", err);
    overlaysEl.innerHTML = `<p class="shelf-error">Could not load the pack list. Try again later, or use the Patreon collection links.</p>`;
  }
}

function rerenderOverlays() {
  const data = window.__ionriftStatus;
  const overlaysEl = document.getElementById("shelf-overlays");
  if (!data || !overlaysEl) return;
  openModuleIds = captureOpenModules();
  captureNotOfferedOpen();
  pruneSelection(data.overlays || []);
  overlaysEl.innerHTML = renderOverlayGroups(data.overlays || []);
  updateSelectedHint();
}

function wireUi() {
  artMap = readArtMap();
  moduleMap = readModuleMap();
  renderAuthChrome();

  const selectAllToggle = document.getElementById("select-all-data-toggle");
  if (selectAllToggle instanceof HTMLInputElement) {
    selectAllToggle.addEventListener("change", () => {
      const overlays = visibleOverlays(window.__ionriftStatus?.overlays || []);
      const next = applySelectAllData(selectedIds, overlays, selectAllToggle.checked);
      selectedIds.clear();
      for (const id of next) selectedIds.add(id);
      rerenderOverlays();
      updateSelectedHint();
    });
  }

  document.getElementById("download-selected-btn")?.addEventListener("click", async () => {
    await downloadSelectedOverlays();
  });

  document.getElementById("shelf-auth-slot")?.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.id === "shelf-connect-btn" || target.closest("#shelf-connect-btn")) {
      await runConnect();
      return;
    }
    if (target.id === "shelf-disconnect-btn" || target.closest("#shelf-disconnect-btn")) {
      clearToken();
      selectedIds.clear();
      await loadStatus({ resetSelection: true });
    }
  });

  document.getElementById("shelf-overlays")?.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const dl = target.closest("[data-entitled-download]");
    if (dl instanceof HTMLElement) {
      const packId = dl.getAttribute("data-entitled-download");
      if (!packId) return;
      if (dl instanceof HTMLButtonElement) {
        dl.disabled = true;
        dl.textContent = "Starting...";
      }
      try {
        await downloadEntitledPack(packId);
      } catch (err) {
        console.warn("Overlay Shelf: entitled download failed", err);
        if (String(err?.message) === "unauthorized" || String(err?.message) === "not-authenticated") {
          await runConnect();
        }
      } finally {
        if (dl instanceof HTMLButtonElement) {
          dl.disabled = false;
          dl.textContent = "Download";
        }
      }
    }
  });

  document.getElementById("shelf-overlays")?.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || !target.hasAttribute("data-select-id")) return;
    syncSelectionFromDom();
    const tile = target.closest(".shelf-tile");
    if (tile) tile.classList.toggle("shelf-tile--selected", target.checked);
    rerenderOverlays();
  });

  document.getElementById("shelf-overlays")?.addEventListener("toggle", (event) => {
    const el = event.target;
    if (!(el instanceof HTMLDetailsElement) || !el.classList.contains("shelf-module-block")) return;
    if (openModuleIds === null) openModuleIds = new Set();
    const id = el.getAttribute("data-module-id");
    if (!id) return;
    if (el.open) openModuleIds.add(id);
    else openModuleIds.delete(id);
  }, true);

  const copyBtn = document.getElementById("copy-macro-btn");
  const macroSource = document.getElementById("shelf-macro-source");
  const macroDisplay = document.getElementById("shelf-macro-display");
  const macroText = () => (macroSource?.textContent || "").trim();

  if (macroDisplay) {
    const code = macroDisplay.querySelector("code") || macroDisplay;
    code.textContent = macroText();
    macroDisplay.hidden = false;
  }

  async function copyMacroText(text) {
    if (!text) throw new Error("empty macro");
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.left = "-9999px";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    if (!ok) throw new Error("copy failed");
  }

  copyBtn?.addEventListener("click", async () => {
    try {
      await copyMacroText(macroText());
      copyBtn.textContent = "Copied";
      setTimeout(() => { copyBtn.textContent = "Copy macro"; }, 1600);
    } catch (err) {
      console.warn("Overlay Shelf: copy macro failed", err);
      copyBtn.textContent = "Copy failed";
      setTimeout(() => { copyBtn.textContent = "Copy macro"; }, 2000);
      const details = document.querySelector(".shelf-macro-details");
      if (details instanceof HTMLDetailsElement) details.open = true;
    }
  });

  onSessionChange(() => {
    renderAuthChrome();
  });
}

wireUi();
loadStatus();
