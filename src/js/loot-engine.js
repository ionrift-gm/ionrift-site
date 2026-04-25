/**
 * LootEngine — pure JS port of Quartermaster's CacheGenerator + ItemPoolResolver.
 * No Foundry dependencies. Operates on static SRD JSON data.
 *
 * SRD 5.1 content used under CC-BY-4.0 (https://creativecommons.org/licenses/by/4.0/)
 * This work includes material from the SRD 5.1 by Wizards of the Coast LLC.
 */

export class LootEngine {
    constructor({ cacheTables, srdItems, srdSpells }) {
        this.tables  = cacheTables;
        this.items   = srdItems;
        this.spells  = srdSpells;
    }

    // ── Public API ────────────────────────────────────────────────

    generate({ tier = 1, theme = 'dungeon', ownerTheme = 'unspecified', economy = 1.0, magicFrequency = 1.0 } = {}) {
        tier = Math.min(4, Math.max(1, Math.round(tier)));
        const tierData  = this.tables.tiers[String(tier)];
        const ownerDef  = this.tables.ownerThemes?.[ownerTheme] ?? this.tables.ownerThemes?.unspecified;
        if (!tierData || !ownerDef) return { gold: 0, items: [], container: null, meta: {} };

        tierData._tier = tier;

        const effectiveBudget = (tierData.budgetCap ?? 150) * (ownerDef.budgetMultiplier ?? 1.0) * economy;
        let spentBudget = 0;

        const themeDisplay = theme.charAt(0).toUpperCase() + theme.slice(1);
        const cacheLabel = ownerTheme === 'unspecified' ? `${themeDisplay} Cache` : ownerDef.label;

        const result = {
            gold: 0, items: [], container: null,
            meta: { tier, theme, ownerTheme, tierLabel: tierData.label, cacheLabel, economy, mintBatch: this._randomId() }
        };

        // Flavor phrase
        const phrases = this.tables.flavorPhrases?.[theme];
        if (phrases?.length) result.meta.flavor = phrases[Math.floor(Math.random() * phrases.length)];

        // Gold
        result.gold = Math.max(0, Math.round(this._rollGold(tierData.goldDice) * (ownerDef.budgetMultiplier ?? 1.0)));
        spentBudget += result.gold;

        // Tier scaling
        const tierScale = [0, 1.0, 1.5, 2.0, 2.5][tier] ?? 1.0;
        const slotRange = ownerDef.totalSlots ?? { min: 5, max: 8 };
        const scaledMin = Math.round(slotRange.min * tierScale);
        const scaledMax = Math.round(slotRange.max * tierScale);
        const totalSlotCount = Math.floor(Math.random() * (scaledMax - scaledMin + 1)) + scaledMin;
        const pool = ownerDef.slotPool ?? {};
        const goldFillerFloor = [0, 5, 15, 40, 100][tier] ?? 5;

        // Guaranteed slots
        const guaranteed = [];
        for (const entry of (ownerDef.guaranteed ?? [])) {
            if (typeof entry === 'string') {
                guaranteed.push(entry);
            } else if (entry?.type) {
                const min = Math.round((entry.min ?? 1) * tierScale);
                const max = Math.round((entry.max ?? min) * tierScale);
                const count = Math.floor(Math.random() * (max - min + 1)) + min;
                for (let j = 0; j < count; j++) guaranteed.push(entry.type);
            }
        }

        const drawnSlots = [...guaranteed];
        const remainingCount = Math.max(0, totalSlotCount - drawnSlots.length);
        for (let i = 0; i < remainingCount; i++) drawnSlots.push(this._weightedPoolDraw(pool));

        // Container
        const container = this._pickContainer(ownerTheme, theme);
        const weightBudget = container?.capacityLbs || 999;
        let currentWeight = 0;

        const guaranteedCount = guaranteed.length;
        let slotsProcessed = 0;

        for (const slotType of drawnSlots) {
            const isGuaranteed = slotsProcessed < guaranteedCount;
            if (!isGuaranteed && spentBudget >= effectiveBudget) break;

            const fillerSlotsLeft = Math.max(1, drawnSlots.length - Math.max(slotsProcessed, guaranteedCount));
            const remainingBudget = effectiveBudget - spentBudget;
            const priceCeiling = isGuaranteed ? Infinity : Math.max(remainingBudget / fillerSlotsLeft, goldFillerFloor);

            let item = null;
            for (let attempt = 0; attempt < 5; attempt++) {
                const candidate = this._pickItem(slotType, theme, tierData, priceCeiling, magicFrequency);
                if (!candidate) break;
                if ((Number(candidate.weight) || 0) > 45) continue;
                item = candidate;
                break;
            }

            slotsProcessed++;

            if (item) {
                const qty = this._resolveQuantity(item);
                const totalPrice  = Math.round((item.price ?? 0) * qty * 100) / 100;
                const totalWeight = (Number(item.weight) || 0) * qty;

                if (container && (currentWeight + totalWeight) > weightBudget && result.items.length > 0) {
                    const filler = Math.floor(totalPrice * 0.5);
                    result.gold += filler;
                    if (!isGuaranteed) spentBudget += filler;
                } else {
                    currentWeight += totalWeight;
                    if (!isGuaranteed) spentBudget += totalPrice;
                    result.items.push({ ...item, quantity: qty, price: totalPrice, _slotType: slotType });
                }
            } else {
                const filler = Math.floor(goldFillerFloor * (0.5 + Math.random()));
                result.gold += filler;
                if (!isGuaranteed) spentBudget += filler;
            }
        }

        // Attach container
        if (container) {
            const fillPercent = container.capacityLbs > 0
                ? Math.min(100, Math.round((currentWeight / container.capacityLbs) * 100)) : 0;
            result.container = { ...container, contentWeightLbs: currentWeight, fillPercent };
            if (result.meta.flavor?.includes('{container}')) {
                const n = container.name.toLowerCase();
                const a = /^[aeiou]/i.test(n) ? 'an' : 'a';
                result.meta.flavor = result.meta.flavor.replaceAll('{container}', `${a} ${n}`);
            }
        }

        result.coinage = this._distributeCoinage(result.gold);
        return result;
    }

