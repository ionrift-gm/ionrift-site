/**
 * Pure selection helpers for Overlay Shelf (testable without DOM).
 */

export function isGenerativePack(row) {
  return Boolean(
    row?.generative
    || row?.generativeKind
    || row?.optionalCompanion
  );
}

/** Packs the GM can select / download in the current session. */
export function isSelectablePack(row) {
  if (row?.canDownload === true) return true;
  if (row?.canDownload === false) return false;
  return row?.publicDownload === true;
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
