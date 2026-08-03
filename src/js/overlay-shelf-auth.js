/**
 * Overlay Shelf Patreon login (popup + handshake poll).
 * Stores Sigil JWT in localStorage for entitled pack downloads.
 */

const API_BASE = "https://api.ionrift.cloud";
const TOKEN_KEY = "ionrift_sigil";
/** Public Patreon OAuth client id (same as Annex / Foundry Cloud). */
const CLIENT_ID = "tc0M_ZBHMPeQUQh5UGuxf5rePVmv9c9Af0hoMeMYdbmDmxEb7d334xn51Fk-nhOy";
const REDIRECT_URI = `${API_BASE}/auth/callback`;

/** @type {((session: ReturnType<typeof getSession>) => void)[]} */
const listeners = [];

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore quota / private mode */
  }
  notify();
}

export function clearToken() {
  setToken("");
}

/**
 * Decode JWT payload without verifying (display only; API verifies).
 * @param {string} token
 * @returns {{ uid?: string, pid?: string, tier?: string, credits?: number, exp?: number }|null}
 */
export function decodeSigil(token) {
  if (!token) return null;
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const json = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getSession() {
  const token = getToken();
  const payload = decodeSigil(token);
  if (!token || !payload) {
    return { authenticated: false, token: "", tier: null, payload: null };
  }
  if (payload.exp && payload.exp * 1000 < Date.now()) {
    clearToken();
    return { authenticated: false, token: "", tier: null, payload: null };
  }
  const tier = String(payload.tier || "Free").trim() || "Free";
  return { authenticated: true, token, tier, payload };
}

export function onSessionChange(fn) {
  listeners.push(fn);
  return () => {
    const i = listeners.indexOf(fn);
    if (i >= 0) listeners.splice(i, 1);
  };
}

function notify() {
  const session = getSession();
  for (const fn of listeners) {
    try {
      fn(session);
    } catch (err) {
      console.warn("Overlay Shelf auth listener failed", err);
    }
  }
}

function randomState() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function fetchHandshake(state) {
  try {
    const res = await fetch(`${API_BASE}/auth/poll?state=${encodeURIComponent(state)}`, {
      cache: "no-store",
    });
    if (res.status === 202 || !res.ok) return null;
    const data = await res.json();
    if (data.status === "success" && data.token) return data;
  } catch {
    /* retry */
  }
  return null;
}

/**
 * @param {string} state
 * @param {{ timeoutMs?: number, popup?: Window|null }} [opts]
 * @returns {Promise<{ status: "success", token: string, user?: object }|{ status: "cancelled"|"timeout" }>}
 */
async function pollHandshake(state, opts = {}) {
  const timeoutMs = opts.timeoutMs ?? 120000;
  const popup = opts.popup || null;
  const started = Date.now();
  let closedStreak = 0;

  while (Date.now() - started < timeoutMs) {
    await new Promise((r) => setTimeout(r, 1500));

    const hit = await fetchHandshake(state);
    if (hit) return { status: "success", token: hit.token, user: hit.user };

    if (popup) {
      if (popup.closed) {
        closedStreak += 1;
        // Grace so the authorize window can open; then treat sustained close as cancel.
        if (closedStreak >= 2 && Date.now() - started > 4000) {
          const lastChance = await fetchHandshake(state);
          if (lastChance) {
            return { status: "success", token: lastChance.token, user: lastChance.user };
          }
          return { status: "cancelled" };
        }
      } else {
        closedStreak = 0;
      }
    }
  }
  return { status: "timeout" };
}

/**
 * Open Patreon OAuth popup and store Sigil on success.
 * @returns {Promise<{ ok: boolean, tier?: string, error?: string, authUrl?: string }>}
 */
export async function connectPatreon() {
  const state = randomState();
  const authUrl = `https://www.patreon.com/oauth2/authorize`
    + `?client_id=${CLIENT_ID}`
    + `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`
    + `&state=${state}`
    + `&response_type=code`
    + `&scope=identity`;

  const popup = window.open(authUrl, "ionrift-patreon-shelf", "width=600,height=700");
  if (!popup) {
    return { ok: false, error: "popup-blocked", authUrl };
  }

  const result = await pollHandshake(state, { popup });
  try {
    if (!popup.closed) popup.close();
  } catch {
    /* ignore */
  }
  if (result.status === "success" && result.token) {
    setToken(result.token);
    const tier = result.user?.tier || getSession().tier || "Free";
    return { ok: true, tier };
  }
  return { ok: false, error: result.status === "cancelled" ? "cancelled" : "timeout" };
}

/**
 * Fetch an entitled pack signed URL and trigger browser download.
 * @param {string} packId
 * @param {string} [version]
 */
export async function downloadEntitledPack(packId, version = "latest") {
  const { token, authenticated } = getSession();
  if (!authenticated) throw new Error("not-authenticated");
  const url = `${API_BASE}/packs/entitled/${encodeURIComponent(packId)}/${encodeURIComponent(version)}?format=json`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });
  if (res.status === 401) {
    clearToken();
    throw new Error("unauthorized");
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  const data = await res.json();
  if (!data?.url) throw new Error("missing-url");
  triggerHrefDownload(data.url);
}

/**
 * @param {string} href
 */
export function triggerHrefDownload(href) {
  const a = document.createElement("a");
  a.href = href;
  a.rel = "noopener";
  a.download = "";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/**
 * Download a cached overlay bundle (public or entitled).
 * @param {object} bundle - status.bundles row
 */
export async function downloadOverlayBundle(bundle) {
  if (!bundle?.id) throw new Error("missing-bundle");
  const version = bundle.latest || "latest";
  if (bundle.publicDownload || bundle.downloadMode === "public") {
    triggerHrefDownload(
      `${API_BASE}/packs/bundles/public/${encodeURIComponent(bundle.id)}/${encodeURIComponent(version)}`
    );
    return;
  }

  const { token, authenticated } = getSession();
  if (!authenticated) throw new Error("not-authenticated");
  const url = `${API_BASE}/packs/bundles/entitled/${encodeURIComponent(bundle.id)}/${encodeURIComponent(version)}?format=json`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });
  if (res.status === 401) {
    clearToken();
    throw new Error("unauthorized");
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  const data = await res.json();
  if (!data?.url) throw new Error("missing-url");
  triggerHrefDownload(data.url);
}

