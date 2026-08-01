/**
 * Overlay Shelf page: load /packs/status and render download / handoff rows.
 * Free overlays use the public browser URL pattern. Paid rows link to Patreon.
 */

const API_BASE = "https://api.ionrift.cloud";
const STATUS_URL = `${API_BASE}/packs/status`;
const PUBLIC_LATEST = (id) => `${API_BASE}/packs/public/${id}/latest`;

const OPTIONAL_ICON_IDS = new Set(["respite-cooking-art-overlay"]);

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function tierClass(tier) {
  const t = String(tier || "Free").toLowerCase();
  if (t === "free") return "pack-tier--public";
  if (t === "initiate") return "pack-tier--initiate";
  if (t === "acolyte") return "pack-tier--acolyte";
  return "pack-tier--subscriber";
}

function includeOptionalIcons() {
  const el = document.getElementById("include-optional-icons");
  return Boolean(el?.checked);
}

function renderOverlayRow(row) {
  const isOptionalIcon = OPTIONAL_ICON_IDS.has(row.id) || row.optionalCompanion;
  if (isOptionalIcon && !includeOptionalIcons()) {
    return "";
  }

  const path = row.installPath || "ionrift-data/overlays/…/";
  const tier = row.tier || "Free";
  let action = "";

  if (row.publicDownload) {
    action = `<a class="btn btn-primary btn-sm" href="${escapeHtml(PUBLIC_LATEST(row.id))}" rel="noopener">Download</a>`;
  } else if (row.browserHandoff) {
    action = `<a class="btn btn-secondary btn-sm" href="${escapeHtml(row.browserHandoff)}" target="_blank" rel="noopener">Open on Patreon</a>`;
  } else {
    action = `<a class="btn btn-secondary btn-sm" href="https://www.patreon.com/c/Ionrift" target="_blank" rel="noopener">Patreon</a>`;
  }

  const companionNote = row.optionalCompanion
    ? `<p class="shelf-row-meta">Optional companion for ${escapeHtml(row.companionFor || "a core pack")}</p>`
    : "";

  return `
    <article class="shelf-row" data-pack-id="${escapeHtml(row.id)}">
      <div class="shelf-row-main">
        <div class="shelf-row-top">
          <h3 class="shelf-row-title">${escapeHtml(row.label || row.id)}</h3>
          <span class="pack-tier ${tierClass(tier)}">${escapeHtml(tier)}</span>
        </div>
        <p class="shelf-row-id"><code>${escapeHtml(row.id)}</code> · v${escapeHtml(row.latest)}</p>
        ${row.description ? `<p class="shelf-row-desc">${escapeHtml(row.description)}</p>` : ""}
        ${companionNote}
        <p class="shelf-row-path">Unzip to <code>${escapeHtml(path)}</code></p>
      </div>
      <div class="shelf-row-actions">${action}</div>
    </article>
  `;
}

function renderModuleRow(row) {
  const tier = row.tier || "Patreon";
  const action = row.browserHandoff
    ? `<a class="btn btn-secondary btn-sm" href="${escapeHtml(row.browserHandoff)}" target="_blank" rel="noopener">Open on Patreon</a>`
    : `<a class="btn btn-secondary btn-sm" href="https://www.patreon.com/c/Ionrift" target="_blank" rel="noopener">Patreon</a>`;

  return `
    <article class="shelf-row" data-module-id="${escapeHtml(row.id)}">
      <div class="shelf-row-main">
        <div class="shelf-row-top">
          <h3 class="shelf-row-title">${escapeHtml(row.id)}</h3>
          <span class="pack-tier ${tierClass(tier)}">${escapeHtml(tier)}</span>
        </div>
        <p class="shelf-row-id">v${escapeHtml(row.latest)}</p>
        ${row.description ? `<p class="shelf-row-desc">${escapeHtml(row.description)}</p>` : ""}
        <p class="shelf-row-path">${escapeHtml(row.installHint || "Foundry Add-on Modules")}</p>
      </div>
      <div class="shelf-row-actions">${action}</div>
    </article>
  `;
}

async function loadStatus() {
  const overlaysEl = document.getElementById("shelf-overlays");
  const modulesEl = document.getElementById("shelf-modules");
  if (!overlaysEl || !modulesEl) return;

  try {
    const res = await fetch(STATUS_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    window.__ionriftStatus = data;

    const overlayHtml = (data.overlays || []).map(renderOverlayRow).filter(Boolean).join("")
      || `<p class="shelf-empty">No overlays in the status listing yet.</p>`;
    overlaysEl.innerHTML = overlayHtml;

    const moduleHtml = (data.modules || []).map(renderModuleRow).join("")
      || `<p class="shelf-empty">No gated modules in the status listing yet.</p>`;
    modulesEl.innerHTML = moduleHtml;
  } catch (err) {
    console.error("Overlay Shelf: status load failed", err);
    overlaysEl.innerHTML = `<p class="shelf-error">Could not load the pack list. Try again later, or use the Patreon collection links.</p>`;
    modulesEl.innerHTML = "";
  }
}

function wireUi() {
  const opt = document.getElementById("include-optional-icons");
  opt?.addEventListener("change", () => {
    const data = window.__ionriftStatus;
    if (!data) return loadStatus();
    const overlaysEl = document.getElementById("shelf-overlays");
    if (!overlaysEl) return;
    overlaysEl.innerHTML = (data.overlays || []).map(renderOverlayRow).filter(Boolean).join("");
  });

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
