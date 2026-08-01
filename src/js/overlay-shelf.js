/**
 * Overlay Shelf (layout A): tile grid by module, thumbs from packs.json art map.
 * Free overlays use /packs/public/{id}/latest. Paid rows link to Patreon.
 */

const API_BASE = "https://api.ionrift.cloud";
const STATUS_URL = `${API_BASE}/packs/status`;
const PUBLIC_LATEST = (id) => `${API_BASE}/packs/public/${id}/latest`;
const OPTIONAL_ICON_IDS = new Set(["respite-cooking-art-overlay"]);

const MODULE_LABELS = {
  "ionrift-respite": "Respite",
  "ionrift-quartermaster": "Quartermaster",
  "ionrift-resonance": "Resonance",
  "ionrift-cursewright": "Cursewright",
};

/** @type {Set<string>} */
const selectedIds = new Set();

/** @type {Set<string>|null} null = use defaults on first paint */
let openModuleIds = null;

/** @type {Record<string, { image?: string|null, name?: string|null }>} */
let artMap = {};

function readArtMap() {
  const el = document.getElementById("shelf-art-map");
  if (!el) return {};
  try {
    const raw = el.textContent || "{}";
    return JSON.parse(raw);
  } catch (err) {
    console.warn("Overlay Shelf: art map parse failed", err);
    return {};
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function includeOptionalIcons() {
  return Boolean(document.getElementById("include-optional-icons")?.checked);
}

function moduleLabel(moduleId) {
  return MODULE_LABELS[moduleId] || moduleId || "Other";
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
  const showIcons = includeOptionalIcons();
  return (overlays || []).filter((row) => {
    const isOptionalIcon = OPTIONAL_ICON_IDS.has(row.id) || row.optionalCompanion;
    if (isOptionalIcon && !showIcons) return false;
    return true;
  });
}

function groupByModule(overlays) {
  const groups = new Map();
  for (const row of overlays) {
    const key = row.moduleId || "other";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
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

function renderOverlayTile(row) {
  const selectable = row.publicDownload === true;
  const selected = selectable && selectedIds.has(row.id);
  const tier = row.tier || "Free";
  const title = displayName(row);
  const art = artFor(row.id);
  const metaBits = [tier, `v${row.latest}`];
  if (row.optionalCompanion) metaBits.push("optional");

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
    ? `<div class="shelf-tile-media"><img src="${escapeHtml(imgSrc)}" alt="" loading="lazy" width="84" height="84"></div>`
    : `<div class="shelf-tile-media shelf-tile-media--empty" aria-hidden="true"></div>`;

  const tileClass = [
    "shelf-tile",
    selected ? "shelf-tile--selected" : "",
    !selectable ? "shelf-tile--gated" : "",
  ].filter(Boolean).join(" ");

  const pathTitle = row.installPath ? ` title="${escapeHtml(row.installPath)}"` : "";

  return `
    <article class="${tileClass}" data-pack-id="${escapeHtml(row.id)}"${pathTitle}>
      ${select}
      ${media}
      <div class="shelf-tile-body">
        <h4 class="shelf-tile-title">${escapeHtml(title)}</h4>
        <p class="shelf-tile-meta">${escapeHtml(metaBits.join(" · "))}</p>
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
    return `
    <details class="shelf-module-block" data-module-id="${escapeHtml(moduleId)}"${isOpen ? " open" : ""}>
      <summary class="shelf-module-summary">
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
  const rows = modules || [];
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
      ? `${n} Free pack${n === 1 ? "" : "s"} selected. Per-pack Download works now; combined overlays-only zip is next.`
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

function defaultSelectFree(overlays) {
  if (selectedIds.size) return;
  for (const row of visibleOverlays(overlays)) {
    if (row.publicDownload) selectedIds.add(row.id);
  }
}

async function loadStatus() {
  const overlaysEl = document.getElementById("shelf-overlays");
  const modulesEl = document.getElementById("shelf-modules");
  if (!overlaysEl) return;

  try {
    const res = await fetch(STATUS_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    window.__ionriftStatus = data;

    defaultSelectFree(data.overlays || []);
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

  document.getElementById("include-optional-icons")?.addEventListener("change", () => {
    rerenderOverlays();
  });

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
  const macroEl = document.getElementById("shelf-macro-source");
  copyBtn?.addEventListener("click", async () => {
    const text = macroEl?.innerText || "";
    try {
      await navigator.clipboard.writeText(text);
      copyBtn.textContent = "Copied";
      setTimeout(() => { copyBtn.textContent = "Copy macro"; }, 1600);
    } catch (_) {
      copyBtn.textContent = "Select and copy manually";
    }
  });
}

wireUi();
loadStatus();
