---
title: "Respite is live"
description: "Ionrift Respite v1.0.0 is tagged and available. Replaces the default DnD5e rest dialog with a structured rest flow - terrain, shelter, survival, campfire, the lot."
date: 2026-03-26
layout: post.njk
permalink: "/blog/respite-is-live/"
tier: Public
type: devlog
patreonId: "154027111"
patreonContentHash: "sha256:af990f883cc0abaf"
patreonUrl: "/posts/respite-is-live-154027111"
patreonLabel: "Ionrift on Patreon"
ogImage: "/img/blog/2026/respite-is-live/cover.png"
---

Ionrift Respite v1.0.0 is tagged and available. Replaces the default DnD5e rest dialog with a structured rest flow - terrain, shelter, survival, campfire, the lot.

![](https://c10.patreonusercontent.com/4/patreon-media/p/post/154027111/1269809cbea84f73a67cc107dd526cff/eyJhIjoxLCJ3Ijo4MjB9/1.png?token-hash=rmUVPF-J4YcCcFctvR9P0_-u2ji0GSpDlkoa7DEBykg%3D&token-time=1778284800)

I've been running this in my own sessions for a while now. The default rest button in Foundry always felt like a missed opportunity - click, sleep, full HP. Rests should cost something, or at least feel like they happened. So I built a replacement.

**How it works in practice:**

GM picks the terrain and shelter level, which sets the encounter DC and comfort tier. Players each pick a camp activity from their own screen - keep watch, scout, study, pray, or just sleep. The campfire runs as a side panel with a little physics sim (drag kindling from inventory to feed it - fire level affects comfort and encounter modifiers). Then events pull from terrain-weighted pools - encounters, complications, discoveries. Nat 1 is always a disaster. Nat 20 is always a discovery.

![](https://c10.patreonusercontent.com/4/patreon-media/p/post/154027111/2cd980d39a9a4140ad64994a04d4e495/eyJhIjoxLCJ3Ijo4MjB9/1.png?token-hash=5F81lvo3ceMxwktBTCwH0jLp40WW_8F5S_CwBWyVZhw%3D&token-time=1778284800)

Meals are optional but tracked - drag rations and water onto characters. Miss too many meals in a row and the CON saves start stacking. Then resolution handles HP, hit dice, spell slots, and exhaustion based on how rough the night was. Each player gets a private whisper with what they recovered.

![](https://c10.patreonusercontent.com/4/patreon-media/p/post/154027111/b3fe1201bd684672973d8326c7f939f7/eyJhIjoxLCJ3Ijo4MjB9/1.png?token-hash=RTgQmDDMNO0w0TVNRbQ9wIAzqyTBv_e4YxTb8RguHS8%3D&token-time=1778284800)

Short rests have their own flow too - hit die spending UI, shelter toggle (Rope Trick works), class feature recovery.

There are 6 core terrains shipping (forest, desert, dungeon, swamp, tavern, urban) with branching event trees for each. More terrains and event packs will follow as content drops.

**Install:**

Search "Ionrift Respite" in the Foundry module browser (waiting on approval)

or install via manifest: 

[https://github.com/ionrift-gm/ionrift-respite/releases/latest/download/module.json](https://github.com/ionrift-gm/ionrift-respite/releases/latest/download/module.json)

Requires [Ionrift Library](https://foundryvtt.com/packages/ionrift-library).

This is the first public release so there will be rough edges. If something breaks or feels off, GitHub issues or a message here are both fine.

Thanks for being here. More coming. 🧡
