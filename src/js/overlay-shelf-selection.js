/**
 * Pure selection helpers for Overlay Shelf (testable without DOM).
 */

/**
 * Generative for selection / cached-bundle alignment: art/audio companions and
 * Resonance media. Legacy cores that still embed media stay selectable as data
 * (matches OVERLAY_BUNDLE_CACHE_ADR).
 */
export function isGenerativePack(row) {
  if (row?.optionalCompanion || row?.companionFor) return true;
  if (row?.generativeKind === "audio") return true;
  const id = String(row?.id || "");
  if (/-art-overlay$/i.test(id)) return true;
  if (String(row?.moduleId || "") === "ionrift-resonance") return true;
  if (/^resonance-/i.test(id)) return true;
  return false;
}

/** Packs the GM can select / download in the current session. */
export function isSelectablePack(row) {
  if (row?.canDownload === true) return true;
  if (row?.canDownload === false) return false;
  return row?.publicDownload === true;
}

/**
 * Split listing into packs offered now vs not offered for this session.
 * @param {object[]} overlays
 * @returns {{ available: object[], unavailable: object[] }}
 */
export function partitionShelfOverlays(overlays) {
  const available = [];
  const unavailable = [];
  for (const row of overlays || []) {
    if (isSelectablePack(row)) available.push(row);
    else unavailable.push(row);
  }
  return { available, unavailable };
}

/**
 * Default zip selection: downloadable data packs only unless generative is opted in.
 * @param {object[]} overlays
 * @param {{ includeGenerative?: boolean }} [opts]
 * @returns {Set<string>}
 */
export function defaultSelectedIds(overlays, opts = {}) {
  const includeGenerative = opts.includeGenerative === true;
  const selected = new Set();
  for (const row of overlays || []) {
    if (!isSelectablePack(row)) continue;
    if (isGenerativePack(row) && !includeGenerative) continue;
    if (row.id) selected.add(row.id);
  }
  return selected;
}

/**
 * Apply the global generative toggle to an existing selection.
 * @param {Iterable<string>} selected
 * @param {object[]} overlays
 * @param {boolean} includeGenerative
 * @returns {Set<string>}
 */
export function applyGenerativeSelection(selected, overlays, includeGenerative) {
  const next = new Set(selected);
  for (const row of overlays || []) {
    if (!isSelectablePack(row) || !isGenerativePack(row) || !row.id) continue;
    if (includeGenerative) next.add(row.id);
    else next.delete(row.id);
  }
  return next;
}

/**
 * Exact set equality for pack id collections.
 * @param {Iterable<string>} a
 * @param {Iterable<string>} b
 * @returns {boolean}
 */
export function samePackIdSet(a, b) {
  const left = [...new Set([...a].filter(Boolean))];
  const right = [...new Set([...b].filter(Boolean))];
  if (left.length !== right.length) return false;
  const rightSet = new Set(right);
  return left.every((id) => rightSet.has(id));
}

/**
 * Silent cache hit: selection equals a ready, downloadable cached bundle.
 * Prefers data-only bundles when two match (should not happen in practice).
 * @param {Iterable<string>} selectedIds
 * @param {object[]} bundles
 * @returns {object|null}
 */
export function matchOverlayBundle(selectedIds, bundles) {
  const selected = [...new Set([...selectedIds].filter(Boolean))];
  if (!selected.length) return null;

  const hits = (bundles || []).filter((bundle) => {
    if (!bundle?.ready || bundle.canDownload !== true) return false;
    if (!Array.isArray(bundle.packIds) || !bundle.packIds.length) return false;
    return samePackIdSet(selected, bundle.packIds);
  });

  if (!hits.length) return null;
  hits.sort((a, b) => Number(a.includeGenerative) - Number(b.includeGenerative));
  return hits[0];
}
