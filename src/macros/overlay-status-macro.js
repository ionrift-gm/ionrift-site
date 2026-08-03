/* Ionrift overlay status check
 * Version: 1.0.0
 * Source: https://ionrift.cloud/macros/overlay-status-macro.js
 */
(async () => {
  const MACRO_VERSION = "1.0.0";
  const STATUS_URL = "https://api.ionrift.cloud/packs/status";
  const SHELF_URL = "https://ionrift.cloud/overlay-shelf/";

  const compare = (a, b) => {
    const pa = String(a || "0").split(".").map((n) => parseInt(n, 10) || 0);
    const pb = String(b || "0").split(".").map((n) => parseInt(n, 10) || 0);
    const len = Math.max(pa.length, pb.length);
    for (let i = 0; i < len; i++) {
      const d = (pa[i] || 0) - (pb[i] || 0);
      if (d) return d < 0 ? -1 : 1;
    }
    return 0;
  };

  const esc = (value) => String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  let listing;
  try {
    const res = await fetch(STATUS_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    listing = await res.json();
  } catch (err) {
    console.error("Ionrift status: failed to fetch listing", err);
    ui.notifications?.error?.("Ionrift status: could not reach the status listing.");
    return;
  }

  const missing = [];
  const outdated = [];
  const current = [];
  const other = [];
  const FP = foundry.applications?.apps?.FilePicker?.implementation ?? FilePicker;

  // Browse first so missing packs do not spam the console with fetch 404s.
  const readLocalVersion = async (installPath) => {
    const dir = String(installPath || "").replace(/\\/g, "/").replace(/\/+$/, "");
    if (!dir) return null;
    try {
      const browse = await FP.browse("data", dir);
      const files = browse?.files || [];
      const manifestUrl = files.find((f) => String(f).endsWith("overlay-manifest.json"));
      if (!manifestUrl) return null;
      const res = await fetch(manifestUrl, { cache: "no-store" });
      if (!res.ok) return null;
      const raw = await res.json();
      return raw?.version || raw?.overlayVersion || null;
    } catch (_) {
      return null;
    }
  };

  for (const row of listing.overlays || []) {
    const path = row.installPath;
    if (!path) {
      other.push(`${row.id}: no install path in listing`);
      continue;
    }

    const local = await readLocalVersion(path);

    if (!local) {
      missing.push(`${row.id}: missing (latest ${row.latest})`);
    } else if (compare(local, row.latest) < 0) {
      outdated.push(`${row.id}: outdated (installed ${local}, latest ${row.latest})`);
    } else if (compare(local, row.latest) > 0) {
      other.push(`${row.id}: newer than listing (installed ${local}, listing ${row.latest})`);
    } else {
      current.push(`${row.id}: at latest (${local})`);
    }
  }

  const lines = [...missing, ...outdated, ...other, ...current];
  console.group(`Ionrift overlay status (macro ${MACRO_VERSION})`);
  for (const line of lines) console.log(line);
  console.log(`Updates: ${SHELF_URL}`);
  console.groupEnd();

  const section = (title, items, tone) => {
    if (!items.length) return "";
    const lis = items.map((line) => `<li>${esc(line)}</li>`).join("");
    return `<h3 style="margin:0.35em 0 0.35em;font-size:1em;color:${tone}">${esc(title)}</h3><ul style="margin:0;padding-left:1.2em">${lis}</ul>`;
  };

  const content = `
    <div class="ionrift-overlay-status">
      ${section("Missing", missing, "#b91c1c")}
      ${section("Outdated", outdated, "#b45309")}
      ${section("Notes", other, "#52525b")}
      ${section("At latest", current, "#166534")}
      <p style="margin:0.85em 0 0;font-size:0.9em;opacity:0.85">Updates: ${esc(SHELF_URL)}</p>
      <p style="margin:0.35em 0 0;font-size:0.8em;opacity:0.65">Macro ${esc(MACRO_VERSION)}</p>
    </div>
  `;

  new Dialog({
    title: `Ionrift overlay status (v${MACRO_VERSION})`,
    content,
    buttons: {
      shelf: {
        icon: '<i class="fas fa-external-link-alt"></i>',
        label: "Open Overlay Shelf",
        callback: () => window.open(SHELF_URL, "_blank", "noopener"),
      },
      close: {
        icon: '<i class="fas fa-check"></i>',
        label: "Close",
      },
    },
    default: "close",
  }).render(true);
})();
