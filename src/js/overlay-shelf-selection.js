/**
 * Pure selection helpers for Overlay Shelf (testable without DOM).
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
 * Selectable data packs only (no generative art/audio).
 * @param {object[]} overlays
 * @returns {string[]}
 */
export function selectableDataPackIds(overlays) {
  return (overlays || [])
    .filter((row) => isSelectablePack(row) && !isGenerativePack(row) && row.id)
    .map((row) => row.id)
    .sort();
}

/**
 * Selectable generative art/audio packs.
 * @param {object[]} overlays
 * @returns {string[]}
 */
export function selectableGenerativePackIds(overlays) {
  return (overlays || [])
    .filter((row) => isSelectablePack(row) && isGenerativePack(row) && row.id)
    .map((row) => row.id)
    .sort();
}

/**
 * Default zip selection: all downloadable data packs.
 * @param {object[]} overlays
 * @returns {Set<string>}
 */
export function defaultSelectedIds(overlays) {
  return new Set(selectableDataPackIds(overlays));
}

/**
 * @param {Iterable<string>} selected
 * @param {string[]} ids
 * @returns {"all"|"none"|"some"}
 */
function idsSelectionState(selected, ids) {
  if (!ids.length) return "none";
  const set = selected instanceof Set ? selected : new Set(selected);
  let hit = 0;
  for (const id of ids) {
    if (set.has(id)) hit += 1;
  }
  if (hit === 0) return "none";
  if (hit === ids.length) return "all";
  return "some";
}

/**
 * Checkbox state for the parent select-all (data packs) control.
 * @param {Iterable<string>} selected
 * @param {object[]} overlays
 * @returns {"all"|"none"|"some"}
 */
export function dataSelectionState(selected, overlays) {
  return idsSelectionState(selected, selectableDataPackIds(overlays));
}

/**
 * Checkbox state for the nested generative include control.
 * @param {Iterable<string>} selected
 * @param {object[]} overlays
 * @returns {"all"|"none"|"some"}
 */
export function generativeSelectionState(selected, overlays) {
  return idsSelectionState(selected, selectableGenerativePackIds(overlays));
}

/**
 * Apply the select-all tree: parent = data, child = generative.
 * When parent is off, generative is cleared too.
 * @param {Iterable<string>} selected
 * @param {object[]} overlays
 * @param {boolean} selectData
 * @param {boolean} selectGenerative
 * @returns {Set<string>}
 */
export function applySelectTree(selected, overlays, selectData, selectGenerative) {
  const next = new Set(selected);
  const dataIds = selectableDataPackIds(overlays);
  const genIds = selectableGenerativePackIds(overlays);

  if (!selectData) {
    for (const id of dataIds) next.delete(id);
    for (const id of genIds) next.delete(id);
    return next;
  }

  for (const id of dataIds) next.add(id);
  if (selectGenerative) {
    for (const id of genIds) next.add(id);
  } else {
    for (const id of genIds) next.delete(id);
  }
  return next;
}

/**
 * Select or clear all data packs. Generative tile picks are left alone.
 * @deprecated Prefer applySelectTree for the nested control.
 * @param {Iterable<string>} selected
 * @param {object[]} overlays
 * @param {boolean} selectAll
 * @returns {Set<string>}
 */
export function applySelectAllData(selected, overlays, selectAll) {
  const next = new Set(selected);
  const dataIds = selectableDataPackIds(overlays);
  if (selectAll) {
    for (const id of dataIds) next.add(id);
  } else {
    for (const id of dataIds) next.delete(id);
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
