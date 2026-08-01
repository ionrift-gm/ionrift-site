/**
 * Overlay Shelf (layout A): tile grid by module, thumbs from packs.json art map.
 * Open overlays use /packs/public/{id}/latest. Paid rows link to Patreon.
 */

import {
  isGenerativePack,
  defaultSelectedIds,
  applyGenerativeSelection as applyGenerativeSelectionPure,
} from "./overlay-shelf-selection.js";

const API_BASE = "https://api.ionrift.cloud";
const PUBLIC_LATEST = (id) => `${API_BASE}/packs/public/${id}/latest`;

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

/** Hero toggle: when false, generative packs stay out of the default selection. */
let includeGenerative = false;

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
  // Companions after their peers of the same rank.
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
  // First module open; also open any with 3+ packs. Single-pack modules stay closed.
  open.add(groups[0][0]);
  for (const [moduleId, rows] of groups) {
    if (rows.length >= 3) open.add(moduleId);
  }
  return open;
}

function moduleSelectionSummary(rows) {
  const selectable = rows.filter((r) => r.publicDownload);
  const selected = selectable.filter((r) => selectedIds.has(r.id)).length;
  const total = rows.length;
  if (selectable.length) {
    return `${selected} selected · ${total} pack${total === 1 ? "" : "s"}`;
  }
  return `${total} pack${total === 1 ? "" : "s"} · Patreon`;
}

function tierLabel(row) {
  if (row.publicDownload) return "Open";
  const tier = String(row.tier || "").trim();
  if (!tier || /^free$/i.test(tier)) return "Patreon";
  return tier;
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
  const selectable = row.publicDownload === true;
  const selected = selectable && selectedIds.has(row.id);
  const title = displayName(row);
  const art = artFor(row.id);
  const metaBits = [tierLabel(row), `v${row.latest}`];
  // Companions are disclosed via checkbox + generative badge, not an "optional" chip.

  let action = "";
  if (row.publicDownload) {
    action = `<a class="btn btn-secondary btn-sm" href="${escapeHtml(PUBLIC_LATEST(row.id))}" rel="noopener">Download</a>`;
  } else if (row.browserHandoff) {
    action = `<a class="btn btn-secondary btn-sm" href="${escapeHtml(row.browserHandoff)}" target="_blank" rel="noopener">Patreon</a>`;
  } else {
    action = `<a class="btn btn-secondary btn-sm" href="https://www.patreon.com/c/Ionrift" target="_blank" rel="noopener">Patreon</a>`;
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
    !selectable ? "shelf-tile--gated" : "",
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

function renderOverlayGroups(overlays) {
  const visible = visibleOverlays(overlays);
  if (!visible.length) {
    return `<p class="shelf-empty">No overlays in the status listing yet.</p>`;
  }

  const groups = groupByModule(visible);
  if (openModuleIds === null) {
    openModuleIds = defaultOpenModules(groups);
  }

  return groups.map(([moduleId, rows]) => {
    const isOpen = openModuleIds.has(moduleId);
    const accent = moduleMeta(moduleId).accent;
    const style = accent ? ` style="--shelf-module-accent: ${escapeHtml(accent)}"` : "";
    return `
    <details class="shelf-module-block" data-module-id="${escapeHtml(moduleId)}"${isOpen ? " open" : ""}${style}>
      <summary class="shelf-module-summary">
        ${moduleIconHtml(moduleId)}
        <span class="shelf-module-summary-text">
          <span class="shelf-module-label">${escapeHtml(moduleLabel(moduleId))}</span>
          <span class="shelf-module-count">${escapeHtml(moduleSelectionSummary(rows))}</span>
        </span>
      </summary>
      <div class="shelf-tile-grid">
        ${rows.map(renderOverlayTile).join("")}
      </div>
    </details>
  `;
  }).join("");
}

function renderModules(modules) {
  // Unreleased modules: hide even if an older status API still lists them.
  const HIDDEN_MODULE_IDS = new Set(["ionrift-cartographer"]);
  const rows = (modules || []).filter((row) => !HIDDEN_MODULE_IDS.has(row.id));
  if (!rows.length) {
    return `<a class="btn btn-secondary btn-sm" href="https://www.patreon.com/c/Ionrift" target="_blank" rel="noopener">Patreon modules</a>`;
  }
  return rows.map((row) => {
    const href = row.browserHandoff || "https://www.patreon.com/c/Ionrift";
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
  if (hint) {
    hint.textContent = n
      ? `${n} open pack${n === 1 ? "" : "s"} selected. Per-pack Download works now; combined overlays-only zip is next.`
      : "Per-pack Download works now. A single overlays-only zip for your selection is next.";
  }
  if (btn) {
    btn.disabled = true;
    btn.textContent = n ? `Download selected overlays (${n})` : "Download selected overlays";
  }
}

function pruneSelection(overlays) {
  const visible = new Set(visibleOverlays(overlays).filter((r) => r.publicDownload).map((r) => r.id));
  for (const id of [...selectedIds]) {
    if (!visible.has(id)) selectedIds.delete(id);
  }
}

function defaultSelectOpen(overlays) {
  if (selectedIds.size) return;
  for (const id of defaultSelectedIds(visibleOverlays(overlays), { includeGenerative })) {
    selectedIds.add(id);
  }
}

function applyGenerativeSelection(overlays) {
  const next = applyGenerativeSelectionPure(selectedIds, visibleOverlays(overlays), includeGenerative);
  selectedIds.clear();
  for (const id of next) selectedIds.add(id);
}

async function loadStatus() {
  const overlaysEl = document.getElementById("shelf-overlays");
  const modulesEl = document.getElementById("shelf-modules");
  if (!overlaysEl) return;

  try {
    const res = await fetch(statusUrl(), { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    window.__ionriftStatus = data;

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
  pruneSelection(data.overlays || []);
  overlaysEl.innerHTML = renderOverlayGroups(data.overlays || []);
  updateSelectedHint();
}

function wireUi() {
  artMap = readArtMap();
  moduleMap = readModuleMap();

  const generativeToggle = document.getElementById("include-generative-toggle");
  if (generativeToggle instanceof HTMLInputElement) {
    generativeToggle.checked = includeGenerative;
    generativeToggle.addEventListener("change", () => {
      includeGenerative = generativeToggle.checked;
      const overlays = window.__ionriftStatus?.overlays || [];
      applyGenerativeSelection(overlays);
      rerenderOverlays();
      updateSelectedHint();
    });
  }

  document.getElementById("shelf-overlays")?.addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || !target.hasAttribute("data-select-id")) return;
    syncSelectionFromDom();
    const tile = target.closest(".shelf-tile");
    if (tile) tile.classList.toggle("shelf-tile--selected", target.checked);
    // Refresh accordion summaries without collapsing open sections.
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
      // Reveal the source so the user can select it manually.
      const details = document.querySelector(".shelf-macro-details");
      if (details instanceof HTMLDetailsElement) details.open = true;
    }
  });
}

wireUi();
loadStatus();
