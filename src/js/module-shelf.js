/**
 * Module Shelf: one-stop Foundry module install desk (public manifests + Patreon tokens).
 */

import {
  getSession,
  connectPatreon,
  clearToken,
  mintFoundryInstallToken,
  tierAtLeast,
  onSessionChange,
} from "./sigil-auth.js";

const PATREON_HOME = "https://www.patreon.com/c/Ionrift";

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function readCatalog() {
  const el = document.getElementById("module-shelf-catalog");
  if (!el) return [];
  try {
    const data = JSON.parse(el.textContent || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function renderAuthChrome(session = getSession()) {
  const slot = document.getElementById("module-shelf-auth-slot");
  if (!slot) return;
  if (session.authenticated) {
    slot.innerHTML = `
      <span class="shelf-auth-chip" id="module-shelf-auth-chip">
        <span class="shelf-auth-tier">Connected · ${escapeHtml(session.tier || "Free")}</span>
        <button type="button" class="btn btn-secondary btn-sm" id="module-shelf-disconnect-btn">Disconnect</button>
      </span>`;
  } else {
    slot.innerHTML = `
      <button type="button" class="btn btn-secondary" id="module-shelf-connect-btn">Connect Patreon</button>`;
  }
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const area = document.createElement("textarea");
  area.value = text;
  document.body.appendChild(area);
  area.select();
  document.execCommand("copy");
  area.remove();
}

function setPageNote(message, { error = false } = {}) {
  const note = document.getElementById("module-shelf-note");
  if (!note) return;
  if (!message) {
    note.hidden = true;
    note.textContent = "";
    note.classList.toggle("module-shelf-note--error", false);
    return;
  }
  note.hidden = false;
  note.textContent = message;
  note.classList.toggle("module-shelf-note--error", error);
}

function renderRow(row, session) {
  const accent = row.accent ? ` style="--shelf-module-accent: ${escapeHtml(row.accent)}"` : "";
  const icon = row.icon
    ? `<img class="module-shelf-row-icon" src="${escapeHtml(row.icon)}" alt="" width="40" height="40" loading="lazy">`
    : `<span class="module-shelf-row-icon module-shelf-row-icon--empty" aria-hidden="true"></span>`;

  const metaBits = [];
  if (row.detailUrl) {
    metaBits.push(`<a class="module-shelf-row-detail" href="${escapeHtml(row.detailUrl)}">Module page</a>`);
  }
  if (row.foundryPackage) {
    metaBits.push(
      `<a class="module-shelf-row-detail" href="${escapeHtml(row.foundryPackage)}" target="_blank" rel="noopener">Foundry</a>`
    );
  }
  if (row.github) {
    metaBits.push(
      `<a class="module-shelf-row-detail" href="${escapeHtml(row.github)}" target="_blank" rel="noopener">GitHub</a>`
    );
  }
  const meta = metaBits.length
    ? `<div class="module-shelf-row-meta">${metaBits.join('<span class="module-shelf-row-meta-sep" aria-hidden="true"> · </span>')}</div>`
    : "";

  const actions = [];
  if (row.method === "foundry" || row.method === "github") {
    if (row.manifest) {
      actions.push(
        `<button type="button" class="btn btn-secondary btn-sm" data-copy-manifest="${escapeHtml(row.manifest)}">Copy manifest URL</button>`
      );
    } else if (row.github) {
      // No manifest in catalogue; fall back to repo only in actions.
      actions.push(
        `<a class="btn btn-secondary btn-sm" href="${escapeHtml(row.github)}" target="_blank" rel="noopener">GitHub</a>`
      );
    }
  } else if (row.method === "patreon-manifest") {
    const need = row.minTier || "Acolyte";
    if (session.authenticated && tierAtLeast(session.tier, need)) {
      actions.push(
        `<button type="button" class="btn btn-primary btn-sm" data-mint-module="${escapeHtml(row.packageId)}">Copy Foundry install link</button>`
      );
    } else if (!session.authenticated) {
      actions.push(
        `<span class="module-shelf-row-gate">Connect Patreon (${escapeHtml(need)}+) for a personal install link.</span>`
      );
    } else {
      actions.push(
        `<span class="module-shelf-row-gate">${escapeHtml(need)}+ unlocks a personal install link. <a href="${PATREON_HOME}" target="_blank" rel="noopener">Patreon</a></span>`
      );
    }
  }

  const access = row.accessLabel
    ? `<span class="module-shelf-row-access">${escapeHtml(row.accessLabel)}</span>`
    : "";

  return `
    <article class="module-shelf-row" data-module-id="${escapeHtml(row.id)}"${accent}>
      ${icon}
      <div class="module-shelf-row-body">
        <div class="module-shelf-row-heading">
          <h3 class="module-shelf-row-title">${escapeHtml(row.name)}</h3>
          ${access}
        </div>
        <p class="module-shelf-row-tag">${escapeHtml(row.tagline)}</p>
        ${meta}
      </div>
      <div class="module-shelf-row-actions">${actions.join(" ")}</div>
    </article>`;
}

function renderList() {
  const host = document.getElementById("module-shelf-list");
  if (!host) return;
  const catalog = readCatalog();
  const session = getSession();
  if (!catalog.length) {
    host.innerHTML = `<p class="shelf-empty">No installable modules in the catalogue yet.</p>`;
    return;
  }

  const premium = catalog.filter((row) => row.method === "patreon-manifest");
  const open = catalog.filter((row) => row.method === "foundry" || row.method === "github");

  const parts = [];
  if (premium.length) {
    parts.push(`
      <section class="module-shelf-group" aria-labelledby="module-shelf-premium-heading">
        <div class="module-shelf-group-head">
          <h3 id="module-shelf-premium-heading" class="module-shelf-group-title">Premium</h3>
          <p class="shelf-note">
            Connect Patreon, then copy a personal Foundry install link. Please do not post those links publicly.
          </p>
        </div>
        <div class="module-shelf-list">${premium.map((row) => renderRow(row, session)).join("")}</div>
      </section>`);
  }
  if (open.length) {
    parts.push(`
      <section class="module-shelf-group" aria-labelledby="module-shelf-open-heading">
        <div class="module-shelf-group-head">
          <h3 id="module-shelf-open-heading" class="module-shelf-group-title">Open modules</h3>
          <p class="shelf-note">Public Foundry or GitHub installs. No Patreon login required.</p>
        </div>
        <div class="module-shelf-list">${open.map((row) => renderRow(row, session)).join("")}</div>
      </section>`);
  }

  host.innerHTML = parts.join("");
}

async function runConnect() {
  const btn = document.getElementById("module-shelf-connect-btn");
  if (btn instanceof HTMLButtonElement) {
    btn.disabled = true;
    btn.textContent = "Waiting for Patreon...";
  }
  try {
    const result = await connectPatreon();
    if (!result.ok) {
      if (result.error === "popup-blocked" && result.authUrl) {
        window.open(result.authUrl, "_blank", "noopener");
      }
      renderAuthChrome(getSession());
      return;
    }
    renderAuthChrome(getSession());
    renderList();
    setPageNote("Connected. Premium install links unlock for your tier.");
  } catch (err) {
    console.warn("Module Shelf: Connect failed", err);
    renderAuthChrome(getSession());
  }
}

function wireUi() {
  renderAuthChrome();
  renderList();

  document.getElementById("module-shelf-auth-slot")?.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.id === "module-shelf-connect-btn" || target.closest("#module-shelf-connect-btn")) {
      await runConnect();
      return;
    }
    if (target.id === "module-shelf-disconnect-btn" || target.closest("#module-shelf-disconnect-btn")) {
      clearToken();
      renderAuthChrome();
      renderList();
      setPageNote("");
    }
  });

  document.getElementById("module-shelf-list")?.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const copyBtn = target.closest("[data-copy-manifest]");
    if (copyBtn instanceof HTMLButtonElement) {
      const url = copyBtn.getAttribute("data-copy-manifest");
      if (!url) return;
      try {
        await copyText(url);
        setPageNote("Copied public manifest URL. Paste into Foundry Add-on Modules.");
      } catch (err) {
        setPageNote(String(err?.message || err), { error: true });
      }
      return;
    }

    const mintBtn = target.closest("[data-mint-module]");
    if (!(mintBtn instanceof HTMLButtonElement)) return;
    const moduleId = mintBtn.getAttribute("data-mint-module");
    if (!moduleId) return;
    mintBtn.disabled = true;
    const prev = mintBtn.textContent;
    mintBtn.textContent = "Minting...";
    try {
      const data = await mintFoundryInstallToken(moduleId);
      if (!data?.manifestUrl) throw new Error("missing-manifest-url");
      await copyText(data.manifestUrl);
      mintBtn.textContent = "Copied";
      setPageNote(
        data.rotated
          ? "Copied. Previous install link for this module was replaced. Paste into Foundry Add-on Modules. Personal key: please do not post publicly."
          : "Copied. Paste into Foundry Add-on Modules. Personal key: please do not post publicly."
      );
    } catch (err) {
      console.warn("Module Shelf: mint failed", err);
      mintBtn.textContent = prev || "Copy Foundry install link";
      setPageNote(String(err?.message || err), { error: true });
      if (String(err?.message) === "unauthorized" || String(err?.message) === "not-authenticated") {
        await runConnect();
      }
      return;
    } finally {
      setTimeout(() => {
        mintBtn.disabled = false;
        if (mintBtn.textContent === "Copied" || mintBtn.textContent === "Minting...") {
          mintBtn.textContent = "Copy Foundry install link";
        }
      }, 2000);
    }
  });

  onSessionChange(() => {
    renderAuthChrome();
    renderList();
  });
}

wireUi();
