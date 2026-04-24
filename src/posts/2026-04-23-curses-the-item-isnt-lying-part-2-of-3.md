---
title: "Curses: the item isn't lying (Part 2 of 3)"
description: "Part 1 covered the DMG rule: \"most methods of identifying items, including the identify spell, fail to reveal such a curse.\" Identify reveals an item's properties. It does not reveal curses. Those are"
date: 2026-04-23
layout: post.njk
permalink: "/blog/curses-the-item-isnt-lying-part-2-of-3/"
tier: Public
type: devlog
patreonId: "156257732"
patreonContentHash: "sha256:ce84b04ab2f5539f"
patreonUrl: "/posts/curses-item-isnt-156257732"
patreonLabel: "Ionrift on Patreon"
ogImage: "/img/blog/2026/curses-the-item-isnt-lying-part-2-of-3/cover.png"
---

Part 1 covered the DMG rule: "most methods of identifying items, including the identify spell, fail to reveal such a curse." Identify reveals an item's properties. It does not reveal curses. Those are two separate things, and the rules already treat them that way.

That distinction didn't click for me until I was designing a cursed armor piece for my OotA campaign. It adapted to whatever class wore it. A wizard got extended Mage Armor. A paladin got aura range. A rogue got Dex saves. The point was that anyone in the party could want it. Throw a cursed sword into a group and the casters don't care. Throw in magical robes and the melee ignores it. This thing was designed so the whole table would fight over who gets to attune. Someone was always going to.

Identification told the truth. The armor really could do all of that. It adapted to the wearer. That was honest. What identification didn't mention was that eventually, the armor adapts the wearer too. "It adapts to you" becomes "it changes you."

The lure tells the truth about the item's properties, because those properties are real. The curse is a separate truth that Identify doesn't reach. The rules already draw that line. They just don't give any tools to enforce it.

### Tools to enforce it

Quartermaster's curse system splits every cursed item into three layers.

The full curse definition lives in GM-restricted storage. Players can't see it. Not hidden on the item, not buried in the data. It's just not there.

The item the player holds is real. A real Foundry item on a real character sheet. If it's unidentified, it looks mundane. If it's been identified, it works as a genuine magical item. Because it is one. The lure is not a disguise. The mechanical properties are real.

A third layer sits outside both, watching. It tracks time worn, attacks made, rests taken, rounds in combat, and checks those numbers against specific thresholds. When a counter crosses, something changes. The player might get a sourceless whisper. The item might get heavier. The icon might quietly swap. The GM gets a prompt, or doesn't, depending on how the curse was designed.

### The uniformity problem

Quartermaster handles placing normal magic items into loot caches, not just cursed ones. If I only strip the tells off cursed items but leave normal magic items showing their stats, then the absence of tells becomes a tell. If only cursed items look clean, then clean IS the tell.

GM View:

