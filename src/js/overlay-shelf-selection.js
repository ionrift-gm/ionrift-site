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

/**
 * Default zip selection: open data packs only unless generative is opted in.
 * @param {object[]} overlays
 * @param {{ includeGenerative?: boolean }} [opts]
 * @returns {Set<string>}
 */
export function defaultSelectedIds(overlays, opts = {}) {
  const includeGenerative = opts.includeGenerative === true;
  const selected = new Set();
  for (const row of overlays || []) {
    if (!row?.publicDownload) continue;
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
    if (!row?.publicDownload || !isGenerativePack(row) || !row.id) continue;
    if (includeGenerative) next.add(row.id);
    else next.delete(row.id);
  }
  return next;
}
