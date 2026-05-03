---
title: "Resting: what's at camp (Part 3 of 3)"
description: "Part 2 was about the spatial model: camp on the map, stations as interaction points, two clicks to get resting. This one is about what's actually sitting at the camp when the party arrives, and the tw"
date: 2026-05-02
layout: post.njk
permalink: "/blog/resting-whats-at-camp-part-3-of-3/"
tier: Public
type: devlog
patreonId: "157161644"
patreonContentHash: "sha256:88ce53b08592e171"
patreonUrl: "/posts/resting-whats-at-157161644"
patreonLabel: "Ionrift on Patreon"
---

Part 2 was about the spatial model: camp on the map, stations as interaction points, two clicks to get resting. This one is about what's actually sitting at the camp when the party arrives, and the two stations that changed the most.

### **Eating**

Everybody eats. That's the baseline. No proficiency needed, no special tools. Walk up to the cooking fire, drag rations into the food and water slots, and the character is fed.

![](https://c10.patreonusercontent.com/4/patreon-media/p/post/157161644/6203e81d311c43da82c1241f159ade67/eyJhIjoxLCJ3Ijo4MjB9/1.png?token-hash=B8SGrjPcGh-bCVnL-osArc0gXg8m4_miMxM4yYnuS9U%3D&token-time=1779062400)

Each slot is one unit of food or water for the day. Drag an item from inventory, it fills the slot. Skip a slot, the character goes hungry that day. Go too many days without food and the starvation rules kick in. Water is harsher: one day without it and it's a DC 15 CON save, two days and there's no save at all. This is all RAW, just tracked automatically.

Items can also be consumed from inventory and that observed by the system.  

### **Cooking**

This is the part that changed the most. The cooking station isn't just "eat rations." Someone in the party needs to actually cook. That means having cooking utensils in their pack.

Walk up to the cooking fire without a cook's utensils and you're eating cold rations. Walk up with someone carrying the tools, and the station allows recipe selection and meal effects that apply to the group. Proficiency with cook's utensils isn't required to use them (RAW: proficiency adds your bonus to the check, but anyone can attempt it), so even the fighter who bought utensils on a whim can have a go. They'll just roll worse.

![](https://c10.patreonusercontent.com/4/patreon-media/p/post/157161644/3530457b58d24f1d882989c5e36f3ee9/eyJhIjoxLCJ3Ijo4MjB9/1.png?token-hash=7x_MEXignTgF862N_J1AiFo_XuBE_NX4ZBrThasee7M%3D&token-time=1779062400)

Recipes have ingredients, a skill check (usually Survival), and a risk tier. Standard risk: base DC, ingredients consumed either way. Ambitious risk: DC goes up by 5, but the output is better. Better yield, stronger buff, or a larger serving.

That last bit matters because of how meals work. A regular recipe makes food for one person. A feast recipe feeds the whole party. Same cooking fire, same ingredients (scaled), but the cook chose to make something bigger. When a feast comes out of the crafting roll, a success screen shows the party roster and a "Serve to Party" button. One click and every party member gets the meal, the Well Fed buff, and the ration slot filled.

![](https://c10.patreonusercontent.com/4/patreon-media/p/post/157161644/ddba60d4511045618f3618ccde1242b5/eyJhIjoxLCJ3Ijo4MjB9/1.png?token-hash=b7uiws8dWSmyNsbjWXNE5K8fBV5SWl6chZlD8qjKBwU%3D&token-time=1779062400)

The Well Fed buff is an ActiveEffect on the character sheet. Temp HP, advantage on a save type, exhaustion resistance: depends on the recipe. It lasts until the next long rest. The buff is exclusive: eating a new Well Fed meal replaces the old one. No stacking five soups for 50 temp HP.

Ingredients come from foraging, hunting, and loot. What's available depends on terrain. An arctic camp and a coastal camp don't offer the same ingredients, and the recipes that are craftable shift depending on what's in the party's packs. A cook with a decent forager feeding them ingredients makes a real difference compared to cold rations.

Food spoils. Perishable items (game meat, foraged herbs) track how long they've been in inventory. Go too long without cooking them and they turn into "Spoiled Food", a useless loot item. The spoilage checks run against the in-world calendar if one is active, or against rest count as a fallback. It means the party can't hoard raw ingredients forever.

### **Identification**

Identification has been rebuilt. The old version was an activity option in a list: pick "identify item," select the item, wait. It was a submenu inside a submenu inside a dialogue. Nothing about it felt like examining a mysterious item.

The new identification station is a workstation at the camp. Walk up, interact, and the UI shows what the character is carrying and what can be examined. Drag a gear item or a potion into the focus slot, commit the examination, and Respite resolves the identification. The context is narrow: you're at the workbench, you can see the items, you examine one.

![](https://c10.patreonusercontent.com/4/patreon-media/p/post/157161644/685f8e4b61044fe8a1c7aeac021fe57f/eyJhIjoxLCJwIjoxfQ%3D%3D/1.png?token-hash=zTTTq8TI1ytetB9b2UTGNgWvOOiUAoTUurYTWsM1GIw%3D&token-time=1779062400)

If a player has Detect Magic, the unidentified items in the party's inventory light up with a magical aura indicator. The scan is a single button press and it sweeps all party members at once. Detect Magic doesn't identify anything on its own (RAW), but it tells the party which items are worth spending rest time on. The identification station and Quartermaster's item stripping close the same loop: Quartermaster hides the properties, Respite reveals them.

![](https://c10.patreonusercontent.com/4/patreon-media/p/post/157161644/afb2489c85e54394ab9693924179b5f4/eyJhIjoxLCJ3Ijo4MjB9/1.png?token-hash=2NSDMcHZRV0ZxDmKTIonOLuthGZJZYaCjbfa7zWD9mE%3D&token-time=1779062400)

### **When**

Respite v2 with the cooking system, ration tracking, identification rework, and the full workstation model should be out in the next few days. There's a lot of polishing and edge-case refinement left to get through, but the core systems are well established at this point. It's finishing work, not discovery work.

  
The encounter system (watch events, random encounters) is untouched from v1 in this release. It still works, but it hasn't had the same redesign pass as the rest of the camp. I can see a few things that need attending to, so it'll get its own dedicated pass once v2 is settled.

\-- Ionrift