    getOwnerThemes() {
        return Object.entries(this.tables.ownerThemes ?? {}).map(([id, d]) => ({ id, label: d.label, desc: d.desc }));
    }

    getTerrainThemes() {
        return Object.keys(this.tables.flavorPhrases ?? {});
    }

    getTiers() {
        return Object.entries(this.tables.tiers ?? {}).map(([id, d]) => ({ id: Number(id), label: d.label }));
    }

    // ── Item Picking ──────────────────────────────────────────────

    _pickItem(slotType, theme, tierData, priceCeiling, magicFrequency = 1.0) {
        switch (slotType) {
            case 'consumable':  return this._pickConsumable(tierData, priceCeiling, magicFrequency);
            case 'mundane':     return this._pickMundane(theme, tierData, priceCeiling);
            case 'scroll':      return this._pickScroll(tierData, priceCeiling);
            case 'mastercraft': return this._pickMastercraft(theme, tierData, priceCeiling);
            case 'gemstone':    return this._pickGemstone(tierData, priceCeiling);
            case 'treasure':    return this._pickTreasure(tierData, priceCeiling);
            case 'trinket':     return this._pickTrinket(tierData, priceCeiling);
            default:            return null;
        }
    }

    _pickConsumable(tierData, priceCeiling, magicFrequency = 1.0) {
        const tier = tierData._tier ?? 1;
        const rarityOrder = ['common', 'uncommon', 'rare', 'very rare', 'legendary'];
        const maxRarityIdx = ['common', 'uncommon', 'rare', 'very rare', 'legendary']
            .indexOf((tierData.rarityMax ?? 'uncommon').toLowerCase());

        let pool = this.items.consumables.filter(i => {
            const price = i.price ?? 0;
            if (price > priceCeiling) return false;
            const ri = rarityOrder.indexOf((i.rarity ?? 'common').toLowerCase());
            return ri <= maxRarityIdx;
        });

        if (magicFrequency < 1.0) {
            const mundane = pool.filter(i => (i.rarity ?? 'common') === 'common');
            if (mundane.length > 0 && Math.random() > magicFrequency) pool = mundane;
        }
        if (!pool.length) return null;
        const pick = pool[Math.floor(Math.random() * pool.length)];
        return { ...pick, type: 'consumable', quantity: 1 };
    }