![](https://c10.patreonusercontent.com/4/patreon-media/p/post/156257732/993f8b64e88e430798065b4580377488/eyJhIjoxLCJ3Ijo4MjB9/1.png?token-hash=2C44J2VZJmbud9ReBoVM1y0Dqzkh4kThKoYXAVHycag%3D&token-time=1778284800)

The only approach that doesn't leak through absence is to treat everything the same. Quartermaster strips every item it places. Cursed or not. A mundane Javelin and a Javelin of Lightning look identical until someone spends resources to investigate. The native identification toggle is blocked. Players can't just flip it back.

Players view:

![](https://c10.patreonusercontent.com/4/patreon-media/p/post/156257732/17660e52ce30490592e873bec4c79da2/eyJhIjoxLCJ3Ijo4MjB9/1.png?token-hash=OW4DYm83CB2symWAhS7HvyNHThhKxsmqSMyZefm8-yY%3D&token-time=1778284800)

Identification is handled separately. Respite already has it built as a player rest activity: spend time during a short or long rest examining an item, and the real properties come back. Self-service, no GM overhead. Without Respite, the GM can identify items through a context menu. Either way, cursed and non-cursed items go through the same process. The player doesn't know which kind they're identifying because neither kind has any tells before they do.

That also solved the older problem from Part 1. Normal magic items had all the same tells (gold value, damage formulas, layout differences). Fixing it for curses fixed it for everything.

### How a curse builds

Most cursed items in the DMG activate the moment someone attunes. Binary. On or off. Frodo didn't put the Ring on and instantly regret it. It took time. The best curses in fiction build slowly, and Foundry has no way to do that natively.

Quartermaster breaks curses into phases. Each phase has its own threshold, payload, and personality. Here's one being tested internally: the "_Gauntlets of the Ogre's Due"._

The Lure_:_

![](https://c10.patreonusercontent.com/4/patreon-media/p/post/156257732/be1e2bab1dd1485c8b3555a94f51275a/eyJhIjoxLCJ3Ijo4MjB9/1.png?token-hash=WnOzB0YuLloUsdWWnTeJAP5iUUBfpPHofFzPeMSp4YM%3D&token-time=1778284800)

A player finds them in a loot cache. They look mundane. "Leather Gauntlets," 1 lb. After identification: Gauntlets of Ogre Power. STR 19, requires attunement. Good find. The strength bonus is real.

Behind the scenes, the gauntlets track exposure - combat, rests, time worn. The player sees none of it. Over sessions, the **weight creeps up**. The icon changes. At one phase the sticky guard engages and the gauntlets stop coming off. The player finds out when they try.

By the final phase the item has renamed itself, the STR has dropped from 19 to 17, and the gauntlets weigh 60 lb. "The gauntlets gave you ogre strength. Now the ogre wants it back."

Active curse:

![](https://c10.patreonusercontent.com/4/patreon-media/p/post/156257732/d1e24ddaed4a47fe8bd73d00254c8691/eyJhIjoxLCJ3Ijo4MjB9/1.png?token-hash=kfBd1L5nABiqx4gjarz-N84T2_k13uWHfJfc5CSXO5g%3D&token-time=1778284800)

That arc plays out across weeks of sessions. Four phases, each one a little more obvious than the last. The GM didn't have to track any of it manually. The exposure counter ticked up in the background, each phase triggered its own changes, and the item slowly became something different from what identification promised. Same item. Same attunement slot. Different problem.

### The curse tracker

All of this runs in the background, but GMs need to see what's happening. The module has a tracking panel that shows every cursed item in play, across all characters, at a glance.

![](https://c10.patreonusercontent.com/4/patreon-media/p/post/156257732/1680c26524454c30bcfe68cd40e15923/eyJhIjoxLCJ3Ijo4MjB9/1.png?token-hash=xf595Agiw7fEGAByJOvR760owH-sNhqkMC1ibKw-J_w%3D&token-time=1778284800)

Each item gets a card with the curse name, a tier badge, the trigger type, and an exposure counter ticking toward its threshold. Phase markers show where the item sits in its arc. The current phase behaviour is described on the card, and the next phase is previewed underneath so the GM knows what's coming without opening anything.

The GM can whisper atmospheric hints from a built-in pool. Sourceless, in-character messages: the kind of thing that builds dread without giving anything away. The panel tracks which hints have already been sent so they don't repeat. A dice button picks a random one to keep them varied.

![](https://c10.patreonusercontent.com/4/patreon-media/p/post/156257732/f27bd74badb04158b3cff084bb849ac4/eyJhIjoxLCJ3Ijo4MjB9/1.png?token-hash=_XFi182zrxPOxG1fm76d9-8VYjMedoICU64uEVxQmeQ%3D&token-time=1778284800)

Manual adjustment is there if the GM needs it. Maybe a session was mostly downtime and the fighter barely wore the gauntlets. Maybe the party survived a brutal multi-session dungeon crawl and the exposure should reflect it. The counter moves, the phase display updates live, and the GM stays in control of the pacing without needing to remember any of it between sessions.

![](https://c10.patreonusercontent.com/4/patreon-media/p/post/156257732/88806a04a486418889e78282c3e706b2/eyJhIjoxLCJwIjoxfQ%3D%3D/1.png?token-hash=wkRwUBPFLeuD_lYtCmkL_gY3MCYcOn9eX3Zz759iWfo%3D&token-time=1778284800)

Part 3 is about what happens after discovery, what removal actually looks like, and a sword with opinions about being put down.

\-- Ionrift