    _pickMundane(theme, tierData, priceCeiling) {
        let pool = this.items.mundane.filter(i => (i.price ?? 0) <= priceCeiling);
        if (!pool.length) return null;
        const pick = this._terrainWeightedPick(pool, theme);
        return { ...pick, type: 'loot', quantity: 1 };
    }

    _pickMastercraft(theme, tierData, priceCeiling) {
        const tier = tierData._tier ?? 1;
        const priceMax = Math.min([0, 100, 400, 1500, 5000][tier], priceCeiling);
        const priceMin = [0, 5, 30, 200, 800][tier];

        const weapons = this.items.weapons.filter(i => {
            const p = i.price ?? 0;
            return p >= priceMin && p <= priceMax;
        });
        const armor = this.items.armor.filter(i => {
            const p = i.price ?? 0;
            return p >= priceMin && p <= priceMax;
        });
        const combined = [...weapons, ...armor];
        if (!combined.length) return null;
        const pick = combined[Math.floor(Math.random() * combined.length)];
        return { ...pick, type: pick.name.toLowerCase().includes('armor') || pick.name.toLowerCase().includes('shield') || pick.name.toLowerCase().includes('mail') ? 'armor' : 'weapon', quantity: 1 };
    }

    _pickGemstone(tierData, priceCeiling) {
        const tier = tierData._tier ?? 1;
        const eligibleTiers = [
            [],
            ['Chips & Fragments', 'Polished Common'],
            ['Chips & Fragments', 'Polished Common', 'Semi-Precious'],
            ['Polished Common', 'Semi-Precious', 'Precious'],
            ['Semi-Precious', 'Precious', 'Flawless']
        ][tier] ?? ['Polished Common'];

        const tierWeights = { 'Chips & Fragments': 4, 'Polished Common': 3, 'Semi-Precious': 2, 'Precious': 1, 'Flawless': 0.5 };

        const eligible = this.items.gemstones.filter(g =>
            eligibleTiers.includes(g.tier) && (g.price ?? 0) <= priceCeiling
        );
        if (!eligible.length) return null;

        // Weighted pick by tier
        const weighted = [];
        for (const g of eligible) {
            const w = Math.round((tierWeights[g.tier] ?? 1) * 10);
            for (let i = 0; i < w; i++) weighted.push(g);
        }
        const pick = weighted[Math.floor(Math.random() * weighted.length)];
        return { ...pick, type: 'loot', quantity: 1 };
    }

    _pickTreasure(tierData, priceCeiling) {
        const tier = tierData._tier ?? 1;
        const priceMax = Math.min([0, 80, 200, 500, 5000][tier] ?? 80, priceCeiling);
        const priceMin = [0, 10, 40, 100, 250][tier] ?? 10;

        const eligible = this.items.treasures.filter(t => {
            const p = t.price ?? 0;
            return p >= priceMin && p <= priceMax;
        });
        if (!eligible.length) return null;
        const pick = eligible[Math.floor(Math.random() * eligible.length)];
        return { ...pick, type: 'loot', quantity: 1 };
    }

    _pickTrinket(tierData, priceCeiling) {
        const tier = tierData._tier ?? 1;
        const ceiling = Math.min([0, 25, 75, 200, 500][tier] ?? 25, priceCeiling);
        const eligible = this.items.trinkets.filter(t => (t.price ?? 0) <= ceiling);
        if (!eligible.length) return null;
        const pick = eligible[Math.floor(Math.random() * eligible.length)];
        return { ...pick, type: 'loot', quantity: 1 };
    }

    _pickScroll(tierData, priceCeiling) {
        const maxLevel = tierData.scrollLevelMax ?? 2;
        const level = this._weightedScrollLevel(maxLevel);
        const scrollPrices = { 1:60, 2:120, 3:200, 4:320, 5:640, 6:1280, 7:2560, 8:5120, 9:10240 };
        const price = scrollPrices[level] ?? 60;
        if (price > priceCeiling) return null;

        const spellPool = this.spells[String(level)] ?? [];
        if (!spellPool.length) return null;
        const spellName = spellPool[Math.floor(Math.random() * spellPool.length)];

        return {
            name: `Spell Scroll (${spellName})`,
            type: 'consumable',
            price,
            weight: 0,
            rarity: level <= 2 ? 'common' : level <= 4 ? 'uncommon' : 'rare',
            spellName,
            spellLevel: level,
            quantity: 1
        };
    }

    // ── Helpers ───────────────────────────────────────────────────

    _weightedPoolDraw(pool) {
        const entries = Object.entries(pool);
        if (!entries.length) return 'mundane';
        const total = entries.reduce((s, [, w]) => s + w, 0);
        let roll = Math.random() * total;
        for (const [type, weight] of entries) {
            roll -= weight;
            if (roll <= 0) return type;
        }
        return entries[entries.length - 1][0];
    }

    _rollGold(formula) {
        if (!formula) return 0;
        const match = formula.match(/^(\d+)d(\d+)(?:\*(\d+))?$/);
        if (!match) return 0;
        const count = Number(match[1]);
        const sides = Number(match[2]);
        const mult  = Number(match[3] ?? 1);
        let total = 0;
        for (let i = 0; i < count; i++) total += Math.floor(Math.random() * sides) + 1;
        return total * mult;
    }

    _resolveQuantity(item) {
        const price = item.price ?? 0;
        if (price <= 0) return 1;
        if (price < 0.5) return Math.floor(Math.random() * 10) + 5;
        if (price < 2)   return Math.floor(Math.random() * 5) + 2;
        if (price < 10)  return Math.random() < 0.4 ? Math.floor(Math.random() * 3) + 2 : 1;
        return 1;
    }

    _weightedScrollLevel(maxLevel) {
        if (maxLevel <= 1) return 1;
        const weights = {};
        for (let i = 1; i <= maxLevel; i++) weights[i] = Math.min(i, maxLevel - i + 1);
        const total = Object.values(weights).reduce((a, b) => a + b, 0);
        let roll = Math.random() * total;
        for (const [lvl, w] of Object.entries(weights)) {
            roll -= w;
            if (roll <= 0) return parseInt(lvl);
        }
        return maxLevel;
    }

    _terrainWeightedPick(pool, theme) {
        if (!theme || !pool.length) return pool[Math.floor(Math.random() * pool.length)];
        const weighted = pool.flatMap(item => {
            const terrains = item.terrain ?? [];
            return terrains.includes(theme) ? [item, item] : [item];
        });
        return weighted[Math.floor(Math.random() * weighted.length)];
    }

    _pickContainer(ownerTheme, theme) {
        const containers = this.items.containers ?? [];
        if (!containers.length) return null;
        return containers[Math.floor(Math.random() * containers.length)];
    }

    _distributeCoinage(totalGp) {
        const pp = Math.floor(totalGp / 10);
        const rem = totalGp - pp * 10;
        const gp = Math.floor(rem);
        const sp = Math.round((rem - gp) * 10);
        return { pp, gp, sp, cp: 0 };
    }

    _randomId() {
        return Math.random().toString(36).slice(2, 10);
    }
}

/**
 * Load all required data files and return a ready LootEngine.
 * @param {string} basePath - base URL for data files (e.g. '/data')
 * @returns {Promise<LootEngine>}
 */
export async function createLootEngine(basePath = '/data') {
    const [cacheTables, srdItems, srdSpells] = await Promise.all([
        fetch(`${basePath}/cache-tables-web.json`).then(r => r.json()),
        fetch(`${basePath}/srd-items.json`).then(r => r.json()),
        fetch(`${basePath}/srd-spells.json`).then(r => r.json())
    ]);
    return new LootEngine({ cacheTables, srdItems, srdSpells });
}
